import { pool } from "@/lib/db/postgres";
import {
  PractitionerThemeSchemaV1,
  enforceTierConstraints,
  PRACTITIONER_THEME_DEFAULTS_V1,
  type PractitionerThemeV1,
  type PractitionerTier,
} from "./practitionerTheme";
import { VIBE_PRESETS, applyVibePreset, type VibePresetKey } from "./vibePresets";

/**
 * THEME SERVICE
 *
 * Centralized server-side logic for theme operations.
 * All tier lookups come from DB, never from payload.
 */

export interface PractitionerRecord {
  id: string;
  practiceName: string;
  practitionerName: string;
  slug: string;
  tier: PractitionerTier;
  status: string;
}

export interface ThemeResult {
  theme: PractitionerThemeV1;
  practitioner: PractitionerRecord;
}

/**
 * Get theme for a practitioner.
 * Returns defaults if no theme exists.
 * Does NOT enforce tier constraints on read (stable reads).
 */
export async function getTheme(practitionerId: string): Promise<ThemeResult | null> {
  const result = await pool.query(
    `SELECT
      p.id,
      p.practice_name,
      p.practitioner_name,
      p.slug,
      p.tier,
      p.status,
      pt.theme_json,
      pt.version
    FROM practitioners p
    LEFT JOIN practitioner_themes pt ON pt.practitioner_id = p.id
    WHERE p.id = $1`,
    [practitionerId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];
  const practitioner: PractitionerRecord = {
    id: row.id,
    practiceName: row.practice_name,
    practitionerName: row.practitioner_name,
    slug: row.slug,
    tier: row.tier as PractitionerTier,
    status: row.status,
  };

  // If no theme exists, return defaults with practitioner identity
  let theme: PractitionerThemeV1;
  if (!row.theme_json) {
    theme = {
      ...PRACTITIONER_THEME_DEFAULTS_V1,
      tier: practitioner.tier,
      identity: {
        ...PRACTITIONER_THEME_DEFAULTS_V1.identity,
        practiceName: practitioner.practiceName,
        practitionerName: practitioner.practitionerName,
        domain: `${practitioner.slug}.soullab.life`,
      },
    };
  } else {
    theme = row.theme_json as PractitionerThemeV1;
    // Validate structure but don't mutate
    // If stored theme has wrong tier, it will be corrected on next write
  }

  return { theme, practitioner };
}

/**
 * Get theme by slug (for public/client access).
 */
export async function getThemeBySlug(slug: string): Promise<ThemeResult | null> {
  const result = await pool.query(
    `SELECT id FROM practitioners WHERE slug = $1`,
    [slug]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return getTheme(result.rows[0].id);
}

/**
 * Update theme for a practitioner.
 * Tier is ALWAYS sourced from DB, ignoring payload tier.
 * Enforces tier constraints before saving.
 */
export async function updateTheme(
  practitionerId: string,
  themePayload: Partial<PractitionerThemeV1>
): Promise<{ success: true; theme: PractitionerThemeV1 } | { success: false; error: string; details?: unknown }> {
  // 1. Get practitioner with authoritative tier
  const practitionerResult = await pool.query(
    `SELECT id, tier, practice_name, practitioner_name, slug FROM practitioners WHERE id = $1`,
    [practitionerId]
  );

  if (practitionerResult.rows.length === 0) {
    return { success: false, error: "Practitioner not found" };
  }

  const practitioner = practitionerResult.rows[0];
  const dbTier = practitioner.tier as PractitionerTier;

  // 2. Get current theme to merge with
  const currentTheme = await getTheme(practitionerId);
  const baseTheme = currentTheme?.theme || PRACTITIONER_THEME_DEFAULTS_V1;

  // 3. Merge payload with current theme, FORCE tier from DB
  const mergedTheme = {
    ...baseTheme,
    ...themePayload,
    tier: dbTier, // Always override from DB
    identity: {
      ...baseTheme.identity,
      ...themePayload.identity,
    },
    theme: {
      ...baseTheme.theme,
      ...themePayload.theme,
      colors: {
        ...baseTheme.theme.colors,
        ...themePayload.theme?.colors,
      },
      typography: {
        ...baseTheme.theme.typography,
        ...themePayload.theme?.typography,
      },
    },
    ai: {
      ...baseTheme.ai,
      ...themePayload.ai,
      pronouns: {
        ...baseTheme.ai.pronouns,
        ...themePayload.ai?.pronouns,
      },
    },
    content: {
      ...baseTheme.content,
      ...themePayload.content,
      emailTemplates: {
        ...baseTheme.content.emailTemplates,
        ...themePayload.content?.emailTemplates,
      },
    },
    features: {
      ...baseTheme.features,
      ...themePayload.features,
    },
    limits: {
      ...baseTheme.limits,
      ...themePayload.limits,
    },
  };

  // 4. Validate schema
  const parseResult = PractitionerThemeSchemaV1.safeParse(mergedTheme);
  if (!parseResult.success) {
    return {
      success: false,
      error: "Invalid theme configuration",
      details: parseResult.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    };
  }

  // 5. Enforce tier constraints (only on write)
  const validatedTheme = enforceTierConstraints(parseResult.data);

  // 6. Upsert to DB
  await pool.query(
    `INSERT INTO practitioner_themes (practitioner_id, version, theme_json, vibe)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (practitioner_id)
     DO UPDATE SET
       version = $2,
       theme_json = $3,
       vibe = $4,
       updated_at = NOW()`,
    [
      practitionerId,
      validatedTheme.version,
      JSON.stringify(validatedTheme),
      validatedTheme.theme.vibe,
    ]
  );

  return { success: true, theme: validatedTheme };
}

/**
 * Apply a vibe preset to a practitioner's theme.
 * Preserves identity and custom settings, updates colors/typography/tone.
 */
export async function applyPreset(
  practitionerId: string,
  presetKey: string
): Promise<{ success: true; theme: PractitionerThemeV1 } | { success: false; error: string }> {
  // Validate preset key
  if (!VIBE_PRESETS[presetKey as VibePresetKey]) {
    return {
      success: false,
      error: `Invalid preset: ${presetKey}. Valid: ${Object.keys(VIBE_PRESETS).join(", ")}`,
    };
  }

  // Get current theme
  const current = await getTheme(practitionerId);
  if (!current) {
    return { success: false, error: "Practitioner not found" };
  }

  // Apply preset
  const withPreset = applyVibePreset(current.theme, presetKey as VibePresetKey);

  // Save (updateTheme handles tier enforcement)
  return updateTheme(practitionerId, withPreset);
}

/**
 * List available presets with preview data.
 */
export function listPresets() {
  return Object.entries(VIBE_PRESETS).map(([key, preset]) => ({
    key,
    name: preset.name,
    description: preset.description,
    colors: preset.theme.colors,
    typography: preset.theme.typography,
    aiTone: preset.ai.tone,
  }));
}
