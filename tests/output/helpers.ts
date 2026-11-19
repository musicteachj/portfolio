import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse, type HTMLElement } from 'node-html-parser'

export const OUTPUT_DIR = '.output/public'

export function exists(rel: string): boolean {
  return existsSync(join(OUTPUT_DIR, rel))
}

export function read(rel: string): string {
  return readFileSync(join(OUTPUT_DIR, rel), 'utf8')
}

export function html(rel: string): HTMLElement {
  return parse(read(rel))
}

export function pngSize(rel: string): { width: number; height: number } {
  const buf = readFileSync(join(OUTPUT_DIR, rel))
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

// Every shipped stylesheet, lowercased with whitespace removed: external
// _nuxt/*.css files plus any <style> blocks inlined into index.html.
export function cssBundle(): string {
  const dir = join(OUTPUT_DIR, '_nuxt')
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.css')) : []
  const external = files.map((f) => readFileSync(join(dir, f), 'utf8'))
  const inline = html('index.html')
    .querySelectorAll('style')
    .map((s) => s.text)
  return [...external, ...inline].join('\n').toLowerCase().replace(/\s+/g, '')
}
