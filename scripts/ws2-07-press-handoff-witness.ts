/**
 * WS2-07 prerequisite — the PRESS AUTHORITY EDGE, walked in a browser.
 *
 * ONE QUESTION, and it is about a member-facing capability change the founder
 * ratified rather than one this branch chose:
 *
 *     On a SECTION-ADDRESSABLE draft, is the legacy Press whole-document
 *     editor genuinely unreachable — not merely refused after the fact?
 *
 * WHY A REFUSAL IS NOT ENOUGH. The handler witness already proves the server
 * declines a content save on a converted draft. That proves nothing about
 * whether a member can be dropped into a writable field first and told later.
 * A writer who types for ten minutes into a surface that cannot save is not
 * protected by a correct 409. So this walk asserts the ABSENCE of writing
 * authority in the DOM, and that attempted typing produces no PUT at all.
 *
 * THE RATIFIED STATE (2026-09-02):
 *
 *     unconverted legacy draft   Press whole-document editor remains writable
 *     section-addressable draft  Canvas is the writing authority; the Press
 *                                surface is readable, not writable, and points
 *                                to the same Work in Canvas
 *     future Press/publishing    unresolved — not decided by this prerequisite
 *
 * NO MEMBER PROSE. Synthetic fixtures, created and deleted by this run's own
 * ids. The walk reports counts, presence and navigation targets.
 *
 *   BASE=http://localhost:3105 npx tsx scripts/ws2-07-press-handoff-witness.ts
 */
import { randomUUID } from 'crypto';
import { memberRef } from '@/lib/privacy/memberRef';
import puppeteer, { type Page } from 'puppeteer';

const BASE = process.env.BASE ?? 'http://localhost:3105';

