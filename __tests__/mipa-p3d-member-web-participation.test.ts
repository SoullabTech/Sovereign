/**
 * MIPA PHASE 0 — P3d CERTIFICATION: MEMBER WEB PATTERN / SESSION-ESSENCE INFERENCE
 *
 * Authority: docs/specs/MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md — P3d
 *
 * ── TOPOLOGY, ESTABLISHED FROM SOURCE BEFORE ANY CHANGE ─────────────────────
 *
 * `formatMemberWebForPrompt` is live on the canonical route
 * (`app/api/sovereign/app/maia/list/route.ts`) as `memberWebAddendum`. It
 * composed five sections:
 *
 *   activePatterns   `pattern_ledger`   `P1 [87% | scope | date]: <statement>`
 *   recentSessions   summary pipeline   `[date] (themes): <essence> → <next>`
 *   recentJournal    member's writing   `[date] (themes) — <200 chars>`
 *   recurringThemes  member_theme_signals (already excluded by R24)
 *   fieldState       derived from all four, with `confidence=0.87`
 *
 * ── THE PARTITION, NOT DELETION ─────────────────────────────────────────────
 *
 * Four classes are excluded; one survives. Solving P3d by deleting the
 * formatter would have removed the member's own journal alongside MAIA's
 * inferences about them — a constitutional failure in the opposite direction.
 *
 * ── THE TWO RULINGS THIS SUITE PINS ─────────────────────────────────────────
 *
 * 1. TRANSFORMATION CREATES A NEWLY AUTHORED OBJECT.
 *
 *      member testimony --machine summarizes--> MAIA-AUTHORED SUMMARY
 *                                          NOT  MEMBER TESTIMONY
 *
 *    Every sentence a session essence summarizes may have been the member's.
 *    The summary is not. Authorship attaches to the REPRESENTATION, not merely
 *    to the raw material it was derived from. That is what prevents intelligent
 *    synthesis from quietly becoming autobiographical authority.
 *
 * 2. THE DERIVATION RULE.
 *
 *      A derived representation cannot acquire greater participation authority
 *      than the material required to produce it.
 *
 *    Otherwise a developer complies with the letter of P3 by never composing
 *    `pattern.statement`, while composing "dominant_theme=water; confidence=0.87".
 *    Same inference, laundered through derivation.
 *
 * A confidence percentage does not elevate epistemic standing. It only makes the
 * inference sound as though it had been measured.
 */

import * as fs from 'fs';
import * as path from 'path';

import {
  adjudicateParticipation,
  adjudicateDerivation,
  type ParticipationVerdict,
} from '@/lib/maia/participationGate';
import {
  certifyMemberWeb,
  formatMemberWebForPrompt,
  type MemberLiveContext,
} from '@/lib/memory/MemberLiveContext';

const REPO = path.resolve(__dirname, '..');
const MLC = path.join(REPO, 'lib/memory/MemberLiveContext.ts');
const src = () => fs.readFileSync(MLC, 'utf8');

const admittedV: ParticipationVerdict = {
  admitted: true,
  provenance: { authoredBy: 'member', authorityClass: 'testimony' },
};
const excludedV: ParticipationVerdict = { admitted: false, reason: 'uncertified_provenance' };

function ctx(over: Partial<MemberLiveContext> = {}): MemberLiveContext {
  return {
    identity: { userId: 'u1' },
    spiralState: null,
    recentSessions: [
      { sessionId: 's1', completedAt: '2026-05-01', summary: { essence: 'MACHINE ESSENCE about the member', themes: ['grief'], nextStep: 'try X' } as never },
    ],
    activePatterns: [
      { statement: 'MACHINE PATTERN STATEMENT', confidence: 0.87, scope: 'personal', lastEvidenceAt: '2026-05-12' } as never,
    ],
    recentJournal: [
      { content: 'I wrote this myself in my journal.', createdAt: new Date('2026-06-01'), themes: ['grief'] } as never,
    ],
    relationshipEssence: null,
    recurringThemes: [{ theme: 'belonging', count: 4, last_seen: '2026-06-02', dominant_signal_type: 'recurring' } as never],
    fieldState: { dominantTone: 'grief', dominantTheme: 'belonging', activePattern: 'MACHINE PATTERN STATEMENT', recency: 'recent', confidence: 0.87, tension: 'approach/avoid' } as never,
    astrology: null,
    assembledAt: new Date().toISOString(),
    ...over,
  } as MemberLiveContext;
}

