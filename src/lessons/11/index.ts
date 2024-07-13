import {
    randRGB,
    CatppuccinMocha,
} from "../../colors"

import {
    createCircleVertices,
} from "../../geometry"

import {
    rand,
    times,
} from "../../utils"

import {
    RenderApp,
} from "../render"

import shaderSource from "./shader.wgsl?raw"

const Title = "2D donuts shaders with vertex buffer."
const Description = "Draw several 2D donuts using vertex buffer."

const Params1Size = 4*4 + 2*4
const Params1Offset = {
    color: 0,
    offset: 4,
} as const

const Params2Size = 8

const ObjectCount = 4

type TObjectInfo = {
    scale: number
}


export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private params1Buffer_: GPUBuffer

    private params2Data_: ArrayBuffer
    private params2Buffer_: GPUBuffer

    private vertexCount_: number
    private vertexBuffer_: GPUBuffer

    private objectInfos_: Array<TObjectInfo>

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: Title,
            code: shaderSource,
        })

        this.pipeline_ = device.createRenderPipeline({
            label: Title,
            layout: "auto",
            vertex: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "vertex_shader",
                module,
                buffers: [{
                    arrayStride: 2*4, // two 32 bits float
                    attributes: [{
                        shaderLocation: 0, // position
                        offset: 0,
                        format: "float32x2",
                    }],
                    stepMode: "vertex",
                }, {
                    arrayStride: 6*4,
                    attributes: [{
                        shaderLocation: 1, // color
                        offset: 0,
                        format: "float32x4"
                    }, {
                        shaderLocation: 2, // offset
                        offset: 16,
                        format: "float32x2"
                    }],
                    stepMode: "instance",
                }, {
                    arrayStride: 2*4,
                    attributes: [{
                        shaderLocation: 3, // scale
                        offset: 0,
                        format: "float32x2",
                    }],
                    stepMode: "instance",
                }],
            },
            fragment: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{
                    format: this.textureFormat,
                }],
            },
        })

        const params1Data = new ArrayBuffer(Params1Size*ObjectCount)
        const params1View = new Float32Array(params1Data)
        const params1Buffer = device.createBuffer({
            label: "vertex buffer for color and offset values",
            size: params1Data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        const params2Data = new ArrayBuffer(Params2Size*ObjectCount)
        const params2Buffer = device.createBuffer({
            label: "vertex buffer for scale values",
            size: params2Data.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        const { vertexCount, vertexData } = createCircleVertices({
            numSubdivision: 64,
            innerRadius: .75,
        })
        const vertexBuffer = device.createBuffer({
            label: "vertex buffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        this.objectInfos_ = times(i => {
            const color = randRGB()
            const offsetPos = times(() => 2*rand() - 1, 2)

            const params1Offset = i*(Params1Size/4)
            params1View.set(color, params1Offset + Params1Offset.color)
            params1View.set(offsetPos, params1Offset + Params1Offset.offset)

            return {
                scale: rand(0.2, 0.5),
            }
        }, ObjectCount)

        this.params1Buffer_ = params1Buffer
        this.params2Data_ = params2Data
        this.params2Buffer_ = params2Buffer
        this.vertexBuffer_  =vertexBuffer
        this.vertexCount_ = vertexCount

        device.queue.writeBuffer(params1Buffer, 0, params1Data)
        device.queue.writeBuffer(vertexBuffer, 0, vertexData)
    }

    protected render_(): GPUCommandBuffer[] {
        const aspect = this.canvas.width/this.canvas.height
        const params2View = new Float32Array(this.params2Data_)

        this.objectInfos_.forEach(({ scale }, i) => {
            const params2Offset = i*(Params2Size/4)
            params2View.set([scale/aspect, scale], params2Offset)
        })
        this.device.queue.writeBuffer(this.params2Buffer_, 0, this.params2Data_)

        const encoder = this.device.createCommandEncoder({
            label: Title,
        })
        const pass = encoder.beginRenderPass({
            label: Title,
            colorAttachments: [{
                clearValue: CatppuccinMocha.base,
                loadOp: "clear",
                storeOp: "store",
                view: this.context.getCurrentTexture().createView(),
            }],
        })

        pass.setPipeline(this.pipeline_)
        pass.setVertexBuffer(0, this.vertexBuffer_)
        pass.setVertexBuffer(1, this.params1Buffer_)
        pass.setVertexBuffer(2, this.params2Buffer_)
        pass.draw(this.vertexCount_, ObjectCount)
        pass.end()

        return [encoder.finish()]
    }
}
