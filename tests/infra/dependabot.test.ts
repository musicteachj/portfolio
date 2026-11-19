import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'

interface Update {
  'package-ecosystem': string
  directory: string
  'target-branch'?: string
  schedule: { interval: string }
  groups?: Record<string, { patterns?: string[] }>
}

const config = parse(readFileSync('.github/dependabot.yml', 'utf8')) as { version: number; updates: Update[] }

describe('dependabot', () => {
  it('updates npm packages and GitHub Actions, monthly, into dev', () => {
    expect(config.version).toBe(2)
    expect(config.updates.map((u) => u['package-ecosystem']).sort()).toEqual(['github-actions', 'npm'])
    for (const u of config.updates) {
      expect(u.directory).toBe('/')
      expect(u.schedule.interval).toBe('monthly')
      // Updates follow the usual flow: into dev, then dev into main.
      expect(u['target-branch']).toBe('dev')
    }
  })

  it('groups each ecosystem into one pull request', () => {
    for (const u of config.updates) {
      const groups = Object.values(u.groups ?? {})
      expect(groups).toHaveLength(1)
      expect(groups[0]!.patterns).toEqual(['*'])
    }
  })
})
