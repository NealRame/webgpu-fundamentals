<script lang="ts">
export default { name: "Lesson" }
</script>

<script setup lang="ts">
import {
    computed,
    provide,
    ref,
    watch,
} from "vue"

import {
    useResize,
} from "../composables"

import {
    createLesson,
} from "../lessons"

import {
    type IRenderApp,
} from "../renderapp"

import {
    type TSize,
} from "../types"

import {
    KCurrentRenderApp,
} from "./AppInspector"


const { chapterIndex, lessonIndex } = defineProps<{
    chapterIndex: string,
    lessonIndex: string,
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const error  = ref<Error | null>(null)
const lesson = ref<IRenderApp | null>(null)

// the canvas element style must match {
//    display: block;
//    width: 100%;
//    height: 100%;
// }
const { devicePixelSize: size } = useResize(canvas)

const resolution = computed(() => {
    if (lesson.value == null || size.value == null) {
        return {
            width: 0,
            height: 0,
        }
    }
    return lesson.value.resize(size.value)
})


provide(KCurrentRenderApp, lesson)

function resize([size, lesson]: [TSize, IRenderApp | null]) {
    if (canvas.value) {
        if (lesson) {
            const { width, height } = lesson.resize(size)

            canvas.value.width = Math.max(1, Math.min(
                lesson.device.limits.maxTextureDimension2D,
                width,
            ))
            canvas.value.height = Math.max(1, Math.min(
                lesson.device.limits.maxTextureDimension2D,
                height,
            ))
            if (!lesson.isRunning) {
                lesson.render()
            }
        } else {
            canvas.value.width = size.width
            canvas.value.height = size.height
        }
    }
}

function onChanged() {
    resize([size.value, lesson.value])
}

watch(canvas, async canvas => {
    if (canvas) {
        try {
            lesson.value = await createLesson(chapterIndex, lessonIndex, canvas)
            lesson.value?.render()
        } catch (err) {
            if (err instanceof Error) {
                error.value = err
                console.error(err)
            }
        }
    } else {
        lesson.value = null
    }
})

watch([size, lesson], resize)
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
    <AppInspector @changed="onChanged"/>
    <aside class="absolute bottom-2 right-2 flex gap-1 items-end text-white">
        <span v-if="canvas">{{ resolution.width }} x {{ resolution.height }}</span>
    </aside>
</template>
