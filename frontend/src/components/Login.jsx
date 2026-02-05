import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await axios.post('http://localhost:5001/api/auth/login', formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.05]">
                <div className="absolute top-[-10%] left-[-5%] w-[50%] h-[50%] bg-indigo-600 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-purple-600 blur-[150px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-[2rem] rotate-45 mb-6 shadow-xl shadow-indigo-100">
                        <div className="w-6 h-6 bg-white/30 rounded-md -rotate-45" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">DesignDeck</h1>
                    <p className="text-slate-500 font-medium">Sign in to your creative workspace</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-indigo-50 border border-slate-50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 animate-in fade-in zoom-in duration-300">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="your@email.com"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-slate-700 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-14 pr-6 text-slate-700 font-bold placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-xs shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                <>
                                    Sign In
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-50 text-center text-sm font-medium text-slate-400">
                        New here? <Link to="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">Create account</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
