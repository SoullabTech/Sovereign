/**
 * Control-outcome classifier (pure; no browser here, so it can be tested on its own: classify.test.mjs).
 *
 * Input: what the browser OBSERVED after one control was pressed (see trial.mjs for how it is gathered).
 * Output: { status: PASS | DEAD END | NOT RUN, evidence }.
 *
 * Principles:
 *  - Judge RENDERED content, never only an HTTP status. A 200 with a blank page is a dead end; a "page could not be
 *    found" page that rendered words is still a dead end.
 *  - A control that leads nowhere (no URL, text, aria state, dialog, new control or network change) is a dead end,
 *    even if it is "supposed to" do something. Whether it is a defect or an intended "not yet" state is a product
 *    question; the ledger's job is to make the answer explicit, and the row stays DEAD END until the product says why.
 *  - What the harness cannot decide stays NOT RUN: an external link it will not follow, a click the framework's
 *    dev overlay swallowed, a control that needs a MAIA reply (slice 1 has no MAIA step).
 *  - A disabled control "says why" only if some explanatory text on it (title, aria-description, a described-by element) says
 *    something its own name does not. A title that merely repeats the label explains nothing and the control stays NOT RUN.
 *  - A press is credited only with what IT caused. A request the page made on its own (one that started before the press, or
 *    long after it) is not the press's; and a press made while the page was still moving (a request in flight, the address
 *    about to change) cannot be credited with whatever lands next, so it stays NOT RUN. Otherwise the verdict for an inert
 *    control depends on what the page happened to be doing, not on the control.
 */
import { PASS, DEAD_END, NOT_RUN } from './ledger.mjs';

/** Fewer visible characters than this on a landing page is "blank" (a spinner word, an empty shell). */
export const REAL_TEXT_MIN = 40;

/** Text that means the page, although it rendered words, is an error page. */
export const ERROR_MARKERS = Object.freeze([
  'This page could not be found',
  'Application error',
  'Internal Server Error',
  'Unhandled Runtime Error',
  'Page not found',
]);

/**
 * How long after a press (plus the time the click itself took) a request may START and still be credited to it. A click handler
 * starts its request within a frame or two; a page beacon or poll that begins later is the page's own. Cost of the choice,
 * disclosed in the README: a handler that starts its only effect later than this, on a page that shows nothing else, reads as a
 * DEAD END (loud, and the evidence names the request set aside), never as a PASS.
 */
export const ATTRIBUTION_MS = 500;

/**
 * Is this request the press's? `startOffsetMs` is when the request started, relative to the moment the click began (negative:
 * before it; null/absent: the harness was not yet watching, so it began earlier). `clickMs` is how long the click took to deliver.
 * Only a request that started after the press began, no later than ATTRIBUTION_MS after the click was delivered, is credited.
 */
export function isCausedByPress(r, clickMs = 0) {
  const t = r && r.startOffsetMs;
  return typeof t === 'number' && Number.isFinite(t) && t >= 0 && t <= (Number(clickMs) || 0) + ATTRIBUTION_MS;
}

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const sameText = (s) => norm(s).toLowerCase();
const clip = (s, n = 90) => { const t = norm(s); return t.length > n ? t.slice(0, n) + '…' : t; };
const pathOf = (u) => { try { const x = new URL(u); return x.pathname + x.search; } catch { return String(u); } };
const pathnameOf = (u) => { try { return new URL(u).pathname; } catch { return String(u); } };
const stripHash = (u) => String(u).split('#')[0];

/**
 * The explanation a disabled control gives for being disabled, or '' if it gives none. Candidates are `disabledReasons` (every
 * title / aria-description / described-by text found on it) and the older single `disabledReason`; one counts only if, ignoring case
 * and spacing, it differs from the control's own name: its label and every other name it carries (`ownNames`: aria-label, visible text,
 * value). A title that is the label, or that repeats the visible text under a longer aria-label, is the control naming itself.
 * Cost, disclosed in the README: an explanation that merely contains the name ("Save is available once...") counts as one.
 */
export function statedReason(o) {
  const own = new Set([o.label, ...(o.ownNames || [])].map(sameText).filter(Boolean));
  for (const r of [...(o.disabledReasons || []), o.disabledReason]) {
    const t = norm(r);
    if (t && !own.has(sameText(t))) return t;
  }
  return '';
}

function firstAdded(before, after) {
  const a = norm(before), b = norm(after);
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i += 1;
  return clip(b.slice(i), 100) || clip(b, 100);
}

export function classifyTrial(o) {
  const mine = (o.requests || []).filter(r => isCausedByPress(r, o.clickMs));
  const setAside = (o.requests || []).filter(r => !mine.includes(r));
  const out = decideTrial(o, mine);
  // A DEAD END that set requests aside says so, so a reader can see what the verdict did not count.
  if (out.status === DEAD_END && setAside.length) {
    const named = setAside.slice(0, 2).map(r => `${r.method} ${clip(r.url, 60)} answered HTTP ${r.status}`).join('; ');
    return { ...out, evidence: `${out.evidence} [not counted, not started by the press: ${named}${setAside.length > 2 ? `; and ${setAside.length - 2} more` : ''}]` };
  }
  return out;
}

