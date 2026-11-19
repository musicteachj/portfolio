// Usage: node scripts/deploy-s3.mjs <src> <bucket> [--print]
// --print shows the aws commands and runs nothing.
import { execFileSync } from 'node:child_process'
import { syncCommands } from '../infra/deploy/sync-passes.mjs'

const args = process.argv.slice(2)
const print = args.includes('--print')
const flags = args.filter((a) => a.startsWith('--'))
const positional = args.filter((a) => !a.startsWith('--'))
const [src, bucket] = positional

if (flags.some((a) => a !== '--print') || positional.length !== 2) {
  console.error('Usage: node scripts/deploy-s3.mjs <src> <bucket> [--print]')
  process.exit(2)
}

const quote = (arg) =>
  /^[A-Za-z0-9_@%+=:,./-]+$/.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`

for (const argv of syncCommands(src, bucket)) {
  if (print) {
    console.log(['aws', ...argv].map(quote).join(' '))
  } else {
    execFileSync('aws', argv, { stdio: 'inherit' })
  }
}
