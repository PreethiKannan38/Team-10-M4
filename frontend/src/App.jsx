import { useState, useRef } from 'react';
import MenuBar from './components/MenuBar';
import Toolbar from './components/Toolbar';
import LayerPanel from './components/LayerPanel';
import Canvas from './components/Canvas';
import StatusBar from './components/StatusBar';
import ToolOptionsPanel from './components/ToolOptionsPanel';

const App = () => {
  const [activeTool, setActiveTool] = useState('draw');
  const [activeLayer, setActiveLayer] = useState('sketch-layer');
  const [brushSize, setBrushSize] = useState(5);
  const [opacity, setOpacity] = useState(100);
  const [color, setColor] = useState('#000000');
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
      else if (tool === 'line') canvasEngineRef.current.setLine();
      else if (tool === 'rectangle') canvasEngineRef.current.setRectangle();
      else if (tool === 'circle') canvasEngineRef.current.setCircle();
      else if (tool === 'fill') canvasEngineRef.current.setFill();
      else if (tool === 'text') canvasEngineRef.current.setText();
      else if (tool === 'eyedropper') {
        canvasEngineRef.current.setEyedropper((pickedColor) => {
          setColor(pickedColor);
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Main Container */}
      <div className="flex-1 flex flex-col bg-card shadow-2xl overflow-hidden">
        {/* Menu Bar */}
        <MenuBar />

        {/* Main Content Area */}
        <div className="flex-1 flex relative">
          {/* Left Toolbar */}
          <div className="absolute left-4 top-4 z-30">
            <Toolbar activeTool={activeTool} onToolChange={handleToolChange} />
          </div>

          {/* Tool Options Panel - Below Toolbar with dynamic spacing */}
          <div className="absolute left-4 top-[300px] z-20">
            <ToolOptionsPanel
              activeTool={activeTool}
              brushSize={brushSize}
              opacity={opacity}
              color={color}
              onBrushSizeChange={setBrushSize}
              onOpacityChange={setOpacity}
              onColorChange={setColor}
            />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 px-40 py-6">
            <Canvas 
              canvasEngineRef={canvasEngineRef}
              activeTool={activeTool}
              brushSize={brushSize}
              opacity={opacity}
              color={color}
            />
          </div>

          {/* Right Panel - Layers */}
          <div className="absolute right-4 top-4 z-20">
            <LayerPanel
              layers={layers}
              activeLayer={activeLayer}
              onLayerSelect={setActiveLayer}
              onLayerVisibilityToggle={handleLayerVisibilityToggle}
              onAddLayer={handleAddLayer}
            />
          </div>
        </div>

        {/* Status Bar */}
        <StatusBar zoom={100} cursorX={512} cursorY={384} isConnected={true} totalElements={7} />
      </div>
    </div>
  );
};

export default App;



