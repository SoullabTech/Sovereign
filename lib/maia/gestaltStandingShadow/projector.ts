import type { GestaltProjection, RelationalField } from './types';

/**
 * Shadow-only deterministic projector.
 *
 * It does not summarize, infer, rank, or generate language. It only exposes
 * evidence text under the standing class already computed by the resolver.
 * This is deliberately boring: projection must not become a second author.
 */
export function projectGestalt(field: RelationalField): GestaltProjection {
  const evidenceById = new Map(field.evidence.map((item) => [item.id, item]));
  const established: string[] = [];
  const adopted: string[] = [];
  const provisional: string[] = [];
  const unresolved: string[] = [];
  const historicalOnly: string[] = [];
  const open: string[] = [];
  const includedIds: string[] = [];

  for (const standing of field.standing) {
    const object = evidenceById.get(standing.objectId);
    if (!object || standing.useAs === 'inadmissible') continue;
    includedIds.push(object.id);
    switch (standing.useAs) {
      case 'established': established.push(object.text); break;
      case 'adopted': adopted.push(object.text); break;
      case 'provisional': provisional.push(object.text); break;
      case 'unresolved': unresolved.push(object.text); break;
      case 'historical_only': historicalOnly.push(object.text); break;
      case 'question_only': open.push(object.text); break;
    }
  }
  return {
    established,
    adopted,
    provisional,
    unresolved,
    historicalOnly,
    open,
    relationIds: field.relations.map((relation) => relation.id),
    evidenceIds: includedIds,
  };
}
