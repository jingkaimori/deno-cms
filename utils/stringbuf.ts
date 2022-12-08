export function string2buf(str:string) {
    const length = str.length
    const buffer = new Uint16Array(length)
    for (let index = 0; index < length; index++) {
        buffer[index] = str.charCodeAt(index)
    }
    return buffer
}