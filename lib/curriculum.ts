/**
 * The curriculum defines the reading order and the thematic grouping of the
 * dictionary. Section membership drives node colour in the graph, so a term
 * that is missing here would render uncoloured: `lib/dictionary.ts` throws
 * instead, which keeps the curriculum and `dictionary/` honest with each other.
 */
import type { ColorPair } from './color'

export type Section = {
  title: string
  blurb: string
  /**
   * OKLCH [lightness, chroma, hue] for every node in this section, on each
   * ground. Nine categories is past what hue alone can separate, so lightness
   * and chroma move as well: the two greens differ mostly in lightness, and the
   * two reds mostly in chroma.
   *
   * Hue is identical in both themes — it is what carries section identity. Only
   * L and C are re-tuned per ground, and the *rank* of the lightnesses is
   * preserved, so Modern Java stays the heavy one and Concurrency the bright one
   * in both. Fitting every section to one contrast target instead would invert
   * that ordering, and a section whose visual weight flips when you hit the
   * toggle is disorienting in a way readers feel but cannot name.
   *
   * The light values are a correction, not a repaint: five of these nine used to
   * sit below the 3:1 non-text contrast floor against the paper (Types and
   * Generics worst, at 1.58:1 — a mark you cannot see well enough to click).
   * Four are untouched; the five that failed keep their hue and their chroma and
   * drop only as much lightness as clears the floor.
   */
  color: ColorPair
  terms: string[]
}

export const CURRICULUM: Section[] = [
  {
    title: 'Language Basics',
    blurb: 'The nouns. What you declare, and what exists at runtime once you do.',
    color: { light: [0.624, 0.15, 55], dark: [0.791, 0.138, 55] },
    terms: ['Class', 'Object', 'Method', 'Field', 'Constructor', 'Package', 'Primitive type'],
  },
  {
    title: 'Types and Generics',
    blurb: 'What the compiler knows, and what survives to runtime.',
    color: { light: [0.614, 0.126, 95], dark: [0.783, 0.126, 95] },
    terms: ['Reference type', 'Generics', 'Type erasure', 'Wildcard', 'Autoboxing', 'var', 'Record'],
  },
  {
    title: 'Object Orientation',
    blurb: 'Sharing behaviour between types, and the ways that goes wrong.',
    color: { light: [0.596, 0.15, 152], dark: [0.77, 0.15, 152] },
    terms: [
      'Inheritance',
      'Polymorphism',
      'Encapsulation',
      'Abstract class',
      'Interface',
      'Method overriding',
      'Composition',
    ],
  },
  {
    title: 'The JVM',
    blurb: 'The machine your code actually runs on. Not the one you wrote it for.',
    color: { light: [0.602, 0.1, 205], dark: [0.774, 0.1, 205] },
    terms: ['JVM', 'Bytecode', 'JIT compilation', 'Classloader', 'JDK', 'Heap', 'Stack frame'],
  },
  {
    title: 'Memory and Lifetime',
    blurb: 'What keeps an object alive, and what quietly refuses to let it die.',
    color: { light: [0.52, 0.16, 258], dark: [0.713, 0.15, 258] },
    terms: ['Garbage collection', 'Reference', 'Memory leak', 'Static', 'Final', 'Immutability', 'Metaspace'],
  },
  {
    title: 'Collections and Streams',
    blurb: 'Holding many things, and the contracts you must honour to do it.',
    color: { light: [0.58, 0.19, 305], dark: [0.758, 0.154, 305] },
    terms: ['Collection framework', 'List', 'Map', 'Iterator', 'equals and hashCode', 'Stream', 'Optional'],
  },
  {
    title: 'Concurrency',
    blurb: 'More than one thread. Correctness stops being obvious here.',
    color: { light: [0.636, 0.17, 352], dark: [0.8, 0.132, 352] },
    terms: ['Thread', 'synchronized', 'volatile', 'Race condition', 'Deadlock', 'Executor service', 'Virtual thread'],
  },
  {
    title: 'Failure Modes',
    blurb: 'The exceptions you will actually see, and how to read them.',
    color: { light: [0.51, 0.19, 25], dark: [0.705, 0.186, 25] },
    terms: [
      'Exception',
      'Checked exception',
      'Unchecked exception',
      'NullPointerException',
      'Stack trace',
      'try-with-resources',
      'ConcurrentModificationException',
    ],
  },
  {
    title: 'Modern Java',
    blurb: 'Records, sealed types and pattern matching. The language since 8.',
    color: { light: [0.45, 0.08, 135], dark: [0.66, 0.08, 135] },
    terms: [
      'Lambda',
      'Functional interface',
      'Method reference',
      'Switch expression',
      'Pattern matching',
      'Sealed class',
      'Annotation',
    ],
  },
]

/** `Type erasure` -> `type-erasure`. The id used in the DOM and the graph. */
export function slugify(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
