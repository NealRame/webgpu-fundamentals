import {
    CatppuccinMocha,
} from "../../../../colors"

import {
    RenderApp,
} from "../../../../renderapp"

import shaderSource from "./shader.wgsl?raw"


const Title = "Checkerboard."
const Description = "Draw a checkerboard using fragment_shader @position builtin."

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
    }

    protected render_(): Array<GPUCommandBuffer> {
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
        pass.draw(6)
        pass.end()

        return [encoder.finish()]
    }
}
