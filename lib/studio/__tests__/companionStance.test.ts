import {
  buildSystemPrompt,
  contextBlock,
  draftExcerpt,
  DRAFT_EXCERPT_CHARS,
  invitationAsk,
  INVITATIONS,
  openingLine,
  roomState,
  type RoomFacts,
} from '../companionStance';

const base: RoomFacts = {
  workTitle: null,
  workPurpose: null,
  workForm: null,
  workStage: null,
  materials: [],
  manuscriptTitle: null,
  draftChars: 0,
  draftExcerpt: '',
};

describe('roomState — read from facts, never inferred', () => {
  it('is discover when nothing has been brought in and nothing written', () => {
    expect(roomState({ materials: [], draftChars: 0 })).toBe('discover');
  });

  it('is gather once the member has declared a material', () => {
    expect(
      roomState({ materials: [{ label: 'a', kind: 'manuscript', sentence: null }], draftChars: 0 }),
    ).toBe('gather');
  });

  it('is working once the draft carries real writing, materials or not', () => {
    expect(roomState({ materials: [], draftChars: 5000 })).toBe('working');
  });

  it('does not call an opened-but-empty page writing', () => {
    expect(roomState({ materials: [], draftChars: 12 })).toBe('discover');
  });
});

describe('openingLine — authored, stable, never generated', () => {
  it('opens a new work with the discover question', () => {
    expect(openingLine('discover', { materials: [] })).toBe('What are you making?');
  });

  it('counts what the member actually brought', () => {
    expect(
      openingLine('gather', { materials: [{ label: 'a', kind: 'note', sentence: null }] }),
    ).toContain('one thing');
    expect(
      openingLine('gather', {
        materials: [
          { label: 'a', kind: 'note', sentence: null },
          { label: 'b', kind: 'note', sentence: null },
        ],
      }),
    ).toContain('2 things');
  });

  it('is identical across calls for the same room', () => {
    expect(openingLine('working', { materials: [] })).toBe(openingLine('working', { materials: [] }));
  });
});

describe('invitations', () => {
  it('resolves every offered gesture to authored words', () => {
    for (const inv of INVITATIONS) {
      expect(invitationAsk(inv.id)).toBe(inv.ask);
    }
  });

  it('refuses an id it does not offer', () => {
    expect(invitationAsk('rewrite-my-book')).toBeNull();
  });
});

describe('contextBlock — provenance is structural', () => {
  it('says the work is unnamed rather than naming it', () => {
    expect(contextBlock(base, 'discover')).toContain('has not named it yet');
  });

  it('attributes the title to the writer', () => {
    const out = contextBlock({ ...base, workTitle: 'Elemental Alchemy' }, 'discover');
    expect(out).toContain('named by the writer');
    expect(out).toContain('Elemental Alchemy');
  });

  it('carries the member sentence verbatim and marks an unwritten one as correct', () => {
    const out = contextBlock(
      {
        ...base,
        materials: [
          { kind: 'manuscript', label: 'Interview', sentence: 'this is where the book starts' },
          { kind: 'manuscript', label: 'Fragment', sentence: null },
        ],
      },
      'gather',
    );
    expect(out).toContain('"this is where the book starts"');
    expect(out).toContain('not a gap');
  });

  it('marks the draft as an excerpt so it is not mistaken for the whole work', () => {
    const out = contextBlock({ ...base, draftChars: 90000, draftExcerpt: 'once…' }, 'working');
    expect(out).toContain('EXCERPT');
  });

  it('says the draft is empty rather than sending an empty marker block', () => {
    expect(contextBlock(base, 'discover')).toContain('THE DRAFT: empty.');
  });
});

describe('buildSystemPrompt — the stance travels with the facts', () => {
  const prompt = buildSystemPrompt(base, 'discover');

  it('forbids writing the work unless explicitly asked', () => {
    expect(prompt).toContain('Do not write or rewrite the work');
    expect(prompt).toContain('unless the writer explicitly asks');
  });

  it('keeps the writer as the author', () => {
    expect(prompt).toContain('The writer is the author');
  });

  it('separates what the member declared from what MAIA noticed', () => {
    expect(prompt).toContain('Never blur the two');
  });

  it('carries the room facts', () => {
    expect(prompt).toContain('WHAT IS ACTUALLY IN THE ROOM RIGHT NOW');
  });
});

describe('draftExcerpt — a 200-page book stays sendable', () => {
  it('passes a short draft through unchanged', () => {
    expect(draftExcerpt('a short opening')).toBe('a short opening');
  });

  it('bounds a long draft and marks the truncation', () => {
    const long = 'x'.repeat(DRAFT_EXCERPT_CHARS * 3);
    const out = draftExcerpt(long);
    expect(out.length).toBe(DRAFT_EXCERPT_CHARS + 1);
    expect(out.endsWith('…')).toBe(true);
  });
});
