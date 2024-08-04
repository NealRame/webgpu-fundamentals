struct Vertex {
    @location(0) position: vec2f,
    @location(1) color: vec4f,
    @location(2) offset: vec2f,
    @location(3) scale: vec2f,
};

struct VsOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_shader(
    vertex: Vertex,
) -> VsOutput {
    let pos = vertex.position;
    let color = vertex.color;
    let offset = vertex.offset;
    let scale = vertex.scale;

    return VsOutput(
        vec4f(offset + pos*scale, 0.0, 1.0),
        vec4f(color),
    );
}

@fragment
fn fragment_shader(
    vsOutput: VsOutput,
) -> @location(0) vec4f {
    return vsOutput.color;
}
