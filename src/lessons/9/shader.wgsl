struct Params1 {
    color: vec4f,
    offset: vec2f,
};

struct Params2 {
    scale: vec2f,
};

struct Vertex {
    position: vec2f,
};

struct VSOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<storage, read> params1_array: array<Params1>;
@group(0) @binding(1) var<storage, read> params2_array: array<Params2>;
@group(0) @binding(2) var<storage, read> vertices: array<Vertex>;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VSOutput {
    let vertex = vertices[vertex_index];
    let params1 = params1_array[instance_index];
    let params2 = params2_array[instance_index];

    return VSOutput(
        vec4f(vertex.position*params2.scale + params1.offset, 0, 1),
        params1.color,
    );
}

@fragment
fn fragment_shader(vs_out: VSOutput) -> @location(0) vec4f {
    return vs_out.color;
}
