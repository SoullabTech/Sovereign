/**
 * COVERAGE-DERIVED ADMISSION OF NON-CONCLUSIONS — the eight predeclared
 * falsifiers. Founder ruling 2026-09-11; design record
 * `docs/programme/READING_COVERAGE_DERIVED_ADMISSION_DESIGN_2026-09-11.md`.
 *
 *   ⭐⭐ Do not state an epistemic limitation whose prerequisite condition is
 *      known not to exist.
 *
 * THE LAW, NARROWLY: `across-unread-span` may be admitted only when the
 * CLAIM'S OWN derived unread span is non-empty. Not reading-wide coverage,
 * not prompt instruction, not model discretion — `unreadSpan(bound, evidence)`
 * is the authority because it answers at the correct granularity.
 *
 * ⛔ N1 ALONE IS WORTHLESS. It is passed by a reading-scope check, by a prompt
 * instruction, and by deleting the tag from the vocabulary. N2 + N3 + N6 + N7
 * + N8 are what distinguish the actual repair from all three impostors, and
 * they were written before the implementation existed.
 */

import { evidenceAtRev1 } from '../../development/__tests__/fixture';
import { unreadSpan, bindEvidence } from '../../development/bind';
import { recoverEvidence } from '../../development/resolve';
import type { DevelopmentalEvidence } from '../../development/readState';
import type { StructuredBlock } from '../../../ai/structured/types';
import {
  CAUSE_UNKNOWN, DEVELOPMENTAL_NON_CONCLUSIONS, NON_CONCLUSION_MEANING,
  type DevelopmentalReaderRequest, type RecoveredBody,
} from '../contract';
import { promptContractHash, READER_SYSTEM, readerTool, TOOL_NAME } from '../render';
import { readerIdentity, resultFromBlocks } from '../read';

/* ── fixture plumbing ────────────────────────────────────────────────────── */

function recoveredFor(evidence: DevelopmentalEvidence, revisionContent: string): RecoveredBody[] {
  return Object.entries(evidence.coverage.sections)
    .filter(([, depth]) => depth === 'body')
    .map(([sectionId]) => {
      const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, revisionContent);
      if (!r.ok || r.value.kind !== 'text') throw new Error(`fixture recover failed: ${JSON.stringify(r)}`);
      return r.value;
    });
}

/** `bodyScope` undefined in the fixture means every section at body depth. */
function request(bodyScope?: readonly string[]) {
  const { revision, evidence } = evidenceAtRev1({ bodyScope });
  const req: DevelopmentalReaderRequest = {
    commissionedLens: 'development',
    evidence,
    recovered: recoveredFor(evidence, revision.content),
  };
  return { req, evidence };
}

const FULL = ['s0', 's1', 's2', 's3'] as const;
const IDENTITY = readerIdentity('claude-test-model');
const call = (input: unknown): StructuredBlock => ({ type: 'tool_use', id: 't1', name: TOOL_NAME, input });

const claim = (refs: unknown[], doesNotEstablish: string[]) =>
  ({ text: 'Something is noticed here.', refs, doesNotEstablish });

/** The whole ordered run — binds over any depth, so it is the honest "spans everything" ref. */
const WHOLE_RUN = [{ kind: 'section-run', sectionIds: [...FULL] }];
/** Two adjacent sections that the default fixture scope reads at body depth. */
const READ_ONLY_REFS = [{ kind: 'section', sectionId: 's0' }, { kind: 'section', sectionId: 's1' }];

function outcomeOf(req: DevelopmentalReaderRequest, claims: unknown[]) {
  const r = resultFromBlocks([call({ outcome: 'claims', claims })], req, IDENTITY);
  return r.outcome === 'refused' ? `${r.refusal}:${r.index}` : r.outcome;
}

/* ── the fixture's own premises, asserted before anything depends on them ─── */

describe('the fixture states what the falsifiers assume', () => {
  it('full coverage reads every section at body depth; the default scope does not', () => {
    const full = request(FULL).evidence;
    expect(Object.values(full.coverage.sections)).toEqual(['body', 'body', 'body', 'body']);
    const partial = request().evidence;
    expect(partial.coverage.sections.s2).toBe('position');
    expect(partial.coverage.sections.s3).toBe('position');
  });

  it('unreadSpan answers per claim, and the two fixtures disagree as the falsifiers require', () => {
    const bindRun = (e: DevelopmentalEvidence) => {
      const b = bindEvidence(WHOLE_RUN as never, e);
      if (!b.ok) throw new Error(`fixture bind failed: ${b.refusal}`);
      return unreadSpan(b.value, e);
    };
    expect(bindRun(request(FULL).evidence)).toEqual([]);              // nothing unread anywhere
    expect(bindRun(request().evidence)).toEqual(['s2', 's3']);        // a real interval, named
  });
});