// ── §1 — unendorsed machine-authored pattern statements cannot compose ───────

describe('P3d §1 — pattern statements and their confidence do not compose', () => {
  it('the certified view contains no patterns field at all', () => {
    const web = certifyMemberWeb(ctx());
    expect((web as Record<string, unknown>).activePatterns).toBeUndefined();
    expect(web.excluded.patterns).toBe(1);
  });

  it('the rendered block contains neither the statement nor its confidence', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    expect(out).not.toMatch(/MACHINE PATTERN STATEMENT/);
    expect(out).not.toMatch(/87%/);
    expect(out).not.toMatch(/Active Patterns/);
  });

  it('confidence metadata cannot make an excluded inference composable', () => {
    // The gate has no confidence input. A percentage is not a warrant.
    const gate = fs.readFileSync(path.join(REPO, 'lib/maia/participationGate.ts'), 'utf8');
    const input = gate.slice(
      gate.indexOf('export interface ParticipationInput'),
      gate.indexOf('export type ExclusionReason'),
    );
    for (const f of ['confidence', 'score', 'strength', 'certainty']) {
      expect({ field: f, present: input.includes(f) }).toEqual({ field: f, present: false });
    }
  });
});

// ── §2 — machine essences cannot impersonate member testimony ────────────────

describe('P3d §2 — transformation creates a newly authored object', () => {
  it('session essences do not compose', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    expect(out).not.toMatch(/MACHINE ESSENCE/);
    expect(out).not.toMatch(/Recent Session Arcs/);
  });

  it('a summary of member testimony is adjudicated as MAIA-authored, not member', () => {
    const summary = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'none',
    });
    expect(summary.admitted).toBe(false);
    // and even if endorsed, authorship does not become the member's
    const endorsed = adjudicateParticipation({
      provenance: { authoredBy: 'maia', authorityClass: 'inference' },
      endorsement: 'endorsed',
    });
    expect(endorsed.admitted).toBe(true);
    if (endorsed.admitted) expect(endorsed.provenance.authoredBy).toBe('maia');
  });

  it('a derivation over admitted member testimony still yields MAIA authorship when inference participates', () => {
    const d = adjudicateDerivation([
      admittedV,
      { admitted: true, provenance: { authoredBy: 'maia', authorityClass: 'inference' } },
    ]);
    expect(d.admitted).toBe(true);
    if (d.admitted) expect(d.provenance.authoredBy).toBe('maia');
  });
});

// ── §3 — the derivation rule ─────────────────────────────────────────────────

describe('P3d §3 — derived claims over excluded material remain excluded', () => {
  it('one excluded input excludes the derivation', () => {
    expect(adjudicateDerivation([admittedV, excludedV])).toEqual({
      admitted: false, reason: 'derived_from_excluded',
    });
  });

  it('a derivation over nothing is an assertion, and is excluded', () => {
    expect(adjudicateDerivation([])).toEqual({ admitted: false, reason: 'derived_from_excluded' });
  });

  it('the field state does not compose, despite one admitted input', () => {
    const web = certifyMemberWeb(ctx());
    expect(web.excluded.fieldState).toBe(true);
    const out = formatMemberWebForPrompt(web);
    expect(out).not.toMatch(/dominant_tone|dominant_theme|confidence=/);
    expect(out).not.toMatch(/field condition|background signal/);
  });

  it('candidate recurrence does not compose', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    expect(out).not.toMatch(/Candidate recurrence/);
    expect(out).not.toMatch(/belonging/);
  });

  it('the laundering case fails: no aggregate restates the excluded inference', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    for (const launder of ['strongest', 'dominant', 'recurring pattern', '0.87', 'confidence']) {
      expect({ launder, present: out.includes(launder) }).toEqual({ launder, present: false });
    }
  });
});

// ── §4 — member-authored material is NOT swept away ──────────────────────────

describe('P3d §4 — the partition preserves the member’s own writing', () => {
  it('journal content composes', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    expect(out).toMatch(/I wrote this myself in my journal\./);
    expect(out).toMatch(/the member's own writing/);
  });

  it('the journal’s themes annotation does NOT compose — unknown authorship', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx()));
    // The content survives; the tag annotation does not. Never-guess applied
    // at field granularity.
    expect(out).toMatch(/I wrote this myself/);
    expect(out).not.toMatch(/\(grief\)/);
  });

  it('with no journal, the block is omitted rather than rendered empty', () => {
    const out = formatMemberWebForPrompt(certifyMemberWeb(ctx({ recentJournal: [] })));
    expect(out).toBe('');
    // No "None recorded yet." scaffolding asserting absence.
    expect(out).not.toMatch(/No journal entries yet|None recorded/);
  });
});

