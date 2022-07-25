import { BufferGeometry } from './renderer/buffer-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { buildPlane } from '@/engine/plane-geometry';
import { calculateVertexNormals, radsToDegrees } from '@/engine/math-helpers';

export class CubeGeometry extends BufferGeometry {
  vertices: EnhancedDOMPoint[] = [];

  constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
    super();
    this.buildBox(width, height, depth, widthSegments, heightSegments, depthSegments);
  }

  private buildBox(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) {
    const indices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, this.vertices, indices, normals, uvs, this.vertices.length); // left
    buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, this.vertices, indices, normals, uvs, this.vertices.length); // right
    buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, this.vertices, indices, normals, uvs, this.vertices.length); // top
    buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, this.vertices, indices, normals, uvs, this.vertices.length); // bottom
    buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, this.vertices, indices, normals, uvs, this.vertices.length); // front
    buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, this.vertices, indices, normals, uvs, this.vertices.length); // back

    this.setAttribute(AttributeLocation.Positions, new Float32Array(this.vertices.flatMap(point => point.toArray())), 3);
    this.setAttribute(AttributeLocation.Normals, new Float32Array(normals), 3);
    this.setAttribute(AttributeLocation.TextureCoords, new Float32Array(uvs), 2);
    this.setIndices(new Uint16Array(indices));
  }
}
