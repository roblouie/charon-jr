#version 300 es

layout(location = 0) in vec4 aCoords;
out vec4 v_position;

void main() {
    v_position = aCoords;
    gl_Position = aCoords;
    gl_Position.z = 1.0;
}
