import Lesson1 from "./1"
import Lesson2 from "./2"
import Lesson3 from "./3"
import Lesson4 from "./4"

import { IRenderApp } from "./render"

export const Lessons = {
    "1": Lesson1,
    "2": Lesson2,
    "3": Lesson3,
    "4": Lesson4,
}

function isLesson(id: string): id is (keyof typeof Lessons) {
    return id in Lessons
}

export function createLesson(
    id: string,
    canvas: HTMLCanvasElement,
): Promise<IRenderApp> {
    if (!isLesson(id)) {
        throw Error(`No such lesson #${id}!`)
    }
    return Lessons[id].create(canvas)
}

export * from "./render"
