import { getGraph } from '@/lib/dictionary'
import { GraphExplorer } from '@/components/graph-explorer'
import { ThemeToggle } from '@/components/theme-toggle'
import { swatchVars } from '@/lib/color'
import { slugify } from '@/lib/curriculum'
import styles from './page.module.css'

export default function Page() {
  const { terms, edges, sections } = getGraph()

  return (
    <>
      {/* The graph is the interactive layer. It needs JavaScript and a GPU. */}
      <GraphExplorer terms={terms} edges={edges} sections={sections.map(({ title, color }) => ({ title, color }))} />

      {/*
        The written dictionary below is plain server-rendered HTML. It is the
        real document: readable with JavaScript off, crawlable, and the thing a
        screen reader gets. The canvas above is enhancement layered on top.
      */}
      <main id="dictionary" className={styles.document}>
        <header className={styles.masthead}>
          <h1 className={styles.docTitle}>The Java Dictionary</h1>
          <p className={styles.docBlurb}>
            {terms.length} terms, {edges.length} connections between them. Every link below is an edge in
            the graph above.
          </p>
        </header>

        {sections.map((section) => (
          <section key={section.title} className={styles.section} aria-labelledby={`section-${slugify(section.title)}`}>
            <div className={styles.sectionHead}>
              <h2 id={`section-${slugify(section.title)}`} className={styles.sectionTitle}>
                <span className={`${styles.swatch} swatch-color`} style={swatchVars(section.color)} aria-hidden="true" />
                {section.title}
              </h2>
              <p className={styles.sectionBlurb}>{section.blurb}</p>
            </div>

            <dl className={styles.entries}>
              {section.terms.map((term) => (
                <div key={term.id} id={term.id} className={styles.entry}>
                  <dt className={styles.term}>{term.title}</dt>
                  <dd className={styles.definition}>
                    {term.description}
                    <div className={styles.body} dangerouslySetInnerHTML={{ __html: term.html }} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ))}

        <footer className={styles.footer}>
          {/*
            The graph chrome is a screen away by the time you are reading down
            here, and the written dictionary is the real artifact — so the theme
            has to be reachable from inside it too. Both toggles share one context.
          */}
          <div className={styles.footerTheme}>
            <span className={styles.footerThemeLabel}>Theme</span>
            <ThemeToggle />
          </div>

          <p className={styles.credit}>Built by Vighnesh Shukla</p>
          <p>
            Built the way{' '}
            <a href="https://www.aicodingdictionary.com/" target="_blank" rel="noreferrer noopener">
              The AI Coding Dictionary
            </a>{' '}
            is built: the markdown links between entries are the only source of the graph.
          </p>
        </footer>
      </main>
    </>
  )
}
