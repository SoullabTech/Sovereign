/**
 * WS2 02c-2R successor runtime witness — real browser, real dev server,
 * real DB-backed proposal. Observes only; changes nothing.
 */
import puppeteer from 'puppeteer';

const [,, base, m, p, token] = process.argv;
const url = `${base}/writers-studio/review?m=${m}&p=${p}`;

const console_lines = [];
const page_errors = [];
const failed_requests = [];

const browser = await puppeteer.launch({
  /* Host-supplied. The literal is the container binary that produced the
     remote witness; CHROMIUM_PATH lets another host run these exact bytes
     unchanged rather than editing the instrument after extraction. */
  executablePath:
    process.env.CHROMIUM_PATH ||
    '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const page = await browser.newPage();
page.on('console', (msg) => console_lines.push(`[${msg.type()}] ${msg.text()}`));
page.on('pageerror', (err) => page_errors.push(`${err.name}: ${err.message}`));
page.on('requestfailed', (r) => failed_requests.push(`${r.url()} ${r.failure()?.errorText}`));

await page.setCookie(
  { name: 'maia_session', value: token, domain: '127.0.0.1', path: '/' },
);

const resp = await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

// give the loading -> loaded transition room to complete
try {
  await page.waitForSelector('[data-structure-review]', { timeout: 20000 });
} catch { /* recorded as absent below */ }
await new Promise((r) => setTimeout(r, 1500));

const dom = await page.evaluate(() => {
  const q = (s) => document.querySelectorAll(s).length;
  const review = document.querySelector('[data-structure-review]');
  const marks = [...document.querySelectorAll('[data-mark-question]')]
    .slice(0, 3).map((e) => e.getAttribute('aria-label'));
  return {
    http_title: document.title,
    structure_review_present: !!review,
    review_form: review?.getAttribute('data-form') ?? null,
    loading_state_present: q('[data-review-state="loading"]') > 0,
    review_notice: document.querySelector('[data-review-notice]')?.textContent ?? null,
    mark_question_count: q('[data-mark-question]'),
    mark_open_count: q('[data-mark-open]'),
    mark_aria_labels: marks,
    talk_with_maia_count: q('[data-talk-with-maia]'),
    review_map_present: q('[data-review-map]') > 0,
    inspector_present: q('.ws2sr-inspector') > 0,
    next_error_overlay: q('nextjs-portal') > 0,
    body_text_head: (document.body.innerText || '').slice(0, 260),
  };
});

// exercise the 02c-2 marker: click the first question mark, which runs
// takeUpMark -- the callback the defect had below the loading return.
let marker = { clicked: false };
if (dom.mark_question_count > 0) {
  await page.click('[data-mark-question]');
  await new Promise((r) => setTimeout(r, 1200));
  marker = await page.evaluate(() => ({
    clicked: true,
    ask_maia_panel: document.querySelectorAll('[data-ask-maia]').length,
    inspector_id: document.querySelector('.ws2sr-inspector')?.getAttribute('data-inspector') ?? null,
    inspector_question_count: document.querySelectorAll('[data-inspector-question]').length,
    body_has_ask: /MAIA/i.test(document.body.innerText || ''),
  }));
}

console.log(JSON.stringify({
  url, http_status: resp?.status() ?? null,
  dom, marker,
  hook_faults: console_lines.filter((l) =>
    /Rendered more hooks|Rendered fewer hooks|change in the order of Hooks|Rules of Hooks/i.test(l)),
  page_errors,
  console_errors: console_lines.filter((l) => l.startsWith('[error]')),
  console_all_count: console_lines.length,
  console_all: console_lines.slice(0, 40),
  failed_requests,
}, null, 2));

await browser.close();
