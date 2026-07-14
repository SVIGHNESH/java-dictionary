'use client'

import { useEffect, useRef } from 'react'
import { sectionCss } from '@/lib/color'
import type { GraphTerm } from './graph-explorer'
import styles from './term-panel.module.css'

type Props = {
  term: GraphTerm
  byId: Map<string, GraphTerm>
  onSelect: (id: string) => void
  onClose: () => void
}

export function TermPanel({ term, byId, onSelect, onClose }: Props) {
  const bodyRef = useRef<HTMLDivElement>(null)

  // Links in the prose point at other entries. Inside the panel they should
  // move the graph, not jump the page down to the written dictionary.
  useEffect(() => {
    const el = bodyRef.current
    if (!el) return

    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[data-term]')
      if (!anchor) return
      const id = anchor.dataset.term!
      if (!byId.has(id)) return
      e.preventDefault()
      onSelect(id)
    }

    el.addEventListener('click', onClick)
    return () => el.removeEventListener('click', onClick)
  }, [byId, onSelect])

  // A new term means a new document. Start it at the top.
  useEffect(() => {
    bodyRef.current?.parentElement?.scrollTo({ top: 0 })
  }, [term.id])

  const related = [...new Set([...term.links, ...term.backlinks])]
    .map((id) => byId.get(id))
    .filter((t): t is GraphTerm => Boolean(t))
    .sort((a, b) => a.title.localeCompare(b.title))

  return (
    <aside className={styles.panel} aria-label={`Definition of ${term.title}`}>
      <button type="button" className={styles.close} onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className={styles.scroll}>
        <p className={styles.section}>
          <span className={styles.swatch} style={{ background: sectionCss(term.color) }} />
          {term.section}
        </p>

        <h2 className={styles.title}>{term.title}</h2>
        <p className={styles.description}>{term.description}</p>

        <div ref={bodyRef} className={styles.body} dangerouslySetInnerHTML={{ __html: term.html }} />

        <div className={styles.related}>
          <h3 className={styles.relatedTitle}>
            Connected to {related.length} {related.length === 1 ? 'term' : 'terms'}
          </h3>
          <ul className={styles.chips}>
            {related.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className={styles.chip}
                  onClick={() => onSelect(r.id)}
                  style={{ ['--chip' as string]: sectionCss(r.color) }}
                >
                  {r.title}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <a className={styles.readBelow} href={`#${term.id}`}>
          Read this entry in the written dictionary ↓
        </a>
      </div>
    </aside>
  )
}
