'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide } from 'd3-force-3d'
import { sectionHex } from '@/lib/color'
import type { GraphEdge, GraphTerm } from './graph-explorer'

const PAPER = new THREE.Color('#eae8e4')
const EDGE_IDLE = new THREE.Color('#c6c0b6')
const EDGE_LIVE = new THREE.Color('#2f2a24')

/**
 * Node size reads connectedness. Kept small on purpose: the edges are the
 * subject of this graph, and fat nodes bury both the edges and their own
 * labels. sqrt so a hub does not swamp the scene.
 */
function radiusOf(degree: number) {
  return 2.0 + Math.sqrt(degree) * 0.85
}

type SimNode = { id: string; index: number; degree: number; x: number; y: number; z: number }

export type SceneProps = {
  terms: GraphTerm[]
  edges: GraphEdge[]
  hovered: string | null
  selected: string | null
  /** Section title to spotlight, from the legend. */
  spotlit: string | null
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
  onHover,
  onSelect,
  labels,
  onReady,
}: SceneProps) {
  const { camera, gl, size } = useThree()

  const meshRef = useRef<THREE.InstancedMesh>(null)
  const linesRef = useRef<THREE.LineSegments>(null)

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

  // Built once: the graph never changes shape at runtime.
  const { sim, nodes } = useMemo(() => {
    const nodes: SimNode[] = terms.map((t, index) => ({
      id: t.id,
      index,
      degree: t.degree,
      x: 0,
      y: 0,
      z: 0,
    }))
    const links = edges.map((e) => ({ source: e.source, target: e.target }))

    const sim = forceSimulation(nodes, 3)
      .force('charge', forceManyBody().strength(-430))
      .force(
        'link',
        forceLink(links)
          .id((d: SimNode) => d.id)
          // Hubs pull their many neighbours inward, so give their edges more rope.
          .distance((l: { source: SimNode; target: SimNode }) => 48 + (l.source.degree + l.target.degree) * 0.9)
          .strength(0.3),
      )
      .force('center', forceCenter(0, 0, 0))
      .force('collide', forceCollide((d: SimNode) => radiusOf(d.degree) + 9))
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
    }),
    [],
  )

  const baseColors = useMemo(() => terms.map((t) => new THREE.Color(sectionHex(t.color))), [terms])
  const edgePositions = useMemo(() => new Float32Array(edges.length * 2 * 3), [edges])
  const edgeColors = useMemo(() => new Float32Array(edges.length * 2 * 3), [edges])

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

  /** Pixels travelled during the current gesture. A drag must not become a click. */
  const travelled = useRef(0)

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
    const lines = linesRef.current
    if (!mesh || !lines) return

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
    const idle =
      !dragging.current && !selected && !hovered && performance.now() - idleSince.current > 2500
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

    // Fog tracks the camera, so it is always a depth cue across the cloud and
    // never a haze over the whole thing. The near half stays unfogged.
    if (fogRef.current) {
      fogRef.current.near = o.radius
      fogRef.current.far = o.radius + extent.current * 2.6
    }

    const focusId = hovered ?? selected
    const dimming = Boolean(neighbours) || Boolean(spotlit)

    // Screen-down, in world space. Used to hang each label below its node by an
    // exact pixel amount rather than a world-space guess.
    scratch.screenUp.set(0, 1, 0).applyQuaternion(camera.quaternion)

    /* nodes and labels */
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const term = terms[i]
      const r = radiusOf(node.degree)

      const isFocus = term.id === focusId
      const near = neighbours ? neighbours.has(term.id) : true
      const inSection = spotlit ? term.section === spotlit : true
      const lit = near && inSection

      scratch.position.set(node.x, node.y, node.z)
      scratch.scale.setScalar(r * (isFocus ? 1.6 : 1))
      scratch.matrix.compose(scratch.position, scratch.quaternion, scratch.scale)
      mesh.setMatrixAt(i, scratch.matrix)

      scratch.color.copy(baseColors[i])
      if (dimming && !lit) scratch.color.lerp(PAPER, 0.84)
      mesh.setColorAt(i, scratch.color)

      const label = labels.current?.[i]
      if (!label) continue

      scratch.projected.copy(scratch.position).project(camera)
      const behind = scratch.projected.z > 1

      // Depth from real distance to the camera. NDC z is nonlinear and bunches
      // everything up against 1.0, which fades every label to the same grey.
      const dist = camera.position.distanceTo(scratch.position)
      const t = THREE.MathUtils.clamp((dist - (o.radius - extent.current)) / (2 * extent.current), 0, 1)
      const depth = 1 - 0.7 * t

      // Project a second point one radius "below" the node on screen, so the
      // label clears the node at every zoom level.
      scratch.below.copy(scratch.position).addScaledVector(scratch.screenUp, -r).project(camera)

      const x = (scratch.projected.x * 0.5 + 0.5) * size.width
      const y = (-scratch.below.y * 0.5 + 0.5) * size.height

      const opacity = behind ? 0 : dimming && !lit ? depth * 0.12 : isFocus ? 1 : depth

      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 7px)`
      label.style.opacity = String(opacity)
      label.style.fontWeight = isFocus ? '600' : '400'
    }
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true

    /* edges */
    for (let i = 0; i < edges.length; i++) {
      const si = indexById.get(edges[i].source)!
      const ti = indexById.get(edges[i].target)!
      const a = nodes[si]
      const b = nodes[ti]
      const o = i * 6

      edgePositions[o] = a.x
      edgePositions[o + 1] = a.y
      edgePositions[o + 2] = a.z
      edgePositions[o + 3] = b.x
      edgePositions[o + 4] = b.y
      edgePositions[o + 5] = b.z

      const touchesFocus = focusId != null && (edges[i].source === focusId || edges[i].target === focusId)
      const inSection = spotlit ? terms[si].section === spotlit && terms[ti].section === spotlit : true

      let color: THREE.Color
      if (touchesFocus) color = EDGE_LIVE
      else if (dimming && !inSection) color = scratch.edgeColor.copy(EDGE_IDLE).lerp(PAPER, 0.8)
      else color = EDGE_IDLE

      for (let v = 0; v < 2; v++) {
        edgeColors[o + v * 3] = color.r
        edgeColors[o + v * 3 + 1] = color.g
        edgeColors[o + v * 3 + 2] = color.b
      }
    }
    lines.geometry.getAttribute('position').needsUpdate = true
    lines.geometry.getAttribute('color').needsUpdate = true

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

  return (
    <>
      {/* Depth cue on a light ground: the far side of the cloud washes into the paper. */}
      <fog ref={fogRef} attach="fog" args={['#eae8e4', 400, 1200]} />

      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[edgePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[edgeColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors transparent opacity={0.7} />
      </lineSegments>

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
        <sphereGeometry args={[1, 24, 18]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </>
  )
}
