import {
    RenderApp,
} from "../../app"

import shader from "./shader.wgsl?raw"

export default class extends RenderApp {
    static title_ = "Hardcoded Chessboard Triangle."

    private pipeline_: GPURenderPipeline

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "hardcoded chessboard triangle shader",
            code: shader,
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "hardcoded chessboard triangle pipeline",
            layout: "auto",
            vertex: {
                module,
                entryPoint: "vertex_main",
            },
            fragment: {
                module,
                entryPoint: "fragment_main",
                targets: [{
                    format: this.textureFormat,
                }],
            },
        })
    }

    public render_() {
        const encoder = this.device.createCommandEncoder({
            label: "hardcoded chessboard triangle encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "hardcoded chessboard triangle render pass",
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.3, g: 0.3, b: 0.3, a: 1 },
                loadOp: "clear",
                storeOp: "store",
            }]
        })

        pass.setPipeline(this.pipeline_)
        pass.draw(3)
        pass.end()

        return [encoder.finish()]
    }
}
