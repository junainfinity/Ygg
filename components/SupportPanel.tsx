import React from 'react';
import { PanelLeft, Twitter, Github, Linkedin, Mail, Send } from 'lucide-react';

interface SupportPanelProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const SupportPanel: React.FC<SupportPanelProps> = ({ isSidebarOpen, onToggleSidebar }) => {
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
            <span className="text-sm font-medium text-mac-text">Support</span>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto space-y-12">
            
            {/* Team Section */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-bold text-mac-text">Meet the Team</h1>
                <p className="text-mac-muted max-w-lg mx-auto leading-relaxed">
                    VibeAgent is built by a small team of passionate engineers dedicated to making AI coding tools more accessible and powerful.
                </p>
                <div className="flex justify-center space-x-6 pt-4">
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-blue-100 border-2 border-blue-500 overflow-hidden">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Felix" />
                        </div>
                        <span className="text-sm font-medium text-mac-text">Felix</span>
                        <span className="text-xs text-mac-muted">Lead Dev</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-purple-100 border-2 border-purple-500 overflow-hidden">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Sarah" />
                        </div>
                        <span className="text-sm font-medium text-mac-text">Sarah</span>
                        <span className="text-xs text-mac-muted">Product</span>
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-green-100 border-2 border-green-500 overflow-hidden">
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus" alt="Marcus" />
                        </div>
                        <span className="text-sm font-medium text-mac-text">Marcus</span>
                        <span className="text-xs text-mac-muted">Design</span>
                    </div>
                </div>
            </div>

            {/* Social Follow */}
            <div className="bg-mac-sidebar border border-mac-border rounded-xl p-8 text-center space-y-6">
                <h2 className="text-xl font-semibold text-mac-text">Follow our Journey</h2>
                <div className="flex justify-center space-x-6">
                    <a href="#" className="p-3 bg-mac-surface border border-mac-border rounded-full hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all group">
                        <Twitter size={20} className="text-mac-text group-hover:text-white" />
                    </a>
                    <a href="#" className="p-3 bg-mac-surface border border-mac-border rounded-full hover:bg-black hover:text-white hover:border-black transition-all group">
                        <Github size={20} className="text-mac-text group-hover:text-white" />
                    </a>
                    <a href="#" className="p-3 bg-mac-surface border border-mac-border rounded-full hover:bg-blue-700 hover:text-white hover:border-blue-700 transition-all group">
                        <Linkedin size={20} className="text-mac-text group-hover:text-white" />
                    </a>
                </div>
            </div>

            {/* Contact Form */}
            <div className="bg-mac-surface border border-mac-border rounded-xl p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-mac-text mb-6">Contact Us</h2>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-mac-text">Name</label>
                            <input type="text" className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2.5 text-sm text-mac-text focus:outline-none focus:border-blue-500" placeholder="Your name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-mac-text">Email</label>
                            <input type="email" className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2.5 text-sm text-mac-text focus:outline-none focus:border-blue-500" placeholder="you@example.com" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-mac-text">Message</label>
                        <textarea className="w-full bg-mac-sidebar border border-mac-border rounded-md p-2.5 text-sm text-mac-text focus:outline-none focus:border-blue-500 min-h-[120px]" placeholder="How can we help?"></textarea>
                    </div>
                    <div className="pt-2">
                        <button className="flex items-center justify-center space-x-2 bg-mac-text text-mac-bg px-6 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity w-full sm:w-auto">
                            <Send size={16} />
                            <span>Send Message</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="text-center text-xs text-mac-muted pb-4">
                &copy; {new Date().getFullYear()} VibeAgent. All rights reserved.
            </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPanel;