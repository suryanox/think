import { useEffect, useCallback } from 'react'
import { useToolStore, useCanvasStore, useHistoryStore } from '../stores'
import type { ToolType } from '../types'

const TOOL_SHORTCUTS: Record<string, ToolType> = {
  h: 'pan',
  v: 'pan',
  r: 'rectangle',
  o: 'ellipse',
  l: 'line',
  a: 'arrow',
  p: 'pen',
  t: 'text',
  d: 'disappearing-pen',
}

export function useKeyboard() {
  const { setTool } = useToolStore()
  const { selectedIds, deleteElements, copySelectedElements, pasteElements } = useCanvasStore()
  const { undo, redo, pushState } = useHistoryStore()

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
          case 'c':
            e.preventDefault()
            if (selectedIds.length > 0) {
              copySelectedElements()
            }
            break
          case 'v':
            e.preventDefault()
            const { clipboard, elements } = useCanvasStore.getState()
            if (clipboard.length > 0) {
              pushState(elements)
              pasteElements()
            }
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
          const { elements } = useCanvasStore.getState()
          pushState(elements)
          deleteElements(selectedIds)
        }
      }

      if (key === 'escape') {
        useCanvasStore.getState().setSelectedIds([])
      }
    },
    [setTool, selectedIds, deleteElements, undo, redo, copySelectedElements, pasteElements, pushState]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}
