import { BufferGeometry } from './renderer/buffer-geometry';
import { calculateVertexNormals } from '@/engine/math-helpers';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { AttributeLocation } from '@/engine/renderer/renderer';

export  class PlaneGeometry extends BufferGeometry {
  vertices: EnhancedDOMPoint[];

  constructor(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1, heightmap?: number[]) {
    super();
    const indices: number[] = [];
    const uvs: number[] = [];
    this.vertices = [];
    buildPlane('x', 'z', 'y', 1, 1, width, depth, 1, subdivisionsWidth, subdivisionsDepth, this.vertices, indices, [], uvs, 0, heightmap);

    const normals = calculateVertexNormals(this.vertices, indices);
    this.setAttribute(AttributeLocation.Positions, new Float32Array(this.vertices.flatMap(point => point.toArray())), 3);
    this.setAttribute(AttributeLocation.Normals, new Float32Array(normals.flatMap(point => point.toArray())), 3);
    this.setAttribute(AttributeLocation.TextureCoords, new Float32Array(uvs), 2);
    this.setIndices(new Uint16Array(indices));
  }
}

export function buildPlane(
  u: 'x' | 'y' | 'z',
  v: 'x' | 'y' | 'z',
  w: 'x' | 'y' | 'z',
  uDir: number,
  vDir: number,
  width: number,
  height: number,
  depth: number,
  gridX: number,
  gridY: number,
  vertices: EnhancedDOMPoint[],
  indices: number[],
  normals: number[],
  uvs: number[],
  startVertexCount = 0,
  heightmap?: number[],
) {
  const segmentWidth = width / gridX;
  const segmentHeight = height / gridY;

  const widthHalf = width / 2;
  const heightHalf = height / 2;
  const depthHalf = depth / 2;

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const vector = new EnhancedDOMPoint();

  let heightmapPosition = 0;
  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segmentHeight - heightHalf;

    for (let ix = 0; ix < gridX1; ix++) {

      const x = ix * segmentWidth - widthHalf;

      // set values to correct vector component
      vector[u] = x * uDir;
      vector[v] = y * vDir;
      vector[w] = heightmap ? heightmap[heightmapPosition] : depthHalf;

      // now apply vector to vertex buffer
      vertices.push(new EnhancedDOMPoint().set(vector));

      // set values to correct vector component
      vector[u] = 0;
      vector[v] = 0;
      vector[w] = depth > 0 ? 1 : -1;

      normals.push(vector.x, vector.y, vector.z);

      uvs.push(ix);
      uvs.push(1 - (iy));
      // To make the texture spread across the whole plane regardless of subdivisions we can do this instead:
      // uvs.push(ix / gridX);
      // uvs.push(1 - (iy / gridY));
      // Currently I don't want this behavior but might in the future. Might be better to have it spread across
      // the whole mesh and handle texture repeat via the material repeat property.
      heightmapPosition++;
    }
  }

  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = startVertexCount + ix + gridX1 * iy;
      const b = startVertexCount + ix + gridX1 * (iy + 1);
      const c = startVertexCount + (ix + 1) + gridX1 * (iy + 1);
      const d = startVertexCount + (ix + 1) + gridX1 * iy;

      // Faces here, this could be updated to populate an array of faces rather than calculating them separately
      indices.push(a, b, d);
      indices.push(b, c, d);
    }
  }
}
