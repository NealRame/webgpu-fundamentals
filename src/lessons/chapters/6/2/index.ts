import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    choice,
} from "../../../../decorators"

import {
    pixelmapToBitmap,
} from "../../../../pixelmap"

import {
    RenderApp,
} from "../../../../renderapp"
import { TSize } from "../../../../types"

import shaderSource from "./shader.wgsl?raw"


const Title = "magFilter."
const Description = "Playing with the magFilter sampler."

const TextureWidth = 5
const TextureHeight = 7
const TextureSize: TSize = {
    width: TextureWidth,
    height: TextureHeight,
}
const TextureBitmap = pixelmapToBitmap({
    data: [
        "_", "_", "_", "_", "_",
        "_", "y", "_", "_", "_",
        "_", "y", "_", "_", "_",
        "_", "y", "y", "_", "_",
        "_", "y", "_", "_", "_",
        "_", "y", "y", "y", "_",
        "b", "_", "_", "_", "_",
    ],
    size: TextureSize,
}, {
    _: CatppuccinMocha.red,
    b: CatppuccinMocha.blue,
    y: CatppuccinMocha.yellow
})

const MagFilters = ["linear", "nearest"] as const
type TMagFilters = typeof MagFilters[number]

function MagFilter(
    magFilter: TMagFilters,
): TMagFilters {
    return magFilter
}


const UVAddressModes = ["repeat", "clamp-to-edge"] as const
type TUVAddressModes = typeof UVAddressModes[number]

function UVAddressMode(
    addressMode: TUVAddressModes,
): TUVAddressModes {
    return addressMode
}

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private texture_: GPUTexture

    @choice({
        label: "magFilter",
        values: MagFilters,
    })
    private magFilter_ = MagFilter("linear")

    @choice({
        label: "Address Mode U",
        values: UVAddressModes,
    })
    private addressModeU_ = UVAddressMode("repeat")

    @choice({
        label: "Address Mode V",
        values: UVAddressModes,
    })
    private addressModeV_ = UVAddressMode("repeat")

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

        this.texture_ = device.createTexture({
            label: "our texture",
            size: [TextureWidth, TextureHeight],
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })

        device.queue.writeTexture(
            { texture: this.texture_ },
            TextureBitmap.data,
            { bytesPerRow: 4*TextureWidth },
            { width: TextureWidth, height: TextureHeight },
        )
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

        const sampler = this.device.createSampler({
            addressModeU: this.addressModeU_,
            addressModeV: this.addressModeV_,
            magFilter: this.magFilter_
        })
        const bindGroup = this.device.createBindGroup({
            label: "binding group 0",
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: this.texture_.createView() },
            ],
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }
}
