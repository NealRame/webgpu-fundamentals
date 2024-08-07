import type {
    TChapter,
} from "../types"

import chapter1 from "./1"
import chapter2 from "./2"
import chapter3 from "./3"
import chapter4 from "./4"
import chapter5 from "./5"
import chapter6 from "./6"

export const Chapters: Array<TChapter> = [{
    name: "Fundamentals",
    lessons: chapter1,
}, {
    name: "Inter-stage Variables",
    lessons: chapter2,
}, {
    name: "Uniforms",
    lessons: chapter3,
}, {
    name: "Storage Buffers",
    lessons: chapter4,
}, {
    name: "Vertex Buffers",
    lessons: chapter5,
}, {
    name: "Texture",
    lessons: chapter6,
}]
