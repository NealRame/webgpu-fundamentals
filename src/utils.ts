/**
 * Checks if a value is null or undefined.
 * 
 * @param value - The value to check.
 * @returns `true` if the value is null or undefined, `false` otherwise.
 */
export function isNil(value: any) {
    return value == null
}

/**
 * Checks if a value is truthy.
 * @param v - The value to check.
 * @returns `true` if the value is truthy, otherwise `false`.
 */
export function truthy(v: any) {
    return !!v
}
