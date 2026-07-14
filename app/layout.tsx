import type { Metadata, Viewport } from 'next'
import { JetBrains_Mono } from 'next/font/google'
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
  themeColor: '#eae8e4',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <a className="skip-link" href="#dictionary">
          Skip to the written dictionary
        </a>
        {children}
      </body>
    </html>
  )
}
