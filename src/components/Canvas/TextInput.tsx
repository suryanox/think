import { useState, useRef, useEffect } from 'react'
import { Box } from '@mui/material'
import { useCanvasStore, useToolStore, useThemeStore } from '../../stores'

interface TextInputProps {
  x: number
  y: number
  onSubmit: (text: string) => void
  onCancel: () => void
}

export function TextInput({ x, y, onSubmit, onCancel }: TextInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const { viewport } = useCanvasStore()
  const { strokeWidth } = useToolStore()
  const { isDark } = useThemeStore()
  const textColor = isDark ? '#ffffff' : '#1e1e1e'

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

  const screenX = x * viewport.zoom + viewport.x
  const screenY = y * viewport.zoom + viewport.y

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  return (
    <Box
      onMouseDown={stopPropagation}
      onClick={stopPropagation}
      sx={{
        position: 'absolute',
        left: screenX,
        top: screenY - 8,
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
          minWidth: 200,
          minHeight: 40,
          padding: '8px 12px',
          fontSize: Math.max(16, strokeWidth * 6),
          color: textColor,
          fontFamily: '"Virgil", "Caveat", "Segoe Print", cursive',
          backgroundColor: 'transparent',
          borderRadius: 8,
          border: '2px dashed #6366f1',
          resize: 'both',
          outline: 'none',
          overflow: 'auto',
        }}
      />
    </Box>
  )
}
