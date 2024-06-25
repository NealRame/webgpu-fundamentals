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
}>(props => {
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
                class: "model-inspector-label",
                innerHTML: label ?? name,
            }),
            h(InputRange, {
                max,
                min,
                step,
                modelValue: access.get(renderApp),
                "onUpdate:modelValue": (value: number) => {
                    access.set(renderApp, value)
                    renderApp.render()
                }
            }),
            h("label", {
                class: "model-inspector-value",
                innerHTML: `${access.get(renderApp)}`,
                style: {
                    textAlign: "right"
                }
            })
        ]
    }
}, { props: ["fieldMeta"], })
