import { lawfulRequest } from '../../__tests__/fixtures';
import {
  EpistemicJoinPersistenceConflict,
  EpistemicJoinPersistenceDisabled,
  persistEpistemicJoinSnapshot,
  prepareEpistemicJoinPersistence,
  type EpistemicJoinPersistenceDeps,
} from '../store';
import { epistemicJoinPersistenceEnabled } from '../feature';

describe('I3 persistence feature gate', () => {
  it('is OFF for every value except exact literal true', () => {
    expect(epistemicJoinPersistenceEnabled({})).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: '' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: 'false' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: '0' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: '1' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: 'TRUE' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: 'yes' })).toBe(false);
    expect(epistemicJoinPersistenceEnabled({ AIN_EPISTEMIC_JOIN_PERSISTENCE_ENABLED: 'true' })).toBe(true);
  });

  it('does not touch transaction or randomness while OFF', async () => {
    const transaction = jest.fn();
    const random = jest.fn(() => 'unused');
    const deps = {
      transaction,
      randomUUID: random,
      env: {},
    } as unknown as EpistemicJoinPersistenceDeps;
    await expect(
      persistEpistemicJoinSnapshot(
        {
          memberId: 'synthetic-member-001',
          request: lawfulRequest(),
          expectedPreviousAdmissionId: null,
        },
        deps,
      ),
    ).rejects.toBeInstanceOf(EpistemicJoinPersistenceDisabled);

    expect(transaction).not.toHaveBeenCalled();
    expect(random).not.toHaveBeenCalled();
  });
});

describe('I3 preparation preserves I2 authority boundaries', () => {
  it('refuses custody when member scope and custody member differ', () => {
    expect(() =>
      prepareEpistemicJoinPersistence('different-member', lawfulRequest()),
    ).toThrow(EpistemicJoinPersistenceConflict);
  });

  it('re-evaluates through I2 and keeps representation authority closed', () => {
    const request = lawfulRequest();
    const before = JSON.stringify(request);
    const prepared = prepareEpistemicJoinPersistence('synthetic-member-001', request);

    expect(prepared.evaluation.admittedStanding).toBe('WARRANTED');
    expect(prepared.evaluation.downstreamRepresentationAuthorized).toBe(false);
    expect(prepared.evaluation.representationAuthority).toBe('closed');
    expect(prepared.tipActId).toBe('act-1');
    expect(JSON.stringify(request)).toBe(before);
  });
});
