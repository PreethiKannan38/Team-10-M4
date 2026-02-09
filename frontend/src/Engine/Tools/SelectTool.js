/**
 * SelectTool.js
 * 
 * Supports Rectangular Selection (Marquee), Multi-select with Shift,
 * and batch transformations for multiple objects.
 */

import BaseTool from './BaseTool';
import { TransformObjectCommand, BatchCommand } from '../managers/HistoryManager';

export class SelectTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isDragging = false;
    this.isResizing = false;
    this.isMarquee = false;
    this.activeHandle = null;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.marqueeEnd = { x: 0, y: 0 };
    this.originalGeometries = new Map();
    this.selectedBounds = null; // Only for single object interaction
  }

  onPointerDown(event, engine) {
    if (!event.canvasX || !event.canvasY) return;
    const { canvasX, canvasY } = event;
    this.dragStartX = canvasX;
    this.dragStartY = canvasY;

    // 1. Special case: Resize handle (only for single object select)
    if (engine.state.selectedObjectIds.length === 1 && this.selectedBounds) {
      const handle = this._getHandleAtPoint(canvasX, canvasY);
      if (handle) {
        this.isResizing = true;
        this.activeHandle = handle;
        const selectedId = engine.state.selectedObjectIds[0];
        const obj = engine.getObject(selectedId);
        this.originalGeometries.set(selectedId, JSON.parse(JSON.stringify(obj.geometry)));
        return;
      }
    }

    // 2. Check Hit Detection
    const objectsAtPoint = engine.sceneManager.getObjectsAtPoint(canvasX, canvasY);
    if (objectsAtPoint.length > 0) {
      const clickedObj = objectsAtPoint[objectsAtPoint.length - 1];
      let currentIds = [...(engine.state.selectedObjectIds || [])];
      const isAlreadySelected = currentIds.includes(clickedObj.id);

      if (engine.shiftPressed) {
        if (isAlreadySelected) {
          currentIds = currentIds.filter(id => id !== clickedObj.id);
        } else {
          currentIds.push(clickedObj.id);
        }
      } else {
        if (!isAlreadySelected) {
          currentIds = [clickedObj.id];
        }
      }

      engine.setSelectionAwareness(currentIds);
      this.isDragging = true;

      // Store original geometries for all
      this.originalGeometries.clear();
      currentIds.forEach(id => {
        const obj = engine.getObject(id);
        if (obj) this.originalGeometries.set(id, JSON.parse(JSON.stringify(obj.geometry)));
      });

      if (currentIds.length === 1) {
        this._updateSelectionBounds(engine.getObject(currentIds[0]));
      } else {
        this.selectedBounds = null;
      }
    } else {
      // 3. Clicked Empty Space -> Marquee
      if (!engine.shiftPressed) {
        engine.setSelectionAwareness([]);
        this.selectedBounds = null;
      }
      this.isMarquee = true;
      this.marqueeEnd = { x: canvasX, y: canvasY };
    }
  }

  onPointerMove(event, engine) {
    if (!event.canvasX || !event.canvasY) return;
    const { canvasX, canvasY } = event;

    if (this.isMarquee) {
      this.marqueeEnd = { x: canvasX, y: canvasY };
      return;
    }

    // Cursor Feedback
    if (!this.isDragging && !this.isResizing && this.selectedBounds && engine.state.selectedObjectIds.length === 1) {
      const handle = this._getHandleAtPoint(canvasX, canvasY);
      if (handle) {
        engine.canvas.style.cursor = (handle === 'tl' || handle === 'br') ? 'nwse-resize' : 'nesw-resize';
      } else {
        engine.canvas.style.cursor = 'default';
      }
    }

    if (engine.state.selectedObjectIds.length === 0) return;

    const deltaX = canvasX - this.dragStartX;
    const deltaY = canvasY - this.dragStartY;

    if (this.isResizing && engine.state.selectedObjectIds.length === 1) {
      const id = engine.state.selectedObjectIds[0];
      const obj = engine.getObject(id);
      let geo = JSON.parse(JSON.stringify(obj.geometry));
      this._resize(obj, geo, deltaX, deltaY);
      engine.updateObject(id, { geometry: geo });
      this._updateSelectionBounds({ ...obj, geometry: geo });
      this.dragStartX = canvasX;
      this.dragStartY = canvasY;
    } else if (this.isDragging) {
      engine.state.selectedObjectIds.forEach(id => {
        const obj = engine.getObject(id);
        if (!obj) return;
        let geo = JSON.parse(JSON.stringify(obj.geometry));
        this._move(obj, geo, deltaX, deltaY);
        engine.updateObject(id, { geometry: geo });
      });

      if (engine.state.selectedObjectIds.length === 1) {
        this._updateSelectionBounds(engine.getObject(engine.state.selectedObjectIds[0]));
      }
      this.dragStartX = canvasX;
      this.dragStartY = canvasY;
    }
  }

  onPointerUp(event, engine) {
    if (this.isMarquee) {
      const rect = {
        x: Math.min(this.dragStartX, this.marqueeEnd.x),
        y: Math.min(this.dragStartY, this.marqueeEnd.y),
        width: Math.abs(this.dragStartX - this.marqueeEnd.x),
        height: Math.abs(this.dragStartY - this.marqueeEnd.y)
      };

      const ids = [];
      const allObjects = Object.values(engine.sceneManager.objects);
      allObjects.forEach(obj => {
        const bounds = this._getObjectBounds(obj);
        if (this._rectsIntersect(rect, bounds)) {
          ids.push(obj.id);
        }
      });

      let finalIds = engine.shiftPressed ? [...new Set([...engine.state.selectedObjectIds, ...ids])] : ids;
      engine.setSelectionAwareness(finalIds);
      if (finalIds.length === 1) this._updateSelectionBounds(engine.getObject(finalIds[0]));
    }

    if (this.isResizing || this.isDragging) {
      const batch = new BatchCommand();
      let changed = false;
      this.originalGeometries.forEach((oldGeo, id) => {
        const obj = engine.getObject(id);
        if (obj && JSON.stringify(oldGeo) !== JSON.stringify(obj.geometry)) {
          batch.addCommand(new TransformObjectCommand(engine, id, oldGeo, obj.geometry));
          changed = true;
        }
      });
      if (changed) engine.executeCommand(batch);
    }

    this.isDragging = false;
    this.isResizing = false;
    this.isMarquee = false;
    this.activeHandle = null;
    this.originalGeometries.clear();
  }

  _rectsIntersect(r1, r2) {
    return !(r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y);
  }

  _getObjectBounds(obj) {
    const { geometry } = obj;
    if (geometry.points) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      geometry.points.forEach(p => { minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y); });
      return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
    } else if (geometry.cx !== undefined) {
      return { x: geometry.cx - geometry.radius, y: geometry.cy - geometry.radius, width: geometry.radius * 2, height: geometry.radius * 2 };
    } else {
      const width = geometry.width || (geometry.x1 !== undefined ? Math.abs(geometry.x1 - geometry.x2) : 100);
      const height = geometry.height || (geometry.y1 !== undefined ? Math.abs(geometry.y1 - geometry.y2) : 40);
      const x = geometry.x !== undefined ? geometry.x : Math.min(geometry.x1, geometry.x2);
      const y = geometry.y !== undefined ? geometry.y : Math.min(geometry.y1, geometry.y2);
      return { x, y, width, height };
    }
  }

  _move(obj, geo, dx, dy) {
    if (geo.points) geo.points = geo.points.map(p => ({ x: p.x + dx, y: p.y + dy }));
    else if (geo.cx !== undefined) { geo.cx += dx; geo.cy += dy; }
    else { geo.x += dx; geo.y += dy; if (geo.x1 !== undefined) { geo.x1 += dx; geo.y1 += dy; geo.x2 += dx; geo.y2 += dy; } }
  }

  _resize(obj, geo, dx, dy) {
    const minSize = 20;
    if (obj.type === 'rectangle' || obj.type === 'text') {
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

  _getHandleAtPoint(x, y) {
    const b = this.selectedBounds;
    if (!b) return null;
    const s = 25;
    if (Math.abs(x - b.x) < s && Math.abs(y - b.y) < s) return 'tl';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - b.y) < s) return 'tr';
    if (Math.abs(x - (b.x + b.width)) < s && Math.abs(y - (b.y + b.height)) < s) return 'br';
    if (Math.abs(x - b.x) < s && Math.abs(y - (b.y + b.height)) < s) return 'bl';
    return null;
  }

  _updateSelectionBounds(obj) {
    const b = this._getObjectBounds(obj);
    this.selectedBounds = { x: b.x - 15, y: b.y - 15, width: b.width + 30, height: b.height + 30 };
  }

  renderPreview(ctx, engine) {
    // 1. Render Marquee
    if (this.isMarquee) {
      ctx.save();
      ctx.strokeStyle = '#6366F1';
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.setLineDash([5, 5]);
      const x = Math.min(this.dragStartX, this.marqueeEnd.x);
      const y = Math.min(this.dragStartY, this.marqueeEnd.y);
      const w = Math.abs(this.dragStartX - this.marqueeEnd.x);
      const h = Math.abs(this.dragStartY - this.marqueeEnd.y);
      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);
      ctx.restore();
    }

    // 2. Render Single Selection (with handles)
    if (this.selectedBounds && engine.state.selectedObjectIds.length === 1) {
      const b = this.selectedBounds;
      ctx.save();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 4]);
      ctx.strokeRect(b.x, b.y, b.width, b.height);
      ctx.setLineDash([]);
      ctx.fillStyle = 'white';
      [[b.x, b.y], [b.x + b.width, b.y], [b.x + b.width, b.y + b.height], [b.x, b.y + b.height]].forEach(([hx, hy]) => {
        ctx.beginPath(); ctx.arc(hx, hy, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      ctx.restore();
    }

    // 3. Render Multi-selection outlines (simplified)
    if (engine.state.selectedObjectIds.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#6366F1';
      ctx.lineWidth = 1;
      engine.state.selectedObjectIds.forEach(id => {
        const obj = engine.getObject(id);
        if (obj) {
          const b = this._getObjectBounds(obj);
          ctx.strokeRect(b.x - 5, b.y - 5, b.width + 10, b.height + 10);
        }
      });
      ctx.restore();
    }
  }
}

export default SelectTool;
