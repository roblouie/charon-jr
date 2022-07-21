import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { calculateVertexNormals, radsToDegrees } from '@/engine/math-helpers';
import { CubeGeometry } from '@/engine/cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';

type GConstructor<T = {}> = new (...args: any[]) => T;
type CanBeMoldable = GConstructor<CubeGeometry>;

export function MakeMoldable<TBase extends CanBeMoldable>(Base: TBase) {
  return class Moldable extends Base {
    verticesToActOn: EnhancedDOMPoint[] = [];
    normalReplacers: { index: number, newValue: number }[] = [];

    constructor(...args: any[]) {
      super(...args);
      const checkedVertices: EnhancedDOMPoint[] = [];

      this.normalReplacers = this.vertices.flatMap((vertex: EnhancedDOMPoint): { index: number, newValue: number }[] => {
        // If we've already found this vertex once, stop
        if (checkedVertices.find(compareVertex => vertex.isEqualTo(compareVertex))) {
          return [];
        }
        // Add the current vertex to the list of checked vertices
        checkedVertices.push(vertex);

        // If we've gotten this far, this vertex hasn't been checked yet. So now we find every occurrence
        // of this vertex
        const vertexIndex = this.vertices.indexOf(vertex);
        return this.vertices.reduce((indices, compareVertex, currentIndex) => {
          if (vertex.isEqualTo(compareVertex)) {
            indices.push({ index: currentIndex, newValue: vertexIndex });
          }
          return indices;
        }, [] as { index: number, newValue: number }[]);
      });
    }

    all() {
      this.verticesToActOn = this.vertices;
      return this;
    }

    spherify(radius: number) {
      this.verticesToActOn.forEach(vertex => {
        vertex.normalize().scale(radius);
      });
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

    computeNormalsCrossPlane() {
      const localIndicesCopy = this.getIndices()!.map(index => {
        const matchingReplacer = this.normalReplacers.find(replacer => replacer.index === index);
        return matchingReplacer ? matchingReplacer.newValue : index;
      });
      const updatedNormals = calculateVertexNormals(this.vertices, localIndicesCopy);
      this.normalReplacers.forEach(replacer => {
        updatedNormals[replacer.index] = updatedNormals[replacer.newValue];
      });
      this.setAttribute(AttributeLocation.Normals, new Float32Array(updatedNormals.flatMap(point => point.toArray())), 3);
    }
  }
}
