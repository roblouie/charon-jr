#version 300 es

layout(location = 0) in vec3 a_coords;
layout(location = 1) in vec3 a_normal;
layout(location = 2) in vec2 aTexCoord;
layout(location = 3) in float aDepth;

uniform mat4 modelviewProjection;
uniform mat4 normalMatrix;
uniform vec4 color;
uniform vec4 emissive;

out vec4 vColor;
out vec2 vTexCoord;
out float vDepth;

vec3 light_direction = vec3(-1, 2, 1);

void main() {
    vec4 coords = vec4(a_coords, 1.0);
    gl_Position = modelviewProjection * coords;

    vec3 correctedVertexNormals = normalize(mat3(normalMatrix) * a_normal);
    vec3 normalizedLightPosition = normalize(light_direction);
    float litPercent = max(dot(normalizedLightPosition, correctedVertexNormals), 0.0);
    float ambientLight = 0.3f;

    vec3 litColor = length(emissive) > 0.0 ? emissive.rgb : (color.rgb * ambientLight) + (litPercent * color.rgb * 0.8);

    vTexCoord = aTexCoord;
    vDepth = aDepth;

    vColor = vec4(litColor, color.a);
}
