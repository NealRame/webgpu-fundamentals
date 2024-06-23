@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32
) -> @builtin(position) vec4f {
    let pos = array(
        vec2f(-1,  1), // top left corner
        vec2f( 1,  1), // top right corner
        vec2f(-1, -1), // bottom left corner
        vec2f(-1, -1), // bottom left corner
        vec2f( 1,  1), // top right corner
        vec2f( 1, -1), // bottom right 
    );

    return vec4f(pos[vertex_index], 0.0, 1.0);
}

@fragment
fn fragment_shader(
    @builtin(position) position: vec4f,
) -> @location(0) vec4f {
    let white = vec4f(0.54, 0.71, 0.98, 1); // rgb(137, 180, 250)
    let black = vec4f(0, 0, 0, 1);

    let grid = vec2u(position.xy)/128;
    let checker = (grid.x + grid.y)%2 == 1;

    return select(white, black, checker);
}
