import { dotProductVectors } from '@/dom-matrix-helpers';
import { calculateFaceNormal } from '@/math-helpers';

export class Face {
  points: DOMPoint[];
  normal: DOMPoint;
  upperY: number;
  lowerY: number;
  originOffset: number;

  constructor(points: DOMPoint[], normal?: DOMPoint) {
    this.points = points;
    this.normal = normal ?? calculateFaceNormal(points);
    this.originOffset = -dotProductVectors(this.normal, points[0]);
    this.upperY = points[0].y;
    this.lowerY = points[0].y;
    points.forEach(point => {
      if (point.y > this.upperY) {
        this.upperY = point.y;
      }

      if (point.y < this.lowerY) {
        this.lowerY = point.y;
      }
    })
  }
}
