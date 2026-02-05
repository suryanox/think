import { IconButton, Tooltip } from '@mui/material'
import { DarkMode, LightMode } from '@mui/icons-material'
import { useThemeStore } from '../../stores/themeStore'

export function ThemeToggle() {
  const { isDark, toggle } = useThemeStore()

  return (
    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
      <IconButton onClick={toggle} size="small">
        {isDark ? <LightMode /> : <DarkMode />}
      </IconButton>
    </Tooltip>
  )
}
