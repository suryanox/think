import { useState, useRef, useEffect } from 'react'
import { InputBase } from '@mui/material'
import { useCanvasStore, useToolStore } from '../../stores'

interface TextInputProps {
  x: number
  y: number
  onSubmit: (text: string) => void
  onCancel: () => void
}

export function TextInput({ x, y, onSubmit, onCancel }: TextInputProps) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const { viewport } = useCanvasStore()
  const { strokeColor, strokeWidth } = useToolStore()

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus()
    }, 10)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
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

  const handleBlur = () => {
    if (value.trim()) {
      onSubmit(value)
    } else {
      onCancel()
    }
  }

  const screenX = x * viewport.zoom + viewport.x
  const screenY = y * viewport.zoom + viewport.y

  return (
    <InputBase
      inputRef={inputRef}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      autoFocus
      multiline
      placeholder="Type here..."
      sx={{
        position: 'absolute',
        left: screenX,
        top: screenY - 8,
        minWidth: 150,
        padding: '4px 8px',
        fontSize: strokeWidth * 8,
        color: strokeColor,
        fontFamily: '"JetBrains Mono", "Fira Code", monospace',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 1,
        border: '2px solid',
        borderColor: 'primary.main',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 1000,
      }}
    />
  )
}
