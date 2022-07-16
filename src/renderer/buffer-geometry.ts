import { lilgl } from '@/lil-gl';

// IMPORTANT! The index of a given buffer in the buffer array must match it's respective data location in the shader.
// This allows us to use the index while looping through buffers to bind the attributes. So setting a buffer
// happens by placing
export enum BufferType {
  Positions = lilgl.coordsLocation,
  Normals = lilgl.normalsLocation,
  TextureCoords = lilgl.texCoordsLocation,
}

type BufferInfo = { data: Float32Array; size: number };

export class BufferGeometry {
  private buffers: Map<BufferType, BufferInfo> = new Map<BufferType, BufferInfo>();
  private indices?: Uint16Array;
  private fullBuffer: Float32Array;

  buffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;

  constructor() {
    this.buffer = lilgl.gl.createBuffer()!;
    this.indexBuffer = lilgl.gl.createBuffer()!;
    this.vao = lilgl.gl.createVertexArray()!;
    this.fullBuffer = new Float32Array();
  }

  private populateFullBuffer() {
    const fullSize = [...this.buffers.values()].reduce((total, current) => total += current.data.length , 0);
    this.fullBuffer = new Float32Array(fullSize);
    let runningOffset = 0;
    this.buffers.forEach(buffer => {
      this.fullBuffer.set(buffer.data, runningOffset);
      runningOffset+= buffer.data.length;
    });
  }

  getBuffer(bufferType: BufferType) {
    return this.buffers.get(bufferType)!;
  }

  setBuffer(bufferType: BufferType, data: Float32Array, size: number) {
    this.buffers.set(bufferType, { data, size });
  }

  setIndices(indices: Uint16Array) {
    this.indices = indices;
  }

  getIndices(): Uint16Array | undefined {
    return this.indices;
  }

  // miniUpdate() {
  //   lilgl.gl.bindBuffer(lilgl.gl.ARRAY_BUFFER, this.buffer);
  //   lilgl.gl.bufferData(lilgl.gl.ARRAY_BUFFER, this.fullBuffer, lilgl.gl.STATIC_DRAW);
  //
  //   lilgl.gl.bindVertexArray(this.vao);
  //   lilgl.gl.bindBuffer(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
  //   lilgl.gl.bufferData(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indices!, lilgl.gl.STATIC_DRAW);
  // }

  bindGeometry() {
    this.buffer = lilgl.gl.createBuffer()!;
    this.populateFullBuffer();
    lilgl.gl.bindBuffer(lilgl.gl.ARRAY_BUFFER, this.buffer);
    lilgl.gl.bufferData(lilgl.gl.ARRAY_BUFFER, this.fullBuffer, lilgl.gl.STATIC_DRAW);

    lilgl.gl.bindVertexArray(this.vao);

    let runningOffset = 0;
    this.buffers.forEach((buffer, position) => {
      lilgl.gl.vertexAttribPointer(position, buffer.size, lilgl.gl.FLOAT, false, 0, runningOffset);
      lilgl.gl.enableVertexAttribArray(position);
      runningOffset += buffer.data.length * buffer.data.BYTES_PER_ELEMENT;
    });

    if (this.indices?.length) {
      lilgl.gl.bindBuffer(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      lilgl.gl.bufferData(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indices, lilgl.gl.STATIC_DRAW);
    }

    lilgl.gl.bindVertexArray(null);
  }
}
