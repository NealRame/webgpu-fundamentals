import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    RenderApp,
} from "../../../../renderapp"

import {
    range,
} from "../../../../decorators"

import shaderSource from "./shader.wgsl?raw"


const ParamsSize = 32
const ParamsOffsets = {
  color: 0,
  scale: 16,
  offset: 24,
}

const Title = "Triangle shaders with uniforms #1."
const Description = "Pass data to a shader with uniforms."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private paramsBuffer_: GPUBuffer
    private paramsValues_: Float32Array

    private bindGroup_: GPUBindGroup

    @range({
        min: -1,
        max:  1,
        label: "offsetX",
    }) private offsetX_ = 0

    @range({
        min: -1,
        max:  1,
        label: "offsetY",
    }) private offsetY_ = 0

    @range({
        min: 0.25,
        max: 2,
        label: "scale",
    }) private scale_ = 1

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: `${Title} - shader`,
            code: shaderSource,
        })

        this.paramsBuffer_ = device.createBuffer({
            size: ParamsSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        })

        this.paramsValues_ = new Float32Array(ParamsSize/4)
        this.paramsValues_.set(CatppuccinMocha.lavender, ParamsOffsets.color/4)

        this.pipeline_ = device.createRenderPipeline({
            label: `${Title} - pipeline`,
            layout: "auto",
            vertex: {
                // entryPoint can be omitted if there is only one vertex_shader
                // function in the module.
                entryPoint: "vertex_shader",
                module,
            },
            fragment: {
                // entryPoint can be omitted if there is only one fragment_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{ format: this.textureFormat }]
            }
        })

        this.bindGroup_ = device.createBindGroup({
            label: `${Title} - bind group`,
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: this.paramsBuffer_ },
            }]
        })
    }

    protected render_(): Array<GPUCommandBuffer> {
        const aspect = this.canvas.width/this.canvas.height

        this.paramsValues_.set(
            [this.offsetX_, this.offsetY_],
            ParamsOffsets.offset/4
        )
        this.paramsValues_.set(
            [this.scale_/aspect, this.scale_],
            ParamsOffsets.scale/4
        )
        this.device.queue.writeBuffer(this.paramsBuffer_, 0, this.paramsValues_)

        const encoder = this.device.createCommandEncoder({
            label: `${Title} - command encoder`,
        })

        const pass = encoder.beginRenderPass({
            label: `${Title} - render pass`,
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: CatppuccinMocha.base,
                loadOp: "clear",
                storeOp: "store",
            }],
        })

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(3)
        pass.end()

        return [encoder.finish()]
    }
}
