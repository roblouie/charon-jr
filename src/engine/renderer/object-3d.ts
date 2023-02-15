import { EnhancedDOMPoint } from "@/engine/enhanced-dom-point";
import { radsToDegrees } from '@/engine/helpers';

export class Object3d {
  position_: EnhancedDOMPoint;
  scale_: EnhancedDOMPoint;
  children_: Object3d[];
  parent_?: Object3d;
  localMatrix: DOMMatrix;
  worldMatrix: DOMMatrix;
  up: EnhancedDOMPoint;
  rotationMatrix: DOMMatrix;

  constructor(...children: Object3d[]) {
    this.position_ = new EnhancedDOMPoint();
    this.scale_ = new EnhancedDOMPoint(1, 1, 1);
    this.children_ = [];
    this.localMatrix = new DOMMatrix();
    this.worldMatrix = new DOMMatrix();
    this.up = new EnhancedDOMPoint(0, 1, 0);
    this.rotationMatrix = new DOMMatrix();
    if (children) {
      this.add_(...children);
    }
  }

  add_(...object3ds: Object3d[]) {
    object3ds.forEach(object3d => {
      if (object3d.parent_) {
        object3d.parent_.children_ = object3d.parent_.children_.filter(child => child !== this);
      }
      object3d.parent_ = this;
      this.children_.push(object3d);
    })
  }

  remove_(object3d: Object3d) {
    this.children_ = this.children_.filter(child => child !== object3d);
  }

  rotation_ = new EnhancedDOMPoint();
  rotate_(xRads: number, yRads: number, zRads: number) {
    this.rotation_.add_({x: radsToDegrees(xRads), y: radsToDegrees(yRads), z: radsToDegrees(zRads)});
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  setRotation_(xRads: number, yRads: number, zRads: number) {
    this.rotationMatrix = new DOMMatrix();
    this.rotation_.set(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
    this.rotationMatrix.rotateSelf(radsToDegrees(xRads), radsToDegrees(yRads), radsToDegrees(zRads));
  }

  isUsingLookAt = false;
  getMatrix() {
    const matrix = new DOMMatrix();
    matrix.translateSelf(this.position_.x, this.position_.y, this.position_.z);
    if (this.isUsingLookAt) {
      matrix.multiplySelf(this.rotationMatrix);
    } else {
      matrix.rotateSelf(this.rotation_.x, this.rotation_.y, this.rotation_.z);
    }
    matrix.scaleSelf(this.scale_.x, this.scale_.y, this.scale_.z);
    return matrix;
  }

  updateWorldMatrix() {
    // Don't udpate spirites to save time on matrix multiplication. Bit of a hack but ya it works...
    // @ts-ignore
    if (this.color !== undefined) {
      return;
    }

    this.localMatrix = this.getMatrix();

    if (this.parent_) {
      this.worldMatrix = this.parent_.worldMatrix.multiply(this.localMatrix);
    } else {
      this.worldMatrix = DOMMatrix.fromMatrix(this.localMatrix);
    }

      this.children_.forEach(child => child.updateWorldMatrix());
  }

  allChildren(): Object3d[] {
    function getChildren(object3d: Object3d, all: Object3d[]) {
      object3d.children_.forEach(child => {
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
    this.lookAtZ.subtractVectors(this.position_, target).normalize_();
    this.lookAtX.crossVectors(this.up, this.lookAtZ).normalize_();
    this.lookAtY.crossVectors(this.lookAtZ, this.lookAtX).normalize_();

    this.rotationMatrix = new DOMMatrix([
      this.lookAtX.x, this.lookAtX.y, this.lookAtX.z, 0,
      this.lookAtY.x, this.lookAtY.y, this.lookAtY.z, 0,
      this.lookAtZ.x, this.lookAtZ.y, this.lookAtZ.z, 0,
      0, 0, 0, 1,
    ]);
  }
}
