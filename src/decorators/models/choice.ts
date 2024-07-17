import {
    ensureMetadata,
} from "./common"

export type TChoiceFieldOptions<T extends Array<unknown> = Array<unknown>> = {
    label?: string
    values: readonly [...T]
}

export type TChoiceFieldConfig<U = any> = Required<TChoiceFieldOptions> & {
    name: string,
    type: "range",
    access: {
        get: (obj: U) => unknown,
        set: (obj: U, value: unknown) => void,
    }
}

export function choice<This, const T extends unknown[]>(options: TChoiceFieldOptions<T>) {
    return function (
        _: undefined,
        context: ClassFieldDecoratorContext<This, [...T][number]>,
    ) {
        const { access, name, metadata } = context
        const modelMetadata = ensureMetadata(metadata)
        Object.assign(modelMetadata, {
            [name]: {
                name,
                type: "choice",
                access,
                ...options,
            }
        })
    }
}

export function isChoiceFieldConfig(d: any): d is TChoiceFieldConfig {
    return d.type === "choice"
}
