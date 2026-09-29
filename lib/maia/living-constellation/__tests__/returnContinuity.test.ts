import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const panel = fs.readFileSync(
  path.join(root, 'components/maia/living-constellation/LivingConstellationPanel.tsx'),
  'utf8',
)
const aperture = fs.readFileSync(
  path.join(root, 'components/maia/living-constellation/SoulServiceAperturePilot.tsx'),
  'utf8',
)
const witnessPage = fs.readFileSync(
  path.join(root, 'app/dev/maia-soul-service/living-field-aperture/page.tsx'),
  'utf8',
)
const witnessClient = fs.readFileSync(
  path.join(
    root,
    'app/dev/maia-soul-service/living-field-aperture/TruthfulReturnWitnessClient.tsx',
  ),
  'utf8',
)

describe('Living Field return continuity — 02R1', () => {
  it('preserves a stable transition identity across teaser and entered presence', () => {
    expect(panel).toContain('transitionNameForPresence')
    expect(panel).toContain('transitionStyleForPresence(node)')
    expect(panel.match(/transitionStyleForPresence\(node\)/g)?.length ?? 0).toBeGreaterThanOrEqual(2)
  })

  it('uses View Transition only as progressive enhancement with reduced-motion parity', () => {
    expect(panel).toContain('startViewTransition')
    expect(panel).toContain("prefers-reduced-motion: reduce")
    expect(panel).toContain('flushSync(update)')
  })

  it('captures and restores topology, viewport, and opener focus', () => {
    expect(panel).toContain('expanded,')
    expect(panel).toContain('scrollY:')
    expect(panel).toContain('openerId:')
    expect(panel).toContain('setExpanded(snapshot.expanded)')
    expect(panel).toContain("window.scrollTo({ top: snapshot.scrollY, behavior: 'auto' })")
    expect(panel).toContain("opener.focus({ preventScroll: true })")
  })

  it('integrates the aperture pilot only when explicitly enabled', () => {
    expect(panel).toContain('enableSoulServiceAperturePilot = false')
    expect(panel).toContain('<SoulServiceAperturePilot')
    expect(witnessClient).toContain('enableSoulServiceAperturePilot')
  })

  it('keeps the local witness production closed and uses synthetic projection data', () => {
    expect(witnessPage).toContain("process.env.NODE_ENV === 'production'")
    expect(witnessPage).toContain('notFound()')
    expect(witnessClient).toContain('synthetic_witness')
    expect(witnessClient).toContain('projectionOverrideForWitness')
  })

  it('keeps aperture state component-local and offers explicit return to source', () => {
    expect(aperture).toContain("useState<PilotState>('idle')")
    expect(aperture).toContain('Keep this for this visit')
    expect(aperture).toContain('Back to the source alone')
    expect(aperture).not.toContain('localStorage')
    expect(aperture).not.toContain('sessionStorage')
  })
})
