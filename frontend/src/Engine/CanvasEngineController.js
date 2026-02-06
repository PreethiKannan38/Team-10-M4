/**
 * CanvasEngineController.js
 * 
 * Central hub for the drawing application. Manages all state, tool interactions,
 * rendering, and scene management through a deterministic, state-driven architecture.
 * Integrated with Yjs for real-time synchronization.
 */

import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { SceneManager } from './managers/SceneManager';
import { LayerManager } from './managers/LayerManager';
import { HistoryManager, RemoveObjectCommand } from './managers/HistoryManager';
import { CoordinateMapper } from './utils/CoordinateMapper';
import { BoundsCalculation } from './utils/BoundsCalculation';
import ToolManager from './ToolManager';

export class CanvasEngineController {
  constructor(canvas, container, roomId = 'drawing-room') {
    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');

    // === YJS INITIALIZATION ===
    this.doc = new Y.Doc();
    this.provider = new WebsocketProvider('ws://localhost:5001', roomId, this.doc);

    this.provider.on('status', event => {
      console.log('Yjs WebSocket Status:', event.status);
    });

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
        fontFamily: 'Inter, sans-serif',
        smoothing: 0.4,
        hardness: 1.0,
      },
      zoom: 1.0,
      pan: { x: 0, y: 0 },
      activeLayerId: null,
      fillEnabled: false,
      eraserStrength: 100, // Default to 100% (Full delete)
      gridOpacity: 0.15,
      userRole: 'editor', // Default to editor to prevent lockout
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

    // Wait for sync before initializing
    this.provider.on('sync', (isSynced) => {
      if (isSynced) {
        console.log('[Yjs] Provider Synced');

        // Wait a bit for the full state to arrive and be processed
        setTimeout(() => {
          const layerCount = this.yLayers.length;
          const objectCount = this.yObjects.size;

          console.log(`[Yjs] Initial Sync State: ${layerCount} layers, ${objectCount} objects`);

          if (layerCount === 0) {
            console.log('[Yjs] No existing layers found, creating default layer');
            this.createDefaultLayer();
          } else {
            console.log('[Yjs] Existing state found, syncing to engine');
            this.syncFromYjs();
          }
        }, 800);
      }
    });

    this.isAnimationRunning = false;
    this.startRenderLoop();

