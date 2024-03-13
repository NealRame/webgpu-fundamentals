type RGBA = [number, number, number, number]

export function randomFloat(min: number, max: number) {
    return Math.random()*(max - min) + min
}

export function randomColor(): RGBA {
    return [
        randomFloat(0, 1),
        randomFloat(0, 1),
        randomFloat(0, 1),
        1
    ]
}
