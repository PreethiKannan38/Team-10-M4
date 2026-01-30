import { Tool } from './Tool'
import { hitTestStroke } from '../scene/hitTest'
import { rectsIntersect } from '../scene/geometry'

export class SelectTool extends Tool {
  constructor(scene, selectedIds, redraw) {
    super()
    this.scene = scene
    this.selectedIds = selectedIds
    this.redraw = redraw

    this.dragging = false
    this.start = null
    this.box = null
  }

  onPointerDown(e) {
    this.dragging = true
    this.start = { x: e.x, y: e.y }
    this.box = null

    // check if click hits a stroke
    let hitId = null
    for (let i = this.scene.length - 1; i >= 0; i--) {
      if (hitTestStroke(this.scene[i], e.x, e.y)) {
        hitId = this.scene[i].id
        break
      }
    }

    // click selection
    if (hitId) {
      if (e.shiftKey) {
        this.selectedIds.has(hitId)
          ? this.selectedIds.delete(hitId)
          : this.selectedIds.add(hitId)
      } else {
        this.selectedIds.clear()
        this.selectedIds.add(hitId)
      }
      this.dragging = false
      this.redraw()
    } else if (!e.shiftKey) {
      // empty click clears selection
      this.selectedIds.clear()
      this.redraw()
    }
  }

  onPointerMove(e) {
    if (!this.dragging || !this.start) return

    const x = Math.min(this.start.x, e.x)
    const y = Math.min(this.start.y, e.y)
    const w = Math.abs(e.x - this.start.x)
    const h = Math.abs(e.y - this.start.y)

    this.box = { x, y, w, h }
    this.redraw(this.box)
  }

  onPointerUp(e) {
    if (!this.box) {
      this.reset()
      return
    }

    for (const node of this.scene) {
      if (rectsIntersect(this.box, node.bounds)) {
        this.selectedIds.add(node.id)
      }
    }

    this.reset()
    this.redraw()
  }

  onCancel() {
    this.reset()
  }

  reset() {
    this.dragging = false
    this.start = null
    this.box = null
  }
}
