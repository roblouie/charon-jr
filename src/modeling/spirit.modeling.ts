import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { materials } from '@/texture-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { createBox } from '@/modeling/building-blocks.modeling';

const neck = new MoldableCubeGeometry(1, 0.4, 1, 2, 1, 2).cylindrify(0.3).translate_(0, 1.3, 0).computeNormals(true).done_();

const head = new MoldableCubeGeometry(1, 1, 1, 2, 3, 2)
  .spherify(1)
  .scale_(1, 1.2, 1)
  .translate_(0, 2.5, 0)
  .computeNormals(true)
  .done_();

function makeBody() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 3, 2)
    .spherify(1)
    .scale_(1.3, 1.3, 0.8)
    .selectBy(vertex => vertex.y > 0 && vertex.y < 1)
    .translate_(0, 0.3, 0)
    .merge(neck)
    .all_()
    .computeNormals(true)
    .done_();
}

function makeArmGeo() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.3)
    .selectBy(vertex => vertex.y < 0)
    .scale_(1.1, 1, 1.1)
    .invertSelection()
    .scale_(0.9, 1, 0.9)
    .done_();
}

function createArm(isLeft = false) {
  const armMesh = new Mesh(makeArmGeo(), materials.spiritMaterial);
  armMesh.position_.y += 1;

  const armAttachment = new Object3d(armMesh);
  armAttachment.position_.x = isLeft ? 1 : -1;
  armAttachment.position_.y += 0.8;
  armAttachment.rotate_(1.2, 0, 0);

  return armAttachment;
}

function createLeg(isLeft = false) {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.4)
    .selectBy(vertex => vertex.y > 0)
    .scale_(1.1, 1, 1.1)
    .invertSelection()
    .scale_(0.9, 1, 0.9)
    .all_()
    .translate_(isLeft ? -0.5 : 0.5, -1.8, 0)
    .done_();
}

const leftLeg = createLeg(true);
const rightLeg = createLeg();

export function makeDynamicBody() {
  const headMesh = new Mesh(head, materials.spiritMaterial);
  const bodyMesh = new Mesh(makeBody(), materials.spiritMaterial);
  const leftArm = createArm(true);
  const rightArm = createArm();
  const leftLegMesh = new Mesh(leftLeg, materials.spiritMaterial);
  const rightLegMesh = new Mesh(rightLeg, materials.spiritMaterial);
  leftArm.rotate_(-1, 0, -0.2);
  rightArm.rotate_(-1, 0, 0.2);
  leftLegMesh.rotate_(-1.7, 0, 0);
  rightLegMesh.rotate_(-1.7, 0, 0);
  leftLegMesh.position_.y -= 0.8;
  rightLegMesh.position_.y -= 0.8;
  return new Object3d(headMesh, bodyMesh, leftArm, rightArm, leftLegMesh, rightLegMesh);
}

const staticLeftArm = makeArmGeo().all_().rotate_(1.4).translate_(1, 1, 1).done_();
const staticRightArm = makeArmGeo().all_().rotate_(1.6).translate_(-1, 0.8, 1).done_();
export const staticBodyGeo = makeBody().merge(staticLeftArm).merge(staticRightArm).merge(leftLeg).merge(rightLeg).merge(head).done_();

export const iconGeo = new MoldableCubeGeometry(2, 2, 2)
  .selectBy(vertex => vertex.y < 0)
  .scale_(0, 1.5, 0)
  .all_()
  .translate_(0, 7, 0)
  .merge(
    createBox(6, 3, 1, 6, 1, 1)
      .translate_(0, -2.5)
      .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
      .cylindrify(14, 'y')
      .invertSelection()
      .cylindrify(15, 'y')
      .done_()
  )
  .done_();
