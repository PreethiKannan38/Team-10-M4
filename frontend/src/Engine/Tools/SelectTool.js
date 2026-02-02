/**
 * SelectTool.js
 * 
 * Selection and transformation tool.
 * Handles single selection, multi-selection (Lasso), and movement.
 */

import BaseTool from './BaseTool';
import { TransformObjectCommand } from '../managers/HistoryManager';

export class SelectTool extends BaseTool {
  constructor(engine) {
    super(engine);
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.originalGeometry = null;
    this.selectedBounds = null;
    this.lassoPoints = [];
  }

  onPointerDown(event, engine) {
    if (!event.canvasX || !event.canvasY) return;

    if (engine.state.activeTool === 'lasso') {
      this.lassoPoints = [{ x: event.canvasX, y: event.canvasY }];
      this.isDragging = true;
      return;
    }

    // Move or Select mode
    const objectsAtPoint = engine.sceneManager.getObjectsAtPoint(event.canvasX, event.canvasY);

    if (objectsAtPoint.length > 0) {
      const selected = objectsAtPoint[objectsAtPoint.length - 1];
      if (selected.locked) return;

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
      this.originalGeometry = null;
      engine.dispatchStateChange('selection', null);
    }
  }

  onPointerMove(event, engine) {
    if (!event.canvasX || !event.canvasY || !this.isDragging) return;

    if (engine.state.activeTool === 'lasso') {
      this.lassoPoints.push({ x: event.canvasX, y: event.canvasY });
      return;
    }

    const selectedId = engine.state.selectedObjectId;
    if (!selectedId) return;

    const deltaX = event.canvasX - this.dragStartX;
    const deltaY = event.canvasY - this.dragStartY;

    const obj = engine.getObject(selectedId);
    if (!obj || !obj.geometry) return;

    let newGeometry = JSON.parse(JSON.stringify(obj.geometry));

    // Move logic for all shape types
    if (obj.type === 'stroke' || obj.type === 'triangle' || obj.type === 'polygon') {
      newGeometry.points = newGeometry.points.map(p => ({ x: p.x + deltaX, y: p.y + deltaY }));
    } else if (obj.type === 'rectangle') {
      newGeometry.x += deltaX; newGeometry.y += deltaY;
    } else if (obj.type === 'circle') {
      newGeometry.cx += deltaX; newGeometry.cy += deltaY;
    } else if (obj.type === 'line' || obj.type === 'arrow') {
      newGeometry.x1 += deltaX; newGeometry.y1 += deltaY;
      newGeometry.x2 += deltaX; newGeometry.y2 += deltaY;
    }

    engine.updateObject(selectedId, { geometry: newGeometry });
    this._updateSelectionBounds({ ...obj, geometry: newGeometry });

    this.dragStartX = event.canvasX;
    this.dragStartY = event.canvasY;
  }

  onPointerUp(event, engine) {
    if (!this.isDragging) return;

    if (engine.state.activeTool === 'lasso') {
      this._performLassoSelection(engine);
      this.lassoPoints = [];
      this.isDragging = false;
      return;
    }

    const selectedId = engine.state.selectedObjectId;
    if (selectedId && this.originalGeometry) {
      const obj = engine.getObject(selectedId);
      if (obj && JSON.stringify(this.originalGeometry) !== JSON.stringify(obj.geometry)) {
        engine.executeCommand(new TransformObjectCommand(engine, selectedId, this.originalGeometry, obj.geometry));
      }
    }

    this.isDragging = false;
    this.originalGeometry = null;
  }

  _performLassoSelection(engine) {
    if (this.lassoPoints.length < 3) return;
    
    // Find objects whose center is inside the lasso polygon
    const objects = Object.values(engine.sceneManager.objects);
    for (const obj of objects) {
      if (obj.bounds && this._isPointInPolygon(
        { x: obj.bounds.x + obj.bounds.width/2, y: obj.bounds.y + obj.bounds.height/2 }, 
        this.lassoPoints
      )) {
        engine.state.selectedObjectId = obj.id;
        this._updateSelectionBounds(obj);
        engine.dispatchStateChange('selection', obj.id);
        break; // For now, just select the first one found
      }
    }
  }

  _isPointInPolygon(point, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i].x, yi = polygon[i].y;
      const xj = polygon[j].x, yj = polygon[j].y;
      const intersect = ((yi > point.y) !== (yj > point.y)) &&
        (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  _updateSelectionBounds(obj) {
    const { type, geometry, style } = obj;
    if (!geometry) {
      this.selectedBounds = null;
      return;
    }

    const padding = (style?.width || 2) / 2 + 10;
    let b = { x: 0, y: 0, w: 0, h: 0 };

    if ((type === 'stroke' || type === 'triangle' || type === 'polygon') && geometry.points) {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      geometry.points.forEach(p => {
        minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
      });
      b = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
    } else if (type === 'rectangle') {
      b = { x: geometry.x, y: geometry.y, w: geometry.width, h: geometry.height };
    } else if (type === 'circle') {
      b = { x: geometry.cx - geometry.radius, y: geometry.cy - geometry.radius, w: geometry.radius * 2, h: geometry.radius * 2 };
    } else if (type === 'line' || type === 'arrow') {
      b = { 
        x: Math.min(geometry.x1, geometry.x2), 
        y: Math.min(geometry.y1, geometry.y2), 
        w: Math.abs(geometry.x1 - geometry.x2), 
        h: Math.abs(geometry.y1 - geometry.y2) 
      };
    }

    this.selectedBounds = {
      x: b.x - padding,
      y: b.y - padding,
      width: b.w + padding * 2,
      height: b.h + padding * 2
    };
  }

  renderPreview(ctx, engine) {
    // Render Lasso Path
    if (engine.state.activeTool === 'lasso' && this.lassoPoints.length > 1) {
      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.lassoPoints[0].x, this.lassoPoints[0].y);
      this.lassoPoints.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();
      ctx.restore();
    }

    // Render Selection Box
    if (this.selectedBounds && engine.state.selectedObjectId) {
      const bounds = this.selectedBounds;
      const handleSize = 8;

      ctx.save();
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
      ctx.setLineDash([]);

      ctx.fillStyle = 'white';
      ctx.strokeStyle = '#8b5cf6';
      ctx.lineWidth = 2;
      
      const handles = [
        [bounds.x, bounds.y],
        [bounds.x + bounds.width, bounds.y],
        [bounds.x + bounds.width, bounds.y + bounds.height],
        [bounds.x, bounds.y + bounds.height],
      ];

      for (const [hx, hy] of handles) {
        ctx.beginPath();
        ctx.rect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}

export default SelectTool;
