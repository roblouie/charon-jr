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
  private indices?: Uint16Array;
  fullBuffer: Float32Array;
  buffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
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
    this.buffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    this.vao = gl.createVertexArray()!;
    this.fullBuffer = new Float32Array();
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

    doTimes(sidesToDraw, index => {
      // @ts-ignore
      buildPlane(...sides[index]);
    });

    this.setAttribute_(AttributeLocation.TextureCoords, new Float32Array(uvs), 2);
    this.setIndices(new Uint16Array(indices));
    this
      .computeNormalsPerPlane()
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
    this.setIndices(new Uint16Array([...this.getIndices()!, ...updatedOtherIndices]));

    this.vertices.push(...otherMoldable.vertices);

    // const thisTextureCoords = this.getAttribute_(AttributeLocation.TextureCoords).data;
    // const otherTextureCoords = otherMoldable.getAttribute_(AttributeLocation.TextureCoords).data;
    // const combinedCoords = new Float32Array([...thisTextureCoords, ...otherTextureCoords]);
    // this.setAttribute_(AttributeLocation.TextureCoords, combinedCoords, 2);
    //
    // const thisNormals = this.getAttribute_(AttributeLocation.Normals).data;
    // const otherNormals = otherMoldable.getAttribute_(AttributeLocation.Normals).data;
    // const combinedNormals = new Float32Array([...thisNormals, ...otherNormals]);
    // this.setAttribute_(AttributeLocation.Normals, combinedNormals, 3);
    // Semi-code-golfed code of the easier to read code above
    [AttributeLocation.TextureCoords, AttributeLocation.Normals].forEach((location, index) => {
      const thisData = this.getAttribute_(location).data;
      const otherData = otherMoldable.getAttribute_(location).data;
      const combined = new Float32Array([...thisData, ...otherData]);
      this.setAttribute_(location, combined, index + 2);
    })

    return this;
  }


  noisify(seed: number, scale: number) {
    const {indexReplacers, indicesToUniqueVertices} = this.getUniqueIndices();

    indicesToUniqueVertices.forEach(vertexIndex => {
      const vertex = this.verticesToActOn[vertexIndex];
      const angle = new EnhancedDOMPoint(randomNumber(vertexIndex), randomNumber(vertexIndex * 10), randomNumber(vertexIndex * 20));
      vertex.x += angle.x * scale;
      vertex.y += angle.y * scale;
      vertex.z += angle.z * scale;
    });
    indexReplacers.forEach(replacer => {
      this.verticesToActOn[replacer.index].set(this.verticesToActOn[replacer.firstIndex]);
    });
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
   * Computes normals using faces on a single plane. Use this on moldable planes or for moldable cube shapes where
   * each side should have it's own normals, like a cube, ramp, pyramid, etc.
   */
  computeNormalsPerPlane() {
    const updatedNormals = calculateVertexNormals(this.vertices, this.getIndices()!);
    this.setAttribute_(AttributeLocation.Normals, new Float32Array(updatedNormals.flatMap(point => point.toArray())), 3);
    return this;
  }

  /**
   * Computes normals using all faces for the entire shape. Use this on moldable cube shapes that should appear to
   * have a more continuous surface across multiple sides, like a sphere.
   */
  computeNormalsCrossPlane() {
    const {indexReplacers, indicesToUniqueVertices} = this.getUniqueIndices();


    // Use our new indices to calculate normals
    const updatedNormals = calculateVertexNormals(this.verticesToActOn, indicesToUniqueVertices);

    // We only calculated normals for unique indices, meaning we don't have any for any additional occurrences of a
    // vertex position. These additional occurrences are still used to draw our shape, so we need to populate their
    // normals. We already have a map of first indices to all other indices, and each normal position is the same
    // as it's vertex position, so we can use our map to populate the duplicates.
    indexReplacers.forEach(replacer => {
      updatedNormals[replacer.index] = updatedNormals[replacer.firstIndex];
    });

    const originalNormals = this.getAttribute_(AttributeLocation.Normals).data;
    this.verticesToActOn.forEach(vertex => {
      const originalVertexIndex = this.vertices.indexOf(vertex);
      const newNormalIndex = this.verticesToActOn.indexOf(vertex);
      const newNormal = updatedNormals[newNormalIndex];
      const normalIndex = originalVertexIndex * 3;
      originalNormals[normalIndex] = newNormal.x;
      originalNormals[normalIndex + 1] = newNormal.y;
      originalNormals[normalIndex + 2] = newNormal.z;
    });

    // Now just set our new normals and we're done.
    this.setAttribute_(AttributeLocation.Normals, originalNormals, 3);

    return this;
  }

  // TODO: Should this just combine the indices instead? Like permanently change them.
  private getUniqueIndices() {
    const checkedVertices: EnhancedDOMPoint[] = [];

    // One cube is made up of six planes. Each plane has its own vertices, uvs, and normals. This is fine until
    // we mold our cube to a shape that should appear to have a more continuous surface across multiple sides, like
    // a sphere. Then when normals are computed vertices on the edges of a plane aren't able to access surfaces
    // on a different side. For instance, when computing the normal for the upper left corner vertex of the front
    // of a cube, it should take into account surfaces connected to the front left corner of the top of the cube and
    // the top front corner vertex of the left of the cube.
    // By default this can't happen because each side is totally separate. So here when computing normals we need
    // to treat vertices with the same position as the same vertex. For example, with a simple cube each side has
    // four vertices, one for each corner. This means a cube has 24 vertices (6 sides times 4 vertices). Instead
    // we need to treat it as having only eight vertices: front-top-left, front-top-right, front-bottom-left,
    // front-bottom-right, back-top-left, back-top-right, back-bottom-left, and back-bottom-right. Now the vertices
    // share surfaces and we can compute the normals.
    // To do this we follow this algorithm:
    // Loop through the vertices
    //   If we haven't checked that vertex position yet
    //     Find the first index of that position
    //     Find all indices of that position and store a map of each occurrence back to the first
    //
    // Now we can map all repeated position indices back to the first occurrence. So now do this to a copy of the
    // indices. This gives us indices to unique vertex positions. Use this to compute normals and now we have
    // proper normal values that account for all sides of the shape. The only problem now is we ONLY have normals
    // for these positions, we don't have normals for the copies. So we need to populate the normals for the duplicate
    // vertices we ignored. Luckily we have a map of duplicates to the first value, and since there's a normal for
    // every vertex, their indices are the same. So we just use our same replacer map to copy the normal of the unique
    // position into all of its copies.
    const indexReplacers = this.verticesToActOn.flatMap((vertex: EnhancedDOMPoint, firstIndex: number): { index: number, firstIndex: number }[] => {
      // If we've already found this vertex once, stop
      if (checkedVertices.find(compareVertex => vertex.isEqualTo(compareVertex))) {
        return [];
      }
      // Add the current vertex to the list of checked vertices so it's never checked again
      checkedVertices.push(vertex);

      // If we've gotten this far, this vertex hasn't been checked yet. So now find the first index of this vertex position,
      // then find all indices of this vertex position, and create a map from first index to each other occurrence.
      return this.verticesToActOn.reduce((indices, compareVertex, currentIndex) => {
        if (vertex.isEqualTo(compareVertex)) {
          indices.push({index: currentIndex, firstIndex: firstIndex});
        }
        return indices;
      }, [] as { index: number, firstIndex: number }[]);
    });

    // We now have our index replacers. The problem is we don't know the original index the vertex in question.
    // So here we
    const allIndices = this.getIndices()!;
    const indicesInSelection: number[] = [];
    for (let i = 0; i < allIndices.length; i += 3) {
      const point1 = this.vertices[allIndices[i]];
      const point2 = this.vertices[allIndices[i + 1]];
      const point3 = this.vertices[allIndices[i + 2]];

      const point1Index = this.verticesToActOn.indexOf(point1);
      const point2Index = this.verticesToActOn.indexOf(point2);
      const point3Index = this.verticesToActOn.indexOf(point3);

      if (point1Index !== -1 && point2Index !== -1 && point3Index !== -1) {
        indicesInSelection.push(point1Index, point2Index, point3Index)
      }
    }

    // Use our map to update our indices to only point to the first occurrence of a given vertex position.
    const indicesToUniqueVertices = indicesInSelection.map(index => {
      const matchingReplacer = indexReplacers.find(replacer => replacer.index === index);
      return matchingReplacer ? matchingReplacer.firstIndex : index;
    });
    return {indexReplacers, indicesToUniqueVertices};
  }

  done_() {
    this.setAttribute_(AttributeLocation.Positions, new Float32Array(this.vertices.flatMap(point => point.toArray())), 3);
    return this;
  }

  populateFullBuffer() {
    const fullSize = [...this.buffers.values()].reduce((total, current) => total += current.data.length , 0);
    this.fullBuffer = new Float32Array(fullSize);
    let runningOffset = 0;
    this.buffers.forEach(buffer => {
      this.fullBuffer.set(buffer.data, runningOffset);
      runningOffset+= buffer.data.length;
    });
  }

  getAttribute_(attributeLocation: AttributeLocation) {
    return this.buffers.get(attributeLocation)!;
  }

  setAttribute_(attributeLocation: AttributeLocation, data: Float32Array, size: number) {
    this.buffers.set(attributeLocation, { data, size });
  }

  setIndices(indices: Uint16Array) {
    this.indices = indices;
  }

  getIndices(): Uint16Array | undefined {
    return this.indices;
  }

  bindGeometry() {
    this.buffer = gl.createBuffer()!;
    this.populateFullBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.fullBuffer, gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    let runningOffset = 0;
    this.buffers.forEach((buffer, position) => {
      gl.vertexAttribPointer(position, buffer.size, gl.FLOAT, false, 0, runningOffset);
      gl.enableVertexAttribArray(position);
      runningOffset += buffer.data.length * buffer.data.BYTES_PER_ELEMENT;
    });

    if (this.indices?.length) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }
  }
}
