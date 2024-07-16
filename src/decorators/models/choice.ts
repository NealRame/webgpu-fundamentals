import {
    ensureMetadata,
} from "./common"

export type TChoiceFieldOptions<T extends unknown[]> = {
    label?: string
    values: [...T]
}

export type TChoiceFieldConfig<U = any, T extends unknown[] = Array<unknown>> = Required<TChoiceFieldOptions<T>> & {
    name: string,
    type: "range",
    access: {
        get: (obj: U) => T[number],
        set: (obj: U, value: T[number]) => void,
    }
}

export function choice<This, T extends unknown[]>(options: TChoiceFieldOptions<T>) {
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
