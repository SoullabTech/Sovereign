import type { PractitionerThemeV1 } from "./practitionerTheme";
import { PRACTITIONER_THEME_DEFAULTS_V1 } from "./practitionerTheme";

/**
 * VIBE PRESETS
 *
 * Pre-configured theme bundles for different practitioner aesthetics.
 * Each preset defines colors, typography, and AI tone.
 *
 * Future: Add asset packs (hero images, icons, textures)
 */

export type VibePresetKey = "earthy" | "celestial" | "minimal" | "warm" | "mystical" | "clinical";

export interface VibePreset {
  key: VibePresetKey;
  name: string;
  description: string;
  theme: PractitionerThemeV1["theme"];
  ai: Pick<PractitionerThemeV1["ai"], "tone">;
}

export const VIBE_PRESETS: Record<VibePresetKey, VibePreset> = {
  earthy: {
    key: "earthy",
    name: "Earthy",
    description: "Grounded, organic, nature-inspired. For somatic and body-centered practices.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "earthy",
      colors: {
        primary: "#8A6B3B",
        accent: "#3F6B4E",
        background: "#0E1210",
        surface: "#161C17",
        text: "#F5F1E8",
        textMuted: "#B8B1A3",
        border: "#27302A",
      },
      typography: { heading: "source_serif", body: "inter" },
      borderRadius: "soft",
      customCss: null,
    },
    ai: { tone: "warm" },
  },

  celestial: {
    key: "celestial",
    name: "Celestial",
    description: "Starlit, cosmic, expansive. For astrologers and cosmic-oriented practices.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "celestial",
      colors: {
        primary: "#D6B56E",
        accent: "#4A6FA5",
        background: "#0B1020",
        surface: "#121A33",
        text: "#F8FAFF",
        textMuted: "#A9B3D1",
        border: "#223058",
      },
      typography: { heading: "playfair_display", body: "dm_sans" },
      borderRadius: "soft",
      customCss: null,
    },
    ai: { tone: "poetic" },
  },

  minimal: {
    key: "minimal",
    name: "Minimal",
    description: "Clean, modern, professional. For clinical and evidence-based practices.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "minimal",
      colors: {
        primary: "#111827",
        accent: "#6B7280",
        background: "#FFFFFF",
        surface: "#F8FAFC",
        text: "#111827",
        textMuted: "#6B7280",
        border: "#E5E7EB",
      },
      typography: { heading: "space_grotesk", body: "inter" },
      borderRadius: "sharp",
      customCss: null,
    },
    ai: { tone: "direct" },
  },

  warm: {
    key: "warm",
    name: "Warm",
    description: "Inviting, nurturing, safe. For counseling and supportive practices.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "warm",
      colors: {
        primary: "#D48C6A",
        accent: "#7A4E3A",
        background: "#0F1419",
        surface: "#171E25",
        text: "#FFF7F2",
        textMuted: "#C9B4AA",
        border: "#263241",
      },
      typography: { heading: "fraunces", body: "inter" },
      borderRadius: "rounded",
      customCss: null,
    },
    ai: { tone: "warm" },
  },

  mystical: {
    key: "mystical",
    name: "Mystical",
    description: "Deep, mysterious, transformative. For depth psychology and shadow work.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "mystical",
      colors: {
        primary: "#A78BFA",
        accent: "#111827",
        background: "#070510",
        surface: "#120C22",
        text: "#F4F0FF",
        textMuted: "#BDB4D8",
        border: "#2A1F4A",
      },
      typography: { heading: "eb_garamond", body: "dm_sans" },
      borderRadius: "soft",
      customCss: null,
    },
    ai: { tone: "poetic" },
  },

  clinical: {
    key: "clinical",
    name: "Clinical",
    description: "Professional, trustworthy, accessible. For healthcare-adjacent practices.",
    theme: {
      ...PRACTITIONER_THEME_DEFAULTS_V1.theme,
      vibe: "clinical",
      colors: {
        primary: "#0F766E",
        accent: "#134E4A",
        background: "#F0FDFA",
        surface: "#FFFFFF",
        text: "#134E4A",
        textMuted: "#5F8A87",
        border: "#99F6E4",
      },
      typography: { heading: "inter", body: "inter" },
      borderRadius: "soft",
      customCss: null,
    },
    ai: { tone: "professional" },
  },
};

/**
 * Apply a vibe preset to an existing theme config
 */
export function applyVibePreset(
  existingTheme: PractitionerThemeV1,
  presetKey: VibePresetKey
): PractitionerThemeV1 {
  const preset = VIBE_PRESETS[presetKey];
  if (!preset) {
    throw new Error(`Unknown vibe preset: ${presetKey}`);
  }

  return {
    ...existingTheme,
    theme: {
      ...preset.theme,
      // Preserve custom CSS if exists (only for sovereign tier)
      customCss: existingTheme.theme.customCss,
    },
    ai: {
      ...existingTheme.ai,
      tone: preset.ai.tone,
    },
  };
}

/**
 * Get all vibe presets as array for UI rendering
 */
export function getVibePresetList(): VibePreset[] {
  return Object.values(VIBE_PRESETS);
}

/**
 * Check if current theme matches a vibe preset
 */
export function detectVibePreset(theme: PractitionerThemeV1): VibePresetKey | null {
  for (const [key, preset] of Object.entries(VIBE_PRESETS)) {
    if (
      theme.theme.colors.primary === preset.theme.colors.primary &&
      theme.theme.colors.background === preset.theme.colors.background
    ) {
      return key as VibePresetKey;
    }
  }
  return null;
}
