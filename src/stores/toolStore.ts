import { create } from 'zustand'
import type { ToolType } from '../types'
import { useThemeStore } from './themeStore'

interface ToolState {
  activeTool: ToolType
  strokeColor: string
  fillColor: string
  strokeWidth: number
  opacity: number
  setTool: (tool: ToolType) => void
  setStrokeColor: (color: string) => void
  setFillColor: (color: string) => void
  setStrokeWidth: (width: number) => void
  setOpacity: (opacity: number) => void
  getDefaultStrokeColor: () => string
}

export const useToolStore = create<ToolState>((set, get) => ({
  activeTool: 'select',
  strokeColor: '',
  fillColor: 'transparent',
  strokeWidth: 8,
  opacity: 1,
  setTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setOpacity: (opacity) => set({ opacity }),
  getDefaultStrokeColor: () => {
    const isDark = useThemeStore.getState().isDark
    const current = get().strokeColor
    if (current && current !== '#1e1e1e' && current !== '#ffffff') {
      return current
    }
    return isDark ? '#ffffff' : '#1e1e1e'
  },
}))
