import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(process.argv[2] ?? '.output/public')
const port = Number(process.argv[3] ?? 4173)

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

function candidate(pathname) {
  if (pathname === '/') return 'index.html'
  const clean = pathname.replace(/\/+$/, '')
  return extname(clean) ? clean : `${clean}/index.html`
}

async function tryRead(rel) {
  const file = resolve(join(root, normalize(rel)))
  if (!file.startsWith(root)) return null
  try {
    return { body: await readFile(file), file }
  } catch {
    return null
  }
}

createServer(async (req, res) => {
  let pathname
  try {
    pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
  } catch {
    pathname = '/__bad__'
  }
  const hit = await tryRead(candidate(pathname))
  if (hit) {
    res.writeHead(200, { 'Content-Type': types[extname(hit.file)] ?? 'application/octet-stream' })
    res.end(hit.body)
    return
  }
  const notFound = await tryRead('404.html')
  if (notFound) {
    res.writeHead(404, { 'Content-Type': types['.html'] })
    res.end(notFound.body)
    return
  }
  res.writeHead(404, { 'Content-Type': types['.txt'] })
  res.end('Not found')
}).listen(port, () => {
  console.log(`Serving ${root} at http://localhost:${port}`)
})
