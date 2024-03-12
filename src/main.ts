import App from "./lessons/1"

const canvas = document.querySelector<HTMLCanvasElement>("#screen")
if (canvas == null) {
    throw new Error("No canvas found.")
}

const app = await App.create(canvas)
const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
        if (entry.target !== app.canvas) {
            continue
        }
        app.canvas.width = Math.max(Math.min(
            entry.contentBoxSize[0].inlineSize,
            app.device.limits.maxTextureDimension2D,
        ), 1)
        app.canvas.height = Math.max(Math.min(
            entry.contentBoxSize[0].blockSize,
            app.device.limits.maxTextureDimension2D,
        ), 1)
        app.render()
    }
})

observer.observe(app.canvas)
