<script lang="ts">
export default { name: "InputRange" }
</script>

<script setup lang="ts">
const { modelValue, min, max, step } = defineProps<{
    modelValue: number,
    min?: number,
    max?: number,
    step?: number,
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: number): void,
}>()

const onInput = (event: Event) => {
    const target = event.target as HTMLInputElement
    const value = Number(target.value)
    emit("update:modelValue", value)
}

const inputRangeStyle = [
    "w-full",
    "bg-transparent",
    "cursor-pointer",
    "appearance-none",
    "disabled:opacity-50",
    "disabled:pointer-events-none",
    "focus:outline-none",

    "[&::-webkit-slider-thumb]:w-2",
    "[&::-webkit-slider-thumb]:h-full",
    "[&::-webkit-slider-thumb]:appearance-none",
    "[&::-webkit-slider-thumb]:bg-red",
    "[&::-webkit-slider-thumb]:transition-all",
    "[&::-webkit-slider-thumb]:duration-150",
    "[&::-webkit-slider-thumb]:ease-in-out",
    "[&::-webkit-slider-thumb]:rounded",

    "[&::-moz-range-thumb]:w-2",
    "[&::-moz-range-thumb]:h-full",
    "[&::-moz-range-thumb]:appearance-none",
    "[&::-moz-range-thumb]:bg-red",
    "[&::-moz-range-thumb]:transition-all",
    "[&::-moz-range-thumb]:duration-150",
    "[&::-moz-range-thumb]:ease-in-out",

    "[&::-webkit-slider-runnable-track]:w-full",
    "[&::-webkit-slider-runnable-track]:h-3",
    "[&::-webkit-slider-runnable-track]:bg-gray-500",
    "[&::-webkit-slider-runnable-track]:rounded",

    "[&::-moz-range-track]:w-full",
    "[&::-moz-range-track]:h-3",
    "[&::-moz-range-track]:bg-gray-100",
]
</script>

<template>
    <input
        :class="inputRangeStyle"
        type="range"
        :min="min ?? 0"
        :max="max ?? 1"
        :step="step ?? Math.abs((max ?? 1) - (min ?? 0))/10"
        :value="modelValue"
        @input="onInput"
    >
</template>
