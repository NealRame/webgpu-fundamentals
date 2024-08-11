import type {
    TPalette,
    TPixelmap,
} from "./types"


export function Pixelmap<P extends TPalette>(
    data: TPixelmap<P>,
): TPixelmap<P> {
    return data
}

export function pixelmapToBitmap<P extends TPalette>(
    pixelmap: TPixelmap<P>,
    palette: P,
): Uint8Array {
    return new Uint8Array(
        pixelmap
            .map(s => palette[s])
            .flat()
            .map(c => Math.floor(255*c))
    )
}
