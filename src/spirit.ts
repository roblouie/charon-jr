import { Mesh } from '@/engine/renderer/mesh';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { spiritGeometry } from '@/modeling/spirits.modeling';
import { Material } from '@/engine/renderer/material';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { materials } from '@/texture-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { hexToWebgl } from '@/engine/helpers';
import { createPannerNode, sadGhostAudio, sadGhostAudio2 } from '@/engine/audio/audio-player';

const neck = new MoldableCubeGeometry(1, 0.4, 1, 2, 1, 2).cylindrify(0.3).translate(0, 1.3, 0).computeNormalsCrossPlane().done();

const head = new MoldableCubeGeometry(1, 1, 1, 2, 3, 2)
  .spherify(1)
  .scale(1, 1.2, 1)
  .translate(0, 2.5, 0)
  .computeNormalsCrossPlane()
  .done();

function makeBody() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 3, 2)
  .spherify(1)
  .scale(1.3, 1.3, 0.8)
  .selectBy(vertex => vertex.y > 0 && vertex.y < 1)
  .translate(0, 0.3, 0)
  .merge(neck)
  .all()
  .computeNormalsCrossPlane()
  .done();
}

function makeArmGeo() {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.3)
    .selectBy(vertex => vertex.y < 0)
    .scale(1.1, 1, 1.1)
    .invertSelection()
    .scale(0.9, 1, 0.9)
    .done();
}

function createArm(isLeft = false) {
  const armMesh = new Mesh(makeArmGeo(), materials.spiritMaterial);
  armMesh.position.y += 1;

  const armAttachment = new Object3d(armMesh);
  armAttachment.position.x = isLeft ? 1 : -1;
  armAttachment.position.y += 0.8;
  armAttachment.rotate(1.2, 0, 0);

  return armAttachment;
}

function createLeg(isLeft = false) {
  return new MoldableCubeGeometry(1, 2, 1, 2, 1, 2)
    .cylindrify(0.4)
    .selectBy(vertex => vertex.y > 0)
    .scale(1.1, 1, 1.1)
    .invertSelection()
    .scale(0.9, 1, 0.9)
    .all()
    .translate(isLeft ? -0.5 : 0.5, -1.8, 0)
    .done();
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
  leftLegMesh.rotate(-1.7, 0, 0);
  rightLegMesh.rotate(-1.7, 0, 0);
  leftLegMesh.position.y -= 0.8;
  rightLegMesh.position.y -= 0.8;
  return new Object3d(headMesh, bodyMesh, leftArm, rightArm, leftLegMesh, rightLegMesh);
}

const staticLeftArm = makeArmGeo().all().rotate(1.4).translate(1, 1, 1).done();
const staticRightArm = makeArmGeo().all().rotate(1.6).translate(-1, 0.8, 1).done();
export const staticBodyGeo = makeBody().merge(staticLeftArm).merge(staticRightArm).merge(leftLeg).merge(rightLeg).done();



export class Spirit {
  bodyMesh: Mesh;
  headMesh: Mesh;
  position: EnhancedDOMPoint;
  color: number[];

  dropOffPoint: number;
  audioPlayer: AudioBufferSourceNode;

  constructor(position: EnhancedDOMPoint) {
    this.bodyMesh = new Mesh(staticBodyGeo, materials.spiritMaterial);
    this.headMesh = new Mesh(head, materials.spiritMaterial);
    this.position = position;
    // const bodyMesh = new Mesh(body, materials.marble);
    // const leftArm = createArm(true);
    // const rightArm = createArm();
    // const leftLeg = createLeg(true);
    // const rightLeg = createLeg();
    const dropOffs: number[] = [0, 1, 2];
    const dropOffIndex = Math.abs(Math.floor(noiseMaker.randomNumber(position.x + position.z) * 2));
    this.dropOffPoint = dropOffs[dropOffIndex];
    this.color = ['#f00', '#0f0', '#00f'].map(hexToWebgl)[dropOffIndex];
    this.bodyMesh.position.set(position);
    this.headMesh.position.set(position);
    const randomBetween0and1 = Math.random() * 2
    const audioCreator = [sadGhostAudio, sadGhostAudio2][Math.floor(randomBetween0and1)];
    this.audioPlayer = audioCreator(position);
    this.audioPlayer.loop = true;
    this.audioPlayer.start(randomBetween0and1 * 2);
  }
}
