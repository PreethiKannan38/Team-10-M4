/**
 * CanvasEngineController.js
 * 
 * Central hub for the drawing application. Manages all state, tool interactions,
 * rendering, and scene management through a deterministic, state-driven architecture.
 * Integrated with Yjs for real-time synchronization.
 */

import * as Y from 'yjs';
import { SceneManager } from './managers/SceneManager';
import { LayerManager } from './managers/LayerManager';
import { HistoryManager } from './managers/HistoryManager';
import { CoordinateMapper } from './utils/CoordinateMapper';
import { BoundsCalculation } from './utils/BoundsCalculation';
import ToolManager from './ToolManager';

export class CanvasEngineController {
  constructor(canvas, container) {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');

    // === YJS INITIALIZATION ===
    this.doc = new Y.Doc();
    
    this.yObjects = this.doc.getMap('objects');
    this.yLayers = this.doc.getArray('layers');

    // === CORE STATE ===
    this.state = {
      activeTool: 'draw',
      isDrawing: false,
      isPanning: false,
      lastMousePos: { x: 0, y: 0 },
      selectedObjectId: null,
      brushOptions: {
        color: '#217BF4',
        width: 5,
        opacity: 1.0,
        smoothing: 0.4,
        hardness: 1.0,
      },
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      activeLayerId: null,
      fillEnabled: false,
      gridOpacity: 0.15,
    };

    // === MANAGER INITIALIZATION ===
    this.sceneManager = new SceneManager();
    this.layerManager = new LayerManager();
    this.historyManager = new HistoryManager();
    this.coordinateMapper = new CoordinateMapper(canvas);
    this.toolManager = new ToolManager();

    this.currentTool = null;
    this.toolState = {};

    this.setupPointerListeners();
    this.setupWindowListeners();
    this.setupYjsListeners();

    // Initial local initialization
    if (this.yLayers.length === 0) {
      this.createDefaultLayer();
    } else {
      this.syncFromYjs();
    }

    this.isAnimationRunning = false;
    this.startRenderLoop();

    // Feedback Indicator State
    this.feedbackTimeout = null;
    this.feedbackActive = false;
  }

  /**
   * Show on-canvas feedback for brush size/opacity changes
   */
  showFeedback() {
    this.feedbackActive = true;
    if (this.feedbackTimeout) clearTimeout(this.feedbackTimeout);
    this.feedbackTimeout = setTimeout(() => {
      this.feedbackActive = false;
    }, 1500);
  }

  setupYjsListeners() {
    this.yObjects.observe(() => {
      this.syncFromYjs();
    });
    this.yLayers.observe(() => {
      this.syncFromYjs();
    });
  }

  syncFromYjs() {
    const objects = this.yObjects.toJSON();
    this.sceneManager.objects = objects;

    const layers = this.yLayers.toJSON();
    this.layerManager.layers = layers;

    const order = [];
    layers.forEach(layer => {
      if (layer.objects) order.push(...layer.objects);
    });
    this.sceneManager.objectOrder = order;

    if (layers.length > 0) {
      if (!this.state.activeLayerId || !layers.find(l => l.id === this.state.activeLayerId)) {
        this.state.activeLayerId = layers[0].id;
      }
    }
    this.render();
  }

  createDefaultLayer() {
    const layerId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    const defaultLayer = {
      id: layerId,
      name: 'Background',
      visible: true,
      locked: false,
      opacity: 1.0,
      objects: [],
      metadata: {},
    };

    this.doc.transact(() => {
      this.yLayers.push([defaultLayer]);
    });

    this.state.activeLayerId = layerId;
    this.syncFromYjs();
  }

  // --- PUBLIC API ---

  setTool(toolType) {
    if (this.currentTool && typeof this.currentTool.onDeactivate === 'function') {
      this.currentTool.onDeactivate();
    }
    this.state.activeTool = toolType;
    this.currentTool = this.toolManager.setActiveTool(toolType, this);
    this.dispatchStateChange('tool', toolType);
  }

  setBrushOptions(options) {
    this.state.brushOptions = { ...this.state.brushOptions, ...options };
    this.dispatchStateChange('brushOptions', this.state.brushOptions);
    this.showFeedback();
  }

  getBrushOptions() {
    return { ...this.state.brushOptions };
  }

