import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto('http://localhost:3610/dev/living-field-recursive-r2d2', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)

const clickLabel = async (selector) => {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error('missing ' + selector)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

await clickLabel('[data-bio-node-label="relationship"]')
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await clickLabel('[data-recursive-child="grief"]')
await page.waitForSelector('[data-recursive-current="grief"]')
await page.waitForTimeout(1200)

await page.mouse.move(720, 520)
await page.waitForTimeout(500)
const before = await page.getByText('Earth', { exact: true }).first().boundingBox()

await page.mouse.move(260, 300)
await page.mouse.down()
await page.mouse.move(450, 300, { steps: 16 })
await page.mouse.up()

await page.mouse.move(720, 520)
await page.waitForTimeout(1000)
const after = await page.getByText('Earth', { exact: true }).first().boundingBox()

console.log(JSON.stringify({
  before,
  after,
  shiftX: before && after ? +(after.x - before.x).toFixed(2) : null,
  shiftY: before && after ? +(after.y - before.y).toFixed(2) : null,
  errors,
}, null, 2))

await page.screenshot({ path: '/tmp/grokker-r2d2-pan.png', fullPage: true })
await browser.close()
