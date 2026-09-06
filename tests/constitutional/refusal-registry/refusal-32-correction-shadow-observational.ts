import type { RefusalCheck } from './harness';

/**
 * Refusal 32 — E1 correction-candidate shadow is OBSERVATIONAL and CONTENT-FREE.
 *
 * Founder authorization (2026-09-06, whole-organism map §9): the first zero-diff shadow
 * instrument. Its standing conditions, each proven structurally here:
 *   (1) the classifier module lives in lib/maia/canonical-turn (already under R31's
 *       no-persistence surface) and imports nothing;
 *   (2) the /list block calls only the classifier, console.log, memberRef and array helpers,
 *       is wrapped in try/catch, and is gated by MAIA_CORRECTION_SHADOW and !isSanctuary;
 *   (3) the block sits AFTER the legacy getMaiaResponse call — nothing on the response path
 *       can read it;
 *   (4) the logged object carries no member text: none of message / sovereignText / content /
 *       text / memberMessage appears inside the console.log call.
 */

const MODULE = 'lib/maia/canonical-turn/correctionShadow.ts';
const ROUTE = 'app/api/sovereign/app/maia/list/route.ts';
const START = 'E1 — CORRECTION-CANDIDATE SHADOW';
const END = 'ANAMNESIS WRITE';

const ALLOWED_CALLS = new Set(['classifyCorrectionCandidate', 'log', 'warn', 'memberRef', 'isArray', 'map', 'filter', 'slice', 'Boolean']);

function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

export const check: RefusalCheck = {
  id: 'R32',
  refusal: 'The E1 correction-candidate shadow on /list is observational and content-free — it reads nothing into cognition, writes nothing, and logs no member text',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/correctionShadow.ts (pure, no imports); /list E1 block (after getMaiaResponse, try/catch, kill-switch, Sanctuary-refused); refusal R31 covers the module directory for persistence',
  evidence: 'module import count = 0; block call set ⊆ allowed; block index > legacy cognition call index; no content key inside the log call',
  violationAttempted: 'find an import in the classifier, a foreign call in the block, a block placed before cognition, or a member-text key inside the logged object',
  passingAuthorizes: 'the shadow can only add one console line per non-Sanctuary /list turn',
  passingDoesNotAuthorize: 'that the lexicon detects misattunement — a candidate is a marker, not a finding; nor that MAIA notices corrections (that is the E1 witness)',
  hostileForkMustChange: 'add an import or a write to the module, add a call to the block, move the block above cognition, or log member text — visible diff',

  run(io) {
    // 1. The classifier imports nothing and contains no side-effect surface.
    const mod = code(io.read(MODULE));
    const imports = mod.match(/^\s*import\s/gm) ?? [];
    if (imports.length === 0) io.pass('classifier module has zero imports');
    else io.fail('classifier module imports something', String(imports.length));
    if (!/\b(fetch|query|pool|INSERT|UPDATE|DELETE|upsert|writeFile|logAgentRun|TurnsStore)\b/.test(mod)) io.pass('classifier module has no side-effect surface');
    else io.fail('side-effect surface inside classifier');

    // 2. The /list block: located, gated, fail-safe, calls only the allowed set.
    const route = io.read(ROUTE);
    const start = route.indexOf(START);
    const end = route.indexOf(END, start);
    if (start < 0 || end < 0) { io.fail('E1 block not found in /list'); return; }
    const block = code(route.slice(start, end));
    const calls = Array.from(new Set((block.match(/\b([A-Za-z_]+)\(/g) ?? []).map((c) => c.slice(0, -1)))).filter((c) => !/^(if|for|while|switch|catch)$/.test(c));
    const foreign = calls.filter((c) => !ALLOWED_CALLS.has(c));
    if (foreign.length === 0) io.pass('E1 block calls only the classifier, log, memberRef and array helpers', calls.join(', '));
    else io.fail('E1 block makes a non-allowed call', foreign.join(', '));
    if (/try \{[\s\S]*\} catch \(correctionShadowErr/.test(block)) io.pass('E1 block is fail-safe (try/catch)');
    else io.fail('E1 block is not wrapped in try/catch');
    if (/process\.env\.MAIA_CORRECTION_SHADOW !== '0'/.test(block) && /!isSanctuary/.test(block)) io.pass('E1 block gated by kill-switch and Sanctuary');
    else io.fail('E1 block gate shape changed');

    // 3. The block sits after the legacy cognition call.
    const legacyCall = route.lastIndexOf('getMaiaResponse({', start);
    if (legacyCall > 0 && legacyCall < start) io.pass('E1 block follows the legacy getMaiaResponse call');
    else io.fail('E1 block is not after the legacy cognition call');

    // 4. No member text inside the logged object.
    const logCall = block.match(/console\.log\(CORRECTION_SHADOW_MARKER[\s\S]*?\}\s*\)/);
    if (!logCall) { io.fail('E1 log call not found'); return; }
    if (!/\b(message|sovereignText|content|text|memberMessage|priorAssistantResponse)\b/.test(logCall[0])) io.pass('E1 log payload carries no member-text key');
    else io.fail('E1 log payload references member text');
  },
};
