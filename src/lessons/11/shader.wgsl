struct Vertex {
    @location(0) position: vec2f,
    @location(1) color: vec4f,
    @location(2) offset: vec2f,
    @location(3) scale: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@vertex
fn vertex_shader(
    vertex: Vertex,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    return VSOutput(
        vec4f(vertex.position*vertex.scale + vertex.offset, 0, 1),
        vertex.color,
    );
}

@fragment
fn fragment_shader(vs_out: VSOutput) -> @location(0) vec4f {
    return vs_out.color;
}
