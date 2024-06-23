<script lang="ts">
export default { name: "Lesson" }
</script>

<script setup lang="ts">
import {
    computed,
    ref,
    unref,
    watch,
} from "vue"

import {
    hasModelMetadata,
} from "../decorators"

import {
    useResize,
} from "../composables"

import {
    type IRenderApp,
    createLesson,
} from "../lessons"

import AppInspector from "./AppInspector"


const { id } = defineProps({
    id: {
        type: String,
        required: true,
    }
})

const canvas = ref<HTMLCanvasElement | null>(null)
const error  = ref<Error | null>(null)
const lesson = ref<IRenderApp | null>(null)

const { size } = useResize(canvas, window.devicePixelRatio)

const lessonHasSettings = computed(() => hasModelMetadata(unref(lesson)?.constructor))


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
        ref="canvas"
    ></canvas>
    <footer
        v-if="lessonHasSettings"
        class="absolute block bottom-0 p-4 z-10"
    ><AppInspector :render-app="lesson"/></footer>
</template>
