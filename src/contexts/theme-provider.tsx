import { createContext, useEffect, useState } from 'react'

type Theme = 'auto' | 'dark' | 'light'

interface ThemeContextValue {
  readonly resolvedTheme: 'dark' | 'light'
  readonly setTheme: (theme: Theme) => void
  readonly theme: Theme
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const VALID_THEMES = new Set<Theme>(['auto', 'dark', 'light'])
const DEFAULT_THEME = 'dark'

interface ThemeInitOptions {
  readonly setMounted: (mounted: boolean) => void
  readonly setResolvedTheme: (resolved: 'dark' | 'light') => void
  readonly setThemeState: (theme: Theme) => void
}

/**
 *
 * @param resolved
 */
function applyThemeClass(resolved: 'dark' | 'light'): void {
  if (typeof globalThis === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.style.colorScheme = resolved
}

/**
 *
 */
function getSystemTheme(): 'dark' | 'light' {
  if (typeof globalThis === 'undefined') return 'dark'
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 *
 * @param theme
 */
function resolveTheme(theme: Theme): 'dark' | 'light' {
  return theme === 'auto' ? getSystemTheme() : theme
}

/**
 *
 * @param root0
 * @param root0.children
 */
function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME as Theme)
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(
    DEFAULT_THEME as 'dark' | 'light',
  )
  const [mounted, setMounted] = useState(false)

  useSystemThemeSync(mounted, setResolvedTheme)
  useThemeInitialization({ setMounted, setResolvedTheme, setThemeState })

  const setTheme = (next: Theme) => {
    setThemeState(next)
    const resolved = resolveTheme(next)
    setResolvedTheme(resolved)
    applyThemeClass(resolved)
    try {
      localStorage.setItem('theme', next)
    } catch {
      return
    }
  }

  return (
    <ThemeContext value={{ resolvedTheme, setTheme, theme }}>
      {children}
    </ThemeContext>
  )
}

/**
 *
 * @param mounted
 * @param setResolvedTheme
 */
function useSystemThemeSync(
  mounted: boolean,
  setResolvedTheme: (resolved: 'dark' | 'light') => void,
): void {
  useEffect(() => {
    if (!mounted) return
    const mql = globalThis.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const stored = localStorage.getItem('theme') as null | Theme
      if (stored === 'auto' || !stored) {
        const resolved = getSystemTheme()
        setResolvedTheme(resolved)
        applyThemeClass(resolved)
      }
    }
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mounted])
}

/**
 *
 * @param options
 */
function useThemeInitialization(options: ThemeInitOptions): void {
  const { setMounted, setResolvedTheme, setThemeState } = options
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') as null | Theme
      const initial =
        stored && VALID_THEMES.has(stored) ? stored : DEFAULT_THEME
      const resolved = resolveTheme(initial)
      setThemeState(initial)
      setResolvedTheme(resolved)
      applyThemeClass(resolved)
    } catch {
      applyThemeClass(DEFAULT_THEME)
    }
    setMounted(true)
  }, [])
}

export { ThemeProvider }
