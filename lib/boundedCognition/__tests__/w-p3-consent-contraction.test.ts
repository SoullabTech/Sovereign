/**
 * BCS-01A · Step 2 · W-P3 — current consent contracts frozen authority.
 *
 * The load-bearing case is NOT `intersect(frozen, current)` as arithmetic. It is
 * that protection is re-read AT EACH GOVERNED ACT, so a change landing mid-run
 * wins over a permission frozen at commission time (F-J9.2).
 */

import {
  permitCrossing,
  type ExecutionJurisdiction,
  type FrozenAuthorization,
  type ProtectionProvider,
} from '../permission';

const FROZEN_EXTERNAL: FrozenAuthorization = { commissionId: 'c1', maxJurisdiction: 'external' };
const FROZEN_LOCAL: FrozenAuthorization = { commissionId: 'c2', maxJurisdiction: 'sovereign' };

/** Authoritative protection whose state may change while an execution stays alive. */
function mutableProtection(initial: ExecutionJurisdiction) {
  let current = initial;
  return {
    provider: { currentMaxJurisdiction: () => current } as ProtectionProvider,
    contractTo: (next: ExecutionJurisdiction) => {
      current = next;
    },
  };
}

describe('W-P3 · effective permission = frozen ceiling ∩ current protection, at the act', () => {
  it('RED CONTROL A — a candidate that caches protection at T0 lets a contracted state be ignored', () => {
    const p = mutableProtection('external');

    // The prohibited behaviour, expressed deliberately: read once, reuse forever.
    const cachedAtStart = p.provider.currentMaxJurisdiction();
    const badPermit = (requested: ExecutionJurisdiction) =>
      requested === 'sovereign' || cachedAtStart === 'external';

    expect(badPermit('external')).toBe(true); // first crossing, lawfully permitted

    p.contractTo('sovereign'); // member protection contracts mid-run

    // The instrument must be able to catch this. The known-bad still permits.
    expect(badPermit('external')).toBe(true);

    // The lawful implementation, same sequence, refuses.
    const verdict = permitCrossing('external', FROZEN_EXTERNAL, p.provider);
    expect(verdict.ok).toBe(false);
    expect(!verdict.ok && verdict.refusal).toBe('refused_by_current_protection');
  });

  it('the same live execution: first crossing permitted, next crossing refused after contraction', () => {
    const p = mutableProtection('external');

    const first = permitCrossing('external', FROZEN_EXTERNAL, p.provider);
    expect(first.ok).toBe(true);

    p.contractTo('sovereign');

    const second = permitCrossing('external', FROZEN_EXTERNAL, p.provider);
    expect(second.ok).toBe(false);
    expect(!second.ok && second.refusal).toBe('refused_by_current_protection');
  });

  it('RED CONTROL B — current protection may never ENLARGE a frozen ceiling', () => {
    const p = mutableProtection('external');
    const verdict = permitCrossing('external', FROZEN_LOCAL, p.provider);
    expect(verdict.ok).toBe(false);
    expect(!verdict.ok && verdict.refusal).toBe('refused_by_frozen_ceiling');
  });

  it('LAWFUL CONTROLS — a deny-all implementation cannot pass this witness', () => {
    const permitAll = mutableProtection('external');
    const denyExternal = mutableProtection('sovereign');

    // frozen permit + current permit → PERMIT
    expect(permitCrossing('external', FROZEN_EXTERNAL, permitAll.provider).ok).toBe(true);
    // frozen permit + current deny → REFUSE
    expect(permitCrossing('external', FROZEN_EXTERNAL, denyExternal.provider).ok).toBe(false);
    // frozen deny + current permit → REFUSE
    expect(permitCrossing('external', FROZEN_LOCAL, permitAll.provider).ok).toBe(false);
    // a sovereign crossing remains available under the most protective state
    expect(permitCrossing('sovereign', FROZEN_LOCAL, denyExternal.provider).ok).toBe(true);
  });

  it('protection is consulted on EVERY crossing, not once per execution', () => {
    let reads = 0;
    const provider: ProtectionProvider = {
      currentMaxJurisdiction: () => {
        reads += 1;
        return 'external';
      },
    };
    permitCrossing('external', FROZEN_EXTERNAL, provider);
    permitCrossing('external', FROZEN_EXTERNAL, provider);
    permitCrossing('external', FROZEN_EXTERNAL, provider);
    expect(reads).toBe(3);
  });
});
