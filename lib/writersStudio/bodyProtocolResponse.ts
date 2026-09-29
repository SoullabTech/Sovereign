/**
 * P4R1 reconciliation — map the CURRENT developmental Ask protocol into the
 * existing writer-facing authorization vocabulary. The current route transports
 * authority identities plus frozen ordinals, never authored headings.
 */
import type { BodyProtocolOutcome, DisclosureSection } from './bodyAuthorization';

type Orientation = { sectionRef: string; ordinal: number };

function orientedSections(json: Record<string, unknown>): DisclosureSection[] {
  const raw = Array.isArray(json.sectionOrientations) ? json.sectionOrientations : [];
  const seen = new Set<string>();
  const out: DisclosureSection[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const sectionRef = (item as Record<string, unknown>).sectionRef;
    const ordinal = (item as Record<string, unknown>).ordinal;
    if (typeof sectionRef !== 'string' || !Number.isInteger(ordinal)) continue;
    if (seen.has(sectionRef)) continue;
    seen.add(sectionRef);
    out.push({
      sectionId: sectionRef,
      label: `Section ${ordinal}`,
      ordinal: ordinal as number,
    });
  }

  /* Fallback for older route shapes, kept only so historical test fixtures stay
     readable. Current production never needs to show an opaque identity. */
  if (out.length === 0 && Array.isArray(json.sections)) {
    for (const value of json.sections) {
      if (!value || typeof value !== 'object') continue;
      const sectionId = (value as Record<string, unknown>).sectionId;
      const label = (value as Record<string, unknown>).label;
      if (typeof sectionId === 'string' && typeof label === 'string') {
        out.push({ sectionId, label });
      }
    }
  }
  return out;
}

export function bodyOutcomeFrom(
  status: number,
  json: Record<string, unknown>,
): BodyProtocolOutcome | null {
  switch (json.result) {
    case 'BODY_AUTHORITY_REQUIRED':
      return typeof json.pendingAskRef === 'string'
        ? {
            kind: 'BODY_AUTHORITY_REQUIRED',
            sections: orientedSections(json),
            pendingAskRef: json.pendingAskRef,
          }
        : { kind: 'PENDING_UNAVAILABLE' };

    case 'BODY_SCOPE_INCOMPLETE':
      return typeof json.pendingAskRef === 'string'
        ? {
            kind: 'BODY_SCOPE_INCOMPLETE',
            outstanding: orientedSections(json),
            pendingAskRef: json.pendingAskRef,
          }
        : { kind: 'PENDING_UNAVAILABLE' };

    case 'AUTHORIZATION_EXPIRED':
      return { kind: 'PENDING_EXPIRED' };

    case 'INTERRUPTED':
      return { kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' };

    case 'BODY_UNVERIFIABLE':
      return { kind: 'BODY_UNVERIFIABLE' };

    /* The current route returns the completed durable thread on replay. Let the
       ordinary Ask path consume it as a normal successful result. */
    case 'ALREADY_COMPLETED':
      return null;
  }

  switch (json.refusal) {
    case 'authorization_not_for_this_ask':
      return { kind: 'PENDING_MISMATCH' };
    case 'disclosure_unavailable':
      return {
        kind: 'DISCLOSURE_UNAVAILABLE',
        actSpent: true,
        sections: orientedSections(json),
      };
    case 'not_found':
      return status === 404 ? { kind: 'PENDING_UNKNOWN' } : null;
    default:
      return null;
  }
}
