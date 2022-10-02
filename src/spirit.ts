import { Mesh } from '@/engine/renderer/mesh';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { noiseMaker } from '@/engine/noise-maker';
import { Object3d } from '@/engine/renderer/object-3d';
import { materials } from '@/texture-maker';
import { hexToWebgl } from '@/engine/helpers';
import { Material } from '@/engine/renderer/material';
import { sadGhostAudio, sadGhostAudio2 } from '@/sound-effects';
import { iconGeo, staticBodyGeo } from '@/modeling/spirit.modeling';

export class Spirit extends Object3d {
  static Colors = ['#f00', '#0f0', '#00f', '#f90'];

  spiritMesh: Mesh;
  iconMesh: Mesh;
  position: EnhancedDOMPoint;
  color: number[];

  dropOffPoint: number;
  audioPlayer?: AudioBufferSourceNode;

  cachedMatrixData: Float32Array;

  constructor(position: EnhancedDOMPoint) {
    super(new Mesh(staticBodyGeo, materials.spiritMaterial), new Mesh(iconGeo, new Material()));
    this.spiritMesh = this.children[0] as Mesh;
    this.iconMesh = this.children[1] as Mesh;
    this.position = new EnhancedDOMPoint().set(position);
    this.dropOffPoint = Math.abs(Math.floor(noiseMaker.randomNumber(position.x + position.z) * 3));
    this.rotation.y = Math.random() * 6;

    this.updateWorldMatrix();
    this.color = Spirit.Colors.map(hexToWebgl)[this.dropOffPoint];
    this.iconMesh.material.emissive = this.color;
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
