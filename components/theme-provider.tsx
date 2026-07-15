'use client'

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore } from 'react'
import { PALETTE, THEME_STORAGE_KEY, type Theme, type ThemePref } from '@/lib/theme'

type ThemeState = {
  /** What the reader chose, including 'system'. This is what the toggle shows as active. */
  pref: ThemePref
  /** What that resolves to right now. This is what CSS and WebGL paint. */
  resolved: Theme
  setPref: (pref: ThemePref) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

const media = () => window.matchMedia('(prefers-color-scheme: dark)')

/**
 * The DOM is the store.
 *
 * The blocking script in the layout has already stamped both attributes on <html>
 * before React runs, so reading them back is cheaper and more truthful than
 * keeping a second copy in React state — and it is the only version that cannot
 * disagree with what is currently painted.
 *
 * useSyncExternalStore is the right primitive here: it is what lets the server
 * render 'system' and the client re-read the real value after hydration without a
 * mismatch warning. The obvious alternatives both break — `useState(() =>
 * document...)` throws during SSR, and reading localStorage in a state
 * initialiser hands hydration a value the server never produced.
 */
function subscribe(onChange: () => void) {
  const mq = media()
  window.addEventListener('storage', onChange)
  mq.addEventListener('change', onChange)
  window.addEventListener('themechange', onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    mq.removeEventListener('change', onChange)
    window.removeEventListener('themechange', onChange)
  }
}

const prefSnapshot = (): ThemePref =>
  (document.documentElement.dataset.themePref as ThemePref | undefined) ?? 'system'
const resolvedSnapshot = (): Theme =>
  (document.documentElement.dataset.theme as Theme | undefined) ?? 'light'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const pref = useSyncExternalStore(subscribe, prefSnapshot, () => 'system' as ThemePref)
  const resolved = useSyncExternalStore(subscribe, resolvedSnapshot, () => 'light' as Theme)

  const setPref = useCallback((next: ThemePref) => {
    const isDark = next === 'dark' || (next === 'system' && media().matches)
    apply(next, isDark ? 'dark' : 'light')
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      // Private mode, or storage disabled. The theme still applies for this page.
    }
    window.dispatchEvent(new Event('themechange'))
  }, [])

  // While the preference is 'system', the OS can change under us.
  useEffect(() => {
    if (pref !== 'system') return
    const mq = media()
    const onChange = () => {
      apply('system', mq.matches ? 'dark' : 'light')
      window.dispatchEvent(new Event('themechange'))
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  return <ThemeContext.Provider value={{ pref, resolved, setPref }}>{children}</ThemeContext.Provider>
}

/** Stamp both attributes, the colour scheme, and the address-bar colour. */
function apply(pref: ThemePref, resolved: Theme) {
  const root = document.documentElement
  root.dataset.theme = resolved
  root.dataset.themePref = pref
  root.style.colorScheme = resolved
  const meta = document.querySelector('meta[name="theme-color"]')
  // The viewport's media-array form only ever tracks the OS, so without this the
  // mobile status bar keeps the old colour after a manual flip.
  if (meta) meta.setAttribute('content', groundCss(resolved))
}

function groundCss(theme: Theme) {
  const [l, c, h] = PALETTE[theme].ground
  return `oklch(${l} ${c} ${h})`
}

export function useTheme(): ThemeState {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
