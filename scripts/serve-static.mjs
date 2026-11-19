import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve, sep } from 'node:path'
import { promisify } from 'node:util'
import { brotliCompress, constants, gzip } from 'node:zlib'
import { loadViewerRequest } from './lib/cloudfront-function.mjs'

const root = resolve(process.argv[2] ?? '.output/public')
const port = Number(process.argv[3] ?? 4173)

// The same CloudFront Function that runs in production decides redirects and rewrites.
const viewerRequest = loadViewerRequest()

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.vtt': 'text/vtt; charset=utf-8',
}

// Like CloudFront in production: text responses of 1,000 bytes or more go out Brotli or
// gzip compressed when the browser accepts it. Lighthouse sizes its throttled network
// estimates on the transferred bytes, so an uncompressed local server skews them.
const compressible = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt', '.xml'])
const brotli = promisify(brotliCompress)
const gzipAsync = promisify(gzip)

async function encode(req, file, body) {
  if (!compressible.has(extname(file)) || body.length < 1000) return { body }
  const accepted = String(req.headers['accept-encoding'] ?? '')
  if (/\bbr\b/.test(accepted)) {
    const params = { [constants.BROTLI_PARAM_QUALITY]: 5, [constants.BROTLI_PARAM_SIZE_HINT]: body.length }
    return { body: await brotli(body, { params }), encoding: 'br' }
  }
  if (/\bgzip\b/.test(accepted)) return { body: await gzipAsync(body), encoding: 'gzip' }
  return { body }
}

async function send(req, res, status, file, body) {
  const out = await encode(req, file, body)
  const headers = { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }
  if (compressible.has(extname(file))) headers.Vary = 'Accept-Encoding'
  if (out.encoding) headers['Content-Encoding'] = out.encoding
  res.writeHead(status, headers)
  res.end(out.body)
}

// Builds the CloudFront event from the raw (still percent-encoded) path and query.
function buildEvent(req) {
  const raw = req.url ?? '/'
  const q = raw.indexOf('?')
  const uri = q === -1 ? raw : raw.slice(0, q)
  const querystring = {}
  if (q !== -1) {
    for (const pair of raw.slice(q + 1).split('&')) {
      if (!pair) continue
      const eq = pair.indexOf('=')
      const name = eq === -1 ? pair : pair.slice(0, eq)
      const value = eq === -1 ? '' : pair.slice(eq + 1)
      const entry = querystring[name]
      if (!entry) querystring[name] = { value }
      else (entry.multiValue ??= [{ value: entry.value }]).push({ value })
    }
  }
  return { request: { method: req.method, uri, querystring, headers: {} } }
}

async function tryRead(rel) {
  const file = resolve(join(root, normalize(rel)))
  if (file !== root && !file.startsWith(root + sep)) return null
  try {
    return { body: await readFile(file), file }
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  const result = viewerRequest(buildEvent(req))
  if (result.statusCode) {
    res.writeHead(result.statusCode, { Location: result.headers.location.value })
    res.end()
    return
  }
  let rel
  try {
    rel = decodeURIComponent(result.uri)
  } catch {
    rel = '/__bad__'
  }
  const hit = await tryRead(rel)
  if (hit) {
    await send(req, res, 200, hit.file, hit.body)
    return
  }
  const notFound = await tryRead('404.html')
  if (notFound) {
    await send(req, res, 404, notFound.file, notFound.body)
    return
  }
  res.writeHead(404, { 'Content-Type': types['.txt'] })
  res.end('Not found')
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`)
})
