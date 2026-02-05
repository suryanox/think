import { create } from 'zustand'
import type { ToolType } from '../types'

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
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  strokeColor: '#1e1e1e',
  fillColor: 'transparent',
  strokeWidth: 6,
  opacity: 1,
  setTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setOpacity: (opacity) => set({ opacity }),
}))
