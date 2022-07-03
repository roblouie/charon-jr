import { BufferGeometry } from './renderer/buffer-geometry';
import { calculateVertexNormals } from '@/math-helpers';
import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";

const sampleHeightMap = [
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
  10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
];

export  class PlaneGeometry extends BufferGeometry {
  constructor(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1) {
    super();
    this.createPlaneVertices(width, depth, subdivisionsWidth, subdivisionsDepth);
  }

  createPlaneVertices(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1) {
    const positions = [];
    const texcoords = [];
    let i = 0;
    for (let z = 0; z <= subdivisionsDepth; z++) {
      for (let x = 0; x <= subdivisionsWidth; x++) {
        const u = x / subdivisionsWidth;
        const v = z / subdivisionsDepth;
        positions.push(new EnhancedDOMPoint(
          width * u - width * 0.5,
          sampleHeightMap[i],
          depth * v - depth * 0.5
        ));
        texcoords.push(u, v);
        console.log(i);
        i++;
      }
    }


    const numVertsAcross = subdivisionsWidth + 1;
    const indices = [];

    for (let z = 0; z < subdivisionsDepth; z++) {
      for (let x = 0; x < subdivisionsWidth; x++) {
        // Make triangle 1 of quad.
        indices.push(
          (z + 0) * numVertsAcross + x,
          (z + 1) * numVertsAcross + x,
          (z + 0) * numVertsAcross + x + 1);

        // Make triangle 2 of quad.
        indices.push(
          (z + 1) * numVertsAcross + x,
          (z + 1) * numVertsAcross + x + 1,
          (z + 0) * numVertsAcross + x + 1);
      }
    }

    const normals = calculateVertexNormals(positions, indices);

    const positionFlatArray = positions.flatMap(position => [position.x, position.y, position.z]);
    const normalsFlatArray = normals.flatMap(normal => [normal.x, normal.y, normal.z]);

    this.setPositions(new Float32Array(positionFlatArray), 3);
    this.setNormals(new Float32Array(normalsFlatArray), 3);
    this.setIndices(new Uint16Array(indices));
  }
}