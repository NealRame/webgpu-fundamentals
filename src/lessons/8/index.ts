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
const Description = "Draw several triangle in one pass using storage buffer."

const Params1Size = 32
const Params1Offset = {
    color: 0,
    offset: 4,
} as const

const Params2Size = 8

const ObjectCount = 25

type TObjectInfo = {
    scale: number
}

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    private bindGroup_: GPUBindGroup

    private params2Data_: ArrayBuffer
    private params2Buffer_: GPUBuffer

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

        const params1Data = new ArrayBuffer(Params1Size*ObjectCount)
        const params1View = new Float32Array(params1Data)
        const params1Buffer = device.createBuffer({
            label: "params1 array storage buffer",
            size: params1Data.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        const params2Data = new ArrayBuffer(Params2Size*ObjectCount)
        const params2Buffer = device.createBuffer({
            label: "params2 array storage buffer",
            size: params2Data.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        })

        this.objectInfos_ = times(i => {
            const color = randRGB()
            const offsetPos = times(() => 2*rand() - 1, 2)

            const params1Offset = i*(Params1Size/4)
            params1View.set(color, params1Offset + Params1Offset.color)
            params1View.set(offsetPos, params1Offset + Params1Offset.offset)

            return {
                scale: rand(0.2, 0.5),
            }
        }, ObjectCount)

        device.queue.writeBuffer(params1Buffer, 0, params1Data)

        this.bindGroup_ = device.createBindGroup({
            label: "bind group",
            layout: this.pipeline_.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: params1Buffer }},
                { binding: 1, resource: { buffer: params2Buffer }},
            ]
        })

        this.params2Data_ = params2Data
        this.params2Buffer_ = params2Buffer
    }

    protected render_(): GPUCommandBuffer[] {
        const aspect = this.canvas.width/this.canvas.height
        const params2View = new Float32Array(this.params2Data_)

        this.objectInfos_.forEach(({ scale }, i) => {
            const params2Offset = i*(Params2Size/4)
            params2View.set([scale/aspect, scale], params2Offset)
        })
        this.device.queue.writeBuffer(this.params2Buffer_, 0, this.params2Data_)

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
        pass.setBindGroup(0, this.bindGroup_)
        pass.draw(3, ObjectCount)
        pass.end()

        return [encoder.finish()]
    }
}