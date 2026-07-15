/**
 * How central a term is to the vocabulary, by PageRank over the links.
 *
 * Node size used to encode degree, which is a worse proxy for the same idea: it
 * counts a term's neighbours without asking whether those neighbours matter. Two
 * terms with eight links each are not equally central if one of them is linked
 * from Object and the other from Metaspace.
 *
 * This is deliberately NOT clustered by section. The sections are a reading
 * order, not communities — most of the edges in this graph cross between them —
 * so grouping the layout by section would be a picture that argues with its own
 * data. What the links actually describe is a core and a periphery: a handful of
 * nouns that everything else is defined in terms of, and a rim of terms that lean
 * on them. That is what the layout says instead.
 *
 * Run once at build time, over 63 nodes. The cost is nothing.
 */

const DAMPING = 0.85
const ITERATIONS = 60

export type Authority = {
  /** 0..1, normalised so the most central term is 1. */
  score: number
  /** 1 = the nucleus, 2 = the body, 3 = the rim. Drives node size and label priority. */
  tier: 1 | 2 | 3
}

/** Thresholds sit in the gaps of the real distribution, not at round numbers. */
const TIER_1 = 0.7
const TIER_2 = 0.28

export function pageRank(ids: string[], links: Map<string, string[]>): Map<string, Authority> {
  const n = ids.length
  const index = new Map(ids.map((id, i) => [id, i]))

  const out: number[][] = ids.map((id) =>
    (links.get(id) ?? []).map((t) => index.get(t)).filter((i): i is number => i !== undefined),
  )

  let rank = new Array<number>(n).fill(1 / n)

  for (let it = 0; it < ITERATIONS; it++) {
    const next = new Array<number>(n).fill((1 - DAMPING) / n)

    // A term that links to nothing would otherwise leak its rank out of the
    // system; spread it over everyone instead, which is the standard treatment.
    let dangling = 0
    for (let i = 0; i < n; i++) {
      if (out[i].length === 0) {
        dangling += rank[i]
        continue
      }
      const share = (DAMPING * rank[i]) / out[i].length
      for (const j of out[i]) next[j] += share
    }
    const spill = (DAMPING * dangling) / n
    for (let i = 0; i < n; i++) next[i] += spill

    rank = next
  }

  const max = Math.max(...rank)
  const result = new Map<string, Authority>()
  ids.forEach((id, i) => {
    const score = rank[i] / max
    const tier: 1 | 2 | 3 = score >= TIER_1 ? 1 : score >= TIER_2 ? 2 : 3
    result.set(id, { score, tier })
  })
  return result
}