/* ── N1 ──────────────────────────────────────────────────────────────────── */

describe('N1 · full coverage, claim spans read material, tag present → inadmissible', () => {
  it('refuses the whole output and names the claim', () => {
    const { req } = request(FULL);
    expect(outcomeOf(req, [claim(WHOLE_RUN, ['across-unread-span'])]))
      .toBe('non_conclusion_inapplicable:0');
  });

  it('an earlier admissible claim does not rescue a later inapplicable one', () => {
    const { req } = request(FULL);
    expect(outcomeOf(req, [
      claim(READ_ONLY_REFS, ['author-intent']),
      claim(WHOLE_RUN, ['across-unread-span', 'author-intent']),
    ])).toBe('non_conclusion_inapplicable:1');
  });
});

/* ── N2 · THE ANTI-OVERREACH FALSIFIER ───────────────────────────────────── */

describe('N2 · partial coverage, span contains a position-only section → ADMITTED, unchanged', () => {
  it('a lawful unread-span limitation is never refused', () => {
    const { req } = request();
    expect(outcomeOf(req, [claim(WHOLE_RUN, ['across-unread-span'])])).toBe('claims');
  });

  it('the admitted claim keeps the tag verbatim — nothing was stripped or substituted', () => {
    const { req } = request();
    const r = resultFromBlocks(
      [call({ outcome: 'claims', claims: [claim(WHOLE_RUN, ['across-unread-span', 'author-intent'])] })],
      req, IDENTITY);
    if (r.outcome !== 'claims') throw new Error(r.outcome);
    expect(r.claims[0].doesNotEstablish).toEqual(['across-unread-span', 'author-intent']);
  });
});

/* ── N3 · PROVES THE GRANULARITY ─────────────────────────────────────────── */

describe('N3 · partial coverage, claim wholly inside read material → inadmissible', () => {
  it('the check is PER CLAIM: a reading-scope implementation passes N1 and fails here', () => {
    const { req } = request();
    /* Global coverage is partial — s2 and s3 are unread. A reading-scope test
       would admit the tag on every claim of this reading. This claim's own
       span is s0..s1, read in full, so the limitation is false OF IT. */
    expect(outcomeOf(req, [claim(READ_ONLY_REFS, ['across-unread-span'])]))
      .toBe('non_conclusion_inapplicable:0');
  });

  it('⭐ one reading lawfully carries both a true and a false unread-span claim, and refuses for the false one', () => {
    const { req } = request();
    expect(outcomeOf(req, [
      claim(WHOLE_RUN, ['across-unread-span']),        // lawful
      claim(READ_ONLY_REFS, ['across-unread-span']),   // false
    ])).toBe('non_conclusion_inapplicable:1');
  });
});

/* ── N4 ──────────────────────────────────────────────────────────────────── */

describe('N4 · tag absent, any coverage → untouched. No tag is ever ADDED', () => {
  it('admits at full coverage and at partial, and adds nothing', () => {
    for (const scope of [FULL, undefined]) {
      const { req } = request(scope);
      const r = resultFromBlocks(
        [call({ outcome: 'claims', claims: [claim(WHOLE_RUN, ['author-intent'])] })], req, IDENTITY);
      if (r.outcome !== 'claims') throw new Error(`${scope ? 'full' : 'partial'}: ${r.outcome}`);
      expect(r.claims[0].doesNotEstablish).toEqual(['author-intent']);
    }
  });
});

/* ── N5 · THE SCOPE HELD ─────────────────────────────────────────────────── */

describe('N5 · the other seven non-conclusions are untouched, including at 262/262', () => {
  it('every non-conclusion except across-unread-span is admitted at FULL coverage', () => {
    const { req } = request(FULL);
    for (const v of DEVELOPMENTAL_NON_CONCLUSIONS) {
      if (v === 'across-unread-span') continue;
      expect(`${v}: ${outcomeOf(req, [claim(WHOLE_RUN, [v])])}`).toBe(`${v}: claims`);
    }
  });

  it('⭐ full coverage does NOT authorize whole-Work claims — whole-work-pattern is not derived from 262/262', () => {
    const { req } = request(FULL);
    /* The tempting generalization, refused explicitly: a repair that decided
       "coverage is complete, therefore a whole-Work pattern IS established"
       would refuse this tag. That is an epistemic ruling, not a runtime fact,
       and it has not been made. The same for `outside-coverage`, whose bound
       is not settled either. */
    expect(outcomeOf(req, [claim(WHOLE_RUN, ['whole-work-pattern'])])).toBe('claims');
    expect(outcomeOf(req, [claim(WHOLE_RUN, ['outside-coverage'])])).toBe('claims');
  });
});

