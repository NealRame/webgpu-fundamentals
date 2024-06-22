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
    <ul>
        <li>r <InputRange v-model="r" :step="step"/></li>
        <li>g <InputRange v-model="g" :step="step"/></li>
        <li>b <InputRange v-model="b" :step="step"/></li>
        <li>a <InputRange v-model="a" :step="step"/></li>
    </ul>
    <div class="rgba-color-swatch" :style="cssColor"></div>
</template>

<style lang="css" scoped>
.rgba-color-swatch {
    border: var(--border-thickness, 1px) solid var(--border-color);
    border-radius: var(--border-radius, 0);
    margin: .25rem 0;
}
ul {
    list-style: none;
    margin: 0;
    padding: 0;
}
</style>
