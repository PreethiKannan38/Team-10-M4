import { Tool } from './Tool'
import { hitTestStroke } from '../scene/hitTest'

export class EraserTool extends Tool {
  constructor(scene, selectedIds, yStrokes) {
    super()
    this.scene = scene
    this.selectedIds = selectedIds
    this.yStrokes = yStrokes
  }

  onPointerDown(e) {
    const ids = new Set(this.selectedIds)

    if (ids.size === 0) {
      for (let i = this.scene.length - 1; i >= 0; i--) {
        if (hitTestStroke(this.scene[i], e.x, e.y)) {
          ids.add(this.scene[i].id)
          break
        }
      }
    }

    const arr = this.yStrokes.toArray()
    for (let i = arr.length - 1; i >= 0; i--) {
      if (ids.has(arr[i].get('id'))) {
        this.yStrokes.delete(i, 1)
      }
    }

    this.selectedIds.clear()
  }
}
