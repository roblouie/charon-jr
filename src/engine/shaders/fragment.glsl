#version 300 es

//[
precision highp float;
//]
in vec4 vColor;
in vec2 vTexCoord;
in float vDepth;
in vec3 vNormal;
in mat4 vNormalMatrix;

uniform vec2 textureRepeat;
uniform vec4 color;
uniform vec4 emissive;
uniform mediump sampler2DArray uSampler;

out vec4 outColor;

vec3 light_direction = vec3(-1, 2, 1);

void main() {
    vec3 correctedNormals = normalize(mat3(vNormalMatrix) * vNormal);
    vec3 normalizedLightPosition = normalize(light_direction);
    float litPercent = max(dot(normalizedLightPosition, correctedNormals), 0.0);
    float ambientLight = 0.4f;

    vec3 litColor = length(emissive) > 0.0 ? emissive.rgb : (color.rgb * ambientLight) + (litPercent * color.rgb * 0.7);

    vec4 vColor = vec4(litColor, color.a);

    if (vDepth < 0.0) {
        outColor = vColor;
    } else {
        outColor = texture(uSampler, vec3(vTexCoord * textureRepeat, vDepth)) * vColor;
    }
}
