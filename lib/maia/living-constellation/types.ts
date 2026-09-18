/**
 * LC-02 — Living Constellation read-only projection types.
 *
 * These types describe DISPLAY PROJECTIONS of existing source objects.
 * They do not create a new source of truth and grant no persistence authority.
 */
export type ConstellationDomain =
  | 'living_field'
  | 'vision_studio'
  | 'practice_field';

export type ConstellationFocus = 'living' | 'vision' | 'practice';

export type ConstellationSourceType =
  | 'living_field_expression'
  | 'vision_thread'
  | 'practice_field';

export type ConstellationAuthorship =
  | 'member_authored'
  | 'member_confirmed'
  | 'maia_candidate'
  | 'practitioner_authored';

export type ConstellationPrivacy =
  | 'member_private'
  | 'member_shared_with_practitioner'
  | 'practitioner_private';
export interface ConstellationSourceRef {
  table: string;
  sourceSurface: string;
  persistedCenter?: string | null;
}

export interface ConstellationProjectionNode {
  projectionId: string;
  domain: ConstellationDomain;
  sourceType: ConstellationSourceType;
  sourceId: string;
  label: string;
  excerpt: string | null;
  authorship: ConstellationAuthorship;
  standing: string;
  privacy: ConstellationPrivacy;
  createdAt: string | null;
  updatedAt: string | null;
  source: ConstellationSourceRef;
  details?: Record<string, string | number | boolean | null>;
}

export interface ConstellationMemberCenter {
  projectionId: 'member:center';
  label: 'You';
  kind: 'orientation_only';
}
export interface LivingConstellationProjection {
  memberCenter: ConstellationMemberCenter;
  nodes: ConstellationProjectionNode[];
  partial: boolean;
  warnings: string[];
  generatedAt: string;
}
