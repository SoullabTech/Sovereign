import { chromium } from 'playwright'

const url = process.env.GROKKER_URL ?? 'http://localhost:3612/dev/living-field-grokker-r2d3'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })
const errors = []

page.on('pageerror', (error) => errors.push(String(error)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForSelector('[data-bio-node-label="relationship"]')
await page.waitForTimeout(700)

await page.screenshot({
  path: '/tmp/grokker-r2d3-soullab-whole.png',
  fullPage: true,
})

const shell = {
  soullab: await page.getByText('SOULLAB', { exact: true }).count(),
  livingFieldNav: await page.getByText('Living Field', { exact: true }).count(),
  callingTitle: await page.getByRole('heading', { name: 'Calling', exact: true }).count(),
  wholeControl: await page.getByRole('button', { name: 'Whole', exact: true }).count(),
}

async function clickCenter(selector) {
  const box = await page.locator(selector).boundingBox()
  if (!box) throw new Error('Missing selector: ' + selector)
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
}

await clickCenter('[data-bio-node-label="relationship"]')
await page.waitForSelector('[data-recursive-current="water-relationship"]')
await page.waitForTimeout(700)

const relationshipHeader = (await page.locator('header').innerText()).toLowerCase()
const relationshipPanel = {
  title: await page.getByRole('heading', { name: 'Relationship', exact: true }).count(),
  griefInField: await page.getByRole('button', { name: /Grief/ }).count(),
  breadcrumb: relationshipHeader.includes('relationship'),
}

await clickCenter('[data-recursive-child="grief"]')
await page.waitForSelector('[data-recursive-current="grief"]')
await page.waitForTimeout(700)

const griefPanel = {
  title: await page.getByRole('heading', { name: 'Grief', exact: true }).count(),
  continuing: await page.getByRole('button', { name: /Continuing Relation/ }).count(),
  remembrance: await page.getByRole('button', { name: /Remembrance/ }).count(),
  ritual: await page.getByRole('button', { name: /Ritual/ }).count(),
}

await page.screenshot({
  path: '/tmp/grokker-r2d3-soullab-grief.png',
  fullPage: true,
})

await page.getByRole('button', { name: /What this rests on/ }).click()
await page.waitForTimeout(250)

const evidence = {
  standing: (await page.locator('body').innerText()).includes('Controlled prototype — source fabric not yet bound'),
  exactnessWarning: (await page.locator('body').innerText()).includes('does not yet claim exact source fragments'),
}

const search = page.getByPlaceholder('Search the field…')
await search.fill('calling')
await page.waitForTimeout(250)
await page.getByRole('button', { name: /Calling/ }).click()
await page.waitForTimeout(250)

const afterSearchHeader = (await page.locator('header').innerText()).toLowerCase()
const searchPanel = {
  callingTitle: await page.getByRole('heading', { name: 'Calling', exact: true }).count(),
  queryCleared: (await search.inputValue()) === '',
  fieldStillAtGrief: afterSearchHeader.includes('grief'),
  inspectionContextVisible: (await page.locator('body').innerText()).includes('field remains at Grief'),
}

console.log(JSON.stringify({
  shell,
  relationshipPanel,
  griefPanel,
  evidence,
  searchPanel,
  errors,
}, null, 2))

await browser.close()
