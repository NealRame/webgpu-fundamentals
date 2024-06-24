import {
    defineComponent,
    h,
    inject,
    unref,
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

const InspectorForm = defineComponent(() => {
    const classes = [
        "gap-x-1",
        "gap-y-4",
        "grid",
        "grid-cols-[auto_1fr_3rem]",
        "text-sm",
        "text-white"
    ].join(" ")
    const lesson = unref(inject(KCurrentRenderApp))!

    return () => {
        const meta = getModelMetadata(lesson.constructor as TConstructor)
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
        
        return [h("form", {
            class: classes,
        }, fields)]
    }
})

export default defineComponent(() => {
    return () => {
        const lesson = unref(inject(KCurrentRenderApp))

        if (lesson != null) {
            return h("div", {
                    class: "absolute bottom-1 left-1 rounded bg-base bg-opacity-50 p-2",
                }, [h(InspectorForm)])
            }
    }
})
