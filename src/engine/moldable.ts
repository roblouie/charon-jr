import { EnhancedDOMPoint } from '@/core/enhanced-dom-point';
import { radsToDegrees } from '@/engine/math-helpers';
import { CubeGeometry } from '@/engine/cube-geometry';
import { AttributeLocation } from '@/engine/renderer/renderer';

type GConstructor<T = {}> = new (...args: any[]) => T;
type CanBeMoldable = GConstructor<CubeGeometry>;

export function MakeMoldable<TBase extends CanBeMoldable>(Base: TBase) {
  return class Moldable extends Base {
    verticesToActOn: EnhancedDOMPoint[] = [];

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
  }
}
