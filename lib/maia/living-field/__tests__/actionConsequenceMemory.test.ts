import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const client = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/action-consequence-memory/ActionConsequenceMemoryWitnessClient.tsx',
  ),
  'utf8',
)
const page = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/action-consequence-memory/page.tsx'),
  'utf8',
)

describe('SOUL-SERVICE-03R4-R6 action / consequence / memory witness', () => {
  it('preserves action as optional and member-authored', () => {
    expect(client).toContain('Should this become an experiment at all?')
    expect(client).toContain('I choose this bounded experiment')
    expect(client).toContain('Not now')
    expect(client).toContain('member-chosen action')
    expect(client).toContain('no action selected')
  })

  it('checks proportionality, reversibility, consent, observability, and boundedness', () => {
    for (const term of [
      'Member-authored',
      'Proportionate',
      'Reversible',
      'Low blast radius',
      'Consent-respecting',
      'Observable enough',
      'Bounded',
      'Non-coercive',
    ]) {
      expect(client).toContain(term)
    }
  })

  it('separates intended action, actual action, expectation, and returned consequence', () => {
    expect(client).toContain('Intended action')
    expect(client).toContain('Reported actual action')
    expect(client).toContain('Expected')
    expect(client).toContain('Member-reported consequence')
    expect(client).toContain('MEMBER_REPORT · new evidence')
  })

  it('prevents post-hoc causal promotion', () => {
    expect(client).toContain('After does not automatically mean because of.')
    expect(client).toContain('That timing alone does not prove the action caused every part of the response.')
  })

  it('does not create a behavioral dossier by default', () => {
    expect(client).toContain('Do not keep by default')
    expect(client).toContain('compliance')
    expect(client).toContain('success rate')
    expect(client).toContain('One outcome does not become a trait.')
  })

  it('requires explicit member action to create new learning durability', () => {
    expect(client).toContain('Keep this learning')
    expect(client).toContain('Leave this loop here')
    expect(client).toContain('No new autobiographical memory authorized.')
    expect(client).toContain('Member explicitly chose to keep this formulation.')
  })

  it('keeps member-authored learning distinct from system scoring', () => {
    expect(client).toContain('member-authored formulation—not a behavioral trait or system score')
  })

  it('keeps the witness production closed', () => {
    expect(page).toContain("process.env.NODE_ENV === 'production'")
    expect(page).toContain('notFound()')
  })
})
