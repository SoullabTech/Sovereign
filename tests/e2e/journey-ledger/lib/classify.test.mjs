/**
 * Tests for the control-outcome classifier: given what a browser OBSERVED after a control was pressed, does it
 * lead somewhere (PASS), lead nowhere (DEAD END), or can it not be decided (NOT RUN)?
 * Run: node --test tests/e2e/journey-ledger/lib/*.test.mjs
 *
 * The classifier must judge RENDERED content, never only an HTTP status: a 200 with a blank page is a dead end,
 * and a Next "This page could not be found" page that rendered text is still a dead end.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { PASS, DEAD_END, NOT_RUN } from './ledger.mjs';
import { classifyTrial as conforming, REAL_TEXT_MIN, ERROR_MARKERS } from './classify.mjs';
import * as Classify from './classify.mjs';

const REAL = 'Where would you like to begin? Your words first. Structure stays yours. Bring a manuscript you already have.';
const LONG = 'Save everything you have written so far into your private working copy of this book, today';
assert.ok(LONG.length > 80, 'LONG must be longer than the 80 characters a label is shown at');
const base = (o = {}) => ({
  label: 'A control', kind: 'button', href: null, disabled: false,
  clickError: null,
  urlBefore: 'http://localhost:3000/writers-studio', urlAfter: 'http://localhost:3000/writers-studio',
  origin: 'http://localhost:3000',
  document: null, linkProbe: null, popup: null,
  landingText: '', textBefore: 'Home page text that was here before', textAfter: 'Home page text that was here before',
  ariaBefore: '', ariaAfter: '', controlsBefore: 4, controlsAfter: 4,
  requests: [], modelCalls: 0, dialogOpened: false, overlay: null,
  ...o,
});

const CASES = [
  ['a link to a page that renders real text is PASS',
    base({ kind: 'link', href: '/writers-studio/plans', urlAfter: 'http://localhost:3000/writers-studio/plans', document: { status: 200 }, linkProbe: { status: 200 }, landingText: REAL }), PASS],
  ['a link whose page answers 404 is a DEAD END even though the 404 page has text',
    base({ kind: 'link', href: '/writers-studio/plans', urlAfter: 'http://localhost:3000/writers-studio/plans', document: { status: 404 }, linkProbe: { status: 404 }, landingText: '404 This page could not be found. Go home.' }), DEAD_END],
  ['a link probed as 404 is a DEAD END even when client navigation rendered something',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', linkProbe: { status: 404 }, landingText: REAL }), DEAD_END],
  ['a 500 is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 500 }, landingText: REAL }), DEAD_END],
  ['HTTP 200 with a blank page is a DEAD END (status alone is never enough)',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 200 }, linkProbe: { status: 200 }, landingText: '   ' }), DEAD_END],
  ['HTTP 200 with a few words only is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 200 }, landingText: 'Loading' }), DEAD_END],
  ['HTTP 200 whose rendered text is the framework not-found page is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 200 }, landingText: '404 | This page could not be found. ' + REAL }), DEAD_END],
  ['an application error page is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 200 }, landingText: 'Application error: a client-side exception has occurred while loading localhost. ' + REAL }), DEAD_END],
  ['a framework error overlay is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/x', document: { status: 200 }, landingText: REAL, overlay: 'Unhandled Runtime Error TypeError: x is undefined' }), DEAD_END],
  ['being bounced to sign-in is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/signin?next=%2Fx', document: { status: 200 }, landingText: REAL }), DEAD_END],
  ['being bounced to the invitation-required page is a DEAD END',
    base({ kind: 'link', href: '/x', urlAfter: 'http://localhost:3000/invitation-required', document: { status: 200 }, landingText: REAL }), DEAD_END],
  ['a button that does nothing at all (no URL, text, aria, network, dialog) is a DEAD END',
    base({ label: 'Write' }), DEAD_END],
  ['a button that changes the visible text is PASS',
    base({ textAfter: 'Home page text that was here before. Preferences: Layout, Theme' }), PASS],
  ['a button that only flips an aria state (a toggle) is PASS',
    base({ ariaBefore: 'Ordinary:true|Sanctuary:false', ariaAfter: 'Ordinary:false|Sanctuary:true' }), PASS],
  ['a button that opens a dialog is PASS',
    base({ dialogOpened: true }), PASS],
  ['a button that reveals new controls is PASS',
    base({ controlsAfter: 9 }), PASS],
  ['a button that sends a request that succeeds is PASS',
    base({ clickMs: 30, requests: [{ method: 'POST', url: '/api/sovereign/living-works', status: 201, startOffsetMs: 40 }] }), PASS],
  ['a button whose request fails (4xx) is a DEAD END even if the screen also changed',
    base({ clickMs: 30, textAfter: 'Something went wrong', requests: [{ method: 'POST', url: '/api/sovereign/living-works', status: 403, startOffsetMs: 40 }] }), DEAD_END],
  ['a button whose request fails (5xx) is a DEAD END',
    base({ clickMs: 30, requests: [{ method: 'POST', url: '/api/x', status: 500, startOffsetMs: 40 }] }), DEAD_END],
  ['a control that needs a model call is NOT RUN, never PASS (slice 1 has no MAIA step)',
    base({ modelCalls: 1, textAfter: 'I couldn’t answer just now. Nothing was kept.', requests: [{ method: 'POST', url: '/api/sovereign/maia', status: 200, startOffsetMs: 40 }] }), NOT_RUN],
  ['a click the browser could not perform because something else was on top is a DEAD END (a person could not press it either)',
    base({ clickError: { kind: 'intercepted-by-page', message: 'div.modal intercepts pointer events' } }), DEAD_END],
  ['a click intercepted by the framework dev overlay cannot be decided: NOT RUN',
    base({ clickError: { kind: 'intercepted-by-dev-overlay', message: 'nextjs-portal intercepts pointer events' } }), NOT_RUN],
  ['a control that could not be found again is NOT RUN',
    base({ clickError: { kind: 'not-found', message: 'no such control' } }), NOT_RUN],
  ['a click that timed out for the harness is NOT RUN',
    base({ clickError: { kind: 'timeout', message: 'timeout' } }), NOT_RUN],
  ['an external link is NOT RUN (not followed off the product)',
    base({ kind: 'link', href: 'https://example.org/x', externalHref: 'https://example.org/x' }), NOT_RUN],
  ['a mailto link is NOT RUN (a handler outside the browser page)',
    base({ kind: 'link', href: 'mailto:hello@example.org', externalHref: 'mailto:hello@example.org' }), NOT_RUN],
  ['a disabled control with no stated reason is NOT RUN: the harness cannot tell whether it leads anywhere, and "disabled until you choose" is not a defect',
    base({ disabled: true, disabledReason: '' }), NOT_RUN],
  // ---- F8: a disabled control "says why" only if the explanation says something the control's own name does not ----
  ['a disabled control whose title merely repeats its own label does not say why: NOT RUN (the old rule called any non-empty title a reason)',
    base({ label: 'Save', disabled: true, disabledReason: 'Save' }), NOT_RUN],
  ['...whatever the case or spacing of the repeat',
    base({ label: 'Save draft', disabled: true, disabledReason: '  save   DRAFT ' }), NOT_RUN],
  ['an icon button whose label IS its title (nothing else names it) does not say why',
    base({ label: 'Archive', disabled: true, disabledReason: 'Archive', ownNames: [] }), NOT_RUN],
  ['a title that repeats the visible text does not say why, even when an aria-label (the label) says something longer',
    base({ label: 'Save the draft', ownNames: ['Save the draft', 'Save'], disabled: true, disabledReason: 'Save' }), NOT_RUN],
  ['a title that repeats the aria-label does not say why, even when the visible text differs',
    base({ label: 'Save the draft', ownNames: ['Save the draft', 'Save'], disabled: true, disabledReason: 'save THE draft' }), NOT_RUN],
  ['when the first explanatory text only repeats the label, a later one that really explains is used: PASS',
    base({ label: 'Save', disabled: true, disabledReason: 'Save', disabledReasons: ['Save', 'Write something first'] }), PASS],
  ['when every explanatory text only repeats the name, it does not say why: NOT RUN',
    base({ label: 'Save', ownNames: ['Save'], disabled: true, disabledReason: 'Save', disabledReasons: ['Save', 'save'] }), NOT_RUN],
  ['a title that differs from the label says why: PASS',
    base({ label: 'Save', ownNames: ['Save'], disabled: true, disabledReason: 'Write something first', disabledReasons: ['Write something first'] }), PASS],
  ['a title that contains the label but says more is an explanation: PASS',
    base({ label: 'Save', ownNames: ['Save'], disabled: true, disabledReason: 'Save is available once you have written something', disabledReasons: ['Save is available once you have written something'] }), PASS],
  ['a control with no explanatory text at all is still NOT RUN',
    base({ label: 'Save', ownNames: ['Save'], disabled: true, disabledReason: '', disabledReasons: [] }), NOT_RUN],
  // A name longer than the 80 characters a label is shown at: `label` is that clipped display, `ownNames` carries the whole name, and the
  // explanation is compared with the whole name (trial.mjs hands it over whole; see trial.test.mjs). Clipping before comparing made a repeat look different.
  ['a title that repeats a name longer than 80 characters does not say why: NOT RUN',
    base({ label: LONG.slice(0, 80), ownNames: [LONG], disabled: true, disabledReason: LONG, disabledReasons: [LONG] }), NOT_RUN],
  ['...when the title is the only name (no visible text, no aria-label), carried whole in ownNames',
    base({ label: LONG.slice(0, 80), ownNames: [LONG], disabled: true, disabledReason: LONG.toUpperCase(), disabledReasons: [`  ${LONG}  `] }), NOT_RUN],
  ['a title that continues a long name with an actual explanation says why: PASS',
    base({ label: LONG.slice(0, 80), ownNames: [LONG], disabled: true, disabledReason: `${LONG}, once you have written a sentence`, disabledReasons: [`${LONG}, once you have written a sentence`] }), PASS],

  ['a control that opens the browser’s own file chooser is PASS (a native dialog changes no DOM)',
    base({ label: 'Choose file', fileChooserOpened: true }), PASS],
  ['a request still in flight when the window closed cannot be decided: NOT RUN, even though the screen changed ("MAIA is listening…")',
    base({ textAfter: 'MAIA is listening…', pendingRequests: 1 }), NOT_RUN],
  ['a disabled control that states why is PASS',
    base({ disabled: true, disabledReason: 'Write something first' }), PASS],
  ['pressing the choice that is already selected (aria-pressed true) and nothing changing is PASS: re-pressing the current choice is a no-op by definition',
    base({ label: 'Ordinary', alreadySelected: true }), PASS],
  ['an unselected toggle that does nothing is still a DEAD END',
    base({ label: 'Sanctuary', alreadySelected: false }), DEAD_END],
  ['a same-page anchor to an id that is not on the page is a DEAD END',
    base({ kind: 'link', href: '#missing', hashTargetExists: false }), DEAD_END],
  ['a same-page anchor to an id that exists is PASS',
    base({ kind: 'link', href: '#present', hashTargetExists: true, urlAfter: 'http://localhost:3000/writers-studio#present' }), PASS],

  // ---- F2: a request is credited to the press only if the press STARTED it ----
  ['an inert button is a DEAD END even though the page answered a request of its own that STARTED BEFORE the press (the import room’s own fetch landing late on a cold route)',
    base({ label: 'Write', clickMs: 30, requests: [{ method: 'GET', url: '/api/sovereign/manuscripts/unfinished-uploads', status: 200, startOffsetMs: -1800 }] }), DEAD_END],
  ['an inert button is a DEAD END when an unrelated request began long after the press (a page beacon at +900 ms)',
    base({ label: 'Develop', clickMs: 30, requests: [{ method: 'GET', url: '/api/members/me', status: 200, startOffsetMs: 900 }] }), DEAD_END],
  ['a request whose start time is unknown cannot be credited to the press: an inert button stays a DEAD END',
    base({ label: 'Write', clickMs: 30, requests: [{ method: 'GET', url: '/api/x', status: 200 }] }), DEAD_END],
  ['a request that began while a slow click was still being delivered is the press’s: PASS',
    base({ label: 'Save', clickMs: 400, requests: [{ method: 'POST', url: '/api/save', status: 200, startOffsetMs: 600 }] }), PASS],
  ['a request that began later than the click plus the attribution window is not the press’s: DEAD END',
    base({ label: 'Save', clickMs: 400, requests: [{ method: 'POST', url: '/api/save', status: 200, startOffsetMs: 1200 }] }), DEAD_END],
  ['a page request that FAILED but started before the press is not blamed on a press that did something',
    base({ clickMs: 30, textAfter: 'Home page text that was here before. Preferences: Layout, Theme', requests: [{ method: 'GET', url: '/api/poll', status: 500, startOffsetMs: -200 }] }), PASS],

  // ---- F1: a change that lands after a press made on a page that was still moving is not the press's ----
  ['Home pressed while the Work-creation requests were still in flight: the address that changes afterwards is the earlier press’s landing, so NOT RUN, never PASS',
    base({ label: 'Home', unsettledAtPress: '1 request(s) still in flight', urlBefore: 'http://localhost:3000/writers-studio', urlAfter: 'http://localhost:3000/writers-studio?mode=write&m=39cefb93-0000', landingText: REAL }), NOT_RUN],
  ['a press made while the page was still changing that then changes the text cannot be attributed: NOT RUN',
    base({ unsettledAtPress: 'the page had not been still', textAfter: 'Home page text that was here before. Something else arrived' }), NOT_RUN],
  ['a press made on a moving page that then shows nothing is NOT RUN too (the page may simply have been busy), never a DEAD END the harness cannot stand behind',
    base({ unsettledAtPress: '1 request(s) still in flight' }), NOT_RUN],
  ['a dead link is still a dead link whatever the page was doing when it was pressed',
    base({ kind: 'link', href: '/x', unsettledAtPress: '1 request(s) still in flight', urlAfter: 'http://localhost:3000/x', linkProbe: { status: 404 }, landingText: REAL }), DEAD_END],
  ['a request the press caused that failed is still a DEAD END on a page that was moving',
    base({ clickMs: 30, unsettledAtPress: '1 request(s) still in flight', requests: [{ method: 'POST', url: '/api/x', status: 500, startOffsetMs: 40 }] }), DEAD_END],
];


for (const [name, obs, want] of CASES) {
  test(`conforming: ${name}`, () => {
    const out = conforming(obs);
    assert.equal(out.status, want, `evidence was: ${out.evidence}`);
    assert.ok(typeof out.evidence === 'string' && out.evidence.trim().length > 0, 'every outcome carries evidence');
  });
}

test('PASS evidence quotes what was rendered, so a reader can see it was not just a status', () => {
  const out = conforming(CASES[0][1]);
  assert.match(out.evidence, /Where would you like to begin/);
  assert.match(out.evidence, /200/);
});

test('the framework markers and the minimum text length are named, not buried', () => {
  assert.ok(REAL_TEXT_MIN >= 20);
  assert.ok(ERROR_MARKERS.some(m => /could not be found/i.test(m)));
});

test('attribution: only a request that STARTED after the press began, within the attribution window of its end, is the press’s', () => {
  const caused = Classify.isCausedByPress;
  assert.equal(typeof caused, 'function', 'classify.mjs exports isCausedByPress (the one rule trial.mjs and the classifier share)');
  assert.ok(Classify.ATTRIBUTION_MS > 0 && Classify.ATTRIBUTION_MS < 600, 'a few hundred ms: a page beacon at +600 ms is not the press’s');
  assert.equal(caused({ startOffsetMs: 0 }, 0), true);
  assert.equal(caused({ startOffsetMs: Classify.ATTRIBUTION_MS }, 0), true);
  assert.equal(caused({ startOffsetMs: Classify.ATTRIBUTION_MS + 1 }, 0), false, 'beyond the window');
  assert.equal(caused({ startOffsetMs: 250 }, 400), true, 'a slow click is allowed for');
  assert.equal(caused({ startOffsetMs: -1 }, 400), false, 'started before the press');
  assert.equal(caused({ startOffsetMs: null }, 400), false, 'start unknown (the harness was not yet watching): never credited');
  assert.equal(caused({}, 400), false, 'no start time recorded: never credited');
  assert.equal(caused({ startOffsetMs: 'soon' }, 400), false);
});

test('a request that was discounted is named in the evidence of the DEAD END, so a reader can see what was set aside', () => {
  const out = conforming(base({ label: 'Write', clickMs: 30, requests: [{ method: 'GET', url: '/api/sovereign/manuscripts/unfinished-uploads', status: 200, startOffsetMs: -1800 }] }));
  assert.equal(out.status, DEAD_END);
  assert.match(out.evidence, /not started by the press/);
  assert.match(out.evidence, /unfinished-uploads/);
});

test('a press made on a page that was still moving says so, and says what it could not attribute', () => {
  const out = conforming(base({ label: 'Home', unsettledAtPress: '1 request(s) still in flight', urlAfter: 'http://localhost:3000/writers-studio?mode=write&m=abc', landingText: REAL }));
  assert.equal(out.status, NOT_RUN);
  assert.match(out.evidence, /still moving/);
  assert.match(out.evidence, /1 request\(s\) still in flight/);
});

// ---- defeat candidates: plausible WRONG classifiers. Every one must disagree with the table on at least one case. ----
const statusOnly = (o) => {
  const st = o.document?.status ?? o.linkProbe?.status;
  if (st != null) return { status: st >= 400 ? DEAD_END : PASS, evidence: 'status ' + st };
  return { status: PASS, evidence: 'no status' };
};
const noChangeIsFine = (o) => {
  const r = conforming(o);
  return r.status === DEAD_END && /nothing|no URL/i.test(r.evidence) ? { status: PASS, evidence: 'treated as fine' } : r;
};
const modelCountsAsPass = (o) => conforming({ ...o, modelCalls: 0 });
const interceptIsNotRun = (o) => (o.clickError?.kind === 'intercepted-by-page' ? { status: NOT_RUN, evidence: 'x' } : conforming(o));
const textOnly = (o) => {
  if (o.kind === 'link' && !o.externalHref && o.href && !String(o.href).startsWith('#')) {
    return { status: (o.landingText || '').trim().length >= REAL_TEXT_MIN ? PASS : DEAD_END, evidence: 'text only' };
  }
  return conforming(o);
};
const selectedIsAlwaysFine = (o) => (o.kind === 'button' && !o.href && !o.clickError && !o.externalHref && !o.disabled ? { status: PASS, evidence: 'any button passes' } : conforming(o));
const disabledIsDeadEnd = (o) => (o.disabled && !String(o.disabledReason || '').trim() && !o.clickError && !o.externalHref && !(o.modelCalls > 0) ? { status: DEAD_END, evidence: 'disabled' } : conforming(o));
const ignoresPending = (o) => conforming({ ...o, pendingRequests: 0 });
// F8 wrong rules: any non-empty explanatory text is a reason (the rule before); a repeat is only caught when it is byte-identical (DC-Q, below); only the label is compared (the visible text and aria-label are not).
const anyTextIsAReason = (o) => conforming({ ...o, label: '\u0000never-a-label', ownNames: [] });
const onlyTheLabelIsCompared = (o) => conforming({ ...o, ownNames: [] });
// ...and the wrong rule behind F8f: the names are compared as shown (clipped to 80 characters), so a repeat of a longer name looks like a different text.
const comparesOnlyWhatIsShown = (o) => conforming({ ...o, label: String(o.label ?? '').slice(0, 80), ownNames: (o.ownNames || []).map(n => String(n).slice(0, 80)) });
const ignoresFileChooser = (o) => conforming({ ...o, fileChooserOpened: false });
const ignoresUnsettled = (o) => conforming({ ...o, unsettledAtPress: null });
// F2 wrong rules: credit every request in the window; credit one that started before the press; credit one whose start is unknown; no window.
const creditsEveryRequest = (o) => conforming({ ...o, requests: (o.requests || []).map(r => ({ ...r, startOffsetMs: 0 })) });
const creditsRequestsFromBeforeThePress = (o) => conforming({ ...o, requests: (o.requests || []).map(r => (typeof r.startOffsetMs === 'number' && r.startOffsetMs < 0 ? { ...r, startOffsetMs: 0 } : r)) });
const creditsRequestsOfUnknownStart = (o) => conforming({ ...o, requests: (o.requests || []).map(r => (typeof r.startOffsetMs !== 'number' ? { ...r, startOffsetMs: 0 } : r)) });
const noAttributionWindow = (o) => conforming({ ...o, requests: (o.requests || []).map(r => (typeof r.startOffsetMs === 'number' && r.startOffsetMs > 0 ? { ...r, startOffsetMs: 0 } : r)) });
const unsettledOnlyCoversNavigation = (o) => (o.unsettledAtPress && !(o.urlAfter !== o.urlBefore) ? conforming({ ...o, unsettledAtPress: null }) : conforming(o));
const CANDIDATES = {
  'DC-P a disabled control whose title repeats its own label is said to "say why" (any non-empty explanatory text counts)': anyTextIsAReason,
  'DC-Q the repeat is only recognised when it matches the label exactly (case and spacing are not normalised)': (o) => {
    const norm1 = (x) => String(x ?? '');
    const repeats = (o.disabled && norm1(o.disabledReason) && norm1(o.disabledReason) === norm1(o.label)) || (o.disabledReasons || []).some(r => norm1(r) === norm1(o.label));
    return conforming({ ...o, label: repeats ? o.label : '\u0000never-a-label', ownNames: [] });
  },
  'DC-R only the control\u2019s label is compared with the explanation (its visible text and aria-label, when they differ, are ignored)': onlyTheLabelIsCompared,
  'DC-S the names are compared as shown, clipped to 80 characters (a title repeating a longer name is said to "say why")': comparesOnlyWhatIsShown,
  'DC-J a press on a page that was still moving is credited with whatever changed afterwards (the Home press credited with the earlier Just-let-me-write landing)': ignoresUnsettled,
  'DC-K every same-origin request in the window is credited to the press (an inert button passes on the page’s own fetch)': creditsEveryRequest,
  'DC-L a request that started BEFORE the press is credited to it (a late answer to the page’s own request)': creditsRequestsFromBeforeThePress,
  'DC-M a request whose start time is unknown is credited to the press': creditsRequestsOfUnknownStart,
  'DC-N a request that began long after the press (a page beacon) is credited to it': noAttributionWindow,
  'DC-O a moving page only voids a press that changed the address (a text change on a moving page is still credited)': unsettledOnlyCoversNavigation,
  'DC-G a disabled control is called a DEAD END (asserts a defect nobody saw)': disabledIsDeadEnd,
  'DC-H a request still in flight is ignored (an in-progress screen scored as the page working)': ignoresPending,
  'DC-I a native file chooser is not seen (a working button scored as inert)': ignoresFileChooser,
  'DC-F every inert button is excused as "already selected"': selectedIsAlwaysFine,
  'DC-A status-only: 200 means it works': statusOnly,
  'DC-B inert counts as fine': noChangeIsFine,
  'DC-C a model call is scored as the page working': modelCountsAsPass,
  'DC-D a click the page itself blocked is scored NOT RUN (hides a real dead end)': interceptIsNotRun,
  'DC-E text-only: a 404 page that has words passes': textOnly,
};
for (const [name, wrong] of Object.entries(CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    const disagreements = CASES.filter(([, obs, want]) => wrong(obs).status !== want);
    assert.ok(disagreements.length > 0, 'no case in the table distinguishes this wrong classifier from the right one');
  });
}

// ---- F6: the report may say "pressed" only of a control a click was delivered to ----
// The run of record printed "Controls pressed: 95" for the number of controls TRIED. A control that was listed and found disabled, that
// points off the product, that could not be found again, whose click was refused, or whose trial crashed was tried and never pressed.
const P = (extra = {}) => ({ label: 'x', kind: 'button', pressed: true, clickError: null, ...extra });
const MIXED = [
  P(), P(), P(),                                                   // 3 pressed
  P({ pressed: false, disabled: true }), P({ pressed: false, disabled: true }),   // 2 disabled
  P({ pressed: false, externalHref: 'https://example.org' }),      // 1 off the product
  P({ pressed: false, clickError: { kind: 'not-found', message: 'gone' } }),     // 1 not found again
  P({ pressed: false, clickError: { kind: 'intercepted-by-page', message: 'covered' } }),   // 1 click refused
  null,                                                            // 1 trial crashed before an observation existed
];
test('tally: only a control a click was delivered to is counted as pressed', () => {
  const t = Classify.tallyPresses(MIXED, 2);
  assert.equal(t.pressed, 3);
  assert.equal(t.notPressed, 6 + 2, '2 disabled + 1 external + 1 not found + 1 refused + 1 crashed + 2 left by the cap');
  assert.equal(t.total, MIXED.length + 2, 'pressed + not pressed is every control that has a row');
  assert.equal(t.pressed + t.notPressed, t.total);
  assert.match(t.reasons, /2 disabled/);
  assert.match(t.reasons, /1 points off the product/);
  assert.match(t.reasons, /2 not reached: the trial cap was hit/);
  assert.match(t.reasons, /1 its trial failed before any press/);
});
test('tally: an observation from before the press flag existed is not pressed (never defaulted to pressed)', () => {
  const t = Classify.tallyPresses([{ label: 'x', kind: 'button' }]);
  assert.equal(t.pressed, 0);
  assert.equal(t.notPressed, 1);
});
test('tally: when nothing was skipped the sentence may say each was pressed, and only then', () => {
  const all = Classify.tallyPresses([P(), P()]);
  const some = Classify.tallyPresses([P(), P({ pressed: false, disabled: true })]);
  const out = { PASS: 1, 'DEAD END': 1, 'NOT RUN': 0 };
  assert.match(Classify.describeTally(all, { maxDepth: 4, outcomes: out }), /each of the 2 was pressed/);
  const text = Classify.describeTally(some, { maxDepth: 4, outcomes: out });
  assert.doesNotMatch(text, /each of the \d+ was pressed|every control .* pressed/i, 'a report must not say each was pressed when one was not');
  assert.match(text, /1 were pressed/);
  assert.match(text, /1 were NOT pressed \(1 disabled, so not pressed\)/);
  assert.match(text, /depth ≤ 4/);
});
test('unrowed: a control a press revealed and nothing ever gave a row is named once, by kind/label/link, not by position', () => {
  const rows = new Set([Classify.baseKey('button||Write|#1'), Classify.baseKey('link||Home|/writers-studio#2')]);
  const revealed = [
    { key: 'button||Write|#3', label: 'Write' },                 // has a row (position differs)
    { key: 'link||Home|/writers-studio#1', label: 'Home' },       // has a row
    { key: 'button||Archive|#1', label: 'Archive' },              // never given a row
    { key: 'button||Archive|#2', label: 'Archive' },              // the same control seen again
    { key: 'button||Share|#1', label: 'Share' },
  ];
  assert.deepEqual(Classify.unrowedControls(revealed, rows).map(c => c.label), ['Archive', 'Share']);
  assert.deepEqual(Classify.unrowedControls([], rows), []);
});

// Wrong tallies: each must disagree with the table above.
const TALLY_CANDIDATES = {
  'DC-S every control tried is counted as pressed (the run of record: "Controls pressed: 95")': (obs, cap) => ({ pressed: obs.length, notPressed: cap }),
  'DC-T a click that was REFUSED counts as pressed (the click was attempted)': (obs, cap) => ({ pressed: obs.filter(o => o && (o.pressed === true || o.clickError)).length, notPressed: cap }),
  'DC-U a control with an observation counts as pressed (a disabled or off-product control has one too)': (obs, cap) => ({ pressed: obs.filter(Boolean).length, notPressed: cap }),
  'DC-V the trial cap is forgotten (controls the walk never reached are not in the count)': (obs) => { const t = Classify.tallyPresses(obs, 0); return { pressed: t.pressed, notPressed: t.notPressed }; },
};
for (const [name, wrong] of Object.entries(TALLY_CANDIDATES)) {
  test(`defeat candidate is caught: ${name}`, () => {
    const right = Classify.tallyPresses(MIXED, 2);
    const w = wrong(MIXED, 2);
    assert.ok(w.pressed !== right.pressed || w.notPressed !== right.notPressed, 'the table does not distinguish this wrong tally from the right one');
  });
}
