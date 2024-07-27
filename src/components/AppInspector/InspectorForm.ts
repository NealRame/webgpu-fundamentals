import {
    defineComponent,
    h,
    inject,
    unref,
} from "vue"

import {
    type TConstructor,
    getModelMetadata,
    isChoiceFieldConfig,
    isColorRGBAFieldConfig,
    isRangeFieldConfig,
} from "../../decorators"

import {
    truthy,
} from "../../utils"

import {
    KCurrentRenderApp,
} from "./keys"

import ChoiceField from "./ChoiceField"
import ColorRGBAField from "./ColorRGBAField"
import RangeField from "./RangeField"


export default defineComponent<{}, {
    changed(name: string): void,
}>((_, { emit }) => {
    const lesson = unref(inject(KCurrentRenderApp))!
    const onChanged = (name: string) => emit("changed", name)

    return () => {
        const meta = getModelMetadata(lesson.constructor as TConstructor)
        const fields = Object.values(meta)
            .map(fieldMeta => {
                if (isChoiceFieldConfig(fieldMeta)) {
                    return h(ChoiceField, {
                        fieldMeta,
                        onChanged,
                    })
                }
                if (isColorRGBAFieldConfig(fieldMeta)) {
                    return h(ColorRGBAField, {
                        fieldMeta,
                        onChanged,
                    })
                }
                if (isRangeFieldConfig(fieldMeta)) {
                    return h(RangeField, {
                        fieldMeta,
                        onChanged,
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
}, { emits: ["changed"], })
