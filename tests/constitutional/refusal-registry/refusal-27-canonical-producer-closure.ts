import type { RefusalCheck } from './harness';

/**
 * Refusal 27 — G2 — Producer-set closure (CMT-01).
 *
 * A block enters a turn only if its producerId is a key of PRODUCER_REGISTRY. Two locks:
 * type (ProducerId = keyof typeof PRODUCER_REGISTRY) and runtime (adjudicate throws
 * CanonicalTurnRefused('unregistered_producer')). Runtime behaviour is proven in
 * lib/maia/canonical-turn/__tests__; this check proves the STRUCTURE that makes it so.
 */

const REG = 'lib/maia/canonical-turn/producerRegistry.ts';
const ADJ = 'lib/maia/canonical-turn/adjudicate.ts';
const DIR = ['lib/maia/canonical-turn'];

export const check: RefusalCheck = {
  id: 'R27',
  refusal: 'No block enters a MAIA turn whose producer is not a key of the closed PRODUCER_REGISTRY',
  grade: 'Proposed',
  enforcedBy: 'lib/maia/canonical-turn/producerRegistry.ts (ProducerId = keyof); adjudicate.ts (runtime refusal)',
  evidence: 'ProducerId derived from registry keys; isProducerId guard; unregistered → CanonicalTurnRefused',
  violationAttempted: 'find a ProducerId that is not derived from the registry keys, a missing runtime guard, or an `as any` escape inside the canonical-turn module',
  passingAuthorizes: 'the producer set is structurally closed at the type and at the constructor',
  passingDoesNotAuthorize: 'that every live ingress constructs a turn (R-G5, M6) nor that the seed classification is correct (adjudicated separately)',
  hostileForkMustChange: 'widen ProducerId to string, delete the isProducerId refusal, or add an `as any` cast in the module — visible diff',

  run(io) {
    if (!io.exists(REG) || !io.exists(ADJ)) { io.fail('canonical-turn module absent', `${REG} / ${ADJ}`); return; }
    const reg = io.read(REG);
    const adj = io.read(ADJ);

    if (/export type ProducerId = keyof typeof PRODUCER_REGISTRY;/.test(reg)) io.pass('ProducerId is derived from registry keys');
    else io.fail('ProducerId not derived from registry keys');

    if (/satisfies Record<string, ProducerSpec>/.test(reg)) io.pass('registry entries are constrained by ProducerSpec');
    else io.fail('registry entries not constrained by ProducerSpec');

    if (/if \(!isProducerId\(c\.producerId\)\) \{\s*throw new CanonicalTurnRefused\('unregistered_producer'/.test(adj)) io.pass('unregistered producer refuses the turn at runtime');
    else io.fail('missing runtime unregistered-producer refusal');

    // Each entry must carry the amended three-field axis (Decision 2) — never a slash class.
    const entries = (reg.match(/^\s{2}'[a-z_.]+':\s*\{/gm) ?? []).length;
    const authored = (reg.match(/authoredBy:\s*'(house|member|practitioner|system|collective)'/g) ?? []).length;
    const classes = (reg.match(/participationClass:\s*'(constitutional|authored|placed|marked|declared|retrieved|computed|inferred|collective)'/g) ?? []).length;
    if (entries > 0 && authored === entries && classes === entries) io.pass('every entry carries authoredBy + participationClass', `${entries} producers`);
    else io.fail('entries missing the three-field axis', `entries=${entries} authoredBy=${authored} participationClass=${classes}`);
    if (/participationClass:\s*'[^']*\/[^']*'/.test(reg)) io.fail('slash-compound participation class found', 'Decision 2 forbids compound values');
    else io.pass('no slash-compound participation classes');

    const escapes = io.grep('as any', DIR).filter((l) => !/__tests__/.test(l));
    if (escapes.length === 0) io.pass('no `as any` inside canonical-turn module');
    else io.fail('`as any` inside canonical-turn module', escapes.slice(0, 3).join(' | '));
  },
};
