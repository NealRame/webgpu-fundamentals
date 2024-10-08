import type {
    TSize,
} from "./types"

/**
 * Checks if a value is null or undefined.
 *
 * @param value - The value to check.
 * @returns `true` if the value is null or undefined, `false` otherwise.
 */
export function isNil<T>(
    value: T | null | undefined,
): value is (null | undefined) {
    return value == null
}

/**
 * Checks if a value is truthy.
 * @param v - The value to check.
 * @returns `true` if the value is truthy, otherwise `false`.
 */
export function truthy(v: any) {
    return !!v
}

/**
 * Get a random value in a given range.
 *
 * If no value are given, the range is [0, 1).
 * If one value is given, the range is [0, a).
 * If two values are given, the range is [a, b).
 *
 * @param min? - the lower bound of the range.
 * @param max? - the upper bound of the range.
 * @returns a random is the specified range.
 */
export function rand(): number
export function rand(max: number): number
export function rand(min: number, max: number): number
export function rand(a?: number, b?: number): number {
    if (a == null) {
        a = 0
        b = 1
    } else if (b == null) {
        b = a
        a = 0
    }
    return a + Math.random()*(b - a)
}

/**
 * Generates an array containing n elements wich are the result of the
 * invocation of a given function.
 *
 * @param fn - a function.
 * @param n  - specify how many times the function should be called.
 * @returns an array of `n` elements
 */
export function times<T>(
    fn: (i: number, n: number) => T,
    n: number,
): Array<T> {
    const a: Array<T> = []
    for (let i = 0; i < n; ++i) {
        a[i] = fn(i, n)
    }
    return a
}

/**
 *
 * @param bitmap the image to scale
 * @param size the size of the image
 * @param scale the scale factor
 * @returns
 */
export function scaleImage(
    bitmap: Uint8Array,
    { width, height }: TSize,
    scale: number,
): Uint8Array {
    scale = Math.floor(scale)

    if (scale < 1) throw new Error("Scale must be an integer >= 1")

    const bitmapScaled = new Uint8Array(4*bitmap.byteLength)

    for (let k = 0; k < scale; ++k) {
        for (let y = 0; y < height; ++y) {
            const rowOffset = y*width*4
            const rowOffsetScaled = (scale*y + k)*scale*width*4

            for (let x = 0; x < height; ++x) {
                const colOffset = rowOffset + 4*x
                const colOffsetScaled = rowOffsetScaled + 4*scale*(x + k)

                bitmapScaled[colOffsetScaled + 0] = bitmap[colOffset + 0]
                bitmapScaled[colOffsetScaled + 1] = bitmap[colOffset + 1]
                bitmapScaled[colOffsetScaled + 2] = bitmap[colOffset + 2]
                bitmapScaled[colOffsetScaled + 3] = bitmap[colOffset + 3]
            }
        }
    }

    return bitmapScaled
}