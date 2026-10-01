import {
  HOUSE_CONTEXT_SCHEMA,
  houseContinuityContext,
  houseWriterStudioHref,
  parseHouseContinuity,
  serializeHouseContinuity,
} from '../houseCabinContext';

describe('HOUSE-CABIN-CONTEXT-SPINE-01', () => {
  it('carries explicit Work identity and nothing manuscript-specific', () => {
    const context = houseContinuityContext('writers-studio', 'work-123');

    expect(context).toEqual({
      schema: HOUSE_CONTEXT_SCHEMA,
      source: { kind: 'house', returnHref: '/house' },
      destination: 'writers-studio',
      work: { id: 'work-123', authority: 'member_explicit' },
    });
    expect(JSON.stringify(context)).not.toContain('manuscript');
    expect(JSON.stringify(context)).not.toContain('memberId');
  });

  it('allows a context with no Work when the source has not established one', () => {
    expect(houseContinuityContext('writers-studio')).toEqual({
      schema: HOUSE_CONTEXT_SCHEMA,
      source: { kind: 'house', returnHref: '/house' },
      destination: 'writers-studio',
      work: null,
    });
  });

  it('uses an explicit Work in the Writer Studio URL without guessing a manuscript', () => {
    expect(houseWriterStudioHref('work 123')).toBe(
      '/writers-studio?from=house&work=work+123',
    );
  });

  it('round-trips as inspectable JSON for future Cabin migration', () => {
    const original = houseContinuityContext('writers-studio', 'work-123');
    const restored = parseHouseContinuity(serializeHouseContinuity(original));

    expect(restored).toEqual(original);
  });

  it('rejects a context that tries to smuggle manuscript identity into the envelope', () => {
    const serialized = JSON.stringify({
      ...houseContinuityContext('writers-studio', 'work-123'),
      manuscriptId: 'manuscript-999',
    });

    const parsed = parseHouseContinuity(serialized);
    expect(parsed).not.toBeNull();
    expect(parsed).toEqual(
      houseContinuityContext('writers-studio', 'work-123'),
    );
  });

  it('rejects unknown schema versions and unrecognized destinations', () => {
    expect(
      parseHouseContinuity(
        JSON.stringify({
          ...houseContinuityContext('writers-studio', 'work-123'),
          schema: 'soullab.house-context.v99',
        }),
      ),
    ).toBeNull();

    expect(
      parseHouseContinuity(
        JSON.stringify({
          ...houseContinuityContext('writers-studio', 'work-123'),
          destination: 'unknown-room',
        }),
      ),
    ).toBeNull();
  });
});
