import { motion } from 'framer-motion';
import { PenTool, Layers, Sparkles, Share2, MousePointer2, ArrowRight } from 'lucide-react';

export default function LandingPage({ onGetStarted }) {
  return (
    <div className="min-h-screen bg-[#FAFAFC] overflow-hidden font-sans text-slate-800">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -60, 0],
            y: [0, -40, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 blur-[120px] rounded-full" 
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center rotate-45 shadow-lg">
            <div className="w-3.5 h-3.5 bg-white/30 rounded-sm -rotate-45"></div>
          </div>
          <span className="font-black text-lg text-slate-900 tracking-[0.2em] uppercase">
            DesignDeck
          </span>
        </div>
        <div className="hidden md:flex items-center gap-10 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <a href="#" className="hover:text-purple-600 transition-colors">Features</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Showcase</a>
          <a href="#" className="hover:text-purple-600 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onGetStarted('login')}
            className="px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
          >
            Login
          </button>
          <button 
            onClick={() => onGetStarted('signup')}
            className="px-6 py-2.5 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all shadow-lg active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-8"
        >
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">
            AI-Powered Design Experience
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]"
        >
          Design at the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
            Speed of Thought.
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-2xl text-lg text-slate-500 leading-relaxed mb-12"
        >
          The next-generation creative suite for designers. 
          Unleash your creativity with a professional-grade canvas, 
          AI-assisted tools, and real-time collaboration.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 mb-20"
        >
          <button 
            onClick={() => onGetStarted('signup')}
            className="group px-10 py-5 bg-purple-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-[0_10px_30px_rgba(139,92,246,0.3)] hover:bg-purple-700 transition-all hover:-translate-y-1 active:scale-95"
          >
            Start Designing Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button className="px-10 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all hover:-translate-y-1 active:scale-95 shadow-sm">
            Watch Demo
          </button>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10">
          {[
            { icon: PenTool, title: "Precision Tools", desc: "Pixel-perfect drawing tools designed for professionals." },
            { icon: Sparkles, title: "AI Magic", desc: "Generate assets and refine strokes with smart AI assistance." },
            { icon: Share2, title: "Collaboration", desc: "Work together in real-time with team members worldwide." }
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * idx }}
              className="p-8 bg-white/50 backdrop-blur-sm border border-slate-100 rounded-[2rem] text-left hover:border-purple-200 transition-colors"
            >
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                <feature.icon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-widest text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Floating UI Elements for decoration */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute top-[40%] left-[5%] p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 z-10"
      >
        <div className="flex gap-2 mb-3">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <div className="w-2 h-2 rounded-full bg-yellow-400" />
          <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
        <div className="w-32 h-2 bg-slate-100 rounded-full mb-2" />
        <div className="w-20 h-2 bg-slate-100 rounded-full" />
      </motion.div>

      <motion.div 
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="hidden lg:block absolute bottom-[20%] right-[5%] p-6 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-10"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="w-24 h-2 bg-slate-100 rounded-full mb-2" />
            <div className="w-16 h-2 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="w-full aspect-square bg-slate-50 rounded-lg" />
          <div className="w-full aspect-square bg-slate-50 rounded-lg" />
          <div className="w-full aspect-square bg-slate-50 rounded-lg" />
        </div>
      </motion.div>
    </div>
  );
}
