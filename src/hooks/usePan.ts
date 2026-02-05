import { useCallback, useRef } from 'react'
import { useCanvasStore, useToolStore } from '../stores'

export function usePan() {
  const isPanning = useRef(false)
  const lastPos = useRef({ x: 0, y: 0 })
  const { viewport, setViewport } = useCanvasStore()
  const { activeTool } = useToolStore()

  const startPan = useCallback(
    (e: React.MouseEvent | MouseEvent, force = false) => {
      if (force || activeTool === 'pan' || e.button === 1) {
        isPanning.current = true
        lastPos.current = { x: e.clientX, y: e.clientY }
        return true
      }
      return false
    },
    [activeTool]
  )

  const updatePan = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!isPanning.current) return false

      const dx = e.clientX - lastPos.current.x
      const dy = e.clientY - lastPos.current.y

      setViewport({
        x: viewport.x + dx,
        y: viewport.y + dy,
      })

      lastPos.current = { x: e.clientX, y: e.clientY }
      return true
    },
    [viewport, setViewport]
  )

  const endPan = useCallback(() => {
    isPanning.current = false
  }, [])

  return { startPan, updatePan, endPan, isPanning: () => isPanning.current }
}
