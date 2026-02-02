// import * as Y from 'yjs'
// import { WebsocketProvider } from 'y-websocket'

// export function initCanvas(canvas) {
//   const ctx = canvas.getContext('2d')

//   /* -------------------- CANVAS -------------------- */
//   function resizeCanvas() {
//     const rect = canvas.getBoundingClientRect()
//     canvas.width = rect.width
//     canvas.height = rect.height
//   }

//   resizeCanvas()
//   window.addEventListener('resize', resizeCanvas)

//   ctx.lineCap = 'round'

//   const buffer = document.createElement('canvas')
//   buffer.width = canvas.width
//   buffer.height = canvas.height
//   const bctx = buffer.getContext('2d')
//   bctx.lineCap = 'round'

//   let selectedIds = new Set()
//   let activeTool = 'draw' // draw | select | eraser
//   let drawing = false
//   let localPoints = []

//   /* -------------------- TOOL API -------------------- */
//   function setTool(tool) {
//     activeTool = tool
//     drawing = false
//     localPoints = []
//     selectedIds.clear()
//     updateCursor()
//     redrawScene()
//   }

//   /* -------------------- YJS -------------------- */
//   const ydoc = new Y.Doc()
//   new WebsocketProvider('ws://localhost:1234', 'room-1', ydoc)
//   const yStrokes = ydoc.getArray('strokes')

//   updateCursor()

//   /* -------------------- SCENE -------------------- */
//   class StrokeNode {
//     constructor(stroke) {
//       this.id = stroke.get('id')
//       this.points = stroke.get('points')
//       this.color = stroke.get('color')
//       this.width = stroke.get('width')
//       this.bounds = computeBounds(this.points)
//     }

//     draw(ctx, selected = false) {
//       if (this.points.length < 2) return

//       ctx.beginPath()
//       ctx.strokeStyle = selected ? 'rgba(0,120,255,0.8)' : this.color
//       ctx.lineWidth = selected ? this.width + 2 : this.width
//       ctx.moveTo(this.points[0].x, this.points[0].y)
//       for (let i = 1; i < this.points.length; i++) {
//         ctx.lineTo(this.points[i].x, this.points[i].y)
//       }
//       ctx.stroke()
//     }
//   }

//   const scene = []

//   /* -------------------- YJS → BUFFER -------------------- */
//   yStrokes.observe(() => {
//     bctx.clearRect(0, 0, buffer.width, buffer.height)
//     scene.length = 0

//     yStrokes.toArray().forEach(stroke => {
//       const node = new StrokeNode(stroke)
//       scene.push(node)
//       node.draw(bctx)
//     })

//     redrawScene()
//   })

//   /* -------------------- INPUT -------------------- */
//   canvas.addEventListener('mousedown', e => {
//     // hard stop any drawing when tool is not draw
//     const r = canvas.getBoundingClientRect()
//     const x = e.clientX - r.left
//     const y = e.clientY - r.top

//     if (activeTool !== 'draw') {
//     drawing = false
//     localPoints = []
//     }
//     // -------- SELECT --------
//   if (activeTool === 'select') {
//     let hitId = null

//     for (let i = scene.length - 1; i >= 0; i--) {
//       if (hitTestStroke(scene[i], x, y)) {
//         hitId = scene[i].id
//         break
//       }
//     }

//     if (e.shiftKey) {
//       if (hitId) {
//         selectedIds.has(hitId)
//           ? selectedIds.delete(hitId)
//           : selectedIds.add(hitId)
//       }
//     } else {
//       selectedIds.clear()
//       if (hitId) selectedIds.add(hitId)
//     }

//     redrawScene()
//     return
//   }


//     // ERASER
//     if (activeTool === 'eraser') {
//       const ids = new Set(selectedIds)

//       if (ids.size === 0) {
//         for (let i = scene.length - 1; i >= 0; i--) {
//           if (hitTestStroke(scene[i], x, y)) {
//             ids.add(scene[i].id)
//             break
//           }
//         }
//       }

//       const arr = yStrokes.toArray()
//       for (let i = arr.length - 1; i >= 0; i--) {
//         if (ids.has(arr[i].get('id'))) {
//           yStrokes.delete(i, 1)
//         }
//       }

//       selectedIds.clear()
//       return
//     }

//     // DRAW
//     if (activeTool === 'draw') {
//       selectedIds.clear()
//       drawing = true
//       localPoints = [{ x, y }]
//     }
//   })

//   canvas.addEventListener('mousemove', e => {
//   if (activeTool !== 'draw') return
//   if (!drawing) return

//   const r = canvas.getBoundingClientRect()
//   const p = { x: e.clientX - r.left, y: e.clientY - r.top }
//   localPoints.push(p)

//   ctx.clearRect(0, 0, canvas.width, canvas.height)
//   ctx.drawImage(buffer, 0, 0)

//   ctx.beginPath()
//   ctx.strokeStyle = 'black'
//   ctx.lineWidth = 2
//   ctx.moveTo(localPoints[0].x, localPoints[0].y)
//   for (let i = 1; i < localPoints.length; i++) {
//     ctx.lineTo(localPoints[i].x, localPoints[i].y)
//   }
//   ctx.stroke()
// })


//   canvas.addEventListener('mouseup', finishStroke)
//   canvas.addEventListener('mouseleave', finishStroke)

//   function finishStroke() {
//     if (activeTool !== 'draw') return
//     if (!drawing || localPoints.length < 2) return

//     drawing = false

//     const stroke = new Y.Map()
//     stroke.set('id', crypto.randomUUID())
//     stroke.set('color', 'black')
//     stroke.set('width', 2)
//     stroke.set('points', localPoints)

//     yStrokes.push([stroke])
//     localPoints = []
//   }

