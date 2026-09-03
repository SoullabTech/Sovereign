import type { RefusalCheck } from './harness';

/**
 * Refusal 26 — G3 — No open channel into cognition (CMT-01).
 *
 * getMaiaResponse() must accept a CanonicalTurn only. The untyped `meta` bag —
 * `meta?: Record<string, unknown>` read 200 times as `(meta as any)` across 62 keys — is the
 * single structural defect the canonical turn closes (spec §0).
 *
 * EXPECTED STATE: RED on the current tree until M3. Committed red on purpose: the count is
 * the baseline the migration burns down.
 */

const SERVICE = 'lib/sovereign/maiaService.ts';
const TYPES = 'lib/maia/canonical-turn/types.ts';

/** Strip block and line comments so doc text cannot trip a structural pattern (innocent-negative). */
function code(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}


export const check: RefusalCheck = {
  id: 'R26',
  refusal: 'Cognition cannot be handed an open, untyped context channel — getMaiaResponse accepts a CanonicalTurn only',
  grade: 'Proposed',
  enforcedBy: 'lib/sovereign/maiaService.ts getMaiaResponse signature (after M3); lib/maia/canonical-turn/types.ts (no index signature)',
  evidence: 'MaiaRequest.meta?: Record<string, unknown> (:590); (meta as any) ×200 (census)',
  violationAttempted: 'find an index signature / Record<string, unknown> / `meta` field on the turn type, or any `(meta as any)` read in the service',
  passingAuthorizes: 'no route or tier can supply or read participation outside the closed type',
  passingDoesNotAuthorize: 'that the producers admitted are correct — that is MIPA + policy (R30), not this',
  hostileForkMustChange: 'add an index signature / meta field to CanonicalTurn, or re-introduce Record<string, unknown> on the cognition request — visible diff',

  run(io) {
    // 1. The canonical type has no open channel.
    if (!io.exists(TYPES)) { io.fail('canonical-turn types module absent', TYPES); }
    else {
      const t = code(io.read(TYPES));
      const open = [
        [/\[\s*key\s*:\s*string\s*\]/, 'index signature'],
        [/Record<\s*string\s*,\s*unknown\s*>/, 'Record<string, unknown>'],
        [/\b(meta|extra|raw|addenda)\s*\??\s*:/, 'open-bag field (meta/extra/raw/addenda)'],
      ] as const;
      const hits = open.filter(([re]) => re.test(t)).map(([, label]) => label);
      if (hits.length === 0) io.pass('CanonicalTurn type has no open channel');
      else io.fail('CanonicalTurn type has an open channel', hits.join(', '));
    }

    // 2. The service does not read an untyped meta bag.
    const svc = code(io.read(SERVICE));
    const casts = (svc.match(/\(meta as any\)/g) ?? []).length;
    if (casts === 0) io.pass('no (meta as any) reads in maiaService');
    else io.fail(`(meta as any) reads in maiaService: ${casts}`, 'open channel still read by cognition (baseline 200 at M0)');

    // 3. The cognition request type does not carry Record<string, unknown>.
    const reqType = svc.slice(svc.indexOf('type MaiaRequest = {'), svc.indexOf('type MaiaRequest = {') + 800);
    if (reqType && /Record<\s*string\s*,\s*unknown\s*>/.test(reqType)) {
      io.fail('MaiaRequest.meta is Record<string, unknown>', 'cognition accepts an open bag');
    } else if (/getMaiaResponse\(\s*turn\s*:\s*CanonicalTurn/.test(svc)) {
      io.pass('getMaiaResponse accepts CanonicalTurn');
    } else {
      io.fail('getMaiaResponse does not accept CanonicalTurn', 'signature not yet migrated (M3)');
    }
  },
};
