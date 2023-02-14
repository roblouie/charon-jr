import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { Mesh } from '@/engine/renderer/mesh';
import { materials } from '@/texture-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { createBox } from '@/modeling/building-blocks.modeling';

const neck = new MoldableCubeGeometry(1, 0.4, 1, 2, 1, 2).cylindrify(0.3).translateMc(0, 1.3, 0).computeNormalsCrossPlane().doneMc();

const head = new MoldableCubeGeometry(1, 1, 1, 2, 3, 2)
  .spherify(1)
  .scaleMc(1, 1.2, 1)
  .translateMc(0, 2.5, 0)
  .computeNormalsCrossPlane()
  .doneMc();

function makeBody() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 3, 2)
    .spherify(1)
    .scaleMc(1.3, 1.3, 0.8)
    .selectBy(vertex => vertex.y > 0 && vertex.y < 1)
    .translateMc(0, 0.3, 0)
    .merge(neck)
    .allMc()
    .computeNormalsCrossPlane()
    .doneMc();
}

function makeArmGeo() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.3)
    .selectBy(vertex => vertex.y < 0)
    .scaleMc(1.1, 1, 1.1)
    .invertSelection()
    .scaleMc(0.9, 1, 0.9)
    .doneMc();
}

function createArm(isLeft = false) {
  const armMesh = new Mesh(makeArmGeo(), materials.spiritMaterial);
  armMesh.positionO3d.y += 1;

  const armAttachment = new Object3d(armMesh);
  armAttachment.positionO3d.x = isLeft ? 1 : -1;
  armAttachment.positionO3d.y += 0.8;
  armAttachment.rotateO3d(1.2, 0, 0);

  return armAttachment;
}

function createLeg(isLeft = false) {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.4)
    .selectBy(vertex => vertex.y > 0)
    .scaleMc(1.1, 1, 1.1)
    .invertSelection()
    .scaleMc(0.9, 1, 0.9)
    .allMc()
    .translateMc(isLeft ? -0.5 : 0.5, -1.8, 0)
    .doneMc();
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
  leftArm.rotateO3d(-1, 0, -0.2);
  rightArm.rotateO3d(-1, 0, 0.2);
  leftLegMesh.rotateO3d(-1.7, 0, 0);
  rightLegMesh.rotateO3d(-1.7, 0, 0);
  leftLegMesh.positionO3d.y -= 0.8;
  rightLegMesh.positionO3d.y -= 0.8;
  return new Object3d(headMesh, bodyMesh, leftArm, rightArm, leftLegMesh, rightLegMesh);
}

const staticLeftArm = makeArmGeo().allMc().rotateMc(1.4).translateMc(1, 1, 1).doneMc();
const staticRightArm = makeArmGeo().allMc().rotateMc(1.6).translateMc(-1, 0.8, 1).doneMc();
export const staticBodyGeo = makeBody().merge(staticLeftArm).merge(staticRightArm).merge(leftLeg).merge(rightLeg).merge(head).doneMc();

export const iconGeo = new MoldableCubeGeometry(2, 2, 2)
  .selectBy(vertex => vertex.y < 0)
  .scaleMc(0, 1.5, 0)
  .allMc()
  .translateMc(0, 7, 0)
  .merge(
    createBox(6, 3, 1, 6, 1, 1)
      .translateMc(0, -2.5)
      .selectBy(vertex => Math.abs(vertex.x) < 2.5 && Math.abs(vertex.z) < 2.5)
      .cylindrify(14, 'y')
      .invertSelection()
      .cylindrify(15, 'y')
      .doneMc()
  )
  .doneMc();
