<script lang="ts">
export default { name: "AppInspector" }
</script>

<script setup lang="ts">
import {
    computed,
    inject,
    ref,
} from "vue"

import {
    hasModelMetadata,
} from "../../decorators"

import {
    KCurrentRenderApp,
} from "./keys"

import InspectorForm from "./InspectorForm"


const lesson = inject(KCurrentRenderApp) ?? ref(null)
const lessonHasSettings = computed(() => {
    return hasModelMetadata(lesson.value?.constructor)
})

const showSettings = ref(false)

const inspectorFramesClasses = computed(() => {
    return showSettings.value
        ? "rounded px-2 py-1"
        : "rounded-full"
})
</script>

<template>
    <aside
        v-if="lessonHasSettings"
        class="absolute bottom-2 left-2 border-2 bg-base bg-opacity-50 flex flex-col gap-1 text-white"
        :class="inspectorFramesClasses"
    >
        <button
            v-if="!showSettings"
            class="block w-8 h-8 p-0 m-0 hover:text-green"
            @click="showSettings = true"
        ><IconSettings/></button>

        <div
            v-if="showSettings"
            class="grid grid-cols-[1fr_auto] border-b"
        >
            <h1>Settings</h1>
            <button class="hover:text-green"><IconClose @click="showSettings = false"/></button>
        </div>

        <InspectorForm v-if="showSettings"/>
    </aside>
</template>
