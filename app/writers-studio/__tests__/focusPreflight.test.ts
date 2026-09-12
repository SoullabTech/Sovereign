import * as fs from 'fs';
import * as path from 'path';
import {
  askReadiness, currencyDescribes, focusMembersOf, isReady, readinessLine,
  type FocusCurrencyView,
} from '../field/focusAskAct';
import { resolveFocusSet, withActive, type FocusSet } from '../field/focusSet';
import type { FocusAnchor } from '@/lib/writersStudio/focusAnchors';
import type { MemberCurrency } from '@/lib/writers-studio/focusCurrency';

/**
 * WS-FOCUS-PREFLIGHT-01 — PF1–PF14, predeclared by the founder BEFORE
 * implementation.
 *
 * ⭐⭐ WHY THIS EXISTS. Act 3 requires three layers to agree:
 *
 *   UI truth  =  act-record truth  =  MAIA's truth
 *
 * Layers 2 and 3 were governed; Layer 1 was still inferring from
 * `revision_number`, a signal we proved insufficient — a writer can edit a
 * section fifty times without keeping a version, and the comparison still says
 * `current`. Spending the witness against a surface that can lie would have
 * tested the wrong thing.
 *
 * ⭐ RESOLUTION IS NOT DISCLOSURE. The preflight tells the UI what is true now.
 * The Ask crossing establishes it again, independently, when the member asks.
 * ⛔ This response is not an authority anyone can spend.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const at = (...p: string[]) => strip(fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8'));
const routeSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', 'api', 'writers-studio', 'focus', 'currency', 'route.ts'), 'utf8'));
const panelSrc = at('field', 'FocusSetPanel.tsx');
const actSrc = at('field', 'focusAskAct.ts');
const crossingSrc = strip(fs.readFileSync(
  path.join(__dirname, '..', '..', '..', 'lib', 'writers-studio', 'focusCrossing.ts'), 'utf8'));

const S = (n: number) => `aaaaaaaa-0000-4000-8000-00000000000${n}`;
const SECTIONS = [1, 2, 3, 4, 5].map((n, i) => ({ id: S(n), position: i, heading: `Part ${n}` }));
const bodyOf = (id: string) => (SECTIONS.some((s) => s.id === id) ? `The body of ${id}.` : '');

/** The campfire shape: three whole sections, one passage, one deleted. */
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

const view = (
  m: Partial<Record<string, MemberCurrency>>, version: number | null = 37,
): FocusCurrencyView => ({
  resolvedAgainstDraftVersion: version,
  members: m as Record<string, MemberCurrency>,
});

const ALL = view({
  f1: 'ready', f2: 'ready', f3: 'needs_confirmation',
  f4: 'needs_confirmation', f5: 'unavailable',
});

/* ══ PF1 · PF2 · PF3 · PF4 — the preflight is not a crossing ══════════════ */

describe('PF1 — opening the Focus preflight produces no model call', () => {
  it('the route names no cognition path of any kind', () => {
    expect(routeSrc).not.toMatch(/getMaiaResponse|prepareCanonicalHandoff|beginCanonicalGeneration/);
    expect(routeSrc).not.toMatch(/anthropic|generateText|constructWriterTurn/i);
  });
});

describe('PF2 — it produces no disclosure receipt', () => {
  it('no boundary, no mint, no confirm', () => {
    expect(routeSrc).not.toMatch(/establishDisclosureBoundary|mintDisclosureAttempt|confirmDisclosureCrossed/);
    expect(routeSrc).not.toMatch(/runtime_consent_state|context_disclosure_receipts/);
  });
});

