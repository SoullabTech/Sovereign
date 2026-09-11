/**
 * RC-GEN-01 · 3A-P — PROTOCOL acceptance. Automated and falsifiable.
 *
 * ⛔ Nothing here judges editorial quality. "Reduces abstraction", "is genuinely
 * concrete", "this fixture deserves no_change" are semantic judgements and belong
 * to 3A-S, witnessed by a person against a pinned rubric. Turning them into
 * keyword tests — or into a second model judging the first — would produce a
 * confident number about nothing.
 */
import {
  revisionSystemPrompt,
  REVISION_ASKER_VERSION,
  type AuthorizedSection,
} from '../lib/manuscript/revision/generate';
import { REVISION_TOOL_NAME, revisionToolSchema } from '../lib/manuscript/revision/outcome';

const S1 = '11111111-1111-1111-1111-111111111111';
const S2 = '22222222-2222-2222-2222-222222222222';
const SECTIONS: AuthorizedSection[] = [
  { sectionId: S1, label: 'A Vivid Dream — Section 13', text: 'It was a knowledge that arrived already complete.' },
  { sectionId: S2, label: 'Aether — Section 184', text: 'Am I fit enough? Am I worthy of the journey?' },
];

describe('⭐ one assembly — the falsifier reads what production sends', () => {
  it('the prompt is a single exported function, not rebuilt for tests', () => {
    expect(typeof revisionSystemPrompt).toBe('function');
    expect(revisionSystemPrompt(SECTIONS)).toBe(revisionSystemPrompt(SECTIONS));
  });
});

describe('⭐ RC-07a — restraint is stated as a complete answer', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('says a revision request is not an instruction to change', () => {
    expect(p).toContain('A REQUEST FOR REVISION IS NOT AN INSTRUCTION TO CHANGE SOMETHING');
  });
  it('names no_change as correct, not as a failure', () => {
    expect(p).toContain('no_change');
    expect(p).toContain('not a failure to help');
  });
  it('forbids manufacturing a change', () => {
    expect(p).toContain('Do not manufacture a change');
  });
});

describe('⭐ proposal authority, not write authority', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('states plainly that nothing it returns alters the manuscript', () => {
    expect(p).toContain('YOU MAY PROPOSE. YOU MAY NOT CHANGE ANYTHING.');
    expect(p).toContain('Nothing you return alters');
  });
  it('tells her the writer decides', () => {
    expect(p).toContain('the writer, who decides');
  });
});

describe('⛔ the prompt carries exactly the authorized sections', () => {
  it('includes every authorized section id and its text', () => {
    const p = revisionSystemPrompt(SECTIONS);
    for (const s of SECTIONS) {
      expect(p).toContain(s.sectionId);
      expect(p).toContain(s.text);
      expect(p).toContain(s.label);
    }
  });

  it('⭐ carries NO prose beyond the sections it was given', () => {
    const unauthorized = 'The campfire scene is narrated three times.';
    const p = revisionSystemPrompt(SECTIONS);
    expect(p).not.toContain(unauthorized);
  });

  it('an empty authorization carries no section prose at all', () => {
    const p = revisionSystemPrompt([]);
    for (const s of SECTIONS) expect(p).not.toContain(s.text);
  });

  it('narrowing the authorization narrows the prompt', () => {
    const only1 = revisionSystemPrompt([SECTIONS[0]]);
    expect(only1).toContain(SECTIONS[0].text);
    expect(only1).not.toContain(SECTIONS[1].text);
    expect(only1).not.toContain(S2);
  });
});

describe('⛔ the answer channel is the tool, and it is named', () => {
  it('the prompt names the tool as the only answer channel', () => {
    const p = revisionSystemPrompt(SECTIONS);
    expect(p).toContain(`Answer only through the ${REVISION_TOOL_NAME} tool`);
    expect(p).toContain('Prose outside it is not an answer');
  });

  it('the schema forbids extra fields at every level', () => {
    expect(revisionToolSchema.additionalProperties).toBe(false);
    expect((revisionToolSchema.properties as any).proposals.items.additionalProperties).toBe(false);
  });
});

