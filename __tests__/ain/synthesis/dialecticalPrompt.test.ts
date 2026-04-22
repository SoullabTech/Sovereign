/**
 * DIALECTICAL SYNTHESIS PROMPT — CANARY TESTS
 *
 * Protects the epistemic discipline layer in `lib/ain/synthesis/dialectical.md`
 * from silent regression.
 *
 * Canon: docs/canon/CHANGES_SECTION_EPISTEMIC_DISCIPLINE.md
 *
 * These tests do NOT call the LLM. They assert that the *prompt scaffold*
 * — which is load-bearing for the Changes section council synthesis — still
 * contains the rules that enforce:
 *
 *   1. Product principle ("must not interpret faster than it understands")
 *   2. Required reasoning sequence (Observe → Differentiate → Test → Interpret → Guide)
 *   3. Question-Before-Assert rule for charged framings
 *   4. Banned rhetorical moves (explicit AND soft authority)
 *   5. Three-level confidence handling with missing-data weighting
 *   6. No semantic collapse after compliance
 *   7. Recommended Action conditionality + robust-move preference
 *   8. All downstream-extractable section headers preserved
 *
 * If any of these regress, the synthesis surface reverts to premature
 * pronouncement. Fail loudly.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PROMPT_PATH = join(process.cwd(), 'lib/ain/synthesis/dialectical.md');
const prompt = readFileSync(PROMPT_PATH, 'utf-8');

describe('dialectical synthesis prompt — epistemic discipline', () => {
  describe('product principle', () => {
    it('declares the non-negotiable principle explicitly', () => {
      expect(prompt).toMatch(
        /must not interpret the user faster than (it|they) understand/i,
      );
    });
  });

  describe('required reasoning sequence', () => {
    const steps = [
      'Observe',
      'Differentiate',
      'Test',
      'Interpret provisionally',
      'Guide conditionally',
    ];

    it.each(steps)('names the step: %s', (step) => {
      expect(prompt).toMatch(new RegExp(step, 'i'));
    });

    it('preserves Observe before Interpret in the sequence', () => {
      const observeIdx = prompt.search(/\bObserve\b/);
      const interpretIdx = prompt.search(/Interpret provisionally/i);
      expect(observeIdx).toBeGreaterThan(-1);
      expect(interpretIdx).toBeGreaterThan(-1);
      expect(observeIdx).toBeLessThan(interpretIdx);
    });
  });

  describe('question-before-assert rule', () => {
    it('lists charged framings that require question-or-possibility framing', () => {
      const charged = [
        'readiness',
        'anxiety',
        'avoidance',
        'dysregulation',
        'resistance',
        'attachment dynamics',
      ];
      for (const term of charged) {
        expect(prompt.toLowerCase()).toContain(term);
      }
    });

    it('explicitly forbids asserting charged framings without compelling evidence', () => {
      // The rule must express that these framings are not assertable by default.
      expect(prompt).toMatch(
        /(frame it as one possibility|convert it into an orienting question|ONLY when the evidence is unusually clear)/i,
      );
    });
  });

  describe('banned rhetorical moves — explicit', () => {
    const bannedExplicit = [
      'remarkably convergent',
      'all lenses agree',
      'the deepest insight',
      'the real issue is',
      'the core truth here is',
    ];

    it.each(bannedExplicit)('lists as banned: %s', (phrase) => {
      expect(prompt.toLowerCase()).toContain(phrase.toLowerCase());
    });
  });

  describe('banned rhetorical moves — soft authority', () => {
    const bannedSoft = [
      'what becomes clear here is',
      'it is evident that',
      'ultimately, this points to',
      'at its root',
    ];

    it.each(bannedSoft)('lists as banned soft-authority pattern: %s', (phrase) => {
      expect(prompt.toLowerCase()).toContain(phrase.toLowerCase());
    });

    it('declares soft authority itself as banned (not only the example phrases)', () => {
      expect(prompt.toLowerCase()).toMatch(
        /soft authority is also banned|(certainty|final clarity).*(tone|phrasing)/,
      );
    });
  });

  describe('confidence handling', () => {
    it('defines three levels: High, Medium, Low', () => {
      expect(prompt).toMatch(/\*\*High\*\*/);
      expect(prompt).toMatch(/\*\*Medium\*\*/);
      expect(prompt).toMatch(/\*\*Low\*\*/);
    });

    it('requires ≥2 plausible readings under Medium/Low confidence', () => {
      expect(prompt).toMatch(
        /(at least 2 plausible readings|≥\s*2 plausible readings)/i,
      );
    });

    it('requires ≥1 orienting question under Medium/Low confidence', () => {
      expect(prompt).toMatch(
        /(at least 1 orienting question|≥\s*1 orienting question)/i,
      );
    });

    it('enforces missing-data weighting that lowers confidence', () => {
      expect(prompt).toMatch(/missing data lowers confidence/i);
      expect(prompt).toMatch(
        /reduce (the working )?confidence level by one step|High → Medium, Medium → Low/i,
      );
    });
  });

  describe('anti-collapse rules', () => {
    it('forbids semantic collapse after compliance', () => {
      expect(prompt.toLowerCase()).toMatch(/no semantic collapse|don'?t semantically collapse/);
    });

    it('states that if uncertainty remains, Synthesis must reflect it explicitly', () => {
      expect(prompt).toMatch(
        /if uncertainty remains.*synthesis.*(must explicitly|explicitly reflect)/i,
      );
    });
  });

  describe('Recommended Action discipline', () => {
    it('requires conditionality under non-High confidence', () => {
      // Must mention either "test/experiment" framing or explicit "if…then" branching
      expect(prompt).toMatch(/test or experiment|conditional on which interpretation/i);
    });

    it('forbids presenting a single directive path as "the move" under uncertainty', () => {
      expect(prompt.toLowerCase()).toMatch(
        /(must not present a single directive path|not .* single directive)/,
      );
    });

    it('requires robust-move preference', () => {
      expect(prompt).toMatch(
        /(robust move|remain useful even if the primary interpretation is wrong|generate information or preserve optionality)/i,
      );
    });
  });

  describe('tone requirements', () => {
    it('names the required tone qualities', () => {
      // Tolerant match — any of the qualities should appear
      expect(prompt.toLowerCase()).toMatch(/sober|precise|non-prescriptive|careful intelligence/);
    });
  });

  describe('anti-pathologizing', () => {
    it('forbids turning tension into deficit', () => {
      expect(prompt.toLowerCase()).toMatch(/pathologi[sz]|turn tension into|(don'?t|do not).*pathologi[sz]/);
    });

    it('protects urgency, movement, and uncertainty from being treated as symptoms', () => {
      expect(prompt).toMatch(/urgency.*movement.*uncertainty|these are (often )?signals, not symptoms/i);
    });
  });

  describe('output section headers — extractor contract', () => {
    // consultation.ts uses extractSection / extractBulletPoints on these exact
    // headers. Changing them silently would break section parsing.
    const REQUIRED_EXTRACTOR_HEADERS = [
      'Synthesis',
      'Key Tensions',
      'Recommended Action',
      'What to Hold Open',
    ];

    it.each(REQUIRED_EXTRACTOR_HEADERS)(
      'preserves downstream-extracted header: %s',
      (header) => {
        const re = new RegExp(`^###\\s+${header}\\b`, 'm');
        expect(prompt).toMatch(re);
      },
    );

    it('adds the new upstream discipline sections before Synthesis', () => {
      const headers = ['Notice', 'Differentiate', 'Orienting Questions'];
      const synthesisIdx = prompt.search(/^###\s+Synthesis\b/m);
      expect(synthesisIdx).toBeGreaterThan(-1);

      for (const h of headers) {
        const idx = prompt.search(new RegExp(`^###\\s+${h}\\b`, 'm'));
        expect(idx).toBeGreaterThan(-1);
        expect(idx).toBeLessThan(synthesisIdx);
      }
    });
  });

  describe('extractor regex compatibility (canary)', () => {
    // Reproduces the exact regex pattern from lib/ain/consultation.ts:442
    // so we catch it if the prompt format drifts in a way the extractor misses.
    function extractSection(text: string, header: string): string {
      const regex = new RegExp(`###?\\s*${header}[\\s\\S]*?(?=###|$)`, 'i');
      const match = text.match(regex);
      if (!match) return '';
      return match[0]
        .replace(new RegExp(`###?\\s*${header}`, 'i'), '')
        .trim();
    }

    it('can locate Synthesis section', () => {
      expect(extractSection(prompt, 'Synthesis').length).toBeGreaterThan(0);
    });

    it('can locate Key Tensions section', () => {
      expect(extractSection(prompt, 'Key Tensions').length).toBeGreaterThan(0);
    });

    it('can locate Recommended Action section', () => {
      expect(extractSection(prompt, 'Recommended Action').length).toBeGreaterThan(0);
    });
  });
});
