import {
    RenderApp,
} from "../render"

import {
    createCircleVertices,
    randomColor,
    randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"


const kObjectCount = 8

const kSubdivisions = 16

const kVertexUnitSize = 5
const kVertexPositionOffset = 0
const kVertexColorOffset = 2

const kAttributesUnitSize = 6
const kOffsetAttributeOffset = 0
const kColorAttributeOffset = 2

const kScaleUnitSize = 2
const kScaleOffset = 0

export default class extends RenderApp {
    static title_ = "Triangle shaders with vertex buffers multiple instances #2."

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
                    arrayStride: 4*kVertexUnitSize,
                    attributes: [{
                        shaderLocation: 0,
                        offset: 0,
                        format: "float32x2",
                    }, {
                        shaderLocation: 4,
                        offset: 8,
                        format: "float32x3",
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
        })
        const vertexValues = new Float32Array(kVertexUnitSize*vertexData.length)
        for (let i = 0; i < verticeCount; ++i) {
            const pos = vertexData.slice(2*i, 2*i + 2)
            const rgb = randomColor().slice(0, 3)
            const offset = kVertexUnitSize*i
            vertexValues.set(pos, offset + kVertexPositionOffset)
            vertexValues.set(rgb, offset + kVertexColorOffset)
        }

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
            size: vertexValues.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.vertexCount_ = verticeCount
        this.device.queue.writeBuffer(this.vertexBuffer_, 0, vertexValues)

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
