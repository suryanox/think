import { useRef, useCallback, useEffect } from 'react'
import { useCanvasStore, useThemeStore } from '../stores'
import { createRoughCanvas, drawElement } from '../utils/roughHelpers'
import { getCanvasBackground } from '../theme'

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderRef = useRef<() => void>(() => {})
  const { elements, viewport, currentElement } = useCanvasStore()
  const { isDark } = useThemeStore()

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas.getBoundingClientRect()
    canvas.width = width * window.devicePixelRatio
    canvas.height = height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)

    ctx.fillStyle = getCanvasBackground(isDark)
    ctx.fillRect(0, 0, width, height)

    ctx.save()
    ctx.translate(viewport.x, viewport.y)
    ctx.scale(viewport.zoom, viewport.zoom)

    const rc = createRoughCanvas(canvas)

    const handleImageLoad = () => renderRef.current()

    for (const element of elements) {
      drawElement(rc, ctx, element, isDark, handleImageLoad)
    }

    if (currentElement) {
      drawElement(rc, ctx, currentElement, isDark, handleImageLoad)
    }

    ctx.restore()
  }, [elements, viewport, currentElement, isDark])

  renderRef.current = render

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => render()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [render])

  return { canvasRef, render }
}
