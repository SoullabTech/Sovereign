import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/enactive-life-loop/EnactiveLifeLoopWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/enactive-life-loop/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03 Enactive Life Loop witness', () => {
  it('makes the Life Move explicitly member-chosen and optional', () => {
    expect(client).toContain('What I choose to do')
    expect(client).toContain('Prepare this Life Move')
    expect(client).toContain('Don’t turn this into a Life Move')
    expect(client).toContain('Nothing has to be turned into an experiment.')
  })

  it('separates expectation from later consequence', () => {
    expect(client).toContain('What I currently expect')
    expect(client).toContain('Expected before action')
    expect(client).toContain('What happened · member-reported lived evidence')
    expect(client).toContain('Compare expectation with consequence')
  })

  it('preserves surprise as an anti-confirmation aperture', () => {
    expect(client).toContain('What would surprise me?')
    expect(client).toContain('Surprise remains possible')
  })

  it('states that Soullab is not tracking the member outside the system', () => {
    expect(client).toContain('Soullab is not watching.')
    expect(client).toContain('No tracking. No compliance check.')
    expect(client).toContain('Return only if you want')
    expect(client).toContain('<p>none</p>')
    expect(client).toContain('<p>no</p>')
  })

  it('does not auto-rank lived consequence as success or failure', () => {
    expect(client.replace(/\s+/g, ' ')).toContain('not a judgment about success, failure, growth, or motive')
    expect(client).not.toContain('Outcome score')
    expect(client).not.toContain('successful outcome')
    expect(client).not.toContain('failed outcome')
  })

  it('lets the member decide how understanding changes and preserves the historical contrast', () => {
    for (const label of [
      'Keep it',
      'Weaken it',
      'Narrow it',
      'Revise it',
      'Abandon it',
      'Leave it unresolved',
    ]) {
      expect(client).toContain(label)
    }
    expect(client).toContain('Member-shaped revision')
    expect(client).toContain('Life Loop trace · capsule consumed')
    expect(client).toContain('Returned consequence')
    expect(client).toContain('No active Life Move remains.')
  })

  it('does not persist or surveil the Life Move in the local witness', () => {
    expect(client).not.toContain('localStorage')
    expect(client).not.toContain('sessionStorage')
    expect(client).not.toContain('navigator.geolocation')
    expect(client).not.toContain('setInterval(')
    expect(client).not.toContain('fetch(')
  })

  it('keeps the local witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
