import { spawnSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

function run(...args: string[]) {
  // PATH holds no aws, so a script that wrongly ran it would fail loudly (and
  // the test also asserts nothing was printed or run).
  return spawnSync(process.execPath, ['scripts/deploy-s3.mjs', ...args], {
    encoding: 'utf8',
    env: { ...process.env, PATH: '' },
  })
}

describe('deploy-s3 argument checking', () => {
  it.each([
    ['an unknown flag', ['.output/public', 'bucket', '--prnt']],
    ['an unknown flag in place of --print', ['--prnt', '.output/public', 'bucket']],
    ['one positional argument', ['--print', '.output/public']],
    ['three positional arguments', ['--print', 'a', 'b', 'c']],
    ['no arguments', []],
  ])('exits 2 with usage for %s and runs nothing', (_label, args) => {
    const res = run(...args)
    expect(res.status).toBe(2)
    expect(res.stderr).toContain('Usage:')
    expect(res.stdout).toBe('')
  })

  it('still prints the commands for valid arguments', () => {
    const res = run('.output/public', 'bucket', '--print')
    expect(res.status).toBe(0)
    expect(res.stdout).toContain('aws s3 sync')
  })
})
