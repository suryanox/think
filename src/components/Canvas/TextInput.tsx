import { useState, useRef, useEffect, useCallback } from 'react'
import { useCanvasStore, useThemeStore } from '../../stores'

interface TextInputProps {
  x: number
  y: number
  onSubmit: (text: string, width: number, height: number) => void
  onCancel: () => void
}

const MIN_WIDTH = 100
const MIN_HEIGHT = 50
const INITIAL_WIDTH = 200
const INITIAL_HEIGHT = 80
const HANDLE_SIZE = 12

export function TextInput({ x, y, onSubmit, onCancel }: TextInputProps) {
  const [value, setValue] = useState('')
  const [size, setSize] = useState({ width: INITIAL_WIDTH, height: INITIAL_HEIGHT })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null)
  const { viewport } = useCanvasStore()
  const { isDark } = useThemeStore()
  
  const screenX = x * viewport.zoom + viewport.x
  const screenY = y * viewport.zoom + viewport.y
  const fontSize = Math.max(16, size.height * 0.35)

  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus()
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (value.trim()) {
          onSubmit(value, size.width, size.height)
        } else {
          onCancel()
        }
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 200)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [value, size, onSubmit, onCancel])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation()
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (value.trim()) {
        onSubmit(value, size.width, size.height)
      } else {
        onCancel()
      }
    }
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
    }

    const handleMouseMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return
      const dx = ev.clientX - resizeRef.current.startX
      const dy = ev.clientY - resizeRef.current.startY
      setSize({
        width: Math.max(MIN_WIDTH, resizeRef.current.startW + dx),
        height: Math.max(MIN_HEIGHT, resizeRef.current.startH + dy),
      })
    }

    const handleMouseUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [size])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        left: screenX,
        top: screenY,
        width: size.width,
        height: size.height,
        zIndex: 1000,
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type here..."
        style={{
          width: '100%',
          height: '100%',
          padding: 12,
          fontSize,
          lineHeight: 1.3,
          color: isDark ? '#ffffff' : '#000000',
          fontFamily: '"Virgil", "Caveat", cursive',
          background: isDark ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
          border: '2px solid #6366f1',
          borderRadius: 8,
          outline: 'none',
          resize: 'none',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      />
      <div
        onMouseDown={handleResizeStart}
        style={{
          position: 'absolute',
          right: -HANDLE_SIZE / 2,
          bottom: -HANDLE_SIZE / 2,
          width: HANDLE_SIZE,
          height: HANDLE_SIZE,
          background: '#6366f1',
          borderRadius: 2,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  )
}
