/**
 * Tests for the pure part of the browser glue: what counts as "the page changed" when waiting for it to be still.
 * (The rest of trial.mjs needs a browser: see fixture-check.mjs.)
 * Run: node --test tests/e2e/journey-ledger/lib/*.test.mjs
 *
 * Why the address is part of the key: a press that starts a Work and then navigates (Just let me write -> POST, POST, GET,
 * router.push) shows its next controls BEFORE the address changes. A wait that only watched text and control count thought
 * the page was still while the navigation was on its way, and the next press was credited with it (row P1-05.09.01).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as Trial from './trial.mjs';
import { statedReason } from './classify.mjs';

const sig = (o = {}) => ({ url: 'http://localhost:3000/writers-studio', text: 'Where would you like to begin? Home Write Develop', controls: 12, aria: 'Home:page', ...o });

test('settleKey: the same screen has the same key', () => {
  assert.equal(typeof Trial.settleKey, 'function', 'trial.mjs exports settleKey, the one function that decides what "changed" means while waiting');
  assert.equal(Trial.settleKey(sig()), Trial.settleKey(sig()));
});

test('settleKey: a change of ADDRESS alone is a change (the late navigation of the earlier press)', () => {
  assert.notEqual(Trial.settleKey(sig()), Trial.settleKey(sig({ url: 'http://localhost:3000/writers-studio?mode=write&m=39cefb93' })));
});

test('settleKey: a change of text, of control count, or of aria state is a change', () => {
  const k = Trial.settleKey(sig());
  assert.notEqual(k, Trial.settleKey(sig({ text: 'Something else' })));
  assert.notEqual(k, Trial.settleKey(sig({ controls: 13 })));
  assert.notEqual(k, Trial.settleKey(sig({ aria: 'Home:false' })));
});

// A defeat candidate: the key the harness had before (text, control count and aria only). It must NOT satisfy the test above.
const oldKey = (s) => `${s.text.length}|${s.text.slice(0, 200)}|${s.controls}|${s.aria}`;
test('defeat candidate is caught: a key that ignores the address cannot tell the page before the navigation from the page after it', () => {
  const before = sig(); const after = sig({ url: 'http://localhost:3000/writers-studio?mode=write&m=39cefb93' });
  assert.equal(oldKey(before), oldKey(after), 'precondition: the old key really is blind to the address');
  assert.notEqual(Trial.settleKey(before), Trial.settleKey(after), 'the conforming key is not');
});

test('PRESS_QUIET_MS and PRESS_STILL_CAP_MS are named, not buried', () => {
  assert.ok(Trial.PRESS_QUIET_MS >= 500, 'long enough for a client-side router.push that follows a response');
  assert.ok(Trial.PRESS_STILL_CAP_MS >= Trial.PRESS_QUIET_MS * 4);
});

// ---- F8: what the in-page enumerator hands over about a disabled control's own name (the browser-level check is fixture-check.mjs F8f-h) ----
// ENUMERATE runs inside the page, so it cannot call anything imported; it is run here against a stub of the few DOM members it reads.
const LONG = 'Save everything you have written so far into your private working copy of this book, today';
assert.ok(LONG.length > 80, 'LONG must be longer than the 80 characters a label is shown at');

/** A stub element: only what ENUMERATE reads. `text` is both innerText and textContent (no markup inside). */
function stubControl({ tag = 'button', attrs = {}, text = '', value, disabled = false } = {}) {
  const el = {
    tagName: tag.toUpperCase(), innerText: text, textContent: text, value, disabled, className: '', hrefSet: false,
    getAttribute: (n) => (n in attrs ? attrs[n] : null),
    hasAttribute: (n) => n in attrs,
    setAttribute: (n, v) => { attrs[n] = v; },
    closest: () => null,
    checkVisibility: () => true,
    getBoundingClientRect: () => ({ width: 40, height: 20 }),
  };
  return el;
}
/** Run the real in-page enumerator over the given stub controls and return what it reports. */
function enumerate(controls) {
  const saved = globalThis.document;
  globalThis.document = { querySelectorAll: (sel) => (/^a\[href\]/.test(sel) ? controls : []), getElementById: () => null, body: {} };
  try { return Trial.ENUMERATE().controls; } finally { if (saved === undefined) delete globalThis.document; else globalThis.document = saved; }
}
/** What pressAndObserve hands to classify.mjs for a control it found disabled (trial.mjs: label, ownNames: control.names, the reasons). */
const asClassified = (c) => ({ label: c.label, ownNames: c.names, disabledReason: c.disabledReason, disabledReasons: c.disabledReasons });

test('ENUMERATE: the label is still shown clipped to 80 characters (display only)', () => {
  const [c] = enumerate([stubControl({ text: LONG, disabled: true, attrs: { title: LONG } })]);
  assert.equal(c.label.length, 80);
  assert.equal(c.label, LONG.slice(0, 80));
});

test('ENUMERATE -> statedReason: a title that repeats a name longer than 80 characters does not say why (F8f)', () => {
  const [c] = enumerate([stubControl({ text: LONG, disabled: true, attrs: { title: LONG } })]);
  assert.equal(c.disabledReasons[0], LONG, 'precondition: the explanation candidate is the whole title');
  assert.equal(statedReason(asClassified(c)), '', 'a repeat of the control\u2019s own name explains nothing, however long the name is');
});

test('ENUMERATE -> statedReason: ...nor when the title is the control\u2019s only name (an icon button), the label being that title clipped (F8g)', () => {
  const [c] = enumerate([stubControl({ text: '', disabled: true, attrs: { title: LONG } })]);
  assert.equal(c.label, LONG.slice(0, 80), 'precondition: with no other name the label is the title, clipped');
  assert.equal(statedReason(asClassified(c)), '');
});

test('ENUMERATE -> statedReason: ...nor when the long name is an aria-label and the title repeats it', () => {
  const [c] = enumerate([stubControl({ text: 'Save', disabled: true, attrs: { 'aria-label': LONG, title: LONG } })]);
  assert.equal(statedReason(asClassified(c)), '');
});

test('ENUMERATE -> statedReason: a title that continues a long name with an actual explanation still says why (the repair must not silence real explanations)', () => {
  const why = `${LONG}, once you have written a sentence`;
  const [c] = enumerate([stubControl({ text: LONG, disabled: true, attrs: { title: why } })]);
  assert.equal(statedReason(asClassified(c)), why);
});

test('ENUMERATE -> statedReason: short names behave as before (a repeat is no reason, a different title is)', () => {
  const [a, b] = enumerate([
    stubControl({ text: 'Save', disabled: true, attrs: { title: 'Save' } }),
    stubControl({ text: 'Save', disabled: true, attrs: { title: 'Write a sentence first' } }),
  ]);
  assert.equal(statedReason(asClassified(a)), '');
  assert.equal(statedReason(asClassified(b)), 'Write a sentence first');
});

// The wrong enumerators behind F8f/F8g, run through the same checks: each must be caught by at least one test above.
test('defeat candidate is caught: names clipped to the 80 characters shown before they are compared', () => {
  const [c] = enumerate([stubControl({ text: LONG, disabled: true, attrs: { title: LONG } })]);
  const clipped = { ...c, label: c.label.slice(0, 80), names: c.names.map(n => n.slice(0, 80)) };
  assert.notEqual(statedReason(asClassified(clipped)), '', 'precondition: the clipped names make the repeat look like an explanation');
  assert.equal(statedReason(asClassified(c)), '', 'the conforming enumerator does not');
});
