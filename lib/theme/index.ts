/**
 * PRACTITIONER THEMING SYSTEM
 *
 * Central exports for theme configuration, validation, and rendering.
 */

// Schema and types
export {
  // Zod schemas
  PractitionerThemeSchemaV1,
  PractitionerTier,
  BorderRadius,
  ThemeVibe,
  AITone,
  AIPronouns,
  TherapeuticFramework,
  IntakeQuestion,
  HexColor,
  UrlOrPath,
  FontKey,
  FeatureFlags,

  // Types
  type PractitionerThemeV1,

  // Defaults and constraints
  PRACTITIONER_THEME_DEFAULTS_V1,
  TIER_CAPS,

  // Functions
  enforceTierConstraints,
  validateTheme,
  createThemeFromPartial,
} from "./practitionerTheme";

// CSS variable generation
export {
  themeToCssVars,
  themeToCssString,
} from "./themeCssVars";

// Vibe presets
export {
  VIBE_PRESETS,
  applyVibePreset,
  getVibePresetList,
  detectVibePreset,
  type VibePresetKey,
  type VibePreset,
} from "./vibePresets";

// Server-side service (use in API routes only)
export {
  getTheme,
  getThemeBySlug,
  updateTheme,
  applyPreset,
  listPresets,
  type PractitionerRecord,
  type ThemeResult,
} from "./themeService";
