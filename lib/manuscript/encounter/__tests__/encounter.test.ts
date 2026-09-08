/**
 * WS2-ENCOUNTER-01 · E2 — F1–F13 and P1–P6.
 *
 * Evidence class A: the executable structural falsifiers. Class B, the semantic
 * ear, is a retained corpus adjudicated by a person — asserted here only for its
 * retention and its honest limits, never as a deterministic verdict.
 */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { screenCandidate } from '../vocabulary';
import { traverseWhole } from '../traversal';
import { encounter, captureDraft, anchorMatches, anchorsAreCurrent, silentGenerator } from '../read';
import { ENCOUNTER_FAMILIES, isEncounterFamily } from '../contract';
import { SEMANTIC_EAR_CORPUS } from '../semanticEar';
import type { CandidateNotice, EncounterSnapshot } from '../contract';

const REPO = join(__dirname, '../../../..');
const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

const TEXT = [
  'The house stood at the edge of the water.',
  'Every threshold in the book is wet.',
  'She left the room without saying anything.',
  'The question the prologue asked was never asked in the same words.',
].join('\n\n');

const anchorFor = (text: string, phrase: string) => {
  const points = Array.from(text);
  const start = text.indexOf(phrase);
  const pre = Array.from(text.slice(0, start)).length;
  return {
    startCodePoint: pre,
    endCodePoint: pre + Array.from(phrase).length,
    spanDigest: sha256(points.slice(pre, pre + Array.from(phrase).length).join('')),
  };
};

const candidate = (text: string, family = 'recurrence'): CandidateNotice => ({
  family,
  text,
  anchors: [anchorFor(TEXT, 'Every threshold in the book is wet.')],
});

/** A generator that proposes exactly what a test hands it. */
const proposing = (...cs: CandidateNotice[]) => async () => cs;

/** The act, with the database stubbed at the capture seam. */
jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
const { query } = require('@/lib/db/postgres');

function draftExists(content = TEXT, version = 3) {
  (query as jest.Mock).mockResolvedValue({ rows: [{ id: 'draft-1', content, version: String(version) }] });
}
function noDraft() {
  (query as jest.Mock).mockResolvedValue({ rows: [] });
}

beforeEach(() => (query as jest.Mock).mockReset());

describe('F1–F5 · the observation must not be developmental', () => {
  it('F1 an evaluative observation is not emitted', async () => {
    draftExists();
    const r = await encounter('m', 'mem', proposing(candidate('The middle is underdeveloped.')));
    expect(r.ok && r.notices).toEqual([]);
  });

  it('F2 a prescription or intervention consequence is not emitted', async () => {
    draftExists();
    const r = await encounter('m', 'mem', proposing(
      candidate('Water appears at every threshold, so you could make more of it.'),
    ));
    expect(r.ok && r.notices).toEqual([]);
  });

  it('F3 unbounded / checklist absence is not emitted, while bounded non-return is', () => {
    /* A2. The distinction is not positive vs negative grammar — it is absence
       against an expected standard vs non-return of something established. */
    expect(screenCandidate(candidate('The Work has no recurring images.'))).toContain('unbounded_absence');
    expect(screenCandidate(candidate('The book never resolves its central problem.')).length).toBeGreaterThan(0);
    expect(screenCandidate(candidate(
      'This image appears in chapters 2 and 4 and does not recur afterward.',
    ))).toEqual([]);
  });

  it('F4 comparative quality, including rarity-as-value, is not emitted', () => {
    /* A1: praise establishes a scale, and a scale has a bottom. */
    expect(screenCandidate(candidate('This is the strongest section.'))).toContain('comparative_quality');
    expect(screenCandidate(candidate('The sentences shorten here, and nowhere else.'))).toContain('comparative_quality');
    expect(screenCandidate(candidate('This is a beautiful recurring image.'))).toContain('comparative_quality');
  });

  it('F5 the act imports nothing from DEVELOP — a diagnosis through a tone filter is a diagnosis', () => {
    const files = readdirSync(join(REPO, 'lib/manuscript/encounter'))
      .filter((f) => f.endsWith('.ts'))
      .map((f) => readFileSync(join(REPO, 'lib/manuscript/encounter', f), 'utf8'));
    for (const src of files) {
      expect(src).not.toMatch(/from '[^']*developmentalReader/);
      expect(src).not.toMatch(/from '[^']*developmentalReading/);
    }
  });

  it('F5 a reader-effect claim — the DEVELOP `reader` lens question — is not emitted', () => {
    expect(screenCandidate(candidate('Here the reader may lose orientation.'))).toContain('reader_effect');
  });
});

