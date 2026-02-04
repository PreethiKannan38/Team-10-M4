import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Github } from 'lucide-react';

export default function LoginPage({ onLogin, onSwitchToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    // For now, any non-empty email/password works
    onLogin();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFC] flex items-center justify-center p-6 font-sans">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 blur-[100px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-10 relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center rotate-45 mb-6 shadow-lg">
            <div className="w-5 h-5 bg-white/30 rounded-sm -rotate-45"></div>
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Log in to continue to DesignDeck</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          {error && (
            <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 mb-2">
              {error}
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="email" 
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm font-medium"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 bg-purple-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700 transition-all active:scale-95 mt-4"
          >
            Login to Workspace
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-4">Or continue with</span>
          </div>
        </div>

        <button className="w-full py-4 border border-slate-200 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95 mb-8">
          <Github className="w-5 h-5" />
          <span className="text-sm">Github</span>
        </button>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToSignup}
            className="text-purple-600 font-bold hover:underline"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
