struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) tex_coord: vec2f,
}

@vertex
fn vertex_main(
    @builtin(vertex_index) vertex_index: u32,
) -> VertexShaderOutput {
    let positions = array(
        // 1st triangle
        vec2f(0, 0),
        vec2f(0, 1),
        vec2f(1, 0),
        // 2nd triangle
        vec2f(1, 1),
        vec2f(1, 0),
        vec2f(0, 1),
    );
    let xy = positions[vertex_index];
    return VertexShaderOutput(
        vec4f(xy, 0, 1),
        xy,
    );
}

@group(0) @binding(0) var our_sampler: sampler;
@group(0) @binding(1) var our_texture: texture_2d<f32>;

@fragment
fn fragment_main(
    input: VertexShaderOutput,
) -> @location(0) vec4f {
    return textureSample(our_texture, our_sampler, input.tex_coord);
}
