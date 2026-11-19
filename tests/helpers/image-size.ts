import { readFileSync } from 'node:fs'

const PNG_SIGNATURE = '\x89PNG\r\n\x1a\n'

function isSof(marker: number): boolean {
  return (
    (marker >= 0xc0 && marker <= 0xc3) ||
    (marker >= 0xc5 && marker <= 0xc7) ||
    (marker >= 0xc9 && marker <= 0xcb) ||
    (marker >= 0xcd && marker <= 0xcf)
  )
}

/** Reads width and height from a PNG or JPEG file. Throws on any other format. */
export function imageSize(file: string): { width: number; height: number } {
  const buf = readFileSync(file)
  if (buf.length >= 24 && buf.subarray(0, 8).toString('latin1') === PNG_SIGNATURE) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }
  if (buf.length >= 4 && buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2
    while (i + 3 < buf.length) {
      if (buf[i] !== 0xff) {
        i++
        continue
      }
      const marker = buf[i + 1]!
      if (marker === 0xff) {
        i++ // fill byte
        continue
      }
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
        i += 2 // standalone marker, no length
        continue
      }
      if (isSof(marker)) {
        return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
      }
      i += 2 + buf.readUInt16BE(i + 2)
    }
  }
  throw new Error(`Unsupported image: ${file}`)
}
