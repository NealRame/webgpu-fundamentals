import {
    RenderApp,
} from "../../app"

import {
    randomColor, randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"


function createCircleVertices({
    outerRadius = 1.0,
    innerRadius = 0.5,
    subdivisions = 32,
    startAngle = 0,
    endAngle = 2*Math.PI,
}) {
    const verticeCount = subdivisions*2*3
    const vertexData = new Float32Array(verticeCount*2)
    const angle = endAngle - startAngle

    let vertexDataOffset = 0
    const addVertex = (x: number, y: number) => {
        vertexData[vertexDataOffset++] = x
        vertexData[vertexDataOffset++] = y
    }

    for (let i = 0; i < subdivisions; ++i) {
        const angle0 = startAngle + (i + 0)*(angle/subdivisions)
        const angle1 = startAngle + (i + 1)*(angle/subdivisions)

        const c0 = Math.cos(angle0)
        const s0 = Math.sin(angle0)
        const c1 = Math.cos(angle1)
        const s1 = Math.sin(angle1)

        const xA = c0*innerRadius, yA = s0*innerRadius
        const xB = c0*outerRadius, yB = s0*outerRadius
        const xC = c1*outerRadius, yC = s1*outerRadius
        const xD = c1*innerRadius, yD = s1*innerRadius

        addVertex(xA, yA)
        addVertex(xB, yB)
        addVertex(xC, yC)

        addVertex(xA, yA)
        addVertex(xC, yC)
        addVertex(xD, yD)
    }

    return {
        vertexData,
        verticeCount
    }
}

const kObjectCount = 4

const kSubdivisions = 64

const kAttributesUnitSize = 6
const kOffsetAttributeOffset = 0
const kColorAttributeOffset  = 2

const kScaleUnitSize = 2
const kScaleOffset = 0

export default class extends RenderApp {
    static title_ = "Triangle shaders with vertex buffers multiple instances."

    private pipeline_: GPURenderPipeline

    private vertexCount_: number
    private vertexBuffer_: GPUBuffer

    private attributesBuffer_: GPUBuffer

    private scaleValues_: Float32Array
    private scalesBuffer_: GPUBuffer


    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "Triangle shaders",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "triangle - pipeline",
            layout: "auto",
            vertex: {
                module,
                entryPoint: "vertex_main",
                buffers: [{
                    arrayStride: 2*4,
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x2",
                    }],
                    stepMode: "vertex",
                }, {
                    arrayStride: 4*kAttributesUnitSize,
                    attributes: [{
                        shaderLocation: 1,
                        offset: 0,
                        format: "float32x2",
                    }, {
                        shaderLocation: 2,
                        offset: 8,
                        format: "float32x4",
                    }],
                    stepMode: "instance",
                }, {
                    arrayStride: 4*kScaleUnitSize,
                    stepMode: "instance",
                    attributes: [{
                        shaderLocation: 3,
                        offset: 0,
                        format: "float32x2",
                    }],
                }],
            },
            fragment: {
                module,
                entryPoint: "fragment_main",
                targets: [{
                    format: this.textureFormat,
                }],
            },
        })

        const { vertexData, verticeCount } = createCircleVertices({
            subdivisions: kSubdivisions,
            startAngle: Math.PI/6,
            endAngle: 2*Math.PI - Math.PI/6,
        })

        const attributesValues = new Float32Array(kObjectCount*kAttributesUnitSize)
        for (let i = 0; i < kObjectCount; ++i) {
            const color = randomColor()
            const offset = [randomFloat(-.5, .5), randomFloat(-.5, .5)]
            attributesValues.set(color, kAttributesUnitSize*i + kColorAttributeOffset)
            attributesValues.set(offset, kAttributesUnitSize*i + kOffsetAttributeOffset)
        }

        this.scaleValues_ = new Float32Array(kObjectCount)
        for (let i = 0; i < kObjectCount; ++i) {
            this.scaleValues_[i] = randomFloat(0.2, 0.6)
        }

        this.vertexBuffer_ = device.createBuffer({
            label: "vertex buffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.vertexCount_ = verticeCount
        this.device.queue.writeBuffer(this.vertexBuffer_, 0, vertexData)

        this.attributesBuffer_ = device.createBuffer({
            label: "attributes buffer",
            size: attributesValues.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.attributesBuffer_, 0, attributesValues)

        this.scalesBuffer_ = device.createBuffer({
            label: "scales buffer",
            size: 2*this.scaleValues_.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
    }

    public render_() {
        const aspect = this.canvas.width/this.canvas.height

        const scalesValue = new Float32Array(kObjectCount*kScaleUnitSize)
        for (let i = 0; i < kObjectCount; ++i) {
            const scale = this.scaleValues_[i]
            scalesValue.set([scale/aspect, scale], i*kScaleUnitSize + kScaleOffset)
        }

        const encoder = this.device.createCommandEncoder({
            label: "triangle - encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "triangle - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        pass.setPipeline(this.pipeline_)
        this.device.queue.writeBuffer(this.scalesBuffer_, 0, scalesValue)

        pass.setVertexBuffer(0, this.vertexBuffer_)
        pass.setVertexBuffer(1, this.attributesBuffer_)
        pass.setVertexBuffer(2, this.scalesBuffer_)
        pass.draw(this.vertexCount_, kObjectCount)
        pass.end()
        return [encoder.finish()]
    }
}
