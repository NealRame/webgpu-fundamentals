struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

@vertex
fn vertex_main(
    @builtin(vertex_index) vertex_index: u32,
) -> VertexShaderOutput {
    let pos = array<vec2f, 3>(
        vec2f(0.0, 0.5),
        vec2f(-0.5, -0.5),
        vec2f(0.5, -0.5),
    );
    let color = array<vec4f, 3>(
        vec4f(1.000, 0.500, 0.250, 1),
        vec4f(0.625, 0.375, 0.625, 1),
        vec4f(0.250, 0.500, 1.000, 1),
    );
    return VertexShaderOutput(
        vec4<f32>(pos[vertex_index], 0, 1),
        color[vertex_index],
    );
}

@fragment
fn fragment_main(
    @location(0) color: vec4f,
) -> @location(0) vec4f {
    return color;
}