describe('F6–F7 · anchoring and authorship', () => {
  it('F6 an unanchored MAIA observation is not emitted', async () => {
    draftExists();
    const r = await encounter('m', 'mem', proposing({ family: 'recurrence', text: 'Water recurs.', anchors: [] }));
    expect(r.ok && r.notices).toEqual([]);
  });

  it('F6 an anchor whose span no longer hashes to its claim is not emitted', async () => {
    draftExists();
    const bad = { ...candidate('Water recurs at thresholds.') };
    const r = await encounter('m', 'mem', proposing({
      ...bad,
      anchors: [{ ...bad.anchors[0], spanDigest: sha256('something else') }],
    }));
    expect(r.ok && r.notices).toEqual([]);
  });

  it('F7 recollection cannot be selected as a MAIA family', () => {
    /* A5, at the type boundary: it is not in the enum, so it is not available. */
    expect(isEncounterFamily('recollection')).toBe(false);
    expect(ENCOUNTER_FAMILIES).not.toContain('recollection' as never);
    expect(screenCandidate(candidate('She remembered the funeral.', 'recollection')))
      .toContain('recollection_as_notice');
  });

  it('F7 the act never manufactures a recollection of its own', async () => {
    draftExists();
    const r = await encounter('m', 'mem', proposing(candidate('Water recurs at thresholds.')));
    /* The writer's own return enters through the writer, never through the read. */
    expect(r.ok && r.recollections).toEqual([]);
  });

  it('F7 no shared record lets one authorship class masquerade as the other', () => {
    const src = readFileSync(join(REPO, 'lib/manuscript/encounter/contract.ts'), 'utf8');
    /* A presentation union is fine; a common semantic supertype is not. */
    expect(src).toMatch(/export type EncounterItem = MaiaNotice \| WriterRecollection/);
    expect(src).not.toMatch(/interface\s+EncounterObservation/);
    expect(src).not.toMatch(/extends\s+(MaiaNotice|WriterRecollection)/);
  });
});

describe('F8–F9 · nothing is remembered, nothing is carried', () => {
  it('F8 a successful Encounter writes nothing', async () => {
    draftExists();
    await encounter('m', 'mem', proposing(candidate('Water recurs at thresholds.')));
    for (const call of (query as jest.Mock).mock.calls) {
      expect(String(call[0])).toMatch(/^\s*SELECT/i);
    }
  });

  it('F8 no encounter table, no store, no freeze anywhere in the module', () => {
    const dir = join(REPO, 'lib/manuscript/encounter');
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.ts'))) {
      const src = readFileSync(join(dir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
      expect(src).not.toMatch(/INSERT INTO|UPDATE\s+\w+\s+SET|DELETE FROM/i);
    }
  });

  it('F9 nothing the act produces is reachable by a later intention act', () => {
    /* True by construction while nothing is stored — asserted anyway, so a later
       persistence design cannot quietly acquire carry-forward. */
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        if (name === 'node_modules' || name === '.next') continue;
        const full = join(dir, name);
        if (statSync(full).isDirectory()) walk(full);
        /* Exclude the module itself, NOT every path containing "encounter" —
           the first draft of this test excluded its own route by accident and
           passed with an empty offender list, proving nothing. */
        else if (/\.tsx?$/.test(name) && !/__tests__/.test(full)
                 && !full.includes(join('lib', 'manuscript', 'encounter'))) {
          const src = readFileSync(full, 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
          if (/from '[^']*manuscript\/encounter/.test(src)) offenders.push(full.slice(REPO.length + 1));
        }
      }
    };
    walk(join(REPO, 'lib'));
    walk(join(REPO, 'app'));
    /* Only the route may reach the act. */
    expect(offenders).toEqual(['app/api/sovereign/manuscripts/[id]/encounter/route.ts']);
  });
});

describe('F10–F13 · substrate honesty', () => {
  it('F10 an Encounter does not require hierarchy', async () => {
    draftExists();
    const r = await encounter('m', 'mem', silentGenerator);
    expect(r.ok).toBe(true);
    const sql = String((query as jest.Mock).mock.calls[0][0]);
    expect(sql).not.toMatch(/section_addressable_at|manuscript_sections|structure/i);
  });

  it('F11 no Working Draft is a REFUSAL, and Source is not read in its place', async () => {
    noDraft();
    const r = await encounter('m', 'mem', silentGenerator);
    expect(r).toEqual({ ok: false, refusal: 'not_readable' });
    for (const call of (query as jest.Mock).mock.calls) {
      expect(String(call[0])).not.toMatch(/manuscript_source_arrivals/i);
    }
  });

  it('F12 the traversal covers the Work whole, or says it did not', () => {
    const long = 'x'.repeat(50_000);
    const t = traverseWhole(long, { windowSize: 1000, overlap: 100 });
    expect(t.complete).toBe(true);
    const covered = t.windows.reduce((n, w) => n + (w.endCodePoint - w.startCodePoint), 0);
    expect(covered).toBe(50_000);
    /* Windows are transport mechanics, never structure. */
    expect(Object.keys(t.windows[0])).not.toContain('heading');
  });

  it('F12 astral characters are counted in code points, so anchors cannot drift', () => {
    const t = traverseWhole('a🌊b🌊c', { windowSize: 2, overlap: 0 });
    expect(t.complete).toBe(true);
    expect(t.windows.reduce((n, w) => n + (w.endCodePoint - w.startCodePoint), 0)).toBe(5);
  });

  it('F13 an anchor taken against one snapshot cannot silently claim another', () => {
    const taken: EncounterSnapshot = {
      draftId: 'd', manuscriptId: 'm', revisionNumber: 3,
      wholeDraftDigest: sha256(TEXT), length: Array.from(TEXT).length,
    };
    expect(anchorsAreCurrent(taken, sha256(TEXT))).toBe(true);
    expect(anchorsAreCurrent(taken, sha256(`${TEXT} and one more line`))).toBe(false);
    /* The digest is the authority — a revision counter alone cannot notice a
       restore that reuses its number. */
    expect(anchorsAreCurrent({ ...taken, revisionNumber: 3 }, sha256('different'))).toBe(false);
  });
});

