#version 300 es

layout(location = 0) in vec3 aCoords;
layout(location = 1) in vec3 aNormal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in float aDepth;
layout(location = 4) in mat4 aPerInstanceMatrix;
layout(location = 8) in mat4 aPerInstanceNormalMatrix;

uniform mat4 viewProjection;

out vec2 vTexCoord;
out float vDepth;
out vec3 vNormal;
out mat4 vNormalMatrix;

void main() {
    vec4 coords = vec4(aCoords, 1.0);
    gl_Position = viewProjection * aPerInstanceMatrix * coords;

    vTexCoord = aTexCoord;
    vDepth = aDepth;
    vNormal = aNormal;
    vNormalMatrix = aPerInstanceNormalMatrix;
}
