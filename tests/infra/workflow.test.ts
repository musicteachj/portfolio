import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

interface Step {
  name?: string
  uses?: string
  run?: string
  if?: string
  with?: Record<string, unknown>
  env?: Record<string, string>
}
interface Job {
  'runs-on': string
  needs?: string
  if?: string
  concurrency?: { group?: string; 'cancel-in-progress'?: boolean }
  env?: Record<string, string>
  steps: Step[]
}
interface Workflow {
  on: Record<string, unknown>
  permissions: Record<string, string>
  jobs: Record<string, Job>
}

const workflow = parse(readFileSync('.github/workflows/deploy-aws.yml', 'utf8')) as Workflow
const build = workflow.jobs['build-and-test']!
const deploy = workflow.jobs['deploy']!

const EMAILJS = [
  'NUXT_PUBLIC_EMAILJS_SERVICE_ID',
  'NUXT_PUBLIC_EMAILJS_TEMPLATE_ID',
  'NUXT_PUBLIC_EMAILJS_PUBLIC_KEY',
]

const runIndex = (job: Job, cmd: string) => job.steps.findIndex((s) => s.run?.includes(cmd))
const allEnv = (job: Job) => [job.env ?? {}, ...job.steps.map((s) => s.env ?? {})]

describe('triggers and permissions', () => {
  it('runs on push, pull_request and workflow_dispatch', () => {
    expect(Object.keys(workflow.on)).toEqual(
      expect.arrayContaining(['push', 'pull_request', 'workflow_dispatch']),
    )
  })

  it('limits push to main and dev', () => {
    expect((workflow.on['push'] as { branches: string[] }).branches).toEqual(['main', 'dev'])
  })

  it('writes an html Playwright report under CI', () => {
    const config = readFileSync('playwright.config.ts', 'utf8')
    expect(config).toMatch(/process\.env\.CI\s*\?[^:]*'html'/)
  })

  it('is read-only by default', () => {
    expect(workflow.permissions).toEqual({ contents: 'read' })
  })
})

describe('build-and-test', () => {
  it('runs on ubuntu-latest with Node from .nvmrc and the npm cache', () => {
    expect(build['runs-on']).toBe('ubuntu-latest')
    const node = build.steps.find((s) => s.uses?.startsWith('actions/setup-node'))
    expect(node?.with).toMatchObject({ 'node-version-file': '.nvmrc', cache: 'npm' })
  })

  it('runs the gates in order', () => {
    const order = [
      'npm ci',
      'npm run lint',
      'npm run typecheck',
      'npm test',
      'npm run generate',
      'npm run test:output',
      'npm run check-seo',
      'npx playwright install --with-deps chromium firefox webkit',
      'npm run test:e2e',
    ]
    const indexes = order.map((cmd) =>
      build.steps.findIndex((s) =>
        s.run
          ?.split('\n')
          .map((l) => l.trim())
          .includes(cmd),
      ),
    )
    expect(indexes.every((i) => i >= 0)).toBe(true)
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes)
  })

  it('uses dummy EmailJS values, never secrets', () => {
    const env = Object.assign({}, ...allEnv(build)) as Record<string, string>
    for (const key of EMAILJS) {
      expect(env[key], key).toBeTruthy()
      expect(env[key]).not.toContain('secrets.')
    }
  })

  it('uploads the Playwright report on failure', () => {
    const upload = build.steps.find((s) => s.uses?.startsWith('actions/upload-artifact'))
    expect(upload?.if).toContain('failure()')
    expect(String(upload?.with?.path)).toContain('playwright-report')
  })
})

describe('deploy', () => {
  it('needs the build job and only runs for a push to main', () => {
    expect(deploy.needs).toBe('build-and-test')
    expect(deploy.if).toContain("github.event_name == 'push'")
    expect(deploy.if).toContain("github.ref == 'refs/heads/main'")
  })

  it('serializes runs without canceling one in progress', () => {
    expect(deploy.concurrency?.group).toBeTruthy()
    expect(deploy.concurrency?.['cancel-in-progress']).toBe(false)
  })

  it('maps the EmailJS values from the existing secrets', () => {
    const env = Object.assign({}, ...allEnv(deploy)) as Record<string, string>
    for (const key of EMAILJS) {
      const secret = key.replace('NUXT_PUBLIC_', 'VITE_')
      expect(env[key]).toBe(`\${{ secrets.${secret} }}`)
    }
  })

  it('guards against empty EmailJS values before generating', () => {
    const guard = deploy.steps.findIndex((s) => EMAILJS.every((k) => s.run?.includes(k)))
    expect(guard).toBeGreaterThanOrEqual(0)
    expect(guard).toBeLessThan(runIndex(deploy, 'npm run generate'))
  })

  it('generates, checks SEO, authenticates, syncs, then invalidates', () => {
    const awsLogin = deploy.steps.findIndex((s) =>
      s.uses?.startsWith('aws-actions/configure-aws-credentials'),
    )
    expect(deploy.steps[awsLogin]?.with?.['aws-region']).toBe('us-east-1')
    const indexes = [
      runIndex(deploy, 'npm run generate'),
      runIndex(deploy, 'npm run check-seo'),
      awsLogin,
      runIndex(deploy, 'node scripts/deploy-s3.mjs .output/public s3://jameslittlefield.net'),
      runIndex(deploy, 'aws cloudfront create-invalidation'),
    ]
    expect(indexes.every((i) => i >= 0)).toBe(true)
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes)
    const invalidate = deploy.steps[indexes[4]!]!.run!
    expect(invalidate).toContain('--paths "/*"')
    expect(invalidate).toContain('secrets.CLOUDFRONT_DISTRIBUTION_ID')
  })
})

describe('copy', () => {
  it('has no emoji or em dash in any run step', () => {
    for (const job of Object.values(workflow.jobs)) {
      for (const step of job.steps) {
        expect(step.run ?? '').not.toMatch(/\p{Extended_Pictographic}|\u2014/u)
      }
    }
  })
})
