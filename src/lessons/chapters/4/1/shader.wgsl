struct Params1 {
    color: vec4f,
    offset: vec2f,
};

struct Params2 {
    scale: vec2f,
};

@group(0) @binding(0) var<storage, read> params1: Params1;
@group(0) @binding(1) var<storage, read> params2: Params2;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
    );

    return vec4f(pos[vertex_index]*params2.scale + params1.offset, 0.0, 1.0);
}

@fragment
fn fragment_shader() -> @location(0) vec4f {
    return params1.color;
}
