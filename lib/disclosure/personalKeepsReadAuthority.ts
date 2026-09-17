/**
 * MAIA-MAVEN-T1A · J5-3 — Personal Keeps request authority.
 *
 * This seam ends BEFORE projection/cognition. It may establish the request's
 * consent precondition, discover qualifying Keep identities, and mint one
 * immutable disclosure attempt per admitted object. It never resolves Keep
 * content and never confirms a crossing.
 */
import { randomUUID } from 'crypto';
import type { TurnPosture } from '@/lib/sanctuary/turnPosture';
import {
  requireConsentState,
  type ConsentPreconditionOutcome,
} from '@/lib/provenance/requireConsentState';
import {
  selectPersonalKeepRefs,
  type PersonalKeepRef,
} from '@/lib/psyche/personalKeepsRead';
import {
  mintDisclosureAttempt,
  type ContextDisclosureAttempt,
  type MintOutcome,
} from './contextDisclosureReceipt';

export interface PersonalKeepsReadAuthorityInput {
  requestId: string;
  memberId: string;
  sessionId: string;
  posture: TurnPosture;
  filterText: string | null;
}

export interface AuthorizedPersonalKeepRef {
  keepRef: string;
  disclosureId: string;
  receiptId: string;
}

export type PersonalKeepsReadAuthorityResult =
  | { readonly kind: 'sanctuary_refused' }
  | { readonly kind: 'consent_refused'; readonly outcome: ConsentPreconditionOutcome }
  | { readonly kind: 'authorized_empty'; readonly requestId: string }
  | {
      readonly kind: 'receipt_refused';
      readonly requestId: string;
      readonly attempted: readonly AuthorizedPersonalKeepRef[];
      readonly failedKeepRef: string;
      readonly outcome: MintOutcome;
    }
  | {
      readonly kind: 'authorized';
      readonly requestId: string;
      readonly authorized: readonly AuthorizedPersonalKeepRef[];
    };

export interface PersonalKeepsReadAuthorityDeps {
  requireConsent: typeof requireConsentState;
  selectRefs: (input: { memberId: string; text?: string; limit?: number }) => Promise<PersonalKeepRef[]>;
  mintReceipt: (attempt: ContextDisclosureAttempt) => Promise<MintOutcome>;
  makeDisclosureId: () => string;
}

const DEFAULT_DEPS: PersonalKeepsReadAuthorityDeps = {
  requireConsent: requireConsentState,
  selectRefs: selectPersonalKeepRefs,
  mintReceipt: mintDisclosureAttempt,
  makeDisclosureId: randomUUID,
};

/**
 * Establish request authority and receipt identities for at most five Keeps.
 *
 * No Keep title/body/source detail is returned from this seam. J5-4 must resolve
 * projection only after this function returns `authorized`.
 */
export async function authorizePersonalKeepsRead(
  input: PersonalKeepsReadAuthorityInput,
  deps: PersonalKeepsReadAuthorityDeps = DEFAULT_DEPS,
): Promise<PersonalKeepsReadAuthorityResult> {
  if (input.posture.sanctuary) return { kind: 'sanctuary_refused' };

  const consent = await deps.requireConsent({
    requestId: input.requestId,
    posture: input.posture,
    memberId: input.memberId,
    sessionId: input.sessionId,
  });
  if (consent.kind !== 'ready' && consent.kind !== 'existing_exact') {
    return { kind: 'consent_refused', outcome: consent };
  }

  const refs = await deps.selectRefs({
    memberId: input.memberId,
    ...(input.filterText ? { text: input.filterText } : {}),
    limit: 5,
  });
  if (refs.length === 0) {
    return { kind: 'authorized_empty', requestId: input.requestId };
  }

  const attempted: AuthorizedPersonalKeepRef[] = [];
  for (const ref of refs.slice(0, 5)) {
    const disclosureId = deps.makeDisclosureId();
    const outcome = await deps.mintReceipt({
      disclosureId,
      memberId: input.memberId,
      requestRef: input.requestId,
      boundary: 'maia.personal_keeps_read->maia_cognition',
      sourceClass: 'keep',
      participationBasis: 'member_invoked',
      sourceRef: ref.id,
      scopeKind: 'object',
      gesture: 'read_personal_keeps',
    });

    if (outcome.kind !== 'minted') {
      return {
        kind: 'receipt_refused',
        requestId: input.requestId,
        attempted,
        failedKeepRef: ref.id,
        outcome,
      };
    }

    attempted.push({ keepRef: ref.id, disclosureId, receiptId: outcome.id });
  }

  return { kind: 'authorized', requestId: input.requestId, authorized: attempted };
}
