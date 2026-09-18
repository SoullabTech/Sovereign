import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const file = pathToFileURL(path.resolve('prototypes/jarvis-research-studio-j4/index.html')).href;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
const external = [];
page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', err => errors.push(String(err)));
page.on('request', req => { if (/^https?:/i.test(req.url())) external.push(req.url()); });

await page.goto(file);
await page.getByRole('button', { name: /Relational Geometry Research/ }).click();
await page.getByRole('button', { name: 'Resume Research' }).click();

const before = await page.evaluate(() => {
  const grid = document.querySelector('.research-grid');
  const rail = document.querySelector('.context-rail');
  const main = document.querySelector('.main-surface');
  const jarvis = document.querySelector('.jarvis-pane');
  return {
    gridWidth: grid.getBoundingClientRect().width,
    railWidth: rail.getBoundingClientRect().width,
    mainWidth: main.getBoundingClientRect().width,
    jarvisWidth: jarvis.getBoundingClientRect().width,
    bodyScrollWidth: document.body.scrollWidth,
    viewportWidth: window.innerWidth,
  };
});

if (!(before.mainWidth > before.jarvisWidth * 1.6)) throw new Error('Main surface is not sufficiently dominant: ' + JSON.stringify(before));
if (before.bodyScrollWidth > before.viewportWidth + 2) throw new Error('Unexpected horizontal overflow: ' + JSON.stringify(before));

await page.getByLabel('Collapse JARVIS').click();
const after = await page.evaluate(() => ({
  mainWidth: document.querySelector('.main-surface').getBoundingClientRect().width,
  jarvisWidth: document.querySelector('.jarvis-pane').getBoundingClientRect().width,
}));
if (!(after.mainWidth > before.mainWidth)) throw new Error('Main surface did not expand when JARVIS collapsed');
if (!(after.jarvisWidth < before.jarvisWidth / 3)) throw new Error('JARVIS did not meaningfully collapse');

if (errors.length) throw new Error('Console/page errors: ' + errors.join(' | '));
if (external.length) throw new Error('External network requests observed: ' + external.join(' | '));

console.log('PASS  main surface dominates JARVIS at 1440x900');
console.log('PASS  JARVIS collapse expands the work surface');
console.log('PASS  no horizontal overflow at witness viewport');
console.log('PASS  no runtime console/page errors');
console.log('PASS  no HTTP/network requests');
console.log('METRICS ' + JSON.stringify({ before, after }));
console.log('RESULT  J4_VISUAL_STRUCTURE_PASS');

await browser.close();
