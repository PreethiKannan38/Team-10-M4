import React, { useState } from 'react';
import { X, User, Shield, Send, CheckCircle2, AlertCircle, Loader2, Edit2 } from 'lucide-react';
import axios from 'axios';

const ShareModal = ({ isOpen, onClose, canvasId }) => {
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('viewer');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });

    const token = localStorage.getItem('token');

    const handleInvite = async (e) => {
        e.preventDefault();
        if (!username.trim()) return;

        setLoading(true);
        setStatus({ type: '', message: '' });

        try {
            await axios.post(`http://localhost:5001/api/canvas/${canvasId}/invite-username`, 
                { username, role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setStatus({ type: 'success', message: 'Invitation Sent Successfully!' });
            setUsername('');
        } catch (err) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Failed To Send Invitation' });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2147483647] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 relative z-[2147483647]">
                <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                            <Send size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Share Workspace</h2>
                            <p className="text-slate-400 font-medium text-sm">Invite Collaborators By Username</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    {status.message && (
                        <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 animate-in slide-in-from-top-2 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                            <span className="font-bold text-sm">{status.message}</span>
                        </div>
                    )}

                    <form onSubmit={handleInvite} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Recipient Username</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input 
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Enter Username"
                                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Permission Level</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => setRole('viewer')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'viewer' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                >
                                    <Shield size={20} />
                                    <span className="text-xs font-black uppercase">Viewer</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('editor')}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${role === 'editor' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600' : 'border-slate-50 bg-slate-50 text-slate-400'}`}
                                >
                                    <Edit2 size={20} />
                                    <span className="text-xs font-black uppercase">Editor</span>
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Send Invitation'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;