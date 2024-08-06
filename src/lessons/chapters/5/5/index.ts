import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    RenderApp,
} from "../../../../renderapp"

import {
    rand,
    times,
} from "../../../../utils"

import shaderSource from "./shader.wgsl?raw"

const ShapeCount = 100
const ShapeSubdivisionCount = 4
const ShapeParams1Size = 12
const ShapeParams2Size = 8

type TCircleOptions = {
    innerRadius?: number
    outerRadius?: number
    startAngle?: number
    stopAngle?: number
    subdivisions?: number
}

function createCircleVertices(options: TCircleOptions = {}) {
    const { innerRadius, outerRadius, startAngle, stopAngle } = {
        innerRadius: 0,
        outerRadius: 1,
        startAngle:  0,
        stopAngle:   2*Math.PI,
        ...options
    }

    // First loop will create vertices
    // 0    1    2    3    ...     n - 1    0 : n + 1 subdivisions
    //
    // 0    2    4    6    ...    2n - 2    0
    //
    // 1    3    5    7    ...    2n - 1    1 : 2(n + 1) vertices
    const stepAngle = (stopAngle - startAngle)/ShapeSubdivisionCount

    const vertexSize  = 3*4 // x=4 y=4 rgba=4
    const vertexCount = 2*(ShapeSubdivisionCount + 1)
    const vertexData = new ArrayBuffer(vertexCount*vertexSize)

    const innerColor = [255, 255, 255, 255]
    const outerColor = [ 25,  25,  25, 255]

    for (let i = 0; i < ShapeSubdivisionCount + 1; ++i) {
        const positionOffset = 2*i*vertexSize
        const colorOffset = positionOffset + 8

        const angle = startAngle + i*stepAngle

        const c = Math.cos(angle)
        const s = Math.sin(angle)

        const a = [innerRadius*c, innerRadius*s]
        const b = [outerRadius*c, outerRadius*s]

        ;[
            [a, innerColor],
            [b, outerColor],
        ].forEach(([position, color], j) => {
            ;(new Float32Array( // set vertex position
                vertexData,
                positionOffset + j*vertexSize,
                2,
            )).set(position)

            ;(new Uint8Array(   // set vertex color
                vertexData,
                colorOffset + j*vertexSize,
                4
            )).set(color)
        });
    }

    // Second loop will create the vertex indexes. We have two triangles per
    // subdivision. So we need 6 indexes pers subdivision.
    //
    // 0---2   2   2---4   4   4---6   6 ...
    // |  /   /|   |  /   /|   |  /   /|
    // |/   /  |   |/   /  |   |/   /  |
    // 1   1---3   3   3---5   5   5---7 ...
    //
    // 0: 0 1 2 2 1 3
    // 1: 2 3 4 4 3 5
    // 2: 4 5 6 6 5 7
    const indexData = new Uint32Array(6*ShapeSubdivisionCount)

    for (let i = 0; i < ShapeSubdivisionCount; ++i) {
        const vertexIndex = 2*i
        const indexOffset = 6*i

        indexData.set([
            vertexIndex + 0, vertexIndex + 1, vertexIndex + 2,
            vertexIndex + 2, vertexIndex + 1, vertexIndex + 3,
        ], indexOffset)
    }

    return {
        indexData,
        vertexCount: indexData.length,
        vertexData,
    }
}


const Title = "Index Buffers."
const Description = "Avoid vertex duplication with using an Index Buffer."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private params1Buffer_: GPUBuffer
    private params2Buffer_: GPUBuffer
    private scaleFactors_: Array<number>
    private indexBuffer_: GPUBuffer
    private vertexBuffer_: GPUBuffer
    private vertexCount_: number

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
                buffers: [{
                    arrayStride: 3*4,
                    stepMode: "vertex",
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x2" },
                        { shaderLocation: 4, offset: 8, format: "unorm8x4" },
                    ],
                }, {
                    arrayStride: 4 + 2*4,
                    stepMode: "instance",
                    attributes: [
                        { shaderLocation: 1, offset: 0, format: "unorm8x4" },
                        { shaderLocation: 2, offset: 4, format: "float32x2" },
                    ],
                }, {
                    arrayStride: 2*4,
                    stepMode: "instance",
                    attributes: [
                        { shaderLocation: 3, offset: 0, format: "float32x2" },
                    ],
                }]
            },
            fragment: {
                // entryPoint can be omitted if there is only one fragment_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{ format: this.textureFormat }]
            }
        })

        const params1Data = new ArrayBuffer(ShapeParams1Size*ShapeCount)
        const params1Buffer = device.createBuffer({
            label: "params1 storage buffer",
            size: params1Data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        for (let i = 0; i < ShapeCount; ++i) {
            const colorOffset = i*ShapeParams1Size
            const offsetOffset = i*ShapeParams1Size + 4

            ;(new Uint8Array(params1Data, colorOffset, 4)).set(
                [255*rand(), 255*rand(), 255*rand(), 255]
            )

            ;(new Float32Array(params1Data, offsetOffset, 2)).set(
                [rand(-.9, .9), rand(-.9, .9)],
            )
        }
        device.queue.writeBuffer(params1Buffer, 0, params1Data)

        const scaleFactors = times(() => rand(.05, .2), ShapeCount)
        const params2Buffer = device.createBuffer({
            label: "params2 storage buffer",
            size: ShapeParams2Size*ShapeCount,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })

        const { indexData, vertexCount, vertexData } = createCircleVertices({
            innerRadius: 0.5
        })
        const indexBuffer = device.createBuffer({
            label: "index buffer",
            size: indexData.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        })
        const vertexBuffer = device.createBuffer({
            label: "vertex storage buffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })
        device.queue.writeBuffer(indexBuffer, 0, indexData)
        device.queue.writeBuffer(vertexBuffer, 0, vertexData)

        console.log(indexData.length)

        this.params1Buffer_ = params1Buffer
        this.params2Buffer_ = params2Buffer
        this.scaleFactors_ = scaleFactors
        this.indexBuffer_ = indexBuffer
        this.vertexBuffer_ = vertexBuffer
        this.vertexCount_ = vertexCount
    }

    protected render_(): Array<GPUCommandBuffer> {
        const aspect = this.canvas.width/this.canvas.height
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

        const params2Values = new ArrayBuffer(ShapeParams2Size*ShapeCount)
        const params2ValuesView = new Float32Array(params2Values)

        this.scaleFactors_.forEach((scale, i) => {
            const offset = i*ShapeParams2Size

            params2ValuesView.set([scale/aspect, scale], offset/4)
        })
        this.device.queue.writeBuffer(this.params2Buffer_, 0, params2Values)

        pass.setPipeline(this.pipeline_)

        pass.setVertexBuffer(0, this.vertexBuffer_)
        pass.setVertexBuffer(1, this.params1Buffer_)
        pass.setVertexBuffer(2, this.params2Buffer_)
        pass.setIndexBuffer(this.indexBuffer_, "uint32")

        pass.drawIndexed(this.vertexCount_, ShapeCount)
        pass.end()

        return [encoder.finish()]
    }
}
