import sys
import pika
import json

def main():
    if len(sys.argv) < 2:
        print("Usage: python dispatch.py <prompt>")
        sys.exit(1)

    prompt = " ".join(sys.argv[1:])
    
    payload = {
        "user_id": "sire_01",
        "prompt": prompt
    }
    
    try:
        # Connect to local RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
        channel = connection.channel()
        
        # Ensure the queue exists
        channel.queue_declare(queue='ygg_tasks', durable=True)
        
        # Publish the message
        channel.basic_publish(
            exchange='',
            routing_key='ygg_tasks',
            body=json.dumps(payload),
            properties=pika.BasicProperties(
                delivery_mode=pika.DeliveryMode.Persistent  # Make message persistent
            )
        )
        
        print(f" [x] Sent payload: {json.dumps(payload)}")
        
        connection.close()
    except Exception as e:
        print(f"Failed to connect to RabbitMQ or publish message: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
