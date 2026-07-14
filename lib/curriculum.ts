/**
 * The curriculum defines the reading order and the thematic grouping of the
 * dictionary. Section membership drives node colour in the graph, so a term
 * that is missing here would render uncoloured: `lib/dictionary.ts` throws
 * instead, which keeps the curriculum and `dictionary/` honest with each other.
 */
import type { Oklch } from './color'

export type Section = {
  title: string
  blurb: string
  /**
   * OKLCH [lightness, chroma, hue] for every node in this section. Nine
   * categories is past what hue alone can separate, so lightness and chroma
   * move as well: the two greens differ mostly in lightness, and the two reds
   * mostly in chroma.
   */
  color: Oklch
  terms: string[]
}

export const CURRICULUM: Section[] = [
  {
    title: 'Language Basics',
    blurb: 'The nouns. What you declare, and what exists at runtime once you do.',
    color: [0.68, 0.15, 55],
    terms: ['Class', 'Object', 'Method', 'Field', 'Constructor', 'Package', 'Primitive type'],
  },
  {
    title: 'Types and Generics',
    blurb: 'What the compiler knows, and what survives to runtime.',
    color: [0.79, 0.13, 95],
    terms: ['Reference type', 'Generics', 'Type erasure', 'Wildcard', 'Autoboxing', 'var', 'Record'],
  },
  {
    title: 'Object Orientation',
    blurb: 'Sharing behaviour between types, and the ways that goes wrong.',
    color: [0.62, 0.15, 152],
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
    color: [0.72, 0.1, 205],
    terms: ['JVM', 'Bytecode', 'JIT compilation', 'Classloader', 'JDK', 'Heap', 'Stack frame'],
  },
  {
    title: 'Memory and Lifetime',
    blurb: 'What keeps an object alive, and what quietly refuses to let it die.',
    color: [0.52, 0.16, 258],
    terms: ['Garbage collection', 'Reference', 'Memory leak', 'Static', 'Final', 'Immutability', 'Metaspace'],
  },
  {
    title: 'Collections and Streams',
    blurb: 'Holding many things, and the contracts you must honour to do it.',
    color: [0.58, 0.19, 305],
    terms: ['Collection framework', 'List', 'Map', 'Iterator', 'equals and hashCode', 'Stream', 'Optional'],
  },
  {
    title: 'Concurrency',
    blurb: 'More than one thread. Correctness stops being obvious here.',
    color: [0.70, 0.17, 352],
    terms: ['Thread', 'synchronized', 'volatile', 'Race condition', 'Deadlock', 'Executor service', 'Virtual thread'],
  },
  {
    title: 'Failure Modes',
    blurb: 'The exceptions you will actually see, and how to read them.',
    color: [0.51, 0.19, 25],
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
    color: [0.45, 0.08, 135],
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
