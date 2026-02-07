import React, { useState, useEffect, useRef } from 'react';
import { Share2, Download, LogOut, Bell, Settings, Layout, Edit2, Check, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareDialog from './ShareDialog';

export default function TopBar({ onClear, onDashboard, onLogout, canvasName, onNameChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef(null);
  const [newName, setNewName] = useState(canvasName || 'Untitled Canvas');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setNewName(canvasName || 'Untitled Canvas');
  }, [canvasName]);

  // Close share popup on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close share popup on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setShareOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleNameSubmit = () => {
    if (newName.trim()) {
      onNameChange(newName);
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 flex-shrink-0 z-50">
      {/* Left: Logo & Editable Name */}
      <div className="flex items-center gap-8">
        <div
          className="flex items-center gap-3 cursor-pointer group"
          onClick={onDashboard}
        >
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center rotate-45 shadow-[0_4px_10px_rgba(79,70,229,0.3)] group-hover:scale-110 transition-transform">
            <div className="w-3.5 h-3.5 bg-white/30 rounded-sm -rotate-45"></div>
          </div>
          <span className="font-black text-lg text-slate-900 tracking-[-0.02em] ml-1">
            Design Deck
          </span>
        </div>

        <div className="w-[1px] h-6 bg-slate-200" />

        <div className="flex items-center gap-2 group">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="bg-slate-50 border-none rounded-lg px-3 py-1 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button
                onClick={handleNameSubmit}
                className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsEditing(true)}
            >
              <h1 className="text-sm font-bold text-slate-800 tracking-tight">{canvasName || 'Untitled Canvas'}</h1>
              <Edit2 size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2">
          {userRole === 'editor' && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Clear Canvas
            </button>
          )}

          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          <button className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100 transition-all active:scale-95">
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Room</span>
          </button>

          <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90 ml-1">
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-slate-200 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Editor Role</p>
            <p className="text-xs font-bold text-slate-700 leading-none">{user.name || 'Guest User'}</p>
          </div>
          <div
            className="relative group cursor-pointer"
            onClick={() => navigate('/profile')}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm" />
          </div>

          <button
            onClick={onLogout}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all active:scale-90 ml-1"
            title="Logout Account"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
