import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../stores'
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/storage'

const AUTO_SAVE_INTERVAL = 5000

export function useAutoSave() {
  const { elements, setElements } = useCanvasStore()
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      const saved = loadFromLocalStorage()
      if (saved.length > 0) {
        setElements(saved)
      }
      initialized.current = true
    }
  }, [setElements])

  useEffect(() => {
    const interval = setInterval(() => {
      if (elements.length > 0) {
        saveToLocalStorage(elements)
      }
    }, AUTO_SAVE_INTERVAL)

    return () => clearInterval(interval)
  }, [elements])
}
