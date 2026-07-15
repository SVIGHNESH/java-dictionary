'use client'

import { useRef } from 'react'
import { useTheme } from './theme-provider'
import type { ThemePref } from '@/lib/theme'
import styles from './theme-toggle.module.css'

/**
 * Three states, not two.
 *
 * A cycling one-icon button never tells you the name of the state you are in, and
 * it cannot express 'follow the system' at all — that preference stays invisible
 * until the OS changes underneath you and the page appears to flip on its own.
 * Three segments cost nothing here: the head script already resolves 'system'
 * against the OS, and keeping the preference alongside the resolved value is one
 * extra attribute.
 *
 * Typographic, at 11.5px mono, because the rest of the chrome is.
 */
const MODES: { mode: ThemePref; label: string; glyph: string }[] = [
  { mode: 'light', label: 'Light', glyph: '☀' },
  { mode: 'system', label: 'System', glyph: '◐' },
  { mode: 'dark', label: 'Dark', glyph: '☾' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { pref, resolved, setPref } = useTheme()
  const groupRef = useRef<HTMLDivElement>(null)

  // Arrow keys move within a radiogroup; Tab moves out of it. That is the
  // expected shape, and it is why only the active segment is tabbable.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (!delta) return
    e.preventDefault()
    const i = MODES.findIndex((m) => m.mode === pref)
    const next = MODES[(i + delta + MODES.length) % MODES.length]
    setPref(next.mode)
    groupRef.current?.querySelector<HTMLButtonElement>(`[data-mode='${next.mode}']`)?.focus()
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label="Colour theme"
      className={`${styles.group} ${className ?? ''}`}
      onKeyDown={onKeyDown}
    >
      {MODES.map(({ mode, label, glyph }) => (
        <button
          key={mode}
          type="button"
          role="radio"
          // The active pill is painted by CSS from the root attribute, so it is
          // correct in the first painted byte. This only labels it for a11y.
          aria-checked={pref === mode}
          aria-label={label}
          data-mode={mode}
          tabIndex={pref === mode ? 0 : -1}
          className={styles.seg}
          onClick={() => setPref(mode)}
        >
          <span aria-hidden="true">{glyph}</span>
        </button>
      ))}
      <span role="status" aria-live="polite" className={styles.srOnly}>
        {pref === 'system' ? `System theme, currently ${resolved}` : `${pref} theme`}
      </span>
    </div>
  )
}
