import * as fs from 'fs';
import * as path from 'path';
import {
  IDLE, askReadiness, askReducer, askRequestBody, isReady, readinessLine, sawLine,
  type AskPhase,
} from '../field/focusAskAct';
import { resolveFocusSet, withActive, type FocusSet } from '../field/focusSet';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import type { MemberCurrency } from '@/lib/writers-studio/focusCurrency';
import type { FocusCurrencyView } from '../field/focusAskAct';

/**
 * ASK MAIA — P1–P12, predeclared by the founder BEFORE implementation, plus the
 * UX falsifier that decides whether the surface is honest.
 *
 * ⭐⭐ THE PRODUCT SENTENCE:
 *
 *   Focus membership is visible independently from what MAIA is presently
 *   allowed to read.
 *
 * ⭐ THE UX FALSIFIER:
 *
 *   A member should not need to understand "disclosure receipts", "currency
 *   state" or "act provenance" to know what MAIA can and cannot see.
 *
 * The architecture may stay sophisticated. The surface says `3 ready · 2 need
 * confirmation`, and that has to be the whole of what a writer must learn.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const panel = strip(fs.readFileSync(
  path.join(__dirname, '..', 'field', 'FocusSetPanel.tsx'), 'utf8'));
const actSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', 'field', 'focusAskAct.ts'), 'utf8'));

/**
 * ⭐⭐ MIGRATED TO SERVER CURRENCY. These obligations are unchanged; WHERE
 * readiness comes from is. The panel used to infer it from the reading's
 * kept-revision number — a signal that says `current` for a section the writer
 * rewrote this morning, because editing does not keep a version. It now renders
 * the preflight's answer, and infers nothing.
 *
 * ⛔ No assertion below was weakened; the fixture simply says what the SERVER
 * found instead of what the panel guessed.
 */
const CURRENCY = (over: Partial<Record<string, MemberCurrency>> = {}): FocusCurrencyView => ({
  resolvedAgainstDraftVersion: 37,
  members: {
    f1: 'ready', f2: 'ready', f3: 'ready',
    f4: 'needs_confirmation', f5: 'unavailable', ...over,
  } as Record<string, MemberCurrency>,
});

const S = (n: number) => `aaaaaaaa-0000-4000-8000-00000000000${n}`;
const SECTIONS = [1, 2, 3, 4, 5].map((n, i) => ({ id: S(n), position: i, heading: `Part ${n}` }));
const BODIES: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s, i) => [s.id, `The fire in part ${i + 1} was already lit when we came down.`]),
);
const bodyOf = (id: string) => BODIES[id] ?? '';

/**
 * Five declared places: three current, one unverified (a passage from an older
 * kept version), one gone. Exactly the campfire specimen.
 */
function five(): FocusSet {
  const anchors: FocusAnchor[] = [
    { kind: 'section', sectionId: S(1) },
    { kind: 'section', sectionId: S(2) },
    { kind: 'section', sectionId: S(3) },
    { kind: 'passage', sectionId: S(4), range: { start: 4, end: 12 } },
    { kind: 'section', sectionId: 'deleted-section' },
  ];
  return resolveFocusSet({
    anchors, originRevision: 7, currentRevision: 11,
    sections: SECTIONS, bodyOf, label: 'o1 · recurrence',
  });
}

/* ══ P1 · the truth, before the act is spent ═══════════════════════════════ */

describe('P1 — five members, three readable', () => {
  it('the surface says exactly 5 in focus / 3 ready / 1 needs confirmation / 1 gone', () => {
    const r = askReadiness(five(), CURRENCY());
    expect(r.total).toBe(5);
    expect(r.ready).toBe(3);
    expect(r.needConfirmation).toBe(1);
    expect(r.absent).toBe(1);
    expect(r.checking).toBe(0);
    const line = readinessLine(r);
    expect(line).toContain('5 places in focus');
    expect(line).toContain('3 ready for MAIA');
    expect(line).toContain('1 needs confirmation');
  });

  it('⭐ membership is stated independently of readability', () => {
    const set = five();
    // The set never shrinks to what can be read.
    expect(set.members).toHaveLength(5);
    expect(askReadiness(set, CURRENCY()).ready).toBe(3);
    expect(readinessLine(askReadiness(set, CURRENCY()))).toMatch(/5 places/);
  });
});

