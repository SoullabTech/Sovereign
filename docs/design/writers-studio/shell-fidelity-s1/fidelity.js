// SHELL-FIDELITY-01 instrument. Usage: node fidelity.js <file.html> [label]
// Same selectors for every candidate; contract numbers are the board's, never the candidate's.
const { chromium } = require('playwright');
const TOL = 6;
const C = {
  G1_top_h: 56,
  G2_ms: [13, 311, 63, 1011],
  G3_maia: [1193, 1524, 63, 1011],
  G4_work: [333, 1175],
  G5_hero: [334, 1174, 206, 437],
  G6_row1: [505, 570],
  G7_pitch: 68,
  G8_lower_top: 785,
};
const COLORS = { ground: [243, 243, 243], panel: [254, 254, 254], ink: [8, 20, 59] };
const WIDTHS = [1536, 1440, 1280, 1100, 1024];

const near = (a, b) => Math.abs(a - b) <= TOL;
const rgb = (s) => (s.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number);
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

(async () => {
  const file = process.argv[2], label = process.argv[3] || file;
  const b = await chromium.launch();
  const results = [];
  const rec = (id, ok, detail) => results.push({ id, ok, detail });
  const box = async (p, sel, all) => p.evaluate(([s, a]) => {
    const els = a ? [...document.querySelectorAll(s)] : [document.querySelector(s)].filter(Boolean);
    return els.map((e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), r: Math.round(r.right), t: Math.round(r.top), b: Math.round(r.bottom) }; });
  }, [sel, all]);

  const p = await b.newPage({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });
  await p.goto('file://' + file); await p.waitForTimeout(700);
  const top = (await box(p, 'header'))[0];
  rec('G1', !!top && near(top.b - top.t, C.G1_top_h), top ? `h=${top.b - top.t}` : 'no header');
  const ms = (await box(p, '[aria-label="Manuscript"]'))[0];
  rec('G2', !!ms && [ms.l, ms.r, ms.t, ms.b].every((v, i) => near(v, C.G2_ms[i])), ms ? `${ms.l}/${ms.r}/${ms.t}/${ms.b}` : 'missing');
  const mi = (await box(p, '[aria-label="MAIA"]'))[0];
  rec('G3', !!mi && [mi.l, mi.r, mi.t, mi.b].every((v, i) => near(v, C.G3_maia[i])), mi ? `${mi.l}/${mi.r}/${mi.t}/${mi.b}` : 'missing');
  const wk = (await box(p, 'main'))[0];
  rec('G4', !!wk && near(wk.l, C.G4_work[0]) && near(wk.r, C.G4_work[1]), wk ? `${wk.l}/${wk.r}` : 'missing');
  const he = (await box(p, '.hero'))[0];
  rec('G5', !!he && [he.l, he.r, he.t, he.b].every((v, i) => near(v, C.G5_hero[i])), he ? `${he.l}/${he.r}/${he.t}/${he.b}` : 'missing');
  const rows = await box(p, '.theme', true);
  rec('G6', rows.length > 0 && near(rows[0].t, C.G6_row1[0]) && near(rows[0].b, C.G6_row1[1]), rows[0] ? `${rows[0].t}/${rows[0].b}` : 'missing');
  rec('G7', rows.length > 1 && near(rows[1].t - rows[0].t, C.G7_pitch), rows[1] ? `pitch=${rows[1].t - rows[0].t}` : 'missing');
  const lo = (await box(p, '.lower'))[0];
  rec('G8', !!lo && near(lo.t, C.G8_lower_top), lo ? `t=${lo.t}` : 'missing');
  const col = await p.evaluate(() => ({
    ground: getComputedStyle(document.body).backgroundColor,
    panel: getComputedStyle(document.querySelector('[aria-label="MAIA"]')).backgroundColor,
    ink: getComputedStyle(document.querySelector('main h1')).color,
  }));
  for (const k of Object.keys(COLORS)) { const d = dE(rgb(col[k]), COLORS[k]); rec(`P1.${k}`, d <= 6, `${col[k]} ΔE=${d.toFixed(1)}`); }
  const bad = await p.evaluate(() => (document.body.innerText.match(/\u00e2\u20ac|\u00c3.|\ufffd/g) || []).length);
  rec('G9', bad === 0, `mojibake sequences=${bad}`);
  const wrapped = await p.evaluate(() => [...document.querySelectorAll('.range')].filter((e) => e.getClientRects().length > 1 || e.offsetHeight > 20).length);
  rec('G10', wrapped === 0, `wrapped chapter ranges=${wrapped}`);
  await p.screenshot({ path: file.replace(/\.html$/, '') + '-1536.png' });
  await p.close();

  for (const w of WIDTHS) {
    const q = await b.newPage({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 });
    await q.goto('file://' + file); await q.waitForTimeout(400);
    const m = (await box(q, '[aria-label="MAIA"]'))[0], k = (await box(q, 'main'))[0];
    const ok = m && k && m.l >= k.r - 1 && m.t < k.b && Math.abs(m.t - k.t) < 40;
    rec(`R1@${w}`, !!ok, m && k ? `maia l=${m.l} t=${m.t} · work r=${k.r} t=${k.t}` : 'missing');
    await q.close();
  }
  await b.close();
  const fail = results.filter((r) => !r.ok);
  console.log(`\n${label}`);
  for (const r of results) console.log(`  ${r.ok ? 'PASS' : 'FAIL'}  ${r.id.padEnd(10)} ${r.detail}`);
  console.log(`  → ${results.length - fail.length}/${results.length} ${fail.length ? 'RED' : 'GREEN'}`);
  process.exit(fail.length ? 1 : 0);
})();
