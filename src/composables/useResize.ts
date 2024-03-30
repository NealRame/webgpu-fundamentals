import {
    type Ref,
    computed,
    onMounted,
    onUnmounted,
    ref,
    watch,
} from "vue"


export function useResize(el: Ref<HTMLElement | null>, scale: number = 1) {
    const width = ref(0)
    const height = ref(0)
    const size = computed(() => ({
        width: width.value,
        height: height.value,
    }))

    const observer = new ResizeObserver(entries => {
        for (const entry of entries) {
            if (entry.target !== el.value) {
                continue
            }
            width.value = scale*entry.contentRect.width
            height.value = scale*entry.contentRect.height
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
        width,
        height,
        size,
    }
}
