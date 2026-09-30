import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto(
  'http://localhost:3612/dev/living-field-grokker-r2d3',
  { waitUntil: 'networkidle' },
)
await page.waitForSelector('[data-bio-node-label="relationship"]')

async function clickCenter(selector) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error('Missing ' + selector)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

await clickCenter('[data-bio-node-label="relationship"]')
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await clickCenter('[data-recursive-child="grief"]')
await page.waitForSelector('[data-recursive-current="grief"]')
await page.waitForTimeout(500)
await page.locator('[data-relation-other-key="water-relationship"]').click()
await page.waitForSelector('[data-illumination-key="water-relationship"]')

const inspectState = {
  fieldStillGrief: (await page.locator('header').innerText()).toLowerCase().includes('grief'),
  panelRelationship: await page.locator('[data-illumination-key="water-relationship"]').count(),
  contextCue: (await page.locator('body').innerText()).includes('field remains at Grief'),
  revealButton: await page.getByRole('button', { name: /Reveal in field/ }).count(),
}

await page.getByRole('button', { name: /Reveal in field/ }).click()
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await page.waitForTimeout(650)

const relationshipReveal = {
  griefGone: await page.locator('[data-recursive-current="grief"]').count() === 0,
  headerRelationship: (await page.locator('header').innerText()).toLowerCase().includes('relationship'),
  panelRelationship: await page.locator('[data-illumination-key="water-relationship"]').count(),
}
const search = page.getByPlaceholder('Search the field…')
await search.fill('calling')
await page.waitForSelector('[data-search-key="calling"]')
await page.locator('[data-search-key="calling"]').click()

await page.waitForSelector('[data-recursive-current="identity"]')
await page.waitForSelector('[data-illumination-key="calling"]')
await page.waitForTimeout(700)

const callingReveal = {
  perspectiveWorld: await page.locator('[data-recursive-current="air-perspective"]').count(),
  identityWorld: await page.locator('[data-recursive-current="identity"]').count(),
  callingPanel: await page.locator('[data-illumination-key="calling"]').count(),
  headerCalling: (await page.locator('header').innerText()).toLowerCase().includes('calling'),
  callingChild: await page.locator('[data-recursive-child="calling"]').count(),
}

console.log(JSON.stringify({
  inspectState,
  relationshipReveal,
  callingReveal,
  errors,
}, null, 2))

await page.screenshot({
  path: '/tmp/grokker-r2d3-calling-reveal.png',
  fullPage: true,
})
await browser.close()
