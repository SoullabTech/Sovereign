import { bodyOutcomeFrom } from '../bodyProtocolResponse';

describe('current developmental Ask body protocol mapping', () => {
  it('maps BODY_AUTHORITY_REQUIRED identities + frozen ordinals into human section labels', () => {
    expect(bodyOutcomeFrom(200, {
      result: 'BODY_AUTHORITY_REQUIRED',
      pendingAskRef: 'p1',
      sections: ['s222', 's200', 's220'],
      sectionOrientations: [
        { sectionRef: 's200', ordinal: 200 },
        { sectionRef: 's220', ordinal: 220 },
        { sectionRef: 's222', ordinal: 222 },
      ],
    })).toEqual({
      kind: 'BODY_AUTHORITY_REQUIRED',
      pendingAskRef: 'p1',
      sections: [
        { sectionId: 's200', label: 'Section 200', ordinal: 200 },
        { sectionId: 's220', label: 'Section 220', ordinal: 220 },
        { sectionId: 's222', label: 'Section 222', ordinal: 222 },
      ],
    });
  });

  it('maps BODY_SCOPE_INCOMPLETE using the current sections/orientation shape', () => {
    expect(bodyOutcomeFrom(200, {
      result: 'BODY_SCOPE_INCOMPLETE',
      pendingAskRef: 'p2',
      sections: ['s5'],
      sectionOrientations: [{ sectionRef: 's5', ordinal: 5 }],
    })).toEqual({
      kind: 'BODY_SCOPE_INCOMPLETE',
      pendingAskRef: 'p2',
      outstanding: [{ sectionId: 's5', label: 'Section 5', ordinal: 5 }],
    });
  });

  it('keeps completed replay on the ordinary successful Ask path', () => {
    expect(bodyOutcomeFrom(200, {
      result: 'ALREADY_COMPLETED',
      threadId: 't1',
      thread: { id: 't1' },
    })).toBeNull();
  });
});
