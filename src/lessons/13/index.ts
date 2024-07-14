import type {
    TColorRGB,
} from "../../types"

import {
    randRGB,
    CatppuccinMocha,
} from "../../colors"

import {
    rand,
    times,
} from "../../utils"

import {
    RenderApp,
} from "../render"

import shaderSource from "./shader.wgsl?raw"


type TCircleConfig = {
    radius: number
    innerRadius: number
    numSubdivision: number
    startAngle: number
    endAngle: number
}

const CircleConfigDefault: TCircleConfig = {
    radius: 1,
    innerRadius: 0,
    startAngle: 0,
    endAngle: 2*Math.PI,
    numSubdivision: 24,
}

type TShapeData = {
    vertexData: ArrayBuffer
    vertexCount: number
}

function createCircleVertices(
    options: Partial<TCircleConfig> = {},
): TShapeData {
    const {
        endAngle,
        innerRadius,
        numSubdivision,
        radius,
        startAngle,
    } =  { ...CircleConfigDefault, ...options }

    const angle = (endAngle - startAngle)/numSubdivision
    const vertexCount = 2*3*numSubdivision
    const vertexData = new ArrayBuffer((2 + 1)*vertexCount*4)

    const positionData = new Float32Array(vertexData)
    let positionOffset = 0

    const colorData = new Uint8Array(vertexData)
    let colorOffset = 8

    const addVertex = (
        x: number, y: number,
        r: number, g: number, b: number
    ) => {
        positionData[positionOffset++] = x
        positionData[positionOffset++] = y
        positionOffset += 1                 // skip color

        colorData[colorOffset++] = r*255
        colorData[colorOffset++] = g*255
        colorData[colorOffset++] = b*255
        colorOffset += 9                    // skip extra byte and the position
    }

    const innerColor: TColorRGB = [1.0, 1.0, 1.0]
    const outerColor: TColorRGB= [0.1, 0.1, 0.1]

    for (let i = 0; i < numSubdivision; ++i) {
        const angle1 = startAngle + (i + 0)*angle
        const angle2 = startAngle + (i + 1)*angle

        const c1 = Math.cos(angle1)
        const s1 = Math.sin(angle1)
        const c2 = Math.cos(angle2)
        const s2 = Math.sin(angle2)

        // first triangle
        addVertex(c1*radius, s1*radius, ...outerColor)
        addVertex(c2*radius, s2*radius, ...outerColor)
        addVertex(c1*innerRadius, s1*innerRadius, ...innerColor)
        addVertex(c1*innerRadius, s1*innerRadius, ...innerColor)
        addVertex(c2*radius, s2*radius, ...outerColor)
        addVertex(c2*innerRadius, s2*innerRadius, ...innerColor)
    }

    return {
        vertexCount,
        vertexData,
    }
}


const Title = "2D donuts shaders with vertex buffer."
const Description = "Draw several 2D donuts using vertex buffer."

const Params1Size = 3*4 // 1 uint32 + 2 float
const Params2Size = 2*4 // 2 float

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
                    arrayStride: 3*4,
                    attributes: [{
                        shaderLocation: 0, // position
                        offset: 0,
                        format: "float32x2",
                    }, {
                        shaderLocation: 4, // vertexColor
                        offset: 8,
                        format: "unorm8x4",
                    }],
                    stepMode: "vertex",
                }, {
                    arrayStride: 3*4,
                    attributes: [{
                        shaderLocation: 1, // color
                        offset: 0,
                        format: "unorm8x4"
                    }, {
                        shaderLocation: 2, // offset
                        offset: 4,
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

        const params1Data = new ArrayBuffer(ObjectCount*Params1Size)
        const params1ColorView = new Uint8Array(params1Data)
        const params1OffsetView = new Float32Array(params1Data)
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
            numSubdivision: 8,
            innerRadius: .75,
        })
        const vertexBuffer = device.createBuffer({
            label: "vertex buffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })

        this.objectInfos_ = times(i => {
            const colorOffset = i*Params1Size
            const offsetOffset = i*Params1Size/4 + 1

            params1ColorView.set(randRGB().map(c => 255*c), colorOffset)
            params1OffsetView.set(times(() => 2*rand() - 1, 2), offsetOffset)

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
