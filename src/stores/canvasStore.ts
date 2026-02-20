import { create } from 'zustand'
import { v4 as uuid } from 'uuid'
import type { CanvasElement, Viewport } from '../types'

interface CanvasState {
  elements: CanvasElement[]
  selectedIds: string[]
  viewport: Viewport
  isDrawing: boolean
  currentElement: CanvasElement | null
  clipboard: CanvasElement[]
  addElement: (element: CanvasElement) => void
  updateElement: (id: string, updates: Partial<CanvasElement>) => void
  deleteElements: (ids: string[]) => void
  setSelectedIds: (ids: string[]) => void
  setViewport: (viewport: Partial<Viewport>) => void
  setIsDrawing: (isDrawing: boolean) => void
  setCurrentElement: (element: CanvasElement | null) => void
  setElements: (elements: CanvasElement[]) => void
  clearCanvas: () => void
  copySelectedElements: () => void
  pasteElements: () => void
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  elements: [],
  selectedIds: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDrawing: false,
  currentElement: null,
  clipboard: [],

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

  copySelectedElements: () => {
    const { elements, selectedIds } = get()
    const selectedElements = elements.filter((el) => selectedIds.includes(el.id))
    set({ clipboard: selectedElements })
  },

  pasteElements: () => {
    const { clipboard, elements } = get()
    if (clipboard.length === 0) return

    const pasteOffset = 20
    const newElements = clipboard.map((el) => ({
      ...el,
      id: uuid(),
      x: el.x + pasteOffset,
      y: el.y + pasteOffset,
    }))

    const newIds = newElements.map((el) => el.id)
    set({
      elements: [...elements, ...newElements],
      selectedIds: newIds,
      clipboard: newElements,
    })
  },
}))
