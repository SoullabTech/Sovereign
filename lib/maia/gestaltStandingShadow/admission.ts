import type {
  ClaimAdmission,
  RelationalField,
  ResponseClaim,
  UseAs,
} from './types';

const GROUNDED_USE = new Set<UseAs>(['established', 'adopted']);

export function admitClaim(claim: ResponseClaim, field: RelationalField): ClaimAdmission {
  const standingById = new Map(field.standing.map((item) => [item.objectId, item]));
  const relationIds = new Set(field.relations.map((item) => item.id));
  const reasons: string[] = [];

  const missingObjects = claim.objectRefs.filter((id) => !standingById.has(id));
  const missingRelations = claim.relationRefs.filter((id) => !relationIds.has(id));
  if (missingObjects.length > 0) reasons.push('missing-object-ref');
  if (missingRelations.length > 0) reasons.push('missing-relation-ref');
  if (reasons.length > 0) {
    return {
      claimId: claim.id,
      admission: 'unadmitted',
      reasonCodes: reasons,
      evidenceRefs: claim.objectRefs,
      relationRefs: claim.relationRefs,
    };
  }

  if (claim.speechAct === 'CANDIDATE') {
    return {
      claimId: claim.id,
      admission: 'candidate',
      reasonCodes: ['maia-origin-candidate'],
      evidenceRefs: claim.objectRefs,
      relationRefs: claim.relationRefs,
    };
  }
  if (claim.speechAct === 'QUESTION') {
    const reopened = claim.reopenedObjectRefs ?? [];
    const reopensEstablished = reopened.some((id) => {
      const standing = standingById.get(id);
      return !!standing && GROUNDED_USE.has(standing.useAs);
    });
    if (reopensEstablished) {
      return {
        claimId: claim.id, admission: 'unadmitted',
        reasonCodes: ['question-reopens-established'],
        evidenceRefs: claim.objectRefs, relationRefs: claim.relationRefs,
      };
    }
    const presupposed = claim.presupposedObjectRefs ?? [];
    const badPresupposition = presupposed.some((id) => {
      const standing = standingById.get(id);
      return !standing || !GROUNDED_USE.has(standing.useAs);
    });
    return {
      claimId: claim.id,
      admission: badPresupposition ? 'unadmitted' : 'question',
      reasonCodes: [badPresupposition ? 'question-presupposes-unlicensed-claim' : 'open-inquiry'],
      evidenceRefs: claim.objectRefs,
      relationRefs: claim.relationRefs,
    };
  }

  if (claim.objectRefs.length === 0) {
    return {
      claimId: claim.id,
      admission: 'unadmitted',
      reasonCodes: ['grounded-claim-without-evidence'],
      evidenceRefs: [],
      relationRefs: claim.relationRefs,
    };
  }

  const allGrounded = claim.objectRefs.every((id) => {
    const standing = standingById.get(id);
    return !!standing && GROUNDED_USE.has(standing.useAs);
  });

  return {
    claimId: claim.id,
    admission: allGrounded ? 'grounded' : 'unadmitted',
    reasonCodes: [allGrounded ? 'standing-grounded' : 'object-standing-not-grounded'],
    evidenceRefs: claim.objectRefs,
    relationRefs: claim.relationRefs,
  };
}