/* ══ P2 · an unreadable member is never presented as readable ══════════════ */

describe('P2 — an unreadable member is never shown as one MAIA will read', () => {
  it('only what the SERVER calls ready is ready', () => {
    for (const c of ['ready', 'needs_confirmation', 'unavailable', 'not_yet_known'] as const) {
      expect(isReady(c)).toBe(c === 'ready');
    }
    /* ⛔ And an unanswered member is not ready either — no answer is not an
       answer, in either direction. */
    expect(isReady(undefined)).toBe(false);
  });

  /**
   * ⭐⭐ SUPERSEDED BY P13, and the supersession is a strengthening.
   *
   * This obligation used to read: *the request marks them withheld, WITH THE
   * TRUTHFUL REASON* — the panel sent `withheldAs: 'unverified' | 'unavailable'`
   * and the server consulted it when withholding.
   *
   * ⛔ Founder finding: that solved disclosure authority and left a smaller
   * truthfulness hole beside it. A page open for an hour could tell MAIA a
   * section had been deleted when it was merely unconfirmed, or the reverse.
   * The client may PRESENT a reason; it may not be authoritative about one.
   *
   * ⭐ The hole is closed by DELETING the client's authority rather than
   * validating it — a field that is validated is still a field that can be
   * believed on a path someone forgets to validate. The panel now says only
   * WHETHER a member is ready; the server establishes WHY it is not.
   */
  /**
   * ⭐⭐ SUPERSEDED AGAIN, AND THIS IS THE END OF THE LINE FOR IT.
   *
   * v1: the panel sent `withheldAs` — the truthful REASON. Withdrawn by P13:
   *     the client may present a reason, it may not be authoritative about one.
   * v2: the panel sent `readable: boolean` — a claim, honoured as a withhold
   *     and as an ATTEMPT. Withdrawn by C8: an attempt was still enough to make
   *     the server read current characters at historical offsets, which proves
   *     the characters exist and NOT that they are still the focused passage.
   * v3: the panel sends NEITHER. It names places and their historical
   *     coordinates; the server resolves currency against the frozen digest.
   *
   * Each step removed an authority rather than validating it.
   */
  it('the request carries NO readability claim, for any member', () => {
    const body = askRequestBody({
      actId: 'a', sessionId: 's', workRef: 'w', readingId: 'r', observationKey: 'o1',
      set: five(), ask: 'q',
    });
    expect(body.members).toHaveLength(5);
    for (const m of body.members) {
      expect(Object.keys(m).sort().filter((k) => k !== 'range'))
        .toEqual(['focusMemberId', 'sectionRef']);
    }
    expect(JSON.stringify(body)).not.toMatch(/readable|withheld|unverified|unavailable|gone|stale/);
  });

  it('⭐ historical coordinates travel exactly as the observation declared them', () => {
    const body = askRequestBody({
      actId: 'a', sessionId: 's', workRef: 'w', readingId: 'r', observationKey: 'o1',
      set: five(), ask: 'q',
    });
    /* ⛔ From the ANCHOR, never from the panel's local resolution — the server
       compares them against the frozen reading, so a coordinate the panel had
       already re-resolved would be compared against itself. */
    const passage = body.members.find((m) => m.range);
    expect(passage!.range).toEqual({ start: 4, end: 12 });
    expect(body.members.filter((m) => m.range)).toHaveLength(1);
  });

  it('⛔ and the request carries no Work prose', () => {
    const json = JSON.stringify(
      askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', readingId: 'r', observationKey: 'o1', set: five(), ask: 'q' }));
    for (const body of Object.values(BODIES)) {
      for (const word of body.split(' ')) if (word.length > 5) expect(json).not.toContain(word);
    }
  });
});

/* ══ P3 · P4 · P5 — when Ask is lawful ════════════════════════════════════ */

describe('P3 — no active target is lawful', () => {
  it('Ask stays available before the writer chooses what to edit', () => {
    const set = five();
    expect(set.activeIndex).toBeNull();
    expect(askReadiness(set, CURRENCY()).lawful).toBe(true);
    expect(askReadiness(set, CURRENCY()).refusal).toBeNull();
  });

  it('and the request sends a null active member rather than inventing one', () => {
    const body = askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', readingId: 'r', observationKey: 'o1', set: five(), ask: 'q' });
    expect(body.activeMemberId).toBeNull();
  });
});

describe('P4 — an unreadable active target does not cross', () => {
  it('refuses, in words a writer can act on', () => {
    /* `withActive` already refuses an unusable member, so the unlawful state is
       constructed directly — the readiness gate must hold even if some other
       path ever put the set there. */
    const set = { ...five(), activeIndex: 3 } as FocusSet;
    const r = askReadiness(set, CURRENCY());
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/cannot be read yet/i);
  });

  it('⛔ and it names no other place to ask about instead', () => {
    const r = askReadiness({ ...five(), activeIndex: 3 } as FocusSet, CURRENCY());
    expect(r.refusal).not.toMatch(/Part [0-9]|Section [0-9]/);
    expect(actSrc).not.toMatch(/activeIndex\s*=\s*.*findIndex\(.*isReady/);
  });

  it('a readable active target is lawful', () => {
    const set = withActive(five(), 1);
    expect(set.activeIndex).toBe(1);
    expect(askReadiness(set, CURRENCY()).lawful).toBe(true);
  });
});

describe('P5 — zero readable members means no call', () => {
  it('a set with nothing current is unlawful', () => {
    const none = resolveFocusSet({
      anchors: [{ kind: 'passage', sectionId: S(1), range: { start: 9000, end: 9001 } }],
      originRevision: 7, currentRevision: 11, sections: SECTIONS, bodyOf, label: 'o1',
    });
    const r = askReadiness(none, { resolvedAgainstDraftVersion: 37, members: { f1: 'needs_confirmation' } });
    expect(r.ready).toBe(0);
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/none of these places/i);
  });

  it('an empty or absent set is unlawful and says so plainly', () => {
    expect(askReadiness(null, CURRENCY()).lawful).toBe(false);
    expect(askReadiness(null, CURRENCY()).refusal).toBe('There is nothing in focus yet.');
  });

  it('the panel will not send when readiness is unlawful', () => {
    /* ⭐ Re-checked at the press, against the SERVER's fresh answer — a
       readiness that went stale between render and click sends nothing. */
    expect(panel).toMatch(/if \(!askReadiness\(set, fresh\)\.lawful\) return;/);
    expect(panel).toMatch(/disabled=\{!canAsk\}/);
  });
});

