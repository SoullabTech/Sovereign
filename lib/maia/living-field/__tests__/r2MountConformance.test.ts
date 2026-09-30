import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const read = (relative: string) => {
  const full = path.join(root, relative)
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : ''
}

const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> }
const lock = JSON.parse(read('package-lock.json')) as {
  packages?: Record<string, { dependencies?: Record<string, string> }>
}
const access = read('lib/maia/living-field/r2PresentationAccess.ts')
const route = read('app/api/maia/living-field/route.ts')
const page = read('app/maia/living-field/page.tsx')
const dashboard = read('components/maia/living-field/PersonalLivingFieldDashboard.tsx')
const aperture = read('components/maia/living-field/LivingFieldSpatialAperture.tsx')
const shell = read('components/maia/living-field/physics/LivingFieldGrokkerShell.tsx')
const biological = read('components/maia/living-field/physics/BiologicalSpatialFieldPrototype.tsx')

describe('LIVING-FIELD-R2-MOUNT-01 production conformance', () => {
  it('M4 — all ruled visual-field packages are direct production dependencies', () => {
    for (const name of ['d3-hierarchy', 'd3-interpolate', 'cytoscape', 'cytoscape-fcose']) {
      expect(pkg.dependencies?.[name]).toBeTruthy()
      expect(lock.packages?.['']?.dependencies?.[name]).toBeTruthy()
    }
  })

  it('M1/M2/M3 — R2 uses a fail-closed server-held cohort distinct from EARLY-FIELD-01', () => {
    expect(access).toContain('LIVING_FIELD_R2_ENABLED')
    expect(access).toContain('LIVING_FIELD_R2_MEMBER_IDS')
    expect(access).not.toContain('EARLY_FIELD_MEMBER_IDS')
    expect(route).toContain('livingFieldR2PresentationForMember(memberId)')
    expect(route).toContain('r2_presentation')
  })

  it('M5/M6 — the mount does not import R2F continuity or widen cognition/memory', () => {
    const mounted = [page, dashboard, aperture, shell, biological].join('\n')
    expect(mounted).not.toContain('livingFieldNavigationContinuity')
    expect(mounted).not.toContain('sessionStorage')
    expect(mounted).not.toContain('seedMaiaPrompt')
    expect(mounted).not.toContain('openMaiaWith')
  })

  it('M7 — the canonical House threshold remains the route frame', () => {
    expect(page).toContain('HouseRoomThreshold')
    expect(page).toContain('room="LIVING FIELD"')
  })

  it('M8 — spatial render failure has an explicit return to the existing field', () => {
    expect(aperture).toContain('componentDidCatch')
    expect(aperture).toContain('onReturn')
    expect(aperture).toContain('Return to where you were')
  })

  it('M9 — the complete R2 shell is gated to the witnessed desktop viewport class', () => {
    expect(dashboard).toContain('(min-width: 901px)')
    expect(dashboard).toContain('r2ViewportReady')
  })

  it('M10/M11 — R2 is an explicit aperture inside the existing dashboard, not a replacement route', () => {
    expect(dashboard).toContain('See the wider field')
    expect(dashboard).toContain('LivingFieldSpatialAperture')
    expect(dashboard).toContain('spatialOpen')
    expect(page).toContain('PersonalLivingFieldDashboard')
    expect(fs.existsSync(path.join(root, 'app/grokker/page.tsx'))).toBe(false)
    expect(fs.existsSync(path.join(root, 'app/field/page.tsx'))).toBe(false)
  })
})
