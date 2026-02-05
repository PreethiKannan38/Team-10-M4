import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Plus, Layout, Clock, User, ArrowRight, Trash2, LogOut } from 'lucide-react';

const Dashboard = () => {
    const [canvases, setCanvases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // In a real app, token would come from auth context
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchCanvases();
    }, []);

    const fetchCanvases = async () => {
        try {
            setLoading(true);
            const res = await axios.get('http://localhost:5000/api/canvas/my-canvases', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCanvases(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching canvases:', err);
            setError('Failed to load canvases');
            setLoading(false);

            // Mock data for demonstration if API fails or not authenticated yet
            if (err.response?.status === 401 || !token) {
                setCanvases([
                    { canvasId: 'demo-1', name: 'Website Wireframe', updatedAt: new Date().toISOString() },
                    { canvasId: 'demo-2', name: 'Logo Sketches', updatedAt: new Date().toISOString() },
                    { canvasId: 'demo-3', name: 'App Flowchart', updatedAt: new Date().toISOString() },
                ]);
                setLoading(false);
            }
        }
    };

    const handleCreateCanvas = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/canvas/create', { name: 'New Canvas' }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            navigate(`/canvas/${res.data.canvasId}`);
        } catch (err) {
            console.error('Error creating canvas:', err);
            // fallback for demo
            const randomId = Math.random().toString(36).substring(2, 9);
            navigate(`/canvas/${randomId}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFC] text-slate-800 font-sans p-8 md:p-12 relative overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-[#7C6AF2] blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#6B7A99] blur-[150px] rounded-full" />
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-12">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center rotate-45 shadow-xl shadow-indigo-100">
                                <div className="w-5 h-5 bg-white/30 rounded-md -rotate-45" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-slate-900">DesignDeck</h1>
                        </div>
                        <div className="w-[1px] h-8 bg-slate-200" />
                        <p className="text-slate-500 font-medium">Your creative hub</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={handleCreateCanvas}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-6 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <Plus size={20} />
                            Create New
                        </button>

                        <div className="w-[1px] h-8 bg-slate-100" />

                        <div className="flex items-center gap-4 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Signed in as</p>
                                <p className="text-sm font-bold text-slate-800 leading-none">
                                    {JSON.parse(localStorage.getItem('user') || '{}').name || 'Designer'}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 border-2 border-white">
                                <User size={24} />
                            </div>
                            <button
                                onClick={() => {
                                    localStorage.clear();
                                    navigate('/login');
                                }}
                                className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-48 bg-white/50 animate-pulse rounded-3xl border border-slate-100" />
                        ))}
                    </div>
                ) : error && canvases.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-3xl border border-slate-100">
                        <Layout className="mx-auto text-slate-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">Something went wrong</h3>
                        <p className="text-slate-400">{error}</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {canvases.map((canvas) => (
                            <div
                                key={canvas.canvasId}
                                onClick={() => navigate(`/canvas/${canvas.canvasId}`)}
                                className="group bg-white hover:bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 cursor-pointer flex flex-col justify-between h-64 hover:-translate-y-2"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
                                            <Layout size={24} />
                                        </div>
                                        <button className="text-slate-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{canvas.name}</h3>
                                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 bg-slate-50 px-3 py-1.5 rounded-lg w-max">
                                        <Clock size={10} />
                                        <span>
                                            {new Intl.DateTimeFormat('en-IN', {
                                                timeZone: 'Asia/Kolkata',
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: true
                                            }).format(new Date(canvas.updatedAt))}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                                            <User size={12} className="text-slate-400" />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400">Collaborative</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
