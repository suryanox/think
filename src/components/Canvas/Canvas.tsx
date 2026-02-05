import { useEffect, useCallback, useRef, useState } from 'react'
import { Box } from '@mui/material'
import { v4 as uuid } from 'uuid'
import { useCanvas, usePan, useZoom } from '../../hooks'
import { useCanvasStore, useToolStore, useHistoryStore } from '../../stores'
import { screenToCanvas, normalizeRect, isPointInElement } from '../../utils/geometry'
import { SelectionBox } from './SelectionBox'
import { TextInput } from './TextInput'
import type { CanvasElement, Point } from '../../types'

export function Canvas() {
  const { canvasRef } = useCanvas()
  const { startPan, updatePan, endPan, isPanning } = usePan()
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

  const { activeTool, strokeColor, fillColor, strokeWidth, opacity } = useToolStore()
  const { pushState } = useHistoryStore()

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
      const base: CanvasElement = {
        id: uuid(),
        type: activeTool === 'select' || activeTool === 'pan' ? 'rectangle' : activeTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        rotation: 0,
        strokeColor,
        fillColor,
        strokeWidth,
        opacity,
        roughness: 1,
      }

      if (activeTool === 'pen' || activeTool === 'disappearing-pen') {
        base.points = [{ x: 0, y: 0 }]
        if (activeTool === 'disappearing-pen') {
          base.createdAt = Date.now()
          base.strokeColor = '#f472b6'
        }
      }

      if (activeTool === 'line' || activeTool === 'arrow') {
        base.points = [
          { x: 0, y: 0 },
          { x: 0, y: 0 },
        ]
      }

      return base
    },
    [activeTool, strokeColor, fillColor, strokeWidth, opacity]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (spacePressed.current || startPan(e)) return

      const point = getCanvasPoint(e)

      if (activeTool === 'select') {
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
        } else {
          setSelectedIds([])
        }
        return
      }

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
        case 'line':
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
        const point = getCanvasPoint(e as unknown as React.MouseEvent)
        const element: CanvasElement = {
          id: uuid(),
          type: 'image',
          x: point.x,
          y: point.y,
          width: 200,
          height: 200,
          rotation: 0,
          strokeColor: 'transparent',
          fillColor: 'transparent',
          strokeWidth: 0,
          opacity: 1,
          imageData: event.target?.result as string,
        }
        pushState(elements)
        addElement(element)
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
            const element: CanvasElement = {
              id: uuid(),
              type: 'image',
              x: viewport.x / viewport.zoom + 100,
              y: viewport.y / viewport.zoom + 100,
              width: 200,
              height: 200,
              rotation: 0,
              strokeColor: 'transparent',
              fillColor: 'transparent',
              strokeWidth: 0,
              opacity: 1,
              imageData: event.target?.result as string,
            }
            pushState(elements)
            addElement(element)
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

  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (activeTool !== 'select' || selectedIds.length === 0) return
      const point = getCanvasPoint(e)
      const clickedSelected = elements.find(
        (el) => selectedIds.includes(el.id) && isPointInElement(point, el)
      )
      if (clickedSelected) {
        dragStartRef.current = point
      }
    },
    [activeTool, selectedIds, elements, getCanvasPoint]
  )

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
      handleDragStart(e)
      handleMouseDown(e)
    },
    [handleDragStart, handleMouseDown]
  )

  const combinedMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragStartRef.current) {
        handleDrag(e)
      } else {
        handleMouseMove(e)
      }
    },
    [handleDrag, handleMouseMove]
  )

  const combinedMouseUp = useCallback(() => {
    handleDragEnd()
    handleMouseUp()
  }, [handleDragEnd, handleMouseUp])

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!textInputPos) return
      const element: CanvasElement = {
        id: uuid(),
        type: 'text',
        x: textInputPos.x,
        y: textInputPos.y,
        width: text.length * strokeWidth * 5,
        height: strokeWidth * 10,
        rotation: 0,
        strokeColor,
        fillColor: 'transparent',
        strokeWidth,
        opacity,
        text,
      }
      pushState(elements)
      addElement(element)
      setTextInputPos(null)
    },
    [textInputPos, strokeColor, strokeWidth, opacity, elements, pushState, addElement]
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
      <SelectionBox />
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
