struct Vertex {
    @location(0) position: vec2f,
    @location(1) offset: vec2f,
    @location(2) color: vec4f,
    @location(3) scale: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4f,
};

@vertex
fn vertex_main(
    input: Vertex,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    return VSOutput(
        vec4f(input.position*input.scale + input.offset, 0, 1),
        input.color,
    );
}

@fragment
fn fragment_main(
    input: VSOutput,
) -> @location(0) vec4f {
    return input.color;
}