function decideTrial(o, mine) {
  const who = `${o.kind || 'control'} "${clip(o.label, 40)}"`;

  // 1. The press itself.
  if (o.clickError) {
    if (o.clickError.kind === 'intercepted-by-page') {
      return { status: DEAD_END, evidence: `${who} cannot be pressed: something else on the page covers it (${clip(o.clickError.message, 120)}); a person could not press it either` };
    }
    return { status: NOT_RUN, evidence: `${who} could not be pressed (${o.clickError.kind}): ${clip(o.clickError.message, 140)}` };
  }

  // 2. Off the product: not followed.
  if (o.externalHref) {
    return { status: NOT_RUN, evidence: `${who} points off the product (${clip(o.externalHref, 80)}); not followed` };
  }

  // 3. Needs MAIA: slice 1 has no MAIA step, and the model is a stub that refuses. Never scored as the page working.
  if (o.modelCalls > 0) {
    return { status: NOT_RUN, evidence: `${who} asked a model (${o.modelCalls} call(s) to the loopback stub, which refuses); slice 1 has no MAIA step. The screen afterwards read: "${clip(o.textAfter, 110)}"` };
  }

  // 3b. Something was still on its way when the window closed: a screen that says "listening…" is not an outcome.
  if (o.pendingRequests > 0) {
    return { status: NOT_RUN, evidence: `${who} left ${o.pendingRequests} request(s) still in flight when the observation window closed, so where it leads is not decided (the screen then read: "${clip(o.textAfter, 80)}")` };
  }

  // 4. A control that could not be pressed because it is disabled.
  if (o.disabled) {
    const why = statedReason(o);
    return why
      ? { status: PASS, evidence: `${who} is disabled and says why: "${clip(why, 100)}"` }
      : { status: NOT_RUN, evidence: `${who} is disabled on arrival and nothing on it says why (no title or aria description that differs from its own name); its precondition is unknown to the harness, so where it leads is not decided` };
  }

  // 5. A same-page anchor.
  if (typeof o.href === 'string' && o.href.startsWith('#')) {
    return o.hashTargetExists
      ? { status: PASS, evidence: `${who} scrolls to #${o.href.slice(1)}, which exists on the page` }
      : { status: DEAD_END, evidence: `${who} points at ${o.href}, and no element with that id is on the page` };
  }

  // 6. Requests the press caused that failed.
  const failed = mine.find(r => r.status >= 400);
  if (failed) {
    return { status: DEAD_END, evidence: `${who} sent ${failed.method} ${clip(failed.url, 80)} and it answered HTTP ${failed.status}` };
  }

  // 7. A link whose target answers an error, whatever the client rendered.
  const probe = o.linkProbe?.status;
  if (probe != null && probe >= 400) {
    return { status: DEAD_END, evidence: `${who} -> ${clip(o.href, 80)} answers HTTP ${probe} (dead link)` };
  }

  // 7b. The page was still moving when the control was pressed: a request in flight, an address about to change. Whatever
  //     lands next may be the earlier press's, so a change (or no change) afterwards says nothing about THIS control.
  if (o.unsettledAtPress) {
    return { status: NOT_RUN, evidence: `${who} was pressed while the page was still moving (${clip(o.unsettledAtPress, 100)}), so a change afterwards cannot be credited to it and no change cannot be held against it; where it leads is not decided (the screen then read: "${clip(o.textAfter, 80)}")` };
  }

  // 8. The press went somewhere.
  const navigated = stripHash(o.urlAfter) !== stripHash(o.urlBefore) || !!o.popup || (o.document && o.document.status != null);
  if (navigated) {
    const doc = o.document?.status;
    if (doc != null && doc >= 400) {
      return { status: DEAD_END, evidence: `${who} led to ${pathOf(o.urlAfter)} which answered HTTP ${doc}` };
    }
    const landedPath = pathnameOf(o.urlAfter);
    const hrefPath = o.href ? pathnameOf(new URL(o.href, o.origin || 'http://localhost').href) : '';
    if (/^\/(signin|invitation-required)(\/|$)/.test(landedPath) && landedPath !== hrefPath) {
      return { status: DEAD_END, evidence: `${who} bounced to ${pathOf(o.urlAfter)}: the member is sent away from where they were going` };
    }
    if (o.overlay) {
      return { status: DEAD_END, evidence: `${who} led to ${pathOf(o.urlAfter)} where the framework showed an error overlay: "${clip(o.overlay, 100)}"` };
    }
    const text = norm(o.landingText);
    if (text.length < REAL_TEXT_MIN) {
      return { status: DEAD_END, evidence: `${who} led to ${pathOf(o.urlAfter)} (HTTP ${doc ?? 'client-side'}) which rendered ${text.length} characters of text: blank` };
    }
    const marker = ERROR_MARKERS.find(m => text.toLowerCase().includes(m.toLowerCase()));
    if (marker) {
      return { status: DEAD_END, evidence: `${who} led to ${pathOf(o.urlAfter)} which rendered an error page ("${marker}")` };
    }
    return { status: PASS, evidence: `${who} led to ${pathOf(o.urlAfter)} (HTTP ${doc ?? probe ?? 'client-side'}); it reads: "${clip(text, 90)}"` };
  }

  // 9. It stayed on the page: did anything at all change?
  if (o.overlay) {
    return { status: DEAD_END, evidence: `${who} was followed by a framework error overlay: "${clip(o.overlay, 100)}"` };
  }
  const textChanged = norm(o.textBefore) !== norm(o.textAfter);
  const ariaChanged = norm(o.ariaBefore) !== norm(o.ariaAfter);
  const controlsChanged = o.controlsBefore !== o.controlsAfter;
  const okRequest = mine.find(r => r.status >= 200 && r.status < 400);
  if (o.dialogOpened || o.fileChooserOpened || textChanged || ariaChanged || controlsChanged || okRequest) {
    const bits = [];
    if (o.dialogOpened) bits.push('a dialog opened');
    if (o.fileChooserOpened) bits.push('the browser’s file chooser opened');
    if (textChanged) bits.push(`the screen now reads "${firstAdded(o.textBefore, o.textAfter)}"`);
    if (ariaChanged) bits.push(`its state changed (${clip(o.ariaBefore, 40)} -> ${clip(o.ariaAfter, 40)})`);
    if (controlsChanged) bits.push(`controls on screen ${o.controlsBefore} -> ${o.controlsAfter}`);
    if (okRequest) bits.push(`${okRequest.method} ${clip(okRequest.url, 60)} answered HTTP ${okRequest.status}`);
    return { status: PASS, evidence: `${who}: ${bits.join('; ')}` };
  }
  if (o.alreadySelected) {
    return { status: PASS, evidence: `${who} is already the current choice (its own state says it is on), so pressing it again leaves the screen as it was` };
  }
  return { status: DEAD_END, evidence: `${who}: nothing happened (no URL, text, aria state, dialog, control or network change within the observation window)` };
}

