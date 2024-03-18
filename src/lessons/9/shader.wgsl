struct Attributes {
    color: vec4f,
    offset: vec2f,
};

struct Vertex {
    @location(0) position: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> u_attributes: Attributes;
@group(0) @binding(1) var<uniform> u_scale: vec2f;

@vertex
fn vertex_main(
    vertex: Vertex,
    @builtin(instance_index) instance_index: u32,
) -> @builtin(position) vec4<f32> {
    return vec4f(vertex.position*u_scale + u_attributes.offset, 0, 1);
}

@fragment
fn fragment_main() -> @location(0) vec4f {
    return u_attributes.color;
}
