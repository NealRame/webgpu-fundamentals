export type TColorRGB  = [number, number, number]
export type TColorRGBA = [number, number, number, number]

export type TPalette = Record<string, TColorRGBA>

export type TSize = {
    width: number
    height: number
}

export type TPixelmap<T extends TPalette> = {
    data: Array<keyof T>
    size: TSize
}

export type TBitmapData = {
    data: Uint8Array | Uint8ClampedArray
    size: TSize
}
