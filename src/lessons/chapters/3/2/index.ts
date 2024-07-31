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


type TTrianleData = {
    bindGroup: GPUBindGroup
    paramsBuffer: GPUBuffer
    paramsValues: ArrayBuffer
    scale: number
}

const TriangleCount = 64

const TriangleParamsSize = 32
const TriangleParamsOffsets = {
    color: 0,
    scale: 16,
    offset: 24,
}

const Title = "Triangle shaders with uniforms #2."
const Description = "Draw several triangles with the same shader."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private trianglesData_: Array<TTrianleData>


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
            const paramsValues = new ArrayBuffer(TriangleParamsSize)
            const paramsBuffer = device.createBuffer({
                label: `params for triangle ${i}`,
                size: TriangleParamsSize,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            })

            const paramsValuesView = new Float32Array(paramsValues)

            paramsValuesView.set(
                [rand(), rand(), rand(), 1],
                TriangleParamsOffsets.color/4,
            )
            paramsValuesView.set(
                [rand(-.9, .9), rand(-.9, .9)],
                TriangleParamsOffsets.offset/4,
            )

            const bindGroup = device.createBindGroup({
                label: `bind group for triangle ${i}`,
                layout: this.pipeline_.getBindGroupLayout(0),
                entries: [{
                    binding: 0,
                    resource: { buffer: paramsBuffer },
                }],
            })

            return {
                scale: rand(.2, .5),
                paramsBuffer,
                paramsValues,
                bindGroup,
            } as TTrianleData
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
            paramsBuffer,
            paramsValues,
            scale,
        } of this.trianglesData_) {
            (new Float32Array(paramsValues)).set(
                [scale/aspect, scale],
                TriangleParamsOffsets.scale/4,
            )
            this.device.queue.writeBuffer(paramsBuffer, 0, paramsValues)
            pass.setBindGroup(0, bindGroup)
            pass.draw(3)
        }

        pass.end()

        return [encoder.finish()]
    }
}
