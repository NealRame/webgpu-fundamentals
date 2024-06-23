import {
    RenderApp,
} from "../render"

import shaderSource from "./shader.wgsl?raw"

const Title = "Checkerboard"
const Description = "Draw a Checkerboard."

export default class extends RenderApp {
    static title_ = Title
    static description_ = Description

    private pipeline_: GPURenderPipeline

    public constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)
        
        const module = device.createShaderModule({
            label: Title,
            code: shaderSource
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
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }
}
