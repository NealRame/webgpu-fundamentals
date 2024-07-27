<script lang="ts">
export default { name: "AppInspector" }
</script>

<script setup lang="ts">
import {
    computed,
    inject,
    ref,
    unref,
} from "vue"

import {
    hasModelMetadata,
} from "../../decorators"

import {
    KCurrentRenderApp,
} from "./keys"

import InspectorForm from "./InspectorForm"


const emit = defineEmits(["changed"])

const lesson = inject(KCurrentRenderApp) ?? ref(null)
const lessonHasSettings = computed(() => {
    return hasModelMetadata(lesson.value?.constructor)
})

const showSettings = ref(false)
const animationLoop = ref(false)

const inspectorFramesClasses = computed(() => {
    return showSettings.value
        ? "rounded px-2 py-1"
        : "rounded-full"
})

function toggleAnimationLoop() {
    if (lesson.value != null) {
        animationLoop.value = !unref(animationLoop)
        if (animationLoop.value) {
            lesson.value.start()
        } else {
            lesson.value.stop()
        }
    } else {
        animationLoop.value = false
    }
}

function toggleSettings() {
    if (lesson.value != null) {
        showSettings.value = !unref(showSettings)
    } else {
        showSettings.value = false
    }
}

</script>

<template>
    <aside
        class="absolute bottom-2 left-2 flex gap-1 items-end text-white"
    >
        <div
            class="border-2 bg-base bg-opacity-50 gap-1 rounded-full"
        >
            <button
                v-if="animationLoop"
                class="w-8 h-8 p-0 m-0 hover:text-green"
                @click="toggleAnimationLoop"
            ><IconPause/></button>
            <button
                v-else
                class="w-8 h-8 p-0 m-0 hover:text-green"
                @click="toggleAnimationLoop"
            ><IconPlay/></button>
        </div>
        <div
            v-if="lessonHasSettings"
            class="bg-base bg-opacity-50 border-2 "
            :class="inspectorFramesClasses"
        >
            <div
                v-if="showSettings"
                class="flex flex-col gap-1"
            >
                <div class="border-b grid grid-cols-[1fr_auto]">
                    <h1>Settings</h1>
                    <button
                        class="hover:text-green"
                        @click="toggleSettings"
                    ><IconClose/></button>
                </div>
                <InspectorForm @changed="$emit('changed')"/>
            </div>
            <button
                v-else
                class="block w-8 h-8 p-0 m-0 hover:text-green"
                @click="toggleSettings"
            ><IconSettings/></button>
        </div>
    </aside>
</template>
