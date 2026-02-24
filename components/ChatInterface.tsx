import React, { useRef, useEffect, useState } from 'react';
import { Send, Sparkles, Paperclip, StopCircle, User, Target, MessageSquare, PanelLeft, Mic, MicOff, ChevronDown, ChevronLeft, Check } from 'lucide-react';
import { Message, SessionType, AppSettings } from '../types';
import { PROVIDERS } from '../constants';
import MarkdownRenderer from './MarkdownRenderer';

interface ChatInterfaceProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  isLoading: boolean;
  onSend: () => void;
  onStop: () => void;
  currentModel: string;
  onModelChange: (model: string) => void;
  settings: AppSettings;
  sessionType?: SessionType;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  input,
  setInput,
  isLoading,
  onSend,
  onStop,
  currentModel,
  onModelChange,
  settings,
  sessionType = 'chat',
  isSidebarOpen,
  onToggleSidebar
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Model Selector State
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectorView, setSelectorView] = useState<'providers' | 'models'>('providers');
  const [selectedProviderId, setSelectedProviderId] = useState<string | null>(null);
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  
  // Dictation state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modelSelectorRef.current && !modelSelectorRef.current.contains(event.target as Node)) {
        setShowModelSelector(false);
        setSelectorView('providers'); // Reset view on close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Determine current provider based on current model
  useEffect(() => {
      if (showModelSelector && selectorView === 'providers') {
          // Optional: Find which provider owns the current model to highlight it? 
          // For now, simpler is fine.
      }
  }, [showModelSelector]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);
  
  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };
  
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Speech recognition is not supported in this browser.");
        return;
      }
      
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      const initialInput = input;
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        
        for (let i = 0; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        
        const separator = (initialInput.length > 0 && !initialInput.endsWith(' ')) ? ' ' : '';
        const newInput = initialInput + separator + final + interim;
        setInput(newInput);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
      recognition.start();
    }
  };

  // Build available models list
  const getAvailableProviders = () => {
      return PROVIDERS.filter(p => {
          const keyField = p.keyField;
          const isValid = settings.authStatus[keyField] === 'valid' || (settings as any)[keyField]?.length > 0;
          // Always show Google if it has models or allow default if no keys
          return isValid || p.id === 'google'; 
      });
  };

  const providers = getAvailableProviders();
  
  // Find current model object to display name properly
  let currentModelDisplay = currentModel;
  let currentProviderIcon = null;
  
  for (const p of PROVIDERS) {
      const m = p.models.find(mod => mod.id === currentModel);
      if (m) {
          currentModelDisplay = m.name;
          currentProviderIcon = p.icon;
          break;
      }
  }

  const handleProviderSelect = (providerId: string) => {
      setSelectedProviderId(providerId);
      setSelectorView('models');
  };

  const handleModelSelect = (modelId: string) => {
      onModelChange(modelId);
      setShowModelSelector(false);
      setSelectorView('providers');
  };

  return (
    <div className="flex flex-col h-full bg-mac-bg relative transition-colors duration-200">
      {/* Header */}
      <div className="h-10 border-b border-mac-border flex items-center justify-between px-4 bg-mac-bg/80 backdrop-blur-md sticky top-0 z-10 transition-colors duration-200">
        <div className="flex items-center space-x-3">
          {!isSidebarOpen && (
            <button 
                onClick={onToggleSidebar}
                className="text-mac-muted hover:text-mac-text transition-colors p-1 hover:bg-mac-hover rounded mr-2"
                title="Show Sidebar"
            >
                <PanelLeft size={16} />
            </button>
          )}

          {sessionType === 'task' ? (
            <div className="flex items-center space-x-2 text-blue-500">
               <Target size={14} />
               <span className="text-xs font-semibold uppercase tracking-wider">Task</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-purple-500">
               <MessageSquare size={14} />
               <span className="text-xs font-semibold uppercase tracking-wider">Chat</span>
            </div>
          )}
          <span className="text-mac-border">|</span>
          
          <div className="relative" ref={modelSelectorRef}>
             <button 
                onClick={() => {
                    setShowModelSelector(!showModelSelector);
                    if (!showModelSelector) setSelectorView('providers');
                }}
                className="flex items-center space-x-2 text-sm font-medium text-mac-text hover:bg-mac-hover px-2 py-1 rounded transition-colors border border-transparent hover:border-mac-border"
             >
                 {currentProviderIcon && (
                     <div className="w-4 h-4 rounded-sm bg-white flex items-center justify-center p-0.5 overflow-hidden">
                        <img src={currentProviderIcon} alt="Provider" className="w-full h-full object-contain" />
                     </div>
                 )}
                 <span>{currentModelDisplay}</span>
                 <ChevronDown size={12} className="text-mac-muted" />
             </button>

             {showModelSelector && (
                 <div className="absolute top-full left-0 mt-1 w-64 bg-mac-surface border border-mac-border rounded-lg shadow-xl py-1 z-50 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                     {selectorView === 'providers' ? (
                         // View 1: List Providers
                         <div>
                             <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-mac-muted border-b border-mac-border mb-1">
                                 Select Provider
                             </div>
                             {providers.map((p) => (
                                 <button
                                     key={p.id}
                                     onClick={() => handleProviderSelect(p.id)}
                                     className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-mac-hover transition-colors group"
                                 >
                                     <div className="flex items-center space-x-3">
                                         <div className="w-5 h-5 rounded bg-white border border-mac-border flex items-center justify-center p-0.5">
                                            {p.icon && <img src={p.icon} alt={p.name} className="w-full h-full object-contain" />}
                                         </div>
                                         <span className="text-mac-text">{p.name}</span>
                                     </div>
                                     <span className="text-mac-muted group-hover:text-mac-text">
                                         <ChevronLeft size={14} className="rotate-180" />
                                     </span>
                                 </button>
                             ))}
                         </div>
                     ) : (
                         // View 2: List Models for Selected Provider
                         <div>
                            <div className="flex items-center px-2 py-1.5 border-b border-mac-border mb-1">
                                <button 
                                    onClick={() => setSelectorView('providers')}
                                    className="p-1 hover:bg-mac-hover rounded text-mac-muted hover:text-mac-text mr-2"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <span className="text-xs font-semibold text-mac-text">
                                    {providers.find(p => p.id === selectedProviderId)?.name} Models
                                </span>
                            </div>
                            
                            {providers.find(p => p.id === selectedProviderId)?.models.map((m) => (
                                <button
                                    key={m.id}
                                    onClick={() => handleModelSelect(m.id)}
                                    className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-mac-hover transition-colors ${currentModel === m.id ? 'bg-mac-active/50' : ''}`}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className={`text-mac-text ${currentModel === m.id ? 'font-medium' : ''}`}>{m.name}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {m.thinking && <span className="text-[9px] uppercase border border-purple-500/30 text-purple-500 px-1 rounded">Think</span>}
                                        {currentModel === m.id && <Check size={14} className="text-blue-500" />}
                                    </div>
                                </button>
                            ))}
                         </div>
                     )}
                 </div>
             )}
          </div>
        </div>
        <div className="text-xs text-mac-muted font-mono">
          Tokens: {messages.reduce((acc, m) => acc + m.text.length / 4, 0).toFixed(0)} approx
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-mac-muted opacity-60">
             <div className="w-16 h-16 bg-mac-surface rounded-2xl flex items-center justify-center mb-4 border border-mac-border">
                {sessionType === 'task' ? <Target size={32} className="text-blue-500" /> : <Sparkles size={32} className="text-purple-500" />}
             </div>
             <p className="text-lg font-medium text-mac-text">{sessionType === 'task' ? 'New Task' : 'New Chat'}</p>
             <p className="text-sm">{sessionType === 'task' ? 'Define your objective and let\'s solve it.' : 'Ready to help you build.'}</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div key={msg.id} className={`flex space-x-4 max-w-4xl mx-auto w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             
             {msg.role === 'model' && (
               <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center shadow-lg ${sessionType === 'task' ? 'bg-gradient-to-br from-blue-600 to-cyan-600 shadow-blue-500/10' : 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/10'}`}>
                 <Sparkles size={16} className="text-white" />
               </div>
             )}

             <div className={`flex-1 min-w-0 ${msg.role === 'user' ? 'bg-mac-surface rounded-2xl px-5 py-3 border border-mac-border shadow-sm max-w-[80%]' : ''}`}>
                {msg.role === 'user' ? (
                  <div className="text-mac-text whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                ) : (
                  <MarkdownRenderer content={msg.text} />
                )}
             </div>

             {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-mac-surface-2 border border-mac-border flex-shrink-0 flex items-center justify-center">
                  <User size={16} className="text-mac-text-muted" />
                </div>
             )}
          </div>
        ))}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex space-x-4 max-w-4xl mx-auto w-full">
            <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center animate-pulse ${sessionType === 'task' ? 'bg-gradient-to-br from-blue-600 to-cyan-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
               <Sparkles size={16} className="text-white" />
            </div>
            <div className="flex items-center space-x-2 pt-1">
               <span className="w-2 h-2 bg-mac-muted rounded-full animate-bounce [animation-delay:-0.3s]"></span>
               <span className="w-2 h-2 bg-mac-muted rounded-full animate-bounce [animation-delay:-0.15s]"></span>
               <span className="w-2 h-2 bg-mac-muted rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6">
        <div className={`max-w-4xl mx-auto bg-mac-input border rounded-xl shadow-lg relative flex flex-col transition-all focus-within:ring-2 focus-within:ring-blue-500/20 ${isListening ? 'border-red-500/50 ring-1 ring-red-500/20' : 'border-mac-border focus-within:border-blue-500/50'}`}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : (sessionType === 'task' ? "Describe the task or objective..." : "Type a message...")}
            className="w-full bg-transparent text-mac-text placeholder-mac-muted p-4 min-h-[60px] max-h-[200px] resize-none focus:outline-none text-[15px] font-sans"
            disabled={isLoading}
          />
          
          <div className="flex items-center justify-between px-3 py-2 border-t border-mac-border bg-mac-surface-2/30 rounded-b-xl">
             <div className="flex items-center space-x-2">
                <button className="p-2 text-mac-muted hover:text-mac-text hover:bg-mac-hover rounded-md transition-colors" title="Add Attachment">
                   <Paperclip size={18} />
                </button>
                <button 
                  onClick={toggleListening}
                  className={`p-2 rounded-md transition-colors ${isListening ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' : 'text-mac-muted hover:text-mac-text hover:bg-mac-hover'}`}
                  title={isListening ? "Stop Dictation" : "Dictate Prompt"}
                >
                   {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
                </button>
             </div>
             
             {isLoading ? (
               <button 
                onClick={onStop}
                className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-md transition-all border border-red-500/20"
               >
                 <StopCircle size={16} />
                 <span className="text-xs font-medium">Stop</span>
               </button>
             ) : (
               <button 
                onClick={onSend}
                disabled={!input.trim()}
                className="bg-mac-text text-mac-bg px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50 disabled:hover:opacity-50 transition-colors flex items-center space-x-2 font-medium"
               >
                 <span className="text-xs font-semibold">{sessionType === 'task' ? 'Run' : 'Send'}</span>
                 <Send size={14} />
               </button>
             )}
          </div>
        </div>
        <div className="text-center mt-2 text-xs text-mac-muted">
           Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;