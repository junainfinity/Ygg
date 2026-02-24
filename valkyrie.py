import pika
import os
import json
import docker
import tempfile
import sys
from openai import OpenAI
from mem0 import Memory

# Connect to local vector memory using mem0 storing data locally at ~/AgentPlatform/Mimir
MIMIR_PATH = os.path.expanduser("~/AgentPlatform/Mimir")

# mem0 configuration for local vector store (Chroma/Qdrant are common local providers for mem0)
memory_config = {
    "vector_store": {
        "provider": "qdrant",
        "config": {
            "path": MIMIR_PATH
        }
    }
}

try:
    memory = Memory.from_config(memory_config)
except Exception as e:
    print(f"Warning: Could not initialize mem0 with config. Error: {e}")
    try:
        memory = Memory()
    except Exception as e2:
        print(f"Warning: Could not initialize default mem0 either. Error: {e2}")
        memory = None

# Initialize OpenAI connection point to OSM API
OSM_API_KEY = os.environ.get("OSM_API_KEY")

client = OpenAI(
    api_key=OSM_API_KEY or "KEY_NOT_SET",  # Load key from environment
    base_url="https://api.osmapi.com/v1"
)

def execute_python_in_docker(code_string: str) -> str:
    """
    Executes Python code inside a temporary, isolated Docker container using the docker library.
    """
    try:
        docker_client = docker.from_env()
        
        with tempfile.TemporaryDirectory() as temp_dir:
            script_path = os.path.join(temp_dir, "script.py")
            with open(script_path, "w") as f:
                f.write(code_string)
                
            try:
                # We use python:3.9-slim, mount the temp directory, run it, and remove the container afterwards.
                # network_mode="none" ensures standard network isolation.
                container_output = docker_client.containers.run(
                    image="python:3.9-slim",
                    command=["python", "/tmp/script.py"],
                    volumes={temp_dir: {'bind': '/tmp', 'mode': 'ro'}},
                    remove=True,              # Delete container after execution
                    network_mode="none",      # Isolate network access
                    mem_limit="128m",         # Cap memory
                    cpu_quota=50000           # Limit CPU usage
                )
                return container_output.decode('utf-8')
            except docker.errors.ContainerError as e:
                return f"Container execution error: {e.stderr.decode('utf-8')}"
    except Exception as e:
        # Fallback to simple subprocess execution if docker is not available
        import subprocess
        print(f" [!] Docker execution failed ({e}). Falling back to local execution.")
        try:
            with tempfile.NamedTemporaryFile('w', suffix='.py', delete=False) as f:
                f.write(code_string)
                temp_file_name = f.name
            
            result = subprocess.run(["python", temp_file_name], capture_output=True, text=True, timeout=10)
            os.remove(temp_file_name)
            
            if result.returncode == 0:
                return result.stdout
            else:
                return f"Execution error: {result.stderr}"
        except Exception as inner_e:
             return f"Execution failed locally too: {str(inner_e)}"

def on_message(channel, method_frame, header_frame, body):
    """
    Callback function that processes tasks received from the RabbitMQ queue.
    """
    print(f" [x] Received task: {body}")
    
    try:
        task_data = json.loads(body)
        task_content = task_data.get("task", body.decode('utf-8'))
    except json.JSONDecodeError:
        task_content = body.decode('utf-8')

    try:
        # Send task to the custom OSM API endpoint
        response = client.chat.completions.create(
            model="gpt-4o", # Using a supported model from OSM API
            messages=[
                {"role": "system", "content": "You are Valkyrie, a decentralized worker node. When asked to perform a coding task, provide only the python code inside a ```python ``` codeblock."},
                {"role": "user", "content": f"Task: {task_content}"}
            ]
        )
        
        reply = response.choices[0].message.content
        print(f" [x] Task Processed. Response:\n{reply}")
        
        # Check if python code is present and execute it
        import re
        code_blocks = re.findall(r'```python\n(.*?)\n```', reply, re.DOTALL)
        if code_blocks:
            for i, code in enumerate(code_blocks):
                print(f" [*] Executing python code block {i+1}...")
                execution_result = execute_python_in_docker(code)
                print(f" [x] Execution Result:\n{execution_result}")
                reply += f"\n\nExecution Result:\n{execution_result}"
        
        # Store context/interaction into local mem0 database
        if memory:
            try:
                memory.add(f"Task: {task_content} \nResult: {reply}", user_id="valkyrie_node")
            except Exception as e:
                print(f" [!] Warning: Could not save to mem0: {e}")

    except Exception as e:
        print(f" [!] Error during LLM processing: {e}")

    # Acknowledge the message to RabbitMQ once fully processed
    channel.basic_ack(delivery_tag=method_frame.delivery_tag)

def main():
    if not OSM_API_KEY:
        print("WARNING: OSM_API_KEY environment variable is missing!")

    # Connect to the local RabbitMQ instance using pika
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
    except Exception as e:
        print(f"Failed to connect to RabbitMQ: {e}")
        sys.exit(1)

    # Listen to queue 'ygg_tasks'
    channel.queue_declare(queue='ygg_tasks', durable=True)
    
    # Process one task at a time per worker
    channel.basic_qos(prefetch_count=1)

    channel.basic_consume(queue='ygg_tasks', on_message_callback=on_message)

    print(' [*] Valkyrie node ready. Waiting for tasks on "ygg_tasks". To exit press CTRL+C')
    try:
        channel.start_consuming()
    except KeyboardInterrupt:
        print(' [*] Exiting Valkyrie node...')
        channel.stop_consuming()
    finally:
        connection.close()

if __name__ == '__main__':
    main()
