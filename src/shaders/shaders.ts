export const COLOR = "s"
export const EMISSIVE = "y"
export const ISSKYBOX = "c"
export const MODELVIEWPROJECTION = "t"
export const NORMALMATRIX = "f"
export const TEXTUREREPEAT = "r"
export const USAMPLER = "x"
export const U_SKYBOX = "z"
export const U_VIEWDIRECTIONPROJECTIONINVERSE = "p"

export const vertex_shader_glsl = `#version 300 es
layout(location=0)in vec3 o;layout(location=1)in vec3 i;layout(location=2)in vec2 e;layout(location=3)in float n;uniform mat4 t;uniform bool c;out vec2 v;out float l;out vec3 a;out vec4 m;void main(){vec4 P=vec4(o,1.);gl_Position=t*P;if(c)gl_Position=P,m=P,gl_Position.z=1.;v=e;l=n;a=i;}`

export const fragment_shader_glsl = `#version 300 es
precision highp float;in vec4 u;in vec2 v;in float l;in vec3 a;in vec4 m;uniform vec2 r;uniform mat4 f;uniform vec4 s,y;uniform bool c;uniform samplerCube z;uniform mediump sampler2DArray x;uniform mat4 p;out vec4 g;vec3 d=vec3(-1,2,1);void main(){vec3 h=normalize(mat3(f)*a),b=normalize(d);float w=max(dot(b,h),0.);vec3 D=length(y)>0.?y.xyz:s.xyz*.3f+w*s.xyz*.8;vec4 u=vec4(D,s.w);if(c){vec4 C=p*m;g=texture(z,normalize(C.xyz/C.w));}else if(l<0.)g=u;else g=texture(x,vec3(v*r,l))*u;}`