describe('⭐ voice is protected in the instruction, not only in review', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('tells her to preserve the claim and revise expression', () => {
    expect(p).toContain('preserve what the passage claims');
  });
  it('names the writer\'s rhythm and vocabulary as not defects', () => {
    expect(p).toContain('not defects to correct');
  });
  it('scopes the change to what was asked about', () => {
    expect(p).toContain('leave the rest of their language alone');
  });
});

describe('⭐ the R3 repair — concreteness may not be purchased by substitution', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('names the hard limit', () => {
    expect(p).toContain('MAKING PROSE CONCRETE HAS A HARD LIMIT');
  });
  it('forbids each substitution the 3A-S run 1 failure exhibited', () => {
    expect(p).toContain('narrowing, collapsing, dramatizing, psychologizing');
    expect(p).toContain('not present in the authorized text');
  });
  it('forbids collapsing two claims into one — the relational/perception loss', () => {
    expect(p).toContain('Two distinct');
    expect(p).toContain('must not become one');
  });
  it('forbids implying a history or condition the passage does not state — the "putting himself back together" loss', () => {
    expect(p).toContain('implies a');
    expect(p).toContain('the passage does not state');
  });
  it('⭐ offers the lawful exit: plainer and faithful over vivid and altered', () => {
    expect(p).toContain('PRESERVE ITS MEANING IN PLAINER LANGUAGE');
    expect(p).toContain('Plainer and faithful is a better answer than vivid and altered');
  });
});

describe('⭐ the geometry repair — relations, not only claims (3A-S run 2 FAIL)', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('names the obligation', () => {
    expect(p).toContain('PRESERVE THE RELATIONS BETWEEN CLAIMS, NOT ONLY THE CLAIMS THEMSELVES');
  });
  it('says that keeping every claim while flattening relations is still a loss', () => {
    expect(p).toContain('flattening the');
    expect(p).toContain('relations between them is still a loss of meaning');
  });
  it('forbids equating a result with its cause — the "that change" collapse', () => {
    expect(p).toContain('RESULTS FROM another, do not write them as the same thing');
  });
  it('forbids weakening a constitutive relation — the "mattered to" loss', () => {
    expect(p).toContain('IS PART OF a process, do not weaken it to merely mattering');
  });
  it('constrains the demonstrative that caused the collapse', () => {
    expect(p).toContain('must point at exactly one thing');
    expect(p).toContain('keep them distinguished');
  });
  it('⭐ permits two sentences rather than forcing the geometry into one', () => {
    expect(p).toContain('Two sentences that keep the geometry beat one');
  });
});

describe('⭐ the valence repair — no teleology the source did not state (run 3 FAIL)', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('names the obligation', () => {
    expect(p).toContain('DO NOT ADD VALENCE, DIRECTION, TELEOLOGY OR PSYCHOLOGICAL CONDITION');
  });
  it('says a plainer word can still claim more', () => {
    expect(p).toContain('A word can be plainer and still claim more');
  });
  it('separates significance from approval, and change from progress', () => {
    expect(p).toContain('Significance is not approval');
    expect(p).toContain('Change is not improvement');
  });
  it('⭐ refuses the blacklist reading explicitly', () => {
    expect(p).toContain('examples of a SHAPE, not a list of forbidden words');
    expect(p).toContain('does my wording assert a direction, a value');
  });
  it('requires neutrality where the source is neutral', () => {
    expect(p).toContain('If the source is neutral about');
    expect(p).toContain('your revision must be neutral too');
  });
  it('⛔ does NOT blacklist the phrase that failed run 3', () => {
    expect(p).not.toContain('step forward');
    expect(p).not.toContain('working through');
  });
});

