export const ModelMetadataKey = Symbol("Model")

export function ensureMetadata(
    metadata: DecoratorMetadata
): Record<string|symbol, any> {
    if (!(ModelMetadataKey in metadata)) {
        metadata[ModelMetadataKey] = {}
    }
    return metadata[ModelMetadataKey] as Record<string|symbol, any>
}
