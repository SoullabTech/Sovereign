/**
 * PERSONA P1: the first-timer.
 *
 * An adult with an idea and a feeling and no manuscript, newly invited to Writer's Studio. She signs in, lands on Home
 * with zero Works, and presses what she can see. Slice 1 stops at the doors: for each control she can reach, where does
 * it go? It does NOT write, save, ask MAIA, adopt an edit or export. There is no MAIA step in this slice.
 *
 * What this walk does and does not decide:
 *  - It decides whether a control LEADS SOMEWHERE (a page with real rendered text, a dialog, a changed state, a request
 *    that succeeded) or leads nowhere (blank page, 4xx/5xx, dead link, bounce to sign-in, nothing happened).
 *  - It does NOT decide whether where it leads is GOOD, honest or kind. That needs a person reading it.
 *
 * Reach: from the first-visit Home, one press at a time (depth 1). When a press opens a menu or changes the studio view,
 * the controls it revealed are pressed too, again from a fresh Home (depth 2), and the contents of a menu opened at depth 2
 * or deeper are pressed at depth 3 and 4 (MAX_DEPTH). Every press is made by a NEW fictional member, so pressing "Just let me
 * write" (which makes a Work) cannot change the Home the next control is tried from.
 *
 * What is said about "pressed": only a control a click was DELIVERED to is pressed (pressAndObserve sets obs.pressed). A control
 * that was listed and found disabled, that points off the product, that could not be found again or whose click was refused has a
 * row and was not pressed; so does one the trial cap left alone. The report counts those separately (tallyPresses), and a control
 * a press revealed that never got a row at all (the depth limit, or a press the walk does not descend into: it descends only into
 * a disclosure, or at depth 2 into a press that revealed three or more controls) is counted apart from both.
 */
import { PASS, DEAD_END, NOT_RUN } from '../lib/ledger.mjs';
import { classifyTrial, REAL_TEXT_MIN, tallyPresses, describeTally, unrowedControls, baseKey } from '../lib/classify.mjs';
import { launch, newContext, signInViaForm, gotoRetrying, enumerateControls, waitForControl, settle, pressAndObserve, trackInFlight, modelCallCount, STUDIO_LOADING } from '../lib/trial.mjs';
import { openMembers } from '../lib/members.mjs';

export const PERSONA = 'P1 first-timer';
/** How many presses deep the walk goes (Home is depth 1). The README states this number and readme.test.mjs fails if they differ. */
export const MAX_DEPTH = 4;

/** What a person does before a control becomes pressable. Keyed by the control's label. */
const PREPARE = {
  'Tell MAIA': async (page) => { await page.locator('textarea').first().fill('I have always wanted to write about my grandmother’s village.'); },
};

const clip = (s, n = 90) => { const t = String(s ?? '').replace(/\s+/g, ' ').trim(); return t.length > n ? t.slice(0, n) + '…' : t; };
const labelOf = (c) => c.label || `[unlabelled ${c.tag}${c.cls ? '.' + c.cls : ''}]`;

export function plan(L) {
  L.plan('P1-01', 'Signs in with the real sign-in form as a freshly rostered fictional member');
  L.plan('P1-02', 'Opens Writer’s Studio: not sent back to sign-in or the invitation page, and Home renders real text');
  L.plan('P1-03', 'Has zero Works (the server says so) and Home shows no Works list');
  L.plan('P1-04', 'Every control visible on Home is listed');
  L.plan('P1-06', 'Every control given a row was accounted for: pressed, or listed with why it was not; none left unsettled or skipped by the trial cap');
  L.plan('P1-07', 'The “Free and Pro” link to /writers-studio/plans (the study’s 404 link), found under Writing preferences, leads to a page that renders');
  L.plan('P1-08', 'The four mode buttons (Write, Develop, Review, Publish) each lead somewhere from the studio with zero Works');
}

