/**
 * Practitioner Field System — DB-backed resolution (Phase 1a)
 *
 * Single async function that assembles a PractitionerField from:
 *   - practitioners (profile + field_config JSONB)
 *   - practitioner_themes (theme_json, color_palette, fonts)
 *   - services (active, bookable)
 *   - ai_companion_configs (MAIA persona — optional)
 */

import db from '@/lib/db/postgres';
import { FIELD_PRESETS } from '@/lib/masters/theme';
import type {
  PractitionerField,
  PracticeType,
  FieldType,
  FieldModule,
  FieldCTA,
  FieldPalette,
} from './types';
import type { FieldTheme } from '@/lib/masters/theme';
import type { MaiaPersona } from '@/lib/masters/types';
import {
  DEFAULT_MODULES_GUIDE,
  DEFAULT_MODULES_HEALER,
  validateModules,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function defaultThemeForSlug(slug: string): FieldTheme {
  const key = slug as keyof typeof FIELD_PRESETS;
  return FIELD_PRESETS[key] ?? FIELD_PRESETS.kelly;
}

function defaultPalette(theme: FieldTheme): FieldPalette {
  return {
    primary:    theme.primaryColor,
    accent:     theme.primaryColor,   // darkened in UI via opacity
    background: theme.backgroundColor,
    text:       theme.tone === 'dark' ? '#F5EFE6' : '#2C1A0A',
  };
}

function defaultModules(practiceType: PracticeType): FieldModule[] {
  return practiceType === 'healer' ? DEFAULT_MODULES_HEALER : DEFAULT_MODULES_GUIDE;
}

function defaultCTA(slug: string): FieldCTA {
  return { label: 'Begin', href: `/${slug}/book`, style: 'invitation' };
}

function defaultOpeningLine(name: string): string {
  return `Welcome to ${name}'s field.`;
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

export async function resolveField(slugOrSubdomain: string): Promise<PractitionerField | null> {
  // --- 1. Core practitioner row ---
  // Try exact slug match first, then check practitioner_domains.subdomain
  const practResult = await db.query<{
    id: string;
    slug: string;
    name: string;
    business_name: string | null;
    tagline: string | null;
    bio: string | null;
    photo_url: string | null;
    specialties: string[] | null;
    field_config: Record<string, unknown> | null;
  }>(
    `SELECT
       p.id, p.slug, p.name, p.business_name, p.tagline, p.bio, p.photo_url, p.specialties,
       p.field_config
     FROM practitioners p
     LEFT JOIN practitioner_domains pd ON pd.practitioner_id = p.id
     WHERE (p.slug = $1 OR pd.subdomain = $1) AND p.status = 'active'
     LIMIT 1`,
    [slugOrSubdomain]
  );

  if (practResult.rows.length === 0) return null;

  const p = practResult.rows[0];
  const slug = p.slug; // Use the canonical slug from DB (not the input which may be a subdomain)
  const fc = (p.field_config ?? {}) as Record<string, unknown>;

  // --- 2. Theme row ---
  // practitioner_themes has: theme_json (JSONB), vibe (text)
  const themeResult = await db.query<{
    theme_json: Record<string, unknown> | null;
    vibe: string | null;
  }>(
    `SELECT theme_json, vibe
     FROM practitioner_themes
     WHERE practitioner_id = $1`,
    [p.id]
  );

  const themeRow = themeResult.rows[0] ?? null;

  // Merge: DB theme_json > field_config.theme > slug-based preset
  const theme: FieldTheme = (themeRow?.theme_json as FieldTheme | null) ??
    (fc.theme as FieldTheme | null) ??
    defaultThemeForSlug(slug);

  // Palette: extract from theme_json if present, else from field_config, else generate
  const themeJsonPalette = themeRow?.theme_json as Record<string, unknown> | null;
  const palette: FieldPalette =
    (themeJsonPalette?.palette as FieldPalette | null) ??
    (fc.palette as FieldPalette | null) ??
    defaultPalette(theme);

  // --- 3. Services ---
  const servicesResult = await db.query<{
    id: string;
    name: string;
    slug: string | null;
    description: string | null;
    duration_minutes: number | null;
    price_cents: number | null;
    is_featured: boolean;
    is_bookable: boolean;
  }>(
    `SELECT
       id, name, slug, description, duration_minutes, price_cents,
       COALESCE(is_featured, false) AS is_featured,
       COALESCE(is_bookable, true) AS is_bookable
     FROM services
     WHERE practitioner_id = $1 AND is_active = true
     ORDER BY COALESCE(is_featured, false) DESC, COALESCE(display_order, 999) ASC, name ASC
     LIMIT 12`,
    [p.id]
  );

  // --- 4. Testimonials ---
  const testimonialsResult = await db.query<{
    id: string;
    client_name: string;
    content: string;
    rating: number | null;
    service_name: string | null;
  }>(
    `SELECT
       t.id, t.client_name, t.content, t.rating,
       s.name AS service_name
     FROM testimonials t
     LEFT JOIN services s ON s.id = t.service_id
     WHERE t.practitioner_id = $1 AND t.is_approved = true
     ORDER BY t.is_featured DESC, t.created_at DESC
     LIMIT 6`,
    [p.id]
  );

  // --- 5. MAIA persona (optional) ---
  const maiaResult = await db.query<{
    voice_style: string | null;
    tone: Record<string, unknown> | null;
    frameworks: string[] | null;
    system_prompt_template: string | null;
  }>(
    `SELECT voice_style, tone, frameworks, system_prompt_template
     FROM ai_companion_configs
     WHERE practitioner_id = $1
     LIMIT 1`,
    [p.id]
  );

  let maia: MaiaPersona | null = null;
  if (maiaResult.rows.length > 0) {
    const m = maiaResult.rows[0];
    const toneJson = (m.tone ?? {}) as Record<string, unknown>;
    // Map DB voice_style to MaiaPersona tone
    const toneMap: Record<string, MaiaPersona['tone']> = {
      somatic:  'somatic-precise',
      warm:     'relational-warm',
      direct:   'grounded-analytical',
      poetic:   'expansive-exploratory',
      mystical: 'expansive-exploratory',
      grounded: 'grounded-analytical',
      clinical: 'grounded-analytical',
    };
    maia = {
      tone:            toneMap[m.voice_style ?? 'warm'] ?? 'relational-warm',
      cadence:         (toneJson.cadence as MaiaPersona['cadence']) ?? 'measured',
      responseStyle:   (toneJson.responseStyle as MaiaPersona['responseStyle']) ?? 'medium',
      frameworks:      m.frameworks ?? [],
      trackFor:        (toneJson.trackFor as string[]) ?? [],
      avoidPatterns:   (toneJson.avoidPatterns as string[]) ?? [],
      preferPatterns:  (toneJson.preferPatterns as string[]) ?? [],
      systemPromptBlock: m.system_prompt_template ?? '',
    };
  }

  // --- 6. Assemble field config values ---
  const fieldType: FieldType =
    (fc.fieldType as FieldType | undefined) ?? 'practitioner';

  const practiceType: PracticeType =
    (fc.practiceType as PracticeType | undefined) ?? 'guide';

  const shortName =
    (fc.shortName as string | undefined) ?? (p.name ?? slug).split(' ')[0];

  const presenceConfig = (fc.presence as Record<string, unknown> | undefined) ?? {};
  const storyConfig    = (fc.story as Record<string, unknown> | undefined) ?? {};
  const ctaConfig      = (fc.cta as Partial<FieldCTA> | undefined) ?? {};

  const hasServices = servicesResult.rows.length > 0;
  const rawModules: FieldModule[] =
    (fc.modules as FieldModule[] | undefined) ?? defaultModules(practiceType);
  const modules = validateModules(rawModules, hasServices);

  const cta: FieldCTA = {
    label: ctaConfig.label ?? 'Begin',
    href:  ctaConfig.href  ?? `/${slug}/book`,
    style: ctaConfig.style ?? 'invitation',
  };

  // --- 7. Assemble and return ---
  return {
    id:           p.id,
    slug:         p.slug,
    name:         p.name,
    shortName,
    tagline:      p.tagline ?? null,
    bio:          p.bio ?? null,
    photoUrl:     p.photo_url ?? null,
    specialties:  p.specialties ?? [],
    fieldType,
    practiceType,

    presence: {
      openingLine:           (presenceConfig.openingLine as string | undefined) ?? defaultOpeningLine(p.name),
      subLine:               (presenceConfig.subLine as string | undefined),
      backgroundDescription: (presenceConfig.backgroundDescription as string | undefined) ?? '',
    },

    story: {
      headline:   (storyConfig.headline as string | undefined) ?? p.tagline ?? p.name,
      lead:       (storyConfig.lead as string | undefined) ?? p.bio ?? '',
      paragraphs: (storyConfig.paragraphs as string[] | undefined) ?? [],
      lineage:    (storyConfig.lineage as string[] | undefined) ?? [],
    },

    modules,
    cta,
    palette,
    theme,
    maia,

    // Forward structured field_config keys for page components
    heroImage: (fc.heroImage as string | undefined) ?? null,
    workIntro: (fc.workIntro as Record<string, string> | undefined) ?? null,
    serviceLanes: (fc.serviceLanes as Array<{ label: string; slugs: string[] }> | undefined) ?? null,

    services: servicesResult.rows.map(s => ({
      id:              s.id,
      name:            s.name,
      slug:            s.slug,
      description:     s.description,
      durationMinutes: s.duration_minutes,
      priceCents:      s.price_cents,
      featured:        s.is_featured,
      bookable:        s.is_bookable,
    })),

    testimonials: testimonialsResult.rows.map(t => ({
      id:          t.id,
      clientName:  t.client_name,
      content:     t.content,
      rating:      t.rating,
      serviceName: t.service_name,
    })),
  };
}