let failures = 0;
const check = (name: string, pass: boolean, detail = '') => {
  console.log(`  ${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  ${detail}` : ''}`);
  if (!pass) failures += 1;
};

/** Every surface a writer could put characters into. */
async function writableFields(page: Page) {
  /* Deliberately no helper functions inside evaluate: the TS runner injects a
     `__name` wrapper around named function expressions, which does not exist in
     the page and throws there. */
  return page.evaluate(`(() => {
    const areas = Array.from(document.querySelectorAll('textarea'));
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    /* CodeMirror mounts its editable as .cm-content[contenteditable]; naming it
       explicitly means a future swap of that widget cannot quietly pass. */
    const cm = Array.from(document.querySelectorAll('.cm-editor, .cm-content'));
    return {
      textareas: areas.map((a) => a.getAttribute('aria-label') || '?'),
      contenteditables: editables.length,
      codemirror: cm.length,
    };
  })()`) as Promise<{ textareas: string[]; contenteditables: number; codemirror: number }>;
}

async function main() {
  const { query } = await import('@/lib/db/postgres');

  /* ── fixtures: one member, two manuscripts ───────────────────────────── */
  const tag = randomUUID().slice(0, 8);
  const member = await query<{ id: string }>(
    `INSERT INTO members (passkey, username, password_hash, name)
     VALUES ($1,$2,'x','WS2-07 press walk') RETURNING id`,
    [`PRESS-${tag}`, `press-${tag}`]);
  const memberId = member.rows[0].id;
  const token = `press-${randomUUID().replace(/-/g, '')}`.slice(0, 64);
  await query(`INSERT INTO auth_sessions (member_id, session_token, expires_at)
               VALUES ($1,$2,NOW() + INTERVAL '2 hours')`, [memberId, token]);

  const makeManuscript = async (title: string) => {
    const r = await query<{ id: string }>(
      `INSERT INTO member_manuscripts (member_id, title) VALUES ($1,$2) RETURNING id`,
      [memberId, title]);
    await query(
      `INSERT INTO manuscript_sections (manuscript_id, position, heading, body) VALUES
         ($1,0,'One','Synthetic fixture prose, the first section.'),
         ($1,1,'Two','Synthetic fixture prose, the second section.')`, [r.rows[0].id]);
    return r.rows[0].id;
  };

  /* Three fixtures, three states of the ratified table. */
  const addressable = await makeManuscript('WS2-07 press · addressable');
  const legacy = await makeManuscript('WS2-07 press · legacy');
  const fresh = await makeManuscript('WS2-07 press · begun from Press');

  /* The addressable one gets a draft the ordinary way, so it is born converted. */
  const draftUrl = (id: string) => `${BASE}/api/sovereign/manuscripts/${id}/draft`;
  const post = await fetch(draftUrl(addressable), {
    method: 'POST', headers: { cookie: `maia_session=${token}` } });
  if (post.status !== 201) throw new Error(`fixture create failed: ${post.status}`);

  /* The legacy one is written the pre-conversion way: content, no sections.
     The product can no longer create such a draft — which is exactly the state
     this row of the ratified table exists to keep working. */
  const legacyContent = 'One\n\nSynthetic fixture prose, the first section.\n\n'
    + 'Two\n\nSynthetic fixture prose, the second section.\n';
  const legacyDraft = await query<{ id: string }>(
    `INSERT INTO manuscript_working_drafts
       (manuscript_id, member_id, content, base_source_hash, revision_count)
     VALUES ($1,$2,$3,'legacy',1) RETURNING id`, [legacy, memberId, legacyContent]);
  await query(`INSERT INTO working_draft_revisions (draft_id, revision_number, content, saved_by, note)
               VALUES ($1,1,$2,$3,'legacy')`, [legacyDraft.rows[0].id, legacyContent, memberId]);

  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? '/opt/pw-browsers/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    await browser.setCookie({
      name: 'maia_session', value: token, domain: new URL(BASE).hostname, path: '/' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    /* Every PUT to a draft, from the moment the page opens. */
    const puts: string[] = [];
    page.on('request', (r) => {
      if (r.method() === 'PUT' && r.url().includes('/draft')) puts.push(r.url());
    });

    const openPress = async (id: string) => {
      await page.goto(`${BASE}/press/manuscript?m=${id}&tab=draft`,
        { waitUntil: 'networkidle0', timeout: 60_000 });
      await new Promise((r) => setTimeout(r, 3500));
    };

    /* ── 1 · a section-addressable draft, opened in Press ─────────────── */
    console.log('\n1 · a SECTION-ADDRESSABLE draft, opened in Press');
    puts.length = 0;
    await openPress(addressable);
    let body = await page.evaluate(`document.body.innerText`) as string;
    let fields = await writableFields(page);

    check('the words are visible', body.includes('Synthetic fixture prose'),
      `${body.length} chars of page text`);
    check('NO writable field of any kind is mounted',
      fields.textareas.length === 0 && fields.contenteditables === 0 && fields.codemirror === 0,
      `${fields.textareas.length} textarea · ${fields.contenteditables} contenteditable · ${fields.codemirror} cm`);
    check('the handoff to Canvas is stated',
      /written on the Canvas/i.test(body) && /Open on the Canvas/i.test(body));

    /* The handoff must lead to the SAME Work. A link spelling the parameter
       differently would open the Canvas on a different manuscript, silently. */
    const href = await page.evaluate(`(() => {
      const a = Array.from(document.querySelectorAll('a'))
        .find((x) => /Open on the Canvas/i.test(x.textContent || ''));
      return a ? a.getAttribute('href') : null;
    })()`) as string | null;
    check('the handoff names this manuscript', href === `/writers-studio/canvas?m=${addressable}`,
      href ?? 'no link');

    /* ── 2 · typing produces nothing ──────────────────────────────────── */
    console.log('\n2 · the writer tries to type anyway');
    await page.evaluate(`(() => { (document.querySelector('main') || document.body).click(); })()`);
    await page.keyboard.type('words that must not be written', { delay: 5 });
    await new Promise((r) => setTimeout(r, 4000));
    check('no PUT was produced', puts.length === 0, `${puts.length} PUT(s)`);
    fields = await writableFields(page);
    check('still no writable field after the attempt',
      fields.textareas.length === 0 && fields.contenteditables === 0 && fields.codemirror === 0);

    await page.screenshot({
      path: 'docs/design/contracts/screenshots/ws2-07-press-handoff-readonly-desktop.png' as `${string}.png`,
    });
    console.log('  captured  docs/design/contracts/screenshots/ws2-07-press-handoff-readonly-desktop.png');

    /* ── 3 · the begin path — the fail-open defect this walk exists for ─ */
    console.log('\n3 · a NEW draft begun from Press');
    puts.length = 0;
    await openPress(fresh);
    /* The invitation, then the member's own gesture. */
    const begun = await page.evaluate(`(() => {
      const b = Array.from(document.querySelectorAll('button'))
        .find((x) => /begin|start/i.test(x.textContent || ''));
      if (!b) return false;
      b.click();
      return true;
    })()`) as boolean;
    check('Press offered to begin the draft', begun);
    await new Promise((r) => setTimeout(r, 4000));

    body = await page.evaluate(`document.body.innerText`) as string;
    fields = await writableFields(page);
    check('a new draft lands in the read-only handoff, not the legacy editor',
      fields.textareas.length === 0 && fields.contenteditables === 0 && fields.codemirror === 0
      && /written on the Canvas/i.test(body),
      `${fields.textareas.length} textarea · ${fields.contenteditables} contenteditable · ${fields.codemirror} cm`);
    check('and it produced no write of its own', puts.length === 0, `${puts.length} PUT(s)`);

    const bornAddressable = await query<{ ok: boolean }>(
      `SELECT section_addressable_at IS NOT NULL AS ok
         FROM manuscript_working_drafts WHERE manuscript_id = $1`, [fresh]);
    check('the draft the gesture created IS section-addressable',
      bornAddressable.rows[0]?.ok === true);

    /* ── 4 · the compatibility row of the ratified table ──────────────── */
    console.log('\n4 · an UNCONVERTED legacy draft stays writable');
    puts.length = 0;
    await openPress(legacy);
    fields = await writableFields(page);
    check('the legacy whole-document editor is mounted',
      fields.contenteditables + fields.codemirror > 0 || fields.textareas.length > 0,
      `${fields.textareas.length} textarea · ${fields.contenteditables} contenteditable · ${fields.codemirror} cm`);

    await page.evaluate(`(() => {
      const el = document.querySelector('.cm-content')
        || document.querySelector('[contenteditable="true"]')
        || document.querySelector('textarea');
      if (el) el.focus();
    })()`);
    await page.keyboard.type(' A line the writer added.', { delay: 8 });
    await new Promise((r) => setTimeout(r, 4000));
    check('and it still saves by content', puts.length >= 1, `${puts.length} PUT(s)`);

    const legacyStill = await query<{ ok: boolean; len: number }>(
      `SELECT section_addressable_at IS NULL AS ok, length(content) AS len
         FROM manuscript_working_drafts WHERE manuscript_id = $1`, [legacy]);
    check('writing it did not convert it behind the writer',
      legacyStill.rows[0]?.ok === true, `${legacyStill.rows[0]?.len} chars`);

    console.log(`\n${failures === 0 ? 'WITNESSED' : 'FAILED'} — ${failures} failing check(s)\n`);
    process.exitCode = failures === 0 ? 0 : 1;
  } finally {
    await browser.close();
    if (process.env.KEEP_FIXTURE === '1') {
      /* ⛔ NOT the member id. A raw identifier in a log is the pattern the
         member-identifier gate exists to stop, and CI logs are durable — the
         fact that THIS member is synthetic does not make the habit safe, and a
         truncation would still be a fragment of the real thing. The username
         this run invented is enough to find the fixture:
             SELECT id FROM members WHERE username = 'press-<tag>'
         and memberRef is the correlating handle if one is wanted. */
      console.log(`  fixture kept: username press-${tag} · ref ${memberRef(memberId)}`);
    } else {
      await query(`DELETE FROM member_manuscripts WHERE member_id = $1`, [memberId]);
      await query(`DELETE FROM members WHERE id = $1`, [memberId]);
      console.log('  fixture removed');
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
