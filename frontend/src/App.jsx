import { useState, useRef } from 'react';
import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import Canvas from './components/Canvas';

const App = () => {
  const [activeTool, setActiveTool] = useState('draw');
  const [activeLayer, setActiveLayer] = useState('sketch-layer');
  const canvasEngineRef = useRef(null);
  const [layers, setLayers] = useState([
    { id: 'layer-1', name: 'Layer 1', visible: true, type: 'layer' },
    { id: 'layer-2', name: 'Layer 2', visible: true, type: 'layer' },
    { id: 'sketch-layer', name: 'Sketch Layer', visible: true, type: 'sketch' },
    { id: 'background', name: 'Background', visible: false, locked: true, type: 'background' },
  ]);

  const handleLayerVisibilityToggle = (id) => {
    setLayers(prev => 
      prev.map(layer => 
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      )
    );
  };

  const handleAddLayer = () => {
    const newLayer = {
      id: `layer-${Date.now()}`,
      name: `Layer ${layers.filter(l => l.type === 'layer').length + 1}`,
      visible: true,
      type: 'layer',
    };
    setLayers(prev => [newLayer, ...prev.filter(l => l.type !== 'background'), prev.find(l => l.type === 'background')]);
  };

  const handleToolChange = (tool) => {
    setActiveTool(tool);
    if (canvasEngineRef.current) {
      if (tool === 'draw') canvasEngineRef.current.setDraw();
      else if (tool === 'select') canvasEngineRef.current.setSelect();
      else if (tool === 'eraser') canvasEngineRef.current.setEraser();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Menu Bar - Fixed at top */}
      <MenuBar />

      {/* Main Content Area */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Toolbar - Floating */}
        <div className="absolute left-6 top-6 z-30">
          <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
        </div>

        {/* Canvas Area - Center Focus */}
        <div className="flex-1 px-48 py-8">
          <Canvas 
            canvasEngineRef={canvasEngineRef}
            activeTool={activeTool}
          />
        </div>

        {/* Right Panel - Layers */}
        <div className="absolute right-6 top-6 z-20">
          <LayerPanel
            layers={layers}
            activeLayer={activeLayer}
            onLayerSelect={setActiveLayer}
            onLayerVisibilityToggle={handleLayerVisibilityToggle}
            onAddLayer={handleAddLayer}
          />
        </div>
      </div>
    </div>
  );
};

export default App;