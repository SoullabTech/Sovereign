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
import {
  workspaceSubject, afterAppend,
} from '@/lib/writersStudio/editorialWorkspace';
import type { ProposalWorkTarget } from '@/lib/writersStudio/writeStateClient';

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const read = (rel: string) => strip(readFileSync(join(process.cwd(), rel), 'utf8'));
const ROOM = read('app/writers-studio/canvas/page.tsx');
const WS = read('app/writers-studio/EditorialWorkspace.tsx');
const LAW = read('lib/writersStudio/editorialWorkspace.ts');

const chainTarget = (located: boolean): ProposalWorkTarget => ({
  chainId: 'C1', versionId: 'V3', sectionId: 'sec-1', sectionLabel: 'Before the water',
  replacementText: ', quieter',
  location: located
    ? { located: true, range: { space: 'projected_section_body', start: 4, end: 12 } }
    : { located: false, reason: 'expected_text_absent' },
});
const legacyTarget = {
  proposalId: 'old-1', sectionId: 'sec-1', sectionLabel: 'x',
  range: { space: 'projected_section_body', start: 0, end: 2 },
  operation: 'delete_exact_text', replacementText: '',
} as unknown as ProposalWorkTarget;

describe('W3 · law 1 — the subject comes from the resolved target', () => {
  it('W3-1 · a resolved chain target mounts the workspace', () => {
    expect(workspaceSubject(chainTarget(true)))
      .toEqual({ kind: 'chain', chainId: 'C1', versionId: 'V3', located: true });
  });

  it('W3-2 · a resolved legacy target stays with the old path', () => {
    expect(workspaceSubject(legacyTarget)).toEqual({ kind: 'legacy' });
  });

  it('no resolved target → no workspace and no panel', () => {
    expect(workspaceSubject(null)).toBeNull();
    expect(workspaceSubject(undefined)).toBeNull();
  });

  it('W3-7 · ⭐⭐ location unavailable still mounts — the relationship survives', () => {
    /* Losing the exact locus does not erase the editorial relationship. */
    expect(workspaceSubject(chainTarget(false)))
      .toEqual({ kind: 'chain', chainId: 'C1', versionId: 'V3', located: false });
  });

  it('⛔ [SOURCE] the room mounts from the resolved target, never the raw URL', () => {
    /* ⚠️ A MUTANT SURVIVED THE FIRST WRITING OF THIS PIN. It banned a CALL
       SHAPE — `workspaceSubject(searchParams|proposalFocus)` — and required the
       substring `workspaceSubject(engine?.target)`. A mutant that kept that
       call as a FALLBACK and constructed the subject inline from the URL
       satisfied both. The fifth time in this session I have pinned a mechanism
       where a behaviour was meant.

       ⭐ Re-asserted as the whole assignment: `subject` is derived from the
       resolved target and from NOTHING ELSE, and the room never builds a
       subject of its own. */
    expect(ROOM).toMatch(/const subject = workspaceSubject\(engine\?\.target\);/);
    expect((ROOM.match(/const subject\s*=/g) ?? []).length).toBe(1);
    expect(ROOM).not.toMatch(/kind: 'chain'/);
    expect(ROOM).not.toMatch(/workspaceSubject\(\s*(searchParams|proposalFocus)/);
    /* and the workspace cannot read query parameters even in principle */
    expect(WS).not.toMatch(/useSearchParams|searchParams|location\.search|URLSearchParams/);
  });
});

describe('W3 · law 2 — the screen agrees with storage', () => {
  it('W3-5 · ⭐⭐ a successful append REFOCUSES and REREADS; it never patches', () => {
    expect(afterAppend({ status: 'appended', versionId: 'V4' })).toEqual({
      refocusTo: 'V4', rereadWriteState: true, rereadLineage: true,
      keepComposerTarget: false,
    });
  });

  it('W3-6 · ⭐⭐ a refusal rereads the lineage ONLY — focus and target untouched', () => {
    /* Seeing new history is not consenting to a new succession relationship. */
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
    expect(ROOM).toMatch(/subject\?\.kind === 'chain' \? \([\s\S]{0,400}?\) : proposed\.mount\.state === 'ready' \? \(/);
  });
});
