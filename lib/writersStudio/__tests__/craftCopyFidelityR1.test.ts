import { craftWorkingEdits, composeCraftWorkingCopy, initialCraftDecisions } from '../craftWorkingCopy';
import { composeSelected, editorialSegments } from '../editorialDiff';

// Synthetic prose only. No manuscript, database, or model transport is involved.
describe('Craft R1 exact-copy fidelity', () => {
  const cases: Array<[string, string]> = [
    ['These rarely exist separately.', 'These continually move in relationship.'],
    ['old red boat', 'new blue ship'],
    ['old\tred\nboat', 'new\tblue\nship'],
    ['old\n\nred boat', 'new\n\nblue ship'],
    ['Fire 🔥 feels alive.', 'Water 💧 sounds present.'],
    ['a café feels quiet.', 'a café sounds alive.'],
    ['first  old word\r\nlast', 'first  new phrase\r\nlast'],
    ['one phrase', ''],
    ['', 'new words'],
    ['a b', 'a  c'],
  ];

  it.each(cases)('reconstructs the candidate exactly: %j → %j', (original, proposal) => {
    const edits = craftWorkingEdits(original, proposal);
    expect(composeCraftWorkingCopy(original, edits, initialCraftDecisions(edits, 'member'))).toBe(proposal);
    expect(composeCraftWorkingCopy(original, edits, initialCraftDecisions(edits, 'maia'))).toBe(original);
    for (const edit of edits) {
      expect(Array.from(original).slice(edit.start, edit.end).join('')).toBe(edit.from);
    }
  });

  it('gives every chosen subset the same exact words as the existing segment composer', () => {
    const original = 'The old red boat rests by the quiet river.';
    const proposal = 'The new blue ship rests beside the living water.';
    const edits = craftWorkingEdits(original, proposal);
    for (let mask = 0; mask < 2 ** edits.length; mask += 1) {
      const selected = new Set(edits.filter((_, i) => Boolean(mask & (1 << i))).map(e => e.id));
      const decisions = new Map(edits.map(e => [e.id, { mode: selected.has(e.id) ? 'proposal' as const : 'original' as const }]));
      expect(composeCraftWorkingCopy(original, edits, decisions)).toBe(
        composeSelected(editorialSegments(original, proposal), selected),
      );
    }
  });

  it('preserves spaces when the writer replaces a grouped phrase with a hybrid', () => {
    const original = 'The old red boat rests.';
    const proposal = 'The new blue ship rests.';
    const edits = craftWorkingEdits(original, proposal);
    const decisions = new Map(initialCraftDecisions(edits, 'maia'));
    decisions.set(edits[0]!.id, { mode: 'custom', text: 'weathered blue boat' });
    expect(composeCraftWorkingCopy(original, edits, decisions)).toBe('The weathered blue boat rests.');
  });
});
