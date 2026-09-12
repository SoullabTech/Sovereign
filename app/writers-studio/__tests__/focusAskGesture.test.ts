import * as fs from 'fs';
import * as path from 'path';
import {
  IDLE, askReadiness, askReducer, askRequestBody, isReady, readinessLine, sawLine,
  type AskPhase,
} from '../field/focusAskAct';
import { resolveFocusSet, withActive, type FocusSet } from '../field/focusSet';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';

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
    const r = askReadiness(five());
    expect(r.total).toBe(5);
    expect(r.ready).toBe(3);
    expect(r.needConfirmation).toBe(1);
    expect(r.absent).toBe(1);
    const line = readinessLine(r);
    expect(line).toContain('5 places in focus');
    expect(line).toContain('3 ready for MAIA');
    expect(line).toContain('1 needs confirmation');
  });

  it('⭐ membership is stated independently of readability', () => {
    const set = five();
    // The set never shrinks to what can be read.
    expect(set.members).toHaveLength(5);
    expect(set.members.filter(isReady)).toHaveLength(3);
    expect(readinessLine(askReadiness(set))).toMatch(/5 places/);
  });
});

/* ══ P2 · an unreadable member is never presented as readable ══════════════ */

describe('P2 — an unreadable member is never shown as one MAIA will read', () => {
  it('only current members are ready', () => {
    for (const m of five().members) {
      expect(isReady(m)).toBe(m.state === 'current');
    }
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
  it('the request marks them withheld, and says nothing about why', () => {
    const body = askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', set: five(), ask: 'q' });
    const withheld = body.members.filter((m) => !m.readable);
    expect(withheld).toHaveLength(2);
    for (const m of withheld) expect(Object.keys(m).sort()).toEqual(['focusMemberId', 'readable', 'sectionRef']);
    expect(JSON.stringify(body)).not.toMatch(/withheld|unverified|unavailable|gone|stale/);
  });

  it('⛔ a withheld member sends no offsets at all', () => {
    const body = askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', set: five(), ask: 'q' });
    for (const m of body.members) {
      if (!m.readable) expect(m.range).toBeUndefined();
    }
  });

  it('⛔ and the request carries no Work prose', () => {
    const json = JSON.stringify(
      askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', set: five(), ask: 'q' }));
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
    expect(askReadiness(set).lawful).toBe(true);
    expect(askReadiness(set).refusal).toBeNull();
  });

  it('and the request sends a null active member rather than inventing one', () => {
    const body = askRequestBody({ actId: 'a', sessionId: 's', workRef: 'w', set: five(), ask: 'q' });
    expect(body.activeMemberId).toBeNull();
  });
});

describe('P4 — an unreadable active target does not cross', () => {
  it('refuses, in words a writer can act on', () => {
    /* `withActive` already refuses an unusable member, so the unlawful state is
       constructed directly — the readiness gate must hold even if some other
       path ever put the set there. */
    const set = { ...five(), activeIndex: 3 } as FocusSet;
    const r = askReadiness(set);
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/cannot be read yet/i);
  });

  it('⛔ and it names no other place to ask about instead', () => {
    const r = askReadiness({ ...five(), activeIndex: 3 } as FocusSet);
    expect(r.refusal).not.toMatch(/Part [0-9]|Section [0-9]/);
    expect(actSrc).not.toMatch(/activeIndex\s*=\s*.*findIndex\(.*isReady/);
  });

  it('a readable active target is lawful', () => {
    const set = withActive(five(), 1);
    expect(set.activeIndex).toBe(1);
    expect(askReadiness(set).lawful).toBe(true);
  });
});

describe('P5 — zero readable members means no call', () => {
  it('a set with nothing current is unlawful', () => {
    const none = resolveFocusSet({
      anchors: [{ kind: 'passage', sectionId: S(1), range: { start: 9000, end: 9001 } }],
      originRevision: 7, currentRevision: 11, sections: SECTIONS, bodyOf, label: 'o1',
    });
    const r = askReadiness(none);
    expect(r.ready).toBe(0);
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/none of these places/i);
  });

  it('an empty or absent set is unlawful and says so plainly', () => {
    expect(askReadiness(null).lawful).toBe(false);
    expect(askReadiness(null).refusal).toBe('There is nothing in focus yet.');
  });

  it('the panel will not send when readiness is unlawful', () => {
    expect(panel).toMatch(/if \(!askReadiness\(set\)\.lawful\) return;/);
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
  it('the server treats readable:true as an attempt, and readable:false as binding', () => {
    const crossing = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'lib', 'writers-studio', 'focusCrossing.ts'), 'utf8'));
    // A member the client called readable still has to survive the boundary AND
    // the read; failing either makes it `unavailable`, never `readable`.
    expect(crossing).toMatch(/content === undefined \? 'unavailable' : 'readable'/);
    // And a member the client withheld acquires no boundary at all.
    expect(crossing).toMatch(/if \(!member\.readable\) continue;/);
  });

  it('⭐ P13 · the route accepts no withheld reason at all — there is none to believe', () => {
    const route = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', 'api', 'writers-studio', 'focus', 'route.ts'), 'utf8'));
    expect(route).not.toMatch(/withheldAs/);
    /* The panel still LABELS a withheld member for the writer — that is local
       presentation and stays — but the label never leaves the browser. */
    expect(panel).toMatch(/MEMBER_STATE_NOTE/);
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
    const line = readinessLine(askReadiness(five()));
    expect(line).toMatch(/ready/);
    expect(line).toMatch(/confirmation|no longer/);
  });
});
