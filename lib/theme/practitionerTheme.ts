import { z } from "zod";

/**
 * PRACTITIONER THEME SCHEMA v1
 *
 * Canonical contract shared by:
 * - DB persistence
 * - API validation
 * - Admin UI
 * - CSS variable generation
 *
 * Keep this file stable. Add fields via versioned migrations.
 */

// =============================================================================
// ENUMS
// =============================================================================

export const PractitionerTier = z.enum(["starter", "professional", "sovereign"]);
export type PractitionerTier = z.infer<typeof PractitionerTier>;

export const BorderRadius = z.enum(["sharp", "soft", "rounded"]);
export type BorderRadius = z.infer<typeof BorderRadius>;

export const ThemeVibe = z.enum([
  "earthy",
  "celestial",
  "minimal",
  "warm",
  "mystical",
  "clinical",
  "custom",
]);
export type ThemeVibe = z.infer<typeof ThemeVibe>;

export const AITone = z.enum(["warm", "professional", "poetic", "direct"]);
export type AITone = z.infer<typeof AITone>;

export const AIPronouns = z.enum(["she", "they", "he", "it", "custom"]);
export type AIPronouns = z.infer<typeof AIPronouns>;

export const TherapeuticFramework = z.enum([
  "archetypal_astrology",
  "evolutionary_astrology",
  "depth_psychology",
  "somatic",
  "cbt",
  "spiritual_direction",
  "integrative",
  "ifs",
  "relational",
  "alchemical",
]);
export type TherapeuticFramework = z.infer<typeof TherapeuticFramework>;

// =============================================================================
// PRIMITIVES
// =============================================================================

export const IntakeQuestion = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  type: z.enum(["short_text", "long_text", "single_select", "multi_select"]),
  options: z.array(z.string().min(1)).optional(),
  required: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
});
export type IntakeQuestion = z.infer<typeof IntakeQuestion>;

export const HexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color");

export const UrlOrPath = z.string().min(1);

export const FontKey = z.enum([
  "inter",
  "system",
  "cormorant_garamond",
  "eb_garamond",
  "source_serif",
  "merriweather",
  "fraunces",
  "dm_sans",
  "space_grotesk",
  "playfair_display",
]);
export type FontKey = z.infer<typeof FontKey>;

export const FeatureFlags = z.object({
  voice: z.boolean().default(false),
  textChat: z.boolean().default(true),
  dreamJournal: z.boolean().default(false),
  birthChart: z.boolean().default(false),
  sessionNotes: z.boolean().default(true),
  progressTracking: z.boolean().default(false),
  resourceLibrary: z.boolean().default(true),
  communityForum: z.boolean().default(false),
});
export type FeatureFlags = z.infer<typeof FeatureFlags>;

// =============================================================================
// MAIN SCHEMA
// =============================================================================

