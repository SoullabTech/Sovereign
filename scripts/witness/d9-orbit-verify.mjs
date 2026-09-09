import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell' });
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const out = [];
const ok = (n, v) => out.push(`${v ? 'PASS' : 'FAIL'}  ${n}`);
await p.goto('file://' + process.cwd() + '/ch4-working.html');
await p.waitForTimeout(400);

// 0 · arrival
ok('arrival: Structure closed',  await p.locator('#structure').isHidden());
ok('arrival: MAIA closed',       await p.locator('#maiaPanel').isHidden());
ok('arrival: Workbench closed',  await p.locator('#workbench').isHidden());
ok('arrival: no frame',          await p.locator('#frame').isHidden());

// 1 · select a passage inside section 0
await p.evaluate(() => {
  const b = document.querySelector('#s0 .body'), t = b.firstChild;
  const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 120);
  const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  document.dispatchEvent(new Event('selectionchange'));
});
await p.waitForTimeout(200);
const held1 = await p.evaluate(() => [...(CSS.highlights.get('held')||[])].map(r=>r.toString().length));
ok('2 · frame visible after selection', await p.locator('#frame').isVisible());
ok('2 · chip shows scale + text',       (await p.locator('#focusScale').innerText()).length > 0);
ok('2 · highlight painted',             held1.length === 1 && held1[0] > 50);

// 4 · click into the composer — THE DEFECT
await p.click('#q');
await p.waitForTimeout(200);
const held2 = await p.evaluate(() => [...(CSS.highlights.get('held')||[])].map(r=>r.toString().length));
const selCollapsed = await p.evaluate(() => getSelection().isCollapsed || getSelection().toString()==='');
ok('4 · browser selection is gone (defect condition reproduced)', selCollapsed);
ok('4 · FRAME STILL VISIBLE',            await p.locator('#frame').isVisible());
ok('4 · HIGHLIGHT SURVIVES',             held2.length === 1 && held2[0] === held1[0]);
ok('4 · chip still shown',               await p.locator('#focus').evaluate(e=>e.classList.contains('on')));

// 3 · drag the bottom handle down
const before = await p.evaluate(() => [...CSS.highlights.get('held')][0].toString().length);
const h = await p.locator('#frame .h.bot').boundingBox();
await p.mouse.move(h.x + h.width/2, h.y + h.height/2);
await p.mouse.down();
await p.mouse.move(h.x + h.width/2, h.y + 320, { steps: 14 });
await p.mouse.up();
await p.waitForTimeout(250);
const after = await p.evaluate(() => [...CSS.highlights.get('held')][0].toString().length);
ok(`3 · drag extends the frame (${before} → ${after} chars)`, after > before);

// 5 · ask about what is framed
await p.click('#q');
await p.fill('#q', 'what is happening across this');
await p.press('#q', 'Enter');
await p.waitForTimeout(250);
ok('5 · MAIA asks what we are attending to, rather than guessing',        /What are you wanting to understand or work with here/.test(await p.locator('#say').innerText()));
ok('5 · frame survives asking', await p.locator('#frame').isVisible());

// orbit: enter + leave without residue
const snap = () => p.evaluate(() => {
  const m = document.querySelector('main').getBoundingClientRect();
  return [Math.round(m.left), Math.round(m.width)].join(',');
});
const s0 = await snap();
await p.click('#bStructure'); await p.waitForTimeout(150);
const s1 = await snap();
ok('orbit: Structure open — Work did NOT move', s0 === s1);
await p.keyboard.press('Escape'); await p.waitForTimeout(150);
ok('orbit: Escape closed Structure', await p.locator('#structure').isHidden());
ok('orbit: no residue — Work unchanged', await snap() === s0);
ok('orbit: frame survived the orbit', await p.locator('#frame').isVisible());

// release only by writer act
await p.click('#clearFocus'); await p.waitForTimeout(150);
ok('release: frame gone on explicit Release', await p.locator('#frame').isHidden());
ok('release: highlight cleared', (await p.evaluate(() => [...(CSS.highlights.get('held')||[])].length)) === 0);

console.log(out.join('\n'));
console.log('\n' + out.filter(l=>l.startsWith('FAIL')).length + ' failed of ' + out.length);
await b.close();
