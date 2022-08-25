import { BufferGeometry } from './renderer/buffer-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { EnhancedDOMPoint, VectorLike } from '@/engine/enhanced-dom-point';
import { doTimes } from "@/engine/helpers";
import { calculateVertexNormals, radsToDegrees } from "@/engine/math-helpers";
import { noiseMaker } from "@/engine/texture-creation/noise-maker";

export class MoldableCubeGeometry extends BufferGeometry {
  vertices: EnhancedDOMPoint[] = [];
  verticesToActOn: EnhancedDOMPoint[] = [];

  constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1, sidesToDraw = 6) {
    super();
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


          uvs.push(ix);
          uvs.push(1 - (iy));
          // To make the texture spread across the whole plane regardless of subdivisions we can do this instead:
          // uvs.push(ix / gridX);
          // uvs.push(1 - (iy / gridY));
          // Currently I don't want this behavior but might in the future. Might be better to have it spread across
          // the whole mesh and handle texture repeat via the material repeat property.
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

    this.setAttribute(AttributeLocation.TextureCoords, new Float32Array(uvs), 2);
    this.setIndices(new Uint16Array(indices));
    this
      .computeNormalsPerPlane()
      .done()
      .all();
  }

  all() {
    this.verticesToActOn = this.vertices;
    return this;
  }

  deselectVertices(...vertices: number[]) {
    const verticesToRemove = vertices.map(vertexNumber => this.vertices[vertexNumber]);
    this.verticesToActOn = this.verticesToActOn.filter(vertex => !verticesToRemove.includes(vertex));
    return this;
  }

  selectVertices(...vertices: number[]) {
    this.verticesToActOn = vertices.map(vertexNumber => this.vertices[vertexNumber]);
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

  translate(x = 0, y = 0, z = 0) {
    this.verticesToActOn.forEach(vertex => vertex.add({x, y, z}));
    return this;
  }

  scale(x = 1, y = 1, z = 1) {
    const scaleMatrix = new DOMMatrix().scaleSelf(x, y, z);
    this.verticesToActOn.forEach(vertex => vertex.set(scaleMatrix.transformPoint(vertex)));
    return this;
  }

  rotate(x = 0, y = 0, z = 0) {
    const rotationMatrix = new DOMMatrix().rotateSelf(radsToDegrees(x), radsToDegrees(y), radsToDegrees(z));
    this.verticesToActOn.forEach(vertex => vertex.set(rotationMatrix.transformPoint(vertex)));
    return this;
  }

  modifyEachVertex(callback: (vertex: EnhancedDOMPoint, index: number, array: EnhancedDOMPoint[]) => void) {
    this.verticesToActOn.forEach(callback);
    return this;
  }

  spherify(radius: number) {
    this.verticesToActOn.forEach(vertex => {
      vertex.normalize().scale(radius);
    });
    return this;
  }

  merge(otherMoldable: MoldableCubeGeometry) {
    const updatedOtherIndices = otherMoldable.getIndices()!.map(index => index + this.vertices.length);
    this.setIndices(new Uint16Array([...this.getIndices()!, ...updatedOtherIndices]));

    this.vertices.push(...otherMoldable.vertices);

    const thisTextureCoords = this.getAttribute(AttributeLocation.TextureCoords).data;
    const otherTextureCoords = otherMoldable.getAttribute(AttributeLocation.TextureCoords).data;
    const combinedCoords = new Float32Array([...thisTextureCoords, ...otherTextureCoords]);
    this.setAttribute(AttributeLocation.TextureCoords, combinedCoords, 2);

    const thisNormals = this.getAttribute(AttributeLocation.Normals).data;
    const otherNormals = otherMoldable.getAttribute(AttributeLocation.Normals).data;
    const combinedNormals = new Float32Array([...thisNormals, ...otherNormals]);
    this.setAttribute(AttributeLocation.Normals, combinedNormals, 3);

    return this;
  }


  noisify(seed: number, scale: number) {
    const {indexReplacers, indicesToUniqueVertices} = this.getUniqueIndices();

    noiseMaker.seed(seed);
    indicesToUniqueVertices.forEach(vertexIndex => {
      const vertex = this.verticesToActOn[vertexIndex];
      const angle = noiseMaker.getDirection(vertexIndex);
      vertex.x += angle.x * scale;
      vertex.y += angle.y * scale;
      vertex.z += angle.z * scale;
    });
    indexReplacers.forEach(replacer => {
      this.verticesToActOn[replacer.index].set(this.verticesToActOn[replacer.firstIndex]);
    });
    return this;
  }

  invert() {
    this.getIndices()!.reverse();
    return this;
  }

  cylindrify(radius: number, aroundAxis: 'x' | 'y' | 'z' = 'y', circleCenter: VectorLike = {x: 0, y: 0, z: 0}) {
    this.verticesToActOn.forEach(vertex => {
      const originalAxis = vertex[aroundAxis];
      vertex[aroundAxis] = 0;
      vertex.subtract(circleCenter).normalize().scale(radius);
      // vertex.normalize().scale(radius);
      vertex[aroundAxis] = originalAxis;
    });
    return this;
  }

  delete() {
    this.verticesToActOn.forEach(vertex => {
      const vertexIndex = this.vertices.indexOf(vertex);
      const indices = [...this.getIndices()!];
      const normals = [...this.getAttribute(AttributeLocation.Normals).data];
      normals.splice(vertexIndex, 1);
      this.vertices.splice(vertexIndex, 1);

      for (let i = 0; i < indices.length; i += 3) {
        if ([indices[i], indices[i + 1], indices[i + 2]].includes(vertexIndex)) {
          indices.splice(i, 3);
        }
      }

      const renumberedIndices = indices.map(index => index > vertexIndex ? index - 1 : index);

      this.setIndices(new Uint16Array(renumberedIndices));
    });
    this.verticesToActOn = [];
    return this;
  }

  /**
   * Computes normals using faces on a single plane. Use this on moldable planes or for moldable cube shapes where
   * each side should have it's own normals, like a cube, ramp, pyramid, etc.
   */
  computeNormalsPerPlane() {
    const updatedNormals = calculateVertexNormals(this.vertices, this.getIndices()!);
    this.setAttribute(AttributeLocation.Normals, new Float32Array(updatedNormals.flatMap(point => point.toArray())), 3);
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

    const originalNormals = this.getAttribute(AttributeLocation.Normals).data;
    this.verticesToActOn.forEach(vertex => {
      const originalVertexIndex = this.vertices.indexOf(vertex);
      const newNormalIndex = this.verticesToActOn.indexOf(vertex);
      const newNormal = updatedNormals[newNormalIndex];
      const normalIndex = originalVertexIndex * 3;
      originalNormals[normalIndex] = newNormal.x;
      originalNormals[normalIndex + 1] = newNormal.y;
      originalNormals[normalIndex + 2] = newNormal.z;
    });

    // // Now just set our new normals and we're done.
    this.setAttribute(AttributeLocation.Normals, originalNormals, 3);

    return this;
  }

  private getUniqueIndices() {
    const checkedVertices: EnhancedDOMPoint[] = [];

    // One cube is made up of six planes. Each plane has its own vertices, uvs, and normals. This is fine until
    // we mold our cube a shape that should appear to have a more continuous surface across multiple sides, like
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
    const indexReplacers = this.verticesToActOn.flatMap((vertex: EnhancedDOMPoint): { index: number, firstIndex: number }[] => {
      // If we've already found this vertex once, stop
      if (checkedVertices.find(compareVertex => vertex.isEqualTo(compareVertex))) {
        return [];
      }
      // Add the current vertex to the list of checked vertices so it's never checked again
      checkedVertices.push(vertex);

      // If we've gotten this far, this vertex hasn't been checked yet. So now find the first index of this vertex position,
      // then find all indices of this vertex position, and create a map from first index to each other occurrence.
      const firstOccurrence = this.verticesToActOn.indexOf(vertex);
      return this.verticesToActOn.reduce((indices, compareVertex, currentIndex) => {
        if (vertex.isEqualTo(compareVertex)) {
          indices.push({index: currentIndex, firstIndex: firstOccurrence});
        }
        return indices;
      }, [] as { index: number, firstIndex: number }[]);
    });

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

  done() {
    this.setAttribute(AttributeLocation.Positions, new Float32Array(this.vertices.flatMap(point => point.toArray())), 3);
    return this;
  }
}
