/**
 * MENTOR DISCIPLINE — CANARY TESTS
 *
 * Protects the shared Mentor-layer epistemic discipline block and its
 * wiring into every Mentor surface.
 *
 * Canon: docs/canon/CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md
 * Shared module: lib/studio/mentorDiscipline.ts
 *
 * Background: the initial epistemic-discipline commit (cb64961ec) fixed
 * the shared dialectical.md synthesis scaffold, but the Mentor layer used
 * THREE inline system prompts that bypassed it, each baking in urgency-
 * as-pathology directives ("urgency is driving instead of clarity",
 * "pressure is driving instead of clarity", "if you sense urgency driving
 * instead of clarity, name it gently"). This test prevents regression.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { MENTOR_EPISTEMIC_DISCIPLINE } from '@/lib/studio/mentorDiscipline';

const ROUTES = {
  changesMentor: 'app/api/studio/changes/[id]/mentor/route.ts',
  changesMentorChat: 'app/api/studio/changes/[id]/mentor/chat/route.ts',
  decisionsMentor: 'app/api/studio/decisions/[id]/mentor/route.ts',
} as const;

function readRoute(relativePath: string): string {
  return readFileSync(join(process.cwd(), relativePath), 'utf-8');
}

describe('shared MENTOR_EPISTEMIC_DISCIPLINE block', () => {
  it('is a non-empty string', () => {
    expect(typeof MENTOR_EPISTEMIC_DISCIPLINE).toBe('string');
    expect(MENTOR_EPISTEMIC_DISCIPLINE.length).toBeGreaterThan(200);
  });

  describe('contains required rules', () => {
    it('names the product principle (interpret no faster than understanding)', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /do not interpret.*faster than you understand/i,
      );
    });

    it('protects urgency, movement, and uncertainty from default pathologizing', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /urgency.*movement.*uncertainty.*signals, not symptoms/i,
      );
    });

    it('requires sovereignty checks to be reflections, not diagnoses', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /sovereignty checks are reflections, not diagnoses/i,
      );
    });

    it('forbids hardcoded pathology list', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(/no hardcoded pathology list/i);
    });

    it('enforces question-before-assert via charged-vocabulary rule', () => {
      // "Charged vocabulary stays in their mouth, not yours"
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /charged vocabulary stays in their mouth/i,
      );
      // Named charged terms
      const charged = ['anxiety', 'avoidance', 'unreadiness', 'dysregulation', 'resistance'];
      for (const term of charged) {
        expect(MENTOR_EPISTEMIC_DISCIPLINE.toLowerCase()).toContain(term);
      }
    });

    it('requires provisional framing for any inference', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE.toLowerCase()).toMatch(
        /provisional language for any inference|"?one possible read"?|"?it may be that"?/,
      );
    });

    it('requires robust experiments under uncertainty', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /experiments must be robust under uncertainty|teaches regardless of outcome|generate information or preserve optionality/i,
      );
    });

    it('distinguishes opening questions from steering questions', () => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE).toMatch(
        /questions open.*do not steer|steering question plants your interpretation/i,
      );
    });
  });

  describe('explicitly bans the observed failure-mode phrases', () => {
    const bannedInMentors = [
      'urgency is driving instead of clarity',
      'pressure is driving instead of clarity',
      'reaching is ahead of your readiness',
    ];

    it.each(bannedInMentors)('lists as banned mentor phrasing: %s', (phrase) => {
      expect(MENTOR_EPISTEMIC_DISCIPLINE.toLowerCase()).toContain(phrase.toLowerCase());
    });
  });
});

describe('Mentor surfaces — discipline wiring', () => {
  describe.each(Object.entries(ROUTES))('%s (%s)', (_name, path) => {
    const source = readRoute(path);

    it('imports the shared MENTOR_EPISTEMIC_DISCIPLINE', () => {
      expect(source).toMatch(
        /import\s*\{\s*MENTOR_EPISTEMIC_DISCIPLINE\s*\}\s*from\s*['"]@\/lib\/studio\/mentorDiscipline['"]/,
      );
    });

    it('injects the discipline into the system prompt via ${MENTOR_EPISTEMIC_DISCIPLINE}', () => {
      expect(source).toMatch(/\$\{MENTOR_EPISTEMIC_DISCIPLINE\}/);
    });

    it('no longer contains the urgency-as-pathology bake-in', () => {
      // The exact offending lines removed from each route.
      expect(source).not.toMatch(/urgency is driving instead of clarity/i);
      expect(source).not.toMatch(/pressure is driving instead of clarity/i);
      expect(source).not.toMatch(
        /if you sense urgency driving instead of clarity, name it gently/i,
      );
    });

    it('no longer hardcodes the pathology triad as a framing list', () => {
      // Original bake-in: "agency might be leaking (spiritual bypassing,
      // grasping for control, avoiding discomfort)" — the parenthesized
      // triad pre-frames interpretation and must not appear as a default
      // list in the prompt body.
      expect(source).not.toMatch(
        /spiritual bypassing,\s*grasping for control,\s*avoiding discomfort/i,
      );
      expect(source).not.toMatch(
        /outsourcing decisions,\s*avoiding discomfort,\s*performing certainty/i,
      );
    });

    it('sovereignty check / reflection framing is non-declarative', () => {
      // Must NOT describe the sovereigntyCheck as "identifying where the
      // person's agency is leaking" — that's a diagnosis-shaped instruction.
      expect(source).not.toMatch(
        /one sentence identifying where .* agency (might be|is) leaking/i,
      );
    });
  });
});
