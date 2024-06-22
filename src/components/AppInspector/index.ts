import {
    defineComponent,
    h,
    inject,
} from "vue"

import {
    type TConstructor,
    getModelMetadata,
    isRangeFieldConfig,
    isColorRGBAFieldConfig,
} from "../../decorators"

import {
    KCurrentRenderApp,
} from "../../keys"

import {
    truthy,
} from "../../utils"

import {
    RangeField,
} from "./RangeFieldComponent"

import {
    ColorRGBAField,
} from "./ColorRGBAFieldComponent"


export default defineComponent(() => {
    const renderApp = inject(KCurrentRenderApp);

    return () => {
        if (renderApp?.value != null) {
            const meta = getModelMetadata(renderApp?.value.constructor as TConstructor)
            const fields = Object.values(meta)
                .map(fieldMeta => {
                    if (isRangeFieldConfig(fieldMeta)) {
                        return h(RangeField, {
                            fieldMeta,
                        })
                    }
                    if (isColorRGBAFieldConfig(fieldMeta)) {
                        return h(ColorRGBAField, {
                            fieldMeta,
                        })
                    }
                    return null
                })
                .filter(truthy)
            return [
                h("form", {
                    style: {
                        backgroundColor: "var(--bg-color)",
                        boxSizing: "border-box",
                        border: "1px solid var(--border-color)",
                        borderRadius: "var(--border-radius)",
                        display: "grid",
                        gridTemplateColumns: "auto 1fr 3rem",
                        gap: ".25rem 1rem",
                        fontSize: "smaller",
                        padding: ".25rem .5rem",
                    }
                }, fields)
            ]
        }
    }
})
