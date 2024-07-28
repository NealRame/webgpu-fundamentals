<script lang="ts">
export default { name: "Chapter" }
</script>

<script setup lang="ts">
import {
    computed,
} from "vue";

import {
    Chapters,
} from "../lessons"

const { chapterIndex } = defineProps<{
    chapterIndex: string
}>()

const linkStyle = ["text-blue", "hover:text-green"]
const listStyle = [
    "absolute",
    "list-decimal",
    "text-green",
    "left-1/2",
    "top-1/2",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
]

const chapterLessons = computed(() => Chapters[Number(chapterIndex)].lessons)

</script>

<template>
    <ol :class="listStyle">
        <li v-for="(Lesson, lessonIndex) in chapterLessons" :key="lessonIndex">
            <RouterLink
                :class="linkStyle"
                :to="{
                    name: 'lesson',
                    params: {
                        chapterIndex,
                        lessonIndex,
                    },
                }"
            >{{ Lesson.title }}</RouterLink>
        </li>
    </ol>
</template>

