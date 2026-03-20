/**
 * Master Field Registry
 *
 * The single source of truth for all active master fields.
 * Add a new master here — the portal, routing, and MAIA persona follow automatically.
 */

import type { MasterField } from './types';
import { JONDI_FIELD } from './jondi';
import { KELLY_FIELD } from './kelly';

/** All registered master fields */
const MASTER_FIELDS: MasterField[] = [JONDI_FIELD, KELLY_FIELD];

/** Look up a field by URL slug (e.g. 'jondi') */
export function getFieldBySlug(slug: string): MasterField | null {
  return MASTER_FIELDS.find((f) => f.slug === slug && f.active) ?? null;
}

/** Look up a field by subdomain (e.g. 'jondi.soullab.life') */
export function getFieldBySubdomain(host: string): MasterField | null {
  const normalized = host.toLowerCase().split(':')[0]; // strip port
  return MASTER_FIELDS.find((f) => f.subdomain === normalized && f.active) ?? null;
}

/** Extract master slug from a hostname, if it's a known field */
export function getSlugFromHost(host: string): string | null {
  const field = getFieldBySubdomain(host);
  return field?.slug ?? null;
}

/** All active field slugs — used for static generation */
export function getAllActiveSlugs(): string[] {
  return MASTER_FIELDS.filter((f) => f.active).map((f) => f.slug);
}
