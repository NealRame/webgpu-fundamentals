struct Attributes {
    color: vec4f,
    offset: vec2f,
};

@group(0) @binding(0) var<uniform> u_attributes: Attributes;
@group(0) @binding(1) var<uniform> u_scale: vec2f;

@vertex
fn vertex_main(
    @builtin(vertex_index) vertex_index: u32,
) -> @builtin(position) vec4<f32> {
    let pos = array<vec2f, 3>(
        vec2f(0.0, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5),
    );
    return vec4<f32>(
        pos[vertex_index]*u_scale + u_attributes.offset, 0, 1
    );
}

@fragment
fn fragment_main() -> @location(0) vec4f {
    return u_attributes.color;
}
