import { useEffect, useRef } from 'react';
import { CanvasEngineController } from '../Engine/CanvasEngineController';

export default function Canvas({ canvasEngineRef, activeTool, brushColor, brushSize, brushOpacity, activeLayer, fillEnabled }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const resizeCanvas = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      if (canvasEngineRef?.current) {
        canvasEngineRef.current.render();
      }
    };

    const engine = new CanvasEngineController(canvasRef.current, containerRef.current);
    if (canvasEngineRef) canvasEngineRef.current = engine;

    const handleWheel = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY;
        const factor = delta > 0 ? 1.1 : 0.9;
        engine.setZoom(engine.state.zoom * factor, e.clientX, e.clientY);
      }
    };

    canvasRef.current.addEventListener('wheel', handleWheel, { passive: false });
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    engine.setBrushOptions({
      color: brushColor,
      width: brushSize,
      opacity: brushOpacity / 100,
    });

    engine.setTool(activeTool || 'draw');

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.destroy();
    };
  }, []);

  useEffect(() => {
    if (canvasEngineRef?.current && (brushColor || brushSize || brushOpacity !== undefined)) {
      canvasEngineRef.current.setBrushOptions({
        color: brushColor,
        width: brushSize,
        opacity: brushOpacity / 100,
      });
    }
  }, [brushColor, brushSize, brushOpacity, canvasEngineRef]);

  useEffect(() => {
    if (canvasEngineRef?.current && activeTool) {
      canvasEngineRef.current.setTool(activeTool);
    }
  }, [activeTool, canvasEngineRef]);

  useEffect(() => {
    if (canvasEngineRef?.current && activeLayer) {
      canvasEngineRef.current.setActiveLayer(activeLayer);
    }
  }, [activeLayer, canvasEngineRef]);

  useEffect(() => {
    if (canvasEngineRef?.current) {
      canvasEngineRef.current.setFillEnabled(fillEnabled);
    }
  }, [fillEnabled, canvasEngineRef]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#181B21]">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />
    </div>
  );
}