export const PractitionerThemeSchemaV1 = z.object({
  version: z.literal(1),

  // Governance
  tier: PractitionerTier,

  // Identity
  identity: z.object({
    practiceName: z.string().min(1),
    practitionerName: z.string().min(1),
    domain: z.string().min(1), // e.g. "alice.soullab.life" or "aliceastrology.com"
    logo: UrlOrPath.nullable().default(null),
    favicon: UrlOrPath.nullable().default(null),
    heroImage: UrlOrPath.nullable().default(null),
  }),

  // Visual system
  theme: z.object({
    vibe: ThemeVibe.default("custom"),

    colors: z.object({
      primary: HexColor,
      accent: HexColor,
      background: HexColor,
      surface: HexColor,
      text: HexColor,
      textMuted: HexColor,
      border: HexColor,
    }),

    typography: z.object({
      heading: FontKey,
      body: FontKey,
    }),

    borderRadius: BorderRadius.default("soft"),

    // Reserved for Sovereign only (enforced by sanitizer)
    customCss: z.string().max(50_000).nullable().default(null),
  }),

  // AI practice voice
  ai: z.object({
    name: z.string().min(1).default("MAIA"),
    pronouns: z.object({
      preset: AIPronouns.default("she"),
      custom: z.string().max(40).nullable().default(null),
    }),

    tone: AITone.default("warm"),

    // Prompt overlay: appended to the stable system prompt template
    personalityOverlay: z.string().max(10_000).nullable().default(null),

    // Framework selection drives routing + vocabulary
    primaryFramework: TherapeuticFramework.default("archetypal_astrology"),
    enabledFrameworks: z.array(TherapeuticFramework).default(["archetypal_astrology"]),
  }),

  // Content controlled by practitioner
  content: z.object({
    welcomeMessage: z.string().max(10_000).default(""),
    aboutPage: z.string().max(25_000).default(""),
    intakeQuestions: z.array(IntakeQuestion).default([]),

    emailTemplates: z
      .object({
        inviteClientSubject: z.string().max(120).default("Welcome to your portal"),
        inviteClientBody: z.string().max(10_000).default(""),
        sessionFollowupSubject: z.string().max(120).default("Integration notes"),
        sessionFollowupBody: z.string().max(10_000).default(""),
      })
      .default({}),
  }),

  // Feature visibility toggles (bounded by tier)
  features: FeatureFlags,

  // Limits (used for enforcement + billing/metering)
  limits: z.object({
    maxClients: z.number().int().min(1).default(25),
    monthlyMessages: z.number().int().min(0).default(2000),
    monthlyVoiceMinutes: z.number().int().min(0).default(0),
    maxResources: z.number().int().min(0).default(100),
  }),
});

export type PractitionerThemeV1 = z.infer<typeof PractitionerThemeSchemaV1>;

// =============================================================================
// DEFAULTS
// =============================================================================

export const PRACTITIONER_THEME_DEFAULTS_V1: PractitionerThemeV1 =
  PractitionerThemeSchemaV1.parse({
    version: 1,
    tier: "starter",
    identity: {
      practiceName: "Your Practice",
      practitionerName: "Practitioner",
      domain: "yourname.soullab.life",
      logo: null,
      favicon: null,
      heroImage: null,
    },
    theme: {
      vibe: "warm",
      colors: {
        primary: "#D4B896",
        accent: "#8B7355",
        background: "#0F1419",
        surface: "#1A1F2E",
        text: "#FFFFFF",
        textMuted: "#9CA3AF",
        border: "#2A3441",
      },
      typography: {
        heading: "cormorant_garamond",
        body: "inter",
      },
      borderRadius: "soft",
      customCss: null,
    },
    ai: {
      name: "MAIA",
      pronouns: { preset: "she", custom: null },
      tone: "warm",
      personalityOverlay: null,
      primaryFramework: "archetypal_astrology",
      enabledFrameworks: ["archetypal_astrology"],
    },
    content: {
      welcomeMessage: "",
      aboutPage: "",
      intakeQuestions: [],
      emailTemplates: {
        inviteClientSubject: "Welcome to your portal",
        inviteClientBody: "",
        sessionFollowupSubject: "Integration notes",
        sessionFollowupBody: "",
      },
    },
    features: {
      voice: false,
      textChat: true,
      dreamJournal: false,
      birthChart: false,
      sessionNotes: true,
      progressTracking: false,
      resourceLibrary: true,
      communityForum: false,
    },
    limits: {
      maxClients: 25,
      monthlyMessages: 2000,
      monthlyVoiceMinutes: 0,
      maxResources: 100,
    },
  });

// =============================================================================
// TIER CONSTRAINTS
// =============================================================================

export const TIER_CAPS = {
  starter: {
    allowCustomColors: false,
    allowTypography: false,
    allowTone: true,
    allowPersonalityOverlay: false,
    allowCustomCss: false,
    maxEnabledFrameworks: 1,
    maxClients: 25,
    monthlyMessages: 2000,
    monthlyVoiceMinutes: 0,
  },
  professional: {
    allowCustomColors: true,
    allowTypography: true,
    allowTone: true,
    allowPersonalityOverlay: true,
    allowCustomCss: false,
    maxEnabledFrameworks: 3,
    maxClients: 100,
    monthlyMessages: 10000,
    monthlyVoiceMinutes: 120,
  },
  sovereign: {
    allowCustomColors: true,
    allowTypography: true,
    allowTone: true,
    allowPersonalityOverlay: true,
    allowCustomCss: true,
    maxEnabledFrameworks: 10,
    maxClients: 500,
    monthlyMessages: 50000,
    monthlyVoiceMinutes: 600,
  },
} as const;

