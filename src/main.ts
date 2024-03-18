import App from "./lessons/9"

const appEl = document.querySelector<HTMLElement>("#app")
if (appEl == null) {
    throw new Error("No app element found.")
}
const header = appEl.appendChild(document.createElement("header"))
header.textContent = App.title

const canvas = appEl.appendChild(document.createElement("canvas"))
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
