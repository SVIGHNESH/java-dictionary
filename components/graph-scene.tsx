'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceCenter,
  forceCollide,
  forceRadial,
  forceY,
} from 'd3-force-3d'
// Fat lines ship inside three itself, so real edge width costs no new dependency.
import { LineSegments2 } from 'three/examples/jsm/lines/LineSegments2.js'
import { LineSegmentsGeometry } from 'three/examples/jsm/lines/LineSegmentsGeometry.js'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial.js'
import { sectionHex } from '@/lib/color'
import { dimmed, groundHex, type Theme } from '@/lib/theme'
import type { GraphEdge, GraphTerm } from './graph-explorer'

/**
 * Node size reads authority, not degree.
 *
 * Degree counts a term's neighbours without asking whether those neighbours
 * matter; PageRank asks. The size channel was spending itself on the worse of the
 * two measures of the same idea.
 *
 * Still kept small: the edges are the subject of this graph, and fat nodes bury
 * both the edges and their own labels. The exponent flattens the top so the four
 * nouns at the centre lead without swamping the scene.
 */
function radiusOf(authority: number) {
  return 2.6 + 5.6 * authority ** 0.75
}

/**
 * Where each tier sits, as a fraction of the cloud's radius. Core, body, rim.
 *
 * The core is not as tight as it could be, deliberately: pack the four nouns any
 * closer and their labels collide with each other, and the declutter starts
 * dropping the very names the layout exists to point at.
 */
const SHELL = [0.26, 0.6, 0.98] as const
const SHELL_RADIUS = 260

/** Roughly one line of the label type. Only used to give the declutter a box. */
const LABEL_HEIGHT = 14

/**
 * Placeholder constructor args for the fog. Every value here is overwritten before
 * the first frame — near/far in the frame loop, the colour in an effect — but the
 * array has to be a stable module constant: `args` are CONSTRUCTOR args, so a new
 * array on each render would re-instantiate THREE.Fog on every theme flip and null
 * the ref the frame loop writes into.
 */
const FOG_ARGS: [number, number, number] = [groundHex('light'), 1, 2]

type SimNode = {
  id: string
  index: number
  authority: number
  tier: 1 | 2 | 3
  x: number
  y: number
  z: number
}

/**
 * A matcap, drawn at runtime into a canvas. No asset, no dependency.
 *
 * The scene has no lights, and an unlit sphere is by definition a flat disc:
 * every fragment of the silhouette returns the same instance colour. A matcap
 * gives the sphere a shading response without lighting it.
 *
 * The two themes need genuinely different matcaps, and the asymmetry is the
 * honest part. `meshmatcap` is a pure MULTIPLY — `outgoingLight = diffuse *
 * matcap` — so it can only ever darken. A rim light is therefore mathematically
 * unreachable, and a merely darker matcap on graphite punches every node into a
 * hole in the ground. So:
 *
 *   light ground: fall to a dark limb. That darkened edge IS the silhouette
 *     against bright paper — the job glow would do on a dark ground, done by
 *     shading instead, which is the only version that works when the ground is
 *     brighter than all nine section colours.
 *   dark ground: stay nearly flat. The ground already supplies the silhouette,
 *     and any darkening would spend the contrast the dark palette just bought.
 */
function makeMatcap(limb: number): THREE.CanvasTexture {
  const SIZE = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = SIZE
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(SIZE, SIZE)

  // Shaded per pixel rather than with a canvas gradient: Chrome dithers its 2D
  // gradients, and that dithering reads as visible hatching once it is stretched
  // across a sphere.
  const LX = -0.32
  const LY = 0.46
  const LZ = 0.83

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      // Matcap space: the unit disc is the hemisphere facing the camera.
      const u = (x / (SIZE - 1)) * 2 - 1
      const v = 1 - (y / (SIZE - 1)) * 2
      const r2 = u * u + v * v

      let value: number
      if (r2 >= 1) {
        // Past the silhouette. Hold the limb value so the edge stays clean.
        value = limb
      } else {
        const nz = Math.sqrt(1 - r2)
        const lambert = Math.max(0, u * LX + v * LY + nz * LZ)
        // A wide, soft falloff, plus a tight specular so the sphere has a surface
        // rather than just a gradient.
        const diffuse = lambert ** 0.75
        const spec = lambert ** 26 * 0.35
        value = limb + (1 - limb) * diffuse + spec
      }

      const n = Math.max(0, Math.min(255, Math.round(value * 255)))
      const o = (y * SIZE + x) * 4
      img.data[o] = img.data[o + 1] = img.data[o + 2] = n
      img.data[o + 3] = 255
    }
  }

  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.minFilter = THREE.LinearMipmapLinearFilter
  tex.magFilter = THREE.LinearFilter
  tex.generateMipmaps = true
  return tex
}

