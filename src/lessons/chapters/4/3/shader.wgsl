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

struct VsOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
};

@group(0) @binding(0) var<storage, read> params1_array: array<Params1>;
@group(0) @binding(1) var<storage, read> params2_array: array<Params2>;
@group(0) @binding(2) var<storage, read> vertex_array: array<Vertex>;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
    @builtin(instance_index) instance_index: u32,
) -> VsOutput {
    let params1 = params1_array[instance_index];
    let params2 = params2_array[instance_index];
    let pos = vertex_array[vertex_index].position;

    return VsOutput(
        vec4f(params1.offset + pos*params2.scale, 0.0, 1.0),
        vec4f(params1.color),
    );
}

@fragment
fn fragment_shader(
    vsOutput: VsOutput,
) -> @location(0) vec4f {
    return vsOutput.color;
}
