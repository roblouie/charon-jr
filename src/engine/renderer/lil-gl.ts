import {
  fragment_shader_glsl, skybox_fragment_glsl, skybox_vertex_glsl,
  instanced_vertex_glsl, vertex_shader_glsl
} from '@/engine/shaders/shaders';

export class LilGl {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  program: WebGLProgram;
  skyboxProgram: WebGLProgram;
  instancedProgram: WebGLProgram;

 constructor() {
   this.canvas = document.querySelector('#c')!;
   this.canvas.width  = 1920;
   this.canvas.height = 1080;
   this.gl = this.canvas.getContext('webgl2')!;
   const vertex = this.createShader(this.gl.VERTEX_SHADER, vertex_shader_glsl);
   const fragment = this.createShader(this.gl.FRAGMENT_SHADER, fragment_shader_glsl);
   this.program = this.createProgram(vertex, fragment);
   const skyboxVertex = this.createShader(this.gl.VERTEX_SHADER, skybox_vertex_glsl);
   const skyboxFragment = this.createShader(this.gl.FRAGMENT_SHADER, skybox_fragment_glsl);
   this.skyboxProgram = this.createProgram(skyboxVertex, skyboxFragment);
   const instancedVertex = this.createShader(this.gl.VERTEX_SHADER, instanced_vertex_glsl);
   this.instancedProgram = this.createProgram(instancedVertex, fragment);
 }

  createShader(type: GLenum, source: string): WebGLShader {
    const shader = this.gl.createShader(type)!;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    return shader;
  }

  createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const program = this.gl.createProgram()!;
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    return program;
  }
}

export const lilgl = new LilGl();
export const gl = lilgl.gl;
