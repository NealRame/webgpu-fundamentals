// Symbol.metadata polyfill
Object.assign(Symbol, {
    metadata: Symbol("Symbol.metadata")
})

import {
    ModelMetadataKey
} from "./common"

export * from "./choice"
export * from "./range"
export * from "./colorRGBA"

export type TConstructor<T = any> = new(...args: Array<any>) => T

export type TModelMetadata = Record<string, any>

export function getModelMetadata(
    target: TConstructor | null | undefined,
): TModelMetadata {
    return (target?.[Symbol.metadata]?.[ModelMetadataKey] ?? {}) as TModelMetadata
}

export function hasModelMetadata(
    target: Function | null | undefined,
): boolean {
    return target?.[Symbol.metadata]?.[ModelMetadataKey] != null
}
