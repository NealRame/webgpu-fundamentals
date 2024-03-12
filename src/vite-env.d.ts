/// <reference types="vite/client" />

declare module "*wgsl?raw" {
    const shaderSource: string
    export default shaderSource
}
