import { BufferGeometry } from '@/renderer/buffer-geometry';
import { Face } from './face';

export function getGroupedFaces(geometries: BufferGeometry[]) {
  const faces = geometries.flatMap(geometry => {
    const indices = geometry.getIndices()!; // assuming always having indices

    const positions = geometry.getPositions();

    const triangleIndicesChunks = chunkArrayInGroups(indices, 3);
    const triangles = triangleIndicesChunks.map(triangleIndices => {
      const firstIndex = triangleIndices[0] * 3;
      const secondIndex = triangleIndices[1] * 3;
      const thirdIndex = triangleIndices[2] * 3;

      const x0 = positions.data[firstIndex];
      const y0 = positions.data[firstIndex + 1];
      const z0 = positions.data[firstIndex + 2];

      const x1 = positions.data[secondIndex];
      const y1 = positions.data[secondIndex + 1];
      const z1 = positions.data[secondIndex + 2];

      const x2 = positions.data[thirdIndex];
      const y2 = positions.data[thirdIndex + 1];
      const z2 = positions.data[thirdIndex + 2];

      return [
        new DOMPoint(x0, y0, z0),
        new DOMPoint(x1, y1, z1),
        new DOMPoint(x2, y2, z2),
      ];
    });

    return triangles.map(triangle => new Face(triangle));
  });

  const floorFaces: Face[] = [];
  const wallFaces: Face[] = [];
  const ceilingFaces: Face[] = [];

  faces.forEach(face => {
    if (face.normal.y > 0.5) {
      floorFaces.push(face);
    } else if (face.normal.y < -0.5) {
      ceilingFaces.push(face);
    } else {
      wallFaces.push(face);
    }
  });

  return {
    floorFaces,
    wallFaces,
    ceilingFaces,
  };
}

function chunkArrayInGroups(array: Uint16Array, chunkSize: number): Uint16Array[] {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunkedArray.push(array.slice(i, i + chunkSize));
  }
  return chunkedArray;
}
