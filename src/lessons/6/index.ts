import {
    RenderApp,
} from "../render"

import {
    randomColor, randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"

const attributesUniformBufferSize =
    4*4 + // color:  vec4f
    2*4 + // offset: vec2f
    2*4   // padding

const kColorOffset  = 0
const kOffsetOffset = 4

const scaleAttributesBufferSize =
    2*4 // scale:  vec2f

const kScaleOffset  = 0

const kNumObjects = 10

type TObjectInfo = {
    scale: number,
    scaleValues: Float32Array,
    scaleBuffer: GPUBuffer,

    bindGroup: GPUBindGroup,
}

export default class extends RenderApp {
    static title_ = "Triangle shaders with uniforms."

    private pipeline_: GPURenderPipeline
    private objectInfos_: Array<TObjectInfo> = []

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "Triangle shaders with uniforms",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "triangle with uniforms - pipeline",
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

        for (let i = 0; i < kNumObjects; ++i) {
            const attributesValues = new Float32Array(attributesUniformBufferSize/4)
            const attributesBuffer = device.createBuffer({
                label: `object ${i} attributes buffer`,
                size: attributesUniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })

            const color = randomColor()
            const offset = [randomFloat(-.9, .9), randomFloat(-.9, .9)]

            attributesValues.set(color, kColorOffset)
            attributesValues.set(offset, kOffsetOffset)

            this.device.queue.writeBuffer(attributesBuffer, 0, attributesValues)

            const scale = randomFloat(0.2, 0.6)
            const scaleValues = new Float32Array(scaleAttributesBufferSize/4)
            const scaleBuffer = device.createBuffer({
                label: `object ${i} scale buffer`,
                size: scaleAttributesBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })

            const bindGroup = device.createBindGroup({
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [{
                    binding: 0,
                    resource: {
                        buffer: attributesBuffer,
                    },
                }, {
                    binding: 1,
                    resource: {
                        buffer: scaleBuffer,
                    },
                }],
            })

            this.objectInfos_.push({
                scale,
                scaleValues: scaleValues,
                scaleBuffer: scaleBuffer,
                bindGroup,
            })
        }
    }

    public render_() {
        const aspect = this.canvas.width/this.canvas.height
        const encoder = this.device.createCommandEncoder({
            label: "triangle with uniforms - encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "triangle with uniforms - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        pass.setPipeline(this.pipeline_)
        this.objectInfos_.forEach(({
            scale,
            scaleValues,
            scaleBuffer,
            bindGroup,
        }) => {
            scaleValues.set([scale/aspect, scale], kScaleOffset)
            this.device.queue.writeBuffer(scaleBuffer, 0, scaleValues)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        })
        pass.end()
        return [encoder.finish()]
    }
}
