import { useCallback } from 'react'
import { useCanvasStore } from '../stores'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 5
const ZOOM_SENSITIVITY = 0.001

export function useZoom() {
  const { viewport, setViewport } = useCanvasStore()

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault()

      const delta = -e.deltaY * ZOOM_SENSITIVITY
      const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, viewport.zoom + delta * viewport.zoom))

      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const zoomRatio = newZoom / viewport.zoom

      const newX = mouseX - (mouseX - viewport.x) * zoomRatio
      const newY = mouseY - (mouseY - viewport.y) * zoomRatio

      setViewport({
        x: newX,
        y: newY,
        zoom: newZoom,
      })
    },
    [viewport, setViewport]
  )

  const zoomIn = useCallback(() => {
    setViewport({ zoom: Math.min(MAX_ZOOM, viewport.zoom * 1.2) })
  }, [viewport, setViewport])

  const zoomOut = useCallback(() => {
    setViewport({ zoom: Math.max(MIN_ZOOM, viewport.zoom / 1.2) })
  }, [viewport, setViewport])

  const resetZoom = useCallback(() => {
    setViewport({ x: 0, y: 0, zoom: 1 })
  }, [setViewport])

  return { handleWheel, zoomIn, zoomOut, resetZoom }
}
