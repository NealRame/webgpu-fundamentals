import type {
    TColorRGBA,
} from "../../types"

import {
    ensureMetadata,
} from "./common"

export type TColorRGBAFieldOptions = {
    label?: string
}

export type TColorRGBAFieldConfig<T = any> = Required<TColorRGBAFieldOptions> & {
    name: string,
    type: "colorRGBA",
    access: {
        get: (obj: T) => TColorRGBA,
        set: (obj: T, value: TColorRGBA) => void,
    }
}

export function colorRGBA<This>(options: TColorRGBAFieldOptions = {}) {
    return function (
        _: undefined,
        context: ClassFieldDecoratorContext<This, TColorRGBA>,
    ) {
        const { access, name, metadata } = context
        const modelMetadata = ensureMetadata(metadata)
        Object.assign(modelMetadata, {
            [name]: {
                name,
                type: "colorRGBA",
                access,
                ...options,
            }
        })
    }
}

export function isColorRGBAFieldConfig<T>(d: any): d is TColorRGBAFieldConfig<T> {
    return d.type === "colorRGBA"
}
