/**
 * LIVING-FIELD-CLIENT-AUTH-TRANSPORT-01
 *
 * Once Living Field has established a verified session identity, nested client
 * actions must preserve that authority through apiFetch. A member UUID is context,
 * not a credential, and relative fetch is not a valid native transport.
 */
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CLIENTS = [
  'components/maia/living-field/LivingEncounterView.tsx',
  'components/maia/living-field/LivingFieldCard.tsx',
  'components/maia/living-field/LivingFieldDetailPanel.tsx',
  'components/maia/living-field/LivingFieldGatheringPanel.tsx',
  'components/maia/living-field/PhaseStatePanel.tsx',
] as const

const source = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

describe('LIVING-FIELD-CLIENT-AUTH-TRANSPORT-01', () => {
  it.each(CLIENTS)('%s uses session-aware apiFetch', (rel) => {
    const text = source(rel)
    expect(text).toContain('apiFetch')
    expect(text).not.toMatch(/\bfetch\s*\(/)
  })

  it.each(CLIENTS)('%s does not send member id as an auth claim', (rel) => {
    const text = source(rel)
    expect(text).not.toContain('x-member-id')
    expect(text).not.toMatch(/\bmemberId\b/)
  })

  it('does not thread member id through the Living Field dashboard', () => {
    const dashboard = source('components/maia/living-field/PersonalLivingFieldDashboard.tsx')
    expect(dashboard).not.toMatch(/\bmemberId\b/)
  })
})
