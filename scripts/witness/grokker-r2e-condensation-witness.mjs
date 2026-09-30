import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto(
  'http://localhost:3613/dev/living-field-grokker-r2e',
  { waitUntil: 'networkidle' },
)

await page.waitForFunction(
  () => window.__soullabBiology && window.__soullabBiology.condensation,
)

const state = async () => page.evaluate(() => window.__soullabBiology.condensation())
const stable = (value) => JSON.stringify(value, Object.keys(value).sort())

await page.waitForTimeout(700)
const wide = await state()
const wideLabels = await page.locator('[data-condensed-bridge-label]').count()
const wideTension = await page.getByText(/tension held/i).count()

await page.screenshot({
  path: '/tmp/grokker-r2e-wide-bridges.png',
  fullPage: true,
})
await page.getByRole('button', { name: 'Zoom in' }).click()
await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'bundle')
await page.waitForTimeout(600)

const bundle = await state()
const bundleLabels = await page.locator('[data-condensed-bridge-label]').count()

await page.screenshot({
  path: '/tmp/grokker-r2e-bundles.png',
  fullPage: true,
})

await page.getByRole('button', { name: 'Zoom in' }).click()
await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'specific')
await page.waitForTimeout(600)

const specific = await state()
const specificLabels = await page.locator('[data-condensed-bridge-label]').count()

await page.screenshot({
  path: '/tmp/grokker-r2e-specific.png',
  fullPage: true,
})
await page.getByRole('button', { name: 'Zoom out' }).click()
await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'bundle')
await page.getByRole('button', { name: 'Zoom out' }).click()
await page.waitForFunction(() => window.__soullabBiology.condensation().mode === 'bridge')
await page.waitForTimeout(500)

const returned = await state()

const sameBridgeIds =
  JSON.stringify(wide.bridgeIds) === JSON.stringify(returned.bridgeIds)
const sameMembership =
  JSON.stringify(wide.relationIdsByBridge) === JSON.stringify(returned.relationIdsByBridge)

console.log(JSON.stringify({
  modes: {
    wide: wide.mode,
    bundle: bundle.mode,
    specific: specific.mode,
    returned: returned.mode,
  },
  bridgeCounts: {
    wide: wide.bridgeIds.length,
    returned: returned.bridgeIds.length,
  },
  labelCounts: {
    wide: wideLabels,
    bundle: bundleLabels,
    specific: specificLabels,
  },
  unresolvedBridgeIds: wide.unresolvedBridgeIds,
  wideTensionLabels: wideTension,
  sameBridgeIds,
  sameMembership,
  errors,
}, null, 2))

await browser.close()
