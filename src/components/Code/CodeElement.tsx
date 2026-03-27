import { useCallback, useRef } from 'react'
import { Box } from '@mui/material'
import { Code } from './Code'
import { useCanvasStore, useHistoryStore } from '../../stores'
import type { CanvasElement, Viewport } from '../../types'

interface CodeElementProps {
    element: CanvasElement
    viewport: Viewport
}

export function CodeElement({ element, viewport }: CodeElementProps) {
    const { elements, updateElement, deleteElements } = useCanvasStore()
    const { pushState } = useHistoryStore()
    const dragStartRef = useRef<{ mouseX: number; mouseY: number; elementX: number; elementY: number } | null>(null)
    const resizeStartRef = useRef<{ mouseX: number; mouseY: number; width: number; height: number; corner: string } | null>(null)

    const handleClose = useCallback(() => {
        deleteElements([element.id])
    }, [deleteElements, element.id])

    const handleCodeChange = useCallback(
        (code: string) => {
            updateElement(element.id, { code })
        },
        [updateElement, element.id]
    )

    const handleDragStart = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            dragStartRef.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                elementX: element.x,
                elementY: element.y,
            }

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!dragStartRef.current) return
                const dx = (moveEvent.clientX - dragStartRef.current.mouseX) / viewport.zoom
                const dy = (moveEvent.clientY - dragStartRef.current.mouseY) / viewport.zoom
                updateElement(element.id, {
                    x: dragStartRef.current.elementX + dx,
                    y: dragStartRef.current.elementY + dy,
                })
            }

            const handleMouseUp = () => {
                if (dragStartRef.current) {
                    pushState(elements)
                }
                dragStartRef.current = null
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        },
        [element.id, element.x, element.y, viewport.zoom, updateElement, pushState, elements]
    )

    const handleResizeStart = useCallback(
        (corner: string) => (e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            resizeStartRef.current = {
                mouseX: e.clientX,
                mouseY: e.clientY,
                width: element.width,
                height: element.height,
                corner,
            }

            const handleMouseMove = (moveEvent: MouseEvent) => {
                if (!resizeStartRef.current) return
                const dx = (moveEvent.clientX - resizeStartRef.current.mouseX) / viewport.zoom
                const dy = (moveEvent.clientY - resizeStartRef.current.mouseY) / viewport.zoom

                let newWidth = resizeStartRef.current.width
                let newHeight = resizeStartRef.current.height

                if (corner.includes('e')) newWidth = Math.max(300, resizeStartRef.current.width + dx)
                if (corner.includes('s')) newHeight = Math.max(200, resizeStartRef.current.height + dy)
                if (corner.includes('w')) newWidth = Math.max(300, resizeStartRef.current.width - dx)
                if (corner.includes('n')) newHeight = Math.max(200, resizeStartRef.current.height - dy)

                updateElement(element.id, { width: newWidth, height: newHeight })
            }

            const handleMouseUp = () => {
                if (resizeStartRef.current) {
                    pushState(elements)
                }
                resizeStartRef.current = null
                window.removeEventListener('mousemove', handleMouseMove)
                window.removeEventListener('mouseup', handleMouseUp)
            }

            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        },
        [element.id, element.width, element.height, viewport.zoom, updateElement, pushState, elements]
    )

    const screenX = element.x * viewport.zoom + viewport.x
    const screenY = element.y * viewport.zoom + viewport.y

    return (
        <Box
            sx={{
                position: 'absolute',
                left: screenX,
                top: screenY,
                transform: `scale(${viewport.zoom})`,
                transformOrigin: 'top left',
                zIndex: 100,
            }}
        >
            <Code
                initialCode={element.code || undefined}
                onClose={handleClose}
                onCodeChange={handleCodeChange}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                width={element.width}
                height={element.height}
            />
        </Box>
    )
}