describe('PF3 — it produces no FocusCrossingAct', () => {
  it('no act is opened or completed', () => {
    expect(routeSrc).not.toMatch(/openFocusCrossingAct|completeFocusCrossingAct|focus_crossing_acts/);
  });

  it('⛔ and it mutates nothing at all', () => {
    expect(routeSrc).not.toMatch(/INSERT|UPDATE|DELETE|transaction\(/i);
  });
});

describe('PF4 — the response carries no body, quote, digest or description', () => {
  /**
   * ⛔ INSTRUMENT NOTE, and this is the THIRD time today — the C21 class is a
   * habit, not an accident. A word-ban over a whole file matches identifiers
   * and types, never behaviour: here `const body = await request.json()`, the
   * REQUEST body, tripped a ban on manuscript bodies. The obligation is about
   * what the route RETURNS, so it is scoped to the response literal.
   */
  it('it returns a member id and one word', () => {
    const returned = routeSrc.slice(routeSrc.lastIndexOf('return NextResponse.json({'));
    expect(returned.length).toBeGreaterThan(80);
    expect(returned).toMatch(/focusMemberId: m\.focusMemberId,\s*currency: m\.currency,/);
    expect(returned).not.toMatch(/digest|sha256|\bbody\b|text|content|summary|excerpt|heading/i);
  });

  it('⛔ not even the section ref is echoed — the client already holds it', () => {
    const shape = routeSrc.slice(routeSrc.indexOf('members: currency.members.map'));
    expect(shape).not.toMatch(/sectionRef/);
  });
});

/* ══ PF5 · PF6 · PF7 · PF8 · PF9 — the panel renders what it is told ══════ */

describe('PF5–PF8 — the four verdicts reach the surface unchanged', () => {
  it('a set of five renders 2 ready · 2 need confirmation · 1 no longer here', () => {
    const r = askReadiness(five(), ALL);
    expect(r).toMatchObject({ total: 5, ready: 2, needConfirmation: 2, absent: 1, checking: 0 });
    const line = readinessLine(r);
    expect(line).toContain('5 places in focus');
    expect(line).toContain('2 ready for MAIA');
    expect(line).toContain('2 need confirmation');
    expect(line).toContain('1 no longer here');
  });

  it('⭐ and membership is still stated independently of readability', () => {
    expect(askReadiness(five(), ALL).total).toBe(5);
    expect(five().members).toHaveLength(5);
  });

  it('only `ready` is ready — the panel infers nothing of its own', () => {
    for (const c of ['ready', 'needs_confirmation', 'unavailable', 'not_yet_known'] as const) {
      expect(isReady(c)).toBe(c === 'ready');
    }
    expect(isReady(undefined)).toBe(false);
  });

  it('⭐ a whole-section member that the SERVER calls ready is ready, whatever the panel thinks', () => {
    /* PF7 · the body may have changed; the Focus means this section now. The
       panel holds no opinion to override. */
    const r = askReadiness(five(), view({ f1: 'ready', f2: 'ready', f3: 'ready', f4: 'ready', f5: 'ready' }));
    expect(r.ready).toBe(5);
    expect(r.lawful).toBe(true);
  });
});

describe('PF9 — a resolver failure is `unknown`, never `unavailable`', () => {
  it('not_yet_known is counted as checking, not as gone', () => {
    const r = askReadiness(five(), view({
      f1: 'ready', f2: 'not_yet_known', f3: 'not_yet_known', f4: 'not_yet_known', f5: 'not_yet_known',
    }));
    expect(r.checking).toBe(4);
    expect(r.absent).toBe(0);
    expect(readinessLine(r)).toContain('4 still being checked');
  });

  it('⛔ before any answer arrives the panel claims NOTHING', () => {
    const r = askReadiness(five(), null);
    expect(r).toMatchObject({ ready: 0, needConfirmation: 0, absent: 0, checking: 5, lawful: false });
    expect(r.refusal).toMatch(/Checking which of these MAIA can read/);
  });

  it('⛔ and a failed preflight leaves the panel checking — never ready, never gone', () => {
    expect(panelSrc).toMatch(/catch \{/);
    expect(panelSrc).not.toMatch(/setCurrency\(null\)|currency: 'unavailable'/);
  });

  it('a set where nothing is ready cannot be asked', () => {
    const r = askReadiness(five(), view({ f1: 'needs_confirmation', f2: 'unavailable' }));
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/Confirm an anchor first|could not check/);
  });
});

/* ══ PF10 · PF11 — the version the answers describe ══════════════════════ */

describe('PF10 — the result carries the draft version it describes', () => {
  it('the route returns it, and calls it a freshness marker', () => {
    expect(routeSrc).toMatch(/resolvedAgainstDraftVersion: currency\.resolvedAgainstDraftVersion/);
  });

  it('⛔ and never compares it with the reading’s revision number', () => {
    expect(routeSrc).not.toMatch(/revisionNumber|revision_number/);
    expect(actSrc).not.toMatch(/resolvedAgainstDraftVersion.*revision/i);
  });
});

describe('PF11 — the Canvas advancing invalidates the prior preflight', () => {
  it('a v37 answer does not describe v38', () => {
    expect(currencyDescribes(ALL, 37)).toBe(true);
    expect(currencyDescribes(ALL, 38)).toBe(false);
    expect(currencyDescribes(ALL, null)).toBe(false);
    expect(currencyDescribes(null, 37)).toBe(false);
    expect(currencyDescribes(view({}, null), 37)).toBe(false);
  });

  it('⭐ the panel discards a stale result rather than showing it', () => {
    expect(panelSrc).toMatch(/const fresh = currencyDescribes\(currency, draftVersion \?\? null\) \? currency : null/);
    expect(panelSrc).toMatch(/askReadiness\(set, fresh\)/);
  });

  it('and it re-asks when the version moves', () => {
    expect(panelSrc).toMatch(/\[workRef, readingId, observationKey, membersKey, draftVersion, set\]/);
  });

  it('⛔ a stale result renders as checking, not as the old numbers', () => {
    /* The panel passes `fresh` — null when stale — so readiness falls to the
       no-answer branch and says so. */
    expect(askReadiness(five(), null).checking).toBe(5);
  });
});

/* ══ PF12 · PF13 · PF14 — the preflight is not an authority ══════════════ */

describe('PF12 — a client insisting everything is ready changes nothing', () => {
  it('⭐ THE MUTATION THAT MATTERS: the Ask request carries no currency at all', () => {
    const members = focusMembersOf(five());
    for (const m of members) {
      expect(Object.keys(m).sort().filter((k) => k !== 'range'))
        .toEqual(['focusMemberId', 'sectionRef']);
    }
    expect(JSON.stringify(members)).not.toMatch(/ready|currency|readable|current/i);
  });

  it('the crossing never reads a currency from the request', () => {
    const req = crossingSrc.slice(
      crossingSrc.indexOf('export interface FocusCrossingRequest'),
      crossingSrc.indexOf('export type FocusCrossingResult'),
    );
    expect(req).not.toMatch(/currency|resolvedAgainst|preflight|readable/i);
  });
});

describe('PF13 — Ask still performs its own currency resolution', () => {
  it('the crossing resolves before any boundary, from its own dependency', () => {
    const body = crossingSrc.slice(crossingSrc.indexOf('export async function performFocusCrossing'));
    expect(body.indexOf('deps.resolveCurrency(')).toBeGreaterThan(-1);
    expect(body.indexOf('establishDisclosureBoundary({'))
      .toBeGreaterThan(body.indexOf('deps.resolveCurrency('));
  });

  it('⛔ and the panel sends no preflight result with the Ask', () => {
    const sent = panelSrc.slice(panelSrc.indexOf('askRequestBody({'), panelSrc.indexOf('askRequestBody({') + 300);
    expect(sent).not.toMatch(/currency|fresh|readiness/);
  });
});

describe('PF14 — no preflight response can be spent as disclosure authority', () => {
  it('the two routes are distinct, and only one crosses', () => {
    expect(routeSrc).not.toMatch(/performFocusCrossing/);
    /* ⭐ It reaches the same constituted resolver the crossing uses — one law,
       two callers — and nothing else. */
    expect(routeSrc).toMatch(/focusCurrencyResolver/);
  });

  it('⛔ and it is behind the same founder gate, 404 not 403', () => {
    expect(routeSrc).toMatch(/WRITERS_STUDIO_FOCUS_ENABLED === '1'/);
    expect(routeSrc).toMatch(/return new NextResponse\(null, \{ status: 404 \}\)/);
  });

  it('identity comes from the verified session, never from the body', () => {
    expect(routeSrc).toMatch(/resolveCanonicalIdentity\(request\)/);
    expect(routeSrc).toMatch(/memberId: identity\.memberId/);
    expect(routeSrc).not.toMatch(/memberId\s*\}\s*=\s*body|body\.memberId/);
  });
});

