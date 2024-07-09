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

const Title = "Triangle shaders with storage buffers."
const Description = "Draw a triangle, color, scale and offset are passed using storage buffer."

const Params1Size = 32
const Params1Offset = {
    color: 0,
    offset: 4,
} as const

const Params2Size = 8

const ObjectCount = 25

type TObjectInfo = {
    scale: number
    params2Buffer: GPUBuffer
    params2Values: Float32Array
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

            const params1Values = new Float32Array(Params1Size/Float32Array.BYTES_PER_ELEMENT)
            const params1Buffer = device.createBuffer({
                label: `uniforms for object: ${i}`,
                size: Params1Size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            })
            const color = randRGB()
            const offsetPos = times(() => 2*rand() - 1, 2)

            params1Values.set(color, Params1Offset.color)
            params1Values.set(offsetPos, Params1Offset.offset)
            device.queue.writeBuffer(params1Buffer, 0, params1Values)

            const params2Values = new Float32Array(Params2Size/Float32Array.BYTES_PER_ELEMENT)
            const params2Buffer = device.createBuffer({
                label: `uniforms for object: ${i}`,
                size: Params2Size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            })

            const bindGroup = device.createBindGroup({
                label: `bind group for object: ${i}`,
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: { buffer: params1Buffer }},
                    { binding: 1, resource: { buffer: params2Buffer }},
                ]
            })

            return {
                bindGroup,
                scale,
                params2Buffer,
                params2Values,
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
            params2Buffer,
            params2Values,
        } of this.objectInfos_) {
            params2Values.set([scale/aspect, scale], 0)
            this.device.queue.writeBuffer(params2Buffer, 0, params2Values)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        }

        pass.end()

        return [encoder.finish()]
    }
}
