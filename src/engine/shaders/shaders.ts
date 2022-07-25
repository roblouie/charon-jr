export const COLOR = "s"
export const EMISSIVE = "f"
export const MODELVIEWPROJECTION = "t"
export const NORMALMATRIX = "r"
export const TEXTUREREPEAT = "u"
export const USAMPLER = "y"
export const U_SKYBOX = "p"
export const U_VIEWDIRECTIONPROJECTIONINVERSE = "g"

export const vertex_shader_glsl = `#version 300 es
layout(location=0)in vec3 o;layout(location=1)in vec3 i;layout(location=2)in vec2 e;layout(location=3)in float n;uniform mat4 t;out vec2 v;out float c;out vec3 a;void main(){vec4 h=vec4(o,1.);gl_Position=t*h;v=e;c=n;a=i;}`

export const fragment_shader_glsl = `#version 300 es
precision highp float;in vec4 l;in vec2 v;in float c;in vec3 a;in vec4 m;uniform vec2 u;uniform mat4 r;uniform vec4 s,f;uniform mediump sampler2DArray y;out vec4 z;vec3 x=vec3(-1,2,1);void main(){vec3 P=normalize(mat3(r)*a),w=normalize(x);float D=max(dot(w,P),0.);vec3 C=length(f)>0.?f.xyz:s.xyz*.4f+D*s.xyz*.7;vec4 l=vec4(C,s.w);if(c<0.)z=l;else z=texture(y,vec3(v*u,c))*l;}`

export const skybox_fragment_glsl = `#version 300 es
precision highp float;uniform samplerCube p;uniform mat4 g;in vec4 d;out vec4 z;void main(){vec4 A=g*d;z=texture(p,A.xyz);}`

export const skybox_vertex_glsl = `#version 300 es
layout(location=0)in vec4 o;out vec4 d;void main(){d=o,gl_Position=o,gl_Position.z=1.;}`
