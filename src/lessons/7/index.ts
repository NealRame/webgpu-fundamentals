import {
    RenderApp,
} from "../../app"

import {
    randomColor, randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"

const kNumObjects = 32

const kAttributesUnitSize =
    4*4 + // color:  vec4f
    2*4 + // offset: vec2f
    2*4   // padding
const kAttributesStorageSize = kNumObjects*kAttributesUnitSize
const kAttributesColorOffset = 0
const kAttributesOffsetOffset = 4

const kScaleUnitSize =
    2*4 // scale:  vec2f
const kScaleOffset = 0
const kScalesStorageSize = kNumObjects*kScaleUnitSize

type TObjectInfo = {
    scale: number,
}

export default class extends RenderApp {
    static title_ = "Triangle shaders with storage buffers."

    private pipeline_: GPURenderPipeline
    
    private scaleValues_: Float32Array
    private scaleBuffer_: GPUBuffer
    private bindGroup_: GPUBindGroup
    
    private objectInfos_: Array<TObjectInfo> = []

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

        const attributesValues = new Float32Array(kAttributesStorageSize/4)
        const attributesBuffer = device.createBuffer({
            label: `attributes storage buffer`,
            size: kAttributesStorageSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })

        for (let i = 0; i < kNumObjects; ++i) {
            const storageOffset = i*(kAttributesUnitSize/4)

            const color = randomColor()
            const offset = [randomFloat(-.9, .9), randomFloat(-.9, .9)]

            attributesValues.set(color, storageOffset + kAttributesColorOffset)
            attributesValues.set(offset, storageOffset + kAttributesOffsetOffset)

            const scale = randomFloat(0.2, 0.6)

            this.objectInfos_.push({
                scale,
            })
        }

        this.device.queue.writeBuffer(attributesBuffer, 0, attributesValues)

        this.scaleValues_ = new Float32Array(kScalesStorageSize/4)
        this.scaleBuffer_ = device.createBuffer({
            label: "object scale storage buffer",
            size: kScalesStorageSize,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        this.bindGroup_ = device.createBindGroup({
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: attributesBuffer,
                },
            }, {
                binding: 1,
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
        this.objectInfos_.forEach(({ scale }, i) => {
            const storageOffset = i*(kScaleUnitSize/4)
            this.scaleValues_.set([scale/aspect, scale], storageOffset + kScaleOffset)
        })

        this.device.queue.writeBuffer(this.scaleBuffer_, 0, this.scaleValues_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(3, kNumObjects)

        pass.end()
        return [encoder.finish()]
    }
}
