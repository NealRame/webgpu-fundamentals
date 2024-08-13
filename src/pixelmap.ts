import type {
    TBitmapData,
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
): TBitmapData {
    return {
        data: new Uint8Array(pixelmap.data
            .map(s => palette[s])
            .flat()
            .map(c => Math.floor(255*c))
        ),
        size: pixelmap.size,
    }
}
