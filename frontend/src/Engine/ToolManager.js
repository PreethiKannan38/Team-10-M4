let currentTool = null

export function setTool(tool) {
  currentTool?.onCancel?.()
  currentTool = tool
}

export function handlePointerDown(e) {
  currentTool?.onPointerDown(e)
}

export function handlePointerMove(e) {
  currentTool?.onPointerMove(e)
}

export function handlePointerUp(e) {
  currentTool?.onPointerUp(e)
}
