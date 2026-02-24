import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Settings, Plus, MoreHorizontal, CheckSquare, Target, Pencil, Trash2, FolderPlus, Pin, PanelLeftClose, PinOff, Zap, HelpCircle } from 'lucide-react';
import { ChatSession, ViewMode, SessionType } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewSession: (type: SessionType) => void;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onPinSession: (id: string) => void;
  currentView: ViewMode;
  onChangeView: (mode: ViewMode) => void;
  onToggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  activeSessionId, 
  onNewSession, 
  onSelectSession,
  onDeleteSession,
  onRenameSession,
  onPinSession,
  currentView,
  onChangeView,
  onToggleSidebar
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingId]);

  const startRenaming = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
    setMenuOpenId(null);
  };

  const saveRename = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const sortSessions = (list: ChatSession[]) => {
    return [...list].sort((a, b) => {
      // Sort by pinned first
      if (!!a.isPinned !== !!b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      // Then by last modified (newest first)
      return b.lastModified - a.lastModified;
    });
  };

  const tasks = sortSessions(sessions.filter(s => s.type === 'task'));
  const chats = sortSessions(sessions.filter(s => s.type === 'chat'));

  const SessionItem: React.FC<{ session: ChatSession, icon: any }> = ({ session, icon: Icon }) => {
    const isActive = activeSessionId === session.id && currentView === ViewMode.CHAT;
    const isMenuOpen = menuOpenId === session.id;
    const isEditing = editingId === session.id;

    return (
      <div className="relative group">
        {isEditing ? (
           <div className={`w-full px-2 py-1.5 rounded-md text-sm flex items-center space-x-2 bg-mac-hover border border-blue-500/50`}>
              <Icon size={14} className="text-mac-muted" />
              <input
                ref={inputRef}
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onBlur={saveRename}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-mac-text text-sm min-w-0"
              />
           </div>
        ) : (
          <button
            onClick={() => {
              onChangeView(ViewMode.CHAT);
              onSelectSession(session.id);
            }}
            className={`w-full text-left px-2 py-1.5 rounded-md text-sm truncate transition-colors flex items-center justify-between group/item ${isActive ? 'bg-mac-active text-mac-text font-medium' : 'text-mac-text-muted hover:bg-mac-hover hover:text-mac-text'}`}
          >
            <div className="flex items-center space-x-2 min-w-0">
              <Icon size={14} className={isActive ? 'text-blue-500' : 'text-mac-muted'} />
              <span className={`truncate ${session.isPinned ? 'font-medium' : ''}`}>{session.title}</span>
            </div>
            
            <div className="flex items-center space-x-1">
               {session.isPinned && (
                 <Pin size={10} className="text-mac-muted -rotate-45" fill="currentColor" />
               )}
               <div 
                className={`flex-shrink-0 flex items-center ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'} transition-opacity`}
                onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpenId(isMenuOpen ? null : session.id);
                }}
                >
                <MoreHorizontal size={14} className="text-mac-muted hover:text-mac-text" />
                </div>
            </div>
          </button>
        )}

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="absolute right-0 top-8 w-40 bg-mac-surface border border-mac-border rounded-lg shadow-xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
             <button 
              onClick={(e) => { e.stopPropagation(); onPinSession(session.id); setMenuOpenId(null); }}
              className="w-full text-left px-3 py-2 text-xs text-mac-text hover:bg-blue-600 hover:text-white flex items-center space-x-2"
            >
              {session.isPinned ? <PinOff size={12} /> : <Pin size={12} />}
              <span>{session.isPinned ? 'Unpin' : 'Pin'}</span>
            </button>
            <button 
              onClick={(e) => startRenaming(session, e)}
              className="w-full text-left px-3 py-2 text-xs text-mac-text hover:bg-blue-600 hover:text-white flex items-center space-x-2"
            >
              <Pencil size={12} />
              <span>Rename</span>
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); /* Mock folder action */ }}
              className="w-full text-left px-3 py-2 text-xs text-mac-text hover:bg-blue-600 hover:text-white flex items-center space-x-2"
            >
              <FolderPlus size={12} />
              <span>Move to Folder...</span>
            </button>
            <div className="h-px bg-mac-border my-1 mx-1" />
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); setMenuOpenId(null); }}
              className="w-full text-left px-3 py-2 text-xs text-red-500 hover:bg-red-500/10 flex items-center space-x-2"
            >
              <Trash2 size={12} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-mac-sidebar border-r border-mac-border flex flex-col h-full select-none transition-colors">
      {/* Window Controls Mockup */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-transparent flex-shrink-0">
        <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"></div>
            <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></div>
        </div>
        
        <button 
            onClick={onToggleSidebar}
            className="text-mac-muted hover:text-mac-text transition-colors p-1 hover:bg-mac-hover rounded"
            title="Collapse Sidebar"
        >
            <PanelLeftClose size={14} />
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        
        {/* TASKS SECTION - Top Half */}
        <div className="flex-1 flex flex-col min-h-0 border-b border-mac-border">
          <div className="flex items-center justify-between px-3 py-2 group flex-shrink-0 bg-mac-sidebar z-10">
             <div className="flex items-center space-x-2 text-xs font-semibold text-mac-muted uppercase tracking-wider">
               <Target size={12} />
               <span>Tasks</span>
             </div>
             <button 
               onClick={() => onNewSession('task')}
               className="text-mac-muted hover:text-mac-text opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-mac-hover rounded"
               title="New Task"
             >
               <Plus size={12} />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 custom-scrollbar">
            <button 
                onClick={() => onNewSession('task')}
                className="w-full text-left px-2 py-1.5 rounded-md text-sm text-mac-text-muted hover:text-mac-text hover:bg-mac-hover flex items-center space-x-2 mb-2 opacity-60 hover:opacity-100 flex-shrink-0"
            >
              <div className="w-4 flex justify-center"><Plus size={12} /></div>
              <span>New Task...</span>
            </button>

            {tasks.map(session => (
              <SessionItem key={session.id} session={session} icon={CheckSquare} />
            ))}
          </div>
        </div>

        {/* CHATS SECTION - Bottom Half */}
        <div className="flex-1 flex flex-col min-h-0">
           <div className="flex items-center justify-between px-3 py-2 group flex-shrink-0 bg-mac-sidebar z-10">
             <div className="flex items-center space-x-2 text-xs font-semibold text-mac-muted uppercase tracking-wider">
               <MessageSquare size={12} />
               <span>Chats</span>
             </div>
             <button 
               onClick={() => onNewSession('chat')}
               className="text-mac-muted hover:text-mac-text opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-mac-hover rounded"
               title="New Chat"
             >
               <Plus size={12} />
             </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-0.5 custom-scrollbar">
            <button 
                onClick={() => onNewSession('chat')}
                className="w-full text-left px-2 py-1.5 rounded-md text-sm text-mac-text-muted hover:text-mac-text hover:bg-mac-hover flex items-center space-x-2 mb-2 opacity-60 hover:opacity-100 flex-shrink-0"
            >
              <div className="w-4 flex justify-center"><Plus size={12} /></div>
              <span>New Chat...</span>
            </button>

            {chats.map(session => (
              <SessionItem key={session.id} session={session} icon={MessageSquare} />
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="p-3 border-t border-mac-border space-y-1 flex-shrink-0">
        <button 
          onClick={() => onChangeView(ViewMode.SKILLS)}
          className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm transition-colors ${currentView === ViewMode.SKILLS ? 'bg-mac-active text-mac-text' : 'text-mac-text-muted hover:text-mac-text hover:bg-mac-hover'}`}
        >
          <Zap size={16} />
          <span>Skills</span>
        </button>
        <button 
          onClick={() => onChangeView(ViewMode.SETTINGS)}
          className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm transition-colors ${currentView === ViewMode.SETTINGS ? 'bg-mac-active text-mac-text' : 'text-mac-text-muted hover:text-mac-text hover:bg-mac-hover'}`}
        >
          <Settings size={16} />
          <span>Settings</span>
        </button>
        <button 
          onClick={() => onChangeView(ViewMode.SUPPORT)}
          className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm transition-colors ${currentView === ViewMode.SUPPORT ? 'bg-mac-active text-mac-text' : 'text-mac-text-muted hover:text-mac-text hover:bg-mac-hover'}`}
        >
          <HelpCircle size={16} />
          <span>Support</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;