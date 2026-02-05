import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  isDark: boolean
  toggle: () => void
  setDark: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDark: window.matchMedia('(prefers-color-scheme: dark)').matches,
      toggle: () => set((state) => ({ isDark: !state.isDark })),
      setDark: (isDark) => set({ isDark }),
    }),
    {
      name: 'think-theme',
    }
  )
)
