import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    choice,
    range,
} from "../../../../decorators"

import {
    pixelmapToBitmap,
} from "../../../../pixelmap"

import {
    RenderApp,
} from "../../../../renderapp"

import type {
    TColorRGBA,
    TSize,
    TBitmapData,
} from "../../../../types"

import shaderSource from "./shader.wgsl?raw"


const Title = "minFilter."
const Description = "Playing with the magFilter sampler."

const TextureWidth = 5
const TextureHeight = 7
const TextureSize = {
    width: TextureWidth,
    height: TextureHeight,
} as const

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
    size: TextureSize
}, {
    _: CatppuccinMocha.red,
    b: CatppuccinMocha.blue,
    y: CatppuccinMocha.yellow
})


const SampleFilters = ["linear", "nearest"] as const
type TSampleFilter = typeof SampleFilters[number]

function SampleFilter(
    sampleFilter: TSampleFilter,
): TSampleFilter {
    return sampleFilter
}


const UVAddressModes = ["repeat", "clamp-to-edge"] as const
type TUVAddressMode = typeof UVAddressModes[number]

function UVAddressMode(
    addressMode: TUVAddressMode,
): TUVAddressMode {
    return addressMode
}


const ParamsSize = 16
const ParamsOffset = {
    offset: 0,
    scale: 8,
}


function lerp(a: number, b: number, t: number): number {
    return a + (b - a)*t
}

function mixColor(a: TColorRGBA, b: TColorRGBA, t: number): TColorRGBA {
    return [
        lerp(a[0], b[0], t),
        lerp(a[1], b[1], t),
        lerp(a[2], b[2], t),
        lerp(a[3], b[3], t),
    ] as TColorRGBA
}

function bilinearFilter(
    topLeft: TColorRGBA,
    topRight: TColorRGBA,
    bottomLeft: TColorRGBA,
    bottomRight: TColorRGBA,
    u: number,
    v: number,
): TColorRGBA {
    const top = mixColor(topLeft, topRight, u)
    const bottom = mixColor(bottomLeft, bottomRight, u)
    const mix = mixColor(top, bottom, v)

    return mix
}


function createNextMipLevelRGBA8Unorm({
    data: src,
    size: { width: srcWidth, height: srcHeight },
}: TBitmapData): TBitmapData {
    const dstWidth = Math.max(1, srcWidth/2 | 0)
    const dstHeight = Math.max(1, srcHeight/2 | 0)
    const dst = new Uint8Array(dstWidth*dstHeight*4)

    const getPixel = (x: number, y: number) => {
        const offset = 4*(y*srcWidth + x)
        return [
            src[offset],
            src[offset + 1],
            src[offset + 2],
            src[offset + 3],
        ] as TColorRGBA
    }

    for (let y = 0; y < dstHeight; ++y) {
        for (let x = 0; x < dstWidth; ++x) {
            const dstU = (x + 0.5)/dstWidth
            const dstV = (y + 0.5)/dstHeight

            const srcU = (dstU*srcWidth - 0.5)
            const srcV = (dstV*srcHeight - 0.5)

            const tx = srcU | 0
            const ty = srcV | 0

            const t1 = srcU % 1
            const t2 = srcV % 1

            const tl = getPixel(tx, ty)
            const tr = getPixel(tx + 1, ty)
            const bl = getPixel(tx, ty + 1)
            const br = getPixel(tx + 1, ty + 1)

            const dstOffset = 4*(y*dstWidth + x)

            dst.set(bilinearFilter(tl, tr, bl, br, t1, t2), dstOffset)
        }
    }

    return {
        data: dst,
        size: {
            width: dstWidth,
            height: dstHeight,
        },
    }
}

function generateMips(mip: TBitmapData): Array<TBitmapData> {
    const mips = [mip]

    while (mip.size.width > 1 || mip.size.height > 1) {
        mip = createNextMipLevelRGBA8Unorm(mip)
        mips.push(mip)
    }
    return mips
}


export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private texture_: GPUTexture

    @choice({
        label: "Mag Filter",
        values: SampleFilters,
    })
    private magFilter_ = SampleFilter("linear")

    @choice({
        label: "Min Filter",
        values: SampleFilters,
    })
    private minFilter_ = SampleFilter("linear")

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

    @range({
        label: "Res downscale",
        min: 0,
        max: 8,
        step: 1,
    })
    private resolutionDownscale_ = 6

    @range({
        label: "Scale",
        min: 1,
        max: 16,
        step: 1,
    })
    private scale_ = 4

    private paramsBuffer_: GPUBuffer

    private offset_: [number, number] = [0, 0]


    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: `${Title} - shader`,
            code: shaderSource,
        })

        const mips = generateMips(TextureBitmap)

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
            label: "yellow F on red",
            size: [TextureWidth, TextureHeight],
            mipLevelCount: mips.length,
            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        })

        mips.forEach(({ data, size }, mipLevel) => {
            device.queue.writeTexture(
                { texture: this.texture_, mipLevel },
                data,
                { bytesPerRow: 4*size.width },
                size,
            )
        })

        this.paramsBuffer_ = device.createBuffer({
            label: "Params buffer",
            size: ParamsSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        })
    }

    protected render_(): Array<GPUCommandBuffer> {
        const paramsData = new ArrayBuffer(ParamsSize)
        const paramsDataView = new Float32Array(paramsData)

        paramsDataView.set(this.offset_, ParamsOffset.offset/4)
        paramsDataView.set([
            this.scale_/this.canvas.width,
            this.scale_/this.canvas.height,
        ], ParamsOffset.scale/4)

        this.device.queue.writeBuffer(this.paramsBuffer_, 0, paramsData)

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
            magFilter: this.magFilter_,
            minFilter: this.minFilter_,
        })
        const bindGroup = this.device.createBindGroup({
            label: "binding group 0",
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sampler },
                { binding: 1, resource: this.texture_.createView() },
                { binding: 2, resource: { buffer: this.paramsBuffer_ }},
            ],
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, bindGroup)
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }

    public resize(size: TSize): TSize {
        const k = (2**this.resolutionDownscale_)
        return {
            width: size.width/k | 0,
            height: size.height/k | 0,
        }
    }

    public update(time: number): void {
        this.offset_ = [
            Math.sin(time*0.00025)*0.8,
            -.8,
        ]
    }
}
