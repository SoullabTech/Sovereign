import type { RefusalCheck } from './harness';

/**
 * Refusal 25 — G1 — Floor invariance across cognition tiers (CMT-01).
 *
 * The standing sovereignty guardrails — MEMORY_SPEECH_ACT_BOUNDARY, PLATFORM_KNOWLEDGE_BOUNDARY,
 * INTERFACE_HUMILITY_GUARDRAIL — must reach the prompt on EVERY cognition tier. Today they are
 * appended only by appendAllContextAddenda (lib/sovereign/maiaVoice.ts), which CORE and
 * DEEP-repair call and FAST does not (census D1).
 *
 * EXPECTED STATE: RED on the current tree until M3 (canonical renderer becomes the tier seam).
 * This check was written BEFORE the seam so that D1 is witnessed by a test, not a comment.
 */

const SERVICE = 'lib/sovereign/maiaService.ts';
const VOICE = 'lib/sovereign/maiaVoice.ts';
const GUARDS = ['MEMORY_SPEECH_ACT_BOUNDARY', 'PLATFORM_KNOWLEDGE_BOUNDARY', 'INTERFACE_HUMILITY_GUARDRAIL'];

function fnBody(src: string, name: string): string {
  const start = src.indexOf(`async function ${name}(`);
  if (start < 0) return '';
  // Next top-level function declaration bounds the body (file convention: one blank line + `async function`/`function`/`export`).
  const rest = src.slice(start + 1);
  const m = rest.search(/\n(?:export )?(?:async )?function \w+\(/);
  return m < 0 ? src.slice(start) : src.slice(start, start + 1 + m);
}

export const check: RefusalCheck = {
  id: 'R25',
  refusal: 'No cognition tier renders a MAIA prompt without the standing sovereignty floor (speech-act boundary, platform boundary, interface humility)',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/render.ts (after M3); today: appendAllContextAddenda in maiaVoice.ts — CORE + DEEP-repair only',
  evidence: 'maiaService.ts fastPathResponse builds its own template literal (:1432) and never calls appendAllContextAddenda; the three guardrail constants are referenced only inside appendAllContextAddenda',
  violationAttempted: 'find a tier prompt path (FAST / CORE / DEEP-repair) that reaches the model without the three guardrails',
  passingAuthorizes: 'every tier prompt path structurally carries the three standing guardrails',
  passingDoesNotAuthorize: 'that the guardrails are obeyed by the model, nor that DEEP-primary (no prompt seam) carries them — that lane weaves templates and is governed separately',
  hostileForkMustChange: 'remove one guardrail append from the renderer / appendAllContextAddenda, or route a tier around it — visible diff',

  run(io) {
    const service = io.read(SERVICE);
    const voice = io.read(VOICE);

    // 0. The floor constants must be NAMED so this check is structural, not textual.
    for (const g of GUARDS) {
      if (new RegExp(`export const ${g}\\b`).test(voice)) io.pass(`${g} is a named export in maiaVoice.ts`);
      else io.fail(`${g} is not a named export`, 'cannot check invariance structurally');
    }

    // 1. appendAllContextAddenda appends all three (the CORE / DEEP-repair channel).
    const helper = voice.slice(voice.indexOf('export function appendAllContextAddenda('));
    const helperBody = helper.slice(0, helper.indexOf('\n}\n') + 3);
    const missingInHelper = GUARDS.filter((g) => !helperBody.includes(`\${${g}}`));
    if (missingInHelper.length === 0) io.pass('appendAllContextAddenda appends all three guardrails');
    else io.fail('appendAllContextAddenda missing guardrail(s)', missingInHelper.join(', '));

    // 2. Each tier path must reach the guardrails: either via the canonical renderer, via
    //    appendAllContextAddenda (directly or through buildMaiaWisePrompt / buildMaiaComprehensivePrompt),
    //    or by referencing each constant itself.
    const tiers: Array<[string, string]> = [
      ['FAST', 'fastPathResponse'],
      ['CORE', 'corePathResponse'],
      ['DEEP-repair', 'deepPathResponse'],
    ];
    for (const [label, fn] of tiers) {
      const body = fnBody(service, fn);
      if (!body) { io.fail(`${label}: ${fn} not found`, 'service shape changed — re-audit'); continue; }
      const viaRenderer = /renderTurnForCognition\(/.test(body);
      const viaHelper = /appendAllContextAddenda\(|buildMaiaWisePrompt\(|buildMaiaComprehensivePrompt\(/.test(body);
      const direct = GUARDS.every((g) => body.includes(g));
      if (viaRenderer || viaHelper || direct) {
        io.pass(`${label} prompt path carries the floor`, viaRenderer ? 'canonical renderer' : viaHelper ? 'appendAllContextAddenda channel' : 'direct references');
      } else {
        io.fail(`${label} prompt path does NOT carry the floor`, `${fn} neither calls the renderer/addenda channel nor references the guardrails (census D1)`);
      }
    }
  },
};
