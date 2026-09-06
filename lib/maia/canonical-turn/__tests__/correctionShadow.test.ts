/**
 * E1 correction-candidate shadow — unit falsifiers.
 *   - content never leaves the classifier (no text, no substring, no char length);
 *   - Sanctuary is refused inside the module;
 *   - no prior MAIA response → no candidate, even with markers;
 *   - precedence correction > not-it > disagreement;
 *   - ordinary turns classify as none with zero markers.
 */

import { classifyCorrectionCandidate, CORRECTION_SHADOW_MARKER } from '../correctionShadow';

const PRIOR = 'It sounds like you are carrying a lot of grief about your father.';

describe('classifyCorrectionCandidate', () => {
  it('refuses Sanctuary inside the module', () => {
    expect(
      classifyCorrectionCandidate({ memberMessage: "that's not what I meant", priorAssistantResponse: PRIOR, sanctuary: true }),
    ).toBeNull();
  });

  it('classifies a correction of MAIA', () => {
    const r = classifyCorrectionCandidate({
      memberMessage: "No, that's not what I meant. I was talking about my brother.",
      priorAssistantResponse: PRIOR,
      sanctuary: false,
    });
    expect(r).not.toBeNull();
    expect(r!.candidate).toBe('correction');
    expect(r!.markers).toBeGreaterThan(0);
    expect(r!.classes[0]).toBe('correction');
    expect(r!.hasPriorResponse).toBe(true);
  });

  it('classifies not-it and disagreement, with precedence to correction', () => {
    const notIt = classifyCorrectionCandidate({
      memberMessage: "Hmm, that doesn't quite resonate. It's not like that.",
      priorAssistantResponse: PRIOR,
      sanctuary: false,
    })!;
    expect(notIt.candidate).toBe('not-it');

    const disagreement = classifyCorrectionCandidate({
      memberMessage: 'I disagree. I think you are wrong about that.',
      priorAssistantResponse: PRIOR,
      sanctuary: false,
    })!;
    expect(disagreement.candidate).toBe('disagreement');

    const both = classifyCorrectionCandidate({
      memberMessage: "I disagree, and you misunderstood me — that's not what I said.",
      priorAssistantResponse: PRIOR,
      sanctuary: false,
    })!;
    expect(both.candidate).toBe('correction');
    expect(both.classes).toEqual(expect.arrayContaining(['correction', 'disagreement']));
  });

  it('declares no candidate without a prior MAIA response, but still counts markers', () => {
    const r = classifyCorrectionCandidate({
      memberMessage: "That's not what I meant when I said it to her.",
      priorAssistantResponse: null,
      sanctuary: false,
    })!;
    expect(r.candidate).toBe('none');
    expect(r.hasPriorResponse).toBe(false);
    expect(r.markers).toBeGreaterThan(0);
  });

  it('classifies an ordinary turn as none with zero markers', () => {
    const r = classifyCorrectionCandidate({
      memberMessage: 'Yes, that lands. I have been thinking about him all week.',
      priorAssistantResponse: PRIOR,
      sanctuary: false,
    })!;
    expect(r.candidate).toBe('none');
    expect(r.markers).toBe(0);
    expect(r.classes).toEqual([]);
  });

  it('carries no member content in its output shape', () => {
    const text = "You misunderstood — my name is Ophelia and that's not it.";
    const r = classifyCorrectionCandidate({ memberMessage: text, priorAssistantResponse: PRIOR, sanctuary: false })!;
    const serialized = JSON.stringify(r);
    expect(serialized).not.toContain('Ophelia');
    expect(serialized).not.toContain('misunderstood');
    expect(Object.keys(r).sort()).toEqual(['candidate', 'classes', 'hasPriorResponse', 'markers']);
  });

  it('never throws on odd input', () => {
    expect(() =>
      classifyCorrectionCandidate({ memberMessage: undefined as unknown as string, priorAssistantResponse: undefined, sanctuary: false }),
    ).not.toThrow();
  });

  it('exports a stable marker', () => {
    expect(CORRECTION_SHADOW_MARKER).toBe('[MAIA/shadow] correction-candidate');
  });
});