describe('⭐ the simultaneity law — run 4 regressed a repaired axis', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('subordinates plainness to fidelity, and says which is the constraint', () => {
    expect(p).toContain('PLAINNESS IS SUBORDINATE TO FIDELITY');
    expect(p).toContain('Fidelity is the constraint; plainness is the goal');
  });
  it('⭐ names the failure mode: obeying one constraint by breaking another', () => {
    expect(p).toContain('not constraints to satisfy one at a time');
    expect(p).toContain('traded one loss for');
  });
  it('requires a check against the source BEFORE answering', () => {
    expect(p).toContain('Before you answer, read your proposal against the source');
    expect(p).toContain('survive together');
  });
  it('enumerates every axis a run has lost so far, plus their absences', () => {
    expect(p).toContain('what each one is in relation TO');
    expect(p).toContain('every relation the source draws between them');
    expect(p).toContain('every degree of significance');
    expect(p).toContain('including their absence');
    expect(p).toContain('including the absence of one');
  });
  it('⭐ gives the tie-break explicitly rather than leaving it implied', () => {
    expect(p).toContain('keep them all and');
    expect(p).toContain('make it less plain');
  });
  it('⛔ still does not blacklist any phrase a run produced', () => {
    for (const phrase of ['step forward', 'working through', 'that change in how he saw']) {
      expect(p).not.toContain(phrase);
    }
  });
});

describe('⭐ the structural framing — a passage is a structure (run 5 FAIL)', () => {
  const p = revisionSystemPrompt(SECTIONS);
  it('states that a passage is a structure, not a set of claims', () => {
    expect(p).toContain('A PASSAGE IS A STRUCTURE, NOT A SET OF CLAIMS');
  });
  it('requires the structure to be worked out BEFORE rewriting', () => {
    expect(p).toContain('Before you rewrite anything, work');
    expect(p).toContain('name the relation the source draws between each pair');
  });
  it('⭐ carries the governing line', () => {
    expect(p).toContain('PLAINNESS MAY ALTER THE VOCABULARY. IT MAY NOT DROP AN EDGE');
  });
  it('⭐ names run 5\'s exact failure shape — connected becomes side by side', () => {
    expect(p).toContain('your revision merely places side by side, is a loss');
    expect(p).toContain('even when both things are still present and nothing false has been added');
  });
  it('requires the KIND of relation, not merely that one exists', () => {
    expect(p).toContain('every relation the source draws between them, and its KIND');
  });
});

describe('⛔ the prompt teaches the LAW, never the fixture', () => {
  /* Rendered with NO sections, so the authorized prose cannot mask a leak. */
  const bare = revisionSystemPrompt([]);
  it('contains no fixture SENTENCE or phrase from either specimen', () => {
    for (const w of ['perspective', 'natural world', 'kettle', 'coffee', 'Mara',
                     'relational orientation', 'step forward', 'working through']) {
      expect(bare.toLowerCase()).not.toContain(w.toLowerCase());
    }
  });

  /* ⚠️ KNOWN EXPOSURE, recorded rather than hidden. Two of the founder-ratified
     valence pairs — `ongoing is not struggling` and `integration is not repair` —
     use specimen 1's own vocabulary. They were authored as the RULING on run 3,
     so they are not edited here; the exposure is flagged in the witness record
     for a founder decision. This assertion states exactly what is true today,
     so the guard cannot silently rot into covering it. */
  it('⚠️ the only fixture words present are the two in the ratified valence pairs', () => {
    const leaks = ['integration', 'ongoing'].filter((w) => bare.toLowerCase().includes(w));
    expect(leaks.sort()).toEqual(['integration', 'ongoing']);
    expect(bare).toContain('integration is not  repair');
    expect(bare).toContain('ongoing      is not  struggling');
  });
  it('contains no worked example of any passage\'s structure', () => {
    expect(bare).not.toContain('->');
    expect(bare).not.toContain('RESULTING IN');
  });
});

describe('provenance', () => {
  it('the asker version is pinned so a proposal records which contract produced it', () => {
    expect(REVISION_ASKER_VERSION).toBe('RC-GEN-01/1');
  });
});
