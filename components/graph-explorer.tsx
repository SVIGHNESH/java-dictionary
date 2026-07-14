'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { GraphScene } from './graph-scene'
import { TermPanel } from './term-panel'
import { LoadingScreen } from './loading-screen'
import { Search } from './search'
import { sectionCss, type Oklch } from '@/lib/color'
import styles from './graph-explorer.module.css'

export type GraphTerm = {
  id: string
  title: string
  description: string
  html: string
  section: string
  color: Oklch
  links: string[]
  backlinks: string[]
  degree: number
}

export type GraphEdge = { source: string; target: string }

/** Kept in step with the panel's width in term-panel.module.css. */
const PANEL_WIDTH = 441

type Props = {
  terms: GraphTerm[]
  edges: GraphEdge[]
  sections: { title: string; color: Oklch }[]
}

export function GraphExplorer({ terms, edges, sections }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [spotlit, setSpotlit] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [ready, setReady] = useState(false)

  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms])

  const onReady = useCallback(() => setReady(true), [])

  /**
   * Search ranks title matches above description matches, and earlier matches
   * above later ones, so typing "gar" puts Garbage collection first rather than
   * some entry that merely mentions garbage in its third paragraph.
   */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []

    const scored: { term: GraphTerm; score: number }[] = []
    for (const term of terms) {
      const title = term.title.toLowerCase()
      const at = title.indexOf(q)

      let score: number
      if (title === q) score = 0
      else if (at === 0) score = 1
      else if (at > 0) score = 2
      else if (term.description.toLowerCase().includes(q)) score = 3
      else continue

      scored.push({ term, score })
    }

    return scored
      .sort((a, b) => a.score - b.score || a.term.title.localeCompare(b.term.title))
      .map((s) => s.term)
  }, [query, terms])

  // Null, not an empty set: an empty set would dim every node in the graph.
  const matched = useMemo(
    () => (results.length ? new Set(results.map((t) => t.id)) : null),
    [results],
  )

  const select = useCallback((id: string | null) => setSelected(id), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The search box handles its own Escape, and clearing the query should not
      // also close the panel that the search just opened.
      if ((e.target as HTMLElement | null)?.tagName === 'INPUT') return
      if (e.key === 'Escape') {
        setSelected(null)
        setSpotlit(null)
        setQuery('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedTerm = selected ? byId.get(selected)! : null

  return (
    <div className={styles.stage} data-panel={Boolean(selectedTerm)}>
      <Canvas
        className={styles.canvas}
        dpr={[1, 2]}
        camera={{ fov: 42, near: 1, far: 900, position: [0, 0, 320] }}
        gl={{ antialias: true }}
        onPointerMissed={() => setSelected(null)}
      >
        <color attach="background" args={['#eae8e4']} />
        <GraphScene
          terms={terms}
          edges={edges}
          hovered={hovered}
          selected={selected}
          spotlit={spotlit}
          matched={matched}
          panelWidth={selectedTerm ? PANEL_WIDTH : 0}
          onHover={setHovered}
          onSelect={setSelected}
          labels={labels}
          onReady={onReady}
        />
      </Canvas>

      {/*
        Labels are DOM, not WebGL. Text stays crisp at any DPI and stays
        selectable, and the scene positions them imperatively each frame.
      */}
      <div className={styles.labels} aria-hidden="true">
        {terms.map((term, i) => (
          <span
            key={term.id}
            ref={(el) => {
              labels.current[i] = el
            }}
            className={styles.label}
          >
            {term.title}
          </span>
        ))}
      </div>

      <Search terms={terms} query={query} onQuery={setQuery} results={results} onSelect={select} />

      <header className={styles.masthead}>
        <h1 className={styles.title}>The Java Dictionary</h1>
        <p className={styles.subtitle}>
          {terms.length} terms of the language and the JVM, mapped into the graph they already form.
        </p>
        <p className={styles.byline}>Built by Vighnesh Shukla</p>
      </header>

      <nav className={styles.legend} aria-label="Sections">
        {sections.map((section) => (
          <button
            key={section.title}
            type="button"
            className={styles.legendItem}
            data-active={spotlit === section.title}
            data-dimmed={spotlit !== null && spotlit !== section.title}
            onClick={() => setSpotlit((s) => (s === section.title ? null : section.title))}
          >
            <span className={styles.swatch} style={{ background: sectionCss(section.color) }} />
            {section.title}
          </button>
        ))}
      </nav>

      <p className={styles.hint}>
        Drag to turn. Scroll to zoom. Click a term, or press <kbd className={styles.kbd}>/</kbd> to search.
      </p>

      {selectedTerm && (
        <TermPanel
          term={selectedTerm}
          byId={byId}
          onSelect={setSelected}
          onClose={() => setSelected(null)}
        />
      )}

      <LoadingScreen done={ready} />
    </div>
  )
}
