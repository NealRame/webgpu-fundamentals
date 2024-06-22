import {
    defineComponent,
    h,
    inject,
    unref,
} from "vue"

import {
    TColorRGBAFieldConfig,
} from "../../decorators"

import {
    KCurrentRenderApp,
} from "../../keys"

import type {
    TColorRGBA,
} from "../../types"

import InputColorRGBA from "../InputColorRGBA.vue"

export const ColorRGBAField = defineComponent<{
    fieldMeta: TColorRGBAFieldConfig,
}>(props => {
    const renderAppRef = inject(KCurrentRenderApp)
    const {
        fieldMeta: {
            access,
            label,
            name,
    } } = props
    return () => {
        const renderApp = unref(renderAppRef)!;
        return [
            h("label", {
                class: "model-inspector-label",
                innerHTML: label ?? name,
            }),
            h(InputColorRGBA, {
                modelValue: access.get(renderApp),
                "onUpdate:modelValue": (value: TColorRGBA) => {
                    access.set(renderApp, value)
                    renderApp.render()
                }
            }),
        ]
    }
}, { props: ["fieldMeta"], })
