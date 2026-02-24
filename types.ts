export type SessionType = 'chat' | 'task';

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface ChatSession {
  id: string;
  type: SessionType;
  title: string;
  messages: Message[];
  lastModified: number;
  isPinned?: boolean;
  model?: string; // The model used for this specific session
}

export interface AppSettings {
  systemInstruction: string;
  defaultModel: string;
  thinkingBudget: number; // 0 to disable
  temperature: number;
  theme: 'dark' | 'light';
  
  // API Keys
  googleKey: string;
  anthropicKey: string;
  openaiKey: string;
  grokKey: string;
  groqKey: string;
  cerebrasKey: string;
  openrouterKey: string;
  osmapiKey: string;
  customKey: string;

  // Extended Provider Configs
  openrouterBaseUrl: string;
  openrouterModelId: string;
  osmapiBaseUrl: string;
  osmapiModelId: string;
  customBaseUrl: string;
  customModelId: string;
  
  // Auth States (Mock validation status)
  authStatus: Record<string, 'valid' | 'invalid' | 'empty'>;

  // Contact Channels
  contactTelegram: boolean;
  contactTelegramId: string;
  contactWhatsapp: boolean;
  contactWhatsappId: string;
  contactEmail: boolean;
  contactEmailId: string;
}

export interface MockFile {
  name: string;
  language: string;
  size: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: string;
  rating: number;
  category: string;
  version: string;
  isInstalled: boolean;
  tags: string[];
}

export enum ViewMode {
  CHAT = 'CHAT',
  PROJECTS = 'PROJECTS',
  SETTINGS = 'SETTINGS',
  SKILLS = 'SKILLS',
  SUPPORT = 'SUPPORT'
}

export interface ProviderConfig {
  id: string;
  name: string;
  keyField: keyof AppSettings;
  baseUrlField?: keyof AppSettings;
  modelIdField?: keyof AppSettings;
  models: { id: string; name: string; thinking?: boolean }[];
}