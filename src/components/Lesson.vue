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
    isLesson,
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
const lesson = ref<IRenderApp | null>(null)

const { size } = useResize(canvas, window.devicePixelRatio)

const lessonHasSettings = computed(() => hasModelMetadata(unref(lesson)?.constructor))


watch(canvas, async canvas => {
    if (canvas) {
        lesson.value = await createLesson(id, canvas)
    } else {
        lesson.value = null
    }
})

watch([lesson, size, ], ([renderApp, size, ]) => {
    if (renderApp) {
        canvas.value!.width = Math.max(Math.min(
            size.width,
            renderApp.device.limits.maxTextureDimension2D,
        ), 1)
        canvas.value!.height = Math.max(Math.min(
            size.height,
            renderApp.device.limits.maxTextureDimension2D,
        ), 1)
        renderApp.render()
    }
})

</script>

<template>
    <div
        v-if="!isLesson(id)"
        class="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%] text-red"
    >No such lesson #{{ id }}!</div>
    <canvas
        v-else
        ref="canvas"
    >Your browser does not support the HTML5 canvas tag.</canvas>
    <footer
        v-if="lessonHasSettings"
        class="absolute block bottom-0 p-4 z-10"
    ><AppInspector :render-app="lesson"/></footer>
</template>
