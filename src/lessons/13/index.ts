import {
    RenderApp,
} from "../../app"

import {
    createCircleVerticesWithIndex,
    randomColor,
    randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"


const kObjectCount = 1

const kSubdivisions = 64

const kVertexPositionUnitSize = 2
const kVertexColorUnitSize = 4

const kAttributesUnitSize = 6
const kOffsetAttributeOffset = 0
const kColorAttributeOffset = 2

const kScaleUnitSize = 2
const kScaleOffset = 0

export default class extends RenderApp {
    static title_ = "Triangle shaders with vertex buffers and index buffer."

    private pipeline_: GPURenderPipeline

    private vertexCount_: number
    private vertexPositionBuffer_: GPUBuffer
    private vertexIndexBuffer_: GPUBuffer
    private vertexColorBuffer_: GPUBuffer

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
                    arrayStride: 4*kVertexPositionUnitSize,
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
                },],
            },
            fragment: {
                module,
                entryPoint: "fragment_main",
                targets: [{
                    format: this.textureFormat,
                }],
            },
        })

        const {
            vertexData: vertexPositions,
            indexData: vertexIndices,
            verticeCount,
         } = createCircleVerticesWithIndex({
            subdivisions: kSubdivisions,
        })

        const vertexColors = new Uint8Array(verticeCount*kVertexColorUnitSize)
        for (let i = 0; i < verticeCount; ++i) {
            vertexColors.set([
                randomFloat(0, 1)*255,
                randomFloat(0, 1)*255,
                randomFloat(0, 1)*255,
                255
            ], kVertexColorUnitSize*i)
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

        this.vertexPositionBuffer_ = device.createBuffer({
            label: "vertex position buffer",
            size: vertexPositions.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.vertexPositionBuffer_, 0, vertexPositions)
        this.vertexIndexBuffer_ = device.createBuffer({
            label: "vertex index buffer",
            size: vertexIndices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.vertexIndexBuffer_, 0, vertexIndices)
        this.vertexColorBuffer_ = device.createBuffer({
            label: "vertex color buffer",
            size: vertexColors.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(this.vertexColorBuffer_, 0, vertexColors)
        this.vertexCount_ = verticeCount

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

        pass.setVertexBuffer(0, this.vertexPositionBuffer_)
        pass.setVertexBuffer(1, this.attributesBuffer_)
        pass.setVertexBuffer(2, this.scalesBuffer_)
        pass.setIndexBuffer(this.vertexIndexBuffer_, "uint32")
        pass.drawIndexed(this.vertexCount_, kObjectCount)
        // pass.draw(this.vertexCount_, kObjectCount)
        pass.end()
        return [encoder.finish()]
    }
}
