import React, { useState, useEffect, useRef } from 'react';
import { Share2, Download, LogOut, Bell, Settings, Layout, Edit2, Check, User, GitBranch, ChevronDown, Plus, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ShareDialog from './ShareDialog';

export default function TopBar({
  canvas,
  onClear,
  onDashboard,
  onLogout,
  canvasName,
  onNameChange,
  userRole,
  onExport,
  branches = [],
  onBranch,
  onBranchDelete,
  isTimelineOpen,
  setIsTimelineOpen
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const shareRef = useRef(null);
  const branchRef = useRef(null);
  const [newName, setNewName] = useState(canvasName || 'Untitled Canvas');
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    setNewName(canvasName || 'Untitled Canvas');
  }, [canvasName]);

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) {
        setShareOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(e.target)) {
        setBranchMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close popups on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShareOpen(false);
        setBranchMenuOpen(false);
      }
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

  const masterBranch = branches.find(b => b.isMaster);
  const masterName = masterBranch?.name || 'Main';

  // Find current branch in the list to check its master status
  const currentBranchInList = branches.find(b => b.canvasId === canvas?.canvasId);
  const isCurrentMaster = currentBranchInList ? currentBranchInList.isMaster : !currentBranchInList; // Default to true if not found yet (usually master)

  const breadcrumbName = isCurrentMaster ? masterName : `${masterName} / ${canvasName}`;

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

        <div className="flex items-center gap-4">
          {/* Branch Switcher */}
          <div className="relative" ref={branchRef}>
            <button
              onClick={() => setBranchMenuOpen(!branchMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-all group"
            >
              <GitBranch size={14} className="group-hover:text-indigo-600" />
              <span className="text-xs font-bold truncate max-w-[120px]">
                {canvasName || 'Main'}
              </span>
              <ChevronDown size={14} className={`transition-transform duration-200 ${branchMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {branchMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-2 max-h-64 overflow-y-auto">
                  <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Branches</p>
                  {[...branches]
                    .sort((a, b) => {
                      const aIsMaster = a.isMaster;
                      const bIsMaster = b.isMaster;
                      if (aIsMaster && !bIsMaster) return -1;
                      if (!aIsMaster && bIsMaster) return 1;
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    })
                    .map((b) => {
                      const isMaster = b.isMaster;
                      const isActive = b.canvasId === canvas?.canvasId;

                      const itemStyle = isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : isMaster
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' // Lighter highlight for master
                          : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-100';

                      return (
                        <div key={b.canvasId} className="group/branch relative mb-2 last:mb-0">
                          <button
                            onClick={() => {
                              if (!isActive) {
                                navigate(`/canvas/${b.canvasId}`);
                              }
                              setBranchMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all border ${itemStyle}`}
                          >
                            <div className="flex items-center gap-3 overflow-hidden">
                              <GitBranch size={16} className={isActive ? 'text-white/80' : isMaster ? 'text-indigo-400' : 'text-slate-400'} />
                              <div className="text-left overflow-hidden">
                                <span className={`text-xs font-black truncate block tracking-tight ${isActive ? 'text-white' : isMaster ? 'text-indigo-900' : 'text-slate-900'}`}>
                                  {b.name}
                                </span>
                                {isMaster ? (
                                  <div className="flex items-center gap-1.5 -mt-0.5">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">
                                      Master Canvas
                                    </span>
                                  </div>
                                ) : (
                                  <span className={`text-[9px] font-bold uppercase tracking-wider block -mt-0.5 ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                                    Created on {b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isActive && (
                                <div className="bg-white/20 text-white rounded-full p-0.5">
                                  <Check size={10} strokeWidth={4} />
                                </div>
                              )}
                              {!isMaster && (userRole === 'owner' || userRole === 'editor') && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm(`Delete branch "${b.name}"?`)) {
                                      onBranchDelete?.(b.canvasId);
                                    }
                                  }}
                                  className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/branch:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </div>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                </div>
                <div className="p-2 border-t border-slate-50 bg-slate-50/50">
                  <button
                    onClick={() => {
                      onBranch();
                      setBranchMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-indigo-600 hover:text-white text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    <Plus size={14} />
                    Create New Branch
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 group">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                  onBlur={handleNameSubmit}
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
                className={`flex items-center gap-2 ${userRole !== 'viewer' ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => userRole !== 'viewer' && setIsEditing(true)}
              >
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-bold text-slate-800 tracking-tight">
                    {breadcrumbName || 'Untitled Canvas'}
                  </h1>
                </div>
                {userRole !== 'viewer' && <Edit2 size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
          >
            Clear Canvas
          </button>

          <button
            onClick={() => setIsTimelineOpen(!isTimelineOpen)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${isTimelineOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
            title="Timeline Replay"
          >
            <Clock className="w-4 h-4" />
          </button>

          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          <div className="relative flex items-center gap-2" ref={shareRef}>
            <button
              onClick={() => setShareOpen(!shareOpen)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share canvas</span>
            </button>

            <ShareDialog
              isOpen={shareOpen}
              onClose={() => setShareOpen(false)}
              canvasId={canvas?.canvasId}
              owner={canvas?.owner}
              members={canvas?.members}
              onUpdate={canvas?.refetch}
            />
          </div>

          <button
            onClick={onExport}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-all active:scale-90 ml-1"
            title="Download as PNG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        <div className="w-[1px] h-6 bg-slate-200 mx-2" />

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              {userRole === 'owner' ? 'Owner' : userRole === 'editor' ? 'Editor' : 'Viewer'}
            </p>
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
