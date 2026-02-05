import { useState } from 'react'
import {
  Pencil,MousePointer2,Eraser,Square,Circle,Type,PaintBucket,Move,PenTool,Triangle,Hexagon,
  Undo2,Redo2,Trash2,Download,Brush
} from 'lucide-react'

const toolGroups = [
  {
    id: 'selection',
    color: '#6B7A99',
    popup: true,
    groupIcon: MousePointer2,
    tools: [
      { id: 'select', icon: MousePointer2 },
      { id: 'move', icon: Move }
    ]
  },
  {
    id: 'drawing',
    color: '#7C6AF2',
    popup: true,
    groupIcon: Brush,
    tools: [
      { id: 'draw', icon: PenTool },
      { id: 'pencil', icon: Pencil }
    ]
  },
  {
    id: 'shapes',
    color: '#444A5A',
    popup: true,
    groupIcon: Hexagon,
    tools: [
      { id: 'rectangle', icon: Square },
      { id: 'circle', icon: Circle },
      { id: 'triangle', icon: Triangle },
      { id: 'polygon', icon: Hexagon }
    ]
  },
  {
    id: 'utility',
    color: '#444A5A',
    popup: false,
    tools: [
      { id: 'fill', icon: PaintBucket },
      { id: 'text', icon: Type }
    ]
  },
  {
    id: 'destructive',
    color: '#F26D6D',
    popup: false,
    tools: [
      { id: 'eraser', icon: Eraser },
      { id: 'clear', icon: Trash2 }
    ]
  },
  {
    id: 'editing',
    color: '#444A5A',
    popup: false,
    tools: [
      { id: 'undo', icon: Undo2 },
      { id: 'redo', icon: Redo2 },
      { id: 'export', icon: Download }
    ]
  }
]

export default function Toolbar({ activeTool, onToolChange, onAction }) {
  const [openPopup, setOpenPopup] = useState(null)

  const togglePopup = (id) => {
    setOpenPopup(prev => (prev === id ? null : id))
  }

  const handleToolClick = (tool) => {
    const isAction = ['undo', 'redo', 'clear', 'export'].includes(tool.id)
    if (isAction) onAction?.(tool.id)
    else onToolChange(tool.id)
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-[3rem]
                    w-16 p-3 py-8
                    flex flex-col items-center gap-2
                    border border-slate-200 shadow-2xl
                    relative ">

      {toolGroups.map((group, i) => {
        const isOpen = openPopup === group.id

        return (
          <div key={group.id} className="relative flex flex-col items-center w-full">
            {i > 0 && <div className="w-12 h-[1px] bg-slate-100 my-2" />}

            {/* POPUP TOGGLE */}
            {group.popup && (
              <button
                onClick={() => togglePopup(group.id)}
                className={`w-12 h-12 border rounded-2xl
                  flex items-center justify-center
                  transition-all active:scale-90
                  ${isOpen
                    ? 'bg-slate-200 text-slate-700'
                    : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {(() => {
                  const GroupIcon = group.groupIcon
                  return <GroupIcon className="w-6 h-6" />
                })()}
              </button>
            )}

            {/* SIDE POPUP */}
            {group.popup && isOpen && (
              <div
                className="absolute left-16 top-0
                           bg-white rounded-2xl p-2
                           flex flex-col gap-2
                           shadow-2xl border border-slate-200 z-50 ml-2"
              >
                {group.tools.map((tool) => {
                  const Icon = tool.icon
                  const isActive = activeTool === tool.id

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className={`w-14 h-14 rounded-2xl
                        flex items-center justify-center
                        transition-all active:scale-90
                        ${isActive
                          ? 'text-white'
                          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                        }`}
                      style={isActive ? { backgroundColor: group.color } : {}}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  )
                })}
              </div>
            )}

            {/* NON-POPUP TOOLS */}
            {!group.popup && (
              <div className="flex flex-col gap-2">
                {group.tools.map((tool) => {
                  const Icon = tool.icon
                  const isActive = activeTool === tool.id

                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleToolClick(tool)}
                      className={`w-12 h-12 rounded-2xl
                                 flex items-center justify-center
                                 transition-all active:scale-90
                                 ${isActive 
                                   ? 'bg-indigo-600 text-white' 
                                   : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                      <Icon className="w-6 h-6" />
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}