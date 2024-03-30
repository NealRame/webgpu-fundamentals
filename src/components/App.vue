<script setup lang="ts">
import {
    ref,
    watch,
} from "vue"

import {
    useResize,
} from "../composables"

import {
    Lessons,
    RenderApp,
} from "../lessons"

import ComboBox from "./ComboBox.vue"

const canvas = ref<HTMLCanvasElement | null>(null)

const { size } = useResize(canvas, window.devicePixelRatio)
const lesson = ref<keyof typeof Lessons|null>(null)

const renderApp = ref<RenderApp | null>(null)

watch([size, renderApp], ([size, renderApp]) => {
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

watch(lesson, async lesson => {
    if (canvas.value) {
        if (lesson != null) {
            renderApp.value = await Lessons[lesson].create(canvas.value)
        } else {
            renderApp.value = null
        }
    }
})
</script>

<template>
    <header>
        <ComboBox
            placeholder="Select a lesson"
            v-model="lesson"
            :items="Object.keys(Lessons)"
        />
    </header>
    <canvas ref="canvas">
        Your browser does not support the HTML5 canvas tag.
    </canvas>
</template>

<style>
header {
    display: block;

    font-weight: 400;
    font-style: normal;

    margin: 0;
    padding: 1rem;

    position: absolute;

    z-index: 1;
}
canvas {
    display: block;

    margin: 0;

    position: absolute;

    width: 100%;
    height: 100%;
}
</style>
