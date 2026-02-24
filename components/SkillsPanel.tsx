import React, { useState } from 'react';
import { Search, Filter, Star, Download, Check, Plus, PanelLeft, Cpu, Zap, Box, MessageCircle } from 'lucide-react';
import { MOCK_SKILLS } from '../constants';
import { Skill } from '../types';

interface SkillsPanelProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const SkillsPanel: React.FC<SkillsPanelProps> = ({ isSidebarOpen, onToggleSidebar }) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'top' | 'newest' | 'installed'>('trending');
  const [searchQuery, setSearchQuery] = useState('');

  const filterSkills = (skills: Skill[]) => {
    let filtered = skills;
    if (searchQuery) {
      filtered = skills.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    if (activeTab === 'installed') {
      return filtered.filter(s => s.isInstalled);
    }
    
    // Mock sorting for tabs
    if (activeTab === 'top') {
        return [...filtered].sort((a, b) => b.rating - a.rating);
    }
    if (activeTab === 'newest') {
        // Just mock shuffle for newest
        return [...filtered].reverse(); 
    }
    
    // Default Trending
    return filtered;
  };

  const displayedSkills = filterSkills(MOCK_SKILLS);

  const CategoryIcon = ({ category }: { category: string }) => {
      switch(category) {
          case 'Communication': return <MessageCircle size={16} className="text-blue-500" />;
          case 'Core': return <Cpu size={16} className="text-purple-500" />;
          case 'Productivity': return <Zap size={16} className="text-yellow-500" />;
          default: return <Box size={16} className="text-green-500" />;
      }
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
            <span className="text-sm font-medium text-mac-text">Skills Store</span>
         </div>
         <div className="flex items-center space-x-2">
            <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1.5 text-mac-muted" />
                <input 
                    type="text" 
                    placeholder="Search skills..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-mac-sidebar border border-mac-border rounded-md pl-8 pr-3 py-1 text-xs text-mac-text focus:outline-none focus:border-blue-500/50 w-48 transition-colors"
                />
            </div>
            <button className="p-1 text-mac-muted hover:text-mac-text hover:bg-mac-hover rounded transition-colors">
                <Filter size={14} />
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
            
            {/* Banner */}
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 border border-blue-500/20 rounded-xl p-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white mb-2">Extend your workflow</h2>
                    <p className="text-gray-300 text-sm max-w-lg">
                        Install skills to connect Gemini with your favorite tools like Telegram, Linear, Notion, and more. 
                        Enable real-time actions and deeper context.
                    </p>
                </div>
                <div className="hidden md:block">
                    <Box size={64} className="text-blue-400 opacity-80" strokeWidth={1} />
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-mac-border pb-1">
                {['trending', 'top', 'newest', 'installed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === tab ? 'text-blue-500' : 'text-mac-muted hover:text-mac-text'}`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        {activeTab === tab && (
                            <div className="absolute bottom-[-5px] left-0 right-0 h-0.5 bg-blue-500 rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedSkills.map((skill) => (
                    <div key={skill.id} className="bg-mac-sidebar border border-mac-border rounded-xl p-4 hover:border-mac-text-muted/30 transition-all group flex flex-col h-full">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-mac-border/50 bg-mac-surface`}>
                                    <CategoryIcon category={skill.category} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-mac-text">{skill.name}</h3>
                                    <p className="text-[10px] text-mac-muted uppercase tracking-wider">{skill.category}</p>
                                </div>
                            </div>
                            {skill.isInstalled && <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[10px] rounded-full font-medium border border-green-500/20">Installed</span>}
                        </div>
                        
                        <p className="text-xs text-mac-muted leading-relaxed mb-4 flex-1">
                            {skill.description}
                        </p>
                        
                        <div className="flex items-center space-x-2 mb-4 flex-wrap gap-y-2">
                            {skill.tags.map(tag => (
                                <span key={tag} className="px-2 py-0.5 bg-mac-surface text-mac-text-muted text-[10px] rounded border border-mac-border">#{tag}</span>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-mac-border/50">
                            <div className="flex items-center space-x-3 text-xs text-mac-muted">
                                <div className="flex items-center space-x-1" title="Downloads">
                                    <Download size={12} />
                                    <span>{skill.downloads}</span>
                                </div>
                                <div className="flex items-center space-x-1" title="Rating">
                                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                    <span>{skill.rating}</span>
                                </div>
                            </div>
                            
                            <button className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1 ${skill.isInstalled ? 'bg-mac-surface text-mac-text border border-mac-border hover:bg-mac-hover' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                                {skill.isInstalled ? (
                                    <>
                                        <Check size={12} />
                                        <span>Config</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus size={12} />
                                        <span>Install</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            
            {displayedSkills.length === 0 && (
                <div className="text-center py-20 text-mac-muted">
                    <p>No skills found matching "{searchQuery}"</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SkillsPanel;