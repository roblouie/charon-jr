import { Texture } from '@/renderer/texture';

export class Material {
  color = [1.0, 1.0, 1.0, 1.0];
  texture?: Texture;

  constructor(props: { color?: number[], texture?: Texture }) {
    this.color = props.color ?? this.color;
    this.texture = props.texture;
  }
}
