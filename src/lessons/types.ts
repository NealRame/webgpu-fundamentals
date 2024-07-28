import type {
    IRenderApp,
} from "../renderapp"


export type TLessonClass = {
    readonly title: string
    readonly description: string

    create(canvas: HTMLCanvasElement): Promise<IRenderApp>
}

export type TChapter = {
    name: string,
    lessons: Array<TLessonClass>
}
