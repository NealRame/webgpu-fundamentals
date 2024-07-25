import {
    type Ref,
    onMounted,
    onUnmounted,
    ref,
    watch,
} from "vue"

import type {
    TSize,
} from "../types"


const SizeDefault: TSize = {
    width: 0,
    height: 0,
}

export function useResize(el: Ref<HTMLElement | null>) {
    const devicePixelSize = ref<TSize>({...SizeDefault})
    const size = ref<TSize>({...SizeDefault})

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            if (entry.target !== el.value) {
                continue
            }

            size.value = {
                width: entry.contentBoxSize[0]?.inlineSize ?? 0,
                height: entry.contentBoxSize[0]?.blockSize ?? 0,
            }

            devicePixelSize.value = {
                width: entry.devicePixelContentBoxSize[0]?.inlineSize ?? 0,
                height: entry.devicePixelContentBoxSize[0]?.blockSize ?? 0,
            }
        }
    })

    watch(el, (newEl, oldEl) => {
        if (oldEl != null) {
            observer.unobserve(oldEl)
        }
        if (newEl != null) {
            observer.observe(newEl)
        }
    })

    onMounted(() => {
        if (el.value != null) {
            observer.observe(el.value)
        }
    })

    onUnmounted(() => {
        if (el.value != null) {
            observer.unobserve(el.value)
        }
    })

    return {
        size,
        devicePixelSize,
    }
}
