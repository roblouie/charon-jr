import { AttributeLocation } from '@/engine/renderer/renderer';
import { EnhancedDOMPoint, VectorLike } from '@/engine/enhanced-dom-point';
import { calculateVertexNormals, doTimes, radsToDegrees } from "@/engine/helpers";
import { Texture } from '@/engine/renderer/texture';
import { gl } from '@/engine/renderer/lil-gl';
import { randomNumber } from '@/engine/new-new-noise';

type BufferInfo = { data: Float32Array; size: number };

function getTextureForSide(uDivisions: number, vDivisions: number, texture: Texture) {
  // @ts-ignore
  return new Array((uDivisions + 1) * (vDivisions + 1)).fill().map(_ => texture.id);
}


export class MoldableCubeGeometry {
  vertices: EnhancedDOMPoint[] = [];
  verticesToActOn: EnhancedDOMPoint[] = [];

  buffers: Map<AttributeLocation, BufferInfo> = new Map<AttributeLocation, BufferInfo>();
  private indices: Uint16Array;
  vao: WebGLVertexArrayObject;

  static TexturePerSide(widthDivisions: number, heightDivisions: number, depthDivisions: number,
                        left: Texture, right: Texture, top: Texture, bottom: Texture, back: Texture, front: Texture) {
    const leftTexture = getTextureForSide(depthDivisions, heightDivisions, left);
    const rightTexture = getTextureForSide(depthDivisions, heightDivisions, right);
    const topTexture = getTextureForSide(widthDivisions, depthDivisions, top);
    const bottomTexture = getTextureForSide(widthDivisions, depthDivisions, bottom);
    const backTexture = getTextureForSide(widthDivisions, heightDivisions, back);
    const frontTexture = getTextureForSide(widthDivisions, heightDivisions, front);
    return [...topTexture, ...bottomTexture, ...leftTexture, ...rightTexture,  ...backTexture, ...frontTexture];
  }

  constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, sidesToDraw = 6) {
    this.vao = gl.createVertexArray()!;
    const indices: number[] = [];
    const uvs: number[] = [];

    let vertexCount = 0;

    const buildPlane = (
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
    ) => {
      const segmentWidth = width / gridX;
      const segmentHeight = height / gridY;

      const widthHalf = width / 2;
      const heightHalf = height / 2;
      const depthHalf = depth / 2;

      const gridX1 = gridX + 1;
      const gridY1 = gridY + 1;

      for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - heightHalf;

        for (let ix = 0; ix < gridX1; ix++) {
          const vector = new EnhancedDOMPoint();

          const x = ix * segmentWidth - widthHalf;

          // set values to correct vector component
          vector[u] = x * uDir;
          vector[v] = y * vDir;
          vector[w] = depthHalf;

          // now apply vector to vertex buffer
          this.vertices.push(vector);

          uvs.push(ix / gridX);
          uvs.push(1 - (iy / gridY));
        }
      }

      for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
          const a = vertexCount + ix + gridX1 * iy;
          const b = vertexCount + ix + gridX1 * (iy + 1);
          const c = vertexCount + (ix + 1) + gridX1 * (iy + 1);
          const d = vertexCount + (ix + 1) + gridX1 * iy;

          // Faces here, this could be updated to populate an array of faces rather than calculating them separately
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      vertexCount += (gridX1 * gridY1);
    }

    const sides = [
      ['x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments], // top
      ['x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments], // bottom
      ['z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments], // left
      ['z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments], // right
      ['x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments], // front
      ['x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments], // back
    ]

    // @ts-ignore
    doTimes(sidesToDraw, index => buildPlane(...sides[index]));

    this.setAttribute_(AttributeLocation.TextureCoords, new Float32Array(uvs), 2);
    this.indices = new Uint16Array(indices);
    this
      .computeNormals()
      .done_()
      .all_();
  }

  all_() {
    this.verticesToActOn = this.vertices;
    return this;
  }

  invertSelection() {
    this.verticesToActOn = this.vertices.filter(vertex => !this.verticesToActOn.includes(vertex));
    return this;
  }

  selectBy(callback: (vertex: EnhancedDOMPoint, index: number, array: EnhancedDOMPoint[]) => boolean) {
    this.verticesToActOn = this.vertices.filter(callback);
    return this;
  }

  translate_(x = 0, y = 0, z = 0) {
    this.verticesToActOn.forEach(vertex => vertex.add_({x, y, z}));
    return this;
  }

  scale_(x = 1, y = 1, z = 1) {
    const scaleMatrix = new DOMMatrix().scaleSelf(x, y, z);
    this.verticesToActOn.forEach(vertex => vertex.set(scaleMatrix.transformPoint(vertex)));
    return this;
  }

  rotate_(x = 0, y = 0, z = 0) {
    const rotationMatrix = new DOMMatrix().rotateSelf(radsToDegrees(x), radsToDegrees(y), radsToDegrees(z));
    this.verticesToActOn.forEach(vertex => vertex.set(rotationMatrix.transformPoint(vertex)));
    return this;
  }

  modifyEachVertex(callback: (vertex: EnhancedDOMPoint, index: number, array: EnhancedDOMPoint[]) => void) {
    this.verticesToActOn.forEach(callback);
    return this;
  }

  spherify(radius: number) {
    this.modifyEachVertex(vertex => {
      vertex.normalize_().scale_(radius);
    });
    return this;
  }

  merge(otherMoldable: MoldableCubeGeometry) {
    const updatedOtherIndices = otherMoldable.getIndices()!.map(index => index + this.vertices.length);
    this.indices = new Uint16Array([...this.indices, ...updatedOtherIndices]);

    this.vertices.push(...otherMoldable.vertices);

    const thisTextureCoords = this.getAttribute_(AttributeLocation.TextureCoords).data;
    const otherTextureCoords = otherMoldable.getAttribute_(AttributeLocation.TextureCoords).data;
    const combinedCoords = new Float32Array([...thisTextureCoords, ...otherTextureCoords]);
    this.setAttribute_(AttributeLocation.TextureCoords, combinedCoords, 2);

    const thisNormals = this.getAttribute_(AttributeLocation.Normals).data;
    const otherNormals = otherMoldable.getAttribute_(AttributeLocation.Normals).data;
    const combinedNormals = new Float32Array([...thisNormals, ...otherNormals]);
    this.setAttribute_(AttributeLocation.Normals, combinedNormals, 3);

    return this;
  }

  noisify(seed: number, scale: number) {
    this.getIndicesWithUniquePositions().forEach(index => {
      const allMatchingVertices = this.vertices.filter(vertex => vertex.isEqualTo(this.vertices[index]));
      allMatchingVertices.forEach(vertex => {
        const angle = new EnhancedDOMPoint(randomNumber(seed + vertex.x), randomNumber(seed + vertex.y), randomNumber(seed + vertex.z));
        vertex.z += angle.z * scale;
        vertex.y += angle.y * scale;
        vertex.x += angle.x * scale;
      })
    })

    return this;
  }

  cylindrify(radius: number, aroundAxis: 'x' | 'y' | 'z' = 'y', circleCenter: VectorLike = {x: 0, y: 0, z: 0}) {
    this.modifyEachVertex(vertex => {
      const originalAxis = vertex[aroundAxis];
      vertex[aroundAxis] = 0;
      vertex.subtract(circleCenter).normalize_().scale_(radius);
      vertex[aroundAxis] = originalAxis;
    });
    return this;
  }

  /**
   * Computes normals. By default it uses faces on a single plane. Use this on moldable planes or for moldable cube
   * shapes where each side should have it's own normals, like a cube, ramp, pyramid, etc.
   *
   * You can optionally pass the shouldCrossPlanes boolean to tell it to use faces from other sides of the cube to
   * compute the normals. Use this for shapes that should appear continuous, like spheres.
   */
  computeNormals(shouldCrossPlanes = false) {
    const updatedNormals = calculateVertexNormals(this.vertices, shouldCrossPlanes ? this.getIndicesWithUniquePositions() : this.indices);
    this.setAttribute_(AttributeLocation.Normals, new Float32Array(updatedNormals.flatMap(point => point.toArray())), 3);
    return this;
  }

  getIndicesWithUniquePositions() {
    const checkedPositions: EnhancedDOMPoint[] = [];
    const indexCopy = this.indices.slice();

    this.verticesToActOn.forEach(selectedVertex => {
      if (checkedPositions.find(compareVertex => selectedVertex.isEqualTo(compareVertex))) {
        return;
      }

      checkedPositions.push(selectedVertex);

      const originalIndex = this.vertices.findIndex(compareVertex => selectedVertex.isEqualTo(compareVertex));

      this.vertices.forEach((compareVertex, vertexIndex) => {
        if (selectedVertex.isEqualTo(compareVertex)) {
          const indicesIndex = indexCopy.indexOf(vertexIndex);
          indexCopy[indicesIndex] = originalIndex;
        }
      })
    });

    return indexCopy;
  }

  done_() {
    this.setAttribute_(AttributeLocation.Positions, new Float32Array(this.vertices.flatMap(point => point.toArray())), 3);
    return this;
  }

  getAttribute_(attributeLocation: AttributeLocation) {
    return this.buffers.get(attributeLocation)!;
  }

  setAttribute_(attributeLocation: AttributeLocation, data: Float32Array, size: number) {
    this.buffers.set(attributeLocation, { data, size });
  }

  getIndices(): Uint16Array {
    return this.indices;
  }

  bindGeometry() {
    const fullSize = [...this.buffers.values()].reduce((total, current) => total += current.data.length , 0);
    const fullBuffer = new Float32Array(fullSize);

    let lengthOffset = 0;
    this.buffers.forEach(buffer => {
      fullBuffer.set(buffer.data, lengthOffset);
      lengthOffset+= buffer.data.length;
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer()!);
    gl.bufferData(gl.ARRAY_BUFFER, fullBuffer, gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    let byteOffset = 0;
    this.buffers.forEach((buffer, position) => {
      gl.vertexAttribPointer(position, buffer.size, gl.FLOAT, false, 0, byteOffset);
      gl.enableVertexAttribArray(position);
      byteOffset += buffer.data.length * buffer.data.BYTES_PER_ELEMENT;
    });

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer()!);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
  }
}
