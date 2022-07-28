import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { calculateVertexNormals, radsToDegrees } from '@/engine/math-helpers';
import { CubeGeometry } from '@/engine/cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { PlaneGeometry } from '@/engine/plane-geometry';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';

type GConstructor<T = {}> = new (...args: any[]) => T;
type CanBeMoldable = GConstructor<CubeGeometry & PlaneGeometry>;

export function MakeMoldable<TBase extends CanBeMoldable>(Base: TBase) {
  return class Moldable extends Base {
    verticesToActOn: EnhancedDOMPoint[] = [];

    constructor(...args: any[]) {
      super(...args);
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

    spherify(radius: number) {
      this.verticesToActOn.forEach(vertex => {
        vertex.normalize().scale(radius);
      });
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

    cylindrify(radius: number) {
      this.verticesToActOn.forEach(vertex => {
        const originalY = vertex.y;
        vertex.y = 0;
        vertex.normalize().scale(radius);
        vertex.y = originalY;
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

      // One cube is made up of six planes. Each plane has it's own vertices, uvs, and normals. This is fine until
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
      // position into all of it's copies.
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
}
