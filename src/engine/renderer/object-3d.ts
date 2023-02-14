import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { radsToDegrees } from '@/engine/helpers';

export class Object3d {
  positionO3d: EnhancedDOMPoint;
  scaleO3d: EnhancedDOMPoint;
  childrenO3d: Object3d[];
  parentO3d?: Object3d;
  localMatrix: DOMMatrix;
  worldMatrix: DOMMatrix;
  up: EnhancedDOMPoint;
  rotationMatrix: DOMMatrix;

  constructor(...children: Object3d[]) {
    this.positionO3d = new EnhancedDOMPoint();
    this.scaleO3d = new EnhancedDOMPoint(1, 1, 1);
    this.childrenO3d = [];
    this.localMatrix = new DOMMatrix();
    this.worldMatrix = new DOMMatrix();
    this.up = new EnhancedDOMPoint(0, 1, 0);
    this.rotationMatrix = new DOMMatrix();
    if (children) {
      this.add(...children);
    }
  }

  add(...object3ds: Object3d[]) {
    object3ds.forEach(object3d => {
      if (object3d.parentO3d) {
        object3d.parentO3d.childrenO3d = object3d.parentO3d.childrenO3d.filter(child => child !== this);
      }
      object3d.parentO3d = this;
      this.childrenO3d.push(object3d);
    })
  }

  removeO3d(object3d: Object3d) {
    this.childrenO3d = this.childrenO3d.filter(child => child !== object3d);
  }

  rotationO3d = new EnhancedDOMPoint();
  rotateO3d(xRads: number, yRads: number, zRads: number) {
    this.rotationO3d.add({x: radsToDegrees(xRads), y: radsToDegrees(yRads), z: radsToDegrees(zRads)});
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  setRotationO3d(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix = new DOMMatrix();
    this.rotationO3d.set(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  isUsingLookAt = false;
  getMatrix() {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.positionO3d.x, this.positionO3d.y, this.positionO3d.z);
    if (this.isUsingLookAt) {
      matrix.multiplySelf(this.rotationMatrix);
    } else {
      matrix.rotateSelf(this.rotationO3d.x, this.rotationO3d.y, this.rotationO3d.z);
    }
    matrix.scaleSelf(this.scaleO3d.x, this.scaleO3d.y, this.scaleO3d.z);
    return matrix;
  }

  updateWorldMatrix() {
    // Don't udpate spirites to save time on matrix multiplication. Bit of a hack but ya it works...
    // @ts-ignore
    if (this.color !== undefined) {
      return;
    }

    this.localMatrix = this.getMatrix();

    if (this.parentO3d) {
      this.worldMatrix = this.parentO3d.worldMatrix.multiply(this.localMatrix);
    } else {
      this.worldMatrix = DOMMatrix.fromMatrix(this.localMatrix);
    }

      this.childrenO3d.forEach(child => child.updateWorldMatrix());
  }

  allChildren(): Object3d[] {
    function getChildren(object3d: Object3d, all: Object3d[]) {
      object3d.childrenO3d.forEach(child => {
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

  lookAt(target: EnhancedDOMPoint) {
    this.isUsingLookAt = true;
    this.lookAtZ.subtractVectors(this.positionO3d, target).normalizePoint();
    this.lookAtX.crossVectors(this.up, this.lookAtZ).normalizePoint();
    this.lookAtY.crossVectors(this.lookAtZ, this.lookAtX).normalizePoint();

    this.rotationMatrix = new DOMMatrix([
      this.lookAtX.x, this.lookAtX.y, this.lookAtX.z, 0,
      this.lookAtY.x, this.lookAtY.y, this.lookAtY.z, 0,
      this.lookAtZ.x, this.lookAtZ.y, this.lookAtZ.z, 0,
      0, 0, 0, 1,
    ]);
  }
}
