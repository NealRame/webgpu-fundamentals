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
    truthy,
} from "../../utils"

import {
    KCurrentRenderApp,
} from "./keys"

import ColorRGBAField from "./ColorRGBAField"
import RangeField from "./RangeField"


export default defineComponent(() => {
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
            class: [
                "gap-x-1",
                "gap-y-1",
                "grid",
                "grid-cols-[auto_1fr_3rem]",
                "text-sm",
                "text-white"
            ],
        }, fields)]
    }
})
