#version 300 es

layout(location = 0) in vec3 a_coords;
layout(location = 1) in vec3 a_normal;

uniform mat4 modelviewProjection;

uniform mat4 normalMatrix;
uniform vec4 color;
out vec4 v_color;

vec3 light_direction = vec3(-3, 3, 1);

void main() {
    vec4 coords = vec4(a_coords, 1.0);
    gl_Position = modelviewProjection * coords;
    
    vec3 correctedVertexNormals = normalize(mat3(normalMatrix) * a_normal);
    vec3 normalizedLightPosition = normalize(light_direction);
    float dotOfLightToVertexNormal = dot(normalizedLightPosition, correctedVertexNormals);
    float ambientLight = 0.1f;
    
    vec3 litColor = (dotOfLightToVertexNormal + ambientLight) * color.rgb;
        
    v_color = vec4(litColor, color.a);
}
