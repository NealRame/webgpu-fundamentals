import {
    Chapters,
} from "./chapters"

import {
    IRenderApp,
} from "../renderapp"


export function createLesson(
    chapterIndex: string,
    lessonIndex: string,
    canvas: HTMLCanvasElement,
): Promise<IRenderApp> {
    const chapter = Chapters[Number(chapterIndex)]

    if (chapter == null) {
        throw Error(`No such chapter #${chapterIndex}!`)
    }

    const Lesson = chapter.lessons[Number(lessonIndex)]

    if (Lesson == null) {
        throw Error(`No such lesson #${lessonIndex}!`)
    }

    return Lesson.create(canvas)
}

export * from "./chapters"
export * from "./types"