// =============================================================================
// TIER ENFORCEMENT
// =============================================================================

export function enforceTierConstraints(input: PractitionerThemeV1): PractitionerThemeV1 {
  const parsed = PractitionerThemeSchemaV1.parse(input);
  const caps = TIER_CAPS[parsed.tier];

  const out: PractitionerThemeV1 = structuredClone(parsed);

  // Starter bounds: force vibe presets to drive colors/typography
  if (!caps.allowCustomColors) {
    out.theme.colors = PRACTITIONER_THEME_DEFAULTS_V1.theme.colors;
  }

  if (!caps.allowTypography) {
    out.theme.typography = PRACTITIONER_THEME_DEFAULTS_V1.theme.typography;
    out.theme.borderRadius = PRACTITIONER_THEME_DEFAULTS_V1.theme.borderRadius;
  }

  if (!caps.allowPersonalityOverlay) {
    out.ai.personalityOverlay = null;
  }

  if (!caps.allowCustomCss) {
    out.theme.customCss = null;
  }

  // Framework caps
  if (out.ai.enabledFrameworks.length > caps.maxEnabledFrameworks) {
    out.ai.enabledFrameworks = out.ai.enabledFrameworks.slice(0, caps.maxEnabledFrameworks);
  }
  if (!out.ai.enabledFrameworks.includes(out.ai.primaryFramework)) {
    out.ai.enabledFrameworks = [out.ai.primaryFramework, ...out.ai.enabledFrameworks].slice(
      0,
      caps.maxEnabledFrameworks
    );
  }

  // Pronouns: if custom preset, custom string required; otherwise null
  if (out.ai.pronouns.preset !== "custom") {
    out.ai.pronouns.custom = null;
  } else if (!out.ai.pronouns.custom?.trim()) {
    out.ai.pronouns.custom = "she/they";
  }

  // Enforce tier limits
  out.limits.maxClients = Math.min(out.limits.maxClients, caps.maxClients);
  out.limits.monthlyMessages = Math.min(out.limits.monthlyMessages, caps.monthlyMessages);
  out.limits.monthlyVoiceMinutes = Math.min(out.limits.monthlyVoiceMinutes, caps.monthlyVoiceMinutes);

  return out;
}

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateTheme(input: unknown): { success: true; data: PractitionerThemeV1 } | { success: false; error: z.ZodError } {
  const result = PractitionerThemeSchemaV1.safeParse(input);
  if (result.success) {
    return { success: true, data: enforceTierConstraints(result.data) };
  }
  return { success: false, error: result.error };
}

export function createThemeFromPartial(partial: Partial<PractitionerThemeV1>): PractitionerThemeV1 {
  const merged = {
    ...PRACTITIONER_THEME_DEFAULTS_V1,
    ...partial,
    identity: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.identity,
      ...partial.identity,
    },
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      ...partial.theme,
      colors: {
        ...PRACTITIONER_THEME_DEFAULTS_V1.theme.colors,
        ...partial.theme?.colors,
      },
      typography: {
        ...PRACTITIONER_THEME_DEFAULTS_V1.theme.typography,
        ...partial.theme?.typography,
      },
    },
    ai: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.ai,
      ...partial.ai,
      pronouns: {
        ...PRACTITIONER_THEME_DEFAULTS_V1.ai.pronouns,
        ...partial.ai?.pronouns,
      },
    },
    content: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.content,
      ...partial.content,
      emailTemplates: {
        ...PRACTITIONER_THEME_DEFAULTS_V1.content.emailTemplates,
        ...partial.content?.emailTemplates,
      },
    },
    features: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.features,
      ...partial.features,
    },
    limits: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.limits,
      ...partial.limits,
    },
  };

  return enforceTierConstraints(PractitionerThemeSchemaV1.parse(merged));
}
