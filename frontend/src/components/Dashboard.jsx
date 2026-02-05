import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Layout, Clock, User, ArrowRight, Trash2, LogOut, Search, Grid, List, MoreVertical, Settings, Users } from 'lucide-react';

const Dashboard = () => {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');
    const navigate = useNavigate();

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        fetchCanvases();
    }, []);

    const fetchCanvases = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5001/api/canvas/my-canvases', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanvases(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching canvases:', err);
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else {
                setError('Failed to load canvases. Please check your connection.');
                setLoading(false);
            }
        }
    };

    const handleCreateCanvas = async () => {
        try {
            const res = await axios.post('http://localhost:5001/api/canvas/create', { name: 'Untitled Canvas' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/canvas/${res.data.canvasId}`);
        } catch (err) {
            console.error('Error creating canvas:', err);
            if (err.response?.status === 401) {
                localStorage.clear();
                navigate('/login');
            } else {
                alert('Failed to create workspace: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleDeleteCanvas = async (e, canvasId) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this workspace? This action cannot be undone.')) return;

        try {
            await axios.delete(`http://localhost:5001/api/canvas/${canvasId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanvases(canvases.filter(c => c.canvasId !== canvasId));
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete canvas');
        }
    };

    const filteredCanvases = canvases.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col items-center lg:items-stretch transition-all duration-300 z-50">
                <div className="h-20 flex items-center px-6 gap-3 shrink-0 border-b border-slate-50">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-100">
                        <div className="w-4 h-4 bg-white/30 rounded-sm" />
                    </div>
                    <span className="hidden lg:block text-xl font-black tracking-tight uppercase">DesignDeck</span>
                </div>

                <div className="flex-1 py-8 px-4 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold transition-all">
                        <Layout size={20} />
                        <span className="hidden lg:block">My Canvases</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all">
                        <Users size={20} />
                        <span className="hidden lg:block">Shared with me</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all">
                        <Settings size={20} />
                        <span className="hidden lg:block">Settings</span>
                    </button>
                </div>

                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={() => { localStorage.clear(); navigate('/login'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl font-bold transition-all"
                    >
                        <LogOut size={20} />
                        <span className="hidden lg:block">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-8 flex-1 max-w-2xl">
                        <div className="relative w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search workspaces..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-100 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 ml-8">
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid size={18} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                        <button 
                            onClick={handleCreateCanvas}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-2xl font-black tracking-wide text-xs uppercase flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 hover:-translate-y-0.5 active:scale-95"
                        >
                            <Plus size={18} strokeWidth={3} />
                            New Canvas
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md">
                            {user.name?.[0].toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-10">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Workspaces</h2>
                            <p className="text-slate-500 font-medium">Manage and collaborate on your digital canvases.</p>
                        </div>

                        {loading ? (
                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-64 bg-white animate-pulse rounded-[2rem] border border-slate-100" />
                                ))}
                            </div>
                        ) : filteredCanvases.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                                    <Layout className="text-slate-200" size={40} />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No canvases found</h3>
                                <p className="text-slate-400 mb-8 max-w-xs text-center">Create your first collaborative workspace to start designing with your team.</p>
                                <button 
                                    onClick={handleCreateCanvas}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center gap-2"
                                >
                                    <Plus size={20} />
                                    Create First Canvas
                                </button>
                            </div>
                        ) : (
                            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                                {filteredCanvases.map((canvas) => (
                                    <div
                                        key={canvas.canvasId}
                                        onClick={() => navigate(`/canvas/${canvas.canvasId}`)}
                                        className="group bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col justify-between h-64 relative overflow-hidden border-b-4 border-b-transparent hover:border-b-indigo-500"
                                    >
                                        <div className="absolute top-4 right-4 z-10">
                                            <button 
                                                onClick={(e) => handleDeleteCanvas(e, canvas.canvasId)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        
                                        <div>
                                            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform mb-6">
                                                <Layout size={24} />
                                            </div>
                                            <h3 className="text-lg font-black text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate pr-8">{canvas.name}</h3>
                                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                                <Clock size={12} />
                                                <span>{new Date(canvas.updatedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                                            <div className="flex -space-x-2">
                                                {[...Array(3)].map((_, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        {i === 2 ? '+' : 'U'}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;