  addObject(object) {
    const id = object.id || ((crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2));
    const layerId = object.layerId || this.state.activeLayerId;

    // Calculate bounds before saving for selection support
    const bounds = this._calculateBounds(object.type, object.geometry, object.style);

    const obj = {
      ...object,
      id,
      layerId,
      visible: object.visible !== undefined ? object.visible : true,
      locked: object.locked !== undefined ? object.locked : false,
      style: {
        color: object.style?.color || '#217BF4',
        width: object.style?.width || 5,
        opacity: object.style?.opacity || 1.0,
        fillColor: object.style?.fillColor || 'transparent',
        ...object.style,
      },
      bounds,
      metadata: object.metadata || {},
    };

    this.doc.transact(() => {
      this.yObjects.set(id, obj);
      const layers = this.yLayers.toArray();
      const layerIndex = layers.findIndex(l => l.id === layerId);
      if (layerIndex !== -1) {
        const layer = this.yLayers.get(layerIndex);
        if (!layer.objects.includes(id)) {
          const updatedLayer = { ...layer, objects: [...layer.objects, id] };
          this.yLayers.delete(layerIndex);
          this.yLayers.insert(layerIndex, [updatedLayer]);
        }
      }
    });

    // Immediate local sync to ensure objects are instantly selectable
    this.syncFromYjs();
    return obj;
  }

