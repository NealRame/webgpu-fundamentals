import Lesson1 from "./1"

export const Lessons = {
    "1": Lesson1
}

type TLessonId = keyof typeof Lessons

export * from "./render"

export function isLesson(id: string): id is TLessonId {
    return id in Lessons
}

export function createLesson(id: string, canvas: HTMLCanvasElement) {
    if (isLesson(id)) {
        return Lessons[id].create(canvas)
    }
    return null
}
