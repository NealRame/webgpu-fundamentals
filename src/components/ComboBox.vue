<script lang="ts">
export default { name: "ComboBox" }
</script>

<script setup lang="ts">
import {
    ref,
} from "vue"

const {
    modelValue,
    placeholder,
    items,
} = defineProps<{
    modelValue: string|null,
    placeholder: string,
    items: Array<string>,
}>()

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>()

const isActive = ref<boolean>(false)

const onInputChanged = ($ev: Event) => {
    const input = $ev.target as HTMLInputElement
    const value = input.value
    emit("update:modelValue", value)
}

const toggleActive = () => {
    isActive.value = !isActive.value
}
</script>

<template>
    <form class="combo-box" :class="{ active: isActive }">
        <button id="select" ref="select" @click.prevent="toggleActive">
            <span v-if="modelValue">{{ modelValue }}</span>
            <span v-else class="placeholder">{{ placeholder }}</span>
        </button>
        <ul id="choices">
            <li v-for="(item, index) in items"
                :class="{ active: modelValue === item }"
                :key="index"
            >
                <label><input
                    name="combo-box"
                    type="radio"
                    :value="item"
                    @input="onInputChanged"
                >{{ item }}</label>
            </li>
        </ul>
    </form>
</template>

<style lang="css">
.combo-box {
    position: relative;
    width: 100%;
}
.combo-box #select {
    box-sizing: border-box;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: .5rem;
}
.combo-box #select::after {
    content: ">";
    transition: transform var(--transition-duration-fast);
}
.combo-box.active #select::after {
    transform: rotate(90deg);
}
.combo-box ul {
    background-color: var(--bg-color);
    box-sizing: border-box;
    display: none;
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    padding: .25rem .5rem;
    margin: 0;
    margin-top: .25rem;
    list-style: none;
    overflow: hidden;
    position: absolute;
    width: 100%;

}
.combo-box > ul > li.active,
.combo-box > ul > li:hover {
    background-color: var(--bg-color-hover);
}
.combo-box > ul > li > label {
    cursor: pointer;
    display: inline-block;
    width: 100%;
}
.combo-box > ul > li > label > input[type="radio"] {
    display: none;
}
.combo-box.active ul {
    display: flex;
    flex-direction: column;
}
</style>
