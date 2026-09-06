/**
 * MIPA — participation adjudication. Spec §6.
 *
 * PURE. No I/O, no loader calls, no clock. Deterministic for a fixture — that is what
 * makes it certifiable and makes the manifest reproducible.
 *
 * MIPA does not assemble. The turn does not decide. (Spec §1.)
 *
 * Four axes per candidate: provenance (registry) · authority (registry) · eligibility
 * (requires ∩ turn state) · restraint (policy rules).
 */

import { PRODUCER_REGISTRY, isProducerId, type ProducerId, type ProducerSpec } from './producerRegistry';
import { RESTRAINT_RULES, policyDecision, producersForRoom } from './policy';
import {
  CanonicalTurnRefused,
  type CandidateBlock,
  type AdmittedReason,
  type ExcludedParticipant,
  type HeldParticipant,
  type MemberIdentity,
  type Participant,
  type Participation,
  type PresentEncounter,
  type SovereigntyState,
} from './types';

export interface AdjudicationInput {
  readonly candidates: readonly CandidateBlock[];
  readonly identity: MemberIdentity;
  readonly encounter: PresentEncounter;
  readonly sovereignty: SovereigntyState;
}

export function adjudicateParticipation(input: AdjudicationInput): Participation {
  const { candidates, identity, encounter, sovereignty } = input;
  const room = encounter.room.kind;

  // G2 runtime lock: an unregistered producer refuses the whole turn, never degrades.
  for (const c of candidates) {
    if (!isProducerId(c.producerId)) {
      throw new CanonicalTurnRefused('unregistered_producer', String(c.producerId));
    }
  }

  const byId = new Map<ProducerId, CandidateBlock>();
  for (const c of candidates) byId.set(c.producerId, c);

  const admitted: Participant[] = [];
  // pdc-1 OFFERED lane: representable from M1, empty under pp-1 (no doorway producer yet — W1).
  const offered: Participant[] = [];
  const held: HeldParticipant[] = [];
  const excluded: ExcludedParticipant[] = [];
  const axesOf = (s: ProducerSpec) => ({ authoredBy: s.authoredBy, participationClass: s.participationClass, authority: s.authority });

  // Considered = every producer pp-1 registers for this room, in registry order.
  // Candidates for producers NOT registered for the room are EXCLUDED explicitly.
  const considered = producersForRoom(room);
  const consideredSet = new Set<ProducerId>(considered);

  for (const c of candidates) {
    if (!consideredSet.has(c.producerId)) {
      excluded.push({ producerId: c.producerId, ...axesOf(PRODUCER_REGISTRY[c.producerId]), disposition: 'EXCLUDED', reason: 'not_registered_for_room' });
    }
  }

  let inferAdmitted = 0;

  for (const id of considered) {
    // Widen to the interface: the `as const` registry narrows each entry to its literals,
    // and optional axes (recallPref) must be read through the contract, not the literal.
    const spec: ProducerSpec = PRODUCER_REGISTRY[id];

    // Floor producers are never adjudicated here — they are the floor (spec §5.4).
    if (spec.mandatory) continue;

    if (policyDecision(id, room) === 'exclude') {
      excluded.push({ producerId: id, ...axesOf(spec), disposition: 'EXCLUDED', reason: 'room_forbids' });
      continue;
    }

    // Eligibility — identity
    if (spec.requires.identity !== 'any' && identity.status !== spec.requires.identity) {
      excluded.push({ producerId: id, ...axesOf(spec), disposition: 'EXCLUDED', reason: 'no_verified_member' });
      continue;
    }
    // Room-level member-about gate — a consent basis is what makes a producer member-about.
    if (!encounter.room.memberAboutAllowed && spec.consentBasis !== null) {
      excluded.push({ producerId: id, ...axesOf(spec), disposition: 'EXCLUDED', reason: 'room_forbids' });
      continue;
    }
    if (spec.participationClass === 'authored' && spec.authoredBy === 'practitioner' && !encounter.room.fieldCompositionAllowed) {
      excluded.push({ producerId: id, ...axesOf(spec), disposition: 'EXCLUDED', reason: 'room_forbids' });
      continue;
    }

    // Restraint — sanctuary, recall prefs
    if (spec.requires.notSanctuary && sovereignty.sanctuary) {
      held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: 'sanctuary' });
      continue;
    }
    if (spec.requires.recallPref) {
      const pref = sovereignty.recallPrefs?.[spec.requires.recallPref];
      if (pref === false) {
        held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: 'recall_pref_off' });
        continue;
      }
    }

    // pp-2 restraint — continuity (founder ruling 2026-09-06): divination material participates
    // only when continuity is enabled; ephemeral turns hold it.
    if (RESTRAINT_RULES.requireContinuity.includes(id) && sovereignty.memoryMode === 'ephemeral') {
      held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: 'restraint:pp2_continuity_off' });
      continue;
    }
    // pp-2 restraint — ambient hold: held by default; lifted only by a member act this turn.
    const hold = RESTRAINT_RULES.ambientHold[id];
    let memberInvoked = false;
    if (hold) {
      const lifted =
        hold.liftsWhen === 'member_invocation' &&
        hold.domain !== undefined &&
        (sovereignty.memberInvocations ?? []).includes(hold.domain);
      if (!lifted) {
        held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: `restraint:${hold.rule}` });
        continue;
      }
      memberInvoked = true;
    }

    const candidate = byId.get(id);
    if (!candidate || candidate.text.trim().length === 0) {
      held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: 'no_material' });
      continue;
    }

    if (spec.authority === 'infer' && RESTRAINT_RULES.inferenceCap !== null && inferAdmitted >= RESTRAINT_RULES.inferenceCap) {
      held.push({ producerId: id, ...axesOf(spec), disposition: 'HELD', reason: 'inference_cap' });
      continue;
    }
    if (spec.authority === 'infer') inferAdmitted += 1;

    // pdc-1: ADMITTED carries its own basis. member-placed material is admitted BECAUSE the
    // member placed it; everything else is admitted as eligible; `member_invoked` marks a pp-2 ambient hold lifted by the member this turn.
    const admittedReason: AdmittedReason =
      spec.participationClass === 'placed' ? 'member_placed' : memberInvoked ? 'member_invoked' : 'eligible';
    admitted.push({
      producerId: id,
      ...axesOf(spec),
      disposition: 'ADMITTED',
      reason: admittedReason,
      text: candidate.text,
      ...(candidate.itemCount !== undefined ? { itemCount: candidate.itemCount } : {}),
    });
  }

  return { admitted, offered, held, excluded };
}
