import {
    mat4,
    vec3,
    ReadonlyVec3,
} from "gl-matrix"

import {
    CatppuccinMocha,
    cssColor,
} from "../../../../colors"

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

import {
    times,
} from "../../../../utils"

import shaderSource from "./shader.wgsl?raw"


const Title = "mipmapFilter."
const Description = "Playing with the magFilter sampler."

const TextureWidth = 16
const TextureHeight = 16
const TextureSize = {
    width: TextureWidth,
    height: TextureHeight,
} as const

const TextureBitmap = pixelmapToBitmap({
    data: [
        "w", "r", "r", "r", "r", "r", "r", "a", "a", "r", "r", "r", "r", "r", "r", "w",
        "w", "w", "r", "r", "r", "r", "r", "a", "a", "r", "r", "r", "r", "r", "w", "w",
        "w", "w", "w", "r", "r", "r", "r", "a", "a", "r", "r", "r", "r", "w", "w", "w",
        "w", "w", "w", "w", "r", "r", "r", "a", "a", "r", "r", "r", "w", "w", "w", "w",
        "w", "w", "w", "w", "w", "r", "r", "a", "a", "r", "r", "w", "w", "w", "w", "w",
        "w", "w", "w", "w", "w", "w", "r", "a", "a", "r", "w", "w", "w", "w", "w", "w",
        "w", "w", "w", "w", "w", "w", "w", "a", "a", "w", "w", "w", "w", "w", "w", "w",
        "b", "b", "b", "b", "b", "b", "b", "b", "a", "y", "y", "y", "y", "y", "y", "y",
        "b", "b", "b", "b", "b", "b", "b", "g", "y", "y", "y", "y", "y", "y", "y", "y",
        "w", "w", "w", "w", "w", "w", "w", "g", "g", "w", "w", "w", "w", "w", "w", "w",
        "w", "w", "w", "w", "w", "w", "r", "g", "g", "r", "w", "w", "w", "w", "w", "w",
        "w", "w", "w", "w", "w", "r", "r", "g", "g", "r", "r", "w", "w", "w", "w", "w",
        "w", "w", "w", "w", "r", "r", "r", "g", "g", "r", "r", "r", "w", "w", "w", "w",
        "w", "w", "w", "r", "r", "r", "r", "g", "g", "r", "r", "r", "r", "w", "w", "w",
        "w", "w", "r", "r", "r", "r", "r", "g", "g", "r", "r", "r", "r", "r", "w", "w",
        "w", "r", "r", "r", "r", "r", "r", "g", "g", "r", "r", "r", "r", "r", "r", "w",
    ],
    size: TextureSize
}, {
    w: CatppuccinMocha.text,
    r: CatppuccinMocha.red,
    b: CatppuccinMocha.blue,
    y: CatppuccinMocha.yellow,
    g: CatppuccinMocha.green,
    a: CatppuccinMocha.sapphire,
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

function createBlendedMipmap(): Array<TBitmapData> {
    const mips = [TextureBitmap]
    let mip = TextureBitmap

    while (mip.size.width > 1 || mip.size.height > 1) {
        mip = createNextMipLevelRGBA8Unorm(mip)
        mips.push(mip)
    }
    return mips
}

function createCheckedMipmap(): Array<TBitmapData> {
    const level = [
        { size: 64, color: cssColor(CatppuccinMocha.mauve)  },
        { size: 32, color: cssColor(CatppuccinMocha.green)  },
        { size: 16, color: cssColor(CatppuccinMocha.red)    },
        { size:  8, color: cssColor(CatppuccinMocha.yellow) },
        { size:  4, color: cssColor(CatppuccinMocha.blue)   },
        { size:  2, color: cssColor(CatppuccinMocha.sky)    },
        { size:  1, color: cssColor(CatppuccinMocha.pink)   },
    ]

    return level.map(({size, color}, i) => {
        const canvas = new OffscreenCanvas(size, size)
        const context = canvas.getContext("2d")!

        context.fillStyle = i & 1 ? "#000" : "#fff"
        context.fillRect(0, 0, size, size)
        context.fillStyle = color
        context.fillRect(0, 0, size/2, size/2)
        context.fillRect(size/2, size/2, size/2, size/2)
        return {
            data: context?.getImageData(0, 0, size, size).data,
            size: {
                width: size,
                height: size,
            }
        }
    })
}


function createTextureWithMips(
    device: GPUDevice,
    mips: Array<TBitmapData>,
    label: string,
): GPUTexture {
    const texture = device.createTexture({
        label,
        size: [mips[0].size.width, mips[0].size.height],
        mipLevelCount: mips.length,
        format: "rgba8unorm",
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    })

    mips.forEach(({ data, size}, mipLevel) => {
        device.queue.writeTexture(
            { texture, mipLevel },
            data,
            { bytesPerRow: 4*size.width },
            size,
        )
    })

    return texture
}

const ParamsSize = 64
const ParamsOffset = {
    matrix: 0,
}

type TObjectInfo = {
    bindGroups: Array<GPUBindGroup>
    matrix: Float32Array
    paramsValues: Float32Array
    paramsBuffer: GPUBuffer
}

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private objectInfos_: Array<TObjectInfo>

    private textures_: [GPUTexture, GPUTexture]

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

        this.textures_ = [
            createTextureWithMips(device, createBlendedMipmap(), "blended"),
            createTextureWithMips(device, createCheckedMipmap(), "checker"),
        ]

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
                targets: [{ format: this.textureFormat }],
            }
        })

        this.objectInfos_ = times(i => {
            const sampler = device.createSampler({
                addressModeU: "repeat",
                addressModeV: "repeat",
                magFilter: i & 1 ? "linear" : "nearest",
                minFilter: i & 2 ? "linear" : "nearest",
                mipmapFilter: i & 4 ? "linear" : "nearest",
            })

            const paramsBuffer = device.createBuffer({
                label: `params for quad ${i}`,
                size: ParamsSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })
            const paramsValues = new Float32Array(ParamsSize/4)

            const matrix = paramsValues.subarray(ParamsOffset.matrix, 16)

            const bindGroups = this.textures_.map(texture => {
                return device.createBindGroup({
                    label: `bind group for quad ${i}`,
                    layout: this.pipeline_.getBindGroupLayout(0),
                    entries: [{
                        binding: 0,
                        resource: sampler,
                    }, {
                        binding: 1,
                        resource: texture.createView(),
                    }, {
                        binding: 2,
                        resource: { buffer: paramsBuffer },
                    }]
                })
            })

            return {
                bindGroups,
                matrix,
                paramsValues,
                paramsBuffer,
            }
        }, 8)
    }

    protected render_(): Array<GPUCommandBuffer> {
        const fov = 60*Math.PI/180
        const aspect = this.canvas.clientWidth/this.canvas.clientHeight
        const zNear = 1
        const zFar = 2000

        const projectionMatrix = mat4.create()
        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar)

        const cameraPosition = vec3.fromValues(0, 0, 2)
        const up = vec3.fromValues(0, 1, 0)
        const target = vec3.fromValues(0, 0, 0)

        const cameraMatrix = mat4.create()
        mat4.lookAt(cameraMatrix, cameraPosition, target, up)

        const viewMatrix = mat4.create()
        mat4.invert(viewMatrix, cameraMatrix)

        const viewProjectionMatrix = mat4.create()
        mat4.multiply(viewProjectionMatrix, projectionMatrix, viewMatrix)

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

        let texNdx = 0

        this.objectInfos_.forEach(({
            bindGroups,
            matrix,
            paramsBuffer,
            paramsValues,
        }, i) => {
            const bindGroup = bindGroups[texNdx]

            const xSpacing = 1.2
            const ySpacing = 0.7
            const zDepth = 50

            const x = i%4 - 1.5
            const y = i<4 ? 1 : -1

            mat4.translate(
                matrix,
                projectionMatrix,
                vec3.fromValues(x*xSpacing, y*ySpacing, -zDepth*0.5)
            )
            mat4.rotateX(matrix, matrix, 0.5*Math.PI)
            mat4.scale(
                matrix,
                matrix,
                vec3.fromValues(1, 2*zDepth, 1),
            )
            mat4.translate(
                matrix,
                matrix,
                vec3.fromValues(-0.5, -0.5, 0),
            )

            this.device.queue.writeBuffer(paramsBuffer, 0, paramsValues)

            pass.setBindGroup(0, bindGroup)
            pass.draw(6)
        })

        pass.end()

        return [encoder.finish()]
    }
}
