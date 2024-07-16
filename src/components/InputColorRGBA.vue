<script lang="ts">
export default { name: "InputRange" }
</script>

<script setup lang="ts">
import {
    type Ref,
    computed,
    ref,
    unref,
    watch,
} from "vue"

import type {
    TColorRGBA,
} from "../types"

import InputRange from "./InputRange.vue"

const { modelValue } = defineProps<{
    modelValue: TColorRGBA,
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: TColorRGBA): void,
}>()

const r = ref<number>(modelValue[0])
const g = ref<number>(modelValue[1])
const b = ref<number>(modelValue[2])
const a = ref<number>(modelValue[3])

const step = 1/256;

function convert(c: Ref<number>) {
    return Math.round(unref(c)*255)
}

const cssColor = computed(() => ({
    backgroundColor: `rgba(${convert(r)} ${convert(g)} ${convert(b)} / ${unref(a)})`
}))

watch([r, g, b, a], (color) => {
    emit("update:modelValue", color)
})
</script>

<template>
    <ul class="flex flex-col list-none m-0 p-0">
        <li class="flex items-center gap-x-1"><InputRange v-model="r" :step="step"/>r</li>
        <li class="flex items-center gap-x-1"><InputRange v-model="g" :step="step"/>g</li>
        <li class="flex items-center gap-x-1"><InputRange v-model="b" :step="step"/>b</li>
        <li class="flex items-center gap-x-1"><InputRange v-model="a" :step="step"/>a</li>
    </ul>
    <div class="border-2 border-white rounded my-1" :style="cssColor"></div>
</template>
