/**
 * WS2-07 prerequisite — the AUTHENTICATED BROWSER WALK of the writing surfaces.
 *
 * ONE QUESTION the handler witness cannot answer:
 *
 *     A section-addressable draft is now real section nodes in client state.
 *     Does the sheet still read as ONE PAGE?
 *
 * That is the whole risk of the ruled architecture on the surface. "Section-
 * native is not permission to draw a card around every section." So the walk
 * asserts the boundaries are INVISIBLE — geometrically, not by eye: no gap
 * between consecutive nodes, no border, no background of their own, one shared
 * type — and captures the page at desktop and phone widths as the Experience
 * Contract's evidence.
 *
 * NO MEMBER PROSE. The fixture is synthetic and obviously named. The walk reads
 * geometry and computed style; the screenshots are of that fixture only.
 *
 *   BASE=http://localhost:3105 MANUSCRIPT=<uuid> TOK=<session token> \
 *   OUT=docs/design/contracts/screenshots \
 *   npx tsx scripts/ws2-07-liveness-browser-witness.ts
 */
import puppeteer, { type Page } from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';
const MANUSCRIPT = process.env.MANUSCRIPT ?? '';
const TOK = process.env.TOK ?? '';
const OUT = process.env.OUT ?? 'docs/design/contracts/screenshots';

let failures = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures += 1;
};

async function fields(page: Page) {
  return page.evaluate(() => {
    const nodes = Array.from(document.querySelectorAll('textarea'));
    return nodes.map((n) => {
      const r = n.getBoundingClientRect();
      const cs = getComputedStyle(n);
      return {
        top: r.top, bottom: r.bottom, left: r.left, width: r.width, height: r.height,
        len: (n as HTMLTextAreaElement).value.length,
        border: cs.borderTopWidth + ' ' + cs.borderBottomWidth,
        background: cs.backgroundColor,
        font: cs.fontFamily + ' / ' + cs.fontSize + ' / ' + cs.lineHeight,
        marginTop: cs.marginTop, marginBottom: cs.marginBottom,
        paddingTop: cs.paddingTop, paddingBottom: cs.paddingBottom,
      };
    });
  });
}

async function main() {
  if (!MANUSCRIPT || !TOK) {
    console.error('MANUSCRIPT and TOK are required.');
    process.exit(1);
  }
  const url = `${BASE}/writers-studio/canvas?m=${MANUSCRIPT}`;
  const hostname = new URL(BASE).hostname;
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });
  try {
    await browser.setCookie({ name: 'maia_session', value: TOK, domain: hostname, path: '/' });
    const page = await browser.newPage();

    for (const [label, width, height] of [['desktop', 1440, 900], ['mobile', 390, 844]] as const) {
      console.log(`\n· ${label} ${width}x${height}`);
      await page.setViewport({ width, height, deviceScaleFactor: 2 });
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
      await page.waitForSelector('textarea', { timeout: 30_000 });
      /* The nodes autosize on an animation frame after mount. */
      await new Promise((r) => setTimeout(r, 1500));

      const f = await fields(page);
      check('the draft opened section-native', f.length === 3, `${f.length} node(s)`);
      if (f.length < 2) continue;

      /* THE PAGE IS ONE PAGE. Each node begins exactly where the one above it
         ended — no gap is the assertion, and it is measured, not eyeballed. */
      let maxGap = 0;
      for (let i = 1; i < f.length; i += 1) maxGap = Math.max(maxGap, Math.abs(f[i].top - f[i - 1].bottom));
      check('no visible gap between consecutive sections', maxGap <= 1, `max ${maxGap.toFixed(2)}px`);

      check('no section draws a border', f.every((x) => x.border === '0px 0px'), f[0].border);
      check('no section draws its own ground',
        f.every((x) => /rgba\(0, 0, 0, 0\)|transparent/.test(x.background)), f[0].background);
      check('no section adds margin or padding of its own',
        f.every((x) => [x.marginTop, x.marginBottom, x.paddingTop, x.paddingBottom]
          .every((v) => parseFloat(v) === 0)));
      check('every section shares one type', new Set(f.map((x) => x.font)).size === 1, f[0].font);
      check('every section shares the measure',
        new Set(f.map((x) => Math.round(x.width))).size === 1
        && new Set(f.map((x) => Math.round(x.left))).size === 1,
        `${Math.round(f[0].width)}px`);
      check('every section holds its own characters', f.every((x) => x.len > 0),
        f.map((x) => x.len).join('/'));

      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      check('nothing forces horizontal scrolling', overflow <= 0, `${overflow}px`);

      const shot = `${OUT}/ws2-07-writing-surface-section-native-${label}.png`;
      await page.screenshot({ path: shot as `${string}.png`, fullPage: false });
      console.log(`  captured  ${shot}`);

      if (label !== 'desktop') continue;

      /* ── the member actually writes ──────────────────────────────────────
         A capture proves the page looks right. Only a keystroke proves the
         architecture holds: the surface must send SECTIONS, not content, and
         the words must survive a reload. */
      const puts: { hasSections: boolean; hasContent: boolean; ids: string[] }[] = [];
      page.on('request', (r) => {
        if (r.method() !== 'PUT' || !r.url().includes('/draft')) return;
        try {
          const b = JSON.parse(r.postData() ?? '{}');
          puts.push({
            hasSections: Array.isArray(b.sections),
            hasContent: Object.prototype.hasOwnProperty.call(b, 'content'),
            ids: (b.sections ?? []).map((x: { id: string }) => x.id),
          });
        } catch { /* a body we cannot read is reported by the assertions below */ }
      });

      const typed = ' A sentence the member typed during the walk.';
      const nodes = await page.$$('textarea');
      await nodes[1].click();
      await page.keyboard.press('End');
      await page.type('textarea:nth-of-type(2)', typed, { delay: 8 });
      /* Past the autosave debounce, plus the round trip. */
      await new Promise((r) => setTimeout(r, 4000));

      check('the keystroke produced a save', puts.length >= 1, `${puts.length} PUT(s)`);
      check('the save sent SECTIONS', puts.every((p) => p.hasSections));
      check('the save sent NO content — it is derived server-side',
        puts.every((p) => !p.hasContent));
      check('it carried every identity, unchanged',
        puts.every((p) => p.ids.length === 3));

      await page.reload({ waitUntil: 'networkidle0', timeout: 60_000 });
      await page.waitForSelector('textarea', { timeout: 30_000 });
      await new Promise((r) => setTimeout(r, 1500));
      const after = await fields(page);
      check('the words survived a reload, in their own section',
        after.length === 3 && after[1].len === f[1].len + typed.length,
        `${after.map((x) => x.len).join('/')}`);
      check('the boundaries are still invisible after a write',
        after.length === 3
        && Math.abs(after[1].top - after[0].bottom) <= 1
        && Math.abs(after[2].top - after[1].bottom) <= 1);
    }

    console.log(`\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    await browser.close();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
