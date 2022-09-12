import { BufferGeometry } from '@/engine/renderer/buffer-geometry';
import { gl } from '@/engine/renderer/lil-gl';
import { AttributeLocation } from '@/engine/renderer/renderer';
import { Material } from '@/engine/renderer/material';
import { Object3d } from '@/engine/renderer/object-3d';

export class InstancedMesh extends Object3d {
  transformData: Float32Array;
  transforms: DOMMatrix[];
  count: number;

  geometry: BufferGeometry;
  material: Material;
  transformBuffer: WebGLBuffer;

  constructor(geometry: BufferGeometry, transforms: DOMMatrix[], count: number, material: Material) {
    super();
    this.material = material;
    this.transforms = transforms;
    this.count = count;
    const temp: number[] = [];

    transforms.forEach(transform => temp.push(...transform.toFloat32Array(), ...transform.toFloat32Array()));

    this.transformData = new Float32Array(temp);

    this.geometry = geometry;
    this.transformBuffer = gl.createBuffer()!;
    this.geometry.bindGeometry();

    gl.bindVertexArray(this.geometry.vao);
    // Transforms
    gl.bindBuffer(gl.ARRAY_BUFFER, this.transformBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.transformData, gl.DYNAMIC_DRAW);
    // 4x4 matrix made of float32s (4 bytes) means bytes are 4 * 4 * 4;

    // Each transform consists of a 4x4 transform matrix and a 4x4 normal matrix. Each value in these matrices is a
    // 32-bit float, so 4 bytes per value. So 4 bytes by 4 rows by 4 columns by 2 matrices.
    const bytesPerTransform = 4 * 4 * 4 * 2;
    for (let i = 0; i < 8; ++i) {
      const loc = AttributeLocation.LocalMatrix + i;
      const offset = i * 16;  // 4 floats per row, 4 bytes per float
      gl.vertexAttribPointer(loc, 4, gl.FLOAT, false, bytesPerTransform, offset);
      gl.vertexAttribDivisor(loc, 1);
      gl.enableVertexAttribArray(loc);
    }

    // gl.bindVertexArray(null);
  }
}
