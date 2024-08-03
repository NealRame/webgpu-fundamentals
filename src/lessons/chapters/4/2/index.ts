import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    RenderApp,
} from "../../../../renderapp"

import {
    rand,
    times,
} from "../../../../utils"

import shaderSource from "./shader.wgsl?raw"


const TriangleCount = 100

const TriangleParams1Size = 32
const TriangleParams1Offsets = {
    color: 0,
    offset: 16,
}

const TriangleParams2Size = 8
const TriangleParams2Offsets = {
    scale: 0,
}

const Title = "100 triangles shaders with one draw call."
const Description = "Draw several triangles with the same shader. Pass data to the shader using storage buffers."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    private params2Buffer_: GPUBuffer
    private scaleFactors_: Array<number>


    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: `${Title} - shader`,
            code: shaderSource,
        })

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

        this.params2Buffer_ = device.createBuffer({
            label: "params2 storage buffer",
            size: TriangleParams2Size*TriangleCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        this.scaleFactors_ = times(() => rand(.2, .5), TriangleCount)

        const params1Buffer = device.createBuffer({
            label: "params1 storage buffer",
            size: TriangleParams1Size*TriangleCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        const params1Values = new ArrayBuffer(TriangleParams1Size*TriangleCount)
        const params1ValuesView = new Float32Array(params1Values)

        for (let i = 0; i < TriangleCount; ++i) {
            const offset = i*TriangleParams1Size

            params1ValuesView.set(
                [rand(), rand(), rand(), 1],
                (offset + TriangleParams1Offsets.color)/4,
            )
            params1ValuesView.set(
                [rand(-.9, .9), rand(-.9, .9)],
                (offset + TriangleParams1Offsets.offset)/4,
            )
        }
        device.queue.writeBuffer(params1Buffer, 0, params1Values)

        this.bindGroup_ = device.createBindGroup({
            label: `bind group`,
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [{
                binding: 0,
                resource: { buffer: params1Buffer },
            }, {
                binding: 1,
                resource: { buffer: this.params2Buffer_ },
            }],
        })
    }

    protected render_(): Array<GPUCommandBuffer> {
        const aspect = this.canvas.width/this.canvas.height
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

        const params2Values = new ArrayBuffer(TriangleParams2Size*TriangleCount)
        const params2ValuesView = new Float32Array(params2Values)

        this.scaleFactors_.forEach((scale, i) => {
            const offset = i*TriangleParams2Size

            params2ValuesView.set(
                [scale/aspect, scale],
                (offset + TriangleParams2Offsets.scale)/4
            )
        })
        this.device.queue.writeBuffer(this.params2Buffer_, 0, params2Values)

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(3, TriangleCount)
        pass.end()

        return [encoder.finish()]
    }
}
