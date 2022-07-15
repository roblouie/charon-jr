/* File generated with Shader Minifier 1.2
 * http://www.ctrl-alt-test.fr
 */
export const ADEPTH = "n"
export const ATEXCOORD = "e"
export const A_COORDS = "o"
export const A_NORMAL = "i"
export const COLOR = "c"
export const EMISSIVE = "a"
export const MODELVIEWPROJECTION = "t"
export const NORMALMATRIX = "v"
export const OUTCOLOR = "f"
export const TEXTUREREPEAT = "s"
export const USAMPLER = "y"
export const U_SKYBOX = "z"
export const U_VIEWDIRECTIONPROJECTIONINVERSE = "x"
export const VCOLOR = "l"
export const VDEPTH = "r"
export const VTEXCOORD = "u"
export const V_POSITION = "p"

export const vertex_shader_glsl = `#version 300 es
layout(location=0)in vec3 o;layout(location=1)in vec3 i;layout(location=2)in vec2 e;layout(location=3)in float n;uniform mat4 t,v;uniform vec4 c,a;out vec4 l;out vec2 u;out float r;vec3 m=vec3(-1,2,1);void main(){vec4 g=vec4(o,1.);gl_Position=t*g;vec3 d=normalize(mat3(v)*i),h=normalize(m);float P=max(dot(h,d),0.);vec3 w=length(a)>0.?a.xyz:c.xyz*.3f+P*c.xyz*.8;u=e;r=n;l=vec4(w,c.w);}`

export const fragment_shader_glsl = `#version 300 es
precision highp float;in vec4 l;in vec2 u;in float r;uniform vec2 s;out vec4 f;uniform mediump sampler2DArray y;void main(){if(r<0.)f=l;else f=texture(y,vec3(u*s,r))*l;}`

export const skybox_fragment_glsl = `#version 300 es
precision highp float;uniform samplerCube z;uniform mat4 x;in vec4 p;out vec4 f;void main(){vec4 D=x*p;f=texture(z,normalize(D.xyz/D.w));}`

export const skybox_vertex_glsl = `#version 300 es
layout(location=0)in vec4 o;out vec4 p;void main(){p=o,gl_Position=o,gl_Position.z=1.;}`

