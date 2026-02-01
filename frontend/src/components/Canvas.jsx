export default function Canvas({ children }) {
  return (
    <div className="flex-1 bg-canvas-grid rounded-lg overflow-hidden relative shadow-inner">
      {/* Canvas content placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (
          <div className="text-muted-foreground/30 text-lg font-medium select-none">
            Start drawing...
          </div>
        )}
      </div>
    </div>
  );
}
