import type {
    TChapter,
} from "../types"

import chapter1 from "./1"
import chapter2 from "./2"
import chapter3 from "./3"

export const Chapters: Array<TChapter> = [{
    name: "Fundamentals",
    lessons: chapter1,
}, {
    name: "Inter-stage Variables",
    lessons: chapter2,
}, {
    name: "Uniforms",
    lessons: chapter3,
}]
