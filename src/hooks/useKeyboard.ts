import { useEffect, useCallback } from 'react'
import { useToolStore, useCanvasStore, useHistoryStore } from '../stores'
import type { ToolType } from '../types'

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
  l: 'line',
  a: 'arrow',
  p: 'pen',
  t: 'text',
  d: 'disappearing-pen',
  h: 'pan',
}

export function useKeyboard() {
  const { setTool } = useToolStore()
  const { selectedIds, deleteElements } = useCanvasStore()
  const { undo, redo } = useHistoryStore()

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()

      if (e.ctrlKey || e.metaKey) {
        switch (key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) {
              redo()
            } else {
              undo()
            }
            break
          case 'y':
            e.preventDefault()
            redo()
            break
        }
        return
      }

      if (TOOL_SHORTCUTS[key]) {
        setTool(TOOL_SHORTCUTS[key])
        return
      }

      if (key === 'delete' || key === 'backspace') {
        if (selectedIds.length > 0) {
          deleteElements(selectedIds)
        }
      }

      if (key === 'escape') {
        useCanvasStore.getState().setSelectedIds([])
      }
    },
    [setTool, selectedIds, deleteElements, undo, redo]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
