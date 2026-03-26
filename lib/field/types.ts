/**
 * Practitioner Field System — Unified Type System (Phase 1a)
 *
 * Merges portal + master field concepts into a single runtime type.
 * Imports MaiaPersona and FieldTheme from existing modules — no duplication.
 */

import type { MaiaPersona } from '@/lib/masters/types';
import type { FieldTheme } from '@/lib/masters/theme';

// Re-export for consumer convenience
export type { MaiaPersona, FieldTheme };

// ---------------------------------------------------------------------------
// Practice taxonomy
// ---------------------------------------------------------------------------

export type PracticeType =
  | 'healer'
  | 'guide'
  | 'trainer'
  | 'therapist'
  | 'coach'
  | 'mentor'
  | 'facilitator';

/** Distinguishes sovereign masters from regular practitioners */
export type FieldType = 'practitioner' | 'master';

// Required modules — every field must have these
export const REQUIRED_MODULE_IDS = ['threshold', 'work-with-me'] as const;

// Modules that auto-enable when services exist
export const AUTO_MODULE_IDS = ['booking'] as const;

// ---------------------------------------------------------------------------
// CTA strategy
// ---------------------------------------------------------------------------

export type CTAStyle = 'direct' | 'invitation' | 'exploration';

export type FieldCTA = {
  label: string;
  href: string;
  style: CTAStyle;
};

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export type FieldModule = {
  id: string;
  enabled: boolean;
  label: string;
  order: number;
  config?: Record<string, unknown>;
};

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export type FieldService = {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number | null;
  priceCents: number | null;
  featured: boolean;
  bookable: boolean;
};

// ---------------------------------------------------------------------------
// Testimonials
// ---------------------------------------------------------------------------

export type FieldTestimonial = {
  id: string;
  clientName: string;
  content: string;
  rating: number | null;
  serviceName: string | null;
};

// ---------------------------------------------------------------------------
// Palette (quick-access hex values, separate from full FieldTheme)
// ---------------------------------------------------------------------------

export type FieldPalette = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

// ---------------------------------------------------------------------------
// PractitionerField — the unified runtime type
// ---------------------------------------------------------------------------

export type PractitionerField = {
  // --- Identity ---
  id: string;
  slug: string;
  name: string;
  shortName: string;
  tagline: string | null;
  bio: string | null;
  photoUrl: string | null;
  specialties: string[];

  // --- Practice classification ---
  fieldType: FieldType;
  practiceType: PracticeType;

  // --- Threshold presence (landing impression) ---
  presence: {
    openingLine: string;
    subLine?: string;
    backgroundDescription: string;
  };

  // --- Story (about / lineage page) ---
  story: {
    headline: string;
    lead: string;
    paragraphs: string[];
    lineage: string[];
  };

  // --- Page modules — ordered, togglable ---
  modules: FieldModule[];

  // --- Primary CTA ---
  cta: FieldCTA;

  // --- Visual identity ---
  palette: FieldPalette;
  theme: FieldTheme;

  // --- MAIA persona (optional — falls back to defaults if not configured) ---
  maia: MaiaPersona | null;

  // --- Services (active, bookable) ---
  services: FieldService[];

  // --- Social proof ---
  testimonials: FieldTestimonial[];
};

// ---------------------------------------------------------------------------
// Default module sets — used when field_config.modules is absent
// ---------------------------------------------------------------------------

export const DEFAULT_MODULES_GUIDE: FieldModule[] = [
  { id: 'threshold',    enabled: true,  label: 'Threshold',    order: 1 },
  { id: 'presence',     enabled: true,  label: 'Presence',     order: 2 },
  { id: 'work-with-me', enabled: true,  label: 'Work With Me', order: 3 },
  { id: 'booking',      enabled: true,  label: 'Booking',      order: 4 },
  { id: 'maia',         enabled: true,  label: 'MAIA',         order: 5 },
  { id: 'resources',    enabled: true,  label: 'Resources',    order: 6 },
];

export const DEFAULT_MODULES_HEALER: FieldModule[] = [
  { id: 'threshold',    enabled: true,  label: 'Threshold',    order: 1 },
  { id: 'presence',     enabled: true,  label: 'Presence',     order: 2 },
  { id: 'work-with-me', enabled: true,  label: 'Work With Me', order: 3 },
  { id: 'groups',       enabled: true,  label: 'Groups',       order: 4 },
  { id: 'booking',      enabled: true,  label: 'Booking',      order: 5 },
  { id: 'maia',         enabled: true,  label: 'MAIA',         order: 6 },
  { id: 'testimonials', enabled: true,  label: 'Testimonials', order: 7 },
];

// ---------------------------------------------------------------------------
// FieldContext — runtime object passed to all field components
// ---------------------------------------------------------------------------

export type FieldContext = {
  slug: string;
  fieldType: FieldType;
  theme: FieldTheme;
  palette: FieldPalette;
  config: PractitionerField;
  services: FieldService[];
  maia: MaiaPersona | null;
};

// ---------------------------------------------------------------------------
// Module validation — prevents broken fields at config level
// ---------------------------------------------------------------------------

/** Ensures required modules are present and booking is enabled when services exist */
export function validateModules(modules: FieldModule[], hasServices: boolean): FieldModule[] {
  const ids = new Set(modules.map(m => m.id));

  // Ensure required modules exist
  for (const reqId of REQUIRED_MODULE_IDS) {
    if (!ids.has(reqId)) {
      modules.push({ id: reqId, enabled: true, label: reqId, order: 0 });
    }
  }

  // Auto-enable booking when services exist
  if (hasServices && !ids.has('booking')) {
    modules.push({ id: 'booking', enabled: true, label: 'Book', order: modules.length + 1 });
  }

  return modules.sort((a, b) => a.order - b.order);
}