// ── §5 — raw and derived composer bypass ─────────────────────────────────────

describe('P3d §5 — the formatter cannot reach excluded classes', () => {
  it('formatMemberWebForPrompt takes CertifiedMemberWeb, not MemberLiveContext', () => {
    expect(src()).toMatch(/export function formatMemberWebForPrompt\(web: CertifiedMemberWeb\): string/);
  });

  it('CertifiedMemberWeb declares no excluded class as composable data', () => {
    const s = src();
    const start = s.indexOf('export interface CertifiedMemberWeb');
    const body = s.slice(start, s.indexOf('\n}', start));

    // Read the DATA-BEARING half only. The `excluded` sub-object legitimately
    // names the excluded classes — as counts and a boolean, for observability.
    // An assertion that forbade the NAMES would fail on the instrument that
    // reports the exclusion, which is the innocent-lookalike failure again.
    const dataHalf = body.slice(0, body.indexOf('excluded: {'));

    // Enumerate the DECLARED FIELDS and require the exact set. A name-based
    // denylist misses a renamed field — mutation D1 added `patterns:` and
    // passed, because the check only knew `activePatterns`. Closed set, not
    // denylist: a new data field fails BECAUSE IT IS NEW.
    const declared = [...body.matchAll(/^  (\w+)\??:/gm)].map((m) => m[1]).sort();
    expect(declared).toEqual(['excluded', 'journal']);
    expect(dataHalf).toMatch(/journal: Array<\{ createdAt: Date \| string; content: string \}>/);

    // the excluded sub-object carries counts and a flag, never content
    const excludedHalf = body.slice(body.indexOf('excluded: {'));
    expect(excludedHalf).toMatch(/patterns: number/);
    expect(excludedHalf).toMatch(/fieldState: boolean/);
    expect(excludedHalf).not.toMatch(/string/);
  });

  it('the canonical route adjudicates before formatting', () => {
    const route = fs.readFileSync(
      path.join(REPO, 'app/api/sovereign/app/maia/list/route.ts'), 'utf8');
    expect(route).toMatch(/certifyMemberWeb\(memberLiveCtx\)/);
    // The ARGUMENT must be exactly the certified value. Asserting the absence
    // of `formatMemberWebForPrompt(memberLiveCtx)` missed
    // `formatMemberWebForPrompt(memberLiveCtx as any)` — mutation D6, the
    // cast-bypass class, which passed. Pin the argument instead of denying one
    // spelling of the bypass.
    const calls = [...route.matchAll(/formatMemberWebForPrompt\(([^)]*)\)/g)]
      .map((m) => m[1].trim())
      .filter((a) => a.length > 0);
    expect(calls).toEqual(['certifiedWeb']);
  });

  it('each class is classified correctly, not merely excluded by accident', () => {
    // Mutation D4 reclassified session essences as member/testimony and every
    // test still passed, because nothing composes sessions either way. But the
    // CLASSIFICATION is load-bearing for the derivation rule, so it is pinned
    // here rather than left to be inferred from the output.
    const s = src();
    const fn = s.slice(s.indexOf('export function certifyMemberWeb'), s.indexOf('\n * Format the composition-eligible'));

    const claim = (name: string) => {
      const i = fn.indexOf(`const ${name} =`);
      expect({ verdict: name, found: i >= 0 }).toEqual({ verdict: name, found: true });
      return fn.slice(i, fn.indexOf('});', i));
    };

    // machine-authored session essences are MAIA inference — never testimony
    expect(claim('sessionsVerdict')).toMatch(/authoredBy: 'maia', authorityClass: 'inference'/);
    expect(claim('sessionsVerdict')).not.toMatch(/'member'|'testimony'/);
    // patterns and themes carry no establishable authorship
    expect(claim('patternsVerdict')).toMatch(/provenance: null/);
    expect(claim('themesVerdict')).toMatch(/provenance: null/);
    // the member's own writing is testimony
    expect(claim('journalVerdict')).toMatch(/authoredBy: 'member', authorityClass: 'testimony'/);
    // the field state is a derivation over all four
    expect(fn).toMatch(/adjudicateDerivation\(\[\s*journalVerdict,\s*themesVerdict,\s*patternsVerdict,\s*sessionsVerdict,?\s*\]\)/);
  });

  it('certifyMemberWeb converges on the shared gate, with no parallel adjudicator', () => {
    const s = src();
    expect(s).toMatch(/adjudicateParticipation/);
    expect(s).toMatch(/adjudicateDerivation/);
    const code = s.split('\n').filter(l => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n');
    expect(code).not.toMatch(/function\s+adjudicate(?!Participation|Derivation)\w*\s*\(/);
  });
});

// ── §6 — INNOCENT NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3d §6 — innocent negative controls', () => {
  it('prose naming an excluded class is not a composition of it', () => {
    // The module docblock explains at length why patterns and essences are
    // excluded, and names them repeatedly.
    expect(src()).toMatch(/activePatterns/);
    const s = src();
    const start = s.indexOf('export interface CertifiedMemberWeb');
    expect(s.slice(start, s.indexOf('\n}', start))).not.toMatch(/activePatterns/);
  });

  it('buildMemberLiveContext still assembles the full context', () => {
    // P3d governs COMPOSITION, not assembly or observability. The full context
    // remains available to describeLiveContext and to non-composing consumers.
    expect(src()).toMatch(/activePatterns,\n    recentJournal,/);
    expect(src()).toMatch(/export function describeLiveContext/);
  });

  it('an admitted derivation over purely member material stays member-authored', () => {
    const d = adjudicateDerivation([admittedV, admittedV]);
    expect(d.admitted).toBe(true);
    if (d.admitted) expect(d.provenance.authoredBy).toBe('member');
  });
});

