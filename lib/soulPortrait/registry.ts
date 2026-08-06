/**
 * Soul Portrait registry
 * ────────────────────────────────────────────────────────────────────────
 * The seam between "static / template-driven" (today) and "generated"
 * (later). Today this is a hand-authored map of slug → SoulPortrait. When a
 * generator exists, it can register portraits here (or this can become a DB
 * lookup) without the renderer or route changing.
 *
 * Privacy note: portraits may describe minors (see `person.isMinor`). They
 * are intentionally NOT linked from global navigation — access is by direct,
 * unlisted URL. A generalised multi-user version must add real auth/consent
 * gating before any portrait is broadly reachable.
 */

import type { AnyPortrait } from './schema';
import { augustenPortrait } from './portraits/augusten';
import { katiePortrait } from './portraits/katie';
import { sophiePortrait } from './portraits/sophie';
import { andreaPortrait } from './portraits/andrea';
import { andreaFaganPortrait } from './portraits/andreaFagan';
import { catherinePortrait } from './portraits/catherine';
import { kellyPortrait } from './portraits/kelly';
import { nathanPortrait } from './portraits/nathan';
import { jondiPortrait } from './portraits/jondi';
import { heatherPortrait } from './portraits/heather';
// Privacy gate (founder directive 2026-08-05, IP inventory audit Phase 0):
// Larry's portrait carries a real person's birth date/time/place and a deeply
// personal reading on an unauthenticated public route. Withdrawn from the
// public registry until he has consented to public exposure. The portrait
// content is preserved in ./portraits/larry — re-enabling is this import +
// the registry line below.
// import { larryPortrait } from './portraits/larry';
import { summerPortrait } from './portraits/summer';

const PORTRAITS: Record<string, AnyPortrait> = {
  [augustenPortrait.person.slug]: augustenPortrait,
  [katiePortrait.person.slug]: katiePortrait,
  [sophiePortrait.person.slug]: sophiePortrait,
  [andreaPortrait.person.slug]: andreaPortrait,
  [andreaFaganPortrait.person.slug]: andreaFaganPortrait,
  [catherinePortrait.person.slug]: catherinePortrait,
  [kellyPortrait.person.slug]: kellyPortrait,
  [nathanPortrait.person.slug]: nathanPortrait,
  [jondiPortrait.person.slug]: jondiPortrait,
  [heatherPortrait.person.slug]: heatherPortrait,
  [summerPortrait.person.slug]: summerPortrait,
};

export function getPortrait(slug: string): AnyPortrait | null {
  return PORTRAITS[slug] ?? null;
}

export function listPortraitSlugs(): string[] {
  return Object.keys(PORTRAITS);
}
