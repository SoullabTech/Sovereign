import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto('http://localhost:3613/dev/living-field-grokker-r2e', { waitUntil: 'networkidle' })
await page.waitForFunction(() => window.__soullabBiology?.condensation)

const state = async () => page.evaluate(() => window.__soullabBiology.condensation())

const before = await state()
for (let i = 0; i < 3; i += 1) {
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await page.waitForTimeout(180)
}

await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'pattern')
await page.waitForTimeout(700)

const pattern = await state()
const latentLabels = await page.locator('[data-semantic-visibility="latent"]').count()
const visibleLabels = await page.locator('[data-semantic-visibility="visible"]').count()
const callingVisible = await page
  .locator('[data-bio-node-label="calling"][data-semantic-visibility="visible"]')
  .count()

const bodyText = await page.locator('body').innerText()
const worldsVisible = ['Fire', 'Water', 'Earth', 'Air', 'Aether']
  .every((label) => bodyText.includes(label))

await page.screenshot({
  path: '/tmp/grokker-r2e2-pattern.png',
  fullPage: true,
})

await page.getByRole('button', { name: 'Zoom in' }).click()
await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'bridge')
await page.waitForTimeout(500)

const returned = await state()
const latentAfterReturn = await page.locator('[data-semantic-visibility="latent"]').count()

console.log(JSON.stringify({
  modes: {
    before: before.mode,
    pattern: pattern.mode,
    returned: returned.mode,
  },
  patternSpecificRelationCount: pattern.visibleSpecificRelationIds.length,
  latentLabels,
  visibleLabels,
  callingVisible,
  worldsVisible,
  bridgeIdsPreserved:
    JSON.stringify(before.bridgeIds) === JSON.stringify(pattern.bridgeIds) &&
    JSON.stringify(pattern.bridgeIds) === JSON.stringify(returned.bridgeIds),
  bridgeMembershipPreserved:
    JSON.stringify(before.relationIdsByBridge) === JSON.stringify(pattern.relationIdsByBridge) &&
    JSON.stringify(pattern.relationIdsByBridge) === JSON.stringify(returned.relationIdsByBridge),
  latentAfterReturn,
  errors,
}, null, 2))

await browser.close()
