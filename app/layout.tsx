import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { PALETTE, THEME_STORAGE_KEY, groundHexString, tokensCss } from '@/lib/theme'
import { sectionCss } from '@/lib/color'
import './globals.css'

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Java Dictionary',
  description:
    'The vocabulary of the Java language and the JVM, mapped into an interactive 3D knowledge graph.',
  applicationName: 'The Java Dictionary',
  keywords: ['Java', 'JVM', 'glossary', 'dictionary', 'generics', 'concurrency', 'garbage collection'],
  category: 'technology',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  // From the palette, not typed twice. This form only ever tracks the OS, so the
  // provider also patches the live <meta> on a manual flip.
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: groundHexString('light') },
    { media: '(prefers-color-scheme: dark)', color: groundHexString('dark') },
  ],
}

/**
 * Runs before the first paint, so the page is never painted in one theme and
 * then corrected to the other.
 *
 * It stamps TWO attributes. `data-theme` is the *resolved* value, and CSS keys on
 * it. `data-theme-pref` is the reader's actual preference, which may be 'system'
 * — and resolving 'system' down to a literal destroys it, which would leave the
 * three-state toggle with no way to know which of its segments is active. Keeping
 * both costs one attribute and no CSS.
 */
const NO_FLASH = `
(function () {
  var root = document.documentElement
  try {
    var pref = localStorage.getItem('${THEME_STORAGE_KEY}')
    if (pref !== 'light' && pref !== 'dark') pref = 'system'
    var dark =
      pref === 'dark' ||
      (pref === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    root.dataset.theme = dark ? 'dark' : 'light'
    root.dataset.themePref = pref
    root.style.colorScheme = dark ? 'dark' : 'light'
  } catch (e) {
    root.dataset.theme = 'light'
    root.dataset.themePref = 'system'
  }
})()
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the script above mutates attributes React also renders.
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        {/* The colour tokens, from the same module the WebGL scene reads. */}
        <style dangerouslySetInnerHTML={{ __html: tokensCss() }} />
        {/* Patched imperatively on toggle: the viewport's media-array form only tracks the OS. */}
        <meta name="theme-color" content={sectionCss(PALETTE.light.ground)} />
      </head>
      <body>
        <a className="skip-link" href="#dictionary">
          Skip to the written dictionary
        </a>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
