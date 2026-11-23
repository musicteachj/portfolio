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
  'timeout-minutes'?: number
  needs?: string
  if?: string
  environment?: string
  permissions?: Record<string, string>
  concurrency?: { group?: string; 'cancel-in-progress'?: boolean }
  env?: Record<string, string>
  steps: Step[]
}
interface Workflow {
  on: Record<string, unknown>
  concurrency?: { group?: string; 'cancel-in-progress'?: boolean | string }
  permissions: Record<string, string>
  jobs: Record<string, Job>
}

const workflowText = readFileSync('.github/workflows/deploy-aws.yml', 'utf8')
const workflow = parse(workflowText) as Workflow
const build = workflow.jobs['build-and-test']!
const deploy = workflow.jobs['deploy']!

const EMAILJS = [
  'NUXT_PUBLIC_EMAILJS_SERVICE_ID',
  'NUXT_PUBLIC_EMAILJS_TEMPLATE_ID',
  'NUXT_PUBLIC_EMAILJS_PUBLIC_KEY',
]

const runIndex = (job: Job, cmd: string) => job.steps.findIndex((s) => s.run?.includes(cmd))

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

  it('cancels a pull request run superseded by a newer push, and nothing else', () => {
    // Pull requests share a group per number. Every other run gets its own group (its run
    // id), so pushes to main and dev never wait on or cancel each other here.
    expect(workflow.concurrency?.group).toBe(
      "${{ github.event_name == 'pull_request' && format('pr-{0}', github.event.pull_request.number) || github.run_id }}",
    )
    expect(workflow.concurrency?.['cancel-in-progress']).toBe("${{ github.event_name == 'pull_request' }}")
  })

  it('gives every job a time limit', () => {
    expect(build['timeout-minutes']).toBe(30)
    expect(deploy['timeout-minutes']).toBe(15)
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

  it('chooses the EmailJS values after npm ci and before anything builds', () => {
    const choose = build.steps.findIndex((s) => s.name === 'Choose EmailJS values')
    expect(choose).toBeGreaterThan(runIndex(build, 'npm ci'))
    expect(choose).toBeLessThan(runIndex(build, 'npm run lint'))
    // Nothing sets them at job level, where they would shadow the step's choice.
    for (const key of EMAILJS) expect(build.env?.[key]).toBeUndefined()
    const run = build.steps[choose]!.run!
    for (const key of EMAILJS) expect(run).toContain(`${key}=`)
    expect(run).toContain('$GITHUB_ENV')
  })

  it('reads the secrets only for a push to main, and stops if one is empty', () => {
    const step = build.steps.find((s) => s.name === 'Choose EmailJS values')!
    const env = step.env ?? {}
    expect(env['RELEASE']).toBe("${{ github.event_name == 'push' && github.ref == 'refs/heads/main' }}")
    for (const [name, secret] of [
      ['SERVICE_ID', 'VITE_EMAILJS_SERVICE_ID'],
      ['TEMPLATE_ID', 'VITE_EMAILJS_TEMPLATE_ID'],
      ['PUBLIC_KEY', 'VITE_EMAILJS_PUBLIC_KEY'],
    ] as const) {
      expect(env[name]).toBe(
        `\${{ github.event_name == 'push' && github.ref == 'refs/heads/main' && secrets.${secret} || '' }}`,
      )
    }
    expect(step.run).toMatch(/if \[ -z "\$\{!name\}" \]/)
    expect(step.run).toContain('exit 1')
    expect(step.run).toContain('SERVICE_ID=ci_service_id TEMPLATE_ID=ci_template_id PUBLIC_KEY=ci_public_key')
    // No other step or job sees the EmailJS secrets.
    const others = Object.values(workflow.jobs).flatMap((j) => [j.env ?? {}, ...j.steps.filter((s) => s !== step).map((s) => s.env ?? {})])
    expect(JSON.stringify(others)).not.toContain('VITE_EMAILJS')
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

  it('build-and-test saves the tested site last, for a push to main only', () => {
    const save = build.steps.findIndex((s) => s.name === 'Save the tested site for deploy')
    expect(save).toBeGreaterThan(runIndex(build, 'npm run test:e2e'))
    const step = build.steps[save]!
    expect(step.uses).toMatch(/^actions\/upload-artifact@/)
    expect(step.if).toBe(deploy.if)
    expect(step.with).toMatchObject({ name: 'site', path: '.output/public/', 'if-no-files-found': 'error' })
  })

  it('ships the tested site: no install, no build', () => {
    for (const cmd of ['npm ci', 'npm run generate', 'npm install']) expect(runIndex(deploy, cmd)).toBe(-1)
  })

  it('downloads the site, authenticates, syncs, then invalidates', () => {
    const download = deploy.steps.findIndex((s) => s.uses?.startsWith('actions/download-artifact'))
    expect(deploy.steps[download]?.with).toMatchObject({ name: 'site', path: '.output/public' })
    const awsLogin = deploy.steps.findIndex((s) =>
      s.uses?.startsWith('aws-actions/configure-aws-credentials'),
    )
    const creds = deploy.steps[awsLogin]?.with ?? {}
    expect(creds['role-to-assume']).toBe('arn:aws:iam::572459017185:role/portfolio-site-deploy')
    expect(creds['aws-region']).toBe('us-east-1')
    expect(creds).not.toHaveProperty('aws-access-key-id')
    expect(creds).not.toHaveProperty('aws-secret-access-key')
    const indexes = [
      download,
      awsLogin,
      runIndex(deploy, 'node scripts/deploy-s3.mjs .output/public s3://jameslittlefield.net'),
      runIndex(deploy, 'aws cloudfront create-invalidation'),
    ]
    expect(indexes.every((i) => i >= 0)).toBe(true)
    expect([...indexes].sort((a, b) => a - b)).toEqual(indexes)
    const invalidate = deploy.steps[indexes[3]!]!.run!
    expect(invalidate).toContain('--paths "/*"')
    expect(invalidate).toContain('--distribution-id E1LYCW0Q332784')
    expect(invalidate).not.toContain('secrets.')
  })

  it('runs in the production environment with only contents read and an OIDC token', () => {
    expect(deploy.environment).toBe('production')
    expect(deploy.permissions).toEqual({ contents: 'read', 'id-token': 'write' })
  })
})

describe('credentials and pinning', () => {
  it('lets only the deploy job request an OIDC token', () => {
    expect(build.permissions?.['id-token']).toBeUndefined()
    expect(workflow.permissions['id-token']).toBeUndefined()
  })

  it('pins every action to a 40-character commit SHA', () => {
    for (const job of Object.values(workflow.jobs)) {
      for (const step of job.steps) {
        if (step.uses !== undefined) expect(step.uses).toMatch(/@[0-9a-f]{40}$/)
      }
    }
  })

  it('references no long-lived AWS or distribution secrets', () => {
    for (const name of ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'CLOUDFRONT_DISTRIBUTION_ID']) {
      expect(workflowText).not.toContain(`secrets.${name}`)
    }
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
