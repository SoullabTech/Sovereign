import {
  composeCraftWorkingCopy,
  craftWorkingEdits,
  decisionCount,
  initialCraftDecisions,
  type CraftDecision,
} from '../craftWorkingCopy';

describe("Craftsman's Table writer-owned working copy", () => {
  const original = 'Fire begins as a possibility and moves through life.';
  const proposed = 'Fire begins as a felt possibility and moves through relationship.';

  it('derives separable local craft edits from a proposal', () => {
    const edits = craftWorkingEdits(original, proposed);
    expect(edits.length).toBeGreaterThan(0);
    expect(edits.some((edit) => edit.to.includes('felt'))).toBe(true);
    expect(edits.some((edit) => edit.to.includes('relationship'))).toBe(true);
  });

  it('starts a MAIA proposal with the writer original still authoritative', () => {
    const edits = craftWorkingEdits(original, proposed);
    const decisions = initialCraftDecisions(edits, 'maia');
    expect(composeCraftWorkingCopy(original, edits, decisions)).toBe(original);
    expect(decisionCount(edits, decisions)).toBe(0);
  });

  it('can combine accepted MAIA moves with writer-authored local wording', () => {
    const edits = craftWorkingEdits(original, proposed);
    expect(edits.length).toBeGreaterThanOrEqual(2);

    const decisions = new Map<number, CraftDecision>(
      edits.map((edit) => [edit.id, { mode: 'original' } as CraftDecision]),
    );
    decisions.set(edits[0]!.id, { mode: 'proposal' });
    decisions.set(edits[edits.length - 1]!.id, {
      mode: 'custom',
      text: 'lived relationship',
    });

    const working = composeCraftWorkingCopy(original, edits, decisions);
    expect(working).not.toBe(original);
    expect(working).toContain('lived relationship');
    expect(decisionCount(edits, decisions)).toBe(2);
  });

  it('treats a saved member version as writer-owned rather than MAIA-selected', () => {
    const edits = craftWorkingEdits(original, proposed);
    const decisions = initialCraftDecisions(edits, 'member');
    expect(composeCraftWorkingCopy(original, edits, decisions)).toBe(proposed);
    expect(decisionCount(edits, decisions)).toBe(
      edits.filter((edit) => !edit.protectedSpan).length,
    );
  });
});
