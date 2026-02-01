import { useEffect, useRef } from 'react';
import { initCanvas } from '../Engine/canvasEngine';

export default function Canvas({ canvasEngineRef, activeTool, brushSize, opacity, color }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = initCanvas(canvasRef.current);
    if (canvasEngineRef) {
      canvasEngineRef.current = engine;
    }

    // Set initial tool
    if (activeTool === 'draw') engine.setDraw();
    else if (activeTool === 'select') engine.setSelect();
    else if (activeTool === 'eraser') engine.setEraser();

    return () => {
      // Cleanup if needed
    };
  }, []);

  useEffect(() => {
    // Update draw tool options when they change
    if (canvasEngineRef?.current?.setDrawOptions) {
      canvasEngineRef.current.setDrawOptions({
        color: color,
        width: brushSize,
        opacity: opacity / 100,
      });
    }
  }, [brushSize, opacity, color, canvasEngineRef]);

  return (
    <div className="h-full bg-canvas-grid rounded-xl overflow-hidden relative shadow-lg border border-border/10">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
    </div>
  );
}
