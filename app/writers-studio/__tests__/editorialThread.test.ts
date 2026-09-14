/**
 * W1 — the editorial thread's acceptance bar.
 *
 * ⭐ Witnessed against a REAL INTERLEAVED CHAIN, not the one-version shape the
 * data happens to hold: the contract has always been multi-version, and the
 * absence of UI-generated succession must not become a one-version UI.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { editorialThread, authorLabel, type ThreadInput } from '@/lib/writersStudio/editorialThread';

const strip = (s: string) =>
  s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const SURFACE = strip(readFileSync(
  join(process.cwd(), 'app/writers-studio/EditorialThread.tsx'), 'utf8'));
const MODULE = strip(readFileSync(
  join(process.cwd(), 'lib/writersStudio/editorialThread.ts'), 'utf8'));

/** MAIA v1 → member v2 → MAIA v3, interleaved authorship, one rationale absent. */
const CHAIN: ThreadInput = {
  chainId: 'C1',
  locus: { expectedText: ', fixated,' },
  versions: [
    { id: 'v1', author: 'maia', supersedes: null, replacementText: ', held,',
      rationale: 'The previous paragraph already carries the developmental movement.',
      authoredAt: '2026-09-14T10:00:00.000Z' },
    { id: 'v2', author: 'member', supersedes: 'v1', replacementText: ', steady,',
      authoredAt: '2026-09-14T10:05:00.000Z' },
    { id: 'v3', author: 'maia', supersedes: 'v2', replacementText: ', quieter,',
      rationale: 'Keeps your spiral image and drops the repetition.',
      authoredAt: '2026-09-14T10:09:00.000Z' },
  ],
  focusedVersionId: 'v1',
};

describe('W1 · the thread renders succession, authorship and rationale', () => {
  it('⭐ a three-version chain with interleaved MAIA/member authorship', () => {
    const t = editorialThread(CHAIN);
    expect(t.ok).toBe(true);
    if (!t.ok) return;
    expect(t.rows.map((r) => (r.kind === 'original' ? 'original' : `${r.author}:${r.ordinal}`)))
      .toEqual(['original', 'maia:1', 'member:2', 'maia:3']);
  });

  it('⭐ `Original` is a DIFFERENT KIND — never a fourth authored version', () => {
    const t = editorialThread(CHAIN);
    if (!t.ok) throw new Error('expected ok');
    const first = t.rows[0];
    expect(first.kind).toBe('original');
    expect(Object.keys(first)).toEqual(['kind', 'text']);
    /* ⛔ no author, no ordinal, no rationale, no focus — it was not authored here */
    expect(JSON.stringify(first)).not.toMatch(/author|ordinal|focused/);
  });

  it('⛔ rationale appears ONLY where its author supplied one, and absent is null', () => {
    const t = editorialThread(CHAIN);
    if (!t.ok) throw new Error('expected ok');
    const vs = t.rows.filter((r) => r.kind === 'version') as Extract<
      typeof t.rows[number], { kind: 'version' }>[];
    expect(vs.map((v) => v.rationale === null)).toEqual([false, true, false]);
    /* ⛔ never coerced to an empty string, which would render "Why" with nothing after it */
    expect(vs.map((v) => v.rationale)).not.toContain('');
  });

  it('⭐⭐ the focused version is EXACTLY the one named, never the head', () => {
    const t = editorialThread(CHAIN);
    if (!t.ok) throw new Error('expected ok');
    const focused = t.rows.filter((r) => r.kind === 'version' && r.focused);
    expect(focused).toHaveLength(1);
    expect((focused[0] as { id: string }).id).toBe('v1');
    /* the head is v3 and is present in the lineage, but it is not the focus */
    const head = t.rows.filter((r) => r.kind === 'version' && (r as { id: string }).id === 'v3');
    expect((head[0] as { focused: boolean }).focused).toBe(false);
  });

  it('⛔ STRUCTURE, NOT CLOCK — a time-ordered list that breaks the links REFUSES', () => {
    /* v2 and v3 swapped: plausible by `authoredAt`, not the authored lineage. */
    const scrambled: ThreadInput = {
      ...CHAIN,
      versions: [CHAIN.versions[0], CHAIN.versions[2], CHAIN.versions[1]],
    };
    expect(editorialThread(scrambled)).toEqual({ ok: false, reason: 'not_structural' });
  });

  it('⛔ a focus this chain does not contain REFUSES — it never falls back to the head', () => {
    expect(editorialThread({ ...CHAIN, focusedVersionId: 'v-other' }))
      .toEqual({ ok: false, reason: 'focus_unknown' });
  });

  it('⭐ a null focus is lawful and focuses nothing — absence is not the head', () => {
    const t = editorialThread({ ...CHAIN, focusedVersionId: null });
    if (!t.ok) throw new Error('expected ok');
    expect(t.rows.filter((r) => r.kind === 'version' && r.focused)).toHaveLength(0);
  });

  it('⭐ a single-version chain still renders as a lineage, not as a card', () => {
    const one = editorialThread({
      ...CHAIN, versions: [CHAIN.versions[0]], focusedVersionId: 'v1' });
    if (!one.ok) throw new Error('expected ok');
    expect(one.rows.map((r) => r.kind)).toEqual(['original', 'version']);
  });

  it('authorship is explicit in the projection, never left to styling', () => {
    expect([authorLabel('maia'), authorLabel('member')]).toEqual(['MAIA', 'You']);
  });
});

