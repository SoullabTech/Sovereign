import { DOORWAYS, type DoorwayId } from './doorways';

export interface EcologicalReferralInput {
  from: DoorwayId;
  to: DoorwayId;
  reason: string;
  aroseFromCurrentWork: boolean;
  userHasShownInterest: boolean;
}

export interface EcologicalReferral {
  allowed: boolean;
  destination?: string;
  language?: string;
  reason?: string;
}

/**
 * Constellation referral law.
 *
 * A cross-Studio invitation is not an upsell. It is permitted only when the
 * possibility arose from the person's current work and they have shown
 * interest in the underlying subject. The current room remains primary and
 * declining the invitation changes nothing about access or relationship.
 */
export function considerEcologicalReferral(input: EcologicalReferralInput): EcologicalReferral {
  if (input.from === input.to) {
    return { allowed: false, reason: 'already-in-destination' };
  }

  if (!DOORWAYS[input.from].bridges.includes(input.to)) {
    return { allowed: false, reason: 'no-declared-bridge' };
  }

  if (!input.aroseFromCurrentWork || !input.userHasShownInterest) {
    return { allowed: false, reason: 'insufficient-relational-ground' };
  }

  const destination = DOORWAYS[input.to];
  return {
    allowed: true,
    destination: destination.path,
    language: `There may be something here that extends beyond this room. If you ever want to explore it directly, ${destination.name} is available in Soullab. We do not have to leave what we are doing now.`,
  };
}
