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

const Title = "Multiple triangle shaders with uniforms."
const Description = "Draw multiple triangles, color, scale and offset are passed using Uniforms."

const UniformBuffer_Size =
        4*4 //  color is 4 32 bits floats
    +   2*4 // offset is 2 32 bits floats
    +   2*4 //  scale is 2 32 bits floats

const UniformBuffer_ColorOffset = 0
const UniformBuffer_OffsetOffset = 4
const UniformBuffer_ScaleOffset = 6

const ObjectCount = 100

type TObjectInfo = {
    scale: number
    uniformBuffer: GPUBuffer
    uniformValues: Float32Array
    bindGroup: GPUBindGroup
}

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline
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

        this.objectInfos_ = times(i => {
            const scale = rand(0.2, 0.5)
            const uniformValues = new Float32Array(UniformBuffer_Size/4)
            const uniformBuffer = device.createBuffer({
                label: `uniforms for object: ${i}`,
                size: UniformBuffer_Size,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            })
            const color = randRGB()
            const offsetPos = times(() => 2*rand() - 1, 2)

            uniformValues.set(color, UniformBuffer_ColorOffset)
            uniformValues.set(offsetPos, UniformBuffer_OffsetOffset)

            const bindGroup = device.createBindGroup({
                label: `bind group for object: ${i}`,
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: uniformBuffer }},
                ]
            })

            return {
                bindGroup,
                scale,
                uniformValues,
                uniformBuffer,
            }
        }, ObjectCount)
    }

    protected render_(): GPUCommandBuffer[] {
        const aspect = this.canvas.width/this.canvas.height
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

        for (const {
            bindGroup,
            scale,
            uniformBuffer,
            uniformValues
        } of this.objectInfos_) {
            uniformValues.set([scale/aspect, scale], UniformBuffer_ScaleOffset)
            this.device.queue.writeBuffer(uniformBuffer, 0, uniformValues)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        }

        pass.end()

        return [encoder.finish()]
    }
}
