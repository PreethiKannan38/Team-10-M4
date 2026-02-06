import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Bell, Layout, User, Clock } from 'lucide-react';

const InvitationsList = () => {
    const [invitations, setInvitations] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchInvitations();
    }, []);

    const fetchInvitations = async () => {
        try {
            const res = await axios.get('http://localhost:5001/api/canvas/my-invitations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitations(res.data);
        } catch (err) {
            console.error('Failed to fetch invitations');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            await axios.put(`http://localhost:5001/api/canvas/invitation/${id}/${action}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setInvitations(invitations.filter(inv => inv._id !== id));
            if (action === 'accept') {
                window.location.reload(); // Refresh dashboard to show new canvas
            }
        } catch (err) {
            alert('Action Failed');
        }
    };

    if (loading) return null;
    if (invitations.length === 0) return null;

    return (
        <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                    <Bell size={20} />
                </div>
                <h2 className="text-2xl font-black tracking-tight">Pending Invitations</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitations.map((inv) => (
                    <div key={inv._id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-between h-48 border-l-4 border-l-indigo-500 animate-in slide-in-from-left-4">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                        <Layout size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Collaboration Request</span>
                                </div>
                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-wider">{inv.role}</span>
                            </div>
                            <h3 className="text-lg font-black text-slate-800 line-clamp-1 mb-1">{inv.canvas.name}</h3>
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold">
                                <User size={12} />
                                <span>From @{inv.sender.username}</span>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-slate-50">
                            <button 
                                onClick={() => handleAction(inv._id, 'accept')}
                                className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95"
                            >
                                <Check size={14} strokeWidth={3} /> Accept
                            </button>
                            <button 
                                onClick={() => handleAction(inv._id, 'reject')}
                                className="px-4 bg-slate-50 text-slate-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                            >
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InvitationsList;
