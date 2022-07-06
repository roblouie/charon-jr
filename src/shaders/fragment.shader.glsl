#version 300 es

precision highp float;

in vec4 v_color;

in vec2 vTexCoord;
in float vDepth;
out vec4 outColor;

uniform mediump sampler2DArray uSampler;

void main() {
    outColor = texture(uSampler, vec3(vTexCoord, vDepth));
}
