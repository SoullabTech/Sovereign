const puppeteer = require('/Users/soullab/MAIA-SOVEREIGN/node_modules/puppeteer');
const path = require('path');
const DIR = '/private/tmp/claude-501/-Users-soullab-MAIA-SOVEREIGN/38088b88-2c28-47a3-85c3-524726376c5b/scratchpad';
const URL = 'file://' + DIR + '/living-spiral-prototype.html';

// [outfile, fixture button label, click alias?, which assertion to inspect]
const SHOTS = [
  ['01-baseline.png',      'baseline', false, 'A3'],
  ['02-F1-unobserved.png', 'F1',       false, 'A2'],
  ['03-F2-composable.png', 'F2',       false, 'A2'],
  ['04-F3-contradiction.png','F3',     false, 'A1'],
  ['05-F10-provisional-composition.png','F10', false, 'A4'],
  ['06-F11-no-edge.png',   'F11',      false, 'A4'],
  ['07-F14-authority.png', 'F14',      false, 'A3'],
  ['08-alias-elemental.png','baseline',false, 'A1'],
  ['09-alias-swapped.png', 'baseline', true,  'A1'],
];

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args:['--allow-file-access-from-files']});
  const page = await browser.newPage();
  await page.setViewport({width: 1300, height: 1000, deviceScaleFactor: 2});
  await page.goto(URL, {waitUntil: 'networkidle0'});
  await page.evaluate(() => document.documentElement.setAttribute('data-theme','dark'));

  let aliasState = false;
  for (const [file, fixture, wantAlias, inspectId] of SHOTS) {
    await page.evaluate((f) => {
      const b = [...document.querySelectorAll('#fixbar button')].find(x => x.textContent.trim() === f);
      if (b) b.click();
    }, fixture);

    if (wantAlias !== aliasState) {
      await page.evaluate(() => document.getElementById('aliasBtn').click());
      aliasState = wantAlias;
    }

    await page.evaluate((id) => {
      const g = document.querySelector(`.mark[data-id="${id}"]`);
      if (g) g.dispatchEvent(new MouseEvent('click', {bubbles: true}));
    }, inspectId);

    await new Promise(r => setTimeout(r, 220));
    await page.screenshot({path: path.join(DIR, file), fullPage: false});
    console.log('shot', file);
  }
  await browser.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
