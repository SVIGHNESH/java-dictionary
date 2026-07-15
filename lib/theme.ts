/**
 * One module owns colour. CSS and WebGL are both consumers of it.
 *
 * This is load-bearing, not hygiene. The ground colour used to be hand-copied
 * into four places: the `--paper` token, the scene's `PAPER` constant, the fog,
 * and the canvas clear colour — and the DOM labels are floated over the canvas
 * with a `text-shadow` halo painted in that same colour. If the halo and the
 * clear colour drift by even one level, all 63 labels grow a visible grey box.
 * They have to be provably the same value, so there is exactly one of them.
 *
 * Everything is authored in OKLCH, which is also why the bridge to WebGL is a
 * conversion and not `getComputedStyle`: THREE.Color cannot parse `oklch()`.
 */
import { sectionHex, type Oklch } from './color'

export type Theme = 'light' | 'dark'
/** What the reader chose. 'system' is resolved against the OS, and must survive being resolved. */
export type ThemePref = Theme | 'system'

export const THEME_STORAGE_KEY = 'jd-theme'

export type Neutrals = {
  /** The ground the graph floats on. The single source for the clear colour, the fog, the fade target and the label halo. */
  ground: Oklch
  /** Recessed: code blocks, inline code, keycaps. NOTE this reads *lighter* than the ground on dark. */
  groundSunk: Oklch
  /** Raised: the term panel and the search dropdown. Elevation is lightness, not a shadow — a warm-black shadow is invisible on graphite. */
  surface: Oklch
  ink: Oklch
  inkSoft: Oklch
  inkFaint: Oklch
  rule: Oklch
  shadow: string
}

export const PALETTE: Record<Theme, Neutrals> = {
  /*
   * The warm paper ground is the project's identity and is unchanged:
   * oklch(0.931 0.006 78) reproduces the original #eae8e4 byte for byte.
   */
  light: {
    ground: [0.931, 0.006, 78],
    groundSunk: [0.902, 0.008, 78],
    surface: [0.968, 0.004, 78],
    ink: [0.245, 0.01, 78],
    inkSoft: [0.455, 0.01, 78],
    // Was #8d867c, which measures 2.94:1 on paper and was carrying 11-12.5px body
    // text (the subtitle, the byline, the hint, the section blurbs, the footer).
    // That is a live AA failure and it is fixed here, not because of dark mode.
    inkFaint: [0.52, 0.01, 78],
    rule: [0.845, 0.009, 78],
    shadow: 'rgba(35, 32, 27, 0.28)',
  },

  /*
   * A second authored ground, not an inversion of the first: warm graphite, hue
   * held near the paper's own. A blue-black ground under a warm-paper sibling is
   * the clearest tell of a dark theme nobody designed.
   *
   * Tuned by APCA, not WCAG. WCAG's (L1+0.05)/(L2+0.05) systematically
   * overestimates contrast on dark grounds: an --ink-faint tuned to WCAG AA
   * lands around #807d77, which passes an automated audit at 4.38:1 and is
   * genuinely unreadable. These are lighter than a WCAG fit would give.
   */
  dark: {
    ground: [0.205, 0.009, 68],
    groundSunk: [0.258, 0.011, 68],
    surface: [0.268, 0.011, 68],
    // Deliberately not #ffffff: pure white on near-black halates at 11.5px mono.
    ink: [0.925, 0.01, 80],
    inkSoft: [0.83, 0.012, 80],
    inkFaint: [0.776, 0.012, 80],
    rule: [0.365, 0.012, 70],
    shadow: 'rgba(0, 0, 0, 0.55)',
  },
}

/** The ground as a WebGL-ready hex number. The scene's one colour input. */
export function groundHex(theme: Theme): number {
  return sectionHex(PALETTE[theme].ground)
}

/** The ground as `#rrggbb`, for the handful of places that need a plain string. */
export function groundHexString(theme: Theme): string {
  return `#${groundHex(theme).toString(16).padStart(6, '0')}`
}

/**
 * The de-emphasised form of a section colour.
 *
 * Computed in OKLCH on purpose. The old code did `color.lerp(PAPER, 0.84)`, and
 * because r3f enables THREE.ColorManagement that lerp runs in *linear* light,
 * which is far more violent than 0.84 sounds: it crushed all nine sections into
 * a 14-level band. The dim state was dead rather than quiet.
 *
 * Fading toward the ground rather than toward a constant is what makes this work
 * in both themes. A hardcoded pale target on a dark ground would make the
 * de-emphasised nodes the *brightest* things on screen, and dimming would
 * silently become highlighting.
 */
export function dimmed([l, c, h]: Oklch, theme: Theme): Oklch {
  const groundL = PALETTE[theme].ground[0]
  // The eye is more sensitive to increments on a dark ground, so pull less there.
  const pull = theme === 'light' ? 0.68 : 0.55
  return [l + (groundL - l) * pull, c * 0.3, h]
}

const css = ([l, c, h]: Oklch) => `oklch(${l} ${c} ${h})`

function block(theme: Theme): string {
  const p = PALETTE[theme]
  return [
    `color-scheme: ${theme};`,
    `--ground: ${css(p.ground)};`,
    `--ground-sunk: ${css(p.groundSunk)};`,
    `--surface: ${css(p.surface)};`,
    `--ink: ${css(p.ink)};`,
    `--ink-soft: ${css(p.inkSoft)};`,
    `--ink-faint: ${css(p.inkFaint)};`,
    `--rule: ${css(p.rule)};`,
    `--shadow: ${p.shadow};`,
    // Hover and active washes. Mixing against --ink means they flip with the
    // theme for free; the four hardcoded rgba(0,0,0,...) overlays they replace
    // were invisible on a dark ground — one of them was the search dropdown's
    // keyboard-selection highlight, so there would have been no way to see which
    // result Enter was about to open.
    `--wash: color-mix(in oklab, var(--ink) ${theme === 'light' ? 5 : 6}%, transparent);`,
    `--wash-strong: color-mix(in oklab, var(--ink) ${theme === 'light' ? 9 : 10}%, transparent);`,
  ].join('\n    ')
}

/**
 * The token blocks, server-rendered into a <style> so they are correct in the
 * first painted byte. Keyed on the *resolved* theme that the head script stamps.
 */
export function tokensCss(): string {
  return `:root {
    ${block('light')}
  }
  :root[data-theme='dark'] {
    ${block('dark')}
  }`
}
