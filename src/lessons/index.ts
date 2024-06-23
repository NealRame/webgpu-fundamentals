import Lesson1 from "./1"
import { IRenderApp } from "./render"

export const Lessons = {
    "1": Lesson1
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
