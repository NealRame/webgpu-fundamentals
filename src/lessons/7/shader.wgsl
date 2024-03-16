struct Attributes {
    color: vec4f,
    offset: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<storage, read> u_attributes: array<Attributes>;
@group(0) @binding(1) var<storage, read> u_scale: array<vec2f>;

@vertex
fn vertex_main(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    let pos = array<vec2f, 3>(
        vec2f(0.0, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5),
    );
    let attributes = u_attributes[instance_index];
    let scale = u_scale[instance_index];

    return VSOutput(
        vec4f(pos[vertex_index]*scale + attributes.offset, 0, 1),
        attributes.color
    );
}

@fragment
fn fragment_main(
    input: VSOutput,
) -> @location(0) vec4f {
    return input.color;
}
