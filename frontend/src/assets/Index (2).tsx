import { useState } from 'react';
import MenuBar from '@/components/drawspace/MenuBar';
import Toolbar from '@/components/drawspace/Toolbar';
import LayerPanel from '@/components/drawspace/LayerPanel';
import Canvas from '@/components/drawspace/Canvas';
import StatusBar from '@/components/drawspace/StatusBar';

const Index = () => {
  const [activeTool, setActiveTool] = useState('draw');
  const [activeLayer, setActiveLayer] = useState('sketch-layer');
  const [layers, setLayers] = useState([
    { id: 'layer-1', name: 'Layer 1', visible: true, type: 'layer' as const },
    { id: 'layer-2', name: 'Layer 2', visible: true, type: 'layer' as const },
    { id: 'sketch-layer', name: 'Sketch Layer', visible: true, type: 'sketch' as const },
    { id: 'background', name: 'Background', visible: false, locked: true, type: 'background' as const },
  ]);

  const handleLayerVisibilityToggle = (id: string) => {
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
      type: 'layer' as const,
    };
    setLayers(prev => [newLayer, ...prev.filter(l => l.type !== 'background'), prev.find(l => l.type === 'background')!]);
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col">
      {/* Main Container with rounded corners */}
      <div className="flex-1 flex flex-col bg-card rounded-xl shadow-2xl overflow-hidden border border-border/30">
        {/* Menu Bar */}
        <MenuBar />

        {/* Main Content Area */}
        <div className="flex-1 flex p-4 gap-4 relative">
          {/* Left Toolbar */}
          <div className="absolute left-4 top-4 z-10">
            <Toolbar activeTool={activeTool} onToolChange={setActiveTool} />
          </div>

          {/* Canvas Area */}
          <div className="flex-1 ml-32 mr-60">
            <Canvas />
          </div>

          {/* Right Panel - Layers */}
          <div className="absolute right-4 top-4 z-10">
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

export default Index;