/* ══ ⭐ the founder's UI finding, repaired ═══════════════════════════════ */

describe('the member glyph no longer conflates two different states', () => {
  it('each state has its own mark', () => {
    const marks = ['ready', 'needs_confirmation', 'unavailable', 'not_yet_known']
      .map((k) => panelSrc.match(new RegExp(`${k}: '(.)'`))?.[1]);
    expect(new Set(marks.slice(0, 3)).size).toBe(3);
  });

  it('⛔ and its note is plain words, not vocabulary', () => {
    /* ⛔ Same instrument note: the TYPE annotation says `MemberCurrency`, which
       is the architecture's word and is not member-visible. What a writer reads
       is the string literals, so those are what is scanned. */
    const block = panelSrc.slice(panelSrc.indexOf('const NOTE'), panelSrc.indexOf('const NOTE') + 700);
    const spoken = [...block.matchAll(/: '([^']+)'/g)].map((m) => m[1]);
    expect(spoken.length).toBeGreaterThanOrEqual(5);
    for (const line of spoken) {
      expect(line).not.toMatch(/currency|disclosure|receipt|provenance|digest|anchor|scope/i);
    }
    expect(spoken).toContain('MAIA can read this');
  });
});

/* ══ ⭐ the active target follows the server too ═════════════════════════ */

describe('the edit target may only be a place the SERVER calls ready', () => {
  it('an unreadable active target refuses, and names no substitute', () => {
    const set = { ...withActive(five(), 0), activeIndex: 2 } as FocusSet;
    const r = askReadiness(set, ALL);
    expect(r.lawful).toBe(false);
    expect(r.refusal).toMatch(/cannot be read yet/);
    expect(r.refusal).not.toMatch(/Part [0-9]|Section [0-9]/);
  });

  it('a ready active target is lawful', () => {
    expect(askReadiness(withActive(five(), 0), ALL).lawful).toBe(true);
  });

  it('and no active target at all is still lawful', () => {
    expect(five().activeIndex).toBeNull();
    expect(askReadiness(five(), ALL).lawful).toBe(true);
  });
});
