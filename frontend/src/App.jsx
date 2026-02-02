import { useRef, useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import Footer from './components/Footer';
import Canvas from './components/Canvas';

export default function App() {
  const canvasEngineRef = useRef(null);
  const [activeTool, setActiveTool] = useState('draw');
  const [brushColor, setBrushColor] = useState('#8b5cf6');
  const [brushSize, setBrushSize] = useState(5);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [isToolbarOpen, setIsToolbarOpen] = useState(false);
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

  return (
    <div className="w-screen h-screen bg-[#050505] flex flex-col overflow-hidden font-sans text-white relative">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600 blur-[150px] rounded-full" />
      </div>

      {/* Top Bar - Marginally longer height for better usability */}
      <div className="h-20 flex-shrink-0 relative z-50">
        <TopBar onClear={clearCanvas} />
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Toolbar Toggle Button (Left Edge) */}
        <button
          onClick={() => setIsToolbarOpen(!isToolbarOpen)}
          className={`absolute top-1/2 -translate-y-1/2 z-50 w-6 h-24 glass-panel border-l-0 rounded-r-2xl flex items-center justify-center text-white/40 hover:text-white transition-all duration-500 ease-spring ${isToolbarOpen ? 'left-[120px]' : 'left-0'}`}
        >
          <div className={`transition-transform duration-500 ${isToolbarOpen ? 'rotate-180' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </div>
        </button>

        {/* Vertical Left Toolbar - Collapsible */}
        <aside 
          className={`z-40 px-6 py-8 transition-all duration-500 ease-spring ${isToolbarOpen ? 'translate-x-0 opacity-100' : 'translate-x-[-150px] opacity-0 pointer-events-none'}`}
        >
          <Toolbar activeTool={activeTool} onToolChange={setActiveTool} onAction={handleAction} />
        </aside>

        {/* Main Canvas Workspace */}
        <main className="flex-1 relative flex items-center justify-center p-4">
          <div className="w-full h-full glass-panel rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] border-white/[0.03]">
            <Canvas
              canvasEngineRef={canvasEngineRef}
              activeTool={activeTool}
              brushColor={brushColor}
              brushSize={brushSize}
              brushOpacity={brushOpacity}
              activeLayer={activeLayer}
              fillEnabled={fillEnabled}
            />
          </div>

          {/* Properties Toggle Button (Right Edge) */}
          <button
            onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
            className={`absolute top-1/2 -translate-y-1/2 z-50 w-6 h-24 glass-panel border-r-0 rounded-l-2xl flex items-center justify-center text-white/40 hover:text-white transition-all duration-500 ease-spring ${isPropertiesOpen ? 'right-[320px]' : 'right-0'}`}
          >
            <div className={`transition-transform duration-500 ${isPropertiesOpen ? '' : 'rotate-180'}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>

          {/* Floating Properties Panel (Hides to the right) */}
          <div className={`absolute top-6 bottom-6 right-6 z-40 transition-all duration-500 ease-spring ${isPropertiesOpen ? 'translate-x-0 opacity-100' : 'translate-x-[360px] opacity-0 pointer-events-none'}`}>
            <Footer
              brushColor={brushColor}
              strokeWidth={brushSize}
              strokeOpacity={brushOpacity}
              onBrushColorChange={setBrushColor}
              onStrokeWidthChange={setBrushSize}
              onStrokeOpacityChange={setBrushOpacity}
              fillEnabled={fillEnabled}
              onFillToggle={() => setFillOn(!fillEnabled)}
            />
          </div>
        </main>
      </div>

      {/* Modern Footer Control Strip */}
      <footer className="h-12 glass-panel border-t-0 border-white/5 flex items-center justify-between px-8 text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <span>Tool</span>
            <span className="text-purple-400">{activeTool}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Size</span>
            <span className="text-purple-400">{brushSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Fill</span>
            <span className={fillEnabled ? 'text-green-400' : 'text-red-400'}>{fillEnabled ? 'On' : 'Off'}</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span>Zoom 100%</span>
          <div className="w-[1px] h-3 bg-white/10" />
          <span>1920 x 1080</span>
        </div>
      </footer>
    </div>
  );
}

  