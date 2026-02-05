import { createTheme } from '@mui/material/styles'
import type { ThemeOptions } from '@mui/material/styles'

const commonOptions: ThemeOptions = {
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
}

export const lightTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1',
    },
    secondary: {
      main: '#ec4899',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
})

export const darkTheme = createTheme({
  ...commonOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8',
    },
    secondary: {
      main: '#f472b6',
    },
    background: {
      default: '#0f172a',
      paper: '#1e293b',
    },
  },
})

export const getCanvasBackground = (isDark: boolean) => 
  isDark ? '#1e293b' : '#ffffff'

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

const isLightColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness > 200
}

const isDarkColor = (hex: string): boolean => {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  return brightness < 50
}

export const getThemeAwareColor = (color: string, isDark: boolean): string => {
  if (!color || color === 'transparent') return color
  
  if (isDark) {
    if (isDarkColor(color)) {
      return '#ffffff'
    }
  } else {
    if (isLightColor(color)) {
      return '#1e1e1e'
    }
  }
  
  return color
}
