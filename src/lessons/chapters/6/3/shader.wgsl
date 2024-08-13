struct VertexShaderOutput {
    @builtin(position) position: vec4f,
    @location(0) texcoord: vec2f,
};

struct Params {
    offset: vec2f,
    scale: vec2f,
};

@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;
@group(0) @binding(2) var<uniform> params: Params;

@vertex
fn vertex_shader(
    @builtin(vertex_index) vertex_index: u32,
) -> VertexShaderOutput {
    let pos = array(
        // first triangle
        vec2f(0.0, 0.0),
        vec2f(1.0, 0.0),
        vec2f(0.0, 1.0),
        // second triangle
        vec2f(0.0, 1.0),
        vec2f(1.0, 0.0),
        vec2f(1.1, 1.1),
    );
    let xy = pos[vertex_index];

    return VertexShaderOutput(
        vec4f(xy*params.scale + params.offset, 0.0, 1.0),
        xy,
    );
}

@fragment
fn fragment_shader(
    fsInput: VertexShaderOutput,
) -> @location(0) vec4f {
    return textureSample(ourTexture, ourSampler, fsInput.texcoord);
}
