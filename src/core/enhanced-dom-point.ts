export class EnhancedDOMPoint extends DOMPoint {
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

  normalize() {
    const length = Math.hypot(...this.toArray());
    if (length === 0) {
      return new EnhancedDOMPoint();
    }
    return new EnhancedDOMPoint(this.x /= length, this.y /= length, this.z /= length);
  }
}