describe('W1 · ⛔ what the surface must NOT have acquired', () => {
  it('⛔ no authorization or executability vocabulary, in any spelling', () => {
    for (const body of [SURFACE, MODULE]) {
      expect(body.toLowerCase()).not.toMatch(
        /mayaccept|executionauthority|inspection_only|executable|authoriz/);
    }
  });

  it('⛔ no Insight / Direction / Discourse placeholder before W5', () => {
    /* An empty slot for a missing object teaches the surface a shape the
       ontology has not earned.
       ⚠️ THE FIRST WRITING OF THIS BAN MATCHED `flexDirection` AND FAILED
       AGAINST CORRECT CODE — the mechanism-vs-behaviour slip again, and in a
       ban this time: a word that happens to appear inside a CSS property is not
       an editorial object. Narrowed to the vocabulary a surface would actually
       render, not to substrings. */
    expect(SURFACE).not.toMatch(
      /\bEditorial (intention|intent)\b|\bAsk MAIA\b|\bWhy do you think\b/i);
    expect(SURFACE).not.toMatch(/\bdiscourse\b|\binsight\b/i);
    /* and no editorial Direction as an object — `flexDirection` is not one */
    expect(SURFACE.replace(/flexDirection/g, '')).not.toMatch(/\bdirection\b/i);
  });

  it('⛔ READ-ONLY — no gesture, no write, no fetch of its own', () => {
    expect(SURFACE).not.toMatch(/<button|onClick|onSubmit|<form|<input|<textarea/i);
    expect(SURFACE).not.toMatch(/fetch\(|apiFetch|useState|useEffect/);
  });

  it('⛔ the retired card\'s non-act and its wall of apology are both gone', () => {
    expect(SURFACE).not.toMatch(/KEEP UNCHANGED|for inspection|cannot be applied/i);
    /* ⭐ replaced by the one sentence that is structurally true */
    expect(SURFACE).toMatch(/Nothing changes until you explicitly adopt a version\./);
  });

  it('⛔ a count never stands where the wording belongs', () => {
    expect(SURFACE).not.toMatch(/describes \d|1 change|changes to the manuscript/i);
  });

  it('⛔ no chain-level "MAIA thinks" manufactured out of a version rationale', () => {
    /* rationale is read from the row it belongs to, and from nowhere else */
    expect((MODULE.match(/rationale/g) ?? []).length).toBeGreaterThan(0);
    expect(MODULE).not.toMatch(/versions\[0\]\.rationale|rationale.*chain|chainRationale/);
  });
});
