/**
 * SelectTool.js
 * 
 * Comprehensive Selection: 4-Corner Resizing with accurate hit-detection.
 */

import BaseTool from './BaseTool';
import { TransformObjectCommand } from '../managers/HistoryManager';

export class SelectTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.originalGeometry = null;
    this.selectedBounds = null;
  }

  onPointerDown(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    // Handle Resize priority
    if (this.selectedBounds && engine.state.selectedObjectId) {
      const handle = this._getHandleAtPoint(event.canvasX, event.canvasY);
      if (handle) {
        this.isResizing = true;
        this.activeHandle = handle;
        this.dragStartX = event.canvasX;
        this.dragStartY = event.canvasY;
        const selected = engine.getObject(engine.state.selectedObjectId);
        this.originalGeometry = JSON.parse(JSON.stringify(selected.geometry));
        return;
      }
    }

    // Handle Selection
    const objectsAtPoint = engine.sceneManager.getObjectsAtPoint(event.canvasX, event.canvasY);
    if (objectsAtPoint.length > 0) {
      const selected = objectsAtPoint[objectsAtPoint.length - 1];
      engine.state.selectedObjectId = selected.id;
      this.isDragging = true;
      this.dragStartX = event.canvasX;
      this.dragStartY = event.canvasY;
      this.originalGeometry = JSON.parse(JSON.stringify(selected.geometry));
      this._updateSelectionBounds(selected);
      this._updateSelectionBounds(selected);
      engine.dispatchStateChange('selection', selected.id);
      if (engine.setSelectionAwareness) engine.setSelectionAwareness([selected.id]);
    } else {
      engine.state.selectedObjectId = null;
      this.selectedBounds = null;
      engine.dispatchStateChange('selection', null);
      if (engine.setSelectionAwareness) engine.setSelectionAwareness([]);
      engine.canvas.style.cursor = 'default';
    }
  }

  onPointerMove(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    // Cursor Feedback
    if (!this.isDragging && !this.isResizing && this.selectedBounds) {
      const handle = this._getHandleAtPoint(event.canvasX, event.canvasY);
      if (handle) {
        engine.canvas.style.cursor = (handle === 'tl' || handle === 'br') ? 'nwse-resize' : 'nesw-resize';
      } else {
        engine.canvas.style.cursor = 'default';
      }
    }

    if (!engine.state.selectedObjectId) return;

    const deltaX = event.canvasX - this.dragStartX;
    const deltaY = event.canvasY - this.dragStartY;
    const obj = engine.getObject(engine.state.selectedObjectId);
    if (!obj) return;

    let geo = JSON.parse(JSON.stringify(obj.geometry));

    if (this.isResizing) {
      this._resize(obj, geo, deltaX, deltaY);
    } else if (this.isDragging) {
      this._move(obj, geo, deltaX, deltaY);
    } else { return; }

    engine.updateObject(obj.id, { geometry: geo });
    this._updateSelectionBounds({ ...obj, geometry: geo });
    this.dragStartX = event.canvasX;
    this.dragStartY = event.canvasY;
  }

  _move(obj, geo, dx, dy) {
    if (geo.points) geo.points = geo.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    else if (geo.cx !== undefined) { geo.cx += dx; geo.cy += dy; }
    else { geo.x += dx; geo.y += dy; if (geo.x1 !== undefined) { geo.x1 += dx; geo.y1 += dy; geo.x2 += dx; geo.y2 += dy; } }
  }

  _resize(obj, geo, dx, dy) {
    if (obj.type === 'rectangle' || obj.type === 'text') {
      const minSize = 20;
      switch (this.activeHandle) {
        case 'br': geo.width = Math.max(minSize, (geo.width || 100) + dx); geo.height = Math.max(minSize, (geo.height || 40) + dy); break;
        case 'tl': geo.x += dx; geo.y += dy; geo.width = Math.max(minSize, (geo.width || 100) - dx); geo.height = Math.max(minSize, (geo.height || 40) - dy); break;
        case 'tr': geo.y += dy; geo.width = Math.max(minSize, (geo.width || 100) + dx); geo.height = Math.max(minSize, (geo.height || 40) - dy); break;
        case 'bl': geo.x += dx; geo.width = Math.max(minSize, (geo.width || 100) - dx); geo.height = Math.max(minSize, (geo.height || 40) + dy); break;
      }
    } else if (obj.type === 'circle') {
      const factor = (this.activeHandle === 'br' || this.activeHandle === 'tr') ? 1 : -1;
      geo.radius = Math.max(5, geo.radius + (dx * factor));
    }
  }

  onPointerUp(event, engine) {
    if (this.isResizing || this.isDragging) {
      const selectedId = engine.state.selectedObjectId;
      const obj = engine.getObject(selectedId);
      if (obj && JSON.stringify(this.originalGeometry) !== JSON.stringify(obj.geometry)) {
        engine.executeCommand(new TransformObjectCommand(engine, selectedId, this.originalGeometry, obj.geometry));
      }
    }
    this.isDragging = false;
    this.isResizing = false;
    this.activeHandle = null;
  }

  _getHandleAtPoint(x, y) {
    const b = this.selectedBounds;
    if (!b) return null;
    const s = 25; // Large grab area
    if (Math.abs(x - b.x) < s && Math.abs(y - b.y) < s) return 'tl';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - b.y) < s) return 'tr';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - (b.y + b.height)) < s) return 'br';
    if (Math.abs(x - b.x) < s && Math.abs(y - (b.y + b.height)) < s) return 'bl';
    return null;
  }

  _updateSelectionBounds(obj) {
    const { type, geometry } = obj;
    let b = { x: 0, y: 0, w: 0, h: 0 };
    if (geometry.points) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      geometry.points.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      b = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    } else if (geometry.cx !== undefined) {
      b = { x: geometry.cx - geometry.radius, y: geometry.cy - geometry.radius, w: geometry.radius * 2, h: geometry.radius * 2 };
    } else {
      const w = geometry.width || (geometry.x1 !== undefined ? Math.abs(geometry.x1 - geometry.x2) : 100);
      const h = geometry.height || (geometry.y1 !== undefined ? Math.abs(geometry.y1 - geometry.y2) : 40);
      const x = geometry.x !== undefined ? geometry.x : Math.min(geometry.x1, geometry.x2);
      const y = geometry.y !== undefined ? geometry.y : Math.min(geometry.y1, geometry.y2);
      b = { x, y, w, h };
    }
    this.selectedBounds = { x: b.x - 15, y: b.y - 15, width: b.w + 30, height: b.h + 30 };
  }

  renderPreview(ctx, engine) {
    if (this.selectedBounds && engine.state.selectedObjectId) {
      const b = this.selectedBounds;
      ctx.save();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.setLineDash([]);
      ctx.fillStyle = 'white';
      [[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]].forEach(([hx, hy]) => {
        ctx.beginPath(); ctx.arc(hx, hy, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
    }
  }
}

export default SelectTool;
