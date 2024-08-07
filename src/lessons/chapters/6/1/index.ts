import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    RenderApp,
} from "../../../../renderapp"

import shaderSource from "./shader.wgsl?raw"


const Title = "WebGPU Textures."
const Description = "Fill a quad with a harcoded texture."

const TextureWidth = 5
const TextureHeight = 7
const TextureData = ((_, b, y) => new Uint8Array([
    _, _, _, _, _,
    _, y, _, _, _,
    _, y, _, _, _,
    _, y, y, _, _,
    _, y, _, _, _,
    _, y, y, y, _,
    b, _, _, _, _,
].flat().map(c => Math.floor(255*c))))(
    CatppuccinMocha.red,
    CatppuccinMocha.blue,
    CatppuccinMocha.yellow,
)

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: `${Title} - shader`,
            code: shaderSource,
        })

        this.pipeline_ = device.createRenderPipeline({
            label: `${Title} - pipeline`,
            layout: "auto",
            vertex: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "vertex_shader",
                module,
            },
            fragment: {
                // entryPoint can be omitted if there is only one fragment_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{ format: this.textureFormat }]
            }
        })

        const sampler = device.createSampler()
        const texture = device.createTexture({
            label: "our texture",
            size: [TextureWidth, TextureHeight],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        device.queue.writeTexture(
            { texture },
            TextureData,
            { bytesPerRow: 4*TextureWidth },
            { width: TextureWidth, height: TextureHeight },
        )

        this.bindGroup_ = device.createBindGroup({
            label: "binding group 0",
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: texture.createView() },
            ],
        })
    }

    protected render_(): Array<GPUCommandBuffer> {
        const encoder = this.device.createCommandEncoder({
            label: `${Title} - command encoder`,
        })

        const pass = encoder.beginRenderPass({
            label: `${Title} - render pass`,
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: CatppuccinMocha.base,
                loadOp: "clear",
                storeOp: "store",
            }],
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }
}
