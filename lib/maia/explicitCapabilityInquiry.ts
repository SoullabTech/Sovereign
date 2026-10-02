/**
 * O8R3 — Explicit Capability Inquiry.
 *
 * INERT PRODUCTION SOURCE.
 *
 * Pure deterministic resolver/composer for the three-capability description-only
 * pilot proved by O8R1 and O8R2R1.
 *
 * This module grants no route, availability, entitlement, offer, invocation,
 * member-context, or runtime authority. Zero production consumers are required
 * at O8R3 admission.
 */

export type PilotCapabilityId =
  | 'journal.create'
  | 'journal.dream'
  | 'astrology.reading';

export interface PilotPresentation {
  readonly capabilityId: PilotCapabilityId;
  readonly name: string;
  readonly purpose: string;
}

export const PILOT_PRESENTATIONS: readonly PilotPresentation[] = [
  {
    capabilityId: 'journal.create',
    name: 'New Journal Entry',
    purpose: 'Begin a new Journal entry for something you want to write down.',
  },
  {
    capabilityId: 'journal.dream',
    name: 'Record a Dream',
    purpose: 'Preserve a dream you choose to record in your Journal.',
  },
  {
    capabilityId: 'astrology.reading',
    name: 'Astrology Reading',
    purpose: 'Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are.',
  },
] as const;

export const KNOWN_NON_PILOT_APPROVED_NAMES = [
  'Save to Journal',
  'Current Transits',
  'Personal Transits',
  'Wisdom Inquiry',
  'Wisdom Sources',
  'Relationship Reflection',
  'Choose a Studio',
  "Writer's Studio",
  'Create Session',
] as const;
export type InquiryEnvelope = 'WHAT_IS' | 'WHAT_DOES_MEAN';

export type AbstainReason =
  | 'NO_EXACT_NAME_MATCH'
  | 'NON_PILOT_CAPABILITY'
  | 'NOT_DEFINITIONAL'
  | 'ACTION_SHAPED'
  | 'AVAILABILITY_SHAPED'
  | 'NAVIGATION_SHAPED'
  | 'AMBIGUOUS';

export type ExplicitCapabilityInquiryResolution =
  | {
      readonly kind: 'DESCRIBE';
      readonly capabilityId: PilotCapabilityId;
      readonly matchedName: string;
      readonly envelope: InquiryEnvelope;
    }
  | {
      readonly kind: 'ABSTAIN';
      readonly reason: AbstainReason;
    };

export interface DescriptionOnlyPayload {
  readonly kind: 'DESCRIPTION_ONLY';
  readonly capabilityId: PilotCapabilityId;
  readonly name: string;
  readonly purpose: string;
}

function asciiLower(value: string): string {
  return value.replace(/[A-Z]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 32)
  );
}

export function normalizeInquiry(value: string): string {
  let normalized = value
    .replace(/[\u2018\u2019\u02BC]/g, "'")
    .trim()
    .replace(/\s+/g, ' ');

  if (/[?.]$/.test(normalized)) {
    normalized = normalized.slice(0, -1).trimEnd();
  }

  return asciiLower(normalized);
}
const PILOT_BY_NORMALIZED_NAME = new Map(
  PILOT_PRESENTATIONS.map((record) => [normalizeInquiry(record.name), record] as const),
);

const NON_PILOT_NORMALIZED_NAMES = new Set(
  KNOWN_NON_PILOT_APPROVED_NAMES.map((name) => normalizeInquiry(name)),
);

function isActionShaped(input: string): boolean {
  return /^(start|record|open)\b/.test(input)
    || /^give me\b/.test(input);
}

function isAvailabilityShaped(input: string): boolean {
  return /^can i use\b/.test(input)
    || /^do i have\b/.test(input)
    || /^is .+ available(?: to me)?$/.test(input);
}

function isNavigationShaped(input: string): boolean {
  return /^where is\b/.test(input)
    || /^how do i get to\b/.test(input);
}

function isAmbiguousShape(input: string): boolean {
  return /^what's\b/.test(input)
    || /^tell me about\b/.test(input)
    || /^what can\b/.test(input);
}

function parseDefinitionalEnvelope(
  input: string,
): { envelope: InquiryEnvelope; target: string } | null {
  const whatIsPrefix = 'what is ';
  if (input.startsWith(whatIsPrefix) && input.length > whatIsPrefix.length) {
    return {
      envelope: 'WHAT_IS',
      target: input.slice(whatIsPrefix.length),
    };
  }

  const whatDoesPrefix = 'what does ';
  const meanSuffix = ' mean';
  if (
    input.startsWith(whatDoesPrefix)
    && input.endsWith(meanSuffix)
    && input.length > whatDoesPrefix.length + meanSuffix.length
  ) {
    return {
      envelope: 'WHAT_DOES_MEAN',
      target: input.slice(whatDoesPrefix.length, -meanSuffix.length),
    };
  }

  return null;
}
export function resolveExplicitCapabilityInquiry(
  rawUtterance: string,
): ExplicitCapabilityInquiryResolution {
  const input = normalizeInquiry(rawUtterance);

  if (isActionShaped(input)) {
    return { kind: 'ABSTAIN', reason: 'ACTION_SHAPED' };
  }

  if (isAvailabilityShaped(input)) {
    return { kind: 'ABSTAIN', reason: 'AVAILABILITY_SHAPED' };
  }

  if (isNavigationShaped(input)) {
    return { kind: 'ABSTAIN', reason: 'NAVIGATION_SHAPED' };
  }

  if (isAmbiguousShape(input)) {
    return { kind: 'ABSTAIN', reason: 'AMBIGUOUS' };
  }

  const parsed = parseDefinitionalEnvelope(input);
  if (!parsed) {
    return { kind: 'ABSTAIN', reason: 'NOT_DEFINITIONAL' };
  }

  const pilot = PILOT_BY_NORMALIZED_NAME.get(parsed.target);
  if (pilot) {
    return {
      kind: 'DESCRIBE',
      capabilityId: pilot.capabilityId,
      matchedName: pilot.name,
      envelope: parsed.envelope,
    };
  }

  if (NON_PILOT_NORMALIZED_NAMES.has(parsed.target)) {
    return { kind: 'ABSTAIN', reason: 'NON_PILOT_CAPABILITY' };
  }

  return { kind: 'ABSTAIN', reason: 'NO_EXACT_NAME_MATCH' };
}
export function composePilotDescription(
  capabilityId: PilotCapabilityId,
): DescriptionOnlyPayload {
  const record = PILOT_PRESENTATIONS.find(
    (candidate) => candidate.capabilityId === capabilityId,
  );

  if (!record) {
    throw new Error('PILOT_CAPABILITY_NOT_FOUND');
  }

  return {
    kind: 'DESCRIPTION_ONLY',
    capabilityId: record.capabilityId,
    name: record.name,
    purpose: record.purpose,
  };
}

export function composeResolvedInquiry(
  resolution: ExplicitCapabilityInquiryResolution,
): DescriptionOnlyPayload | null {
  if (resolution.kind !== 'DESCRIBE') return null;
  return composePilotDescription(resolution.capabilityId);
}

export function renderPilotDescription(
  payload: DescriptionOnlyPayload,
): string {
  return `${payload.name} — ${payload.purpose}`;
}
