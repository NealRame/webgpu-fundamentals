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


type TTriangleData = {
    bindGroup: GPUBindGroup
    params2Buffer: GPUBuffer
    scale: number
}

const TriangleCount = 16

const TriangleParams1Size = 32
const TriangleParams1Offsets = {
    color: 0,
    offset: 16,
}

const TriangleParams2Size = 8
const TriangleParams2Offsets = {
    scale: 0,
}

const Title = "Passing data with storage buffer."
const Description = "Draw several triangles with the same shader. Pass data to the shader using storage buffers."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private trianglesData_: Array<TTriangleData>


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

        this.trianglesData_ = times(i => {
            const params1Values = new ArrayBuffer(TriangleParams1Size)
            const params1Buffer = device.createBuffer({
                label: `params1 for triangle ${i}`,
                size: TriangleParams1Size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            })

            const paramsValuesView = new Float32Array(params1Values)

            paramsValuesView.set(
                [rand(), rand(), rand(), 1],
                TriangleParams1Offsets.color/4,
            )
            paramsValuesView.set(
                [rand(-.9, .9), rand(-.9, .9)],
                TriangleParams1Offsets.offset/4,
            )

            device.queue.writeBuffer(params1Buffer, 0, params1Values)

            const params2Buffer = device.createBuffer({
                label: `params2 for triangle ${i}`,
                size: TriangleParams2Size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            })

            const bindGroup = device.createBindGroup({
                label: `bind group for triangle ${i}`,
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [{
                    binding: 0,
                    resource: { buffer: params1Buffer },
                }, {
                    binding: 1,
                    resource: { buffer: params2Buffer },
                }],
            })

            return {
                scale: rand(.2, .5),
                params2Buffer,
                bindGroup,
            } as TTriangleData
        }, TriangleCount)
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

        pass.setPipeline(this.pipeline_)

        for (const {
            bindGroup,
            params2Buffer,
            scale,
        } of this.trianglesData_) {
            const params2Values = new ArrayBuffer(TriangleParams2Size)
            const params2ValuesView = new Float32Array(params2Values)

            params2ValuesView.set(
                [scale/aspect, scale],
                TriangleParams2Offsets.scale/4
            )

            this.device.queue.writeBuffer(params2Buffer, 0, params2Values)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        }

        pass.end()

        return [encoder.finish()]
    }
}
