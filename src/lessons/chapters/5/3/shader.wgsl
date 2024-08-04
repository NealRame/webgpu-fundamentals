struct VsInput {
    @location(0) vertex_position: vec2f,
    @location(1) instance_color: vec4f,
    @location(2) instance_offset: vec2f,
    @location(3) instance_scale: vec2f,
    @location(4) vertex_color: vec4f, // attributes in WSGL does not have to match attributes in JS
};

struct VsOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_shader(
    vertex: VsInput,
) -> VsOutput {
    let vertex_position = vertex.vertex_position;
    let vertex_color = vertex.vertex_color;

    let instance_color = vertex.instance_color;
    let instance_offset = vertex.instance_offset;
    let instance_scale = vertex.instance_scale;

    let color = instance_color*vertex_color;

    return VsOutput(
        vec4f(instance_offset + vertex_position*instance_scale, 0.0, 1.0),
        vec4f(color),
    );
}

@fragment
fn fragment_shader(
    vsOutput: VsOutput,
) -> @location(0) vec4f {
    return vsOutput.color;
}
