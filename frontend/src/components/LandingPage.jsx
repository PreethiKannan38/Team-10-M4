import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MousePointer2, Users2, Shield, Zap, ArrowRight, Layout, Palette, Share2, LogOut } from 'lucide-react';

const LandingPage = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center rotate-45 shadow-lg shadow-indigo-100">
                            <div className="w-4 h-4 bg-white/30 rounded-sm -rotate-45" />
                        </div>
                        <span className="text-2xl font-black tracking-tight uppercase cursor-pointer" onClick={() => navigate('/')}>DesignDeck</span>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest">
                        <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
                        <a href="#collaboration" className="hover:text-indigo-600 transition-colors">Collaboration</a>
                    </div>

                    <div className="flex items-center gap-4">
                        {token ? (
                            <>
                                <button onClick={handleLogout} className="text-sm font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-colors px-4 py-2 flex items-center gap-2">
                                    <LogOut size={16} />
                                    Logout
                                </button>
                                <Link to="/dashboard" className="bg-indigo-600 text-white text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-0.5">
                                    Dashboard
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors px-4 py-2">
                                    Login
                                </Link>
                                <Link to="/register" className="bg-slate-900 text-white text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 hover:shadow-indigo-100 hover:-translate-y-0.5">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 overflow-hidden">
                    <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-indigo-100 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-purple-100 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <div className="max-w-5xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-600">v1.0 is now live</span>
                    </div>

                    <h1 className="text-7xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        Design together, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">without limits.</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        The world's most powerful collaborative digital canvas. Draw, wireframe, and prototype with your team in real-time.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        {token ? (
                            <Link to="/dashboard" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-3xl text-lg font-black tracking-wide hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 flex items-center justify-center gap-3 group">
                                Go to My Dashboard
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <Link to="/register" className="w-full sm:w-auto bg-indigo-600 text-white px-10 py-5 rounded-3xl text-lg font-black tracking-wide hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 flex items-center justify-center gap-3 group">
                                Start Creating for Free
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        )}
                        <button className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-10 py-5 rounded-3xl text-lg font-black tracking-wide hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                            Watch Demo
                        </button>
                    </div>
                </div>

                {/* Hero App Preview */}
                <div className="max-w-6xl mx-auto mt-24 relative animate-in fade-in zoom-in duration-1000 delay-500">
                    <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 p-4 relative overflow-hidden">
                        <div className="bg-slate-50 rounded-[2.2rem] aspect-video flex items-center justify-center border border-slate-100 overflow-hidden">
                             <div className="grid grid-cols-4 gap-8 opacity-20">
                                {[...Array(16)].map((_, i) => (
                                    <div key={i} className="w-24 h-24 bg-indigo-500 rounded-2xl rotate-45" />
                                ))}
                             </div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Palette size={120} className="text-indigo-600 animate-bounce" />
                             </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">Built for creators</h2>
                        <p className="text-slate-500 font-medium">Everything you need to bring your ideas to life.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Zap />, title: 'Real-time Sync', desc: 'Experience lightning fast synchronization across all devices.' },
                            { icon: <Users2 />, title: 'Multiplayer', desc: 'Work simultaneously with your entire team on a single canvas.' },
                            { icon: <Shield />, title: 'Secure', desc: 'Your work is encrypted and backed up automatically to our cloud.' }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group">
                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-black mb-4">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center rotate-45">
                            <div className="w-3 h-3 bg-white/30 rounded-sm -rotate-45" />
                        </div>
                        <span className="text-xl font-black tracking-tight uppercase">DesignDeck</span>
                    </div>
                    <div className="flex items-center gap-8 text-xs font-black uppercase tracking-widest text-slate-400">
                        <a href="#" className="hover:text-indigo-600">Privacy</a>
                        <a href="#" className="hover:text-indigo-600">Terms</a>
                        <a href="#" className="hover:text-indigo-600">Twitter</a>
                    </div>
                    <p className="text-xs font-bold text-slate-400">© 2026 DesignDeck Team. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
