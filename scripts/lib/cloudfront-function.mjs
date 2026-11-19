import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'

const here = dirname(fileURLToPath(import.meta.url))
const defaultFile = resolve(here, '../../infra/cloudfront/viewer-request.js')

// Loads the CloudFront Function in a fresh vm context with a CommonJS-style
// `module`. The repo is "type": "module", so the file cannot be required, and
// running it this way also proves it has no import or export.
export function loadViewerRequest(file = defaultFile) {
  const module = { exports: {} }
  vm.runInNewContext(readFileSync(file, 'utf8'), { module }, { filename: file })
  return module.exports.handler
}
