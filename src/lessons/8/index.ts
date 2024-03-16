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

const kSubdivisions = 64

const kAttributesUniformSize =
    4*4 + // color:  vec4f
    2*4 + // offset: vec2f
    2*4   // padding
const kColorAttributeOffset  = 0
const kOffsetAttributeOffset = 4

const kScaleUniformSize = 2*4 // scale:  vec2f

export default class extends RenderApp {
    static title_ = "Triangle shaders with storage buffers."

    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    private scale_: number
    private scaleValues_: Float32Array
    private scaleBuffer_: GPUBuffer

    private vertexCount_: number

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

        const vertexStorageBuffer = device.createBuffer({
            label: "vertex buffer",
            size: vertexData.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        this.vertexCount_ = verticeCount
        this.device.queue.writeBuffer(vertexStorageBuffer, 0, vertexData)

        const attributesValues = new Float32Array(kAttributesUniformSize/4)
        const color = randomColor()
        const offset = [randomFloat(-.5, .5), randomFloat(-.5, .5)]
        attributesValues.set(color, kColorAttributeOffset)
        attributesValues.set(offset, kOffsetAttributeOffset)

        const attributesBuffer = device.createBuffer({
            label: `attributes uniform buffer`,
            size: kAttributesUniformSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })
        this.device.queue.writeBuffer(attributesBuffer, 0, attributesValues)

        this.scale_ = randomFloat(0.2, 0.6)
        this.scaleValues_ = new Float32Array(kScaleUniformSize/4)
        this.scaleBuffer_ = device.createBuffer({
            label: "object scale storage buffer",
            size: kScaleUniformSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.bindGroup_ = device.createBindGroup({
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: vertexStorageBuffer,
                },
            }, {
                binding: 1,
                resource: {
                    buffer: attributesBuffer,
                },
            }, {
                binding: 2,
                resource: {
                    buffer: this.scaleBuffer_,
                },
            }],
        })
    }

    public render_() {
        const aspect = this.canvas.width/this.canvas.height
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

        this.scaleValues_.set([this.scale_/aspect, this.scale_])
        this.device.queue.writeBuffer(this.scaleBuffer_, 0, this.scaleValues_)

        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(this.vertexCount_, 1)
        pass.end()
        return [encoder.finish()]
    }
}
