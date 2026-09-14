/**
 * W3 — the experience assembly. W3-1 … W3-12.
 *
 * ⭐ The two assembly LAWS are behavioural (they are pure functions the room
 * imports). The ASSEMBLY ITSELF is source-level and labelled so: rendering the
 * Canvas needs a browser, a session and a manuscript, and none of those is
 * weakened to make a witness easier.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { afterAppend } from '@/lib/writersStudio/editorialWorkspace';
import { editorialSubjectOf } from '@/lib/writersStudio/writeStateClient';
import type { WriteState } from '@/lib/writersStudio/writeStateClient';

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const read = (rel: string) => strip(readFileSync(join(process.cwd(), rel), 'utf8'));
const ROOM = read('app/writers-studio/canvas/page.tsx');
const WS = read('app/writers-studio/EditorialWorkspace.tsx');
const LAW = read('lib/writersStudio/editorialWorkspace.ts');

const chainState = (focusedVersionId: string | null): WriteState => ({
  mode: 'section_aware', version: 41, rows: [], sections: [],
  editorialSubject: { kind: 'chain', chainId: 'C1', focusedVersionId },
});
/** A legacy `proposal=` response: a target, and ⛔ no editorial subject. */
const legacyState = {
  mode: 'proposal_work', version: 41, rows: [], sections: [],
  target: { proposalId: 'old-1', sectionId: 'sec-1', sectionLabel: 'x',
            range: { space: 'projected_section_body', start: 0, end: 2 },
            operation: 'delete_exact_text', replacementText: '' },
} as unknown as WriteState;

/* ══════════════════════════════════════════════════════════════════════════
   ⚠️ LAW 1 WAS SUPERSEDED BY A FOUNDER RULING, 2026-09-14 (W5-Z0), AND THESE
   OBLIGATIONS ARE TRANSFERRED RATHER THAN DELETED.

   W3 derived the subject in the browser from the resolved target
   (`workspaceSubject(engine?.target)`). The ruling moved the decision to the
   server, because a subject derived from a TARGET is a subject that cannot
   exist without candidate wording — and W5 proved an Insight belongs to the
   CHAIN. ⛔ The half of law 1 that mattered is UNCHANGED and is now stronger:
   the room still never mounts from the URL; it mounts from a server resolution
   one step further away from the URL than before.

   W3-7 — *losing the exact locus does not erase the editorial relationship* —
   has moved to the seam that now decides it, and is asserted in
   `scripts/witness/w5-z0-witness.ts` (Z0-7i) against the route's own source,
   which is where a regression would have to occur.
   ══════════════════════════════════════════════════════════════════════════ */
describe('W3 law 1 → W5-Z0 · the subject is resolved by the server', () => {
  it('W3-1 · a resolved chain subject mounts the workspace', () => {
    expect(editorialSubjectOf(chainState('V3')))
      .toEqual({ kind: 'chain', chainId: 'C1', focusedVersionId: 'V3' });
  });

  it('Z0-2 · ⭐⭐ and a subject with NO focused version still mounts it', () => {
    /* "MAIA noticed this and proposed no wording" is a first-class state. */
    expect(editorialSubjectOf(chainState(null)))
      .toEqual({ kind: 'chain', chainId: 'C1', focusedVersionId: null });
  });

  it('W3-2 · a legacy target stays with the old path and gains no subject', () => {
    expect(editorialSubjectOf(legacyState)).toBeNull();
  });

  it('no resolved subject → no workspace and no panel', () => {
    expect(editorialSubjectOf(null)).toBeNull();
    expect(editorialSubjectOf(undefined)).toBeNull();
  });

  it('⛔ [SOURCE] the room mounts from the server resolution, never the raw URL', () => {
    /* ⚠️ A MUTANT SURVIVED THE FIRST WRITING OF THIS PIN. It banned a CALL
       SHAPE and required a substring; a mutant that kept the call as a FALLBACK
       and built the subject inline from the URL satisfied both.

       ⭐ Re-asserted as the whole assignment: `subject` is the server's answer
       and NOTHING ELSE, and the room never builds a subject of its own. */
    expect(ROOM).toMatch(/const subject = editorialSubjectOf\(writeState\);/);
    expect((ROOM.match(/const subject\s*=/g) ?? []).length).toBe(1);
    expect(ROOM).not.toMatch(/kind: 'chain'/);
    expect(ROOM).not.toMatch(/focusedVersionId:/);
    /* and the workspace cannot read query parameters even in principle */
    expect(WS).not.toMatch(/useSearchParams|searchParams|location\.search|URLSearchParams/);
  });

  it('⛔ [SOURCE] the law file names no target, so a subject cannot be derived from one', () => {
    expect(LAW).not.toMatch(/ProposalWorkTarget/);
  });
});

