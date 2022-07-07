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

  private _plus(otherVector: EnhancedDOMPoint, target: EnhancedDOMPoint) {
    target.x += otherVector.x;
    target.y += otherVector.y;
    target.z += otherVector.z;
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
}
