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
