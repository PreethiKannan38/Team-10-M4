import { useEffect, useRef, useState } from 'react'
import svgPaths from './ui/icons'
import { ICONS } from './ui/iconMap'
import { initCanvas } from './Engine/canvasEngine'

export default function App() {
  const canvasRef = useRef(null)
  const engineRef = useRef(null)

  const [tool, setTool] = useState('draw')
  const [isToolbarExpanded, setIsToolbarExpanded] = useState(false)

  // init canvas engine once
  useEffect(() => {
    if (!canvasRef.current) return
    engineRef.current = initCanvas(canvasRef.current)
  }, [])

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col">

      {/* Top Bar */}
      <div className="h-12 flex items-center justify-between px-4 bg-[#C0F3B7] border-b-2 border-blue-500 shrink-0">
        <div className="flex gap-3">
          <button className="w-9 h-9 flex items-center justify-center" title="Undo">
            <svg className="w-9 h-9" viewBox="0 0 48 48">
              <path d={svgPaths.p2c48f680} fill="#1D1B20" />
            </svg>
          </button>

          <button className="w-9 h-9 flex items-center justify-center" title="Redo">
            <svg className="w-9 h-9" viewBox="0 0 48 48">
              <path d={svgPaths.p80a8100} fill="#1D1B20" />
            </svg>
          </button>
        </div>

        <button className="w-9 h-9 flex items-center justify-center" title="Menu">
          <svg className="w-9 h-9" viewBox="0 0 48 48">
            <path d={svgPaths.p2fc48b00} fill="#1D1B20" />
          </svg>
        </button>
      </div>

      {/* Canvas Area */}
      <div className="relative flex-1 bg-white">
  <canvas
    ref={canvasRef}
    className="absolute left-1/2 top-1/2
               -translate-x-1/2 -translate-y-1/2
               w-[calc(100%-5rem)] h-[calc(100%-5rem)]
               border-2 border-gray-300"
  />

        {/* Bottom Floating Toolbar */}
{/* Bottom Floating Toolbar */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
  <div
    className={`
      flex items-center shadow-lg overflow-hidden
      transition-all duration-300 ease-out

      ${isToolbarExpanded
        ? 'bg-[#D8FFD2]/70 px-3 py-3 rounded-full w-[180px]'
        : 'w-14 h-14'
      }
    `}
  >

    {/* DRAW (always visible) */}
    <button
      onClick={() => {
        setTool('draw')
        setIsToolbarExpanded(v => !v)
        engineRef.current?.setDraw()
      }}
      className={`
        w-10 h-10 flex items-center justify-center
        rounded-full shrink-0 transition-colors
        ${tool === 'draw' ? 'bg-[#C0F3B7]' : 'bg-white'}
      `}
    >
      D
    </button>

    {/* EXPANDABLE TOOLS */}
    <div
      className={`
        flex items-center gap-3 transition-all duration-300
        ${isToolbarExpanded
          ? 'opacity-100 ml-3'
          : 'opacity-0 ml-0 pointer-events-none'
        }
      `}
    >
      {/* ERASER */}
      <button
        onClick={() => {
          setTool('eraser')
          setIsToolbarExpanded(false)
          engineRef.current?.setEraser()
        }}
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          ${tool === 'eraser' ? 'bg-[#C0F3B7]' : 'bg-white'}
        `}
      >
        E
      </button>

      {/* SELECT */}
      <button
        onClick={() => {
          setTool('select')
          setIsToolbarExpanded(false)
          engineRef.current?.setSelect()
        }}
        className={`
          w-10 h-10 rounded-full
          flex items-center justify-center
          ${tool === 'select' ? 'bg-[#C0F3B7]' : 'bg-white'}
        `}
      >
        S
      </button>
    </div>
  </div>
</div>


      </div>
    </div>
  )
}
/*-----------------helper-----------------*/
export function Icon({ icon, className }) {
  return (
    <svg
      className={className}
      viewBox={icon.viewBox}
      fill="none"
    >
      {icon.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="currentColor"
        />
      ))}
    </svg>
  )
}


