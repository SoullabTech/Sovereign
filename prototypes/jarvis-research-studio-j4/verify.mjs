import { chromium } from 'playwright';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve('prototypes/jarvis-research-studio-j4/index.html');
const url = pathToFileURL(root).href;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

function ok(condition, message) {
  if (!condition) throw new Error(message);
  console.log('PASS  ' + message);
}

await page.goto(url);
await page.waitForSelector('text=What are you working on?');
ok(await page.getByText('Relational Geometry Research').first().isVisible(), 'W0 arrival shows recent Project');

await page.getByRole('button', { name: /Relational Geometry Research/ }).click();
await page.waitForSelector('text=You were here.');
ok(await page.getByText(/Last human decision/).isVisible(), 'W1 return shows faithful continuity');

await page.getByRole('button', { name: 'Orient me first' }).click();
await page.waitForSelector('.home-title');
ok(await page.getByText(/Possible next act/).isVisible(), 'W2 Project Home orients without activity-feed framing');

await page.getByRole('button', { name: 'Open Research Studio' }).click();
await page.waitForSelector('text=Evidence Canvas');
ok(await page.getByText('Local Project').isVisible(), 'W3 Research Studio shows local custody strip');
ok(await page.getByText('Does geometry add explanatory value beyond simpler relation-first baselines?').first().isVisible(), 'W3 active inquiry is visible');

await page.getByRole('button', { name: /Common scaffold is pre-geometric/ }).click();
await page.waitForSelector('text=Challenges / pressure');
ok(await page.getByText('Show provenance').isVisible(), 'W4 Claim focus keeps provenance adjacent');

await page.getByRole('button', { name: 'Show provenance' }).click();
ok(await page.getByText('None to this durable Claim').isVisible(), 'W4 provenance distinguishes JARVIS edits');

await page.getByRole('button', { name: 'Open Source' }).click();
await page.waitForSelector('text=Selected research standing');
ok(await page.getByText(/full repository Source remains the authoritative document/).isVisible(), 'W5 Source Reader preserves source authority');

await page.getByRole('button', { name: 'Back to Canvas' }).first().click();
await page.getByRole('button', { name: /Common scaffold is pre-geometric/ }).click();
await page.getByRole('button', { name: 'Ask JARVIS' }).click();
await page.waitForSelector('text=Proposed Unknown');
ok(await page.getByText(/Not part of the durable Project until you act/).isVisible(), 'W6 JARVIS proposal does not silently persist');
await page.getByRole('button', { name: 'Accept' }).click();
ok(await page.getByText('Accepted Unknown').isVisible(), 'W6 human acceptance is explicit');

await page.getByRole('button', { name: 'Compare' }).click();
await page.waitForSelector('text=Temporary working view');
ok(await page.getByText('Graph / vector remain competitors').isVisible(), 'W7 comparison keeps baseline competitor visible');

await page.keyboard.press('Alt+h');
await page.waitForSelector('text=External comparison held');
ok(await page.getByText('Nothing has been sent.').isVisible(), 'W9 custody hold says nothing crossed');
ok(await page.getByText(/Only these three Sources would be included/).isVisible(), 'W9 custody hold names exact scope');
await page.getByRole('button', { name: 'Cancel' }).click();

await page.getByLabel('Collapse JARVIS').click();
ok((await page.locator('.research-grid').getAttribute('class')).includes('jarvis-collapsed'), 'W3A JARVIS collapses while Project remains');
ok(await page.getByText(/Temporary working view/).isVisible(), 'W3A main work survives JARVIS collapse');

await page.getByRole('button', { name: 'Witness states' }).click();
await page.getByRole('button', { name: /F1 · Source unavailable/ }).click();
await page.waitForSelector('text=One Source is unavailable.');
ok(await page.getByText(/prior provenance are intact/).isVisible(), 'F1 unavailable Source preserves Project context');

await page.getByRole('button', { name: 'Witness states' }).click();
await page.getByRole('button', { name: /F2 · Source changed/ }).click();
await page.waitForSelector('text=This Source changed');
ok(await page.getByText(/prior observed evidence state/).isVisible(), 'F2 changed Source preserves temporal standing');

await page.getByRole('button', { name: 'Witness states' }).click();
await page.getByRole('button', { name: /A1 · Synthesis Artifact/ }).click();
await page.waitForSelector('text=Working synthesis Artifact');
ok(await page.getByText(/Next experiment pressure/).isVisible(), 'A1 Research produces a durable-work-shaped Artifact');

await page.getByRole('button', { name: 'Witness states' }).click();
await page.getByRole('button', { name: /SYS · System escape/ }).click();
await page.waitForSelector('text=Secondary instrument');
ok(await page.getByText(/Operational truth remains reachable/).isVisible(), 'System remains reachable as secondary instrument');

await page.getByRole('button', { name: 'Witness states' }).click();
await page.getByRole('button', { name: /RET · Return-after-absence reprise/ }).click();
await page.waitForSelector('text=You can pick this up without rebuilding the context.');
ok(await page.getByText(/Define a fair graph-vs-geometry comparison/).isVisible(), 'Return-after-absence restores meaningful next act');

console.log('RESULT  J4_INTERACTION_WALK_PASS');
await browser.close();
