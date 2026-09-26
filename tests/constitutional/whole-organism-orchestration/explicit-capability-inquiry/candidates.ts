import {
  PILOT_PRESENTATIONS,
  type PilotPresentation,
} from './fixture';
import type {
  DescriptionOnlyPayload,
  ExplicitCapabilityInquiryResolution,
} from './resolver';

export const FALSIFIER_INPUTS = [
  {
    id: 'F-O8-01',
    input: 'What is Save to Journal?',
    reason: 'NON_PILOT_CAPABILITY',
  },
  {
    id: 'F-O8-02',
    input: 'I had a dream.',
    reason: 'NOT_DEFINITIONAL',
  },
  {
    id: 'F-O8-03',
    input: 'Record my dream.',
    reason: 'ACTION_SHAPED',
  },
  {
    id: 'F-O8-04',
    input: 'Can I use Astrology Reading?',
    reason: 'AVAILABILITY_SHAPED',
  },
  {
    id: 'F-O8-05',
    input: 'Where is New Journal Entry?',
    reason: 'NAVIGATION_SHAPED',
  },
  {
    id: 'F-O8-06',
    input: 'What is journal entry?',
    reason: 'NO_EXACT_NAME_MATCH',
  },
  {
    id: 'F-O8-07',
    input: 'What is dream recording?',
    reason: 'NO_EXACT_NAME_MATCH',
  },
] as const;

export const SYNTHETIC_CONTEXTUAL_RESOLVER_SOURCE = `
function resolveExplicitCapabilityInquiry(rawUtterance, conversationHistory) {
  return inferCapability(rawUtterance, conversationHistory);
}
`;

export function mutateRenderedWithOffer(rendered: string): string {
  return rendered + ' Would you like me to do that?';
}

export function mutatePayloadWithRoute(
  payload: DescriptionOnlyPayload,
): DescriptionOnlyPayload & { route: string } {
  return { ...payload, route: '/journal' };
}

export function mutatePayloadWithAvailability(
  payload: DescriptionOnlyPayload,
): DescriptionOnlyPayload & { available: boolean } {
  return { ...payload, available: true };
}

export function mutatePayloadCopy(
  payload: DescriptionOnlyPayload,
): DescriptionOnlyPayload {
  return {
    ...payload,
    purpose: payload.purpose + ' This version has been paraphrased.',
  };
}

export function mutantFallbackOnAbstain(
  resolution: ExplicitCapabilityInquiryResolution,
): DescriptionOnlyPayload | null {
  if (resolution.kind === 'ABSTAIN') {
    const fallback = PILOT_PRESENTATIONS[0];
    return {
      kind: 'DESCRIPTION_ONLY',
      capabilityId: fallback.capabilityId,
      name: fallback.name,
      purpose: fallback.purpose,
    };
  }
  return null;
}

export function widenedPilotFixture(): any[] {
  const widened: any[] = JSON.parse(JSON.stringify(PILOT_PRESENTATIONS));
  widened.push({
    capabilityId: 'journal.save',
    name: 'Save to Journal',
    purpose: 'Preserve the part of an exchange you choose in your Journal.',
  });
  return widened;
}

export const SYNTHETIC_RUNTIME_IMPORT =
  "import { PLATFORM_KNOWLEDGE_ADDENDUM } from '../../../../lib/sovereign/platformKnowledge';";

export function clonePilotFixture(): PilotPresentation[] {
  return JSON.parse(JSON.stringify(PILOT_PRESENTATIONS));
}
