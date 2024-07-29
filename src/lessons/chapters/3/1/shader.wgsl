struct Params {
    color: vec4f,
    scale: vec2f,
    offset: vec2f,
};

@group(0) @binding(0) var<uniform> params: Params;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
    );

    return vec4f(pos[vertex_index]*params.scale + params.offset, 0.0, 1.0);
}

@fragment
fn fragment_shader() -> @location(0) vec4f {
    return params.color;
}
