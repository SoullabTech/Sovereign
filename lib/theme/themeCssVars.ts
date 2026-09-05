import type { PractitionerThemeV1, FontKey, BorderRadius } from "./practitionerTheme";

/**
 * THEME CSS VARIABLE GENERATOR
 *
 * Maps PractitionerTheme config -> CSS custom properties.
 * Apply these vars at document root or tenant root container.
 */

export function themeToCssVars(theme: PractitionerThemeV1): Record<string, string> {
  const vars: Record<string, string> = {};

  // Color tokens
  const c = theme.theme.colors;
  vars["--color-primary"] = c.primary;
  vars["--color-accent"] = c.accent;
  vars["--color-background"] = c.background;
  vars["--color-surface"] = c.surface;
  vars["--color-text"] = c.text;
  vars["--color-text-muted"] = c.textMuted;
  vars["--color-border"] = c.border;

  // Derived color tokens (computed from base)
  vars["--color-primary-hover"] = adjustBrightness(c.primary, 10);
  vars["--color-primary-active"] = adjustBrightness(c.primary, -10);
  vars["--color-surface-hover"] = adjustBrightness(c.surface, 5);

  // Font tokens
  vars["--font-heading"] = fontKeyToCss(theme.theme.typography.heading);
  vars["--font-body"] = fontKeyToCss(theme.theme.typography.body);

  // Radius tokens
  vars["--radius"] = radiusToCss(theme.theme.borderRadius);
  vars["--radius-sm"] = radiusSmToCss(theme.theme.borderRadius);
  vars["--radius-lg"] = radiusLgToCss(theme.theme.borderRadius);

  // Spacing (consistent across themes)
  vars["--spacing-xs"] = "0.25rem";
  vars["--spacing-sm"] = "0.5rem";
  vars["--spacing-md"] = "1rem";
  vars["--spacing-lg"] = "1.5rem";
  vars["--spacing-xl"] = "2rem";

  // Transitions
  vars["--transition-fast"] = "150ms ease";
  vars["--transition-normal"] = "200ms ease";
  vars["--transition-slow"] = "300ms ease";

  return vars;
}

/**
 * Generate CSS string for inline style or stylesheet injection
 */
export function themeToCssString(theme: PractitionerThemeV1, selector = ":root"): string {
  const vars = themeToCssVars(theme);
  const declarations = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  let css = `${selector} {\n${declarations}\n}`;

  // Append custom CSS for Sovereign tier
  if (theme.theme.customCss) {
    css += `\n\n/* Custom CSS */\n${theme.theme.customCss}`;
  }

  return css;
}

/**
 * Convert FontKey to CSS font-family stack
 */
function fontKeyToCss(k: FontKey): string {
  const fontStacks: Record<FontKey, string> = {
    system: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`,
    inter: `"Inter", ui-sans-serif, system-ui, sans-serif`,
    dm_sans: `"DM Sans", ui-sans-serif, system-ui, sans-serif`,
    space_grotesk: `"Space Grotesk", ui-sans-serif, system-ui, sans-serif`,
    cormorant_garamond: `"Cormorant Garamond", ui-serif, Georgia, serif`,
    eb_garamond: `"EB Garamond", ui-serif, Georgia, serif`,
    merriweather: `"Merriweather", ui-serif, Georgia, serif`,
    source_serif: `"Source Serif 4", ui-serif, Georgia, serif`,
    fraunces: `"Fraunces", ui-serif, Georgia, serif`,
    playfair_display: `"Playfair Display", ui-serif, Georgia, serif`,
  };
  return fontStacks[k];
}

/**
 * Convert BorderRadius to CSS value
 */
function radiusToCss(v: BorderRadius): string {
  const radii: Record<BorderRadius, string> = {
    sharp: "0.25rem",
    soft: "0.75rem",
    rounded: "1.25rem",
  };
  return radii[v];
}

function radiusSmToCss(v: BorderRadius): string {
  const radii: Record<BorderRadius, string> = {
    sharp: "0.125rem",
    soft: "0.375rem",
    rounded: "0.625rem",
  };
  return radii[v];
}

function radiusLgToCss(v: BorderRadius): string {
  const radii: Record<BorderRadius, string> = {
    sharp: "0.5rem",
    soft: "1rem",
    rounded: "1.75rem",
  };
  return radii[v];
}

/**
 * Adjust hex color brightness
 */
function adjustBrightness(hex: string, percent: number): string {
  // Remove # if present
  const color = hex.replace(/^#/, "");

  // Parse hex to RGB
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, r + (r * percent) / 100));
  g = Math.min(255, Math.max(0, g + (g * percent) / 100));
  b = Math.min(255, Math.max(0, b + (b * percent) / 100));

  // Convert back to hex
  return `#${Math.round(r).toString(16).padStart(2, "0")}${Math.round(g).toString(16).padStart(2, "0")}${Math.round(b).toString(16).padStart(2, "0")}`;
}

/**
 * TENANT TYPOGRAPHY — sovereignty boundary
 *
 * There was a getGoogleFontsUrl() here. It built a fonts.googleapis.com css2
 * URL from a theme's FontKeys, and ApplyThemeVars rendered it into the member's
 * DOM as <link rel="stylesheet">. Mounted nowhere yet — but the component
 * exists to be mounted, and the first practitioner tenant to apply a theme
 * would have had every member on that surface call Google to render the page.
 *
 * A member's browser must not call a third party to render this UI. That does
 * not become acceptable because the third party is chosen by a practitioner
 * rather than by us.
 *
 * Themes now resolve through fontKeyToCss() alone, which emits complete
 * font-family stacks with local and system fallbacks. Tenants render in those
 * until the families they want are vendored.
 *
 * To give a tenant a real webfont: vendor it with scripts/vendor-google-fonts.mjs
 * into public/fonts/, add its @font-face to app/fonts.css, and add the family to
 * that key's stack in fontKeyToCss(). Do not reintroduce a remote stylesheet.
 * Enforced at closure by W4b in scripts/witness/local-fonts-production-witness.mjs.
 */
