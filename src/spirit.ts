import { Mesh } from '@/engine/renderer/mesh';
import { EnhancedDOMPoint } from '@/engine/enhanced-dom-point';
import { spiritGeometry } from '@/modeling/spirits.modeling';
import { Material } from '@/engine/renderer/material';
import { noiseMaker } from '@/engine/texture-creation/noise-maker';

export class Spirit extends Mesh {
  dropOffPoint: 'redDropOff' | 'greenDropOff' | 'blueDropOff';

  constructor(position: EnhancedDOMPoint) {
    const dropOffs: ('redDropOff' | 'greenDropOff' | 'blueDropOff')[] = ['redDropOff', 'greenDropOff', 'blueDropOff'];
    const dropOffIndex = Math.abs(Math.floor(noiseMaker.randomNumber(position.x + position.z) * 2));
    const colors = ['#f00', '#0f0', '#00f'];
    super(spiritGeometry, new Material({ color: colors[dropOffIndex] }));
    this.dropOffPoint = dropOffs[dropOffIndex];
    this.position.set(position);
  }
}
