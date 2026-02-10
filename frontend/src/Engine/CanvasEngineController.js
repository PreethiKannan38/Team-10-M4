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
import HistoryManager, { RemoveObjectCommand } from './managers/HistoryManager';
import { CoordinateMapper } from './utils/CoordinateMapper';
import { BoundsCalculation } from './utils/BoundsCalculation';
import ToolManager from './ToolManager';
import axios from 'axios';

export class CanvasEngineController {
  constructor(canvas, container, roomId = 'drawing-room', userRole = 'viewer') {
    this.canvas = canvas;
    this.container = container;
    this.currentRoomId = roomId;
    this.snapshotDebounceTimeout = null;
    this.ctx = canvas.getContext('2d');

    // === YJS INITIALIZATION ===
    this.doc = new Y.Doc();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.provider = new WebsocketProvider(`${wsProtocol}//${window.location.host}`, roomId, this.doc);

    this.provider.on('status', event => {
      console.log('Yjs WebSocket Status:', event.status);
    });

    // === AWARENESS ===
    this.awareness = this.provider.awareness;
    this.awareness.on('change', () => {
      // Re-render when awareness changes (someone selects/deselects)
      this.render();
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
      eraserStrength: 100, // Default to 100% (Full delete)
      gridOpacity: 0.15,
      userRole: userRole,
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

  // --- AWARENESS METHODS ---

  setLocalUser(user) {
    if (!user) return;
    this.awareness.setLocalStateField('user', {
      name: user.name,
      color: user.color,
      id: user.id
    });
  }

  setSelectionAwareness(selectedIds) {
    this.awareness.setLocalStateField('selection', selectedIds);
    // Also trigger local state change for UI if needed
    if (selectedIds.length > 0) {
      this.dispatchStateChange('selection', selectedIds[0]);
    } else {
      this.dispatchStateChange('selection', null);
    }
  }

  setupYjsListeners() {
    this.yObjects.observe((event) => {
      this.syncFromYjs();
      if (event.transaction.local) {
        window.dispatchEvent(new Event('save-start'));
        // Debounce the save-end event
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
          window.dispatchEvent(new Event('save-end'));
        }, 1000); // Slightly longer than backend debounce
        this.triggerSnapshotSave();
      }
    });

    this.yLayers.observe((event) => {
      this.syncFromYjs();
      if (event.transaction.local) {
        window.dispatchEvent(new Event('save-start'));
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(() => {
          window.dispatchEvent(new Event('save-end'));
        }, 1000);
      }
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

  setUserRole(role) {
    this.state.userRole = role;
    this.dispatchStateChange('userRole', role);
    if (role === 'viewer') {
      this.cancelCurrentTool();
      this.setTool('select');
      this.canvas.style.cursor = 'default';
    }
  }

  canEdit() {
    return this.state.userRole !== 'viewer';
  }

  cancelCurrentTool() {
    if (this.currentTool && typeof this.currentTool.onDeactivate === 'function') {
      this.currentTool.onDeactivate();
    }
    this.currentTool = null;
    this.state.isDrawing = false;
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
    if (!this.canEdit()) return null;
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

  exportToImage(format = 'png') {
    const link = document.createElement('a');
    link.download = `drawspace-${Date.now()}.${format}`;
    // JPEG requires a white background explicitly, as transparency becomes black
    if (format === 'jpeg') {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = this.canvas.width;
      tempCanvas.height = this.canvas.height;
      const ctx = tempCanvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(this.canvas, 0, 0);
      link.href = tempCanvas.toDataURL('image/jpeg', 0.9);
    } else {
      link.href = this.canvas.toDataURL('image/png');
    }
    link.click();
  }

  exportToJSON() {
    const data = {
      objects: this.yObjects.toJSON(),
      layers: this.yLayers.toJSON(),
      version: '1.0.0',
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.download = `drawspace-${Date.now()}.json`;
    link.href = URL.createObjectURL(blob);
    link.click();
  }

  importFromJSON(jsonData) {
    if (!this.canEdit()) return;

    try {
      if (!jsonData || !jsonData.objects || !jsonData.layers) {
        throw new Error('Invalid JSON format');
      }

      this.doc.transact(() => {
        // 1. Clear existing state
        this.yObjects.clear();
        console.log('[Engine] Cleared objects');
        const layersCount = this.yLayers.length;
        if (layersCount > 0) {
          this.yLayers.delete(0, layersCount);
        }
        console.log('[Engine] Cleared layers');

        // 2. Restore layers
        const layers = jsonData.layers;
        if (Array.isArray(layers) && layers.length > 0) {
          this.yLayers.insert(0, layers);
        }

        // 3. Restore objects
        const objects = jsonData.objects;
        for (const [key, value] of Object.entries(objects)) {
          this.yObjects.set(key, value);
        }

        // 4. Set active layer to the first one if available
        if (layers.length > 0) {
          this.state.activeLayerId = layers[0].id;
        } else {
          this.createDefaultLayer();
        }

      });

      // RESET VIEW
      this.state.pan = { x: 0, y: 0 };
      this.state.zoom = 1;

      console.log('[Engine] Import transaction complete. Syncing...');

      const importedLayerCount = jsonData.layers.length;
      const importedObjectCount = Object.keys(jsonData.objects).length;
      alert(`Import Successful!\nLayers: ${importedLayerCount}\nObjects: ${importedObjectCount}\nActive Layer: ${this.state.activeLayerId}`);
      this.syncFromYjs();
      this.render();

      setTimeout(() => {
        console.log('[Engine] Delayed sync check...');
        this.syncFromYjs();
        this.render();
      }, 200);

    } catch (e) {
      console.error('[Engine] Import Failed:', e);
      alert('Failed to import JSON: ' + e.message);
    }
  }

  removeObject(objectId) {
    if (!this.canEdit()) return;
    const obj = this.yObjects.get(objectId);
    if (!obj) return;

    this.doc.transact(() => {
      this.yObjects.delete(objectId);
      const layers = this.yLayers.toArray();
      const layerIndex = layers.findIndex(l => l.id === obj.layerId);
      if (layerIndex !== -1) {
        const layer = this.yLayers.get(layerIndex);
        const updatedLayer = { ...layer, objects: layer.objects.filter(id => id !== objectId) };
        this.yLayers.delete(layerIndex, 1);
        this.yLayers.insert(layerIndex, [updatedLayer]);
      }
    });
  }

  updateObject(objectId, updates) {
    if (!this.canEdit()) return;
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
      case 'star': return BoundsCalculation.circleBounds(geometry.cx, geometry.cy, geometry.outerRadius, sw);

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

    if (this.currentTool) {
      this.currentTool.onPointerMove({ ...event, canvasX: coords.x, canvasY: coords.y }, this);
    }
  }

  onPointerUp(event) {
    this.state.isPanning = false;
    this.state.isDrawing = false;
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

    // Render Remote Selections
    this.renderRemoteSelections();

    this.ctx.restore();
  }

  renderRemoteSelections() {
    const states = this.awareness.getStates();
    const currentUser = this.awareness.getLocalState();

    states.forEach((state, clientId) => {
      if (clientId === this.doc.clientID) return; // Skip self

      const user = state.user;
      const selection = state.selection;

      if (user && selection && selection.length > 0) {
        selection.forEach(objId => {
          const obj = this.yObjects.get(objId);
          if (obj && obj.bounds) {
            this._drawRemoteSelection(obj.bounds, user.color || '#F59E0B', user.name || 'User');
          }
        });
      }
    });
  }

  _drawRemoteSelection(bounds, color, name) {
    // Box
    this.ctx.save();
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2 / this.state.zoom;
    this.ctx.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);

    // Name Label
    const fontSize = 12 / this.state.zoom;
    this.ctx.font = `bold ${fontSize}px sans-serif`;
    const textWidth = this.ctx.measureText(name).width;
    const padding = 4 / this.state.zoom;

    this.ctx.fillStyle = color;
    this.ctx.fillRect(bounds.x - 2, bounds.y - 2 - fontSize - padding * 2, textWidth + padding * 2, fontSize + padding * 2);

    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(name, bounds.x - 2 + padding, bounds.y - 4);

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
    } else if (type === 'star') {
      this._renderStar(geometry.cx, geometry.cy, geometry.outerRadius, geometry.innerRadius, geometry.points, this.ctx);
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
    if (!this.canEdit()) {
      console.warn('Blocked: Viewer cannot execute commands');
      return;
    }
    this.historyManager.executeCommand(command);
  }

  undo() {
    if (!this.canEdit()) return;
    this.historyManager.undo();
  }

  redo() {
    if (!this.canEdit()) return;
    this.historyManager.redo();
  }

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

      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); this.undo(); }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'y') && e.shiftKey) { e.preventDefault(); this.redo(); }
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

  triggerSnapshotSave() {
    if (this.snapshotDebounceTimeout) clearTimeout(this.snapshotDebounceTimeout);
    this.snapshotDebounceTimeout = setTimeout(() => {
      // Extract ID from URL or passed in constructor? 
      // The constructor doesn't take ID, but we can assume it's in the URL or we need to pass it.
      // Actually, the roomID is passed. Usually roomId IS the canvasId.
      // cleanDocName logic in server suggests roomId == canvasId.
      this.saveSnapshot(this.currentRoomId);
    }, 5000); // Save snapshot every 5 seconds of inactivity
  }

  async saveSnapshot(canvasId) {
    if (!this.canvas) return;

    const snapshotCanvas = document.createElement('canvas');
    const scale = 0.5;
    snapshotCanvas.width = this.canvas.width * scale;
    snapshotCanvas.height = this.canvas.height * scale;
    const ctx = snapshotCanvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, snapshotCanvas.width, snapshotCanvas.height);
    ctx.drawImage(this.canvas, 0, 0, snapshotCanvas.width, snapshotCanvas.height);

    const base64 = snapshotCanvas.toDataURL('image/jpeg', 0.6);

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/canvas/${canvasId}/snapshot`,
        { snapshot: base64 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[Engine] Snapshot saved');
    } catch (err) {
      // Silent fail to not annoy user
      console.warn('[Engine] Failed to save snapshot', err);
    }
  }

  async restore(canvasId) {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/canvas/${canvasId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const savedState = res.data.documentState;
      if (!savedState) {
        console.warn('[Engine] No saved state to restore.');
        return;
      }

      const binaryString = window.atob(savedState);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const tempDoc = new Y.Doc();
      Y.applyUpdate(tempDoc, bytes);

      const tempObjects = tempDoc.getMap('objects').toJSON();
      const tempLayers = tempDoc.getArray('layers').toJSON();

      this.doc.transact(() => {
        this.yObjects.clear();
        this.yLayers.delete(0, this.yLayers.length);
        // Re-insert objects
        Object.entries(tempObjects).forEach(([key, val]) => {
          this.yObjects.set(key, val);
        });
        // Re-insert layers
        this.yLayers.insert(0, tempLayers);
      });

      console.log('[Engine] Canvas restored.');
      this.syncFromYjs();

    } catch (err) {
      console.error('[Engine] Restore failed:', err);
    }
  }

  destroy() {
    this.isAnimationRunning = false;
    this.provider.disconnect();
    this.doc.destroy();
  }
}

export default CanvasEngineController;