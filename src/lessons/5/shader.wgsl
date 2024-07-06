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
    let s: f32 = 1;
    let h: f32 = sqrt((3*s*s)/4);
    let pos = array(
        vec2f(s/2, 0), // top center
        vec2f(  0, h), // bottom left
        vec2f(  s, h), // bottom right
    );
    return vec4f(pos[vertex_index]*params.scale + params.offset, 0, 1);
    // return vec4f(pos[vertex_index], 0, 1);
}

@fragment
fn fragment_shader() -> @location(0) vec4f {
    return params.color;
}
