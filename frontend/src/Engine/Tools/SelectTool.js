/**
 * SelectTool.js
 * 
 * Advanced Selection & Transformation Tool.
 * Features:
 * - 4-Corner Resizing (tl, tr, br, bl)
 * - Dynamic Cursor Changes (nwse-resize, nesw-resize)
 * - Proportional and Free Scaling
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

    // 1. Check for handle clicks
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

    // 2. Selection logic
    const objectsAtPoint = engine.sceneManager.getObjectsAtPoint(event.canvasX, event.canvasY);
    if (objectsAtPoint.length > 0) {
      const selected = objectsAtPoint[objectsAtPoint.length - 1];
      engine.state.selectedObjectId = selected.id;
      this.isDragging = true;
      this.dragStartX = event.canvasX;
      this.dragStartY = event.canvasY;
      this.originalGeometry = JSON.parse(JSON.stringify(selected.geometry));
      this._updateSelectionBounds(selected);
      engine.dispatchStateChange('selection', selected.id);
    } else {
      engine.state.selectedObjectId = null;
      this.selectedBounds = null;
      engine.dispatchStateChange('selection', null);
      engine.canvas.style.cursor = 'default';
    }
  }

  onPointerMove(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    // Update cursor based on hover
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

    let newGeometry = JSON.parse(JSON.stringify(obj.geometry));

    if (this.isResizing) {
      this._perform4CornerResize(obj, newGeometry, deltaX, deltaY);
    } else if (this.isDragging) {
      this._performMove(obj, newGeometry, deltaX, deltaY);
    } else {
        return;
    }

    engine.updateObject(obj.id, { geometry: newGeometry });
    this._updateSelectionBounds({ ...obj, geometry: newGeometry });

    this.dragStartX = event.canvasX;
    this.dragStartY = event.canvasY;
  }

  _performMove(obj, geo, dx, dy) {
    if (obj.type === 'stroke' || obj.type === 'triangle' || obj.type === 'polygon') {
      geo.points = geo.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    } else if (obj.type === 'rectangle' || obj.type === 'text') {
      geo.x += dx; geo.y += dy;
    } else if (obj.type === 'circle') {
      geo.cx += dx; geo.cy += dy;
    } else if (obj.type === 'line' || obj.type === 'arrow') {
      geo.x1 += dx; geo.y1 += dy;
      geo.x2 += dx; geo.y2 += dy;
    }
  }

  _perform4CornerResize(obj, geo, dx, dy) {
    if (obj.type === 'rectangle') {
      switch (this.activeHandle) {
        case 'br': geo.width = Math.max(5, geo.width + dx); geo.height = Math.max(5, geo.height + dy); break;
        case 'tl': geo.x += dx; geo.y += dy; geo.width = Math.max(5, geo.width - dx); geo.height = Math.max(5, geo.height - dy); break;
        case 'tr': geo.y += dy; geo.width = Math.max(5, geo.width + dx); geo.height = Math.max(5, geo.height - dy); break;
        case 'bl': geo.x += dx; geo.width = Math.max(5, geo.width - dx); geo.height = Math.max(5, geo.height + dy); break;
      }
    } else if (obj.type === 'circle') {
        const factor = (this.activeHandle === 'br' || this.activeHandle === 'tr') ? 1 : -1;
        geo.radius = Math.max(5, geo.radius + (dx * factor));
    } else if (obj.type === 'stroke') {
        const b = this.selectedBounds;
        const scaleX = (b.width + (this.activeHandle.includes('r') ? dx : -dx)) / b.width;
        const scaleY = (b.height + (this.activeHandle.includes('b') ? dy : -dy)) / b.height;
        const anchorX = this.activeHandle.includes('l') ? b.x + b.width : b.x;
        const anchorY = this.activeHandle.includes('t') ? b.y + b.height : b.y;

        geo.points = geo.points.map(p => ({
            x: anchorX + (p.x - anchorX) * scaleX,
            y: anchorY + (p.y - anchorY) * scaleY
        }));
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
    const s = 15;
    if (Math.abs(x - b.x) < s && Math.abs(y - b.y) < s) return 'tl';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - b.y) < s) return 'tr';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - (b.y + b.height)) < s) return 'br';
    if (Math.abs(x - b.x) < s && Math.abs(y - (b.y + b.height)) < s) return 'bl';
    return null;
  }

  _updateSelectionBounds(obj) {
    const { type, geometry, style } = obj;
    let b = { x: 0, y: 0, w: 0, h: 0 };
    if (type === 'stroke' && geometry.points) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      geometry.points.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      b = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    } else if (type === 'rectangle' || type === 'text') {
      b = { x: geometry.x, y: geometry.y, w: geometry.width || 100, h: geometry.height || 40 };
    } else if (type === 'circle') {
      b = { x: geometry.cx - geometry.radius, y: geometry.cy - geometry.radius, w: geometry.radius * 2, h: geometry.radius * 2 };
    } else if (type === 'line' || type === 'arrow') {
      b = { x: Math.min(geometry.x1, geometry.x2), y: Math.min(geometry.y1, geometry.y2), w: Math.abs(geometry.x1 - geometry.x2), h: Math.abs(geometry.y1 - geometry.y2) };
    }
    this.selectedBounds = { x: b.x - 5, y: b.y - 5, width: b.w + 10, height: b.h + 10 };
  }

  renderPreview(ctx, engine) {
    if (this.selectedBounds && engine.state.selectedObjectId) {
      const b = this.selectedBounds;
      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.setLineDash([]);
      ctx.fillStyle = 'white';
      [[b.x, b.y], [b.x+b.width, b.y], [b.x+b.width, b.y+b.height], [b.x, b.y+b.height]].forEach(([hx, hy]) => {
        ctx.beginPath(); ctx.arc(hx, hy, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
    }
  }
}

export default SelectTool;
