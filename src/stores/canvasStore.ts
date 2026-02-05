import { create } from 'zustand'
import type { CanvasElement, Viewport } from '../types'

interface CanvasState {
  elements: CanvasElement[]
  selectedIds: string[]
  viewport: Viewport
  isDrawing: boolean
  currentElement: CanvasElement | null
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElements: (ids: string[]) => void
  setSelectedIds: (ids: string[]) => void
  setViewport: (viewport: Partial<Viewport>) => void
  setIsDrawing: (isDrawing: boolean) => void
  setCurrentElement: (element: CanvasElement | null) => void
  setElements: (elements: CanvasElement[]) => void
  clearCanvas: () => void
}

export const useCanvasStore = create<CanvasState>((set) => ({
  elements: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDrawing: false,
  currentElement: null,

  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  deleteElements: (ids) =>
    set((state) => ({
      elements: state.elements.filter((el) => !ids.includes(el.id)),
      selectedIds: state.selectedIds.filter((id) => !ids.includes(id)),
    })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),

  setIsDrawing: (isDrawing) => set({ isDrawing }),

  setCurrentElement: (element) => set({ currentElement: element }),

  setElements: (elements) => set({ elements }),

  clearCanvas: () => set({ elements: [], selectedIds: [] }),
}))
