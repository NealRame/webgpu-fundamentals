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
</script>

<template>
    <input
        type="range"
        :min="min ?? 0"
        :max="max ?? 1"
        :step="step ?? Math.abs((max ?? 1) - (min ?? 0))/10"
        :value="modelValue"
        @input="onInput"
    >
</template>

<style lang="css" scoped>
/* Code stolen from https://codepen.io/t_afif/pen/KKGpmGE */
input {
    --c1: var(--fg-color, orange);                           /* fill color */
    --c2: color-mix(in srgb, var(--c1), var(--bg-color));     /* empty color */
    --g: 4px;                                                     /* the gap */
    --l: 2px;                                               /* line thickness*/
    --s: 8px;                                                   /* thumb size*/
    --r: 2px;                                         /* thumb border radius */
    --_c: color-mix(in srgb, var(--c1), white);
    -webkit-appearance :none;
    -moz-appearance :none;
    appearance :none;
    background: none;
    cursor: pointer;
    overflow: hidden;
}
input:active,
input:focus-visible {
  --_b: var(--s);
  --_c: color-mix(in srgb, var(--c1), cyan);
}
/* chromium */
input[type="range"]::-webkit-slider-thumb {
    appearance: none;
    -webkit-appearance: none;
    aspect-ratio: 1;
    height: var(--s);
    box-shadow: 0 0 0 var(--_b, var(--l)) inset var(--_c);
    border-image:
        linear-gradient(90deg, var(--_c) 50%, var(--c2) 0) 0 1
            / calc(50% - var(--l)/2) 100vw
            / 0 calc(100vw + var(--g));
    border-radius: var(--r);
    transition: var(--transition-duration-slow, 0);
}
</style>
