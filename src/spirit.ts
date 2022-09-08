import { Mesh } from '@/engine/renderer/mesh';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { materials } from '@/texture-maker';
import { MoldableCubeGeometry } from '@/engine/moldable-cube-geometry';
import { hexToWebgl } from '@/engine/helpers';
import { sadGhostAudio, sadGhostAudio2 } from '@/engine/audio/audio-player';

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
  leftArm.rotate(-1, 0, -0.2);
  rightArm.rotate(-1, 0, 0.2);
  leftLegMesh.rotate(-1.7, 0, 0);
  rightLegMesh.rotate(-1.7, 0, 0);
  leftLegMesh.position.y -= 0.8;
  rightLegMesh.position.y -= 0.8;
  return new Object3d(headMesh, bodyMesh, leftArm, rightArm, leftLegMesh, rightLegMesh);
}

const staticLeftArm = makeArmGeo().all().rotate(1.4).translate(1, 1, 1).done();
const staticRightArm = makeArmGeo().all().rotate(1.6).translate(-1, 0.8, 1).done();
export const staticBodyGeo = makeBody().merge(staticLeftArm).merge(staticRightArm).merge(leftLeg).merge(rightLeg).done();



export class Spirit extends Object3d {
  bodyMesh: Mesh;
  headMesh: Mesh;
  position: EnhancedDOMPoint;
  color: number[];

  dropOffPoint: number;
  audioPlayer?: AudioBufferSourceNode;

  cachedMatrixData: Float32Array;

  static isSpirit(object3d: Object3d): object3d is Spirit  {
    return (object3d as Spirit).color !== undefined;
  }

  constructor(position: EnhancedDOMPoint) {
    super(new Mesh(staticBodyGeo, materials.spiritMaterial), new Mesh(head, materials.spiritMaterial))
    this.bodyMesh = this.children[0] as Mesh;
    this.headMesh = this.children[1] as Mesh;
    this.position = position;
    const dropOffs: number[] = [0, 1, 2];
    const dropOffIndex = Math.abs(Math.floor(noiseMaker.randomNumber(position.x + position.z) * 2));
    this.dropOffPoint = dropOffs[dropOffIndex];

    this.position.set(position);
    this.updateWorldMatrix();
    this.color = ['#f00', '#0f0', '#00f'].map(hexToWebgl)[dropOffIndex];
    this.cachedMatrixData = this.worldMatrix.inverse().toFloat32Array()
    const randomBetween0and3 = Math.random() * 4;
    const intBetween0and3 = Math.floor(randomBetween0and3);
    if (intBetween0and3 <= 1) {
      const audioCreator = [sadGhostAudio, sadGhostAudio2][Math.floor(intBetween0and3)];
      this.audioPlayer = audioCreator(position);
      this.audioPlayer.loop = true;
      this.audioPlayer.start(randomBetween0and3);
    }
  }
}
