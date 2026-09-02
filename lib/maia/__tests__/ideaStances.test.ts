/**
 * Tests for lib/maia/ideaStances.ts
 *
 * These assert the CONTRACTS, not output quality. Each stance carries a job and
 * a resist clause, and every one of them carries the epistemic boundary — a
 * stance may change MAIA's manner of participation, never the status of the
 * member's material.
 *
 * The regression these guard against is a stance being added later without its
 * resist clause or its boundary, which is how "Distill" quietly becomes "declare
 * the member's position".
 */

import { describe, it, expect } from 'vitest';
import {
  IDEA_STANCES,
  STANCE_LABELS,
  STANCE_DESCRIPTIONS,
  STANCE_DIRECTIVES,
  isIdeaStance,
} from '../ideaStances';

describe('IDEA_STANCES', () => {
  it('is exactly the five agreed verbs', () => {
    expect([...IDEA_STANCES]).toEqual([
      'stay_with_this',
      'explore',
      'challenge',
      'connect',
      'distill',
    ]);
  });

  it('has a label and a description for every stance', () => {
    for (const stance of IDEA_STANCES) {
      expect(STANCE_LABELS[stance]).toBeTruthy();
      expect(STANCE_DESCRIPTIONS[stance]).toBeTruthy();
    }
  });
});

describe('isIdeaStance', () => {
  it('accepts every declared stance', () => {
    for (const stance of IDEA_STANCES) expect(isIdeaStance(stance)).toBe(true);
  });

  it('rejects unknown, empty, and non-string values', () => {
    expect(isIdeaStance('operationalize')).toBe(false);
    expect(isIdeaStance('')).toBe(false);
    expect(isIdeaStance(null)).toBe(false);
    expect(isIdeaStance(undefined)).toBe(false);
    expect(isIdeaStance(3)).toBe(false);
    expect(isIdeaStance({ stance: 'explore' })).toBe(false);
  });
});

describe('STANCE_DIRECTIVES', () => {
  it('covers every stance', () => {
    for (const stance of IDEA_STANCES) {
      expect(STANCE_DIRECTIVES[stance]).toBeTruthy();
    }
  });

  it('gives every stance both a job and a resist clause', () => {
    for (const stance of IDEA_STANCES) {
      expect(STANCE_DIRECTIVES[stance]).toMatch(/Your job:/);
      expect(STANCE_DIRECTIVES[stance]).toMatch(/Resist:/);
    }
  });

  it('carries the epistemic boundary in every stance', () => {
    for (const stance of IDEA_STANCES) {
      const d = STANCE_DIRECTIVES[stance];
      expect(d).toMatch(/governs HOW you participate/);
      expect(d).toMatch(/never the idea's settled position/);
      expect(d).toMatch(/never something the member has agreed to/);
    }
  });

  it('lets every stance override the default scoping move list', () => {
    for (const stance of IDEA_STANCES) {
      expect(STANCE_DIRECTIVES[stance]).toMatch(
        /supersedes the default Ideas-mode move list/
      );
    }
  });

  // The case-study failure: a member dwelling with an emerging perception was
  // asked four times what problem it solves.
  it('stay_with_this bans application and scoping questions outright', () => {
    const d = STANCE_DIRECTIVES.stay_with_this;
    expect(d).toMatch(/Application or scoping questions of any kind/);
    expect(d).toMatch(/what problem it solves/);
    expect(d).toMatch(/Do not ask them to justify the inquiry/);
  });

  it('explore resists premature convergence', () => {
    expect(STANCE_DIRECTIVES.explore).toMatch(/premature convergence/i);
  });

  it('challenge resists contrarianism and attacks on the member', () => {
    const d = STANCE_DIRECTIVES.challenge;
    expect(d).toMatch(/contrarianism for its own sake/i);
    expect(d).toMatch(/never their thinking or motives/);
  });

  it('connect refuses equivalence and provenance transfer', () => {
    const d = STANCE_DIRECTIVES.connect;
    expect(d).toMatch(/turning connection into equivalence/i);
    expect(d).toMatch(/proximity is not provenance/);
  });

  it('distill refuses manufactured closure and claimed agreement', () => {
    const d = STANCE_DIRECTIVES.distill;
    expect(d).toMatch(/manufacturing closure/i);
    expect(d).toMatch(/do not claim the member agrees/i);
  });
});
