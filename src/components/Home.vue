<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">
import {
    Lessons,
} from "../lessons"

const linkStyle = ["text-blue", "hover:text-green"]
const listStyle = [
    "absolute",
    "left-1/2",
    "top-1/2",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
]
</script>

<template>
    <ul :class="listStyle">
        <li v-for="(_, id) in Lessons">
            <RouterLink
                :class="linkStyle"
                :to="{
                    name: 'lesson',
                    params: {
                        id,
                    },
                }"
            >Lesson #{{ id }}</RouterLink>
        </li>
    </ul>
</template>

