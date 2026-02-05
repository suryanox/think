import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../stores'

const FADE_DELAY = 3000
const FADE_DURATION = 1000

export function useDisappearingInk() {
  const animationRef = useRef<number | null>(null)
  const { elements, updateElement, deleteElements } = useCanvasStore()

  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const disappearingElements = elements.filter(
        (el) => el.type === 'disappearing-pen' && el.createdAt
      )

      for (const element of disappearingElements) {
        const age = now - (element.createdAt || 0)

        if (age >= FADE_DELAY + FADE_DURATION) {
          deleteElements([element.id])
        } else if (age >= FADE_DELAY) {
          const fadeProgress = (age - FADE_DELAY) / FADE_DURATION
          const newOpacity = Math.max(0, 1 - fadeProgress)
          if (Math.abs(element.opacity - newOpacity) > 0.01) {
            updateElement(element.id, { opacity: newOpacity })
          }
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [elements, updateElement, deleteElements])
}