    // Feedback Indicator State
    this.feedbackTimeout = null;
    this.feedbackActive = false;
  }

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
    try {
      let layers = this.yLayers.toArray();
      const objects = this.yObjects.toJSON();

      // SELF-HEALING: If we have objects but 0 layers, we are in a broken state.
      // Force create a default layer to "rescue" the objects.
      if (layers.length === 0 && Object.keys(objects).length > 0) {
        console.warn('[Engine] Healing: Objects exist but 0 layers. Creating rescue layer.');
        this.createDefaultLayer();
        layers = this.yLayers.toArray();
      }

      this.sceneManager.objects = objects;
      this.layerManager.layers = layers;

      const order = [];
      let orphanedCount = 0;

      layers.forEach(layer => {
        if (layer && layer.objects) {
          order.push(...layer.objects);
        }
      });

      // Check for orphans (objects not in any layer)
      Object.keys(objects).forEach(id => {
        if (!order.includes(id)) orphanedCount++;
      });

      if (orphanedCount > 0 && layers.length > 0) {
        console.log(`[Engine] Found ${orphanedCount} orphaned objects. Re-linking...`);
        this.rescueOrphans(layers[0].id);
        return; // The rescue will trigger another sync
      }

      this.sceneManager.objectOrder = order;

      if (layers.length > 0) {
        if (!this.state.activeLayerId || !layers.find(l => l.id === this.state.activeLayerId)) {
          this.state.activeLayerId = layers[0].id;
        }
      }
      this.render();
    } catch (e) {
      console.error('Sync Error:', e);
    }
  }

  rescueOrphans(layerId) {
    this.doc.transact(() => {
      const layers = this.yLayers.toArray();
      const idx = layers.findIndex(l => l.id === layerId);
      if (idx === -1) return;

      const layer = this.yLayers.get(idx);
      const objects = this.yObjects.toJSON();
      const allPlacedIds = [];
      layers.forEach(l => allPlacedIds.push(...l.objects));

      const orphans = Object.keys(objects).filter(id => !allPlacedIds.includes(id));
      if (orphans.length > 0) {
        const updatedLayer = { ...layer, objects: [...layer.objects, ...orphans] };
        this.yLayers.delete(idx);
        this.yLayers.insert(idx, [updatedLayer]);
        console.log(`[Engine] Successfully rescued ${orphans.length} objects into ${layerId}`);
      }
    });
  }

  createDefaultLayer() {
    const layerId = 'default-layer'; // Standardized ID
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
      // Check if it already exists before pushing
      const exists = this.yLayers.toArray().some(l => l.id === layerId);
      if (!exists && this.yLayers.length === 0) {
        this.yLayers.push([defaultLayer]);
        this.state.activeLayerId = layerId;
      }
    });

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
    if (this.state.userRole === 'viewer') {
        console.warn('[Engine] Blocked: Viewers cannot add objects.');
        return null;
    }
    const id = object.id || ((crypto && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2));

    // We'll determine the layer inside the transaction to ensure atomicity
    this.doc.transact(() => {
      let layers = this.yLayers.toArray();

      // 1. Ensure at least one layer exists
      if (layers.length === 0) {
        console.log('[Engine] No layers found during addObject. Creating default...');
        this.createDefaultLayer();
        layers = this.yLayers.toArray();
      }

      // 2. Determine layer
      let layerId = object.layerId || this.state.activeLayerId;
      let layerIndex = layers.findIndex(l => l.id === layerId);

      if (layerIndex === -1) {
        console.warn(`[Engine] Target layer ${layerId} missing. Falling back.`);
        layerId = layers[0].id;
        layerIndex = 0;
      }

      // 3. Create the object
      const bounds = this._calculateBounds(object.type, object.geometry, object.style);
      const obj = {
        ...object,
        id,
        layerId,
        visible: true,
        style: {
          color: object.style?.color || '#217BF4',
          width: object.style?.width || 5,
          opacity: object.style?.opacity || 1.0,
          fillColor: object.style?.fillColor || 'transparent',
          fontFamily: object.style?.fontFamily || 'Inter, sans-serif',
          fontSize: object.style?.fontSize || 24,
        },
        bounds,
      };

      // 4. Update shared state
      this.yObjects.set(id, obj);

      const layer = this.yLayers.get(layerIndex);
      if (!layer.objects.includes(id)) {
        const updatedLayer = { ...layer, objects: [...layer.objects, id] };
        this.yLayers.delete(layerIndex);
        this.yLayers.insert(layerIndex, [updatedLayer]);
        console.log(`[Engine] Object ${id} confirmed on layer ${layerId}`);
      }
    });

    this.syncFromYjs();
    return this.yObjects.get(id);
  }

  exportToImage() {
    const link = document.createElement('a');
    link.download = `drawspace-${Date.now()}.png`;
    link.href = this.canvas.toDataURL('image/png');
    link.click();
  }

  removeObject(objectId) {
    if (this.state.userRole === 'viewer') {
        console.warn('[Engine] Blocked: Viewers cannot remove objects.');
        return;
    }
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
    if (this.state.userRole === 'viewer') {
        console.warn('[Engine] Blocked: Viewers cannot update objects.');
        return;
    }
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
      case 'text': return { x: geometry.x, y: geometry.y, width: geometry.width || 200, height: geometry.height || 100 };
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

  setEraserStrength(strength) {
    this.state.eraserStrength = strength;
    this.dispatchStateChange('eraserStrength', strength);
  }

  setGridOpacity(opacity) {
    this.state.gridOpacity = opacity;
    this.render();
  }

  setUserRole(role) {
    this.state.userRole = role;
    this.dispatchStateChange('userRole', role);
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
    if (this.state.userRole === 'viewer') return;
    
    if (event.button === 1 || this.spacePressed) {
      this.state.isPanning = true;
      this.state.lastMousePos = { x: event.clientX, y: event.clientY };
      return;
    }

    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    this.state.isDrawing = true;
    if (this.currentTool) {
        this.currentTool.onPointerDown({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
    }
  }

  onPointerMove(event) {
    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    this.pointerX = coords.x;
    this.pointerY = coords.y;

    if (this.state.isPanning) {
      const dx = event.clientX - this.state.lastMousePos.x;
      const dy = event.clientY - this.state.lastMousePos.y;
      this.state.pan.x += dx;
      this.state.pan.y += dy;
      this.state.lastMousePos = { x: event.clientX, y: event.clientY };
      this.render();
      return;
    }

    if (this.state.userRole === 'viewer') return;

    if (this.currentTool) {
        this.currentTool.onPointerMove({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
    }
  }

  onPointerUp(event) {
    this.state.isPanning = false;
    this.state.isDrawing = false;
    if (this.state.userRole === 'viewer') return;
    
    const coords = this.screenToCanvasCoords(event.clientX, event.clientY);
    if (this.currentTool) {
        this.currentTool.onPointerUp({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
    }
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
      this.ctx.fillStyle = style?.color || '#000000';
      const fontSize = style?.fontSize || 24;
      const fontFamily = style?.fontFamily || 'Inter, sans-serif';
      this.ctx.font = `${fontSize}px ${fontFamily}`;
      this.ctx.textBaseline = 'top';
      
      this._renderWrappedText(
        geometry.text, 
        geometry.x, 
        geometry.y, 
        geometry.width || 200, 
        fontSize * 1.2
      );
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

  _renderWrappedText(text, x, y, maxWidth, lineHeight) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    let testY = y;
    const safeMaxWidth = Math.max(maxWidth, 20); // Prevent zero-width crashes

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = this.ctx.measureText(testLine);
      if (metrics.width > safeMaxWidth && n > 0) {
        this.ctx.fillText(line, x, testY);
        line = words[n] + ' ';
        testY += lineHeight;
      } else {
        line = testLine;
      }
    }
    this.ctx.fillText(line, x, testY);
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
    if (this.state.userRole === 'viewer') {
        console.warn('[Engine] Action blocked: Viewers cannot modify the canvas.');
        return;
    }
    this.historyManager.executeCommand(command);
  }

  undo() { this.historyManager.undo(); }
  redo() { this.historyManager.redo(); }

  setupPointerListeners() {
    this.canvas.addEventListener('pointerdown', e => this.onPointerDown(e));
    this.canvas.addEventListener('pointermove', e => this.onPointerMove(e));
    this.canvas.addEventListener('pointerup', e => this.onPointerUp(e));
    this.canvas.addEventListener('pointerleave', e => this.onPointerUp(e));

    this.canvas.addEventListener('dblclick', (e) => {
      const coords = this.screenToCanvasCoords(e.clientX, e.clientY);
      const objects = this.sceneManager.getObjectsAtPoint(coords.x, coords.y);
      if (objects.length > 0) {
        const target = objects[objects.length - 1];
        if (target.type === 'text') {
          this.setTool('text');
          if (this.currentTool && this.currentTool.startEditingExisting) {
            this.currentTool.startEditingExisting(target, e.clientX, e.clientY, this);
          }
          return;
        }
      }
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
      
      // Delete selected object
      if ((e.key === 'Delete' || e.key === 'Backspace') && this.state.selectedObjectId && !this.state.isTyping) {
        e.preventDefault();
        this.executeCommand(new RemoveObjectCommand(this, this.state.selectedObjectId));
        this.state.selectedObjectId = null;
        this.dispatchStateChange('selection', null);
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { 
        if (this.state.userRole !== 'viewer') {
            e.preventDefault(); 
            this.undo(); 
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) { 
        if (this.state.userRole !== 'viewer') {
            e.preventDefault(); 
            this.redo(); 
        }
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
    this.provider.disconnect();
    this.doc.destroy();
  }
}

export default CanvasEngineController;