describe('W3 · law 2 — the screen agrees with storage', () => {
  it('W3-5 · ⭐⭐ a successful append REFOCUSES and LAUNCHES NOTHING ITSELF', () => {
    /* W3.1 · the subject transition is the only success-path trigger; the
       governed effects (which cancel) do both rereads for the NEW subject. */
    expect(afterAppend({ status: 'appended', versionId: 'V4' })).toEqual({
      refocusTo: 'V4', rereadWriteState: false, rereadLineage: false,
      keepComposerTarget: false,
    });
  });

  it('W3.1 · ⭐⭐ MODELLED RACE — the old subject can never commit after the new', () => {
    /* ⚠️ EVIDENCE CLASS: MODELLED SEQUENCE, named as one. Rendering the room
       needs a browser, a session and a manuscript; what is modelled here is the
       exact founder scenario, driven by the REAL law:
           start a read for the old subject V3 · transition to V4 ·
           let V4 resolve first and V3 resolve last.
       The pre-repair law launched an ungoverned V3 write-state read on success,
       so V3 committed last and the room fell back under a URL saying V4. */
    const committed: string[] = [];
    let subject = 'V3';
    const inflight: { subject: string; resolve: () => void }[] = [];
    /* the ONE governed path: it cancels when the subject moves on */
    const governedRead = (forSubject: string) => inflight.push({
      subject: forSubject,
      resolve: () => { if (subject === forSubject) committed.push(forSubject); },
    });
    /* an UNGOVERNED read captures the subject at call time and never cancels */
    const ungovernedRead = (captured: string) => inflight.push({
      subject: captured, resolve: () => committed.push(captured),
    });

    const next = afterAppend({ status: 'appended', versionId: 'V4' });
    if (next.rereadWriteState) ungovernedRead(subject);          // the defect
    if (next.refocusTo) { subject = next.refocusTo; governedRead(subject); }

    /* V4 resolves first, the stale V3 read last */
    [...inflight].sort((a) => (a.subject === 'V4' ? -1 : 1)).forEach((r) => r.resolve());

    expect(committed[committed.length - 1]).toBe('V4');
    expect(committed).not.toContain('V3');
    expect(subject).toBe('V4');
  });

  it('W3-6 · ⭐⭐ a refusal rereads the lineage ONLY — focus and target untouched', () => {
    /* Seeing new history is not consenting to a new succession relationship.
       ⭐ And the lineage read here is lawful precisely BECAUSE the subject does
       not change: there is no newer subject for it to arrive behind. */
    expect(afterAppend({ status: 'refused', reason: 'not_successor_of_head' })).toEqual({
      refocusTo: null, rereadWriteState: false, rereadLineage: true,
      keepComposerTarget: true,
    });
  });

  it('every refusal behaves alike — no reason gets a special retarget', () => {
    for (const reason of ['not_successor_of_head', 'simultaneous_append',
      'version_exists', 'unreachable', 'chain_corrupt']) {
      expect(afterAppend({ status: 'refused', reason }).refocusTo).toBeNull();
      expect(afterAppend({ status: 'refused', reason }).keepComposerTarget).toBe(true);
    }
  });

  it('⛔ [SOURCE] only the IDENTITY is taken from the 201 — no optimistic insert', () => {
    expect(WS).toMatch(/const \{ id \} = \(await res\.json\(\)\)/);
    expect(WS).not.toMatch(/setChain\(\s*\{[\s\S]{0,200}versions:\s*\[/);
    expect(WS).not.toMatch(/\.versions\.concat|\.\.\.chain\.versions|insertVersion|optimistic/i);
  });

  it('W3.1 · ⛔ [SOURCE] the refocus is issued BEFORE any other effect', () => {
    expect(WS).toMatch(
      /if \(next\.refocusTo !== null\) onFocusVersion\(next\.refocusTo\);[\s\S]{0,400}?if \(next\.rereadLineage\)/);
  });

  it('⛔ [SOURCE] no retry and no head substitution anywhere in the assembly', () => {
    expect(WS).not.toMatch(/\bretry\b|resubmit|\bagain\b/i);
    /* the composer's predecessor is the focused version the server returned */
    expect(WS).toMatch(/focusedVersionId/);
    expect(WS).not.toMatch(/versions\[versions\.length - 1\]|\bhead\b(?!er)/i);
  });
});

describe('W3 · ⛔ what the assembly must NOT have acquired', () => {
  it('W3-4 · the composer target is the focused version, keyed by its identity', () => {
    expect(WS).toMatch(/key=\{focused\.id\}/);
    expect(WS).toMatch(/versionId: focused\.id/);
  });

  it('W3-10 · ⛔ no authorization or execution control anywhere in W3', () => {
    for (const body of [WS, LAW]) {
      expect(body.toLowerCase()).not.toMatch(
        /revision-authorizations|\/execute|authorizeversion|mayaccept|adopt/);
    }
  });

  it('W3-11 · ⛔ no Insight / Direction / Discourse placeholder before W5', () => {
    expect(WS).not.toMatch(/\bAsk MAIA\b|\bEditorial intent/i);
    expect(WS.replace(/flexDirection/g, '')).not.toMatch(/\bdirection\b|\bdiscourse\b|\binsight\b/i);
  });

  it('⛔ no second diff, excerpt or locus finder — the manuscript seams own those', () => {
    expect(WS).not.toMatch(/sentenceComparison|codePointBoundaries|indexOf\(|occurrences|slice\(/);
    expect(LAW).not.toMatch(/range|markableRange|projected_section_body/);
  });

  it('W3-1 · ⛔ [SOURCE] the workspace and the legacy panel are mutually exclusive', () => {
    /* one visit gets one proposal subject, everywhere — including which
       surface renders */
    /* ⚠️ RE-ANCHORED FOR W5-Z0. The subject is now a single-kind object, so the
       old `subject?.kind === 'chain'` spelling is gone; the OBLIGATION is
       unchanged and is asserted at BOTH render sites, not just wherever the
       first match happens to land. */
    const sites = ROOM.match(
      /subject \? \([\s\S]{0,400}?\) : proposed\.mount\.state === 'ready' \? \(/g) ?? [];
    expect(sites.length).toBe(2);
    /* ⛔ and the legacy panel is reachable from nowhere else in the room */
    expect((ROOM.match(/<ProposedChange/g) ?? []).length).toBe(2);
  });
});
