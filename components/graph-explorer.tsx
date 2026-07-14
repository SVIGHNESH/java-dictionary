'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { GraphScene } from './graph-scene'
import { TermPanel } from './term-panel'
import { LoadingScreen } from './loading-screen'
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

type Props = {
  terms: GraphTerm[]
  edges: GraphEdge[]
  sections: { title: string; color: Oklch }[]
}

export function GraphExplorer({ terms, edges, sections }: Props) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [spotlit, setSpotlit] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const labels = useRef<(HTMLSpanElement | null)[]>([])
  const byId = useMemo(() => new Map(terms.map((t) => [t.id, t])), [terms])

  const onReady = useCallback(() => setReady(true), [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelected(null)
        setSpotlit(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const selectedTerm = selected ? byId.get(selected)! : null

  return (
    <div className={styles.stage}>
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

      <header className={styles.masthead}>
        <h1 className={styles.title}>The Java Dictionary</h1>
        <p className={styles.subtitle}>
          {terms.length} terms of the language and the JVM, mapped into the graph they already form.
        </p>
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

      <p className={styles.hint}>Drag to turn. Scroll to zoom. Click a term.</p>

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
