import { GoogleGenAI, Chat, GenerativeModel } from "@google/genai";
import { AppSettings, Message } from "../types";

// Interface for the session configuration, extending AppSettings with session-specific fields
interface ChatSessionConfig extends AppSettings {
  model: string;
  customApiKey?: string;
}

// Helper to get client (assumes API_KEY is available in env or passed)
const getClient = (apiKey?: string) => new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY });

export const createChatSession = (settings: ChatSessionConfig) => {
  // Use custom key if provided, otherwise fallback to process.env.API_KEY
  const ai = getClient(settings.customApiKey);
  
  // Configure thinking if supported and budget > 0
  const isThinkingModel = settings.model.includes('gemini-3');
  const thinkingConfig = (isThinkingModel && settings.thinkingBudget > 0)
    ? { thinkingBudget: settings.thinkingBudget }
    : undefined;

  const chat = ai.chats.create({
    model: settings.model,
    config: {
      systemInstruction: settings.systemInstruction,
      temperature: settings.temperature,
      thinkingConfig,
    },
  });

  return chat;
};

export const sendMessageStream = async function* (
  chat: Chat, 
  message: string
): AsyncGenerator<string, void, unknown> {
  try {
    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      // Safely extract text from the chunk
      const text = chunk.text;
      if (text) {
        yield text;
      }
    }
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate response");
  }
};