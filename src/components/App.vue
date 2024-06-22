<script setup lang="ts">
import {
    computed,
    provide,
    ref,
    unref,
    watch,
} from "vue"

import {
    useResize,
} from "../composables"

import {
    hasModelMetadata,
} from "../decorators"

import {
    Lessons,
    type IRenderApp,
} from "../lessons"

import {
    KCurrentRenderApp,
} from "../keys"

import AppInspector from "./AppInspector"
import ComboBox from "./ComboBox.vue"

const canvas = ref<HTMLCanvasElement | null>(null)

const { size } = useResize(canvas, window.devicePixelRatio)
const lesson = ref<keyof typeof Lessons|null>(null)

const renderApp = ref<IRenderApp | null>(null)
const renderAppHasSettings = computed(() => hasModelMetadata(unref(renderApp)?.constructor))

const showRenderAppSettings = ref(false)

const toggleRenderAppSettings = () => {
    showRenderAppSettings.value = !showRenderAppSettings.value
}

provide(KCurrentRenderApp, renderApp)

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
        <button
            v-if="renderApp"
            @click.prevent="toggleRenderAppSettings"
        ><IconSettings/></button>
    </header>
    <canvas ref="canvas">
        Your browser does not support the HTML5 canvas tag.
    </canvas>
    <footer>
        <AppInspector v-if="renderAppHasSettings && showRenderAppSettings"
    />
    </footer>
</template>

<style lang="css" scoped>
header {
    display: flex;

    gap: .5rem;

    font-weight: 400;
    font-style: normal;

    margin: 0;
    padding: 1rem;

    position: absolute;

    z-index: 1;
}
header > button {
    cursor: pointer;
}
footer {
    display: block;

    font-weight: 400;
    font-style: normal;

    margin: 0;
    padding: 1rem;

    position: absolute;
    bottom: 0;

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
