import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1680, height: 1050 } })
const errors = []
page.on('pageerror', (error) => errors.push(String(error)))

await page.goto(
  'http://localhost:3611/dev/living-field-grokker-r2d3',
  { waitUntil: 'networkidle' },
)
await page.waitForSelector('[data-illumination-key="calling"]')
await page.waitForTimeout(900)

const initialText = await page.locator('body').innerText()
const callingPanel = await page.locator('[data-illumination-key="calling"]').innerText()

const callingChecks = {
  contextNamed: initialText.includes('Context'),
  soullabBrand: initialText.includes('SOULLAB'),
  houseTagline: initialText.includes('BEING · BECOMING · TOGETHER'),
  callingHasWithinSection: callingPanel.includes('IN THIS FIELD'),
  callingHasRelations: callingPanel.includes('RELATIONS'),
}
await page.getByRole('button', { name: 'How this became' }).click()
await page.waitForTimeout(120)
const lineageText = await page.locator('[data-illumination-key="calling"]').innerText()

await page.getByRole('button', { name: 'What this rests on' }).click()
await page.waitForTimeout(120)
const evidenceText = await page.locator('[data-illumination-key="calling"]').innerText()

const search = page.getByPlaceholder('Search the field…')
await search.fill('grief')
await page.waitForSelector('[data-search-key="grief"]')
await page.locator('[data-search-key="grief"]').click()
await page.waitForSelector('[data-illumination-key="grief"]')
await page.waitForTimeout(900)

const griefPanel = await page.locator('[data-illumination-key="grief"]').innerText()
const griefChecks = {
  hasWithin: griefPanel.includes('IN THIS FIELD'),
  continuingRelation: griefPanel.includes('Continuing Relation'),
  remembrance: griefPanel.includes('Remembrance'),
  ritual: griefPanel.includes('Ritual'),
  canEnter: griefPanel.includes('Enter field'),
}
await page.screenshot({
  path: '/tmp/grokker-r2d3-semantic-shell.png',
  fullPage: true,
})

console.log(JSON.stringify({
  callingChecks,
  lineageSeparate: lineageText.includes('Lineage not yet bound in this witness'),
  contextNotLineage: lineageText.includes('context path above answers where this locus currently sits'),
  evidenceHonest: evidenceText.includes('source fabric not yet bound'),
  griefChecks,
  errors,
}, null, 2))

await browser.close()
