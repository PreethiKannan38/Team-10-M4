import React, { useState, useEffect } from 'react';
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, Layers, 
  GripVertical, MousePointer2, Square, Circle, Type, Pencil, Share2
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- ICONS MAPPING ---
const TYPE_ICONS = {
  stroke: Pencil,
  pencil: Pencil,
  draw: Pencil,
  rectangle: Square,
  circle: Circle,
  text: Type,
  line: Share2,
  arrow: Share2,
};

// --- SORTABLE ITEM COMPONENT ---
function SortableLayerItem({ 
  id, 
  object, 
  isSelected, 
  onSelect, 
  onToggleVisibility, 
  onToggleLock, 
  onDelete, 
  onDuplicate,
  onRename
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(object.name || object.type || 'Layer');

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const Icon = TYPE_ICONS[object.type] || Square;

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onRename(id, editValue);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditValue(object.name || object.type);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(id)}
      className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 border-l-4 ${
        isSelected 
          ? 'bg-[#0d99ff]/10 border-[#0d99ff]' 
          : 'bg-[#2a2a2a] border-transparent hover:bg-[#333]'
      } ${object.locked ? 'opacity-50' : ''}`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        className="text-[#444] hover:text-[#888] cursor-grab active:cursor-grabbing"
      >
        <GripVertical size={14} />
      </div>

      {/* Type Icon */}
      <div className={`${isSelected ? 'text-[#0d99ff]' : 'text-slate-400'}`}>
        <Icon size={14} />
      </div>

      {/* Name / Input */}
      <div className="flex-1 min-w-0" onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <input
            autoFocus
            className="w-full bg-[#1e1e1e] text-white text-[11px] font-medium border border-[#0d99ff] rounded px-1 outline-none"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={() => {
              onRename(id, editValue);
              setIsEditing(false);
            }}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className={`text-[11px] font-medium truncate block ${isSelected ? 'text-white' : 'text-slate-300'}`}>
            {object.name || object.type || 'Layer'}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onDuplicate(id); }}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
          title="Duplicate"
        >
          <Copy size={12} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(id); }}
          className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400"
          title="Delete"
        >
          <Trash2 size={12} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleLock(id); }}
          className={`p-1 hover:bg-white/10 rounded ${object.locked ? 'text-[#0d99ff]' : 'text-slate-400 hover:text-white'}`}
          title={object.locked ? "Unlock" : "Lock"}
        >
          {object.locked ? <Lock size={12} /> : <Unlock size={12} />}
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleVisibility(id); }}
          className={`p-1 hover:bg-white/10 rounded ${!object.visible ? 'text-slate-600' : 'text-slate-400 hover:text-white'}`}
          title={object.visible ? "Hide" : "Show"}
        >
          {object.visible ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      </div>
    </div>
  );
}

// --- MAIN PANEL COMPONENT ---
export default function LayerPanel({ engine }) {
  const [layers, setLayers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (!engine) return;

    const handleSceneUpdate = (e) => {
      const { objects, objectOrder } = e.detail;
      // Figma-style: Top in list is front on canvas
      const orderedLayers = [...objectOrder].reverse().map(id => objects[id]).filter(Boolean);
      setLayers(orderedLayers);
    };

    const handleSelectionChange = (e) => {
      const { key, value } = e.detail;
      if (key === 'selection') {
        setSelectedId(value);
      }
    };

    window.addEventListener('engineStateChange', handleSceneUpdate);
    window.addEventListener('engineStateChange', handleSelectionChange);

    // Initial load
    if (engine.sceneManager) {
      const initialLayers = [...engine.sceneManager.objectOrder].reverse()
        .map(id => engine.sceneManager.objects[id])
        .filter(Boolean);
      setLayers(initialLayers);
      setSelectedId(engine.state.selectedObjectId);
    }

    return () => {
      window.removeEventListener('engineStateChange', handleSceneUpdate);
      window.removeEventListener('engineStateChange', handleSelectionChange);
    };
  }, [engine]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = layers.findIndex(l => l.id === active.id);
      const newIndex = layers.findIndex(l => l.id === over.id);
      
      const newLayers = arrayMove(layers, oldIndex, newIndex);
      // Convert back to engine order (reverse)
      const engineOrder = [...newLayers].reverse().map(l => l.id);
      engine.reorderObjects(engineOrder);
    }
  };

  const handleSelect = (id) => {
    if (engine) {
      engine.setSelectionAwareness([id]);
    }
  };

  if (!engine) return null;

  return (
    <div className="w-[240px] h-full bg-[#1e1e1e] border-l border-white/5 flex flex-col overflow-hidden select-none">
      {/* Header */}
      <div className="h-12 flex items-center px-4 border-b border-white/5 gap-3">
        <Layers size={14} className="text-[#0d99ff]" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Layers</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={layers.map(l => l.id)}
            strategy={verticalListSortingStrategy}
          >
            {layers.map((layer) => (
              <SortableLayerItem
                key={layer.id}
                id={layer.id}
                object={layer}
                isSelected={selectedId === layer.id}
                onSelect={handleSelect}
                onToggleVisibility={(id) => engine.toggleObjectVisibility(id)}
                onToggleLock={(id) => engine.toggleObjectLock(id)}
                onDelete={(id) => engine.removeObject(id)}
                onDuplicate={(id) => engine.duplicateObject(id)}
                onRename={(id, name) => engine.renameObject(id, name)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {layers.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 opacity-20">
            <Layers size={32} className="mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No Layers</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/5 bg-[#1a1a1a]">
        <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-slate-500">
          <span>{layers.length} Elements</span>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-[#0d99ff] opacity-40"></div>
             <div className="w-1 h-1 rounded-full bg-[#0d99ff] opacity-40"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