//   /* -------------------- HELPERS -------------------- */
//   function updateCursor() {
//     canvas.style.cursor =
//       activeTool === 'draw'
//         ? 'crosshair'
//         : activeTool === 'select'
//         ? 'pointer'
//         : 'default'
//   }

//   function computeBounds(points) {
//     let minX = Infinity, minY = Infinity
//     let maxX = -Infinity, maxY = -Infinity
//     for (const p of points) {
//       minX = Math.min(minX, p.x)
//       minY = Math.min(minY, p.y)
//       maxX = Math.max(maxX, p.x)
//       maxY = Math.max(maxY, p.y)
//     }
//     return { x: minX, y: minY, w: maxX - minX, h: maxY - minY }
//   }

//   function distToSegment(p, a, b) {
//     const dx = b.x - a.x
//     const dy = b.y - a.y
//     const t =
//       ((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy)
//     const clamped = Math.max(0, Math.min(1, t))
//     return Math.hypot(
//       p.x - (a.x + clamped * dx),
//       p.y - (a.y + clamped * dy)
//     )
//   }

//   function hitTestStroke(node, x, y) {
//     if (
//       x < node.bounds.x ||
//       y < node.bounds.y ||
//       x > node.bounds.x + node.bounds.w ||
//       y > node.bounds.y + node.bounds.h
//     ) return false

//     const tol = node.width / 2 + 3
//     for (let i = 0; i < node.points.length - 1; i++) {
//       if (distToSegment({ x, y }, node.points[i], node.points[i + 1]) <= tol) {
//         return true
//       }
//     }
//     return false
//   }

//   function redrawScene() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height)
//     ctx.drawImage(buffer, 0, 0)

//     for (const node of scene) {
//       if (selectedIds.has(node.id)) {
//         node.draw(ctx, true)
//       }
//     }
//   }

//   return { setTool }
// }
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { StrokeNode } from './scene/StrokeNode'
import { DrawTool } from './Tools/DrawTool'
import { SelectTool } from './Tools/SelectTool'
import { EraserTool } from './Tools/EraserTool'
import { LineTool } from './Tools/LineTool'
import { RectangleTool } from './Tools/RectangleTool'
import { CircleTool } from './Tools/CircleTool'
import { FillTool } from './Tools/FillTool'
import { TextTool } from './Tools/TextTool'
import { EyedropperTool } from './Tools/EyedropperTool'
import { setTool, handlePointerDown, handlePointerMove, handlePointerUp } from './ToolManager'
import { drawSelectionBox } from './scene/selectionBox'

export function initCanvas(canvas) {
  const ctx = canvas.getContext('2d')
  const buffer = document.createElement('canvas')
  const bctx = buffer.getContext('2d')

  function resize() {
    const r = canvas.getBoundingClientRect()
    canvas.width = buffer.width = r.width
    canvas.height = buffer.height = r.height
  }

  resize()
  window.addEventListener('resize', resize)

  const ydoc = new Y.Doc()
  new WebsocketProvider('ws://localhost:1234', 'room-1', ydoc)
  const yStrokes = ydoc.getArray('strokes')
  const scene = []
  const selectedIds = new Set()
let overlayBox = null

function redraw(box = null) {
  overlayBox = box

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.drawImage(buffer, 0, 0)

  for (const node of scene) {
    if (selectedIds.has(node.id)) {
      node.draw(ctx, true)
    }
  }

  if (overlayBox) {
    drawSelectionBox(ctx, overlayBox)
  }
}


  yStrokes.observe(() => {
    bctx.clearRect(0, 0, buffer.width, buffer.height)
    scene.length = 0
    yStrokes.toArray().forEach(s => {
      const n = new StrokeNode(s)
      scene.push(n)
      n.draw(bctx)
    })
    redraw()
  })

  const drawTool   = new DrawTool(ctx, buffer, yStrokes)
  const selectTool = new SelectTool(scene, selectedIds, redraw)
  const eraserTool = new EraserTool(scene, selectedIds, yStrokes)
  const lineTool = new LineTool(ctx, buffer, yStrokes)
  const rectangleTool = new RectangleTool(ctx, buffer, yStrokes)
  const circleTool = new CircleTool(ctx, buffer, yStrokes)
  const fillTool = new FillTool(ctx, buffer, yStrokes)
  const textTool = new TextTool(ctx, buffer, yStrokes)
  
  // Eyedropper tool will be initialized with callback when needed
  let eyedropperTool = null;

  setTool(drawTool)

  canvas.onmousedown = e => {
    const r = canvas.getBoundingClientRect()
    handlePointerDown({ x: e.clientX - r.left, y: e.clientY - r.top, shiftKey: e.shiftKey })
  }
  canvas.onmousemove = e => {
    const r = canvas.getBoundingClientRect()
    handlePointerMove({ x: e.clientX - r.left, y: e.clientY - r.top })
  }
  canvas.onmouseup = () => handlePointerUp()

  return {
    setDraw: () => setTool(drawTool),
    setSelect: () => setTool(selectTool),
    setEraser: () => setTool(eraserTool),
    setLine: () => setTool(lineTool),
    setRectangle: () => setTool(rectangleTool),
    setCircle: () => setTool(circleTool),
    setFill: () => setTool(fillTool),
    setText: () => setTool(textTool),
    setEyedropper: (callback) => {
      // Create eyedropper tool with callback each time it's activated
      eyedropperTool = new EyedropperTool(ctx, buffer, callback);
      setTool(eyedropperTool);
    },
    setDrawOptions: (options) => {
      drawTool.setOptions(options);
      lineTool.setOptions(options);
      rectangleTool.setOptions(options);
      circleTool.setOptions(options);
      fillTool.setOptions(options);
      textTool.setOptions(options);
    },
  }
}
