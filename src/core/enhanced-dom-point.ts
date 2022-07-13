import { clamp } from '@/helpers';

export class EnhancedDOMPoint extends DOMPoint {
  get u() {
    return this.x;
  }

  set u(u: number) {
    this.x = u;
  }

  get v() {
    return this.y;
  }

  set v(v: number) {
    this.y = v;
  }

  plusSelf(otherVector: EnhancedDOMPoint) {
    return this._plus(otherVector, this);
  }

  plus(otherVector: EnhancedDOMPoint) {
    return this._plus(otherVector, new EnhancedDOMPoint());
  }

  scale(scaleBy: number) {
    return new EnhancedDOMPoint(this.x * scaleBy, this.y * scaleBy, this.z * scaleBy);
  }

  private _plus(otherVector: EnhancedDOMPoint, target: EnhancedDOMPoint) {
    target.x = this.x + otherVector.x;
    target.y = this.y + otherVector.y;
    target.z = this.z + otherVector.z;
    return target;
  }

  minus(otherVector: EnhancedDOMPoint) {
    return new EnhancedDOMPoint(
      this.x - otherVector.x,
      this.y - otherVector.y,
      this.z - otherVector.z
    );
  }

  cross(otherVector: EnhancedDOMPoint) {
    return new EnhancedDOMPoint(
    this.y * otherVector.z - this.z * otherVector.y,
    this.z * otherVector.x - this.x * otherVector.z,
    this.x * otherVector.y - this.y * otherVector.x,
    );
  }

  dot(otherVector: EnhancedDOMPoint): number {
    return this.x * otherVector.x + this.y * otherVector.y + this.z * otherVector.z;
  }

  toArray() {
    return [this.x, this.y, this.z];
  }

  get magnitude() {
    return Math.hypot(...this.toArray());
  }

  normalize() {
    const magnitude = this.magnitude;
    if (magnitude === 0) {
      return new EnhancedDOMPoint();
    }
    return new EnhancedDOMPoint(this.x / magnitude, this.y / magnitude, this.z / magnitude);
  }

  setFromRotationMatrix(matrix: DOMMatrix) {
    this.y = Math.asin(clamp(matrix.m13, -1, 1));
    if (Math.abs(matrix.m13) < 0.9999999) {
      this.x = Math.atan2(-matrix.m23, matrix.m33);
      this.z = Math.atan2(-matrix.m12, matrix.m11);
    } else {
      this.x = Math.atan2(matrix.m32, matrix.m22);
      this.z = 0;
    }
    return this;
  }

  lerp(otherVector: EnhancedDOMPoint, alpha: number) {
    this.x += ( otherVector.x - this.x ) * alpha;
    this.y += ( otherVector.y - this.y ) * alpha;
    this.z += ( otherVector.z - this.z ) * alpha;
    return this;
  }
}
