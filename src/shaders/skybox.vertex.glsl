#version 300 es

layout(location = 0) in vec4 a_coords;
out vec4 v_position;

void main() {
    v_position = a_coords;
    gl_Position = a_coords;
    gl_Position.z = 1.0;
}
