/**
 * This example demonstrates that builtin variables are not the same in the
 * vertex and fragment shaders.
 * So using a builtin in inter-stage var may not work as expected.
 */

struct VertexShaderOutput {
    @builtin(position) position: vec4f,
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
    return VertexShaderOutput(
        vec4<f32>(pos[vertex_index], 0, 1),
    );
}

@fragment
fn fragment_main(
    input: VertexShaderOutput,
) -> @location(0) vec4f {
    let white = vec4f(1, .75, .125, 1.0);
    let black = vec4f(0.12, 0.15, 0.2, 1.0);

    let grid = vec2u(input.position.xy)/32;
    let checker = (grid.x + grid.y)%2 == 1;

    return select(white, black, checker);
}
