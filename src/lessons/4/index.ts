import {
    colorRGBA,
} from "../../decorators"

import type {
    TColorRGBA,
} from "../../types"

import {
    RenderApp,
} from "../render"

import shaderSource from "./shader.wgsl?raw"

const Title = "Triangle shaders with uniforms."
const Description = "Draw a triangle, color, scale and offset are passed using Uniforms."

const UniformBuffer_Size = 
        4*4 //  color is 4 32 bits floats
    +   2*4 // offset is 2 32 bits floats
    +   2*4 //  scale is 2 32 bits floats

const UniformBuffer_ColorOffset = 0
const UniformBuffer_OffsetOffset = 4
const UniformBuffer_ScaleOffset = 6


export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private paramsBuffer_: GPUBuffer
    private pipeline_: GPURenderPipeline

    @colorRGBA({
        label: "Color"
    })
    private color_: TColorRGBA = [0.65, 0.89, 0.63, 1]
    private xOffset_ = 0
    private yOffset_ = 0

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)
        
        const module = device.createShaderModule({
            label: Title,
            code: shaderSource
        })

        this.paramsBuffer_ = device.createBuffer({
            label: `${Title} - params`,
            size: UniformBuffer_Size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
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
                    format: this.textureFormat
                }]
            }
        })
    }

    protected render_(): GPUCommandBuffer[] {
        const aspect = this.canvas.width/this.canvas.height
        const uniformValues = new Float32Array(UniformBuffer_Size/4)

        uniformValues.set(this.color_, UniformBuffer_ColorOffset)
        uniformValues.set([this.xOffset_, this.yOffset_], UniformBuffer_OffsetOffset)
        uniformValues.set([1/aspect, 1], UniformBuffer_ScaleOffset)

        this.device.queue.writeBuffer(this.paramsBuffer_, 0, uniformValues)

        const bindGroup = this.device.createBindGroup({
            label: Title,
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: {
                    buffer: this.paramsBuffer_,
                },
            }],
        })

        const encoder = this.device.createCommandEncoder({
            label: Title,
        })
        const pass = encoder.beginRenderPass({
            label: Title,
            colorAttachments: [{
                clearValue: [0.3, 0.3, 0.3, 1.0],
                loadOp: "clear",
                storeOp: "store",
                view: this.context.getCurrentTexture().createView(),
            }]
        })
        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, bindGroup)
        pass.draw(3)
        pass.end()

        return [encoder.finish()]
    }
}
