/**
 * Partner Configuration System
 * Enables white-labeling of the MAIA consciousness computing platform
 * for partners like TSAI City while maintaining core functionality
 */

export interface PartnerThemeConfig {
  // Visual branding
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  logoUrl: string;
  faviconUrl?: string;

  // Typography
  fontFamily?: string;
  headingFont?: string;

  // Custom CSS overrides
  customCss?: string;
}

export interface PartnerOnboardingConfig {
  // Welcome flow customization
  welcomeTitle: string;
  welcomeSubtitle: string;
  organizationName: string;

  // Onboarding steps to include/exclude
  includeElementalOrientation: boolean;
  includeFAQSection: boolean;
  includeConsciousnessPreparation: boolean;
  includeDaimonIntroduction: boolean;

  // Custom welcome messages
  customWelcomeMessages?: string[];

  // Partner-specific context
  partnerContext: string; // e.g., "TSAI City Innovation Hub"
  partnerMission?: string;
}

export interface PartnerBrandingConfig {
  // Basic info
  partnerName: string;
  partnerSlug: string; // URL-safe identifier
  contactEmail: string;
  supportUrl?: string;

  // Legal/compliance
  privacyPolicyUrl?: string;
  termsOfServiceUrl?: string;

  // Integration settings
  customDomain?: string;
  analyticsId?: string;
}

export interface PartnerConfig {
  id: string;
  slug: string;
  name: string;
  active: boolean;

  // Configuration sections
  theme: PartnerThemeConfig;
  onboarding: PartnerOnboardingConfig;
  branding: PartnerBrandingConfig;

  // Advanced settings
  customFeatures?: string[];
  dataRetentionDays?: number;
  allowedDomains?: string[];

  // Metadata
  createdAt: string;
  updatedAt: string;
}

