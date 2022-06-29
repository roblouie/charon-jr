import { BufferGeometry } from './renderer/buffer-geometry';

export class CubeGeometry extends BufferGeometry {
  private cubeFaceIndices = [
    [3, 7, 5, 1],
    [6, 2, 0, 4],
    [6, 7, 3, 2],
    [0, 1, 5, 4],
    [7, 6, 4, 5],
    [2, 3, 1, 0],
  ];

  constructor(width = 1, height = 1, depth = 1, startX = 0, startY = 0, startZ = 0) {
    super();
    this.createCubeVertices(width, height, depth, startX, startY, startZ);
  }

  private createCubeVertices(width: number, height: number, depth: number, startX: number, startY: number, startZ: number) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;

    const cornerVertices = [
      [-halfWidth + startX, -halfHeight + startY, -halfDepth + startZ],
      [+halfWidth + startX, -halfHeight + startY, -halfDepth + startZ],
      [-halfWidth + startX, +halfHeight + startY, -halfDepth + startZ],
      [+halfWidth + startX, +halfHeight + startY, -halfDepth + startZ],
      [-halfWidth + startX, -halfHeight + startY, +halfDepth + startZ],
      [+halfWidth + startX, -halfHeight + startY, +halfDepth + startZ],
      [-halfWidth + startX, +halfHeight + startY, +halfDepth + startZ],
      [+halfWidth + startX, +halfHeight + startY, +halfDepth + startZ],
    ];

    const faceNormals = [
      [+1, +0, +0],
      [-1, +0, +0],
      [+0, +1, +0],
      [+0, -1, +0],
      [+0, +0, +1],
      [+0, +0, -1],
    ];

    const uvCoords = [
      [1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ];

    // const numVertices = 6 * 4;
    const positions = [];
    const normals   = [];
    const texcoords = [];
    const indices   = [];

    for (let f = 0; f < 6; ++f) {
      const faceIndices = this.cubeFaceIndices[f];
      for (let v = 0; v < 4; ++v) {
        const position = cornerVertices[faceIndices[v]];
        const normal = faceNormals[f];
        const uv = uvCoords[v];

        // Each face needs all four vertices because the normals and texture
        // coordinates are not all the same.
        positions.push(position);
        normals.push(normal);
        texcoords.push(uv);

      }
      // Two triangles make a square face.
      const offset = 4 * f;
      indices.push(offset, offset + 1, offset + 2);
      indices.push(offset, offset + 2, offset + 3);
    }

    this.setPositions(new Float32Array(positions.flat()), 3);
    this.setNormals(new Float32Array(normals.flat()), 3);
    this.setIndices(new Uint16Array(indices));
  }
}