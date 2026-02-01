import { useEffect, useRef } from 'react';
import { initCanvas } from '../Engine/canvasEngine';

export default function Canvas({ canvasEngineRef, activeTool }) {
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
  // Empty dependency array intentional - canvas should only initialize once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-full rounded-xl overflow-hidden relative shadow-xl" style={{
      backgroundColor: '#ffffff',
      backgroundImage: `
        linear-gradient(0deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
        linear-gradient(90deg, rgba(200, 200, 200, 0.1) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        style={{ display: 'block' }}
      />
    </div>
  );
}
