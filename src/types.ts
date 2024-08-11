export type TColorRGB  = [number, number, number]
export type TColorRGBA = [number, number, number, number]

export type TPalette = Record<string, TColorRGBA>

export type TPixelmap<T extends TPalette> = Array<keyof T>

export type TSize = {
    width: number
    height: number
}
