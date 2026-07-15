'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { swatchVars } from '@/lib/color'
import type { GraphTerm } from './graph-explorer'
import styles from './search.module.css'

type Props = {
  terms: GraphTerm[]
  query: string
  onQuery: (q: string) => void
  /** Terms currently matching, best first. Computed by the parent, which also dims the graph with them. */
  results: GraphTerm[]
  onSelect: (id: string) => void
}

export function Search({ terms, query, onQuery, results, onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [active, setActive] = useState(0)
  const [open, setOpen] = useState(false)

  const shown = useMemo(() => results.slice(0, 8), [results])

  // Typing a term's exact name is unambiguous, so act on it without waiting for
  // Enter. This is the "type a node name and it opens" case.
  const exact = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return null
    return terms.find((t) => t.title.toLowerCase() === q) ?? null
  }, [query, terms])

  useEffect(() => {
    if (exact) {
      onSelect(exact.id)
      setOpen(false)
    }
  }, [exact, onSelect])

  useEffect(() => setActive(0), [query])

  // "/" is the search key everywhere else, so it is the search key here.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.tagName === 'INPUT') return
      if (e.key === '/') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const choose = (term: GraphTerm) => {
    onSelect(term.id)
    onQuery('')
    setOpen(false)
    inputRef.current?.blur()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      // Escape clears the search before it reaches the window handler, which
      // would otherwise close the panel the search just opened.
      e.stopPropagation()
      if (query) onQuery('')
      else inputRef.current?.blur()
      setOpen(false)
      return
    }
    if (!shown.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i + 1) % shown.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setActive((i) => (i - 1 + shown.length) % shown.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(shown[active])
    }
  }

  const listId = 'search-results'

  return (
    <div className={styles.root}>
      <div className={styles.field}>
        <span className={styles.icon} aria-hidden="true">
          ⌕
        </span>
        <input
          ref={inputRef}
          className={styles.input}
          type="search"
          value={query}
          placeholder="Search terms"
          aria-label="Search terms"
          aria-controls={listId}
          aria-expanded={open && shown.length > 0}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            onQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          // A blur that fires before the click lands would swallow the click.
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={onKeyDown}
        />
        {query && (
          <button type="button" className={styles.clear} onClick={() => onQuery('')} aria-label="Clear search">
            ✕
          </button>
        )}
      </div>

      {open && query.trim() !== '' && (
        <ul className={styles.results} id={listId} role="listbox">
          {shown.map((term, i) => (
            <li key={term.id}>
              <button
                type="button"
                role="option"
                aria-selected={i === active}
                className={styles.result}
                data-active={i === active}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(term)}
              >
                <span className={`${styles.swatch} swatch-color`} style={swatchVars(term.color)} />
                <span className={styles.resultTitle}>{term.title}</span>
                <span className={styles.resultSection}>{term.section}</span>
              </button>
            </li>
          ))}
          {!shown.length && <li className={styles.empty}>No term matches “{query}”</li>}
        </ul>
      )}
    </div>
  )
}
