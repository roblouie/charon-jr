#version 300 es

precision highp float;

in vec4 vColor;

in vec2 vTexCoord;
in float vDepth;
uniform vec2 textureRepeat;
out vec4 outColor;

uniform mediump sampler2DArray uSampler;

void main() {
    if (vDepth < 0.0) {
        outColor = vColor;
    } else {
        outColor = texture(uSampler, vec3(vTexCoord * textureRepeat, vDepth)) * vColor;
    }
}
