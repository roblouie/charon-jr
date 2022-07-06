#version 300 es

precision highp float;

in vec4 v_color;

in vec2 vTexCoord;
in float vDepth;
out vec4 outColor;

uniform mediump sampler2DArray uSampler;

void main() {
    if (vDepth < 0.0) {
        outColor = v_color;
    } else {
        outColor = texture(uSampler, vec3(vTexCoord * vec2(1.0, 1.0), vDepth)) * v_color;
    }
}
