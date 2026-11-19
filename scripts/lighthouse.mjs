// Lighthouse gate for the generated site. Serves .output/public with serve-static.mjs,
// audits each page with Lighthouse's default config (the mobile preset with simulated
// throttling) in Playwright's Chromium, writes JSON and HTML reports to .lighthouse/,
// prints the four category scores per page and exits 1 if any is below 0.95.
// Run `npm run generate` first.
import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '@playwright/test'
import * as chromeLauncher from 'chrome-launcher'
import lighthouse from 'lighthouse'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, '.output/public')
const reportDir = join(root, '.lighthouse')
const port = 4319
const origin = `http://localhost:${port}`
const threshold = 0.95
const pages = [
  { name: 'home', path: '/' },
  { name: 'open-door', path: '/projects/open-door' },
]
const categories = ['performance', 'accessibility', 'best-practices', 'seo']

let server
let chrome

async function cleanup() {
  if (server && server.exitCode === null) server.kill()
  server = undefined
  await chrome?.kill()
  chrome = undefined
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    cleanup().finally(() => process.exit(1))
  })
}

// Resolves once the server prints its "Serving" line; rejects if it exits first
// (for example, when port 4319 is already taken).
function startServer() {
  return new Promise((ok, fail) => {
    const child = spawn(process.execPath, [join(root, 'scripts/serve-static.mjs'), publicDir, String(port)], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let stderr = ''
    child.stderr.on('data', (d) => (stderr += d))
    child.stdout.on('data', (d) => {
      if (String(d).includes('Serving')) ok(child)
    })
    child.on('error', fail)
    child.on('exit', (code) => fail(new Error(`static server exited (code ${code}) before it was ready\n${stderr}`)))
  })
}

async function audit(page) {
  chrome = await chromeLauncher.launch({
    chromePath: chromium.executablePath(),
    chromeFlags: ['--headless=new'],
    // This script's own SIGINT handler stops Chromium and the server together.
    handleSIGINT: false,
  })
  try {
    const result = await lighthouse(`${origin}${page.path}`, {
      port: chrome.port,
      output: ['json', 'html'],
      logLevel: 'error',
    })
    if (!result) throw new Error(`Lighthouse returned no result for ${page.path}`)
    const [json, html] = result.report
    await writeFile(join(reportDir, `${page.name}.report.json`), json)
    await writeFile(join(reportDir, `${page.name}.report.html`), html)
    return result.lhr
  } finally {
    await chrome.kill()
    chrome = undefined
  }
}

function format(score) {
  return score === null || score === undefined ? 'n/a' : score.toFixed(2)
}

// Audits in a category that lose points, so a failing run says why.
function failingAudits(lhr, categoryId) {
  return lhr.categories[categoryId].auditRefs
    .filter((ref) => ref.weight > 0)
    .map((ref) => lhr.audits[ref.id])
    .filter((a) => a.score !== null && a.score < 0.9)
    .map((a) => `${a.id} (${format(a.score)}${a.displayValue ? `, ${a.displayValue}` : ''})`)
}

async function main() {
  if (!existsSync(join(publicDir, 'index.html'))) {
    throw new Error('.output/public/index.html is missing. Run `npm run generate` first.')
  }
  await mkdir(reportDir, { recursive: true })
  server = await startServer()

  let failed = false
  for (const page of pages) {
    const lhr = await audit(page)
    console.log(`\n${page.path}`)
    if (lhr.runtimeError) {
      console.log(`  runtime error: ${lhr.runtimeError.code} ${lhr.runtimeError.message}`)
      failed = true
    }
    for (const warning of lhr.runWarnings) console.log(`  warning: ${warning}`)
    for (const id of categories) {
      const score = lhr.categories[id]?.score
      const ok = typeof score === 'number' && score >= threshold
      if (!ok) failed = true
      console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${id.padEnd(15)} ${format(score)}`)
      if (!ok && lhr.categories[id]) {
        for (const line of failingAudits(lhr, id)) console.log(`         ${line}`)
      }
    }
  }
  console.log(`\nReports: ${reportDir}`)
  return failed
}

let exitCode = 0
try {
  if (await main()) {
    console.log(`\nAt least one score is below ${threshold}.`)
    exitCode = 1
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err)
  exitCode = 1
} finally {
  await cleanup()
}
process.exit(exitCode)
