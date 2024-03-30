type RGBA = [number, number, number, number]


export function createCircleVertices({
    outerRadius = 1.0,
    innerRadius = 0.5,
    subdivisions = 32,
    startAngle = 0,
    endAngle = 2*Math.PI,
}) {
    const verticeCount = subdivisions*2*3
    const vertexData = new Float32Array(verticeCount*2)
    const angle = endAngle - startAngle

    let vertexDataOffset = 0
    const addVertex = (x: number, y: number) => {
        vertexData[vertexDataOffset++] = x
        vertexData[vertexDataOffset++] = y
    }

    for (let i = 0; i < subdivisions; ++i) {
        const angle0 = startAngle + (i + 0)*(angle/subdivisions)
        const angle1 = startAngle + (i + 1)*(angle/subdivisions)

        const c0 = Math.cos(angle0)
        const s0 = Math.sin(angle0)
        const c1 = Math.cos(angle1)
        const s1 = Math.sin(angle1)

        const xA = c0*innerRadius, yA = s0*innerRadius
        const xB = c0*outerRadius, yB = s0*outerRadius
        const xC = c1*outerRadius, yC = s1*outerRadius
        const xD = c1*innerRadius, yD = s1*innerRadius

        addVertex(xA, yA)
        addVertex(xB, yB)
        addVertex(xC, yC)

        addVertex(xA, yA)
        addVertex(xC, yC)
        addVertex(xD, yD)
    }

    return {
        vertexData,
        verticeCount
    }
}


export function createCircleVerticesWithIndex({
    outerRadius = 1.0,
    innerRadius = 0.5,
    subdivisions = 32,
    startAngle = 0,
    endAngle = 2*Math.PI,
}) {
    const angle = endAngle - startAngle
    const verticeCount = 2*(subdivisions + 1)
    
    const vertexData = new Float32Array(2*verticeCount)
    const indexData = new Uint32Array(6*subdivisions)

    let vertexDataOffset = 0
    const addVertex = (x: number, y: number) => {
        vertexData[vertexDataOffset++] = x
        vertexData[vertexDataOffset++] = y
    }

    for (let i = 0; i <= subdivisions; ++i) {
        const alpha = startAngle + (i + 0)*(angle/subdivisions)
        const cosAlpha = Math.cos(alpha)
        const sinAlpha = Math.sin(alpha)

        addVertex(cosAlpha*outerRadius, sinAlpha*outerRadius)
        addVertex(cosAlpha*innerRadius, sinAlpha*innerRadius)
    }

    // 0---2---3
    // | //| //|
    // |// |// |
    // 1---3---4
    let indexDataOffset = 0
    for (let i = 0; i < subdivisions; ++i) {
        const offset = i*2

        indexData[indexDataOffset++] = offset + 0
        indexData[indexDataOffset++] = offset + 1
        indexData[indexDataOffset++] = offset + 2

        indexData[indexDataOffset++] = offset + 3
        indexData[indexDataOffset++] = offset + 2
        indexData[indexDataOffset++] = offset + 1
    }

    return {
        indexData,
        vertexData,
        verticeCount: indexData.length,
    }
}


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


export function isNil(value: any) {
    return value == null
}


export function elementHas(
    el: Element | null,
    target: Element
): boolean {
    if (el !== target) {
        return Array.from(el?.children ?? []).some(child => elementHas(child, target))
    }
    return true
}
