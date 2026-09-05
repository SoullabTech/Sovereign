"use client";

import React, { useMemo } from "react";
import type { PractitionerThemeV1 } from "@/lib/theme/practitionerTheme";
import { themeToCssVars } from "@/lib/theme/themeCssVars";

/**
 * APPLY THEME VARS
 *
 * Scoped CSS variable application for tenant theming.
 * Wraps children in a container with CSS custom properties.
 */

interface ApplyThemeVarsProps {
  theme: PractitionerThemeV1;
  children: React.ReactNode;
  className?: string;
}

export function ApplyThemeVars({ theme, children, className = "" }: ApplyThemeVarsProps) {
  const vars = useMemo(() => themeToCssVars(theme), [theme]);

  return (
    // No remote font stylesheet is emitted here. Typography resolves through
    // themeToCssVars alone — see the sovereignty note in lib/theme/themeCssVars.ts.
    <>
      <div
        style={vars as React.CSSProperties}
        className={className}
        data-tenant-theme="v1"
        data-vibe={theme.theme.vibe}
      >
        {children}
      </div>
    </>
  );
}

/**
 * THEME PROVIDER
 *
 * Context-based theme provider for deeply nested components.
 */

const ThemeContext = React.createContext<PractitionerThemeV1 | null>(null);

interface ThemeProviderProps {
  theme: PractitionerThemeV1;
  children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={theme}>
      <ApplyThemeVars theme={theme} className="min-h-screen">
        {children}
      </ApplyThemeVars>
    </ThemeContext.Provider>
  );
}

export function useTheme(): PractitionerThemeV1 | null {
  return React.useContext(ThemeContext);
}

export function useThemeRequired(): PractitionerThemeV1 {
  const theme = React.useContext(ThemeContext);
  if (!theme) {
    throw new Error("useThemeRequired must be used within a ThemeProvider");
  }
  return theme;
}

/**
 * THEME PREVIEW
 *
 * For onboarding/admin preview without full page takeover.
 */

interface ThemePreviewProps {
  theme: PractitionerThemeV1;
  children: React.ReactNode;
  scale?: number;
}

export function ThemePreview({ theme, children, scale = 0.5 }: ThemePreviewProps) {
  const vars = useMemo(() => themeToCssVars(theme), [theme]);

  return (
    <div
      className="overflow-hidden rounded-lg border shadow-lg"
      style={{
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: `${100 / scale}%`,
        height: `${100 / scale}%`,
      }}
    >
      <div
        style={vars as React.CSSProperties}
        className="min-h-full"
        data-tenant-theme="v1"
        data-vibe={theme.theme.vibe}
        data-preview="true"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * VIBE SWATCH
 *
 * Color preview component for vibe selection UI.
 */

interface VibeSwatchProps {
  colors: PractitionerThemeV1["theme"]["colors"];
  selected?: boolean;
  onClick?: () => void;
}

export function VibeSwatch({ colors, selected = false, onClick }: VibeSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
        ${selected ? "border-white ring-2 ring-white/50 scale-105" : "border-transparent hover:scale-102"}
      `}
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-1/3"
        style={{ backgroundColor: colors.surface }}
      />
      <div
        className="absolute top-2 left-2 w-3 h-3 rounded-full"
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className="absolute top-2 right-2 w-2 h-2 rounded-full"
        style={{ backgroundColor: colors.accent }}
      />
    </button>
  );
}
