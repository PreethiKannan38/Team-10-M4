import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, MousePointer2, Zap, Layout, Save, LogOut, CheckCircle2 } from 'lucide-react';

const LandingPage = () => {
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-[#FAFAFC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-700">
            {/* Minimal Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center rotate-3 shadow-md shadow-indigo-100">
                            <div className="w-3 h-3 bg-white/40 rounded-sm -rotate-3" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-800">Design Deck</span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        {token ? (
                            <button onClick={handleLogout} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 transition-colors flex items-center gap-2">
                                <LogOut size={14} />
                                Logout
                            </button>
                        ) : (
                            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
                                Sign In
                            </Link>
                        )}
                        <Link 
                            to={token ? "/dashboard" : "/login"} 
                            className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                        >
                            {token ? 'Dashboard' : 'Start Here'}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-tight">
                        Collaborate. Draw. Design — <br/>
                        <span className="text-indigo-600">Together in Real Time.</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
                        A shared canvas for teams and students to work together instantly, from anywhere.
                    </p>
                    <Link 
                        to={token ? "/dashboard" : "/login"} 
                        className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl text-lg font-black tracking-wide hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 hover:-translate-y-1 group"
                    >
                        Start Here
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                </div>
            </section>

            {/* Visual Preview Section */}
            <section className="px-6 pb-20">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08)] border border-slate-100 p-3 relative overflow-hidden group">
                        {/* Simulated Canvas Preview */}
                        <div className="bg-slate-50 rounded-[2rem] aspect-video flex items-center justify-center border border-slate-100 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                            
                            {/* Visual Illustration: Collaborative Elements */}
                            <div className="relative w-full h-full flex items-center justify-center scale-90 md:scale-100">
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-100 border-2 border-indigo-200 rounded-3xl rotate-12 flex items-center justify-center text-indigo-400">
                                    <Layout size={40} />
                                </div>
                                <div className="absolute bottom-1/3 right-1/4 w-40 h-24 bg-purple-100 border-2 border-purple-200 rounded-full -rotate-6" />
                                <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-amber-100 border-2 border-amber-200 rounded-2xl rotate-45" />
                                
                                {/* Simulated Cursors */}
                                <div className="absolute top-[40%] left-[45%] flex flex-col items-center animate-bounce" style={{ animationDuration: '3s' }}>
                                    <MousePointer2 className="text-indigo-600 fill-indigo-600" size={24} />
                                    <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">Alex</span>
                                </div>
                                <div className="absolute bottom-[30%] left-[35%] flex flex-col items-center animate-pulse">
                                    <MousePointer2 className="text-purple-500 fill-purple-500" size={24} />
                                    <span className="bg-purple-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">Mia</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features (What it does) */}
            <section className="py-20 bg-white border-y border-slate-100 px-6">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                        <p className="text-lg font-bold text-slate-700 leading-tight">Real-time collaboration on a shared canvas</p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Layout size={20} />
                        </div>
                        <p className="text-lg font-bold text-slate-700 leading-tight">Simple drawing, shapes, and text tools</p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <MousePointer2 size={20} />
                        </div>
                        <p className="text-lg font-bold text-slate-700 leading-tight">Instantly join or create sessions</p>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                            <Save size={20} />
                        </div>
                        <p className="text-lg font-bold text-slate-700 leading-tight">Your work is saved automatically</p>
                    </div>
                </div>
            </section>

            {/* How It Works (Simple Flow) */}
            <section className="py-32 px-6">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-16">Simple to Start</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: '1', title: 'Sign in to Design Deck', desc: 'Securely access your personal workspace.' },
                            { step: '2', title: 'Start or join a canvas', desc: 'Create a new room or jump into an existing one.' },
                            { step: '3', title: 'Collaborate live with others', desc: 'Draw, brainstorm, and work in sync.' }
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center text-xl font-black mx-auto mb-6 shadow-xl shadow-slate-200">
                                    {item.step}
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-slate-800">{item.title}</h3>
                                <p className="text-sm text-slate-400 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto bg-indigo-600 rounded-[3rem] p-12 text-center text-white shadow-2xl shadow-indigo-200">
                    <h2 className="text-3xl md:text-4xl font-black mb-4">Start collaborating in seconds.</h2>
                    <p className="text-indigo-100 font-medium mb-10 opacity-80">No complex setup. Just you and your team.</p>
                    <Link 
                        to={token ? "/dashboard" : "/login"} 
                        className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-5 rounded-2xl text-lg font-black tracking-wide hover:bg-slate-50 transition-all shadow-xl hover:-translate-y-1 group"
                    >
                        Start Here
                        <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                </div>
            </section>

            {/* Minimal Footer */}
            <footer className="py-12 border-t border-slate-100 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                    © 2026 Design Deck Team • Software Engineering Project
                </p>
            </footer>
        </div>
    );
};

export default LandingPage;