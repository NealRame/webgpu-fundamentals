struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32
) -> VertexShaderOutput {
    let pos = array(
        vec2f( 0.0,  0.5), // top center
        vec2f(-0.5, -0.5), // bottom left
        vec2f( 0.5, -0.5), // bottom right
    );
    let color = array(
        vec4f(0.95, 0.55, 0.66, 1), // rgb(243, 139, 168)
        vec4f(0.65, 0.89, 0.63, 1), // rgb(166, 227, 161)
        vec4f(0.54, 0.71, 0.98, 1), // rgb(137, 180, 250)
    );
    return VertexShaderOutput(
        vec4f(pos[vertex_index], 0.0, 1.0),
        color[vertex_index],
    );
}

@fragment
fn fragment_shader(
    @location(0) color: vec4f,
) -> @location(0) vec4f {
    return color;
}
