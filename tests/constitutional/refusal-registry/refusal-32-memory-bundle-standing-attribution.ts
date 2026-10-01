import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — FAST MemoryBundle may not flatten mixed provenance into unlabeled memory text.
 *
 * Current wrong world (expected RED): member-authored turns, system-derived developmental
 * signals, and system-computed breakthrough rows share one MemoryBullet shape whose prompt
 * rendering carries only a source token such as `[developmental]`.
 *
 * This falsifier is deliberately local to the legacy FAST MemoryBundle seam. It does NOT
 * require M3, does NOT reopen MIPA, and does NOT decide whether inferred memory participates.
 * It requires only that material which does participate reaches cognition with truthful
 * authorship / participation / authority standing.
 */

const BUNDLE = 'lib/memory/MemoryBundle.ts';

function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal: 'FAST MemoryBundle cannot present mixed-origin memory to cognition without explicit standing',
  grade: 'Proposed',
  enforcedBy: 'lib/memory/MemoryBundle.ts — MemoryBullet + candidate construction + formatForPrompt',
  evidence: 'Memory Organism finding 3; current MemoryBundle merges turn/developmental/breakthrough candidates and renders only [source] labels',
  violationAttempted: 'allow system-derived or system-computed material to reach the FAST prompt with no authorship / participation / authority distinction',
  passingAuthorizes: 'claim only that the legacy FAST MemoryBundle preserves truthful standing into its prompt block',
  passingDoesNotAuthorize: 'M3 cutover, P6 return-authority changes, exclusion of inferred memory, new standing vocabulary, or any cross-room policy change',
  hostileForkMustChange: 'strip or bypass the standing fields/renderer so developmental or breakthrough material again reaches the prompt as an unlabeled memory fact',

  run(io) {
    if (!io.exists(BUNDLE)) {
      io.fail('MemoryBundle module absent', BUNDLE);
      return;
    }

    const src = code(io.read(BUNDLE));
    const bulletStart = src.indexOf('export interface MemoryBullet');
    const bulletEnd = bulletStart >= 0 ? src.indexOf('}', bulletStart) : -1;
    const bullet = bulletStart >= 0 && bulletEnd > bulletStart ? src.slice(bulletStart, bulletEnd + 1) : '';

    const requiredAxes = ['authoredBy', 'participationClass', 'authority'] as const;
    const missingAxes = requiredAxes.filter((axis) => !new RegExp('\\b' + axis + '\\b').test(bullet));
    if (missingAxes.length === 0) {
      io.pass('MemoryBullet carries the canonical participation axes');
    } else {
      io.fail(
        'MemoryBullet drops canonical standing axes',
        'missing: ' + missingAxes.join(', '),
      );
    }

    const promptStart = src.indexOf('formatForPrompt(bundle: MemoryBundle)');
    const promptEnd = promptStart >= 0 ? src.indexOf('\n  },', promptStart) : -1;
    const prompt = promptStart >= 0 && promptEnd > promptStart ? src.slice(promptStart, promptEnd) : '';

    const rendersAxes =
      /authoredBy/.test(prompt) &&
      /participationClass/.test(prompt) &&
      /authority/.test(prompt);

    if (rendersAxes) {
      io.pass('formatForPrompt renders standing into model-readable context');
    } else {
      io.fail(
        'formatForPrompt does not render authorship / participation / authority',
        'source labels alone are not standing',
      );
    }

    const hasTurnStanding =
      /source:\s*['"]turn['"][\s\S]{0,260}authoredBy:\s*['"]member['"]/.test(src);
    const hasDevelopmentalStanding =
      /source:\s*['"]developmental['"][\s\S]{0,320}authoredBy:\s*['"]system['"]/.test(src);
    const hasBreakthroughStanding =
      /source:\s*['"]breakthrough['"][\s\S]{0,320}authoredBy:\s*['"]system['"]/.test(src);

    if (hasTurnStanding && hasDevelopmentalStanding && hasBreakthroughStanding) {
      io.pass('candidate constructors distinguish member, developmental, and computed origins');
    } else {
      io.fail(
        'candidate constructors do not assign truthful origin standing',
        [
          'turn=' + hasTurnStanding,
          'developmental=' + hasDevelopmentalStanding,
          'breakthrough=' + hasBreakthroughStanding,
        ].join(' · '),
      );
    }
  },
};
