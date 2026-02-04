import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import Footer from './components/Footer';
import Canvas from './components/Canvas';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const canvasEngineRef = useRef(null);
  const [activeTool, setActiveTool] = useState('draw');
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [gridOpacity, setGridOpacity] = useState(30);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(true);
  const [fillEnabled, setFillOn] = useState(false);

  const [layers] = useState([
    { id: 'layer-1', name: 'Layer 1', visible: true },
    { id: 'layer-2', name: 'Layer 2', visible: true },
    { id: 'sketch', name: 'Sketch', visible: true },
  ]);

  const [activeLayer, setActiveLayer] = useState('sketch');

  const clearCanvas = () => {
    if (canvasEngineRef.current) canvasEngineRef.current.clearAll();
  };

  const handleAction = (actionId) => {
    if (!canvasEngineRef.current) return;
    
    switch (actionId) {
      case 'undo':
        canvasEngineRef.current.undo();
        break;
      case 'redo':
        canvasEngineRef.current.redo();
        break;
      case 'clear':
        clearCanvas();
        break;
      case 'export':
        canvasEngineRef.current.exportToImage();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const handleStateChange = (e) => {
      const { key, value } = e.detail;
      if (key === 'brushOptions') {
        if (value.color) setBrushColor(value.color);
        if (value.width) setBrushSize(value.width);
        if (value.opacity) setBrushOpacity(Math.round(value.opacity * 100));
      }
      if (key === 'tool') setActiveTool(value);
    };
    window.addEventListener('engineStateChange', handleStateChange);
    return () => window.removeEventListener('engineStateChange', handleStateChange);
  }, []);

  const handleToolChange = (tool) => {
    setActiveTool(tool);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onGetStarted={(page) => setCurrentPage(page)} />;
      case 'login':
        return (
          <LoginPage 
            onLogin={() => setCurrentPage('dashboard')} 
            onSwitchToSignup={() => setCurrentPage('signup')} 
          />
        );
      case 'signup':
        return (
          <SignupPage 
            onSignup={() => setCurrentPage('dashboard')} 
            onSwitchToLogin={() => setCurrentPage('login')} 
          />
        );
      case 'dashboard':
        return (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-screen h-screen bg-[#FAFAFC] flex flex-col overflow-hidden font-sans text-slate-800 relative"
          >
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.03]">
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-[#7C6AF2] blur-[180px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#6B7A99] blur-[180px] rounded-full" />
            </div>

            {/* Top Bar */}
            <div className="h-20 flex-shrink-0 relative z-50">
              <TopBar onClear={clearCanvas} onLogout={() => setCurrentPage('landing')} />
            </div>

            <div className="flex-1 flex overflow-hidden relative">
              
              {/* Toolbar Toggle Button */}
              <button
                onClick={() => setIsToolbarOpen(!isToolbarOpen)}
                className={`absolute top-1/2 -translate-y-1/2 z-50 w-8 h-32 bg-white/80 backdrop-blur-md border border-slate-200 border-l-0 rounded-r-2xl flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-xl transition-all duration-500 ease-spring ${isToolbarOpen ? 'left-[120px]' : 'left-0'}`}
              >
                <motion.div animate={{ rotate: isToolbarOpen ? 0 : 180 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </motion.div>
              </button>

              {/* Vertical Left Toolbar */}
              <aside 
                className={`absolute top-0 bottom-0 left-0 z-40 px-6 py-8 flex items-center transition-all duration-500 ease-spring ${isToolbarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[-150px] opacity-0 pointer-events-none'}`}
              >
                <Toolbar activeTool={activeTool} onToolChange={handleToolChange} onAction={handleAction} />
              </aside>

              {/* Main Canvas Workspace */}
              <main className="flex-1 relative flex items-center justify-center">
                <div className="w-full h-full bg-[#FAFAFC] overflow-hidden border-none">
                  <Canvas
                    canvasEngineRef={canvasEngineRef}
                    activeTool={activeTool}
                    brushColor={brushColor}
                    brushSize={brushSize}
                    brushOpacity={brushOpacity}
                    activeLayer={activeLayer}
                    fillEnabled={fillEnabled}
                    gridOpacity={gridOpacity}
                  />
                </div>
              </main>
            </div>

            {/* Modern Footer Control Strip */}
            <footer className="h-12 border-t border-slate-200 flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 z-50 bg-white">
              <div className="flex items-center gap-10">
                <div className="flex items-center gap-3">
                  <span>Tool</span>
                  <span className="text-purple-600">{activeTool}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Size</span>
                  <span className="text-purple-600">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>Fill</span>
                  <span className={fillEnabled ? 'text-green-600' : 'text-red-600'}>{fillEnabled ? 'On' : 'Off'}</span>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span>Zoom 100%</span>
                <div className="w-[1px] h-3 bg-slate-200" />
                <span>1920 x 1080</span>
              </div>
            </footer>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderPage()}
      </motion.div>
    </AnimatePresence>
  );
}

  