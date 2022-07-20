import { Mesh } from './mesh';
import { radsToDegrees } from '@/engine/math-helpers';
import { EnhancedDOMPoint } from "@/core/enhanced-dom-point";

export class Object3d {
  position: EnhancedDOMPoint;
  scale: EnhancedDOMPoint;
  children: Object3d[];
  parent?: Object3d;
  localMatrix: DOMMatrix;
  worldMatrix: DOMMatrix;
  up: EnhancedDOMPoint;
  rotationMatrix: DOMMatrix;

  constructor() {
    this.position = new EnhancedDOMPoint();
    this.scale = new EnhancedDOMPoint(1, 1, 1);
    this.children = [];
    this.localMatrix = new DOMMatrix();
    this.worldMatrix = new DOMMatrix();
    this.up = new EnhancedDOMPoint(0, 1, 0);
    this.rotationMatrix = new DOMMatrix();
  }

  add(...object3ds: Object3d[]) {
    object3ds.forEach(object3d => {
      if (object3d.parent) {
        object3d.parent.remove(this);
      }
      object3d.parent = this;
      this.children.push(object3d);
    })
  }

  remove(object3d: Object3d) {
    this.children = this.children.filter(child => child !== object3d);
  }

  rotate(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  setRotation(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix = new DOMMatrix();
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  getMatrix() {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.position.x, this.position.y, this.position.z);
    matrix.multiplySelf(this.rotationMatrix);
    matrix.scaleSelf(this.scale.x, this.scale.y, this.scale.z);
    return matrix;
  }

  updateWorldMatrix() {
    this.localMatrix = this.getMatrix();

    if (this.parent) {
      this.worldMatrix = this.parent.worldMatrix.multiply(this.localMatrix);
    } else {
      this.worldMatrix = DOMMatrix.fromMatrix(this.localMatrix);
    }

    this.children.forEach(child => child.updateWorldMatrix());
  }

  isMesh(): this is Mesh {
    return (this as any).geometry !== undefined;
  }

  allChildren(): Object3d[] {
    function getChildren(object3d: Object3d, all: Object3d[]) {
      object3d.children.forEach(child => {
        all.push(child);
        getChildren(child, all);
      });
    }

    const allChildren: Object3d[] = [];
    getChildren(this, allChildren);
    return allChildren;
  }

  private lookAtX = new EnhancedDOMPoint();
  private lookAtY = new EnhancedDOMPoint();
  private lookAtZ = new EnhancedDOMPoint();
  // Consider removing up argument as it should probably just be the up of object3d
  lookAt(target: EnhancedDOMPoint, up?: EnhancedDOMPoint) {
    this.lookAtZ.subtractVectors(this.position, target).normalize();
    this.lookAtX.crossVectors((up ?? this.up), this.lookAtZ).normalize();
    this.lookAtY.crossVectors(this.lookAtZ, this.lookAtX).normalize();

    this.rotationMatrix = new DOMMatrix([
      this.lookAtX.x, this.lookAtX.y, this.lookAtX.z, 0,
      this.lookAtY.x, this.lookAtY.y, this.lookAtY.z, 0,
      this.lookAtZ.x, this.lookAtZ.y, this.lookAtZ.z, 0,
      0, 0, 0, 1,
    ]);
  }
}
