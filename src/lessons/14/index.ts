import {
    RenderApp,
} from "../../app"

import shader from "./shader.wgsl?raw"


const kTextureWidth = 5
const kTextureHeight = 7

const _ = [255,   0,   0, 255] // red
const b = [  0,   0, 255, 255] // blue
const y = [255, 255,   0, 255] // yellow

const kTextureData = new Uint8Array([
    _, _, _, _, _,
    _, y, _, _, _,
    _, y, _, _, _,
    _, y, y, _, _,
    _, y, _, _, _,
    _, y, y, y, _,
    b, _, _, _, _,
].flat())

export default class extends RenderApp {
    static title_ = "Texture #1."

    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "Quad shaders",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "quad - pipeline",
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

        const texture = device.createTexture({
            size: [kTextureWidth, kTextureHeight],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        this.device.queue.writeTexture(
            { texture },
            kTextureData,
            { bytesPerRow: 4*kTextureWidth },
            { width: kTextureWidth, height: kTextureHeight },
        )

        const sampler = device.createSampler()

        this.bindGroup_ = device.createBindGroup({
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: sampler,
            }, {
                binding: 1,
                resource: texture.createView(),
            }],
        })
    }

    public render_() {
        // const aspect = this.canvas.width/this.canvas.height

        const encoder = this.device.createCommandEncoder({
            label: "Quad - encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "Quad - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(6)
        pass.end()
        return [encoder.finish()]
    }
}