  exportToImage() {
    const link = document.createElement('a');
    link.download = `drawspace-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  removeObject(objectId) {
    const obj = this.yObjects.get(objectId);
    if (!obj) return;

    this.doc.transact(() => {
      this.yObjects.delete(objectId);
      const layers = this.yLayers.toArray();
      const layerIndex = layers.findIndex(l => l.id === obj.layerId);
      if (layerIndex !== -1) {
        const layer = this.yLayers.get(layerIndex);
        const updatedLayer = { ...layer, objects: layer.objects.filter(id => id !== objectId) };
        this.yLayers.delete(layerIndex);
        this.yLayers.insert(layerIndex, [updatedLayer]);
      }
    });
  }

  updateObject(objectId, updates) {
    const obj = this.yObjects.get(objectId);
    if (!obj) return;

    // Recalculate bounds if geometry or style changes
    let bounds = obj.bounds;
    if (updates.geometry || updates.style) {
      bounds = this._calculateBounds(
        updates.type || obj.type,
        updates.geometry || obj.geometry,
        updates.style || obj.style
      );
    }

    this.doc.transact(() => {
      this.yObjects.set(objectId, { ...obj, ...updates, bounds });
    });
    this.syncFromYjs();
  }

  _calculateBounds(type, geometry, style) {
    const sw = style?.width || 1;
    switch (type) {
      case 'stroke': return BoundsCalculation.strokeBounds(geometry.points, sw);
      case 'line': return BoundsCalculation.lineBounds(geometry.x1, geometry.y1, geometry.x2, geometry.y2, sw);
      case 'arrow': return BoundsCalculation.lineBounds(geometry.x1, geometry.y1, geometry.x2, geometry.y2, sw + 10);
      case 'rectangle': return BoundsCalculation.rectBounds(geometry.x, geometry.y, geometry.width, geometry.height, sw);
      case 'circle': return BoundsCalculation.circleBounds(geometry.cx, geometry.cy, geometry.radius, sw);
      case 'triangle': return BoundsCalculation.strokeBounds(geometry.points, sw);
      case 'polygon': return BoundsCalculation.strokeBounds(geometry.points, sw);
      default: return null;
    }
  }

  clearAll() {
    this.doc.transact(() => {
      // 1. Wipe all objects
      this.yObjects.clear();

      // 2. Clear object IDs from all layers
      const layers = this.yLayers.toJSON();
      this.yLayers.delete(0, this.yLayers.length);
      const clearedLayers = layers.map(l => ({ ...l, objects: [] }));
      this.yLayers.insert(0, clearedLayers);
    });
    this.syncFromYjs();
  }

  getObject(objectId) {
    return this.yObjects.get(objectId) || null;
  }

  setActiveLayer(layerId) {
    this.state.activeLayerId = layerId;
    this.dispatchStateChange('activeLayer', layerId);
  }

  setFillEnabled(enabled) {
    this.state.fillEnabled = enabled;
    this.dispatchStateChange('fillEnabled', enabled);
  }

  setGridOpacity(opacity) {
    this.state.gridOpacity = opacity;
    this.render();
  }

  /**
   * Set zoom level centered on a specific point
   */
  setZoom(zoomLevel, centerX, centerY) {
    const oldZoom = this.state.zoom;
    const newZoom = Math.max(0.1, Math.min(10.0, zoomLevel));

    if (!centerX || !centerY) {
      this.state.zoom = newZoom;
    } else {
      // Zoom centered on point (e.g. cursor)
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = centerX - rect.left;
      const mouseY = centerY - rect.top;

      // Adjust pan to keep centered
      this.state.pan.x = mouseX - (mouseX - this.state.pan.x) * (newZoom / oldZoom);
      this.state.pan.y = mouseY - (mouseY - this.state.pan.y) * (newZoom / oldZoom);
      this.state.zoom = newZoom;
    }

    this.dispatchStateChange('zoom', this.state.zoom);
    this.render();
  }

  // --- EVENTS ---

  onPointerDown(event) {
    // Handle Middle Mouse or Spacebar+LeftClick for panning
    if (event.button === 1 || this.spacePressed) {
      this.state.isPanning = true;
      this.state.lastMousePos = { x: event.clientX, y: event.clientY };
      return;
    }

    if (!this.currentTool) return;
    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    this.state.isDrawing = true;
    this.currentTool.onPointerDown({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
  }

  onPointerMove(event) {
    if (this.state.isPanning) {
      const dx = event.clientX - this.state.lastMousePos.x;
      const dy = event.clientY - this.state.lastMousePos.y;
      
      this.state.pan.x += dx;
      this.state.pan.y += dy;
      
      this.state.lastMousePos = { x: event.clientX, y: event.clientY };
      this.render();
      return;
    }

    if (!this.currentTool) return;
    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    this.pointerX = coords.x;
    this.pointerY = coords.y;
    this.currentTool.onPointerMove({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
  }

  onPointerUp(event) {
    this.state.isPanning = false;
    if (!this.currentTool) return;
    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    this.state.isDrawing = false;
    this.currentTool.onPointerUp({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
  }

  screenToCanvasCoords(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (screenX - rect.left - this.state.pan.x) / this.state.zoom,
      y: (screenY - rect.top - this.state.pan.y) / this.state.zoom,
    };
  }

  // --- RENDERING ---

  render() {
    if (!this.ctx) return;
    
    // Figma-inspired soft neutral background
    this.ctx.fillStyle = '#FAFAFC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(this.state.pan.x, this.state.pan.y);
    this.ctx.scale(this.state.zoom, this.state.zoom);

    // Dynamic grid that fades based on zoom level
    this.renderGrid();

    const layers = this.yLayers.toArray();
    layers.forEach(layer => {
      if (!layer.visible) return;
      layer.objects.forEach(id => {
        const obj = this.yObjects.get(id);
        if (obj && obj.visible) this.renderObject(obj);
      });
    });

    if (this.currentTool && this.currentTool.renderPreview) {
      this.currentTool.renderPreview(this.ctx, this);
    }
    this.ctx.restore();

    // Render On-Canvas Feedback (Fixed Screen Space)
    if (this.feedbackActive) {
      this.renderFeedback();
    }
  }

  renderGrid() {
    const gridSize = 50;
    
    // Base opacity from user setting (0-1)
    const baseOpacity = this.state.gridOpacity;
    if (baseOpacity <= 0) return;

    // Fade out smoothly while zooming in, more visible when zooming out
    const zoomFactor = Math.min(1, 1 / this.state.zoom);
    const finalOpacity = baseOpacity * 0.8 * zoomFactor; // Increased multiplier significantly
    
    const startX = Math.floor(-this.state.pan.x / this.state.zoom / gridSize) * gridSize;
    const startY = Math.floor(-this.state.pan.y / this.state.zoom / gridSize) * gridSize;
    const endX = startX + (this.canvas.width / this.state.zoom) + gridSize;
    const endY = startY + (this.canvas.height / this.state.zoom) + gridSize;

    this.ctx.strokeStyle = `rgba(148, 163, 184, ${finalOpacity})`; // Even darker slate gray #94A3B8 for better visibility
    this.ctx.lineWidth = 1 / this.state.zoom;
    
    this.ctx.beginPath();
    // Vertical lines
    for (let x = startX; x < endX; x += gridSize) {
      this.ctx.moveTo(x, startY);
      this.ctx.lineTo(x, endY);
    }
    
    // Horizontal lines
    for (let y = startY; y < endY; y += gridSize) {
      this.ctx.moveTo(startX, y);
      this.ctx.lineTo(endX, y);
    }
    this.ctx.stroke();
  }

  renderFeedback() {
    const { width, opacity } = this.state.brushOptions;
    const x = this.canvas.width / 2;
    const y = this.canvas.height - 150;

    this.ctx.save();
    this.ctx.font = 'bold 12px Inter';
    this.ctx.textAlign = 'center';

    // Size Indicator
    this.ctx.fillStyle = 'rgba(139, 92, 246, 0.8)';
    this.ctx.beginPath();
    this.ctx.arc(x, y, width / 2, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = 'white';
    this.ctx.fillText(`${width}px • ${Math.round(opacity * 100)}%`, x, y + width / 2 + 20);
    this.ctx.restore();
  }

  renderObject(obj) {
    const { type, geometry, style, id } = obj;
    if (!geometry) return;

    const isSelected = this.state.selectedObjectId === id;
    
    this.ctx.globalAlpha = style?.opacity || 1.0;
    this.ctx.strokeStyle = isSelected ? '#2563EB' : (style?.color || '#000000');
    this.ctx.lineWidth = isSelected ? (style?.width || 1) + 2 : (style?.width || 1);
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.fillStyle = style?.fillColor || 'transparent';

    this.ctx.beginPath();
    if (type === 'stroke' && geometry.points) {
      this.ctx.moveTo(geometry.points[0].x, geometry.points[0].y);
      geometry.points.forEach(p => this.ctx.lineTo(p.x, p.y));
      this.ctx.stroke();
    } else if (type === 'line') {
      this.ctx.moveTo(geometry.x1, geometry.y1);
      this.ctx.lineTo(geometry.x2, geometry.y2);
      this.ctx.stroke();
    } else if (type === 'arrow') {
      this._renderArrow(geometry);
    } else if (type === 'rectangle') {
      this.ctx.rect(geometry.x, geometry.y, geometry.width, geometry.height);
      this._finalizeShape(style);
    } else if (type === 'circle') {
      this.ctx.arc(geometry.cx, geometry.cy, geometry.radius, 0, Math.PI * 2);
      this._finalizeShape(style);
    } else if (type === 'triangle') {
      this._renderPolygon(geometry.points);
      this._finalizeShape(style);
    } else if (type === 'polygon') {
      this._renderPolygon(geometry.points);
      this._finalizeShape(style);
    } else if (type === 'text') {
      this.ctx.font = `${style.fontSize || 16}px ${style.fontFamily || 'Arial'}`;
      this.ctx.fillText(geometry.text, geometry.x, geometry.y);
    }

    // Draw a bounding box for selected items for extra clarity
    if (isSelected && obj.bounds) {
      this.ctx.save();
      this.ctx.strokeStyle = '#2563EB';
      this.ctx.lineWidth = 1 / this.state.zoom;
      this.ctx.setLineDash([5, 5]);
      this.ctx.strokeRect(obj.bounds.x - 4, obj.bounds.y - 4, obj.bounds.w + 8, obj.bounds.h + 8);
      this.ctx.restore();
    }

    this.ctx.globalAlpha = 1.0;
  }

  _finalizeShape(style) {
    if (style.fillColor && style.fillColor !== 'transparent') {
      this.ctx.fill();
    }
    this.ctx.stroke();
  }

  _renderPolygon(points) {
    if (!points || points.length < 3) return;
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.closePath();
  }

  _renderArrow(geo) {
    const { x1, y1, x2, y2 } = geo;
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const headLen = 15;
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
    this.ctx.stroke();
  }

  // --- UTILS ---

  executeCommand(command) {
    this.historyManager.executeCommand(command);
  }

  undo() { this.historyManager.undo(); }
  redo() { this.historyManager.redo(); }

  setupPointerListeners() {
    this.canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.canvas.addEventListener('pointermove', e => this.onPointerMove(e));
    this.canvas.addEventListener('pointerup', e => this.onPointerUp(e));
    this.canvas.addEventListener('pointerleave', e => this.onPointerUp(e));
    
    // Double click to reset view or toggle pan (optional, but let's add move tool toggle)
    this.canvas.addEventListener('dblclick', () => {
      this.setTool('move');
    });
  }

  setupWindowListeners() {
    this.spacePressed = false;
    window.addEventListener('keydown', e => {
      if (e.code === 'Space') {
        this.spacePressed = true;
        this.canvas.style.cursor = 'grab';
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) { e.preventDefault(); this.redo(); }

      // Pass keyboard events to current tool
      if (this.currentTool && typeof this.currentTool.onKeyDown === 'function') {
        this.currentTool.onKeyDown(e, this);
      }
    });

    window.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.spacePressed = false;
        this.canvas.style.cursor = 'crosshair';
      }
    });
  }

  startRenderLoop() {
    this.isAnimationRunning = true;
    const loop = () => {
      this.render();
      if (this.isAnimationRunning) requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  dispatchStateChange(key, value) {
    window.dispatchEvent(new CustomEvent('engineStateChange', { detail: { key, value } }));
  }

  destroy() {
    this.isAnimationRunning = false;
    this.doc.destroy();
  }
}

export default CanvasEngineController;