import type { CanvasElement } from '../types'

const STORAGE_KEY = 'think-canvas-data'

export function saveToLocalStorage(elements: CanvasElement[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements))
  } catch (e) {
    console.error('Failed to save to localStorage:', e)
  }
}

export function loadFromLocalStorage(): CanvasElement[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load from localStorage:', e)
  }
  return []
}

export function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    console.error('Failed to clear localStorage:', e)
  }
}
