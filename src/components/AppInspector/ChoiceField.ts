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
    type TChoiceFieldConfig,
} from "../../decorators"

export default defineComponent<{
    fieldMeta: TChoiceFieldConfig,
}>(props => {
    const renderAppRef = inject(KCurrentRenderApp)
    const {
        fieldMeta: {
            access,
            label,
            name,
            values,
    } } = props

    return () => {
        const renderApp = unref(renderAppRef)!;
        return [
            h("label", {
                class: "after:content-[':'] text-right",
                innerHTML: label ?? name,
            }),
            h("select", {
                class: "bg-inherit border-2 col-span-2 cursor-pointer outline-0 rounded",
                modelValue: access.get(renderApp),
                "onChange": (ev: InputEvent) => {
                    const target = ev.target as HTMLSelectElement
                    access.set(renderApp, target.value)
                    renderApp.render()
                },
            }, values.map(innerHTML => h("option", { innerHTML }))),
        ]
    }
}, { props: ["fieldMeta"], })
