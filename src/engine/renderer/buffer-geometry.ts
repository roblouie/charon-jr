import { gl } from '@/engine/renderer/lil-gl';
import { AttributeLocation } from '@/engine/renderer/renderer';

type BufferInfo = { data: Float32Array; size: number };

export class BufferGeometry {
  buffers: Map<AttributeLocation, BufferInfo> = new Map<AttributeLocation, BufferInfo>();
  private indices?: Uint16Array;
  fullBuffer: Float32Array;

  buffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;

  constructor() {
    this.buffer = gl.createBuffer()!;
    this.indexBuffer = gl.createBuffer()!;
    this.vao = gl.createVertexArray()!;
    this.fullBuffer = new Float32Array();
  }

  populateFullBuffer() {
    const fullSize = [...this.buffers.values()].reduce((total, current) => total += current.data.length , 0);
    this.fullBuffer = new Float32Array(fullSize);
    let runningOffset = 0;
    this.buffers.forEach(buffer => {
      this.fullBuffer.set(buffer.data, runningOffset);
      runningOffset+= buffer.data.length;
    });
  }

  getAttribute(attributeLocation: AttributeLocation) {
    return this.buffers.get(attributeLocation)!;
  }

  setAttribute(attributeLocation: AttributeLocation, data: Float32Array, size: number) {
    this.buffers.set(attributeLocation, { data, size });
  }

  setIndices(indices: Uint16Array) {
    this.indices = indices;
  }

  getIndices(): Uint16Array | undefined {
    return this.indices;
  }

  bindGeometry() {
    this.buffer = gl.createBuffer()!;
    this.populateFullBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.fullBuffer, gl.STATIC_DRAW);

    gl.bindVertexArray(this.vao);

    let runningOffset = 0;
    this.buffers.forEach((buffer, position) => {
      gl.vertexAttribPointer(position, buffer.size, gl.FLOAT, false, 0, runningOffset);
      gl.enableVertexAttribArray(position);
      runningOffset += buffer.data.length * buffer.data.BYTES_PER_ELEMENT;
    });

    if (this.indices?.length) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);
    }
  }
}
