import {
    defineComponent,
    h,
    inject,
    unref,
} from "vue"

import {
    KCurrentRenderApp,
} from "./keys"

import {
    TRangeFieldConfig,
} from "../../decorators"

import InputRange from "../InputRange.vue"


export default defineComponent<{
    fieldMeta: TRangeFieldConfig,
}, {
    updated(name: string): void
}>((props, { emit }) => {
    const renderAppRef = inject(KCurrentRenderApp)
    const {
        fieldMeta: {
            access,
            label,
            name,
            max,
            min,
            step
    } } = props
    return () => {
        const renderApp = unref(renderAppRef)!;
        return [
            h("label", {
                class: "after:content-[':'] text-right",
                innerHTML: label ?? name
            }),
            h(InputRange, {
                max,
                min,
                step,
                modelValue: access.get(renderApp),
                "onUpdate:modelValue": (value: number) => {
                    access.set(renderApp, value)
                    emit("updated", name)
                    renderApp.render()
                }
            }),
            h("label", {
                innerHTML: `${access.get(renderApp)}`,
                style: {
                    textAlign: "right"
                }
            })
        ]
    }
}, { props: ["fieldMeta"], emits: ["updated"] })