// ── §7 — BOUNDARY NEGATIVE CONTROLS ──────────────────────────────────────────

describe('P3d §7 — boundary negative controls', () => {
  it('the retired oracle route is not a live bypass', () => {
    // app/api/oracle/conversation still imports the formatter, but returns 410
    // before reaching it and carries @ts-nocheck. Pinned so that lifting the
    // retirement cannot silently restore an ungated composer.
    const oracle = fs.readFileSync(
      path.join(REPO, 'app/api/oracle/conversation/route.ts'), 'utf8');
    expect(oracle).toMatch(/@ts-nocheck/);
    expect(oracle).toMatch(/status: 410/);
    expect(oracle).toMatch(/Legacy route retired/);
  });

  it('exactly one live call site formats the member web', () => {
    const skip = /node_modules|\.next|__tests__|\.test\.tsx?$/;
    const sites: string[] = [];
    const walk = (p: string) => {
      const st = fs.statSync(p);
      if (st.isDirectory()) {
        for (const f of fs.readdirSync(p)) {
          const q = path.join(p, f);
          if (!skip.test(q)) walk(q);
        }
        return;
      }
      if (!/\.tsx?$/.test(p)) return;
      const rel = path.relative(REPO, p);
      if (rel === 'lib/memory/MemberLiveContext.ts') return;
      fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => {
        if (/^\s*(\/\/|\*)/.test(l)) return;
        if (/formatMemberWebForPrompt\(/.test(l)) sites.push(`${rel}:${i + 1}`);
      });
    };
    for (const r of ['lib', 'app', 'components']) walk(path.join(REPO, r));
    // The canonical route, the 410-retired oracle route, and — since CMT-01
    // Step 3b — the canonical-turn constructor's member_web composer, which
    // formats the SAME CertifiedMemberWeb through the SAME formatter and is
    // reached only through the env-gated shadow witness (no authoritative
    // caller; spec §4.1). Classified here deliberately, not silenced: a fourth
    // is new and fails BECAUSE IT IS NEW.
    expect(sites.sort()).toEqual([
      'app/api/oracle/conversation/route.ts:994',
      'app/api/sovereign/app/maia/list/route.ts:758',
      'lib/maia/turn/constructCanonicalTurn.ts:192',
    ]);
  });

  it('a comment naming the formatter is not a call site', () => {
    const line = "    // sovereign and oracle routes. Format via formatMemberWebForPrompt().";
    expect(/^\s*(\/\/|\*)/.test(line)).toBe(true);
  });

  it('naming coincidence is not a gate', () => {
    expect(/formatMemberWebForPrompt\(/.test('const formatMemberWebForPromptName = 1')).toBe(false);
    expect(/formatMemberWebForPrompt\(/.test('formatMemberWebForPrompt(web)')).toBe(true);
  });
});
