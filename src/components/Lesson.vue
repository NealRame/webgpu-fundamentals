<script lang="ts">
export default { name: "Lesson" }
</script>

<script setup lang="ts">
import {
    ref,
    watch,
} from "vue"

import {
    useResize,
} from "../composables"

import {
    type IRenderApp,
    createLesson,
} from "../lessons"


const { id } = defineProps({
    id: {
        type: String,
        required: true,
    }
})

const canvas = ref<HTMLCanvasElement | null>(null)
const error  = ref<Error | null>(null)
const lesson = ref<IRenderApp | null>(null)

// the canvas element style must match {
//    display: block;
//    width: 100%;
//    height: 100%;
// }
const { size } = useResize(canvas, window.devicePixelRatio)


watch(canvas, async canvas => {
    if (canvas) {
        try {
            lesson.value = await createLesson(id, canvas)
            lesson.value?.render()
        } catch (err) {
            if (err instanceof Error) {
                error.value = err
            }
        }
    } else {
        lesson.value = null
    }
})

watch(size, size => {
    if (canvas.value) {
        canvas.value.width = size.width
        canvas.value.height = size.height
        lesson.value?.render()
    }
})

</script>

<template>
    <div
        v-if="error"
        class="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] text-red"
    >{{ error.message }}</div>
    <canvas
        class="block w-full h-full"
        ref="canvas"
    ></canvas>
</template>