export async function walk(L, env) {
  const { base, modelLog, databaseUrl, maxTrials } = env;
  const members = await openMembers(databaseUrl);
  const blocked = [];
  const browser = await launch();
  L.meta.Browser = `Chromium ${browser.version()}`;
  const origin = new URL(base).origin;
  try {
    // ---------------------------------------------------------------- P1-01 (the real sign-in form)
    const lead = await members.fresh('p1ui');
    const ctx0 = await newContext(browser, base, blocked);
    const page0 = await ctx0.newPage();
    await L.step('P1-01', async () => {
      await page0.goto(`/signin?u=${encodeURIComponent(lead.username)}`, { waitUntil: 'domcontentloaded' });
      await page0.getByPlaceholder('Password').fill(lead.password, { timeout: 60000 });
      await page0.getByRole('button', { name: 'Sign in', exact: true }).click();
      await page0.waitForURL(u => !/^\/signin/.test(u.pathname), { timeout: 60000 });
      return { status: PASS, evidence: `typed the username and password on /signin, pressed “Sign in”, and was taken to ${new URL(page0.url()).pathname}` };
    });

    // ---------------------------------------------------------------- P1-02
    let landing = null;
    await L.step('P1-02', async () => {
      await gotoRetrying(page0, '/writers-studio');
      landing = await settle(page0, { quietMs: 2000, capMs: 120000, notWhile: STUDIO_LOADING });
      const p = new URL(landing.url).pathname;
      if (/^\/(signin|invitation-required)/.test(p)) return { status: DEAD_END, evidence: `/writers-studio sent a rostered member to ${p}` };
      if (STUDIO_LOADING.test(landing.text)) return { status: DEAD_END, evidence: `/writers-studio was still showing its loading fallback ("Opening Writer’s Studio…") after 120 s` };
      if (landing.text.length < REAL_TEXT_MIN) return { status: DEAD_END, evidence: `/writers-studio rendered ${landing.text.length} characters of text: blank` };
      if (landing.overlay) return { status: DEAD_END, evidence: `/writers-studio showed a framework error overlay: ${clip(landing.overlay)}` };
      return { status: PASS, evidence: `at ${p}; the page reads: "${clip(landing.text, 140)}"` };
    });

    // ---------------------------------------------------------------- P1-03
    await L.step('P1-03', async () => {
      const counts = await page0.evaluate(async () => {
        const out = {};
        for (const u of ['/api/sovereign/living-works', '/api/sovereign/manuscripts']) {
          const r = await fetch(u, { credentials: 'same-origin' });
          let n = null; const j = await r.json().catch(() => null);
          if (Array.isArray(j)) n = j.length; else if (j && typeof j === 'object') { const a = Object.values(j).find(Array.isArray); if (a) n = a.length; }
          out[u] = { status: r.status, n };
        }
        return out;
      });
      const bad = Object.entries(counts).find(([, v]) => v.status !== 200 || v.n === null);
      if (bad) return { status: NOT_RUN, evidence: `could not read the Works count from ${bad[0]} (HTTP ${bad[1].status}, shape unknown)` };
      const total = Object.values(counts).reduce((a, v) => a + v.n, 0);
      const listShown = /YOUR WORKS|Your works|Return to this work|Welcome back to/.test(landing.text);
      if (total !== 0) return { status: DEAD_END, evidence: `a freshly rostered member already holds ${total} Work(s): ${JSON.stringify(counts)}` };
      if (listShown) return { status: DEAD_END, evidence: 'the server holds zero Works yet Home shows a Works list or a welcome-back to a Work' };
      return { status: PASS, evidence: `living-works n=${counts['/api/sovereign/living-works'].n}, manuscripts n=${counts['/api/sovereign/manuscripts'].n}; Home shows no Works list` };
    });

    // ---------------------------------------------------------------- P1-04
    const first = await enumerateControls(page0);
    await L.step('P1-04', async () => {
      if (first.controls.length === 0) return { status: DEAD_END, evidence: 'Home shows no control a person can press' };
      return { status: PASS, evidence: `${first.controls.length} controls: ${first.controls.map(c => `${c.kind} “${labelOf(c)}”${c.disabled ? ' (disabled)' : ''}`).join(', ')}. ${first.fields.length} field(s) not pressed: ${first.fields.join(', ') || 'none'}` };
    });
    await ctx0.close();

    // ---------------------------------------------------------------- P1-05.* the walk
    const tried = [];        // { id, depth, pathKeys, pathLabels, control, obs, result }
    const queue = [];
    const rowKeys = new Set();       // base keys of every control that was given a row
    const revealedUnrowed = [];      // controls a press revealed that were NOT queued (depth limit / not a menu)
    let seq = 0; // eslint-disable-line no-unused-vars
    // Insert a row directly after the last row that already sits under `anchorId` (rows are named by their path).
    const addRow = (anchorId, prefix, id, title) => {
      let after = anchorId;
      for (const r of L.rows) if (r.id.startsWith(prefix)) after = r.id;
      L.addAfter(after, id, title);
    };
    first.controls.forEach((c, i) => {
      const id = `P1-05.${String(i + 1).padStart(2, '0')}`;
      addRow('P1-04', 'P1-05.', id, `Home › ${c.kind} “${labelOf(c)}”`);
      rowKeys.add(baseKey(c.key));
      queue.push({ id, depth: 1, parentKeys: [], parentLabels: [], control: c, title: `Home › ${c.kind} “${labelOf(c)}”` });
    });

    let trials = 0; let skippedByCap = 0;
    while (queue.length) {
      const item = queue.shift();
      if (trials >= maxTrials) {
        L.settle(item.id, NOT_RUN, `trial cap reached (${maxTrials}); not pressed`);
        skippedByCap += 1;
        continue;
      }
      trials += 1;
      let obs = null; let result = null;
      let session = null;
      try {
        const member = await members.fresh('p1');
        const ctx = await newContext(browser, base, blocked);
        const page = await ctx.newPage();
        session = { ctx, page };
        // Watches same-origin requests from the first one, so a request an earlier press started is still known when the
        // next press is made (the page is waited on until nothing is in flight, and a press is credited only with its own).
        const flight = trackInFlight(page, origin);
        await signInViaForm(page, member);
        await gotoRetrying(page, '/writers-studio');
        await settle(page, { quietMs: 1500, capMs: 90000, notWhile: STUDIO_LOADING });
        // Replay the parents that opened this view.
        let replayFailed = null;
        for (const key of item.parentKeys) {
          const c = await waitForControl(page, key, 10000);
          if (!c) { replayFailed = `parent control ${key.split('|')[2] || key} did not appear within 10 s when the path was replayed`; break; }
          await page.locator(`[data-jl="${c.idx}"]`).click({ timeout: 6000 }).catch(e => { replayFailed = `parent press failed: ${String(e.message).split('\n')[0]}`; });
          if (replayFailed) break;
          await settle(page, { quietMs: 1000, capMs: 15000, inflight: flight });
        }
        if (replayFailed) {
          obs = { label: labelOf(item.control), kind: item.control.kind, clickError: { kind: 'not-found', message: replayFailed } };
        } else {
          const c = await waitForControl(page, item.control.key, 10000);
          obs = c
            ? await pressAndObserve(page, ctx, c, { base, modelLog, windowMs: 2500, prepare: PREPARE[c.label] || null, flight })
            : { label: labelOf(item.control), kind: item.control.kind, clickError: { kind: 'not-found', message: 'the control did not appear within 10 s on the screen reached by replaying the path' } };
        }
        result = classifyTrial(obs);
        if (obs.pageErrors && obs.pageErrors.length) result = { ...result, evidence: `${result.evidence} [an uncaught page error followed: ${obs.pageErrors[0]}]` };
      } catch (e) {
        result = { status: NOT_RUN, evidence: `could not be decided: ${String(e && e.message ? e.message : e).split('\n')[0].slice(0, 220)}` };
      } finally {
        if (session) await session.ctx.close().catch(() => {});
      }
      L.settle(item.id, result.status, result.evidence);
      tried.push({ id: item.id, depth: item.depth, pathKeys: [...item.parentKeys, item.control.key], pathLabels: [...item.parentLabels, labelOf(item.control)], control: item.control, obs, result });

      // Expand: a menu or a changed studio view reveals more controls. Depth 3 only through a menu.
      const revealed = (obs && obs.revealedControls) || [];
      const stillStudio = obs && obs.urlAfter && new URL(obs.urlAfter).origin === origin && new URL(obs.urlAfter).pathname.startsWith('/writers-studio');
      const nextDepth = item.depth + 1;
      const may = nextDepth <= MAX_DEPTH && result.status !== NOT_RUN && stillStudio && revealed.length > 0 &&
        (nextDepth <= 2 ? (item.control.disclosure || revealed.length >= 3) : item.control.disclosure);
      if (may) {
        revealed.forEach((c, i) => {
          const id = `${item.id}.${String(i + 1).padStart(2, '0')}`;
          const title = `${item.title} › ${c.kind} “${labelOf(c)}”`;
          addRow(item.id, `${item.id}.`, id, title);
          rowKeys.add(baseKey(c.key));
          queue.push({ id, depth: nextDepth, parentKeys: [...item.parentKeys, item.control.key], parentLabels: [...item.parentLabels, labelOf(item.control)], control: c, title });
        });
      } else {
        revealedUnrowed.push(...revealed);
      }
    }

    // ---------------------------------------------------------------- P1-06 nothing skipped
    await L.step('P1-06', async () => {
      const rows = L.rows.filter(r => /^P1-05\./.test(r.id));
      const unsettled = rows.filter(r => !r.settled);
      if (rows.length === 0) return { status: DEAD_END, evidence: 'no control rows were created' };
      if (unsettled.length) return { status: NOT_RUN, evidence: `${unsettled.length} of ${rows.length} control rows were never reached` };
      if (skippedByCap) return { status: NOT_RUN, evidence: `the trial cap (${maxTrials}) was reached: ${skippedByCap} of ${rows.length} controls were not pressed` };
      const c = { PASS: 0, 'DEAD END': 0, 'NOT RUN': 0 };
      rows.forEach(r => { c[r.status] += 1; });
      const t = tallyPresses(tried.map(x => x.obs), skippedByCap);
      // pressed + not pressed must be every row: if the two ledgers of the walk disagree, say nothing about what was pressed.
      if (t.total !== rows.length) return { status: NOT_RUN, evidence: `the walk's own books disagree: ${rows.length} control rows but ${t.total} accounted for (${t.pressed} pressed, ${t.notPressed} not)` };
      return { status: PASS, evidence: describeTally(t, { maxDepth: MAX_DEPTH, outcomes: c }) };
    });

    // ---------------------------------------------------------------- P1-07 the study's /plans link
    await L.step('P1-07', async () => {
      const t = tried.find(x => x.control.href === '/writers-studio/plans');
      if (!t) return { status: NOT_RUN, evidence: `no control with href /writers-studio/plans was reachable within the walk (depth ≤ ${MAX_DEPTH}); not tried` };
      return { status: t.result.status, evidence: `${t.id}: ${t.result.evidence}` };
    });

    // ---------------------------------------------------------------- P1-08 the four mode buttons
    await L.step('P1-08', async () => {
      const wanted = ['Write', 'Develop', 'Review', 'Publish'];
      const zeroWorks = tried.filter(x => x.pathLabels[0] === 'I already have pages' && x.depth === 2);
      const found = wanted.map(w => zeroWorks.find(x => x.control.kind === 'button' && x.control.label === w));
      const missing = wanted.filter((w, i) => !found[i]);
      if (missing.length) return { status: NOT_RUN, evidence: `not found on the zero-Works studio view: ${missing.join(', ')}` };
      const dead = found.filter(f => f.result.status === DEAD_END);
      const notRun = found.filter(f => f.result.status === NOT_RUN);
      const line = found.map(f => `${f.control.label}=${f.result.status}`).join(', ');
      if (dead.length) return { status: DEAD_END, evidence: `${line}. ${dead.map(f => `${f.id}: ${f.result.evidence}`).join(' | ')}` };
      if (notRun.length) return { status: NOT_RUN, evidence: `${line}. ${notRun.map(f => `${f.id}: ${f.result.evidence}`).join(' | ')}` };
      return { status: PASS, evidence: line };
    });

    const tally = tallyPresses(tried.map(x => x.obs), skippedByCap);
    L.meta['Controls pressed'] = `${tally.pressed} (a click was delivered to each)`;
    L.meta['Controls found, not pressed'] = tally.notPressed ? `${tally.notPressed} (${tally.reasons}); each has its own row` : '0';
    const unrowed = unrowedControls(revealedUnrowed, rowKeys);
    L.meta['Revealed by a press, never given a row'] = unrowed.length
      ? `${unrowed.length} distinct control(s), not expanded (the depth limit ${MAX_DEPTH}, a press that left the Studio, or a view change that is not a menu): ${unrowed.slice(0, 12).map(c => `${c.kind} “${labelOf(c)}”`).join(', ')}${unrowed.length > 12 ? `, and ${unrowed.length - 12} more` : ''}`
      : '0';
    if (blocked.length) {
      const hosts = [...new Set(blocked.map(b => { try { return new URL(b.split(' ')[1]).host; } catch { return b; } }))];
      L.note(`requests to other hosts were blocked by the harness (${blocked.length}); hosts: ${hosts.join(', ')}`);
    } else {
      L.note('no request left localhost during the walk');
    }
    L.note(`model stub calls during the whole walk: ${modelCallCount(modelLog)} (the stub refuses every call)`);
    const fieldsNote = first.fields.length ? `fields on first-visit Home (typed into only by the “Tell MAIA” preparation): ${first.fields.join(', ')}` : null;
    if (fieldsNote) L.note(fieldsNote);
  } finally {
    await browser.close().catch(() => {});
    await members.close().catch(() => {});
  }
}
