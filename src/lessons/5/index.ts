import {
    RenderApp,
} from "../../app"

import {
    randomColor, randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"

const uniformBufferSize =
    4*4 + // color:  vec4f
    2*4 + // scale:  vec2f
    2*4   // offset: vec2f

const kColorOffset  = 0
const kScaleOffset  = 4
const kOffsetOffset = 6

const kNumObjects = 10

type TObjectInfo = {
    scale: number,
    values: Float32Array,
    buffer: GPUBuffer,
    bindGroup: GPUBindGroup,
}

export default class extends RenderApp {
    static title_ = "Triangle shaders with uniforms."

    private pipeline_: GPURenderPipeline
    private objectInfos_: Array<TObjectInfo> = []

    // private uniformBuffer_: GPUBuffer
    // private bindGroup_: GPUBindGroup


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
            const values = new Float32Array(uniformBufferSize/4)
            const buffer = device.createBuffer({
                label: `object ${i} buffer`,
                size: uniformBufferSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })
            const bindGroup = device.createBindGroup({
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [{
                    binding: 0,
                    resource: {
                        buffer,
                    },
                }],
            })
            const color = randomColor()
            const scale = randomFloat(0.2, 0.6)
            const offset = [randomFloat(-.9, .9), randomFloat(-.9, .9)]

            values.set(color, kColorOffset)
            values.set(offset, kOffsetOffset)
            this.objectInfos_.push({
                scale,
                values,
                buffer,
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
            values,
            buffer,
            bindGroup,
        }) => {
            values.set([scale/aspect, scale], kScaleOffset)
            this.device.queue.writeBuffer(buffer, 0, values)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        })
        pass.end()
        return [encoder.finish()]
    }
}
