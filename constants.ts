import { ProviderConfig, AppSettings } from './types';

export const DEFAULT_SYSTEM_INSTRUCTION = `You are VibeAgent, a sophisticated AI coding assistant.
You are an expert full-stack engineer, proficient in React, TypeScript, Node.js, Python, and Rust.
Your responses should be concise, technical, and accurate.
When providing code, use Markdown code blocks with language identifiers.
Focus on modern best practices, performance, and clean architecture.`;

// Extend ProviderConfig type locally to include icon (optional, handled in UI)
export const PROVIDERS: (ProviderConfig & { icon: string })[] = [
  {
    id: 'google',
    name: 'Google',
    keyField: 'googleKey',
    icon: 'https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png',
    models: [
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', thinking: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash', thinking: false },
      { id: 'gemini-2.5-flash-preview-09-2025', name: 'Gemini 2.5 Flash', thinking: false },
    ]
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    keyField: 'anthropicKey',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/7/78/Anthropic_logo.svg',
    models: [
      { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', thinking: true },
      { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', thinking: false },
      { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', thinking: false },
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI',
    keyField: 'openaiKey',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    models: [
      { id: 'chatgpt-5.2', name: 'ChatGPT 5.2', thinking: false },
      { id: 'chatgpt-5.2-high', name: 'ChatGPT 5.2 High', thinking: true },
      { id: 'chatgpt-5.2-codex', name: 'ChatGPT 5.2 Codex', thinking: false },
    ]
  },
  {
    id: 'grok',
    name: 'xAI',
    keyField: 'grokKey',
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/X_logo_2023_%28white%29.png',
    models: [
      { id: 'grok-3', name: 'Grok 3', thinking: false },
      { id: 'grok-2', name: 'Grok 2', thinking: false },
    ]
  },
  {
    id: 'groq',
    name: 'Groq',
    keyField: 'groqKey',
    icon: 'https://avatars.githubusercontent.com/u/102422485?s=200&v=4',
    models: [
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', thinking: false },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7b', thinking: false },
    ]
  },
  {
    id: 'cerebras',
    name: 'Cerebras',
    keyField: 'cerebrasKey',
    icon: 'https://avatars.githubusercontent.com/u/55086053?s=200&v=4',
    models: [
      { id: 'llama3.1-70b', name: 'Llama 3.1 70B', thinking: false },
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    keyField: 'openrouterKey',
    baseUrlField: 'openrouterBaseUrl',
    modelIdField: 'openrouterModelId',
    icon: 'https://avatars.githubusercontent.com/u/125816361?s=200&v=4',
    models: [
      { id: 'openrouter/auto', name: 'Auto', thinking: false },
    ]
  },
  {
    id: 'osmapi',
    name: 'osmAPI',
    keyField: 'osmapiKey',
    baseUrlField: 'osmapiBaseUrl',
    modelIdField: 'osmapiModelId',
    icon: 'https://cdn-icons-png.flaticon.com/512/2082/2082852.png',
    models: [
      { id: 'osmapi-standard', name: 'Standard', thinking: false },
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    keyField: 'customKey',
    baseUrlField: 'customBaseUrl',
    modelIdField: 'customModelId',
    icon: 'https://cdn-icons-png.flaticon.com/512/3524/3524335.png',
    models: [
      { id: 'custom-model', name: 'Custom Model', thinking: false },
    ]
  }
];

export const MOCK_PROJECT_FILES = [
  { name: 'App.tsx', language: 'TypeScript', size: '4.2kb' },
  { name: 'geminiService.ts', language: 'TypeScript', size: '2.1kb' },
  { name: 'styles.css', language: 'CSS', size: '1.5kb' },
  { name: 'package.json', language: 'JSON', size: '0.8kb' },
];

export const MOCK_SKILLS = [
  {
    id: 'telegram-connect',
    name: 'Telegram Connector',
    description: 'Send and receive messages via your Telegram account directly from the chat context. Useful for testing bots.',
    author: 'VibeAgent Team',
    downloads: '12.5k',
    rating: 4.8,
    category: 'Communication',
    version: '1.2.0',
    isInstalled: true,
    tags: ['messaging', 'bot', 'api']
  },
  {
    id: 'mcp-server',
    name: 'MCP Core',
    description: 'Standardized interface for connecting to external data sources and tools via Model Context Protocol.',
    author: 'Anthropic',
    downloads: '25k+',
    rating: 4.9,
    category: 'Core',
    version: '0.9.5',
    isInstalled: false,
    tags: ['standard', 'protocol', 'tools']
  },
  {
    id: 'linear-sync',
    name: 'Linear Sync',
    description: 'Create, update, and query Linear issues without leaving your editor. Syncs comments in real-time.',
    author: 'Community',
    downloads: '5.4k',
    rating: 4.6,
    category: 'Productivity',
    version: '2.1.0',
    isInstalled: false,
    tags: ['pm', 'issues', 'agile']
  },
  {
    id: 'spotify-control',
    name: 'Spotify Controller',
    description: 'Control playback and search for tracks. Music helps you code better.',
    author: 'Music Lovers',
    downloads: '3.2k',
    rating: 4.2,
    category: 'Lifestyle',
    version: '1.0.1',
    isInstalled: false,
    tags: ['music', 'audio']
  },
  {
    id: 'postgres-explorer',
    name: 'PostgreSQL Explorer',
    description: 'Connect to your DB, run queries, and visualize schema relationships safely.',
    author: 'Database Pros',
    downloads: '15.6k',
    rating: 4.7,
    category: 'Development',
    version: '3.0.2',
    isInstalled: true,
    tags: ['sql', 'database', 'admin']
  },
  {
    id: 'docker-manage',
    name: 'Docker Manager',
    description: 'Spin up, stop, and inspect containers directly from natural language prompts.',
    author: 'DevOps Inc',
    downloads: '8.1k',
    rating: 4.5,
    category: 'DevOps',
    version: '1.1.4',
    isInstalled: false,
    tags: ['containers', 'deployment']
  }
];