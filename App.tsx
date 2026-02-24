import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import SettingsPanel from './components/SettingsPanel';
import SkillsPanel from './components/SkillsPanel';
import SupportPanel from './components/SupportPanel';
import { ChatSession, Message, AppSettings, ViewMode, SessionType } from './types';
import { PROVIDERS, DEFAULT_SYSTEM_INSTRUCTION } from './constants';
import { createChatSession, sendMessageStream } from './services/geminiService';
import { Chat } from '@google/genai';

// Simple ID generator if uuid isn't available
const generateId = () => Math.random().toString(36).substring(2, 9);

const App: React.FC = () => {
  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.CHAT);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentChatInstance, setCurrentChatInstance] = useState<Chat | null>(null);
  const [isGoogleAuth, setIsGoogleAuth] = useState(false);
  
  // Application Settings
  const [settings, setSettings] = useState<AppSettings>({
    systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
    defaultModel: PROVIDERS[0].models[0].id,
    thinkingBudget: 0,
    temperature: 0.7,
    theme: 'dark',
    // Keys
    googleKey: '',
    anthropicKey: '',
    openaiKey: '',
    grokKey: '',
    groqKey: '',
    cerebrasKey: '',
    openrouterKey: '',
    osmapiKey: '',
    customKey: '',
    
    // Extended config
    openrouterBaseUrl: '',
    openrouterModelId: '',
    osmapiBaseUrl: '',
    osmapiModelId: '',
    customBaseUrl: '',
    customModelId: '',

    // Contact Channels
    contactTelegram: false,
    contactTelegramId: '',
    contactWhatsapp: false,
    contactWhatsappId: '',
    contactEmail: false,
    contactEmailId: '',

    authStatus: {},
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
      body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [settings.theme]);

  // Initialization
  useEffect(() => {
    // Check for Google Auth (window.aistudio)
    const checkGoogleAuth = async () => {
      if ((window as any).aistudio) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsGoogleAuth(hasKey);
          if (hasKey) {
             setSettings(prev => ({
                 ...prev,
                 authStatus: { ...prev.authStatus, googleKey: 'valid' }
             }));
          }
        } catch (e) {
          console.log("AI Studio check failed", e);
        }
      }
    };
    checkGoogleAuth();

    // Create initial session if none
    if (sessions.length === 0) {
      createNewSession('chat');
    }
  }, []);

  const handleGoogleLogin = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setIsGoogleAuth(true);
        setSettings(prev => ({
             ...prev,
             authStatus: { ...prev.authStatus, googleKey: 'valid' }
        }));
        // Re-initialize logic if needed
      } catch (e) {
        console.error("Google login failed", e);
      }
    }
  };

  const createNewSession = (type: SessionType) => {
    const newSession: ChatSession = {
      id: generateId(),
      type: type,
      title: type === 'task' ? 'New Task' : 'New Chat',
      messages: [],
      lastModified: Date.now(),
      isPinned: false,
      model: settings.defaultModel
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setViewMode(ViewMode.CHAT);
    if (!isSidebarOpen) setIsSidebarOpen(true);
    
    // Initialize GenAI Chat (Assuming Gemini for now as backend service)
    // Note: In a real multi-provider app, this would instantiate the correct client based on newSession.model
    const chat = createChatSession({
        ...settings,
        customApiKey: settings.googleKey || '', // Legacy mapping for service
        model: newSession.model || settings.defaultModel
    });
    setCurrentChatInstance(chat);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
      setCurrentChatInstance(null);
    }
  };

  const handleRenameSession = (id: string, newTitle: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const handlePinSession = (id: string) => {
    setSessions(prev => prev.map(s => s.id === id ? { ...s, isPinned: !s.isPinned } : s));
  };

  const handleModelChange = (modelId: string) => {
      if (activeSessionId) {
          setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, model: modelId } : s));
          
          // Re-instantiate chat with new model
          // Note: If switching providers, we'd need more complex logic here to switch services
          const chat = createChatSession({
            ...settings,
            customApiKey: settings.googleKey || '',
            model: modelId
          });
          setCurrentChatInstance(chat);
      }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !activeSessionId || !currentChatInstance) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    // Optimistically update UI
    setSessions(prev => prev.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          messages: [...s.messages, userMessage],
          title: s.messages.length === 0 ? input.slice(0, 30) + (input.length > 30 ? '...' : '') : s.title,
          lastModified: Date.now(),
        };
      }
      return s;
    }));

    setInput('');
    setIsLoading(true);

    try {
      const modelMessageId = generateId();
      let accumulatedText = "";

      // Add placeholder model message
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, {
              id: modelMessageId,
              role: 'model',
              text: '',
              timestamp: Date.now()
            }]
          };
        }
        return s;
      }));

      // Stream response
      // NOTE: In a real app, we would check activeSession.model and choose the right service function
      const stream = sendMessageStream(currentChatInstance, userMessage.text);
      
      for await (const chunk of stream) {
        accumulatedText += chunk;
        
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            const updatedMessages = [...s.messages];
            const lastMsgIndex = updatedMessages.findIndex(m => m.id === modelMessageId);
            if (lastMsgIndex !== -1) {
              updatedMessages[lastMsgIndex] = {
                ...updatedMessages[lastMsgIndex],
                text: accumulatedText
              };
            }
            return { ...s, messages: updatedMessages };
          }
          return s;
        }));
      }

    } catch (error) {
      console.error("Chat error", error);
      // Update UI with error state
      setSessions(prev => prev.map(s => {
        if (s.id === activeSessionId) {
           return {
             ...s,
             messages: [...s.messages, {
               id: generateId(),
               role: 'system',
               text: 'Error generating response. Please check your connection or API key.',
               timestamp: Date.now(),
               isError: true
             }]
           }
        }
        return s;
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    setIsLoading(false);
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  const renderContent = () => {
    switch (viewMode) {
      case ViewMode.SKILLS:
        return (
            <SkillsPanel 
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
        );
      case ViewMode.SETTINGS:
        return (
          <SettingsPanel 
            settings={settings} 
            onSave={(newSettings) => {
              setSettings(newSettings);
              // Re-init chat if current model changed globally (optional behavior)
            }}
            onThemeChange={(theme) => setSettings(prev => ({ ...prev, theme }))}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            isGoogleAuth={isGoogleAuth}
            onGoogleLogin={handleGoogleLogin}
          />
        );
      case ViewMode.SUPPORT:
        return (
          <SupportPanel 
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        );
      
      case ViewMode.PROJECTS:
        return (
          <div className="flex-1 bg-mac-bg flex flex-col min-w-0">
             {!isSidebarOpen && (
                <div className="p-4">
                  <button onClick={() => setIsSidebarOpen(true)} className="text-mac-muted hover:text-mac-text">
                    Show Sidebar
                  </button>
                </div>
             )}
             <div className="flex-1 flex items-center justify-center text-mac-muted">
               <div className="text-center">
                 <h3 className="text-xl font-medium text-mac-text mb-2">Project Context</h3>
                 <p className="max-w-md mx-auto">Files and context for your current workspace.</p>
               </div>
             </div>
          </div>
        );

      case ViewMode.CHAT:
      default:
        return activeSession ? (
          <ChatInterface 
            messages={activeSession.messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            onSend={handleSendMessage}
            onStop={handleStop}
            currentModel={activeSession.model || settings.defaultModel}
            onModelChange={handleModelChange}
            settings={settings}
            sessionType={activeSession.type}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex-1 bg-mac-bg" />
        );
    }
  };

  return (
    <div className="flex h-screen w-screen bg-mac-bg text-mac-text font-sans overflow-hidden transition-colors duration-200">
      {isSidebarOpen && (
        <Sidebar 
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewSession={createNewSession}
          onSelectSession={(id) => {
            setActiveSessionId(id);
            setViewMode(ViewMode.CHAT);
            const session = sessions.find(s => s.id === id);
            // Re-create chat instance for selected session context
            if (session) {
                const chat = createChatSession({
                    ...settings,
                    customApiKey: settings.googleKey || '',
                    model: session.model || settings.defaultModel
                });
                setCurrentChatInstance(chat);
            }
          }}
          onDeleteSession={handleDeleteSession}
          onRenameSession={handleRenameSession}
          onPinSession={handlePinSession}
          currentView={viewMode}
          onChangeView={setViewMode}
          onToggleSidebar={() => setIsSidebarOpen(false)}
        />
      )}
      
      <main className="flex-1 flex flex-col min-w-0">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;