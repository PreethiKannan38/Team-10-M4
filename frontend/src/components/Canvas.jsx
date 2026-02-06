import { useEffect, useRef } from 'react';
import { CanvasEngineController } from '../Engine/CanvasEngineController';

export default function Canvas({ canvasEngineRef, activeTool, brushColor, brushSize, brushOpacity, fontFamily, eraserStrength, userRole, activeLayer, fillEnabled, gridOpacity, canvasId }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !canvasId) return;

    const resizeCanvas = () => {
      const { width, height } = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      if (canvasEngineRef?.current) {
        canvasEngineRef.current.render();
      }
    };

    const engine = new CanvasEngineController(canvasRef.current, containerRef.current, canvasId);
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
      fontFamily: fontFamily
    });

    engine.setEraserStrength(eraserStrength);
    engine.setUserRole(userRole || 'editor');
    engine.setTool(activeTool || 'draw');

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      engine.destroy();
    };
  }, [canvasId]);

  useEffect(() => {
    if (canvasEngineRef?.current && (brushColor || brushSize || brushOpacity !== undefined || fontFamily)) {
      canvasEngineRef.current.setBrushOptions({
        color: brushColor,
        width: brushSize,
        opacity: brushOpacity / 100,
        fontFamily: fontFamily
      });
    }
  }, [brushColor, brushSize, brushOpacity, fontFamily, canvasEngineRef]);

  useEffect(() => {
    if (canvasEngineRef?.current && eraserStrength !== undefined) {
      canvasEngineRef.current.setEraserStrength(eraserStrength);
    }
  }, [eraserStrength, canvasEngineRef]);

  useEffect(() => {
    if (canvasEngineRef?.current && userRole !== undefined) {
      canvasEngineRef.current.setUserRole(userRole);
    }
  }, [userRole, canvasEngineRef]);

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

  useEffect(() => {
    if (canvasEngineRef?.current && gridOpacity !== undefined) {
      canvasEngineRef.current.setGridOpacity(gridOpacity / 100);
    }
  }, [gridOpacity, canvasEngineRef]);

  return (
    <div ref={containerRef} className="w-full h-full bg-white">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair block" />
    </div>
  );
}
