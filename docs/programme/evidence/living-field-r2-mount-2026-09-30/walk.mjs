import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = 'http://localhost:3661'
const OUT = 'docs/programme/evidence/living-field-r2-mount-2026-09-30'
const MEMBER = '5b0c1f7e-2a4d-4c3b-9e21-7f00a1b2c3d4'
const now = '2026-09-30T12:00:00.000Z'

const fields = [
  { id: 'f1', field_key: 'current_questions', label: 'Current Questions', current_expression: 'What wants to be finished before it can begin again?', status: 'active', updated_at: now, sources_count: 2, gathered_count: 1 },
  { id: null, field_key: 'relationships', label: 'Relationships', current_expression: null, status: 'gathering', updated_at: null, sources_count: 0, gathered_count: 0 },
  { id: null, field_key: 'calling', label: 'Calling', current_expression: null, status: 'gathering', updated_at: null, sources_count: 0, gathered_count: 0 },
]

function livingField(presentation) {
  return {
    fields,
    keep_denominator: 12,
    spiral_state: { dominant_element: 'water', phase: 4, motion: null, intensity: 0.5, relational_phase: 2, autonomy_streak: 1, return_count: 2 },
    active_spirals: [],
    recent_states: [],
    r2_presentation: presentation,
  }
}

async function walk(name, presentation, viewport, expectAperture) {
  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport,
    extraHTTPHeaders: { 'x-capacitor-app': 'true' },
  })
  await context.addInitScript(([id]) => {
    localStorage.setItem('memberId', id)
    localStorage.setItem('beta_user', JSON.stringify({ id, onboarded: true, name: 'Synthetic witness' }))
  }, [MEMBER])

  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(String(error)))

  await page.route('**/api/**', async (route) => {
    const url = new URL(route.request().url())
    const json = (body) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
    if (url.pathname === '/api/maia/living-field') return json(livingField(presentation))
    if (url.pathname === '/api/maia/living-constellation') {
      return json({ memberCenter: { projectionId: 'member:center', label: 'You', kind: 'orientation_only' }, nodes: [], partial: false, warnings: [], generatedAt: now })
    }
    if (url.pathname === '/api/house/facet-flows') return json({ flows: [] })
    return route.fulfill({ status: 404, contentType: 'application/json', body: '{"error":"unfixtured"}' })
  })

  await page.goto(BASE + '/maia/living-field?from=house', { waitUntil: 'networkidle', timeout: 240000 })
  await page.waitForTimeout(800)

  const trigger = page.getByRole('button', { name: /See the wider field/ })
  const before = await trigger.count()
  const result = {
    name,
    presentation,
    viewport,
    triggerBefore: before,
    apertureOpened: false,
    returned: false,
    houseThreshold: (await page.getByText(/LIVING FIELD/, { exact: false }).count()) > 0,
    pageErrors: errors,
  }

  if (expectAperture) {
    if (before !== 1) throw new Error(name + ': expected one R2 aperture trigger, got ' + before)
    await trigger.click()
    await page.locator('[data-living-field-spatial-aperture]').waitFor({ state: 'visible', timeout: 30000 })
    result.apertureOpened = true
    await page.screenshot({ path: OUT + '/' + name + '-open.png', fullPage: true })
    await page.getByRole('button', { name: /Return to where you were/ }).first().click()
    await page.locator('[data-living-field-spatial-aperture]').waitFor({ state: 'detached', timeout: 30000 })
    result.returned = (await trigger.count()) === 1
  } else {
    if (before !== 0) throw new Error(name + ': aperture must be absent, got ' + before)
    await page.screenshot({ path: OUT + '/' + name + '.png', fullPage: true })
  }

  result.pageErrors = errors
  await browser.close()
  return result
}

const results = []
results.push(await walk('A-admitted-desktop', 'r2e2', { width: 1440, height: 1050 }, true))
results.push(await walk('B-noncohort-desktop', 'r1r3', { width: 1440, height: 1050 }, false))
results.push(await walk('C-admitted-mobile', 'r2e2', { width: 390, height: 844 }, false))

fs.writeFileSync(OUT + '/results.json', JSON.stringify(results, null, 2))
for (const result of results) console.log(JSON.stringify(result))
