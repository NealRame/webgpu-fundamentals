struct Params {
    color: vec4f,
    offset: vec2f,
    scale: vec2f,
};

@group(0) @binding(0) var<uniform> params: Params;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.5), // top center
        vec2f(-0.5, -0.5), // bottom left
        vec2f( 0.5, -0.5), // bottom right
    );
    return vec4f(pos[vertex_index]*params.scale + params.offset, 0, 1);
    // return vec4f(pos[vertex_index], 0, 1);
}

@fragment
fn fragment_shader() -> @location(0) vec4f {
    return params.color;
}

