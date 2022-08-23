/* File generated with Shader Minifier 1.2
 * http://www.ctrl-alt-test.fr
 */
export const ACOORDS = "o"
export const ADEPTH = "e"
export const ANORMAL = "i"
export const APERINSTANCEMATRIX = "h"
export const APERINSTANCENORMALMATRIX = "P"
export const ATEXCOORD = "t"
export const COLOR = "s"
export const EMISSIVE = "f"
export const MODELVIEWPROJECTION = "n"
export const NORMALMATRIX = "a"
export const OUTCOLOR = "z"
export const TEXTUREREPEAT = "r"
export const USAMPLER = "y"
export const U_SKYBOX = "p"
export const U_VIEWDIRECTIONPROJECTIONINVERSE = "g"
export const VCOLOR = "m"
export const VDEPTH = "v"
export const VNORMAL = "l"
export const VNORMALMATRIX = "u"
export const VTEXCOORD = "c"
export const V_POSITION = "d"
export const VIEWPROJECTION = "D"

export const vertex_shader_glsl = `#version 300 es
layout(location=0)in vec3 o;layout(location=1)in vec3 i;layout(location=2)in vec2 t;layout(location=3)in float e;uniform mat4 n,a;out vec2 c;out float v;out vec3 l;out mat4 u;void main(){vec4 C=vec4(o,1.);gl_Position=n*C;c=t;v=e;l=i;u=a;}`

export const fragment_shader_glsl = `#version 300 es
precision highp float;in vec4 m;in vec2 c;in float v;in vec3 l;in mat4 u;uniform vec2 r;uniform vec4 s,f;uniform mediump sampler2DArray y;out vec4 z;vec3 x=vec3(-1,2,1);void main(){vec3 A=normalize(mat3(u)*l),w=normalize(x);float b=max(dot(w,A),0.);vec3 Z=length(f)>0.?f.xyz:s.xyz*.4f+b*s.xyz*.7;vec4 m=vec4(Z,s.w);if(v<0.)z=m;else z=texture(y,vec3(c*r,v))*m;}`

export const skybox_fragment_glsl = `#version 300 es
precision highp float;uniform samplerCube p;uniform mat4 g;in vec4 d;out vec4 z;void main(){vec4 Y=g*d;z=texture(p,Y.xyz);}`

export const skybox_vertex_glsl = `#version 300 es
layout(location=0)in vec4 o;out vec4 d;void main(){d=o,gl_Position=o,gl_Position.z=1.;}`

export const instanced_vertex_glsl = `#version 300 es
layout(location=0)in vec3 o;layout(location=1)in vec3 i;layout(location=2)in vec2 t;layout(location=3)in float e;layout(location=4)in mat4 h;layout(location=8)in mat4 P;uniform mat4 D;out vec2 c;out float v;out vec3 l;out mat4 u;void main(){vec4 C=vec4(o,1.);gl_Position=D*h*C;c=t;v=e;l=i;u=P;}`
