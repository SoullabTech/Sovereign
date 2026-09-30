import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto('http://localhost:3610/dev/living-field-recursive-r2d2', { waitUntil: 'networkidle' })
await page.waitForTimeout(1100)
await page.screenshot({ path: '/tmp/grokker-r2d2-plasma-whole.png', fullPage: true })

const box = await page.locator('[data-bio-node-label="relationship"]').boundingBox()
if (!box) throw new Error('relationship label missing')
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await page.waitForTimeout(1400)
await page.screenshot({ path: '/tmp/grokker-r2d2-plasma-relationship.png', fullPage: true })

console.log(JSON.stringify({
  whole: true,
  relationship: await page.locator('[data-recursive-current="water-relationship"]').count(),
  errors,
}, null, 2))

await browser.close()
