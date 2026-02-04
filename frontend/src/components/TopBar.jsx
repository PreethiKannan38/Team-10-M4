import { motion } from 'framer-motion';
import { Share2, Download, LogOut, ChevronDown, Bell, Settings, Users } from 'lucide-react';

const activeUsers = [
  { id: 1, name: 'Manu', color: 'bg-purple-500', initial: 'M' },
  { id: 2, name: 'Sarah', color: 'bg-blue-500', initial: 'S' },
  { id: 3, name: 'Alex', color: 'bg-emerald-500', initial: 'A' },
];

export default function TopBar({ onClear, onLogout }) {
  return (
    <motion.div 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center rotate-45 shadow-[0_4px_10px_rgba(139,92,246,0.3)]">
          <div className="w-3 h-3 bg-white/30 rounded-sm -rotate-45"></div>
        </div>
        <span className="font-black text-sm text-slate-900 tracking-[0.3em] ml-1 uppercase">
          DesignDeck
        </span>
      </div>

      {/* Middle: Collaboration Bubbles */}
      <div className="hidden lg:flex items-center gap-3 bg-slate-50/50 border border-slate-100 px-4 py-2 rounded-full">
        <div className="flex -space-x-2">
          {activeUsers.map((user) => (
            <motion.div
              key={user.id}
              whileHover={{ y: -5, zIndex: 10 }}
              className={`w-8 h-8 ${user.color} rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm cursor-pointer relative group`}
            >
              {user.initial}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[9px] rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap">
                {user.name}
              </div>
            </motion.div>
          ))}
          <div className="w-8 h-8 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-colors">
            <Users className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="w-[1px] h-4 bg-slate-200 mx-1" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">3 Online</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Clear
        </button>

        <button className="w-9 h-9 icon-button text-slate-400 hover:text-slate-900 hover:bg-slate-100">
          <Bell className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 icon-button text-slate-400 hover:text-slate-900 hover:bg-slate-100">
          <Settings className="w-4 h-4" />
        </button>
        
        <div className="w-[1px] h-4 bg-slate-200 mx-2" />

        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all active:scale-95">
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden md:block">Share</span>
        </button>
        
        <button className="w-9 h-9 icon-button bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200 active:scale-90">
          <Download className="w-4 h-4" />
        </button>

        <button 
          onClick={onLogout}
          className="w-9 h-9 icon-button text-slate-300 hover:text-red-600 hover:bg-red-50 active:scale-90 ml-2"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
