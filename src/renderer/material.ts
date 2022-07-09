import { Texture } from '@/renderer/texture';
import { hexToWebgl } from "@/helpers";

export class Material {
  color = [1.0, 1.0, 1.0, 1.0];
  emissive = [0.0, 0.0, 0.0, 0.0];
  texture?: Texture;
  isTransparent = false;

  constructor(props?: { color?: string, texture?: Texture, emissive?: string, isTransparent?: boolean }) {
    this.color = props?.color ? hexToWebgl(props.color) : this.color;
    this.texture = props?.texture;
    this.emissive = props?.emissive ? hexToWebgl(props.emissive) : this.emissive;
    this.isTransparent = props?.isTransparent ?? this.isTransparent;
  }
}
