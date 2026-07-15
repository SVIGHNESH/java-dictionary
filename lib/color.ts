/**
 * Section colours are authored in OKLCH. CSS renders OKLCH directly; WebGL
 * cannot, so we convert. Both the legend swatch and the node in the scene come
 * from the same triple, which is what keeps them the exact same colour.
 *
 * Nine categories is past the point where hue alone separates them, so the
 * palette moves lightness and chroma too. See CURRICULUM for the values.
 */
import type { CSSProperties } from 'react'

export type Oklch = readonly [l: number, c: number, h: number]

/**
 * A section's colour on each ground. The hue is byte-identical across the two,
 * so a section reads as the same colour relit rather than as a different colour;
 * only lightness and chroma move, by the amount each ground needs.
 */
export type ColorPair = { light: Oklch; dark: Oklch }

export function sectionCss([l, c, h]: Oklch): string {
  return `oklch(${l} ${c} ${h})`
}

/**
 * Both of a section's colours, as custom properties, so CSS can pick one and no
 * JavaScript has to.
 *
 * The swatches are server-rendered (the legend, the document's section heads, the
 * search results, the panel). Swapping their colour in a client effect would
 * paint the light swatch first and then correct it — a visible flash on every
 * dark-mode load. Emitting both and letting a `:root[data-theme='dark']` rule
 * choose is correct in the first painted byte.
 */
export function swatchVars({ light, dark }: ColorPair): CSSProperties {
  // React's CSSProperties has no index signature for custom properties.
  return { '--sw-l': sectionCss(light), '--sw-d': sectionCss(dark) } as CSSProperties
}

/** OKLCH -> sRGB hex, via OKLab and linear sRGB. */
export function sectionHex([L, C, hDeg]: Oklch): number {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
  const lg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
  const lb = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s

  const enc = (v: number) => {
    const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055
    return Math.max(0, Math.min(255, Math.round(srgb * 255)))
  }

  return (enc(lr) << 16) | (enc(lg) << 8) | enc(lb)
}
