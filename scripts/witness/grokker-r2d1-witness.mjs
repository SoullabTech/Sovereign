import { chromium } from 'playwright'

const base = process.env.GROKKER_URL ?? 'http://localhost:3608/dev/living-field-biological-r2d1'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const pageErrors = []

page.on('pageerror', (error) => pageErrors.push(String(error)))
await page.goto(base, { waitUntil: 'networkidle' })
await page.waitForFunction(
  () => window.__soullabBiology && window.__soullabBiology.snapshot,
  null,
  { timeout: 10000 },
)
await page.waitForTimeout(700)

const before = await page.evaluate(() => window.__soullabBiology.snapshot())
await page.evaluate(() => window.__soullabBiology.impulse('calling', 3.5, -1.2))
await page.waitForTimeout(120)
const early = await page.evaluate(() => window.__soullabBiology.snapshot())
await page.waitForTimeout(900)
const middle = await page.evaluate(() => window.__soullabBiology.snapshot())
await page.waitForTimeout(3200)
const settled = await page.evaluate(() => window.__soullabBiology.snapshot())

const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
const speed = (a) => Math.hypot(a.vx, a.vy)
const b = before.calling
const e = early.calling
const m = middle.calling
const s = settled.calling

console.log(JSON.stringify({
  displacement120ms: +distance(b, e).toFixed(4),
  displacement1020ms: +distance(b, m).toFixed(4),
  displacement4220ms: +distance(b, s).toFixed(4),
  speed120ms: +speed(e).toFixed(4),
  speed1020ms: +speed(m).toFixed(4),
  speed4220ms: +speed(s).toFixed(4),
  stewardship1020ms: +distance(before.stewardship, middle.stewardship).toFixed(4),
  identity1020ms: +distance(before.identity, middle.identity).toFixed(4),
  belonging1020ms: +distance(before.belonging, middle.belonging).toFixed(4),
  pageErrors,
}, null, 2))

await page.screenshot({ path: '/tmp/grokker-r2d1-current.png', fullPage: true })
await browser.close()