// ---------------------------------------------------------------------------------------------------------------------
// What was actually pressed. A report may say "pressed" only of a control a click was delivered to.
// ---------------------------------------------------------------------------------------------------------------------

/**
 * Why a control was NOT pressed, or null if a click was delivered to it. Only `obs.pressed === true` (set by pressAndObserve once the
 * click returned) counts. A control that was listed but found disabled, that points off the product, that could not be found again or
 * whose click was refused has not been pressed, whatever its row says; neither has one whose trial never got as far as pressing.
 */
export function notPressedReason(obs) {
  if (!obs) return 'its trial failed before any press';
  if (obs.pressed === true) return null;
  if (obs.disabled) return 'disabled, so not pressed';
  if (obs.externalHref) return 'points off the product, so not followed';
  if (obs.clickError) return obs.clickError.kind === 'not-found' ? 'could not be found again to press' : `its click was not delivered (${obs.clickError.kind})`;
  return 'no click was delivered';
}

/**
 * Count the controls that were given a row: `observations` has one entry per control that was tried (null where the trial failed
 * before an observation existed); `skippedByCap` is how many rows were left unpressed by the trial cap. pressed + notPressed = total.
 */
export function tallyPresses(observations, skippedByCap = 0) {
  const byReason = {};
  let pressed = 0; let notPressed = 0;
  for (const o of observations) {
    const why = notPressedReason(o);
    if (why === null) { pressed += 1; continue; }
    byReason[why] = (byReason[why] || 0) + 1; notPressed += 1;
  }
  if (skippedByCap > 0) { byReason['not reached: the trial cap was hit'] = skippedByCap; notPressed += skippedByCap; }
  const reasons = Object.entries(byReason).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([r, n]) => `${n} ${r}`).join('; ');
  return { total: pressed + notPressed, pressed, notPressed, byReason, reasons };
}

/** The sentence a report may print about the tally. It says "each ... was pressed" only when that is true. */
export function describeTally(t, { maxDepth, outcomes }) {
  const o = outcomes ? `: ${outcomes.PASS} PASS, ${outcomes['DEAD END']} DEAD END, ${outcomes['NOT RUN']} NOT RUN (a NOT RUN row says why it could not be decided)` : '';
  if (t.notPressed === 0) return `${t.total} controls found (depth ≤ ${maxDepth}); each of the ${t.total} was pressed, by a new member${o}`;
  return `${t.total} controls found (depth ≤ ${maxDepth}); ${t.pressed} were pressed by a new member and ${t.notPressed} were NOT pressed (${t.reasons}); each has its own row${o}`;
}

/**
 * Distinct controls (by kind, label and link, not by position) that a press revealed and that never got a row of their own:
 * found by the walk and then left alone (the depth limit, or a view change that is not a menu). `rowKeys` are the base keys of the controls that have a row.
 */
export const baseKey = (key) => String(key ?? '').replace(/#\d+$/, '');
export function unrowedControls(revealedControls, rowKeys) {
  const seen = new Map();
  for (const c of revealedControls) {
    const k = baseKey(c.key);
    if (!rowKeys.has(k) && !seen.has(k)) seen.set(k, c);
  }
  return [...seen.values()];
}
