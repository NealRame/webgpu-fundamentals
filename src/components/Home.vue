<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">
import {
    Chapters,
} from "../lessons"

const menuStyle = [
    "absolute",
    "left-1/2",
    "top-1/2",
    "translate-x-[-50%]",
    "translate-y-[-50%]",
]
const linkStyle = ["text-blue", "hover:text-green"]
</script>

<template>
    <div :class="menuStyle">
        <h1 class="border-b border-green mb-4 pb-2 text-center text-green text-4xl">Lessons</h1>
        <ol class="chapter-list flex flex-col gap-4">
            <li v-for="(chapter, chapterIndex) in Chapters">
                <span class="text-lg">
                    <RouterLink
                        :class="linkStyle"
                        :to="{
                            name: 'chapter',
                            params: {
                                chapterIndex,
                            },
                        }"
                    >{{ chapter.name }}</RouterLink>
                </span>
                <ol class="lesson-list px-8">
                    <li v-for="(Lesson, lessonIndex) in chapter.lessons">
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
            </li>
        </ol>
    </div>
</template>
