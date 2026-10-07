import { appendCraftDialogue } from '../craftDialogueR1';

describe('Craft R1 presentation dialogue', () => {
  it('keeps only distinct visible turns by stable key', () => {
    const first = appendCraftDialogue([], {
      key: 'writer:1',
      speaker: 'writer',
      body: 'Keep more of my cadence.',
    });
    const duplicate = appendCraftDialogue(first, {
      key: 'writer:1',
      speaker: 'writer',
      body: 'hidden duplicate',
    });
    expect(duplicate).toEqual(first);
  });

  it('refuses empty presentation turns', () => {
    expect(appendCraftDialogue([], {
      key: 'writer:1',
      speaker: 'writer',
      body: '   ',
    })).toEqual([]);
  });

  it('retains recent relational continuity without growing forever', () => {
    let turns = [] as ReturnType<typeof appendCraftDialogue>;
    for (let i = 0; i < 30; i += 1) {
      turns = appendCraftDialogue(turns, {
        key: 'turn:' + i,
        speaker: i % 2 === 0 ? 'writer' : 'maia',
        body: 'turn ' + i,
      }, 6);
    }
    expect(turns).toHaveLength(6);
    expect(turns[0]?.body).toBe('turn 24');
    expect(turns.at(-1)?.body).toBe('turn 29');
  });
});
