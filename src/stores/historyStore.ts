import { create } from 'zustand'
import type { CanvasElement } from '../types'
import { useCanvasStore } from './canvasStore'

interface HistoryState {
  past: CanvasElement[][]
  future: CanvasElement[][]
  pushState: (elements: CanvasElement[]) => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  clear: () => void
}

const MAX_HISTORY = 50

export const useHistoryStore = create<HistoryState>((set, get) => ({
  past: [],
  future: [],

  pushState: (elements) =>
    set((state) => ({
      past: [...state.past.slice(-MAX_HISTORY + 1), elements],
      future: [],
    })),

  undo: () => {
    const { past, future } = get()
    if (past.length === 0) return

    const currentElements = useCanvasStore.getState().elements
    const previousState = past[past.length - 1]

    set({
      past: past.slice(0, -1),
      future: [currentElements, ...future],
    })

    useCanvasStore.getState().setElements(previousState)
  },

  redo: () => {
    const { past, future } = get()
    if (future.length === 0) return

    const currentElements = useCanvasStore.getState().elements
    const nextState = future[0]

    set({
      past: [...past, currentElements],
      future: future.slice(1),
    })

    useCanvasStore.getState().setElements(nextState)
  },

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,

  clear: () => set({ past: [], future: [] }),
}))
