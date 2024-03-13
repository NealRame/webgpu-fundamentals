import {
    RenderApp,
} from "../../app"

import shader from "./shader.wgsl?raw"

const uniformBufferSize =
    4*4 + // color:  vec4f
    2*4 + // scale:  vec2f
    2*4   // offset: vec2f

const kColorOffset  = 0
const kScaleOffset  = 4
const kOffsetOffset = 6

export default class extends RenderApp {
    static title_ = "Triangle shaders with uniforms."

    private pipeline_: GPURenderPipeline
    private uniformBuffer_: GPUBuffer
    private bindGroup_: GPUBindGroup

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "Triangle shaders with uniforms",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "triangle with uniforms - pipeline",
            layout: "auto",
            vertex: {
                module,
                entryPoint: "vertex_main",
            },
            fragment: {
                module,
                entryPoint: "fragment_main",
                targets: [{
                    format: this.textureFormat,
                }],
            },
        })

        this.uniformBuffer_ = device.createBuffer({
            label: "uniform buffer",
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.bindGroup_ = device.createBindGroup({
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.uniformBuffer_,
                },
            }],
        })
    }

    public render_() {
        const encoder = this.device.createCommandEncoder({
            label: "triangle with uniforms - encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "triangle with uniforms - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        const aspect = this.canvas.width/this.canvas.height
        const uniformValues = new Float32Array(uniformBufferSize/4)

        uniformValues.set([0.25, 0.88, 0.92, 1], kColorOffset)
        uniformValues.set([-0.25, 0.25], kOffsetOffset)
        uniformValues.set([1/aspect, 1], kScaleOffset)

        this.device.queue.writeBuffer(this.uniformBuffer_, 0, uniformValues.buffer)

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(3)
        pass.end()

        return [encoder.finish()]
    }
}
