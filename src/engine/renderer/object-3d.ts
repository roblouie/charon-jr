import { radsToDegrees } from '@/engine/math-helpers';
import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";

export class Object3d {
  position: EnhancedDOMPoint;
  scale: EnhancedDOMPoint;
  children: Object3d[];
  parent?: Object3d;
  localMatrix: DOMMatrix;
  worldMatrix: DOMMatrix;
  up: EnhancedDOMPoint;
  rotationMatrix: DOMMatrix;

  constructor(...children: Object3d[]) {
    this.position = new EnhancedDOMPoint();
    this.scale = new EnhancedDOMPoint(1, 1, 1);
    this.children = [];
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

  rotation = new EnhancedDOMPoint();
  rotate(xRads: number, yRads: number, zRads: number) {
    this.rotation.add({x: radsToDegrees(xRads), y: radsToDegrees(yRads), z: radsToDegrees(zRads)});
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  setRotation(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix = new DOMMatrix();
    this.rotation.set(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  isUsingLookAt = false;
  getMatrix() {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.position.x, this.position.y, this.position.z);
    if (this.isUsingLookAt) {
      matrix.multiplySelf(this.rotationMatrix);
    } else {
      matrix.rotateSelf(this.rotation.x, this.rotation.y, this.rotation.z);
    }
    matrix.scaleSelf(this.scale.x, this.scale.y, this.scale.z);
    return matrix;
  }

  updateWorldMatrix() {
    // Don't udpate spirites to save time on matrix multiplication. Bit of a hack but ya it works...
    // @ts-ignore
    if (this.color !== undefined) {
      return;
    }

    this.localMatrix = this.getMatrix();

    if (this.parent) {
      this.worldMatrix = this.parent.worldMatrix.multiply(this.localMatrix);
    } else {
      this.worldMatrix = DOMMatrix.fromMatrix(this.localMatrix);
    }

      this.children.forEach(child => child.updateWorldMatrix());
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

  lookAt(target: EnhancedDOMPoint) {
    this.isUsingLookAt = true;
    this.lookAtZ.subtractVectors(this.position, target).normalize();
    this.lookAtX.crossVectors(this.up, this.lookAtZ).normalize();
    this.lookAtY.crossVectors(this.lookAtZ, this.lookAtX).normalize();

    this.rotationMatrix = new DOMMatrix([
      this.lookAtX.x, this.lookAtX.y, this.lookAtX.z, 0,
      this.lookAtY.x, this.lookAtY.y, this.lookAtY.z, 0,
      this.lookAtZ.x, this.lookAtZ.y, this.lookAtZ.z, 0,
      0, 0, 0, 1,
    ]);
  }
}
