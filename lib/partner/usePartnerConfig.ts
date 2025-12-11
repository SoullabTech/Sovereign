/**
 * Partner Configuration Hook
 * Provides partner-specific configuration throughout the application
 */

import { createContext, useContext, useEffect, useState } from 'react';
import { PartnerConfig, getPartnerConfig } from './partner-config';

interface PartnerContextValue {
  partnerConfig: PartnerConfig | null;
  partnerSlug: string | null;
  isPartnerThemed: boolean;
  themeCSS: string | null;
}

const PartnerContext = createContext<PartnerContextValue>({
  partnerConfig: null,
  partnerSlug: null,
  isPartnerThemed: false,
  themeCSS: null,
});

export function usePartnerConfig() {
  return useContext(PartnerContext);
}

// Hook to detect partner from URL or subdomain
export function usePartnerDetection() {
  const [partnerSlug, setPartnerSlug] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Method 1: Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const partnerParam = urlParams.get('partner');
    if (partnerParam) {
      setPartnerSlug(partnerParam);
      return;
    }

    // Method 2: Check subdomain
    const hostname = window.location.hostname;
    if (hostname.includes('tsaicity.sg') || hostname.includes('consciousness.tsaicity')) {
      setPartnerSlug('tsai-city');
      return;
    }

    if (hostname.includes('research.soullab')) {
      setPartnerSlug('research');
      return;
    }

    if (hostname.includes('collaborate.soullab')) {
      setPartnerSlug('collaborate');
      return;
    }

    if (hostname.includes('partners.soullab')) {
      setPartnerSlug('partners');
      return;
    }

    // Method 3: Check localStorage for session persistence
    const storedPartner = localStorage.getItem('partner-slug');
    if (storedPartner) {
      setPartnerSlug(storedPartner);
      return;
    }

    // Method 4: Check path-based routing (/partner/tsai-city)
    const pathMatch = window.location.pathname.match(/^\/partner\/([^\/]+)/);
    if (pathMatch) {
      setPartnerSlug(pathMatch[1]);
      return;
    }
  }, []);

  return partnerSlug;
}

// Hook to apply partner theme
export function usePartnerTheme(partnerConfig: PartnerConfig | null) {
  const [themeCSS, setThemeCSS] = useState<string | null>(null);

  useEffect(() => {
    if (!partnerConfig) {
      setThemeCSS(null);
      return;
    }

    const css = `
      :root {
        --partner-primary: ${partnerConfig.theme.primaryColor};
        --partner-secondary: ${partnerConfig.theme.secondaryColor};
        --partner-accent: ${partnerConfig.theme.accentColor};
        --partner-background: ${partnerConfig.theme.backgroundColor};
        --partner-font: ${partnerConfig.theme.fontFamily || '"Inter", system-ui, sans-serif'};
        --partner-heading-font: ${partnerConfig.theme.headingFont || '"Space Grotesk", sans-serif'};
      }

      .partner-themed {
        background-color: var(--partner-background);
        color: var(--partner-primary);
        font-family: var(--partner-font);
      }

      .partner-primary { color: var(--partner-primary); }
      .partner-secondary { color: var(--partner-secondary); }
      .partner-accent { color: var(--partner-accent); }

      .partner-bg-primary { background-color: var(--partner-primary); }
      .partner-bg-secondary { background-color: var(--partner-secondary); }
      .partner-bg-accent { background-color: var(--partner-accent); }

      .partner-border-primary { border-color: var(--partner-primary); }
      .partner-border-secondary { border-color: var(--partner-secondary); }
      .partner-border-accent { border-color: var(--partner-accent); }

      h1, h2, h3, h4, h5, h6 {
        font-family: var(--partner-heading-font);
      }

      /* Override default amber theme with partner colors */
      .bg-amber-500 { background-color: var(--partner-accent); }
      .bg-amber-600 { background-color: var(--partner-accent); }
      .text-amber-400 { color: var(--partner-accent); }
      .text-amber-500 { color: var(--partner-accent); }
      .text-amber-200 { color: var(--partner-secondary); }
      .border-amber-500 { border-color: var(--partner-accent); }

      /* Apply partner background to onboarding */
      .bg-\\[\\#1a1f3a\\] { background-color: var(--partner-background); }

      ${partnerConfig.theme.customCss || ''}
    `;

    setThemeCSS(css);

    // Inject CSS into document head
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('partner-theme-css');
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.id = 'partner-theme-css';
      style.textContent = css;
      document.head.appendChild(style);

      // Update favicon if specified
      if (partnerConfig.theme.faviconUrl) {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
        if (favicon) {
          favicon.href = partnerConfig.theme.faviconUrl;
        }
      }

      // Store partner slug in localStorage
      localStorage.setItem('partner-slug', partnerConfig.slug);
    }

    return () => {
      // Cleanup when component unmounts
      if (typeof document !== 'undefined') {
        const style = document.getElementById('partner-theme-css');
        if (style) {
          style.remove();
        }
      }
    };
  }, [partnerConfig]);

  return themeCSS;
}

// Provider component value factory
export function createPartnerContextValue(partnerSlug: string | null): PartnerContextValue {
  const partnerConfig = partnerSlug ? getPartnerConfig(partnerSlug) : null;
  const isPartnerThemed = !!partnerConfig;
  const themeCSS = null; // This will be handled by usePartnerTheme hook

  return {
    partnerConfig,
    partnerSlug,
    isPartnerThemed,
    themeCSS,
  };
}

export { PartnerContext };