export type SceneProps = {
  terms: GraphTerm[]
  edges: GraphEdge[]
  hovered: string | null
  selected: string | null
  /** Section title to spotlight, from the legend. */
  spotlit: string | null
  /** Ids matching the search query, or null when the search is empty. */
  matched: Set<string> | null
  /** Width of the open panel in CSS pixels, 0 when closed. */
  panelWidth: number
  /**
   * The resolved theme. It reaches the scene as a plain prop, never through
   * context: r3f reconciles the canvas through its own root, so context from the
   * DOM tree does not cross the boundary without a bridge. A prop is free.
   *
   * NOTE the invariant this whole file depends on: the theme must never enter the
   * simulation's `useMemo` deps. If it did, flipping the toggle would rebuild the
   * force layout and the graph would visibly reshuffle under the reader. Colour
   * is the only thing allowed to change.
   */
  theme: Theme
  onHover: (id: string | null) => void
  onSelect: (id: string) => void
  /** One span per term, in `terms` order. Positioned imperatively each frame. */
  labels: React.RefObject<(HTMLSpanElement | null)[]>
  onReady: () => void
}

export function GraphScene({
  terms,
  edges,
  hovered,
  selected,
  spotlit,
  matched,
  panelWidth,
  theme,
  onHover,
  onSelect,
  labels,
  onReady,
}: SceneProps) {
  const { camera, gl, size } = useThree()

  const meshRef = useRef<THREE.InstancedMesh>(null)

  const indexById = useMemo(() => new Map(terms.map((t, i) => [t.id, i])), [terms])

  /** The focused term and everything it touches, so we can spotlight its edges. */
  const neighbours = useMemo(() => {
    const focus = hovered ?? selected
    if (!focus) return null
    const set = new Set<string>([focus])
    for (const e of edges) {
      if (e.source === focus) set.add(e.target)
      if (e.target === focus) set.add(e.source)
    }
    return set
  }, [hovered, selected, edges])

  /*
   * Built once. The graph never changes shape at runtime — and note that `theme`
   * is deliberately NOT in these deps: a theme flip must relight the graph, never
   * rebuild it.
   *
   * The layout says one thing: authority is distance from the centre. The four
   * nouns the language is spoken in (Method, Class, Object, Field) settle into a
   * nucleus, the body of the vocabulary sits around them, and the terms that lean
   * on everything else form the rim.
   *
   * It deliberately does NOT cluster by section, even though the sections are the
   * obvious grouping and colour already implies it. Most of the edges in this
   * graph cross between sections, so nine spatial blobs would be a picture
   * arguing with its own data. The shells are also held loosely on purpose — the
   * real edges have to be able to deform them, or the result reads as an orbital
   * diagram rather than a graph that happens to have a centre.
   */
  const { sim, nodes } = useMemo(() => {
    const nodes: SimNode[] = terms.map((t, index) => ({
      id: t.id,
      index,
      authority: t.authority,
      tier: t.tier,
      x: 0,
      y: 0,
      z: 0,
    }))
    const links = edges.map((e) => ({ source: e.source, target: e.target }))

    const sim = forceSimulation(nodes, 3)
      // Weaker than before: the shells now do most of the spacing.
      .force('charge', forceManyBody().strength(-260))
      .force(
        'link',
        forceLink(links)
          .id((d: SimNode) => d.id)
          // Central terms have many neighbours, so give their edges more rope.
          .distance(
            (l: { source: SimNode; target: SimNode }) =>
              48 + (l.source.authority + l.target.authority) * 26,
          )
          .strength(0.3),
      )
      .force('radial', forceRadial((d: SimNode) => SHELL_RADIUS * SHELL[d.tier - 1], 0, 0, 0).strength(0.28))
      // forceRadial fixes each node's DISTANCE from the origin but not its
      // direction, so the cloud as a whole is still free to drift off-centre — and
      // it does. forceCenter is a rigid translation of the centroid back to the
      // origin, so it corrects the drift without pulling against the shells.
      .force('center', forceCenter(0, 0, 0))
      // Flatten the cloud slightly into a lens. A sphere hides its own middle, and
      // the middle is where the four nouns are.
      .force('lens', forceY(0).strength(0.03))
      .force('collide', forceCollide((d: SimNode) => radiusOf(d.authority) + 9))
      .alphaDecay(0.017)
      .stop()

    return { sim, nodes }
  }, [terms, edges])

  const settled = useRef(false)
  const ready = useRef(false)

  // Reusable scratch, so the frame loop allocates nothing.
  const scratch = useMemo(
    () => ({
      matrix: new THREE.Matrix4(),
      position: new THREE.Vector3(),
      quaternion: new THREE.Quaternion(),
      scale: new THREE.Vector3(),
      color: new THREE.Color(),
      edgeColor: new THREE.Color(),
      projected: new THREE.Vector3(),
      below: new THREE.Vector3(),
      screenUp: new THREE.Vector3(),
      screenRight: new THREE.Vector3(),
      lookTarget: new THREE.Vector3(),
    }),
    [],
  )

  /*
   * Colour is the only thing the theme touches. These three memos key on
   * `[terms, theme]` — never the simulation, which stays keyed on `[terms, edges]`
   * alone. Rebuilding 63 THREE.Colors costs microseconds and moves no node.
   *
   * `setColorAt` already runs every frame, so a new palette lands on the very next
   * frame with no extra plumbing.
   */
  const ground = useMemo(() => new THREE.Color(groundHex(theme)), [theme])
  const baseColors = useMemo(
    () => terms.map((t) => new THREE.Color(sectionHex(t.color[theme]))),
    [terms, theme],
  )
  /**
   * The de-emphasised colour of every node, precomputed.
   *
   * Fading *toward the ground* rather than toward a fixed pale value is what
   * makes de-emphasis survive the dark theme. Lerping toward paper on graphite
   * would make the dimmed nodes the brightest things on screen — hover, search
   * and the legend spotlight would all silently invert into highlighting.
   */
  const dimColors = useMemo(
    () => terms.map((t) => new THREE.Color(sectionHex(dimmed(t.color[theme], theme)))),
    [terms, theme],
  )

  /*
   * The edges, in two objects.
   *
   * `lineBasicMaterial` silently clamps `linewidth` to 1px on every core WebGL
   * profile, so edge weight was not merely unused — it was inexpressible, and at
   * DPR 2 a 1px hairline on warm paper is sub-pixel noise rather than a drawn
   * line. The design's own comments call the edges the subject of this graph;
   * they had never actually been drawn.
   *
   * LineSegments2 draws them as instanced quads instead, so width is real. It
   * ships inside three itself — this costs no new dependency.
   *
   * Two objects because `linewidth` is a material uniform and cannot vary per
   * instance. That constraint happens to be exactly the split worth making: edges
   * where both terms reach for each other (165 of them) are drawn heavier than
   * the ones that only point one way (264). Mutuality reads instantly, with no
   * legend and no arrowheads.
   */
  const edgeGroups = useMemo(() => {
    const build = (items: { edge: GraphEdge; index: number }[], linewidth: number) => {
      const positions = new Float32Array(items.length * 6)
      const colors = new Float32Array(items.length * 6)

      const geometry = new LineSegmentsGeometry()
      // Called ONCE. Both of these allocate a fresh InstancedInterleavedBuffer on
      // every call, and this file's frame loop promises to allocate nothing — so
      // afterwards we mutate the arrays in place and flag the buffer instead.
      geometry.setPositions(positions)
      geometry.setColors(colors)

      const material = new LineMaterial({
        vertexColors: true,
        linewidth,
        transparent: true,
        opacity: 0.75,
        depthWrite: false,
        // LineMaterial extends ShaderMaterial, whose constructor sets `fog = false`
        // and which LineMaterial never overrides — despite compiling the fog
        // chunks. Without this the edges would silently ignore the fog while the
        // rest of the scene honours it.
        fog: true,
      })

      const object = new LineSegments2(geometry, material)
      object.frustumCulled = false
      // Otherwise these intercept the pointer and the nodes stop receiving hover
      // and click.
      object.raycast = () => null

      // Hold the interleaved buffers themselves. instanceStart and instanceEnd are
      // two views onto ONE stride-6 buffer, so `needsUpdate` belongs on the buffer;
      // setting it on the attribute is a silent no-op.
      const positionBuffer = (geometry.attributes.instanceStart as THREE.InterleavedBufferAttribute).data
      const colorBuffer = (geometry.attributes.instanceColorStart as THREE.InterleavedBufferAttribute).data

      return { items, positions, colors, geometry, material, object, positionBuffer, colorBuffer }
    }

    const indexed = edges.map((edge, index) => ({ edge, index }))
    return [
      build(indexed.filter((e) => !e.edge.mutual), 1.1),
      build(indexed.filter((e) => e.edge.mutual), 1.8),
    ]
  }, [edges])

  // LineMaterial converts its pixel width to clip space with this.
  useEffect(() => {
    for (const g of edgeGroups) g.material.resolution.set(size.width, size.height)
  }, [edgeGroups, size])

  /**
   * The focus ring.
   *
   * The only feedback on hover used to be a size pop, which reads as the node
   * wobbling rather than as an affordance. The ring is opaque geometry in the
   * section's own colour, so it behaves identically on both grounds — no additive
   * blending, which would blow out to white where several edges converge on a hub.
   *
   * It eases in and HOLDS. A ring that pulses is a screensaver.
   */
  const ringRef = useRef<THREE.Mesh>(null)
  const ringScale = useRef(0)

  /** Per-label scratch for the frame loop. Preallocated: the loop allocates nothing. */
  const L = useMemo(
    () => ({
      x: new Float32Array(terms.length),
      y: new Float32Array(terms.length),
      depth: new Float32Array(terms.length),
      candidate: new Uint8Array(terms.length),
      wasVisible: new Uint8Array(terms.length),
      boxes: new Float32Array(terms.length * 4),
    }),
    [terms],
  )

  /** Who gets to claim screen space first: the nucleus, then the body, then the rim. */
  const labelOrder = useMemo(
    () =>
      terms
        .map((_, i) => i)
        .sort((a, b) => terms[a].tier - terms[b].tier || terms[b].authority - terms[a].authority),
    [terms],
  )

  /**
   * Label widths, measured once.
   *
   * After `document.fonts.ready`, not at mount: the layout loads JetBrains Mono
   * through next/font with `display: swap`, so at mount the metrics on screen are
   * still the fallback's. Measuring then would cache the wrong width for every
   * label for the rest of the session, and the declutter would be quietly wrong.
   */
  const labelWidths = useRef<number[]>([])
  useEffect(() => {
    let live = true
    const measure = () => {
      if (!live) return
      labelWidths.current = terms.map((_, i) => labels.current?.[i]?.offsetWidth ?? 56)
    }
    document.fonts.ready.then(measure)
    return () => {
      live = false
    }
  }, [terms, labels])

  useEffect(
    () => () => {
      for (const g of edgeGroups) {
        g.geometry.dispose()
        g.material.dispose()
      }
    },
    [edgeGroups],
  )

  // Both are built once. The theme only decides which one is bound, so switching
  // costs a texture pointer — no material rebuild, no mesh remount.
  const matcaps = useMemo(() => ({ light: makeMatcap(0.55), dark: makeMatcap(0.88) }), [])
  const nodeMaterialRef = useRef<THREE.MeshMatcapMaterial>(null)

  useEffect(() => {
    if (!nodeMaterialRef.current) return
    nodeMaterialRef.current.matcap = matcaps[theme]
    nodeMaterialRef.current.needsUpdate = true
  }, [theme, matcaps])

  useEffect(() => () => {
    matcaps.light.dispose()
    matcaps.dark.dispose()
  }, [matcaps])

  /* ---------------------------------------------------------------- camera */

  // A hand-rolled orbit: drag to turn, wheel to dolly. The camera always looks
  // at `focus`, which eases onto the selected node so it comes to centre.
  const orbit = useRef({ theta: 0.6, phi: 1.15, radius: 460, targetRadius: 460 })
  const focus = useRef(new THREE.Vector3())
  const desiredFocus = useRef(new THREE.Vector3())
  const dragging = useRef(false)
  const idleSince = useRef(0)
  /** Distance at which the whole settled graph fits the viewport. */
  const fitRadius = useRef(460)
  /** Radius of the node cloud. Drives the fog and the label depth fade. */
  const extent = useRef(200)
  const fogRef = useRef<THREE.Fog>(null)
  /** Once the user touches the wheel, stop auto-fitting under them. */
  const userZoomed = useRef(false)

  /** Read in the frame loop, so the idle drift can be suppressed without a re-render. */
  const reducedMotion = useRef(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => {
      reducedMotion.current = mq.matches
    }
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  /** Pixels travelled during the current gesture. A drag must not become a click. */
  const travelled = useRef(0)
  /** Eased horizontal pan, in CSS pixels, that keeps the focus clear of the panel. */
  const pan = useRef(0)

  useEffect(() => {
    const el = gl.domElement
    let lastX = 0
    let lastY = 0

    const down = (e: PointerEvent) => {
      dragging.current = true
      travelled.current = 0
      lastX = e.clientX
      lastY = e.clientY
    }

    // Move and up live on the window, not the canvas. Pointer capture on the
    // canvas would swallow the click that react-three-fiber needs to raycast,
    // and the drag should keep working if the cursor leaves the canvas anyway.
    const move = (e: PointerEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY
      travelled.current += Math.abs(dx) + Math.abs(dy)

      orbit.current.theta -= dx * 0.005
      orbit.current.phi -= dy * 0.005
      // Stop short of the poles, where the camera would flip over.
      orbit.current.phi = Math.max(0.12, Math.min(Math.PI - 0.12, orbit.current.phi))
      idleSince.current = performance.now()
    }

    const up = () => {
      dragging.current = false
      idleSince.current = performance.now()
    }

    const wheel = (e: WheelEvent) => {
      const o = orbit.current
      o.targetRadius = Math.max(70, Math.min(900, o.targetRadius * (1 + Math.sign(e.deltaY) * 0.12)))
      userZoomed.current = true
      e.preventDefault()
      idleSince.current = performance.now()
    }

    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })

    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
    }
  }, [gl])

  // Ease the camera onto whatever is selected, and back out again on deselect.
  useEffect(() => {
    if (!selected) {
      desiredFocus.current.set(0, 0, 0)
      orbit.current.targetRadius = fitRadius.current
      userZoomed.current = false
      return
    }
    const node = nodes[indexById.get(selected)!]
    desiredFocus.current.set(node.x, node.y, node.z)
    orbit.current.targetRadius = fitRadius.current * 0.42
  }, [selected, nodes, indexById])

  /** The distance from which the cloud fills the viewport, on both axes. */
  const measureFit = () => {
    const cam = camera as THREE.PerspectiveCamera

    // The furthest node, not a percentile: a term clipped off the top edge is a
    // term the reader cannot find, which is worse than a slightly smaller graph.
    let spread = 1
    for (const n of nodes) spread = Math.max(spread, Math.hypot(n.x, n.y, n.z))
    extent.current = spread

    const halfV = (cam.fov / 2) * (Math.PI / 180)
    const halfH = Math.atan(Math.tan(halfV) * cam.aspect)
    // Pad for the node itself and the label hanging below it.
    return (spread + 30) / Math.tan(Math.min(halfV, halfH))
  }

  /* ----------------------------------------------------------------- frame */

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return

    // Settle the layout over the first seconds, then leave it alone.
    if (!settled.current) {
      sim.tick()
      if (sim.alpha() < 0.02) settled.current = true

      // Track the growing cloud so the camera pulls back as it expands, rather
      // than letting the graph burst out of frame.
      fitRadius.current = measureFit()
      if (!userZoomed.current && !selected) orbit.current.targetRadius = fitRadius.current
    }

    /* camera, first: the node pass below reads o.radius for its depth fade */
    const o = orbit.current
    // Drift slowly when the graph is unattended. Hovering counts as attention:
    // a node must not slide out from under the cursor as you go to click it.
    //
    // A perpetual, full-field rotation is exactly the motion `prefers-reduced-
    // motion` exists to suppress, and this was ignoring it — below the bar the
    // rest of the codebase already holds itself to.
    const idle =
      !reducedMotion.current &&
      !dragging.current &&
      !selected &&
      !hovered &&
      performance.now() - idleSince.current > 2500
    if (idle) o.theta += delta * 0.04

    o.radius += (o.targetRadius - o.radius) * Math.min(1, delta * 3.2)
    focus.current.lerp(desiredFocus.current, Math.min(1, delta * 3))

    const sinPhi = Math.sin(o.phi)
    camera.position.set(
      focus.current.x + o.radius * sinPhi * Math.sin(o.theta),
      focus.current.y + o.radius * Math.cos(o.phi),
      focus.current.z + o.radius * sinPhi * Math.cos(o.theta),
    )
    camera.lookAt(focus.current)

    // The panel covers the right of the screen, so slide the view right by half
    // its width. The focused node then lands in the middle of what is still
    // visible rather than behind the panel. Moving the camera and its target by
    // the same vector pans the image without turning it.
    pan.current += (panelWidth / 2 - pan.current) * Math.min(1, delta * 4)
    if (Math.abs(pan.current) > 0.5) {
      const cam = camera as THREE.PerspectiveCamera
      const halfV = (cam.fov / 2) * (Math.PI / 180)
      const worldPerPixel = (2 * Math.tan(halfV) * o.radius) / size.height
      const shift = pan.current * worldPerPixel

      scratch.screenRight.set(1, 0, 0).applyQuaternion(camera.quaternion)
      camera.position.addScaledVector(scratch.screenRight, shift)
      scratch.lookTarget.copy(focus.current).addScaledVector(scratch.screenRight, shift)
      camera.lookAt(scratch.lookTarget)
    }

    // Fog tracks the camera, so it is always a depth cue across the cloud and
    // never a haze over the whole thing.
    //
    // The far multiplier is what decides how much depth the fog can actually
    // express: the farthest node sits one `extent` behind the focus, so it only
    // ever reaches extent / (multiplier * extent) of the way into the ground. At
    // 2.6 that was 38% — the fog was running at a third strength, which is why
    // the graph read as a flat scatter that happens to rotate. At 1.9 the back of
    // the cloud reaches ~57%: a real depth cue that still leaves the node half
    // its colour. Higher is worse, not better — see the node fade below, which
    // has to stay clear of the floor where a far *and* dimmed node hits zero.
    if (fogRef.current) {
      fogRef.current.near = o.radius - extent.current * 0.2
      fogRef.current.far = o.radius + extent.current * 1.9
    }

    const focusId = hovered ?? selected
    const focusIndex = focusId != null ? (indexById.get(focusId) ?? -1) : -1
    // Anything that narrows the graph dims whatever it leaves out.
    const dimming = Boolean(neighbours) || Boolean(spotlit) || Boolean(matched)
    // Dolly in far enough and the rim resolves into names: a real level of detail.
    const zoomedIn = o.radius < fitRadius.current * 0.55

    // How far the resting edges sit into the ground. Not one number, because the
    // same wash does not read the same on both grounds: a hue keeps far more of
    // its apparent saturation against graphite than against bright paper, so an
    // equal blend leaves the dark theme with 429 vivid ribbons and a hairball.
    const idleWash = theme === 'dark' ? 0.76 : 0.66

    // Screen-down, in world space. Used to hang each label below its node by an
    // exact pixel amount rather than a world-space guess.
    scratch.screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion)

    /* nodes and labels */
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const term = terms[i]
      const r = radiusOf(node.authority)

      const isFocus = term.id === focusId
      const near = neighbours ? neighbours.has(term.id) : true
      const inSection = spotlit ? term.section === spotlit : true
      const inSearch = matched ? matched.has(term.id) : true
      const lit = near && inSection && inSearch

      scratch.position.set(node.x, node.y, node.z)
      scratch.scale.setScalar(r * (isFocus ? 1.6 : 1))
      scratch.matrix.compose(scratch.position, scratch.quaternion, scratch.scale)
      mesh.setMatrixAt(i, scratch.matrix)

      // Depth from real distance to the camera. NDC z is nonlinear and bunches
      // everything up against 1.0, which fades every label to the same grey.
      const dist = camera.position.distanceTo(scratch.position)
      const t = THREE.MathUtils.clamp((dist - (o.radius - extent.current)) / (2 * extent.current), 0, 1)

      /*
       * The node's depth fade, done here rather than by the scene fog (the node
       * material has `fog={false}`).
       *
       * The reason is that the two attenuations multiply. A node that is both
       * de-emphasised AND at the back of the cloud would get the dim treatment and
       * then the full fog on top, and compose all the way to the ground — clicking
       * one legend item would delete the far half of the graph rather than quiet
       * it. So the dimmed nodes, which already sit close to the ground, are barely
       * faded further; the lit ones carry the depth cue.
       *
       * Nodes carry identity and recede gently. Edges carry structure and keep the
       * real fog, so they dissolve properly.
       */
      const faded = dimming && !lit
      // The focused node is exempt. It sits at the focus plane, which is halfway
      // through the depth ramp, so it would otherwise be washed a fifth of the way
      // into the ground — and the one thing you are actually looking at should be
      // the most saturated object on screen.
      const fade = isFocus ? 0 : (faded ? 0.18 : 0.45) * t
      scratch.color.copy(faded ? dimColors[i] : baseColors[i]).lerp(ground, fade)
      mesh.setColorAt(i, scratch.color)

      /*
       * Where this label WANTS to be. Whether it gets to speak is decided in the
       * declutter pass below, once every label has asked.
       */
      scratch.projected.copy(scratch.position).project(camera)
      const behind = scratch.projected.z > 1

      // Project a second point one radius "below" the node on screen, so the
      // label clears the node at every zoom level.
      scratch.below.copy(scratch.position).addScaledVector(scratch.screenUp, -r).project(camera)

      L.x[i] = (scratch.projected.x * 0.5 + 0.5) * size.width
      L.y[i] = (-scratch.below.y * 0.5 + 0.5) * size.height
      // Floor raised from 0.30: a far label was fading to a grey nobody can read.
      L.depth[i] = 1 - 0.55 * t

      /*
       * Who is allowed to ask at all.
       *
       * All 63 labels used to render every frame, which on a settled graph is 63
       * overlapping 11.5px strings — far and away the loudest thing in the scene,
       * and it gets worse now that the edges are coloured ribbons rather than grey
       * hairlines. So the same authority number that sizes the nodes decides who
       * speaks: the four nouns are the map's city names and are always on, the body
       * of the vocabulary is on at rest, and the rim stays quiet until you ask for
       * it — by hovering, by spotlighting its section, by searching, or by zooming
       * in far enough that there is room for it.
       *
       * A de-emphasised label is hidden outright rather than rendered at 12%
       * opacity, which was text at a contrast nobody could read anyway.
       */
      const tier = terms[i].tier
      const revealed = isFocus || (dimming && lit) || zoomedIn
      const candidate = !behind && !(dimming && !lit) && (tier <= 2 || revealed)
      L.candidate[i] = candidate ? 1 : 0
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    /*
     * Declutter, in screen space.
     *
     * Walk the labels in priority order — the focused one first, then by tier and
     * authority — and drop any whose box collides with one already placed. 63
     * items is a couple of thousand box tests in the worst case, which is nothing.
     *
     * The padding is asymmetric on purpose: a label that is already showing is
     * given a slightly smaller box than one trying to appear. Without that
     * hysteresis, two labels that just touch swap places every few frames as the
     * graph turns, and the whole field strobes.
     */
    let placed = 0
    for (let pass = 0; pass < 2; pass++) {
      for (let k = 0; k < labelOrder.length; k++) {
        const i = labelOrder[k]
        const isFocusLabel = i === focusIndex
        // The focused label is placed before everything else and never dropped.
        if (pass === 0 ? !isFocusLabel : isFocusLabel) continue

        const el = labels.current?.[i]
        if (!el) continue

        let show = L.candidate[i] === 1
        if (show) {
          const halfW = (labelWidths.current[i] || 56) / 2
          const pad = L.wasVisible[i] ? 1 : 4
          const x0 = L.x[i] - halfW - pad
          const x1 = L.x[i] + halfW + pad
          const y0 = L.y[i] - pad
          const y1 = L.y[i] + LABEL_HEIGHT + pad

          if (!isFocusLabel) {
            for (let p = 0; p < placed; p++) {
              const b = p * 4
              if (x0 < L.boxes[b + 2] && x1 > L.boxes[b] && y0 < L.boxes[b + 3] && y1 > L.boxes[b + 1]) {
                show = false
                break
              }
            }
          }

          if (show) {
            const b = placed * 4
            L.boxes[b] = x0
            L.boxes[b + 1] = y0
            L.boxes[b + 2] = x1
            L.boxes[b + 3] = y1
            placed++
          }
        }

        L.wasVisible[i] = show ? 1 : 0
        el.style.transform = `translate3d(${L.x[i]}px, ${L.y[i]}px, 0) translate(-50%, 7px)`
        el.style.opacity = show ? String(isFocusLabel ? 1 : L.depth[i]) : '0'
        // Never display:none — offsetWidth would read 0 and a hidden label would
        // then pass every overlap test and flicker back on.
        el.style.visibility = show ? 'visible' : 'hidden'
        if (isFocusLabel !== (el.dataset.focus === 'true')) {
          el.dataset.focus = isFocusLabel ? 'true' : 'false'
        }
      }
    }

    /* edges */
    for (const g of edgeGroups) {
      for (let k = 0; k < g.items.length; k++) {
        const edge = g.items[k].edge
        const si = indexById.get(edge.source)!
        const ti = indexById.get(edge.target)!
        const a = nodes[si]
        const b = nodes[ti]
        const o = k * 6

        /*
         * Stop the edge at each node's surface, not at its centre.
         *
         * An edge drawn to the centre carries on out through the front of the
         * sphere, and the part of it that has left the sphere while still
         * overlapping it on screen is genuinely nearer than the surface — so it
         * draws over the node, and every node ends up scratched through by the
         * edges leaving it toward the camera. Trimming also just reads better: the
         * edges now visibly meet the spheres instead of burying themselves in them.
         */
        let ax = a.x
        let ay = a.y
        let az = a.z
        let bx = b.x
        let by = b.y
        let bz = b.z

        const dx = b.x - a.x
        const dy = b.y - a.y
        const dz = b.z - a.z
        const len = Math.hypot(dx, dy, dz)
        // A little wider than the sphere: an edge running nearly along the view
        // axis still overlaps the disc on screen after trimming, and no trim fixes
        // that case, so leave enough air that it reads as a connection.
        const ra = radiusOf(a.authority) + 3
        const rb = radiusOf(b.authority) + 3

        // Two nodes closer than their own radii would invert the segment.
        if (len > ra + rb + 2) {
          const ux = dx / len
          const uy = dy / len
          const uz = dz / len
          ax += ux * ra
          ay += uy * ra
          az += uz * ra
          bx -= ux * rb
          by -= uy * rb
          bz -= uz * rb
        }

        g.positions[o] = ax
        g.positions[o + 1] = ay
        g.positions[o + 2] = az
        g.positions[o + 3] = bx
        g.positions[o + 4] = by
        g.positions[o + 5] = bz

        const touchesFocus = focusId != null && (edge.source === focusId || edge.target === focusId)
        // An edge stays lit only if both of its ends survive every active filter.
        const inSection = spotlit ? terms[si].section === spotlit && terms[ti].section === spotlit : true
        const inSearch = matched ? matched.has(edge.source) && matched.has(edge.target) : true
        const lit = inSection && inSearch

        // Each end takes its OWN node's colour, so an edge carries where it comes
        // from and where it goes — which is why this graph needs no arrowheads. The
        // pull toward the ground is what makes 429 of them a woven field rather
        // than a rainbow hairball: at rest they sit most of the way into the
        // ground, and only what you are looking at comes up to full strength.
        const wash = touchesFocus ? 0 : dimming ? (lit ? 0.45 : 0.88) : idleWash

        scratch.edgeColor.copy(baseColors[si]).lerp(ground, wash)
        g.colors[o] = scratch.edgeColor.r
        g.colors[o + 1] = scratch.edgeColor.g
        g.colors[o + 2] = scratch.edgeColor.b

        scratch.edgeColor.copy(baseColors[ti]).lerp(ground, wash)
        g.colors[o + 3] = scratch.edgeColor.r
        g.colors[o + 4] = scratch.edgeColor.g
        g.colors[o + 5] = scratch.edgeColor.b
      }

      g.positionBuffer.needsUpdate = true
      g.colorBuffer.needsUpdate = true
    }

    /* focus ring */
    const ring = ringRef.current
    if (ring) {
      const target = focusIndex >= 0 ? 1 : 0
      ringScale.current += (target - ringScale.current) * Math.min(1, delta * 12)

      if (ringScale.current < 0.01) {
        ring.visible = false
      } else if (focusIndex >= 0) {
        const node = nodes[focusIndex]
        ring.visible = true
        ring.position.set(node.x, node.y, node.z)
        // Billboard: copy the camera's orientation so the ring always faces us.
        ring.quaternion.copy(camera.quaternion)
        ring.scale.setScalar(radiusOf(node.authority) * 1.9 * ringScale.current)
        ;(ring.material as THREE.MeshBasicMaterial).color.copy(baseColors[focusIndex])
        ;(ring.material as THREE.MeshBasicMaterial).opacity = ringScale.current
      }
    }

    if (!ready.current) {
      ready.current = true
      onReady()
    }
  })

  // Seed the layout so the first painted frame is already a graph, not a single
  // dot at the origin.
  useEffect(() => {
    for (let i = 0; i < 120; i++) sim.tick()
  }, [sim])

  // The fog's colour, set on the existing object rather than through `args`.
  useEffect(() => {
    fogRef.current?.color.copy(ground)
  }, [ground])

  return (
    <>
      {/*
        Depth cue: the far side of the cloud washes into the ground, whichever
        ground that is.

        `args` are CONSTRUCTOR args, so they stay static — passing the live colour
        here would re-instantiate THREE.Fog on every toggle, momentarily nulling
        the ref that the frame loop writes near/far into. The numbers below are
        placeholders overwritten every frame; only the colour is real, and it is
        set imperatively in the effect above.
      */}
      <fog ref={fogRef} attach="fog" args={FOG_ARGS} />

      {/*
        Mounted as plain objects rather than as r3f elements: <primitive> sidesteps
        both `extend()` and the ThreeElements type augmentation that LineSegments2
        would otherwise need.
      */}
      {edgeGroups.map((g, i) => (
        <primitive key={i} object={g.object} />
      ))}

      <mesh ref={ringRef} visible={false} raycast={() => null}>
        <ringGeometry args={[0.86, 1, 48]} />
        <meshBasicMaterial transparent depthWrite={false} toneMapped={false} />
      </mesh>

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, terms.length]}
        frustumCulled={false}
        onPointerMove={(e) => {
          e.stopPropagation()
          if (dragging.current) return
          if (e.instanceId != null) onHover(terms[e.instanceId].id)
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation()
          // Releasing a drag over a node is not a click on that node.
          if (travelled.current > 6) return
          if (e.instanceId != null) onSelect(terms[e.instanceId].id)
        }}
      >
        <sphereGeometry args={[1, 32, 24]} />
        {/*
          The per-instance colour path survives the swap untouched: meshmatcap's
          shader includes <color_vertex>, which applies instanceColor under
          USE_INSTANCING_COLOR, so `setColorAt` keeps driving section colour.

          `fog={false}` because the node depth fade is done on the CPU instead —
          see the frame loop. Scene fog and the dim state would otherwise multiply,
          and a node that is both de-emphasised AND at the back would compose to
          nothing at all: erased rather than quieted.
        */}
        <meshMatcapMaterial ref={nodeMaterialRef} matcap={matcaps[theme]} fog={false} toneMapped={false} />
      </instancedMesh>
    </>
  )
}
