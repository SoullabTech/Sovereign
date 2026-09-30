import { chromium } from 'playwright'

const url = process.env.GROKKER_URL ?? 'http://localhost:3610/dev/living-field-recursive-r2d2'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []

page.on('pageerror', (error) => errors.push(String(error)))
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-bio-node-label="relationship"]')

async function clickAtLabel(selector) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error(`No box for ${selector}`)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

await clickAtLabel('[data-bio-node-label="relationship"]')
await page.waitForSelector('[data-recursive-current="water-relationship"]', { timeout: 8000 })
await page.waitForTimeout(1200)
const depth1 = await page.locator('[data-recursive-current="water-relationship"]').count()
const griefChild = await page.locator('[data-recursive-child="grief"]').count()
const relationshipDisplaced = await page.evaluate(() => {
  const bridge = window.__soullabBiology
  if (!bridge) return null
  const snapshot = bridge.snapshot()
  return {
    relationship: snapshot.relationship,
    belonging: snapshot.belonging,
  }
})

await clickAtLabel('[data-recursive-child="grief"]')
await page.waitForSelector('[data-recursive-current="grief"]', { timeout: 8000 })
await page.waitForTimeout(1200)

const depth2 = await page.locator('[data-recursive-current="grief"]').count()
const continuing = await page.locator('[data-recursive-child="continuing-relation"]').count()
const remembrance = await page.locator('[data-recursive-child="remembrance"]').count()
const ritual = await page.locator('[data-recursive-child="ritual"]').count()
await page.screenshot({
  path: '/tmp/grokker-r2d2-recursive-depth2.png',
  fullPage: true,
})

await page.getByRole('button', { name: 'Wider' }).click()
await page.waitForSelector('[data-recursive-current="water-relationship"]')
const widerRecovered = await page.locator('[data-recursive-current="water-relationship"]').count()

await page.getByRole('button', { name: 'Whole' }).click()
await page.waitForTimeout(900)
const wholeRecovered = await page.locator('[data-recursive-current]').count() === 0

console.log(JSON.stringify({
  depth1,
  griefChild,
  depth2,
  continuing,
  remembrance,
  ritual,
  widerRecovered,
  wholeRecovered,
  relationshipDisplaced,
  errors,
}, null, 2))

await browser.close()
