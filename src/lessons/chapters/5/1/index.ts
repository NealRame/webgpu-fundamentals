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

type TCircleOptions = {
    innerRadius?: number
    outerRadius?: number
    startAngle?: number
    stopAngle?: number
    subdivisions?: number
}

function createCircleVertices(options: TCircleOptions = {}) {
    const { innerRadius, outerRadius, startAngle, stopAngle, subdivisions } = {
        innerRadius: 0,
        outerRadius: 1,
        startAngle:  0,
        stopAngle:   2*Math.PI,
        subdivisions: 32,
        ...options
    }
    const stepAngle = (stopAngle - startAngle)/subdivisions

    const vertexCount = subdivisions*6                   // 2 triangles per subdivision
    const vertexValues = new Float32Array(2*vertexCount) // 2 coordinates pers vertex

    for (let i = 0; i < subdivisions; ++i) {
        const offset = i*2*6

        const angle1 = startAngle + i*stepAngle
        const angle2 = angle1 + stepAngle

        // B-----C
        // |   / |
        // | /   |
        // A-----D

        const c1 = Math.cos(angle1)
        const s1 = Math.sin(angle1)
        const c2 = Math.cos(angle2)
        const s2 = Math.sin(angle2)

        const a = [innerRadius*c1, innerRadius*s1]
        const b = [outerRadius*c1, outerRadius*s1]
        const c = [outerRadius*c2, outerRadius*s2]
        const d = [innerRadius*c2, innerRadius*s2]

        vertexValues.set(a, offset + 0)
        vertexValues.set(b, offset + 2)
        vertexValues.set(c, offset + 4)

        vertexValues.set(c, offset + 6)
        vertexValues.set(d, offset + 8)
        vertexValues.set(a, offset + 10)
    }

    return { vertexCount, vertexValues }
}

const ShapeCount = 4

const ShapeParams1Size = 32
const ShapeParams1Offsets = {
    color: 0,
    offset: 16,
}

const ShapeParams2Size = 8
const ShapeParams2Offsets = {
    scale: 0,
}

const Title = "Using Vertex Buffer."
const Description = "The shader gets vertex data from a Vertex Buffer"

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline
    private bindGroup_: GPUBindGroup

    private params2Buffer_: GPUBuffer
    private scaleFactors_: Array<number>

    private vertexBuffer_: GPUBuffer
    private vertexCount_: number

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
                buffers: [{
                    arrayStride: 2*4,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: "float32x2" },
                    ],
                }]
            },
            fragment: {
                // entryPoint can be omitted if there is only one fragment_shader
                // function in the module.
                entryPoint: "fragment_shader",
                module,
                targets: [{ format: this.textureFormat }]
            }
        })

        const params1Values = new ArrayBuffer(ShapeParams1Size*ShapeCount)
        const params1ValuesView = new Float32Array(params1Values)
        const params1Buffer = device.createBuffer({
            label: "params1 storage buffer",
            size: params1Values.byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })

        for (let i = 0; i < ShapeCount; ++i) {
            const offset = i*ShapeParams1Size

            params1ValuesView.set(
                [rand(), rand(), rand(), 1],
                (offset + ShapeParams1Offsets.color)/4,
            )
            params1ValuesView.set(
                [rand(-.9, .9), rand(-.9, .9)],
                (offset + ShapeParams1Offsets.offset)/4,
            )
        }
        device.queue.writeBuffer(params1Buffer, 0, params1Values)


        const { vertexCount, vertexValues } = createCircleVertices({
            innerRadius: 0.5
        })
        const vertexBuffer = device.createBuffer({
            label: "vertex storage buffer",
            size: vertexValues.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        })
        device.queue.writeBuffer(vertexBuffer, 0, vertexValues)

        this.vertexBuffer_ = vertexBuffer
        this.vertexCount_ = vertexCount

        this.params2Buffer_ = device.createBuffer({
            label: "params2 storage buffer",
            size: ShapeParams2Size*ShapeCount,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        })
        this.scaleFactors_ = times(() => rand(.2, .5), ShapeCount)

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

        const params2Values = new ArrayBuffer(ShapeParams2Size*ShapeCount)
        const params2ValuesView = new Float32Array(params2Values)

        this.scaleFactors_.forEach((scale, i) => {
            const offset = i*ShapeParams2Size

            params2ValuesView.set(
                [scale/aspect, scale],
                (offset + ShapeParams2Offsets.scale)/4,
            )
        })
        this.device.queue.writeBuffer(this.params2Buffer_, 0, params2Values)

        pass.setPipeline(this.pipeline_)
        pass.setBindGroup(0, this.bindGroup_)
        pass.setVertexBuffer(0, this.vertexBuffer_)
        pass.draw(this.vertexCount_, ShapeCount)
        pass.end()

        return [encoder.finish()]
    }
}
