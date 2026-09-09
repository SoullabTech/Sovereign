/* DESIGN STUDY — LOCATION / FOCUS / THREAD.
   HARD FALSIFIER (founder): at no moment should the writer have to ask whether a
   visual mark represents location, attention, or conversation. If a treatment
   makes two of those meanings look the same, reject it.
   Measured, not eyeballed: each mark's HUE FAMILY, GEOMETRY and PLACE. */
import { chromium } from 'playwright';
const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'});

const hueOf = (rgb) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(rgb || '');
  if (!m) return 'none';
  const [r,g,bl,a] = [+m[1], +m[2], +m[3], m[4] === undefined ? 1 : +m[4]];
  if (a < 0.04) return 'none';
  if (Math.abs(r-g) < 14 && Math.abs(g-bl) < 14) return 'neutral';
  if (r > bl && r >= g) return 'gold';           // accent
  if (g >= r && g >= bl) return 'green';         // maia
  return 'other';
};

async function signatures(p) {
  return p.evaluate(() => {
    const cs = el => el ? getComputedStyle(el) : null;
    const px = v => parseFloat(v) || 0;

    // LOCATION — the current section's own marking, plus the rail row
    const here = document.querySelector('.sec.here');
    const hereS = cs(here), headS = cs(here?.querySelector('h2'));
    const railAt = document.querySelector('#stList a.at');
    const railS = cs(railAt);

    // FOCUS — the frame drawn around what the writer framed
    const fr = document.getElementById('frame');
    const frS = cs(fr);
    const before = fr ? getComputedStyle(fr, '::before') : null;
    const hl = getComputedStyle(document.documentElement); // held highlight is not enumerable

    // THREAD — what MAIA is attending to, marked in the Work
    const lit = document.querySelector('.sec.lit');
    const litBody = cs(lit?.querySelector('.body'));
    const litBefore = lit ? getComputedStyle(lit, '::before') : null;

    const geo = (s, pseudo) => {
      if (!s) return 'none';
      const bw = px(s.borderTopWidth) + px(s.borderBottomWidth);
      const lw = px(s.borderLeftWidth) + px(s.borderRightWidth);
      const bg = s.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.backgroundColor);
      if (pseudo && s.content && s.content !== 'none') {
        if (lw > 0 && bw > 0) return 'bracket';
        if (bg && px(s.width) <= 6) return 'margin-rule';
        if (bg) return 'fill';
      }
      if (bw > 0 && lw > 0) return 'box';
      if (bw > 0) return 'hrule';
      if (lw > 0) return 'vrule';
      if (bg) return 'fill';
      if (s.textDecorationLine && s.textDecorationLine !== 'none') return 'underline';
      return 'none';
    };

    const pick = (...cands) => cands.find(c => c.geometry !== 'none') || cands[0];

    /* Take the first colour property that is actually PAINTED, whatever the mark
       is made of. The earlier version guessed by geometry name and read
       borderTopColor from a background-painted margin rule, reporting MAIA's
       green as neutral. Instrument fault, found before trusting the verdict. */
    const painted = v => {
      if (!v) return false;
      const m = /rgba?\([^)]*?(?:,\s*([\d.]+))?\)$/.exec(v);
      const a = m && m[1] !== undefined ? +m[1] : 1;
      return a > 0.04;
    };
    const mk = (s, pseudo=false) => {
      if (!s) return { geometry: 'none', color: '' };
      const g = geo(s, pseudo);
      const cands = [
        px(s.borderTopWidth) || px(s.borderLeftWidth) ? s.borderTopColor || s.borderLeftColor : null,
        px(s.borderLeftWidth) ? s.borderLeftColor : null,
        s.backgroundColor,
        s.textDecorationLine !== 'none' ? s.textDecorationColor : null,
      ].filter(Boolean);
      return { geometry: g, color: cands.find(painted) || '' };
    };

    return {
      location: pick(mk(hereS), mk(headS), mk(railS)),
      locationRail: mk(railS),
      focus: pick(mk(before, true), mk(frS)),
      thread: pick(mk(litBefore, true), mk(litBody)),
      threadOrbit: mk(cs(document.getElementById('thread'))),
    };
  });
}

/* the walk, identical in every treatment */
async function walk(p, tag) {
  await p.evaluate(() => document.getElementById('s5').scrollIntoView({block:'center'}));
  await p.waitForTimeout(250);
  await p.screenshot({path:`study-${tag}-1-read.png`});

  await p.evaluate(() => {
    const a = document.querySelector('#s5 .body');
    const w = document.createTreeWalker(a, NodeFilter.SHOW_TEXT); const n = w.nextNode();
    const r = document.createRange(); r.setStart(n, 0); r.setEnd(n, Math.min(96, n.nodeValue.length));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    document.dispatchEvent(new Event('selectionchange'));
  });
  await p.waitForTimeout(300);
  await p.screenshot({path:`study-${tag}-2-focus.png`});
  const atFocus = await signatures(p);

  await p.click('#ask'); await p.waitForTimeout(250);
  await p.fill('#q', 'is anything repeating here'); await p.press('#q','Enter');
  await p.waitForTimeout(450);
  await p.screenshot({path:`study-${tag}-3-maia.png`});
  const atThread = await signatures(p);

  return { atFocus, atThread };
}

const results = {};
for (const t of ['A','B','C']) {
  const p = await b.newPage({viewport:{width:1440,height:900}});
  await p.goto(`file://${process.cwd()}/ch4-study.html?t=${t}`);
  await p.waitForTimeout(400);
  results[t] = await walk(p, t);
  await p.close();
}
await b.close();

console.log('LOCATION / FOCUS / THREAD — measured signatures\n');
let anyReject = false;
for (const t of ['A','B','C']) {
  const s = results[t].atThread;
  const marks = {
    LOCATION: { ...s.location, hue: hueOf(s.location.color) },
    FOCUS:    { ...s.focus,    hue: hueOf(s.focus.color) },
    THREAD:   { ...s.thread,   hue: hueOf(s.thread.color) },
  };
  console.log(`── treatment ${t} ──`);
  for (const [k,v] of Object.entries(marks))
    console.log(`   ${k.padEnd(9)} geometry=${String(v.geometry).padEnd(12)} hue=${v.hue}`);

  const pairs = [['LOCATION','FOCUS'],['LOCATION','THREAD'],['FOCUS','THREAD']];
  const collisions = pairs.filter(([a,c]) => {
    const x = marks[a], y = marks[c];
    if (x.geometry === 'none' || y.geometry === 'none') return false;
    return x.geometry === y.geometry && x.hue === y.hue;
  });
  if (collisions.length) {
    anyReject = true;
    for (const [a,c] of collisions)
      console.log(`   ✗ REJECT — ${a} and ${c} share geometry AND hue: a mark cannot say both`);
  } else {
    console.log('   ✓ all three meanings are visually distinct');
  }
  console.log('');
}
console.log(anyReject ? 'At least one treatment fails the falsifier.' : 'No treatment collides.');