describe('P1–P6 · what Encounter is allowed to be', () => {
  it('P1 zero observations is a complete success, with no message', async () => {
    draftExists();
    const r = await encounter('m', 'mem', silentGenerator);
    expect(r).toMatchObject({ ok: true, notices: [] });
    expect(JSON.stringify(r)).not.toMatch(/nothing|no observations|could not|didn't notice/i);
  });

  it('P2 bounded OPENNESS passes', () => {
    expect(screenCandidate(candidate(
      'The question introduced in the prologue is not taken up again in the remaining text.',
      'openness',
    ))).toEqual([]);
  });

  it('P3 a distributed-anchor synthesis passes', async () => {
    draftExists();
    const r = await encounter('m', 'mem', proposing({
      family: 'preoccupation',
      text: 'This book returns to what happens after someone leaves a room.',
      anchors: [
        anchorFor(TEXT, 'She left the room without saying anything.'),
        anchorFor(TEXT, 'The house stood at the edge of the water.'),
      ],
    }));
    expect(r.ok && r.notices).toHaveLength(1);
    expect(r.ok && r.notices[0].anchors).toHaveLength(2);
  });

  it('P4 a WriterRecollection stays writer-authored and is never converted', () => {
    /* Keeping is out of E2, so this proves authorship preservation, NOT
       persistence — the act does not pretend to a capability it does not have. */
    const rec = { authoredBy: 'writer' as const, writerText: 'I had forgotten when this was written.', saidAt: 'now' };
    expect(rec.authoredBy).toBe('writer');
    expect(rec).not.toHaveProperty('family');
    expect(rec).not.toHaveProperty('anchors');
    expect(screenCandidate({ family: 'recurrence', text: rec.writerText, anchors: [] }))
      .toContain('unanchored');
  });

  it('P5 a descriptive relation passes', () => {
    expect(screenCandidate(candidate(
      'When water appears, the narration shifts into the present tense.',
    ))).toEqual([]);
  });

  it('P6 a draft with no sections encounters normally', async () => {
    draftExists('One paragraph, never segmented.');
    const r = await encounter('m', 'mem', silentGenerator);
    expect(r.ok).toBe(true);
  });
});

describe('the semantic ear — acceptance evidence, not a machine verdict', () => {
  it('the corpus is retained, and carries FG-1 and FG-2', () => {
    expect(SEMANTIC_EAR_CORPUS.length).toBeGreaterThanOrEqual(6);
    expect(SEMANTIC_EAR_CORPUS.some((e) => /waiting for it/.test(e.text) && e.verdict === 'unlawful')).toBe(true);
    expect(SEMANTIC_EAR_CORPUS.some((e) => /could open further/.test(e.text) && e.verdict === 'unlawful')).toBe(true);
  });

  it('the structural screen agrees with the corpus wherever it claims to', () => {
    for (const e of SEMANTIC_EAR_CORPUS) {
      const violations = screenCandidate(candidate(e.text, 'recurrence'));
      if (e.verdict === 'lawful') expect(violations).toEqual([]);
      else if (e.structurallyCaught) expect(violations.length).toBeGreaterThan(0);
    }
  });

  it('⚠ and the corpus records where the mechanical instrument STOPS', () => {
    /* The honest half. At least one unlawful entry is NOT structurally caught,
       and the file says so rather than implying the lexicon reaches further than
       it does. Automating this adjudication later would need its own negative
       controls before its verdict could carry release authority. */
    const uncaught = SEMANTIC_EAR_CORPUS.filter((e) => e.verdict === 'unlawful' && !e.structurallyCaught);
    expect(uncaught.length).toBeGreaterThanOrEqual(1);
    for (const e of uncaught) {
      expect(screenCandidate(candidate(e.text, 'recurrence'))).toEqual([]);
    }
  });
});
