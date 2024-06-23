<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">
import {
    Lessons,
} from "../lessons"

const style = ["text-blue"]

</script>

<template>
    <ul class="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <li v-for="(_, id) in Lessons">
            <RouterLink
                :class="style"
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

