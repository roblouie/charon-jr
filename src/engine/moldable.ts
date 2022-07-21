import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { calculateVertexNormals, radsToDegrees } from '@/engine/math-helpers';
import { CubeGeometry } from '@/engine/cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';

type GConstructor<T = {}> = new (...args: any[]) => T;
type CanBeMoldable = GConstructor<CubeGeometry>;

export function MakeMoldable<TBase extends CanBeMoldable>(Base: TBase) {
  return class Moldable extends Base {
    verticesToActOn: EnhancedDOMPoint[] = [];
    localIndicesCopy: number[] = [];

    test() {
      const vertexMatch = (vertexA: EnhancedDOMPoint, vertexB: EnhancedDOMPoint) => {
        return vertexA.x === vertexB.x && vertexA.y === vertexB.y && vertexA.z === vertexB.z;
      }

      const uniqueVertices: EnhancedDOMPoint[] = [];

      this.vertices.forEach(vertex => {
        // If we haven't already found this vertex, put it in the array
        if (!uniqueVertices.find(uniqueVertex => vertexMatch(vertex, uniqueVertex))) {
          uniqueVertices.push(vertex);
        }
      })
    }

    constructor(...args: any[]) {
      super(...args);
      const vertexMatch = (vertexA: EnhancedDOMPoint, vertexB: EnhancedDOMPoint) => {
        return vertexA.x === vertexB.x && vertexA.y === vertexB.y && vertexA.z === vertexB.z;
      }
      this.localIndicesCopy = [...this.getIndices()!];
      const checkedVertices: EnhancedDOMPoint[] = [];

      // Each element in the array is an array of indices where this vertex appears
      // This will be a unique list, so within the array of arrays each vertex position
      // should appear only once
      const matchingIndices = this.vertices.map(vertex => {
        // If we've already found this vertex once, stop
        if (checkedVertices.find(compareVertex => vertexMatch(vertex, compareVertex))) {
          return;
        }
        checkedVertices.push(vertex);

        return this.vertices.reduce((indices, compareVertex, currentIndex) => {
          if (vertexMatch(vertex, compareVertex)) {
            indices.push(currentIndex);
          }
          return indices;
        }, [] as number[]);
      })
        .filter(item => item && item.length > 0);

      // Now we have an array where each entry matches a unique vertex, but for each
      // vertex it contains all indices where this vertex appears. So this is an array
      // of arrays. For each array, the first element is the one we want to use everywhere
      // so get that first. Then find all instances of the other indices in the index array
      // and replace them with this index
      debugger;
      matchingIndices.forEach(matches => {
        const trueIndex = matches!.shift();
        this.localIndicesCopy = this.localIndicesCopy.map(index => matches!.includes(index) ? trueIndex! : index);
      });
    }

    all() {
      this.verticesToActOn = this.vertices;
      return this;
    }

    spherify(radius: number) {
      // const normals: EnhancedDOMPoint[] = [];
      this.verticesToActOn.forEach(vertex => {
        // normals.push(vertex.clone().normalize());
        vertex.normalize().scale(radius);
      });
      // this.setAttribute(AttributeLocation.Normals, new Float32Array(normals.flatMap(point => point.toArray())), 3);
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

    magicNormalCalc() {
      const updatedNormals = calculateVertexNormals(this.vertices, this.localIndicesCopy);
      this.setAttribute(AttributeLocation.Normals, new Float32Array(updatedNormals.flatMap(point => point.toArray())), 3);
    }
  }
}
