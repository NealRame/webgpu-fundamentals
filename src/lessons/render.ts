export interface IRenderApp {
    readonly canvas: HTMLCanvasElement
    readonly device: GPUDevice
    readonly context: GPUCanvasContext
    readonly textureFormat: GPUTextureFormat
    render: () => void
}

export class RenderApp implements IRenderApp {
    protected static title_ = "App Title"
    protected static description_ = "App Description"

    private canvas_: HTMLCanvasElement
    private context_: GPUCanvasContext
    private device_: GPUDevice
    private textureFormat_: GPUTextureFormat

    static get title() {
        return this.title_
    }

    static get description() {
        return this.description_
    }

    static async create(canvas: HTMLCanvasElement) {
        const gpu = navigator.gpu
        if (gpu == null) {
            throw new Error("No WebGPU support!")
        }

        const adapter = await gpu.requestAdapter()
        if (adapter == null) {
            throw new Error("No adapter found!")
        }

        const device = await adapter.requestDevice()

        return new this(canvas, device)
    }

    constructor(
        canvas: HTMLCanvasElement,
        device: GPUDevice,
    ) {
        const format = navigator.gpu.getPreferredCanvasFormat()
        const context = canvas.getContext("webgpu")

        if (context == null) {
            throw new Error("Failed to get a webgpu context!")
        } else {
            context.configure({
                device,
                format,
            })
        }

        this.canvas_ = canvas
        this.device_ = device
        this.textureFormat_ = format
        this.context_ = context
    }

    public get canvas() {
        return this.canvas_
    }

    public get device() {
        return this.device_
    }

    public get context() {
        return this.context_
    }

    public get textureFormat() {
        return this.textureFormat_
    }

    public render() {
        this.device_.queue.submit(this.render_())
    }

    protected render_(): Array<GPUCommandBuffer> {
        return []
    }
}