/* ══ P6 · P7 · P8 · P9 — one gesture, one act ═════════════════════════════ */

describe('P6 — the first deliberate Ask mints an act', () => {
  it('idle + gesture becomes asking under that identity', () => {
    const s = askReducer(IDLE, { kind: 'gesture', actId: 'act-1' });
    expect(s).toEqual({ phase: 'asking', actId: 'act-1', attempt: 1 });
  });
});

describe('P7 — a transport retry is the SAME act', () => {
  it('retrying keeps the identity and counts the attempt', () => {
    let s: AskPhase = askReducer(IDLE, { kind: 'gesture', actId: 'act-1' });
    s = askReducer(s, { kind: 'retry' });
    s = askReducer(s, { kind: 'retry' });
    expect(s).toEqual({ phase: 'asking', actId: 'act-1', attempt: 3 });
  });

  it('⛔ a retry outside an act mints nothing', () => {
    expect(askReducer(IDLE, { kind: 'retry' })).toBe(IDLE);
  });
});

describe('P8 — a second deliberate Ask is a NEW act', () => {
  it('after an answer, asking again gets its own identity', () => {
    let s: AskPhase = askReducer(IDLE, { kind: 'gesture', actId: 'act-1' });
    s = askReducer(s, { kind: 'answered' });
    s = askReducer(s, { kind: 'gesture', actId: 'act-2' });
    expect(s).toMatchObject({ phase: 'asking', actId: 'act-2', attempt: 1 });
  });

  it('⭐ even when the Focus Set has not changed — asking again is a real act', () => {
    let s: AskPhase = askReducer(IDLE, { kind: 'gesture', actId: 'act-1' });
    s = askReducer(s, { kind: 'refused', why: 'x' });
    s = askReducer(s, { kind: 'gesture', actId: 'act-2' });
    expect(s).toMatchObject({ actId: 'act-2' });
  });
});

