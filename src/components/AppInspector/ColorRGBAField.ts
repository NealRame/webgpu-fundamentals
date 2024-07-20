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
} from "./keys"

import type {
    TColorRGBA,
} from "../../types"

import InputColorRGBA from "../InputColorRGBA.vue"


export default defineComponent<{
    fieldMeta: TColorRGBAFieldConfig,
}, {
    updated(name: string): void
}>((props, { emit }) => {
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
                class: "after:content-[':'] text-right",
                innerHTML: label ?? name,
            }),
            h(InputColorRGBA, {
                modelValue: access.get(renderApp),
                "onUpdate:modelValue": (value: TColorRGBA) => {
                    access.set(renderApp, value)
                    emit("updated", name)
                }
            }),
        ]
    }
}, { props: ["fieldMeta"], emits: ["updated"] })
