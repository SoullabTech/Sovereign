import { resolveFacetFlowSource, type RelationSourceFacet } from '@/lib/house/facetCrossing.server';
import {
  becomingSourceObjectType,
  isBecomingSourcePortFacet,
  type BecomingSourcePortFacet,
  type BecomingSourcePortPacket,
} from './sourcePorts';

type ResolveFacetSource = typeof resolveFacetFlowSource;

export async function resolveBecomingSourcePort(
  memberId: string,
  facet: string,
  refId: string,
  resolve: ResolveFacetSource = resolveFacetFlowSource,
): Promise<BecomingSourcePortPacket | null> {
  if (!isBecomingSourcePortFacet(facet)) throw new Error('BECOMING_SOURCE_FACET_NOT_ADMITTED');
  if (!refId.trim()) throw new Error('BECOMING_SOURCE_OBJECT_ID_REQUIRED');

  const source = await resolve(memberId, facet as RelationSourceFacet, refId.trim());
  if (!source) return null;

  return {
    facet: facet as BecomingSourcePortFacet,
    objectType: becomingSourceObjectType(facet as BecomingSourcePortFacet),
    objectId: source.refId,
    returnHref: source.href,
    memberSelected: true,
    label: source.label,
    excerpt: source.excerpt,
    persistence: 'none',
  };
}
