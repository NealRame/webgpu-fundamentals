struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
) -> VertexShaderOutput {
    let pos = array(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
    );
    let color = array(
        vec4f(1, 1, 0, 1),
        vec4f(0, 1, 1, 1),
        vec4f(1, 0, 1, 1),
    );

    return VertexShaderOutput(
        vec4f(pos[vertex_index], 0.0, 1.0),
        color[vertex_index],
    );
}

@fragment
fn fragment_shader(
    fs_input: VertexShaderOutput,
) -> @location(0) vec4f {
    return fs_input.color;
}
