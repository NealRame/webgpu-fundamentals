export type TCircleConfig = {
    radius: number
    innerRadius: number
    numSubdivision: number
    startAngle: number
    endAngle: number
}

export const CircleConfigDefault: TCircleConfig = {
    radius: 1,
    innerRadius: 0,
    startAngle: 0,
    endAngle: 2*Math.PI,
    numSubdivision: 24,
}

export type TShapeData = {
    vertexData: Float32Array
    vertexCount: number
}

export function createCircleVertices(
    options: Partial<TCircleConfig> = {},
): TShapeData {
    const {
        endAngle,
        innerRadius,
        numSubdivision,
        radius,
        startAngle,
    } =  { ...CircleConfigDefault, ...options }

    const angle = (endAngle - startAngle)/numSubdivision
    const vertexCount = 2*3*numSubdivision
    const vertexData = new Float32Array(2*vertexCount)

    for (let i = 0, offset = 0; i < numSubdivision; ++i) {
        const angle1 = startAngle + (i + 0)*angle
        const angle2 = startAngle + (i + 1)*angle

        const c1 = Math.cos(angle1)
        const s1 = Math.sin(angle1)
        const c2 = Math.cos(angle2)
        const s2 = Math.sin(angle2)

        vertexData[offset++] = c1*radius
        vertexData[offset++] = s1*radius
        vertexData[offset++] = c2*radius
        vertexData[offset++] = s2*radius
        vertexData[offset++] = c1*innerRadius
        vertexData[offset++] = s1*innerRadius
        vertexData[offset++] = c1*innerRadius
        vertexData[offset++] = s1*innerRadius
        vertexData[offset++] = c2*radius
        vertexData[offset++] = s2*radius
        vertexData[offset++] = c2*innerRadius
        vertexData[offset++] = s2*innerRadius
    }

    return {
        vertexCount,
        vertexData,
    }
}
