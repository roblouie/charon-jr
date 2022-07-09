export class LilGl {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;

  readonly coordsLocation = 0;
  readonly normalsLocation = 1;
  readonly texCoordsLocation = 2;
  readonly textureDepth = 3;

 constructor() {
   this.canvas = document.querySelector('#c')!;
   this.canvas.width  = 1280;
   this.canvas.height = 720;
   this.gl = this.canvas.getContext('webgl2')!;
   const vertex = this.createShader(this.gl.VERTEX_SHADER, require('@/shaders/vertex.shader.glsl'));
   const fragment = this.createShader(this.gl.FRAGMENT_SHADER, require('@/shaders/fragment.shader.glsl'));
   this.program = this.createProgram(vertex, fragment);
  }

  createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      throw new Error('Error compiling shader: ' + this.gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error('Error creating program: ' + this.gl.getProgramInfoLog(program));
    }
    return program;
  }
}

export const lilgl = new LilGl();
export const gl = lilgl.gl;