describe('P9 — a double submission does not become two writer acts', () => {
  it('a gesture arriving while one is in flight is discarded', () => {
    const first = askReducer(IDLE, { kind: 'gesture', actId: 'act-1' });
    const second = askReducer(first, { kind: 'gesture', actId: 'act-2' });
    // ⭐ The SAME object, which is how the panel recognises the refusal.
    expect(second).toBe(first);
    expect(second).toMatchObject({ actId: 'act-1', attempt: 1 });
  });

  it('⭐ the panel reads the phase SYNCHRONOUSLY, so two presses in one tick are one act', () => {
    /* setPhase is async: a second press reading React state would see `idle` and
       mint a second identity for one human gesture. The ref is the fix, and its
       absence is the defect. */
    expect(panel).toMatch(/phaseRef\s*=\s*useRef<AskPhase>/);
    expect(panel).toMatch(/askReducer\(phaseRef\.current/);
    expect(panel).toMatch(/if \(started === before/);
  });

  it('the button is also disabled in flight — belt as well as braces', () => {
    expect(panel).toMatch(/phase\.phase !== 'asking'/);
  });
});

/* ══ P10 — the client is not a disclosure authority ═══════════════════════ */

describe('P10 — a client marking a stale member "ready" is not trusted', () => {
  it('⭐ SUPERSEDED BY C8 — the client no longer makes a claim to be trusted with', () => {
    const crossing = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'lib', 'writers-studio', 'focusCrossing.ts'), 'utf8'));
    /* There is no `readable` to weigh. The server resolves currency and only
       `ready` is given a body; a member that survives the boundary but whose
       read fails is still `unavailable`, never `readable`. */
    expect(crossing).toMatch(/content === undefined \? 'unavailable' : 'readable'/);
    expect(crossing).not.toMatch(/member\.readable/);
    expect(crossing).toMatch(/if \(!mayDisclose\(currencyOf\.get\(member\.focusMemberId\)/);
  });

  it('⭐ P13 · the route accepts no withheld reason at all — there is none to believe', () => {
    const route = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', 'api', 'writers-studio', 'focus', 'route.ts'), 'utf8'));
    expect(route).not.toMatch(/withheldAs/);
    /* ⭐ The panel still LABELS a withheld member for the writer — but the label
       is now a rendering of the SERVER's word, not the panel's own verdict, and
       it never leaves the browser. */
    expect(panel).toMatch(/const NOTE: Record<MemberCurrency \| 'checking', string>/);
    expect(panel).toMatch(/NOTE\[currencyAt\(i\) \?\? 'checking'\]/);
    expect(actSrc).not.toMatch(/withheldAs/);
  });

  it('⛔ the client never sends Work text, and the route refuses it if it tries', () => {
    const route = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', 'api', 'writers-studio', 'focus', 'route.ts'), 'utf8'));
    expect(route).toMatch(/Work text is read server-side, never supplied/);
    expect(actSrc).not.toMatch(/capturedText|\.content\b/);
  });
});

/* ══ P11 — a failed act record produces no MAIA turn ══════════════════════ */

describe('P11 — an unrecordable act yields no canonical turn', () => {
  it('the crossing refuses before cognition when the record cannot be written', () => {
    const crossing = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'lib', 'writers-studio', 'focusCrossing.ts'), 'utf8'));
    const iAct = crossing.indexOf('openFocusCrossingAct({');
    const iPrepare = crossing.indexOf('deps.prepare({');
    expect(iAct).toBeGreaterThan(-1);
    // ⭐ FAIL-CLOSED PROVENANCE: the record is opened BEFORE cognition.
    expect(iPrepare).toBeGreaterThan(iAct);
    expect(crossing).toMatch(/act\.kind === 'unavailable'[\s\S]{0,400}act: 'unrecorded'/);
  });

  it('a contradiction also stops the crossing', () => {
    const crossing = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'lib', 'writers-studio', 'focusCrossing.ts'), 'utf8'));
    expect(crossing).toMatch(/act\.kind === 'contradiction'[\s\S]{0,200}act: 'contradiction'/);
  });
});

