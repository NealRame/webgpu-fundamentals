import {
    RenderApp,
} from "../../app"

import {
    randomColor,
    randomFloat,
} from "../../utils"

import shader from "./shader.wgsl?raw"

const kUniformBufferSize_0 =
    4*4 + // color:  vec4f
    2*4 + // offset: vec2f
    2*4   // padding

const kUniformBufferSize_1 =
    2*4   // scale:  vec2f

const kUniformBufferSizes = [
    kUniformBufferSize_0,
    kUniformBufferSize_1,
]

const kColorOffset  = 0
const kOffsetOffset = 4

const kScaleOffset  = 0

const kNumObjects = 20

type ObjectInfo = {
    scale: number,
    bindGroup: GPUBindGroup,
    uniforms: Array<[GPUBuffer, Float32Array]>
}

export default class extends RenderApp {
    static title_ = "Triangle shaders with several uniforms."

    private pipeline_: GPURenderPipeline
    private objectsInfo: Array<ObjectInfo>

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "triangle with several uniforms - shader",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "triangle with several uniforms - pipeline",
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

        this.objectsInfo = []
        for (let i = 0; i < kNumObjects; ++i) {
            const uniforms = kUniformBufferSizes.map(size => {
                const uniformValues = new Float32Array(size/4)
                const uniformBuffer = device.createBuffer({
                    label: `triangle with several uniforms - uniform buffer #${i}`,
                    size: uniformValues.byteLength,
                    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
                })
                return [uniformBuffer, uniformValues] as [GPUBuffer, Float32Array]
            })

            const bindGroup = device.createBindGroup({
                label: `triangle with several uniforms - bind group #${i}`,
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: uniforms.map(([buffer, ], binding) => ({
                    binding,
                    resource: {
                        buffer,
                    },
                }))
            })

            const [colorAndOffsetBuffer, colorAndOffsetValue] = uniforms[0]

            colorAndOffsetValue.set(randomColor(), kColorOffset)
            colorAndOffsetValue.set([
                randomFloat(-.9, .9),
                randomFloat(-.9, .9),
            ], kOffsetOffset)
            this.device.queue.writeBuffer(colorAndOffsetBuffer, 0, colorAndOffsetValue)
            this.objectsInfo.push({
                uniforms,
                bindGroup,
                scale: [randomFloat(-.6, -.1), randomFloat(0.1, 0.6)][
                    Math.random() > 0.5 ? 0 : 1
                ],
            })
        }
    }

    public render_() {
        const aspect = this.canvas.width/this.canvas.height
        const encoder = this.device.createCommandEncoder({
            label: "triangle with several uniforms - encoder",
        })

        const pass = encoder.beginRenderPass({
            label: "triangle with several uniforms - render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        pass.setPipeline(this.pipeline_)
        this.objectsInfo.forEach(info => {
            const [scaleUniform, scaleValue] = info.uniforms[1]
            scaleValue.set([
                info.scale/aspect,
                info.scale
            ], kScaleOffset)
            this.device.queue.writeBuffer(scaleUniform, 0, scaleValue)

            pass.setBindGroup(0, info.bindGroup)
            pass.draw(3)
        })
        pass.end()

        return [encoder.finish()]
    }
}
