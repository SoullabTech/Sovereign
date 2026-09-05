import {
  sectionNavigationCopy,
  copyIsFreeOfDiagnostics,
  NAVIGATION_NOT_ACTIVE,
} from '../sectionNavigationCopy';

describe('section navigation copy', () => {
  it.each(['NO_SOURCE', 'EDITED', 'WITHHELD'])('%s carries no diagnostic vocabulary', (r) => {
    expect(copyIsFreeOfDiagnostics(sectionNavigationCopy(r))).toBe(true);
  });

  it('an unknown reason falls back to the platform answer, never a raw string', () => {
    const c = sectionNavigationCopy('SOME_FUTURE_CLASS');
    expect(c.title).toContain("isn't available");
    expect(copyIsFreeOfDiagnostics(c)).toBe(true);
  });

  it('each state says the writing is unchanged, or has nothing to reassure about', () => {
    for (const r of ['EDITED', 'WITHHELD']) {
      expect(sectionNavigationCopy(r).body).toContain('unchanged');
    }
  });

  it('the three states are distinguishable — they name different tasks', () => {
    const titles = ['NO_SOURCE', 'EDITED', 'WITHHELD'].map((r) => sectionNavigationCopy(r).title);
    expect(new Set(titles).size).toBe(3);
  });

  it('the pre-activation state explains almost nothing, by design', () => {
    expect(NAVIGATION_NOT_ACTIVE.body).toBe('');
  });
});