/* ══ P12 — afterwards, the writer learns what MAIA actually saw ═══════════ */

describe('P12 — the answer says MAIA saw 3 of 5, not 5 of 5', () => {
  it('the line comes from the SERVER’s count, not the panel’s', () => {
    expect(sawLine({
      response: 'x', message: null,
      focus: { total: 5, readable: 3, activeMemberId: null, members: [] },
    })).toBe('MAIA read 3 of the 5 places in focus.');
  });

  it('a complete reading claims no limitation it does not have', () => {
    expect(sawLine({
      response: 'x', message: null,
      focus: { total: 3, readable: 3, activeMemberId: null, members: [] },
    })).toBe('MAIA read all 3 places in focus.');
  });

  it('no focus report means no claim at all', () => {
    expect(sawLine({ response: 'x', message: null, focus: null })).toBeNull();
  });

  it('the panel shows it above the answer', () => {
    expect(panel).toMatch(/data-focus-ask-saw/);
    expect(panel).toMatch(/sawLine\(answer\)/);
  });
});

/* ══ ⭐ the UX falsifier ══════════════════════════════════════════════════ */

describe('the writer needs no vocabulary to know what MAIA can see', () => {
  const VOCABULARY = /disclosure|receipt|currency state|provenance|act id|actId|boundary|crossing|scope kind|participation/i;

  it('no member-visible string in the panel uses the architecture’s words', () => {
    /* Only the literals a writer can actually read: JSX text and the copy the
       readiness functions produce. Identifiers and data attributes are not
       member-visible and are deliberately not scanned. */
    const visible = [
      ...panel.matchAll(/>\s*([A-Z][^<>{}\n]{4,})\s*</g),
      ...panel.matchAll(/(?:placeholder|title)="([^"]+)"/g),
      ...panel.matchAll(/'((?:[A-Z]|MAIA)[^']{8,})'/g),
    ].map((m) => m[1]);
    expect(visible.length).toBeGreaterThan(3);
    for (const line of visible) expect(line).not.toMatch(VOCABULARY);
  });

  it('every readiness sentence a writer can meet is plain', () => {
    const sets: (FocusSet | null)[] = [
      null, five(), withActive(five(), 1), { ...five(), activeIndex: 3 } as FocusSet,
    ];
    for (const s of sets) {
      const r = askReadiness(s);
      expect(readinessLine(r)).not.toMatch(VOCABULARY);
      if (r.refusal) expect(r.refusal).not.toMatch(VOCABULARY);
    }
  });

  it('⭐ and it still tells the truth: ready and withheld are both named', () => {
    const line = readinessLine(askReadiness(five(), CURRENCY()));
    expect(line).toMatch(/ready/);
    expect(line).toMatch(/confirmation|no longer/);
  });
});
