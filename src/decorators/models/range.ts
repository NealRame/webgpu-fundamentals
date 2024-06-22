import {
    ensureMetadata,
} from "./common"

export type TRangeFieldOptions = {
    label?: string
    min?: number
    max?: number
    step?: number
}

export type TRangeFieldConfig<T = any> = Required<TRangeFieldOptions> & {
    name: string,
    type: "range",
    access: {
        get: (obj: T) => number,
        set: (obj: T, value: number) => void,
    }
}

const RangeDefaults: Omit<Required<TRangeFieldOptions>, "label"> = {
    min: 0,
    max: 1,
    step: 0.01,
}

export function range<This>(options: TRangeFieldOptions = {}) {
    return function (
        _: undefined,
        context: ClassFieldDecoratorContext<This, number>,
    ) {
        const { access, name, metadata } = context
        const modelMetadata = ensureMetadata(metadata)
        Object.assign(modelMetadata, {
            [name]: {
                name,
                type: "range",
                access,
                ...RangeDefaults,
                ...options,
            }
        })
    }
}

export function isRangeFieldConfig<T>(d: any): d is TRangeFieldConfig<T> {
    return d.type === "range"
}
