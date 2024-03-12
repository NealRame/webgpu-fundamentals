import {
    RenderApp,
} from "../../app"

export default class extends RenderApp {
    static title_ = "Hardcoded red triangle shaders."

    private pipeline_: GPURenderPipeline

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        super(canvas, device)

        const module = device.createShaderModule({
            label: "hardcoded red triangle shader",
            code: `
                @vertex
                fn vertex_main(
                    @builtin(vertex_index) vertex_index: u32,
                ) -> @builtin(position) vec4f {
                    let pos = array<vec2f, 3>(
                        vec2f(0.0, 0.5),
                        vec2f(-0.5, -0.5),
                        vec2f(0.5, -0.5),
                    );;
                    return vec4<f32>(pos[vertex_index], 0, 1);
                }
    
                @fragment
                fn fragment_main() -> @location(0) vec4f {
                    return vec4f(1, .5, .25, 1);
                }
            `
        })

        this.pipeline_ = this.device.createRenderPipeline({
            label: "hardcoded red triangle pipeline",
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
            label: "hardcoded red triangle encoder",
        })
        const pass = encoder.beginRenderPass({
            label: "hardcoded red triangle render pass",
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
