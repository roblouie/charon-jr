import { BufferGeometry } from './renderer/buffer-geometry';
import { calculateVertexNormals } from '@/math-helpers';
import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";
import { drawLandscape } from '@/textures/texture-maker';

// const sampleHeightMap = [
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
//   10, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 3.9,
// ];


export  class PlaneGeometry extends BufferGeometry {
  constructor(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1) {
    super();
    this.createPlaneVertices(width, depth, subdivisionsWidth, subdivisionsDepth);
  }

  createPlaneVertices(width = 1, depth = 1, subdivisionsWidth = 1, subdivisionsDepth = 1) {
    const sampleHeightMap = [];
    const imageData = drawLandscape().data;
    for (let i = 0; i < imageData.length; i+= 4) {
      sampleHeightMap.push(imageData[i] / 10 - 10);
    }


    const positions = [];
    const texcoords = [];
    let i = 0;
    for (let z = 0; z <= subdivisionsDepth; z++) {
      for (let x = 0; x <= subdivisionsWidth; x++) {
        const texCoord = new EnhancedDOMPoint(x / 10, z / 10);
        positions.push(new EnhancedDOMPoint(
          width * (x / subdivisionsWidth) - width * 0.5,
          sampleHeightMap[i],
          depth * (z / subdivisionsDepth) - depth * 0.5
        ));
        texcoords.push(texCoord);
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
    this.setTextureCoords(new Float32Array(texcoords.flatMap(coord => [coord.u, coord.v])), 2);
    this.setIndices(new Uint16Array(indices));
  }
}
