import {
  fragment_shader_glsl, skybox_fragment_glsl, skybox_vertex_glsl,
  vertex_shader_glsl
} from '@/engine/shaders/shaders';

export class LilGl {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  skyboxProgram: WebGLProgram;

 constructor() {
   this.canvas = document.querySelector('#c')!;
   this.canvas.width  = 1280;
   this.canvas.height = 720;
   this.gl = this.canvas.getContext('webgl2')!;
   const vertex = this.createShader(this.gl.VERTEX_SHADER, vertex_shader_glsl);
   const fragment = this.createShader(this.gl.FRAGMENT_SHADER, fragment_shader_glsl);
   this.program = this.createProgram(vertex, fragment);
   const skyboxVertex = this.createShader(this.gl.VERTEX_SHADER, skybox_vertex_glsl)
   const skyboxFragment = this.createShader(this.gl.FRAGMENT_SHADER, skybox_fragment_glsl)
   this.skyboxProgram = this.createProgram(skyboxVertex, skyboxFragment);
 }

  createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    // if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
    //   throw new Error('Error compiling shader: ' + this.gl.getShaderInfoLog(shader));
    // }
    return shader;
  }

  createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    // if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
    //   throw new Error('Error creating program: ' + this.gl.getProgramInfoLog(program));
    // }
    return program;
  }
}

export const lilgl = new LilGl();
export const gl = lilgl.gl;
