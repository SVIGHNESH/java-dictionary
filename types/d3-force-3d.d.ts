declare module 'd3-force-3d' {
  // The 3D fork of d3-force. Same API, plus a numDimensions argument on
  // forceSimulation and a z coordinate on every node.
  export function forceSimulation<N = unknown>(nodes?: N[], numDimensions?: number): any
  export function forceManyBody(): any
  export function forceLink<L = unknown>(links?: L[]): any
  export function forceCenter(x?: number, y?: number, z?: number): any
  export function forceCollide(radius?: number | ((d: any) => number)): any
  export function forceX(x?: number): any
  export function forceY(y?: number): any
  export function forceZ(z?: number): any
}
