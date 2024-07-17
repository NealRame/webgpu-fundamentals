import {
    CatppuccinMocha,
} from "../../colors"

import {
    choice,
} from "../../decorators"

import {
    RenderApp,
} from "../render"

import shaderSource from "./shader.wgsl?raw"

const Title = "Use texture."
const Description = "Fill a quad with a texture."

const TextureWidth = 5
const TextureHeight = 7
const TextureData = ((_, y, b) => {
    return new Uint8Array([
        _, _, _, _, _,
        _, y, _, _, _,
        _, y, _, _, _,
        _, y, y, _, _,
        _, y, _, _, _,
        _, y, y, y, _,
        b, _, _, _, _,
    ].flat().map(v => v*255))
})(
    CatppuccinMocha.red,
    CatppuccinMocha.yellow,
    CatppuccinMocha.blue,
)


export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    @choice({
        label: "address mode U",
        values: ["repeat", "clamp-to-edge"],
    })
    private addressModeU_ = "repeat"

    @choice({
        label: "address mode V",
        values: ["repeat", "clamp-to-edge"],
    })
    private addressModeV_ = "repeat"

    @choice({
        label: "mag filter",
        values: ["nearest", "linear"],
    })
    private magFilter_ = "nearest"

    private pipeline_: GPURenderPipeline
    private texture_: GPUTexture

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: Title,
            code: shaderSource
        })

        this.pipeline_ = device.createRenderPipeline({
            label: Title,
            layout: "auto",
            vertex: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "vertex_shader",
                module,
            },
            fragment: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{
                    format: this.textureFormat
                }]
            }
        })
        this.texture_ = device.createTexture({
            label: "Our texture",
            size: [TextureWidth, TextureHeight],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })
        device.queue.writeTexture(
            { texture: this.texture_ },
            TextureData,
            { bytesPerRow: 4*TextureWidth },
            { width: TextureWidth, height: TextureHeight},
        )
    }

    protected render_(): GPUCommandBuffer[] {
        const encoder = this.device.createCommandEncoder({
            label: Title,
        })
        const sampler = this.device.createSampler({
            addressModeU: this.addressModeU_ as GPUAddressMode,
            addressModeV: this.addressModeV_ as GPUAddressMode,
            magFilter: this.magFilter_ as GPUFilterMode,
        })
        const bindGroup = this.device.createBindGroup({
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0, resource: sampler,
            }, {
                binding: 1, resource: this.texture_.createView(),
            }],
        })
        const pass = encoder.beginRenderPass({
            label: Title,
            colorAttachments: [{
                clearValue: CatppuccinMocha.base,
                loadOp: "clear",
                storeOp: "store",
                view: this.context.getCurrentTexture().createView(),
            }]
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }
}
