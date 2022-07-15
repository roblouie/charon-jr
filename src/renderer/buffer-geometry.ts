import { lilgl } from '@/lil-gl';

export class BufferGeometry {
  private positions: { data: Float32Array; size: number };
  private normals: { data: Float32Array; size: number };
  private textureCoords: { data: Float32Array; size: number };
  private indices?: Uint16Array;
  private fullBuffer: Float32Array;

  buffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  vao: WebGLVertexArrayObject;

  constructor() {
    this.buffer = lilgl.gl.createBuffer()!;
    this.indexBuffer = lilgl.gl.createBuffer()!;
    this.vao = lilgl.gl.createVertexArray()!;
    this.positions = { data: new Float32Array(0), size: 3 };
    this.normals = { data: new Float32Array(0), size: 3 };
    this.textureCoords = { data: new Float32Array(0), size: 2 };
    this.fullBuffer = new Float32Array();
  }

  // TODO: Change to just get/set attribute like threejs. Then I can loop through attributes
  // and build out the full buffer when the size changes. When the size doesn't change though, I
  // can just set the data in the appropriate spot. Changing to the generic set attribute lets
  // the code for this all be shared and allows more attributes
  private populateFullBuffer() {
    this.fullBuffer = new Float32Array(this.positions.data.length + this.normals.data.length + this.textureCoords.data.length);
    this.fullBuffer.set(this.positions.data);
    this.fullBuffer.set(this.normals.data, this.positions.data.length);
    this.fullBuffer.set(this.textureCoords.data, this.positions.data.length + this.normals.data.length);
  }

  getPositions() {
    return this.positions;
  }

  setPositions(data: Float32Array, size: number) {
    this.positions = { data, size };
    this.populateFullBuffer();
  }

  getNormals() {
    return this.normals;
  }

  setNormals(data: Float32Array, size: number) {
    this.normals = { data, size };
  }

  setIndices(indices: Uint16Array) {
    this.indices = indices;
  }

  getIndices(): Uint16Array | undefined {
    return this.indices;
  }

  setTextureCoords(data: Float32Array, size: number) {
    this.textureCoords = { data, size };
  }

  getTextureCoords() {
    return this.textureCoords;
  }

  miniUpdate() {
    lilgl.gl.bindBuffer(lilgl.gl.ARRAY_BUFFER, this.buffer);
    lilgl.gl.bufferData(lilgl.gl.ARRAY_BUFFER, this.fullBuffer, lilgl.gl.STATIC_DRAW);

    lilgl.gl.bindVertexArray(this.vao);
    lilgl.gl.bindBuffer(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    lilgl.gl.bufferData(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indices!, lilgl.gl.STATIC_DRAW);
  }

  bindGeometry() {
    this.buffer = lilgl.gl.createBuffer()!;
    this.populateFullBuffer();
    lilgl.gl.bindBuffer(lilgl.gl.ARRAY_BUFFER, this.buffer);
    lilgl.gl.bufferData(lilgl.gl.ARRAY_BUFFER, this.fullBuffer, lilgl.gl.STATIC_DRAW);

    lilgl.gl.bindVertexArray(this.vao);
    lilgl.gl.vertexAttribPointer(lilgl.coordsLocation, this.positions!.size, lilgl.gl.FLOAT, false, 0, 0);
    lilgl.gl.enableVertexAttribArray(lilgl.coordsLocation);

    const vertexByteLength = this.positions!.data.length * this.positions!.data.BYTES_PER_ELEMENT;
    lilgl.gl.vertexAttribPointer(lilgl.normalsLocation, this.normals!.size, lilgl.gl.FLOAT, false, 0, vertexByteLength);
    lilgl.gl.enableVertexAttribArray(lilgl.normalsLocation);

    if (this.textureCoords.data.length) {
      const normalByteLength = this.normals!.data.length * this.normals!.data.BYTES_PER_ELEMENT;
      lilgl.gl.vertexAttribPointer(lilgl.texCoordsLocation, this.textureCoords.size, lilgl.gl.FLOAT, false, 0, vertexByteLength + normalByteLength);
      lilgl.gl.enableVertexAttribArray(lilgl.texCoordsLocation);
    }

    if (this.indices?.length) {
      lilgl.gl.bindBuffer(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
      lilgl.gl.bufferData(lilgl.gl.ELEMENT_ARRAY_BUFFER, this.indices, lilgl.gl.STATIC_DRAW);
    }

    lilgl.gl.bindVertexArray(null);
  }
}
