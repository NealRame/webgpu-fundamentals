import Lesson1 from  "./1"
import Lesson2 from  "./2"
import Lesson3 from  "./3"
import Lesson4 from  "./4"
import Lesson5 from  "./5"
import Lesson6 from  "./6"
import Lesson7 from  "./7"
import Lesson8 from  "./8"
import Lesson9 from  "./9"
import Lesson10 from "./10"
import Lesson11 from "./11"
import Lesson12 from "./12"
import Lesson13 from "./13"
import Lesson14 from "./14"
import Lesson15 from "./15"


import {
    IRenderApp,
} from "./render"

export const Lessons = {
    "1" : Lesson1,
    "2" : Lesson2,
    "3" : Lesson3,
    "4" : Lesson4,
    "5" : Lesson5,
    "6" : Lesson6,
    "7" : Lesson7,
    "8" : Lesson8,
    "9" : Lesson9,
    "10": Lesson10,
    "11": Lesson11,
    "12": Lesson12,
    "13": Lesson13,
    "14": Lesson14,
    "15": Lesson15,
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