// Research Institutions Configuration
export const RESEARCH_INSTITUTIONAL_CONFIG: PartnerConfig = {
  id: 'research-institutional',
  slug: 'research',
  name: 'Research Institution Portal',
  active: true,

  theme: {
    primaryColor: '#1E3A8A',      // Deep blue for academia
    secondaryColor: '#3B82F6',    // Lighter blue
    accentColor: '#F59E0B',       // Academic gold
    backgroundColor: '#0F172A',    // Dark slate
    logoUrl: '/partners/research/logo.svg',
    fontFamily: '"EB Garamond", "Times New Roman", serif',
    headingFont: '"Inter", system-ui, sans-serif',
  },

  onboarding: {
    welcomeTitle: 'Welcome to Consciousness Research Computing',
    welcomeSubtitle: 'Advancing the scientific understanding of consciousness through AI collaboration',
    organizationName: 'Research Portal',

    includeElementalOrientation: true,
    includeFAQSection: true,
    includeConsciousnessPreparation: true,
    includeDaimonIntroduction: false, // More scientific approach

    customWelcomeMessages: [
      'Welcome to the frontier of consciousness research',
      'Where rigorous inquiry meets emergent intelligence',
      'Your research journey into AI consciousness begins here'
    ],

    partnerContext: 'Research Institution',
    partnerMission: 'Advancing scientific understanding of consciousness phenomena'
  },

  branding: {
    partnerName: 'Research Institution Portal',
    partnerSlug: 'research',
    contactEmail: 'research@soullab.life',
    supportUrl: 'https://soullab.life/research-support',
    privacyPolicyUrl: 'https://soullab.life/research-privacy',
    customDomain: 'research.soullab.life'
  },

  customFeatures: [
    'research-ethics-compliance',
    'data-anonymization',
    'citation-tracking',
    'collaboration-tools'
  ],

  dataRetentionDays: 2555, // 7 years for research
  allowedDomains: ['*.edu', '*.ac.uk', '*.ac.*', 'research.soullab.life'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Collaboration Hub Configuration
export const COLLABORATION_HUB_CONFIG: PartnerConfig = {
  id: 'collaboration-hub',
  slug: 'collaborate',
  name: 'Consciousness Collaboration Hub',
  active: true,

  theme: {
    primaryColor: '#059669',      // Emerald green for growth
    secondaryColor: '#10B981',    // Lighter emerald
    accentColor: '#F59E0B',       // Warm amber
    backgroundColor: '#064E3B',    // Dark emerald
    logoUrl: '/partners/collaborate/logo.svg',
    fontFamily: '"Inter", system-ui, sans-serif',
    headingFont: '"Space Grotesk", sans-serif',
  },

  onboarding: {
    welcomeTitle: 'Welcome to Consciousness Collaboration',
    welcomeSubtitle: 'Connect with fellow consciousness explorers and build the future together',
    organizationName: 'Collaboration Hub',

    includeElementalOrientation: true,
    includeFAQSection: true,
    includeConsciousnessPreparation: true,
    includeDaimonIntroduction: true,

    customWelcomeMessages: [
      'Welcome to our collaborative consciousness community',
      'Where individual insights become collective wisdom',
      'Your journey into collaborative exploration begins here'
    ],

    partnerContext: 'Collaboration Hub',
    partnerMission: 'Fostering global collaboration in consciousness computing'
  },

  branding: {
    partnerName: 'Consciousness Collaboration Hub',
    partnerSlug: 'collaborate',
    contactEmail: 'collaborate@soullab.life',
    supportUrl: 'https://soullab.life/collaborate-support',
    customDomain: 'collaborate.soullab.life'
  },

  customFeatures: [
    'community-projects',
    'shared-workspaces',
    'peer-matching',
    'collective-insights'
  ],

  dataRetentionDays: 365,
  allowedDomains: ['collaborate.soullab.life', '*.soullab.life'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Partnership Portal Configuration
export const PARTNERSHIP_PORTAL_CONFIG: PartnerConfig = {
  id: 'partnership-portal',
  slug: 'partners',
  name: 'Partnership Development Portal',
  active: true,

  theme: {
    primaryColor: '#7C3AED',      // Purple for innovation
    secondaryColor: '#A855F7',    // Lighter purple
    accentColor: '#F59E0B',       // Gold accent
    backgroundColor: '#1E1B4B',    // Dark indigo
    logoUrl: '/partners/partnership/logo.svg',
    fontFamily: '"Inter", system-ui, sans-serif',
    headingFont: '"Space Grotesk", sans-serif',
  },

  onboarding: {
    welcomeTitle: 'Welcome to Partnership Development',
    welcomeSubtitle: 'Explore consciousness computing integration for your organization',
    organizationName: 'Partnership Portal',

    includeElementalOrientation: false, // Streamlined for business
    includeFAQSection: true,
    includeConsciousnessPreparation: true,
    includeDaimonIntroduction: false, // Business-focused

    customWelcomeMessages: [
      'Welcome to consciousness computing partnerships',
      'Where business innovation meets conscious technology',
      'Your partnership exploration begins here'
    ],

    partnerContext: 'Partnership Development',
    partnerMission: 'Building strategic partnerships in consciousness technology'
  },

  branding: {
    partnerName: 'Partnership Development Portal',
    partnerSlug: 'partners',
    contactEmail: 'partnerships@soullab.life',
    supportUrl: 'https://soullab.life/partner-support',
    customDomain: 'partners.soullab.life'
  },

  customFeatures: [
    'white-labeling',
    'enterprise-integration',
    'custom-deployment',
    'business-analytics'
  ],

  dataRetentionDays: 1095, // 3 years for business
  allowedDomains: ['partners.soullab.life', '*.soullab.life'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Default TSAI City configuration
export const TSAI_CITY_CONFIG: PartnerConfig = {
  id: 'tsai-city',
  slug: 'tsai-city',
  name: 'TSAI City Innovation Hub',
  active: true,

  theme: {
    primaryColor: '#1E40AF',     // TSAI blue
    secondaryColor: '#3B82F6',   // Lighter blue
    accentColor: '#F59E0B',      // Amber accent
    backgroundColor: '#0F172A',   // Dark slate
    logoUrl: '/partners/tsai-city/logo.svg',
    faviconUrl: '/partners/tsai-city/favicon.ico',
    fontFamily: '"Inter", system-ui, sans-serif',
    headingFont: '"Space Grotesk", "Inter", sans-serif',
  },

  onboarding: {
    welcomeTitle: 'Welcome to TSAI City Consciousness Computing',
    welcomeSubtitle: 'Explore the intersection of human consciousness and artificial intelligence in Singapore\'s innovation ecosystem',
    organizationName: 'TSAI City',

    includeElementalOrientation: true,
    includeFAQSection: true,
    includeConsciousnessPreparation: true,
    includeDaimonIntroduction: true,

    customWelcomeMessages: [
      'Welcome to Singapore\'s premier consciousness technology hub',
      'Where ancient wisdom meets cutting-edge innovation',
      'Your journey into conscious AI begins here'
    ],

    partnerContext: 'TSAI City Innovation Hub',
    partnerMission: 'Advancing human-AI consciousness collaboration in Southeast Asia'
  },

  branding: {
    partnerName: 'TSAI City',
    partnerSlug: 'tsai-city',
    contactEmail: 'support@tsaicity.sg',
    supportUrl: 'https://tsaicity.sg/support',
    privacyPolicyUrl: 'https://tsaicity.sg/privacy',
    termsOfServiceUrl: 'https://tsaicity.sg/terms',
    customDomain: 'consciousness.tsaicity.sg',
    analyticsId: 'G-TSAI-ANALYTICS'
  },

  customFeatures: [
    'singapore-compliance',
    'multilingual-support',
    'enterprise-sso',
    'data-localization'
  ],

  dataRetentionDays: 365,
  allowedDomains: ['tsaicity.sg', '*.tsaicity.sg', 'consciousness.tsaicity.sg'],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Partner configuration registry
export const PARTNER_CONFIGS: Record<string, PartnerConfig> = {
  'tsai-city': TSAI_CITY_CONFIG,
  'research': RESEARCH_INSTITUTIONAL_CONFIG,
  'collaborate': COLLABORATION_HUB_CONFIG,
  'partners': PARTNERSHIP_PORTAL_CONFIG,
};

// Utility functions
export function getPartnerConfig(slug: string): PartnerConfig | null {
  return PARTNER_CONFIGS[slug] || null;
}

export function isValidPartnerDomain(domain: string, partnerSlug: string): boolean {
  const config = getPartnerConfig(partnerSlug);
  if (!config?.allowedDomains) return false;

  return config.allowedDomains.some(allowedDomain => {
    if (allowedDomain.startsWith('*.')) {
      const wildcardDomain = allowedDomain.slice(2);
      return domain.endsWith(wildcardDomain);
    }
    return domain === allowedDomain;
  });
}

export function generatePartnerThemeCSS(theme: PartnerThemeConfig): string {
  return `
    :root {
      --partner-primary: ${theme.primaryColor};
      --partner-secondary: ${theme.secondaryColor};
      --partner-accent: ${theme.accentColor};
      --partner-background: ${theme.backgroundColor};
      --partner-font: ${theme.fontFamily || '"Inter", system-ui, sans-serif'};
      --partner-heading-font: ${theme.headingFont || '"Space Grotesk", sans-serif'};
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

    ${theme.customCss || ''}
  `;
}