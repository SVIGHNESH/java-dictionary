'use client'

import { useEffect, useState } from 'react'
import styles from './loading-screen.module.css'

/**
 * Covers the canvas until the first frame is on screen, so nobody sees an empty
 * void while three.js compiles shaders and the layout settles.
 */
export function LoadingScreen({ done }: { done: boolean }) {
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (!done) return
    const t = setTimeout(() => setGone(true), 460)
    return () => clearTimeout(t)
  }, [done])

  if (gone) return null

  return (
    <div className={styles.root} data-done={done} aria-hidden={done}>
      <p className={styles.title}>
        {['The', 'Java', 'Dictionary'].map((word, i) => (
          <span key={word} className={styles.word}>
            <span className={styles.wordInner} style={{ animationDelay: `${i * 90}ms` }}>
              {word}
            </span>
          </span>
        ))}
      </p>
      <p className={styles.status}>Building the graph</p>
    </div>
  )
}
