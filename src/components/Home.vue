<script lang="ts">
export default { name: "Home" }
</script>

<script setup lang="ts">
import {
    Chapters,
} from "../lessons"

const linkStyle = ["text-blue", "hover:text-green"]
const listStyle = ["list-decimal", "text-green"]
</script>

<template>
    <div class="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
        <ol :class="listStyle" class="flex flex-col gap-4">
            <li v-for="(chapter, chapterIndex) in Chapters">
                <header class="text-xl">
                    <RouterLink
                        :class="linkStyle"
                        :to="{
                            name: 'chapter',
                            params: {
                                chapterIndex,
                            },
                        }"
                    >{{ chapter.name }}</RouterLink>
                </header>
                <ol :class="listStyle" class="px-8">
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
