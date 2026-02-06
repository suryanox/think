import { useState, useRef, useEffect, useCallback } from 'react'
import { Box } from '@mui/material'
import { useCanvasStore, useThemeStore } from '../../stores'

interface TextInputProps {
  x: number
  y: number
  onSubmit: (text: string) => void
  onCancel: () => void
}

type HandlePosition = 'n' | 's' | 'e' | 'w' | 'nw' | 'ne' | 'sw' | 'se'

const HANDLE_SIZE = 8

const handles: { position: HandlePosition; cursor: string; style: object }[] = [
  { position: 'nw', cursor: 'nwse-resize', style: { top: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { position: 'n', cursor: 'ns-resize', style: { top: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
  { position: 'ne', cursor: 'nesw-resize', style: { top: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
  { position: 'w', cursor: 'ew-resize', style: { top: '50%', left: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' } },
  { position: 'e', cursor: 'ew-resize', style: { top: '50%', right: -HANDLE_SIZE / 2, transform: 'translateY(-50%)' } },
  { position: 'sw', cursor: 'nesw-resize', style: { bottom: -HANDLE_SIZE / 2, left: -HANDLE_SIZE / 2 } },
  { position: 's', cursor: 'ns-resize', style: { bottom: -HANDLE_SIZE / 2, left: '50%', transform: 'translateX(-50%)' } },
  { position: 'se', cursor: 'nwse-resize', style: { bottom: -HANDLE_SIZE / 2, right: -HANDLE_SIZE / 2 } },
]

export function TextInput({ x, y, onSubmit, onCancel }: TextInputProps) {
  const [value, setValue] = useState('')
  const [size, setSize] = useState({ width: 200, height: 60 })
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ handle: HandlePosition; startX: number; startY: number; startSize: { width: number; height: number }; startPos: { x: number; y: number } } | null>(null)
  const { viewport } = useCanvasStore()
  const { isDark } = useThemeStore()
  const textColor = isDark ? '#ffffff' : '#1e1e1e'

  const fontSize = Math.max(16, Math.min(size.height * 0.4, 120))

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit(value)
      } else {
        onCancel()
      }
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleResizeStart = useCallback((handle: HandlePosition, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      startSize: { ...size },
      startPos: { ...position },
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizeRef.current) return
      
      const dx = moveEvent.clientX - resizeRef.current.startX
      const dy = moveEvent.clientY - resizeRef.current.startY
      const { handle, startSize, startPos } = resizeRef.current

      let newWidth = startSize.width
      let newHeight = startSize.height
      let newX = startPos.x
      let newY = startPos.y

      if (handle.includes('e')) newWidth = Math.max(100, startSize.width + dx)
      if (handle.includes('w')) {
        newWidth = Math.max(100, startSize.width - dx)
        newX = startPos.x + dx
      }
      if (handle.includes('s')) newHeight = Math.max(40, startSize.height + dy)
      if (handle.includes('n')) {
        newHeight = Math.max(40, startSize.height - dy)
        newY = startPos.y + dy
      }

      setSize({ width: newWidth, height: newHeight })
      setPosition({ x: newX, y: newY })
    }

    const handleMouseUp = () => {
      resizeRef.current = null
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [size, position])

  const screenX = x * viewport.zoom + viewport.x + position.x
  const screenY = y * viewport.zoom + viewport.y + position.y

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Box
      ref={containerRef}
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      sx={{
        position: 'absolute',
        left: screenX,
        top: screenY - 8,
        width: size.width,
        height: size.height,
        zIndex: 1000,
      }}
    >
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
        placeholder="Type here..."
        style={{
          width: '100%',
          height: '100%',
          padding: '8px 12px',
          fontSize,
          color: textColor,
          fontFamily: '"Virgil", "Caveat", "Segoe Print", cursive',
          backgroundColor: 'transparent',
          borderRadius: 8,
          border: '2px dashed #6366f1',
          resize: 'none',
          outline: 'none',
          overflow: 'auto',
          boxSizing: 'border-box',
        }}
      />
      {handles.map((handle) => (
        <Box
          key={handle.position}
          onMouseDown={(e) => handleResizeStart(handle.position, e)}
          sx={{
            position: 'absolute',
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            backgroundColor: '#ffffff',
            border: '2px solid #6366f1',
            borderRadius: '2px',
            cursor: handle.cursor,
            zIndex: 10,
            ...handle.style,
          }}
        />
      ))}
    </Box>
  )
}
