struct MyStruct {
    @builtin(position) position: vec4f,
};

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
) -> MyStruct {
    let pos = array(
        vec2f(-1,  1),
        vec2f( 1,  1),
        vec2f(-1, -1),

        vec2f( 1,  1),
        vec2f( 1, -1),
        vec2f(-1, -1),
    );

    var vs_output: MyStruct;

    vs_output.position = vec4f(pos[vertex_index], 0.0, 1.0);
    return vs_output;
}

@fragment
fn fragment_shader(
    fs_input: MyStruct,
) -> @location(0) vec4f {
    let black = vec4f(0, 0, 0, 1);
    let white = vec4f(1, 1, 1, 1);
    let grid = vec2u(fs_input.position.xy)/64;

    return select(black, white, (grid.x + grid.y)%2 == 1);
}
