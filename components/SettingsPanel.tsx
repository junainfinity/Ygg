import React, { useState } from 'react';
import { AppSettings } from '../types';
import { PROVIDERS } from '../constants';
import { Save, PanelLeft, Shield, Key, Moon, Sun, Monitor, CheckCircle, AlertCircle, Circle, RotateCcw, ChevronDown, ChevronRight, Globe, Server, MessageCircle, Phone, Mail } from 'lucide-react';

interface SettingsPanelProps {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onThemeChange: (theme: 'dark' | 'light') => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  isGoogleAuth: boolean;
  onGoogleLogin: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onSave,
  onThemeChange,
  isSidebarOpen, 
  onToggleSidebar,
  isGoogleAuth,
  onGoogleLogin
}) => {
  const [localSettings, setLocalSettings] = React.useState(settings);
  const [isAccountOpen, setIsAccountOpen] = useState(true);
  
  // Track open state for accordion of each provider
  const [openProvider, setOpenProvider] = useState<string | null>(null);

  const handleChange = (key: keyof AppSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleThemeChange = (theme: 'dark' | 'light') => {
      handleChange('theme', theme);
      onThemeChange(theme); // Immediate application
  };

  const handleKeyChange = (providerKeyField: string, value: string) => {
      // Mock validation logic
      let status: 'valid' | 'invalid' | 'empty' = 'empty';
      if (value.length > 0) {
          status = value.length > 10 ? 'valid' : 'invalid'; 
      }
      
      setLocalSettings(prev => ({
          ...prev,
          [providerKeyField]: value,
          authStatus: {
              ...prev.authStatus,
              [providerKeyField]: status
          }
      }));
  };

  const handleSave = () => {
    onSave(localSettings);
  };
  
  const handleReset = () => {
      if(confirm('Are you sure you want to reset all settings to default?')) {
        console.log("Resetting settings");
      }
  };

  const ContactChannelItem = ({ 
      icon: Icon, 
      label, 
      enabledField, 
      idField, 
      placeholder,
      customIcon
  }: { 
      icon?: any, 
      label: string, 
      enabledField: keyof AppSettings, 
      idField: keyof AppSettings, 
      placeholder: string,
      customIcon?: React.ReactNode
  }) => {
      const isEnabled = localSettings[enabledField] as boolean;
      return (
          <div className="bg-mac-surface border border-mac-border rounded-lg p-3 transition-all">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-mac-sidebar flex items-center justify-center border border-mac-border">
                          {customIcon ? customIcon : <Icon size={16} className="text-mac-text" />}
                      </div>
                      <span className="text-sm font-medium text-mac-text">{label}</span>
                  </div>
                  <button 
                      onClick={() => handleChange(enabledField, !isEnabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${isEnabled ? 'bg-green-500' : 'bg-mac-border'}`}
                  >
                      <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
              </div>
              {isEnabled && (
                  <input 
                      type="text"
                      value={localSettings[idField] as string}
                      onChange={(e) => handleChange(idField, e.target.value)}
                      placeholder={placeholder}
                      className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2 text-sm text-mac-text focus:outline-none focus:border-blue-500/50 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
                  />
              )}
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full bg-mac-bg relative transition-colors duration-200">
      {/* Header */}
      <div className="h-10 border-b border-mac-border flex items-center justify-between px-4 bg-mac-bg/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
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
            <span className="text-sm font-medium text-mac-text">Settings</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-24">
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
              <h2 className="text-2xl font-semibold text-mac-text mb-1">Preferences</h2>
              <p className="text-mac-muted text-sm">Configure your AI assistant's behavior and look.</p>
          </div>

          <div className="space-y-6">
            
            {/* Appearance Section */}
            <div className="bg-mac-sidebar border border-mac-border rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-2 text-mac-text font-medium">
                    <Monitor size={18} className="text-blue-500" />
                    <span>Appearance</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleThemeChange('dark')}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${localSettings.theme === 'dark' ? 'bg-blue-600/10 border-blue-500/50 text-mac-text' : 'bg-mac-surface border-transparent text-mac-muted hover:bg-mac-hover'}`}
                    >
                        <Moon size={16} />
                        <span className="text-sm">Dark Mode</span>
                    </button>
                    <button 
                        onClick={() => handleThemeChange('light')}
                        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-all ${localSettings.theme === 'light' ? 'bg-blue-600/10 border-blue-500/50 text-mac-text' : 'bg-mac-surface border-transparent text-mac-muted hover:bg-mac-hover'}`}
                    >
                        <Sun size={16} />
                        <span className="text-sm">Light Mode</span>
                    </button>
                </div>
            </div>

            {/* Account & Security Section */}
            <div className="bg-mac-sidebar border border-mac-border rounded-xl overflow-hidden">
               <button 
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="w-full flex items-center justify-between p-5 hover:bg-mac-hover/50 transition-colors"
               >
                   <div className="flex items-center space-x-2 text-mac-text font-medium">
                     <Shield size={18} className="text-blue-500" />
                     <span>Account & Security</span>
                   </div>
                   {isAccountOpen ? <ChevronDown size={18} className="text-mac-muted" /> : <ChevronRight size={18} className="text-mac-muted" />}
               </button>
               
               {isAccountOpen && (
                   <div className="px-5 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-200">
                       {PROVIDERS.map((provider) => {
                           const key = localSettings[provider.keyField] as string;
                           const status = localSettings.authStatus[provider.keyField] || 'empty';
                           const isOpen = openProvider === provider.id;

                           return (
                               <div key={provider.id} className="bg-mac-surface border border-mac-border rounded-lg overflow-hidden transition-all duration-200">
                                   <button 
                                    onClick={() => setOpenProvider(isOpen ? null : provider.id)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-mac-hover transition-colors"
                                   >
                                       <div className="flex items-center space-x-3">
                                           <div className="w-8 h-8 rounded bg-white flex items-center justify-center border border-mac-border overflow-hidden p-1">
                                                {provider.icon ? (
                                                    <img src={provider.icon} alt={provider.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <Key size={14} className="text-mac-muted" />
                                                )}
                                           </div>
                                           <span className="text-sm font-medium text-mac-text">{provider.name}</span>
                                       </div>
                                       <div className="flex items-center space-x-3">
                                           {status === 'valid' && <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
                                           {status === 'invalid' && <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" />}
                                           {status === 'empty' && <div className="w-2 h-2 rounded-full bg-mac-border" />}
                                       </div>
                                   </button>
                                   
                                   {isOpen && (
                                       <div className="p-3 border-t border-mac-border bg-mac-surface-2/30 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                           {provider.id === 'google' && (
                                               <div className="flex items-center justify-between p-2 bg-mac-sidebar rounded border border-mac-border mb-2">
                                                   <span className="text-xs text-mac-text-muted">Or sign in with Google Account</span>
                                                   <button 
                                                    onClick={onGoogleLogin}
                                                    className="text-xs bg-white text-black px-3 py-1.5 rounded font-medium hover:bg-gray-100 transition-colors"
                                                   >
                                                       Sign In
                                                   </button>
                                               </div>
                                           )}
                                           <div>
                                               <label className="text-[10px] uppercase text-mac-muted font-bold tracking-wider mb-1 block">API Key</label>
                                               <input 
                                                    type="password" 
                                                    value={key}
                                                    onChange={(e) => handleKeyChange(provider.keyField as string, e.target.value)}
                                                    placeholder={`Enter your ${provider.name} API Key...`}
                                                    className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2 text-sm text-mac-text font-mono focus:outline-none focus:border-blue-500/50 transition-colors"
                                               />
                                               <div className="flex items-center space-x-1 mt-1.5">
                                                   {status === 'valid' && <CheckCircle size={10} className="text-green-500" />}
                                                   {status === 'invalid' && <AlertCircle size={10} className="text-red-500" />}
                                                   {status === 'empty' && <Circle size={10} className="text-mac-muted" />}
                                                   <span className={`text-[10px] ${status === 'valid' ? 'text-green-500' : status === 'invalid' ? 'text-red-500' : 'text-mac-muted'}`}>
                                                       {status === 'valid' ? 'Key appears valid' : status === 'invalid' ? 'Key format may be incorrect' : 'No key provided'}
                                                   </span>
                                               </div>
                                           </div>
                                           
                                           {/* Extended Configuration for specific providers */}
                                           {provider.baseUrlField && (
                                                <div className="pt-2 border-t border-mac-border/50">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <div className="flex items-center space-x-1 mb-1">
                                                                <Globe size={10} className="text-mac-muted" />
                                                                <label className="text-[10px] uppercase text-mac-muted font-bold tracking-wider">Base URL</label>
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                value={localSettings[provider.baseUrlField] as string}
                                                                onChange={(e) => handleChange(provider.baseUrlField!, e.target.value)}
                                                                placeholder="https://api..."
                                                                className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2 text-xs text-mac-text font-mono focus:outline-none focus:border-blue-500/50"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center space-x-1 mb-1">
                                                                <Server size={10} className="text-mac-muted" />
                                                                <label className="text-[10px] uppercase text-mac-muted font-bold tracking-wider">Model ID</label>
                                                            </div>
                                                            <input 
                                                                type="text" 
                                                                value={localSettings[provider.modelIdField!] as string}
                                                                onChange={(e) => handleChange(provider.modelIdField!, e.target.value)}
                                                                placeholder="e.g. my-custom-model"
                                                                className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2 text-xs text-mac-text font-mono focus:outline-none focus:border-blue-500/50"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                           )}
                                       </div>
                                   )}
                               </div>
                           );
                       })}
                   </div>
               )}
            </div>

            {/* Contact Channels Section */}
            <div className="bg-mac-sidebar border border-mac-border rounded-xl p-5 space-y-4">
               <div className="flex items-center space-x-2 text-mac-text font-medium">
                 <MessageCircle size={18} className="text-green-500" />
                 <span>Contact Channels</span>
               </div>
               
               <div className="space-y-3">
                  <ContactChannelItem 
                      label="Telegram" 
                      enabledField="contactTelegram" 
                      idField="contactTelegramId" 
                      placeholder="Enter Telegram Username or Chat ID"
                      customIcon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#229ED9]">
                          <path d="M22 2L11 13" />
                          <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                        </svg>
                      }
                  />
                  <ContactChannelItem 
                      label="WhatsApp" 
                      enabledField="contactWhatsapp" 
                      idField="contactWhatsappId" 
                      placeholder="Enter WhatsApp Number"
                      customIcon={
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#25D366]">
                          <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        </svg>
                      }
                  />
                  <ContactChannelItem 
                      icon={Mail} 
                      label="Email" 
                      enabledField="contactEmail" 
                      idField="contactEmailId" 
                      placeholder="Enter Email Address"
                  />
               </div>
            </div>

            <div className="pt-4 border-t border-mac-border">
              <button 
                onClick={handleReset}
                className="w-full flex items-center justify-center space-x-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-600/20 px-4 py-2 rounded-md transition-colors"
              >
                <RotateCcw size={16} />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Save Button */}
      <button 
        onClick={handleSave}
        className="fixed bottom-8 right-8 flex items-center space-x-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-full transition-all shadow-lg shadow-green-900/30 hover:scale-105 active:scale-95 z-50"
      >
        <Save size={20} />
        <span className="font-medium">Save Changes</span>
      </button>
    </div>
  );
};

export default SettingsPanel;