/* ── N6 · THE MODEL WAS NOT TAUGHT TO SELF-CENSOR ────────────────────────── */

describe('N6 · the prompt contract did not move', () => {
  it('the system prompt and tool schema name no coverage condition on any non-conclusion', () => {
    /* The ruling is that this is NOT the model's choice. A prompt instruction
       would be the cheaper fix and the wrong one: it moves a system fact back
       into interpretation, and it is unfalsifiable — a model that complies and
       a model that happens not to emit the tag are indistinguishable. */
    expect(READER_SYSTEM).not.toMatch(/only (?:use|state|include)[^.]{0,40}across-unread-span/i);
    expect(READER_SYSTEM).not.toMatch(/if[^.]{0,60}(?:fully|completely) read/i);
    expect(READER_SYSTEM).not.toMatch(/unread span|unreadSpan/i);
    expect(JSON.stringify(readerTool())).not.toMatch(/unread span|unreadSpan/i);
  });

  it('the tag still reaches the model exactly as one of the eight, with nothing attached', () => {
    expect(READER_SYSTEM).toContain('across-unread-span');
    expect(JSON.stringify(readerTool().input_schema)).toContain('"across-unread-span"');
    expect(promptContractHash()).toBe(promptContractHash());
  });
});

/* ── N7 · THE VOCABULARY WAS NOT EDITED ──────────────────────────────────── */

describe('N7 · the vocabulary and its ratified meanings are unchanged', () => {
  it('the eight remain, in order, with across-unread-span among them', () => {
    expect([...DEVELOPMENTAL_NON_CONCLUSIONS]).toEqual([
      'outside-coverage', 'across-unread-span', 'whole-work-pattern', 'authored-structure-relation',
      'chronology', 'author-intent', 'reader-effect', 'editorial-consequence',
    ]);
  });

  it('the tag was not made unrepresentable, and its meaning was not reworded', () => {
    /* ⭐ The tag is not wrong. Its APPLICATION was. Deleting it from the
       vocabulary would pass N1 while destroying a limitation that is true and
       necessary whenever a reading is partial. */
    expect(NON_CONCLUSION_MEANING['across-unread-span'])
      .toBe('absence or continuity across an unread interval is not established');
  });
});

/* ── attribution · the refusal is the model's, however the response ended ── */

describe('the new refusal is an AFFIRMATIVE violation under R-1', () => {
  it('stays the model\'s conduct even when the response was truncated', () => {
    /* Truncation removes text; it cannot ADD a limitation the evidence does
       not license. A cut-off response carrying an inapplicable tag carried it
       before it was cut — so this refusal follows the violation, not the
       completion, exactly like `non_conclusion_unknown` beside it. */
    const { req } = request(FULL);
    const r = resultFromBlocks(
      [call({ outcome: 'claims', claims: [claim(WHOLE_RUN, ['across-unread-span'])] })], req, IDENTITY,
      { ...CAUSE_UNKNOWN, completion: 'truncated', stopReason: 'max_tokens' });
    if (r.outcome !== 'refused') throw new Error(r.outcome);
    expect(r.refusal).toBe('non_conclusion_inapplicable');
    expect(r.cause.completion).toBe('truncated');
    expect(r.cause.attribution).toBe('contract_violation');
  });
});

/* ── N8 · THE ORACLE WAS WIRED, NOT REWRITTEN ────────────────────────────── */

describe('N8 · unreadSpan is unchanged, and remains derived rather than stored', () => {
  it('its ratified behaviours still hold (INV-9)', () => {
    /* ⭐ A repair that edits the oracle to make its new caller pass has tested
       nothing. These are bind.test.ts's own cases, restated here so that this
       lane fails if a future session "helps" unreadSpan agree with it. */
    const { evidence } = evidenceAtRev1({ bodyScope: ['s0', 's1'] });
    const span = (refs: unknown[]) => {
      const b = bindEvidence(refs as never, evidence);
      if (!b.ok) throw new Error(b.refusal);
      return unreadSpan(b.value, evidence);
    };
    expect(span([{ kind: 'section-run', sectionIds: ['s1', 's2', 's3'] }])).toEqual(['s2', 's3']);
    expect(span([{ kind: 'section', sectionId: 's0' }])).toEqual([]);
  });

  it('the evidence object carries no unread-span field for anything to disagree with', () => {
    const { evidence } = request();
    expect(Object.keys(evidence).sort()).toEqual(['coverage', 'readState']);
    expect(Object.keys(evidence.coverage)).toEqual(['sections']);
  });
});
