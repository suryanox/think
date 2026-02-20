import { useEffect, useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { v4 as uuid } from 'uuid'
import { useCanvas, usePan, useZoom } from '../../hooks'
import { useCanvasStore, useToolStore, useHistoryStore, useThemeStore } from '../../stores'
import { screenToCanvas, normalizeRect, isPointInElement, getElementBounds } from '../../utils/geometry'
import { SelectionBox } from './SelectionBox'
import { TextInput } from './TextInput'
import type { CanvasElement, Point, HandlePosition } from '../../types'

export function Canvas() {
  const { canvasRef } = useCanvas()
  const { startPan, updatePan, endPan } = usePan()
  const { handleWheel } = useZoom()
  const containerRef = useRef<HTMLDivElement>(null)
  const spacePressed = useRef(false)
  const [textInputPos, setTextInputPos] = useState<Point | null>(null)

  const {
    elements,
    viewport,
    isDrawing,
    currentElement,
    setIsDrawing,
    setCurrentElement,
    addElement,
    setSelectedIds,
    selectedIds,
    updateElement,
  } = useCanvasStore()

  const { activeTool, strokeColor, fillColor, strokeWidth, opacity, getDefaultStrokeColor } = useToolStore()
  const { pushState } = useHistoryStore()
  const { isDark } = useThemeStore()
  const effectiveStrokeColor = strokeColor || getDefaultStrokeColor()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('wheel', handleWheel, { passive: false })
    return () => container.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !spacePressed.current) {
        spacePressed.current = true
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed.current = false
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }
      return screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport)
    },
    [viewport]
  )

  const createElement = useCallback(
    (point: Point): CanvasElement => {
      const defaultColor = isDark ? '#ffffff' : '#1e1e1e'
      const base: CanvasElement = {
        id: uuid(),
        type: activeTool === 'pan' ? 'rectangle' : activeTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        rotation: 0,
        strokeColor: effectiveStrokeColor || defaultColor,
        fillColor,
        strokeWidth,
        opacity,
        roughness: 1,
        seed: Math.floor(Math.random() * 2147483647),
      }

      if (activeTool === 'pen' || activeTool === 'disappearing-pen' || activeTool === 'line') {
        base.points = [{ x: 0, y: 0 }]
        if (activeTool === 'disappearing-pen') {
          base.createdAt = Date.now()
          base.strokeColor = '#f472b6'
        }
      }

      if (activeTool === 'arrow') {
        base.points = [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]
      }

      return base
    },
    [activeTool, effectiveStrokeColor, fillColor, strokeWidth, opacity, isDark]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (spacePressed.current || startPan(e)) return

      const point = getCanvasPoint(e)

      if (activeTool === 'text') {
        setTextInputPos(point)
        return
      }

      if (activeTool === 'pan') return

      setIsDrawing(true)
      const element = createElement(point)
      setCurrentElement(element)
    },
    [
      startPan,
      getCanvasPoint,
      activeTool,
      elements,
      selectedIds,
      setSelectedIds,
      createElement,
      setIsDrawing,
      setCurrentElement,
      pushState,
      addElement,
      strokeWidth,
    ]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (spacePressed.current && e.buttons === 1) {
        startPan(e, true)
      }

      if (updatePan(e)) return

      if (!isDrawing || !currentElement) return

      const point = getCanvasPoint(e)
      const dx = point.x - currentElement.x
      const dy = point.y - currentElement.y

      let updates: Partial<CanvasElement> = {}

      switch (currentElement.type) {
        case 'rectangle':
        case 'ellipse': {
          const normalized = normalizeRect(currentElement.x, currentElement.y, point.x, point.y)
          updates = {
            x: normalized.x,
            y: normalized.y,
            width: normalized.width,
            height: normalized.height,
          }
          break
        }
        case 'arrow':
          updates = {
            width: Math.abs(dx),
            height: Math.abs(dy),
            points: [
              { x: 0, y: 0 },
              { x: dx, y: dy },
            ],
          }
          break
        case 'line':
        case 'pen':
        case 'disappearing-pen':
          updates = {
            points: [...(currentElement.points || []), { x: dx, y: dy }],
          }
          break
      }

      setCurrentElement({ ...currentElement, ...updates })
    },
    [isDrawing, currentElement, getCanvasPoint, updatePan, setCurrentElement, startPan]
  )

  const handleMouseUp = useCallback(() => {
    endPan()

    if (!isDrawing || !currentElement) return

    setIsDrawing(false)

    const hasSize =
      currentElement.width > 2 ||
      currentElement.height > 2 ||
      (currentElement.points && currentElement.points.length > 2)

    if (hasSize) {
      pushState(elements)
      addElement(currentElement)
    }

    setCurrentElement(null)
  }, [isDrawing, currentElement, setIsDrawing, addElement, setCurrentElement, endPan, pushState, elements])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (!file || !file.type.startsWith('image/')) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        const img = new Image()
        img.onload = () => {
          const point = getCanvasPoint(e as unknown as React.MouseEvent)
          const element: CanvasElement = {
            id: uuid(),
            type: 'image',
            x: point.x,
            y: point.y,
            width: img.naturalWidth,
            height: img.naturalHeight,
            rotation: 0,
            strokeColor: 'transparent',
            fillColor: 'transparent',
            strokeWidth: 0,
            opacity: 1,
            imageData: dataUrl,
            seed: Math.floor(Math.random() * 2147483647),
          }
          pushState(elements)
          addElement(element)
        }
        img.src = dataUrl
      }
      reader.readAsDataURL(file)
    },
    [getCanvasPoint, addElement, pushState, elements]
  )

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (!file) continue

          const reader = new FileReader()
          reader.onload = (event) => {
            const dataUrl = event.target?.result as string
            const img = new Image()
            img.onload = () => {
              const element: CanvasElement = {
                id: uuid(),
                type: 'image',
                x: -viewport.x / viewport.zoom + 100,
                y: -viewport.y / viewport.zoom + 100,
                width: img.naturalWidth,
                height: img.naturalHeight,
                rotation: 0,
                strokeColor: 'transparent',
                fillColor: 'transparent',
                strokeWidth: 0,
                opacity: 1,
                imageData: dataUrl,
                seed: Math.floor(Math.random() * 2147483647),
              }
              pushState(elements)
              addElement(element)
            }
            img.src = dataUrl
          }
          reader.readAsDataURL(file)
          break
        }
      }
    },
    [addElement, viewport, pushState, elements]
  )

  useEffect(() => {
    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [handlePaste])

  const dragStartRef = useRef<Point | null>(null)
  const resizeRef = useRef<{ handle: HandlePosition; startPoint: Point; startBounds: { x: number; y: number; width: number; height: number } } | null>(null)

  const handleResizeStart = useCallback(
    (handle: HandlePosition, e: React.MouseEvent) => {
      if (selectedIds.length !== 1) return
      const element = elements.find((el) => el.id === selectedIds[0])
      if (!element) return
      
      const point = getCanvasPoint(e)
      const bounds = getElementBounds(element)
      resizeRef.current = {
        handle,
        startPoint: point,
        startBounds: bounds,
      }
    },
    [selectedIds, elements, getCanvasPoint]
  )

  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      if (!resizeRef.current || selectedIds.length !== 1) return
      
      const element = elements.find((el) => el.id === selectedIds[0])
      if (!element) return
      
      const point = getCanvasPoint(e)
      const { handle, startPoint, startBounds } = resizeRef.current
      const dx = point.x - startPoint.x
      const dy = point.y - startPoint.y
      
      let newX = startBounds.x
      let newY = startBounds.y
      let newWidth = startBounds.width
      let newHeight = startBounds.height
      
      if (handle.includes('w')) {
        newX = startBounds.x + dx
        newWidth = startBounds.width - dx
      }
      if (handle.includes('e')) {
        newWidth = startBounds.width + dx
      }
      if (handle.includes('n')) {
        newY = startBounds.y + dy
        newHeight = startBounds.height - dy
      }
      if (handle.includes('s')) {
        newHeight = startBounds.height + dy
      }
      
      if (newWidth > 10 && newHeight > 10) {
        if (element.type === 'text') {
          updateElement(selectedIds[0], { 
            x: newX, 
            y: newY + newHeight,
            width: newWidth, 
            height: newHeight 
          })
        } else {
          updateElement(selectedIds[0], { x: newX, y: newY, width: newWidth, height: newHeight })
        }
      }
    },
    [selectedIds, elements, getCanvasPoint, updateElement]
  )

  const handleResizeEnd = useCallback(() => {
    if (resizeRef.current) {
      pushState(elements)
    }
    resizeRef.current = null
  }, [pushState, elements])

  const handleDrag = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStartRef.current || selectedIds.length === 0) return

      const point = getCanvasPoint(e)
      const dx = point.x - dragStartRef.current.x
      const dy = point.y - dragStartRef.current.y

      for (const id of selectedIds) {
        const el = elements.find((e) => e.id === id)
        if (el) {
          updateElement(id, { x: el.x + dx, y: el.y + dy })
        }
      }
      dragStartRef.current = point
    },
    [selectedIds, elements, getCanvasPoint, updateElement]
  )

  const handleDragEnd = useCallback(() => {
    if (dragStartRef.current && selectedIds.length > 0) {
      pushState(elements)
    }
    dragStartRef.current = null
  }, [pushState, elements, selectedIds])

  const combinedMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool === 'pan') {
        const point = getCanvasPoint(e)
        const clickedElement = [...elements].reverse().find((el) => isPointInElement(point, el))
        
        if (clickedElement) {
          if (e.shiftKey) {
            if (selectedIds.includes(clickedElement.id)) {
              setSelectedIds(selectedIds.filter((id) => id !== clickedElement.id))
            } else {
              setSelectedIds([...selectedIds, clickedElement.id])
            }
          } else {
            if (!selectedIds.includes(clickedElement.id)) {
              setSelectedIds([clickedElement.id])
            }
          }
          dragStartRef.current = point
          return
        } else {
          setSelectedIds([])
          startPan(e, true)
          return
        }
      }
      handleMouseDown(e)
    },
    [activeTool, elements, selectedIds, setSelectedIds, getCanvasPoint, handleMouseDown, startPan]
  )

  const combinedMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (resizeRef.current) {
        handleResize(e)
      } else if (dragStartRef.current) {
        handleDrag(e)
      } else {
        handleMouseMove(e)
      }
    },
    [handleResize, handleDrag, handleMouseMove]
  )

  const combinedMouseUp = useCallback(() => {
    handleResizeEnd()
    handleDragEnd()
    handleMouseUp()
  }, [handleResizeEnd, handleDragEnd, handleMouseUp])

  const handleTextSubmit = useCallback(
    (text: string, width: number, height: number) => {
      if (!textInputPos) return
      const defaultColor = isDark ? '#ffffff' : '#1e1e1e'
      const element: CanvasElement = {
        id: uuid(),
        type: 'text',
        x: textInputPos.x,
        y: textInputPos.y + height,
        width,
        height,
        rotation: 0,
        strokeColor: effectiveStrokeColor || defaultColor,
        fillColor: 'transparent',
        strokeWidth,
        opacity,
        text,
        seed: Math.floor(Math.random() * 2147483647),
      }
      pushState(elements)
      addElement(element)
      setTextInputPos(null)
    },
    [textInputPos, effectiveStrokeColor, strokeWidth, opacity, elements, pushState, addElement, isDark]
  )

  const handleTextCancel = useCallback(() => {
    setTextInputPos(null)
  }, [])

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: spacePressed.current || activeTool === 'pan' ? 'grab' : 'crosshair',
      }}
      onMouseDown={combinedMouseDown}
      onMouseMove={combinedMouseMove}
      onMouseUp={combinedMouseUp}
      onMouseLeave={combinedMouseUp}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
      <SelectionBox onResizeStart={handleResizeStart} />
      {textInputPos && (
        <TextInput
          x={textInputPos.x}
          y={textInputPos.y}
          onSubmit={handleTextSubmit}
          onCancel={handleTextCancel}
        />
      )}
    </Box>
  )
}
