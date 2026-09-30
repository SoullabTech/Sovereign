import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto(
  'http://localhost:3610/dev/living-field-recursive-r2d2',
  { waitUntil: 'networkidle' },
)

async function clickCenter(selector) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error('missing ' + selector)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

await clickCenter('[data-bio-node-label="relationship"]')
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await clickCenter('[data-recursive-child="grief"]')
await page.waitForSelector('[data-recursive-current="grief"]')
await page.waitForTimeout(1100)
const depth2Before = await page.locator('[data-recursive-current="grief"]').count()
await page.screenshot({
  path: '/tmp/grokker-r2d2-soft-membrane-depth2.png',
  fullPage: true,
})

await page.mouse.move(720, 500)
await page.mouse.wheel(0, 520)
await page.waitForTimeout(900)

const depth1AfterZoomOut = await page
  .locator('[data-recursive-current="water-relationship"]')
  .count()
const griefAfterZoomOut = await page
  .locator('[data-recursive-current="grief"]')
  .count()

await page.mouse.wheel(0, 520)
await page.waitForTimeout(900)

const recursiveAfterSecondZoomOut = await page
  .locator('[data-recursive-current]')
  .count()
console.log(JSON.stringify({
  depth2Before,
  depth1AfterZoomOut,
  griefAfterZoomOut,
  recursiveAfterSecondZoomOut,
  errors,
}, null, 2))

await page.screenshot({
  path: '/tmp/grokker-r2d2-scale-return-whole.png',
  fullPage: true,
})
await browser.close()
