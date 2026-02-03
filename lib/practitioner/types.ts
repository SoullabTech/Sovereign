/**
 * Practitioner Portal Type Definitions
 *
 * Core types for the multi-tenant practitioner portal system.
 * Each practitioner gets their own branded astrology app with a custom AI companion.
 */

// ============== PRACTITIONER IDENTITY ==============

export interface PractitionerProfile {
  id: string;
  slug: string;                          // URL slug: "loralee" → loralee.soullab.life
  name: string;                          // Display name
  email: string;

  // Business info
  businessName?: string;                 // "Loralee Astrology"
  tagline?: string;                      // "Evolutionary Astrology for Soul Growth"
  bio?: string;                          // About page content

  // Status
  status: 'onboarding' | 'building' | 'active' | 'paused' | 'archived';
  createdAt: Date;
  launchedAt?: Date;

  // Stripe Connect
  stripeAccountId?: string;              // Their connected Stripe account
  revenueSharePercent: number;           // Default 12, or 10 if priority build
}

// ============== AI COMPANION CONFIG ==============

export interface AICompanionConfig {
  practitionerId: string;

  // Identity
  name: string;                          // "Stellium", "Luna", "Astria"
  pronouns: 'she/her' | 'he/him' | 'they/them';

  // Voice & Personality
  voiceStyle: VoiceStyle;
  tone: ToneProfile;

  // Framework & Methodology
  frameworks: AstrologyFramework[];
  primaryFramework: AstrologyFramework;
  specialties: string[];                 // Free-form specialties

  // Boundaries
  boundaries: AIBoundaries;

  // Knowledge Base
  knowledgeBase: KnowledgeBaseConfig;

  // System prompt (generated from above)
  systemPromptTemplate?: string;         // Custom override if needed
}

export type VoiceStyle =
  | 'warm'           // Nurturing, supportive
  | 'poetic'         // Lyrical, metaphorical
  | 'direct'         // Clear, straightforward
  | 'clinical'       // Professional, precise
  | 'mystical'       // Esoteric, depth-oriented
  | 'grounded';      // Practical, earthy

export interface ToneProfile {
  formality: 1 | 2 | 3 | 4 | 5;         // 1=casual, 5=formal
  warmth: 1 | 2 | 3 | 4 | 5;            // 1=neutral, 5=very warm
  depth: 1 | 2 | 3 | 4 | 5;             // 1=accessible, 5=esoteric
  directness: 1 | 2 | 3 | 4 | 5;        // 1=gentle, 5=blunt
}

export type AstrologyFramework =
  | 'evolutionary'        // Steven Forrest, soul purpose
  | 'archetypal'          // Richard Tarnas, Jung
  | 'psychological'       // Liz Greene, depth psychology
  | 'traditional'         // Classical/Hellenistic
  | 'vedic'               // Jyotish
  | 'humanistic'          // Dane Rudhyar
  | 'esoteric'            // Alice Bailey, soul-centered
  | 'medical'             // Health correlations
  | 'horary'              // Question-based
  | 'electional'          // Timing/choosing dates
  | 'mundane';            // World events

export interface AIBoundaries {
  // What the AI will NOT do
  noPredictions: boolean;                // Won't make specific predictions
  noMedicalAdvice: boolean;              // Always true
  noTherapy: boolean;                    // Refers to practitioner for deep work
  noRelationshipAdvice: boolean;         // If practitioner wants to handle personally

  // Referral triggers
  crisisReferral: boolean;               // Detects crisis, refers to resources
  practitionerReferral: string[];        // Topics that trigger "ask [name] about this"

  // Custom boundaries
  customBoundaries: string[];            // Practitioner-specific limits
}

export interface KnowledgeBaseConfig {
  // Practitioner's own materials
  ownMaterials: MaterialReference[];

  // Referenced authors/books
  referencedAuthors: AuthorReference[];

  // Custom interpretations
  customInterpretations: {
    planets?: Record<string, string>;    // Planet → custom description
    signs?: Record<string, string>;      // Sign → custom description
    houses?: Record<string, string>;     // House → custom description
    aspects?: Record<string, string>;    // Aspect key → custom interpretation
  };
}

export interface MaterialReference {
  id: string;
  type: 'pdf' | 'doc' | 'audio' | 'video' | 'text' | 'url';
  title: string;
  description?: string;
  sourceUrl?: string;                    // S3/storage URL
  indexedAt?: Date;
  vectorStoreId?: string;                // For RAG retrieval
}

export interface AuthorReference {
  name: string;                          // "Steven Forrest"
  works: string[];                       // ["The Inner Sky", "Yesterday's Sky"]
  useForCitations: boolean;              // Whether AI can cite them
}

// ============== THEMING & BRANDING ==============

export interface PractitionerTheme {
  practitionerId: string;

  // Branding
  logo?: string;                         // URL to logo
  favicon?: string;                      // URL to favicon
  heroImage?: string;                    // Hero/banner image

  // Colors
  colorPalette: ColorPalette;

  // Typography
  typography: TypographyConfig;

  // Vibe preset as starting point
  vibePreset?: VibePreset;

  // Custom CSS (Sovereign tier)
  customCss?: string;
}

export interface ColorPalette {
  primary: string;                       // Main brand color
  secondary: string;                     // Accent color
  background: string;                    // Page background
  surface: string;                       // Card backgrounds
  text: string;                          // Primary text
  textSecondary: string;                 // Secondary text
  accent: string;                        // Highlights, links
  border: string;                        // Borders
}

export interface TypographyConfig {
  headingFont: string;                   // Google Font name
  bodyFont: string;                      // Google Font name
  fontSize: 'sm' | 'base' | 'lg';        // Base size preference
}

export type VibePreset =
  | 'celestial'      // Starlit, cosmic
  | 'mystical'       // Deep, transformative
  | 'warm'           // Inviting, nurturing
  | 'earthy'         // Grounded, organic
  | 'minimal'        // Clean, modern
  | 'clinical';      // Professional, accessible

// ============== DOMAIN & ROUTING ==============

export interface PractitionerDomain {
  practitionerId: string;

  // Subdomain (always available)
  subdomain: string;                     // "loralee" → loralee.soullab.life

  // Custom domain (Sovereign tier)
  customDomain?: string;                 // "stelliumbyloralee.com"
  customDomainVerified: boolean;
  customDomainSsl: boolean;

  // DNS records needed
  dnsRecords?: {
    type: 'CNAME' | 'A' | 'TXT';
    name: string;
    value: string;
  }[];
}

// ============== CLIENT MANAGEMENT ==============

export interface PractitionerClient {
  id: string;
  practitionerId: string;

  // Identity
  email: string;
  name: string;

  // Birth data
  birthData?: {
    date: string;                        // ISO date
    time?: string;                       // HH:MM
    location?: {
      city: string;
      country: string;
      lat: number;
      lng: number;
      timezone: string;
    };
  };

  // Relationship
  status: 'invited' | 'active' | 'paused' | 'archived';
  tier: 'free' | 'subscriber' | 'vip';
  tags: string[];

  // Engagement
  firstSessionAt?: Date;
  lastSessionAt?: Date;
  totalSessions: number;
  totalAIConversations: number;

  // Subscription
  stripeCustomerId?: string;
  subscriptionId?: string;
  subscriptionStatus?: 'active' | 'past_due' | 'canceled';

  createdAt: Date;
  updatedAt: Date;
}

// ============== REVENUE & BILLING ==============

export interface RevenueRecord {
  id: string;
  practitionerId: string;

  // Transaction
  type: 'session' | 'subscription' | 'package' | 'product' | 'gift';
  amount: number;                        // In cents
  currency: string;                      // "usd"

  // Revenue share
  platformShare: number;                 // Amount to Soullab (cents)
  practitionerShare: number;             // Amount to practitioner (cents)
  sharePercent: number;                  // 12 or 10

  // Stripe
  stripePaymentId: string;
  stripeTransferId?: string;             // Transfer to practitioner

  // Client
  clientId?: string;
  clientEmail?: string;

  // Status
  status: 'pending' | 'completed' | 'refunded' | 'failed';

  createdAt: Date;
  settledAt?: Date;
}

// ============== FEATURE FLAGS ==============

export interface PractitionerFeatures {
  practitionerId: string;

  // Core features (always on)
  birthChart: boolean;
  transits: boolean;
  synastry: boolean;
  aiCompanion: boolean;

  // Optional features
  chineseAstrology: boolean;
  mayanAstrology: boolean;
  lifeCycles: boolean;
  dreamJournal: boolean;
  sessionNotes: boolean;
  resourceLibrary: boolean;

  // Advanced features
  progressedCharts: boolean;
  solarReturns: boolean;
  compositeCharts: boolean;
  horary: boolean;
  electional: boolean;

  // Business features
  booking: boolean;
  payments: boolean;
  packages: boolean;
  giftCertificates: boolean;
  emailSequences: boolean;
  crm: boolean;

  // Sovereign-only
  customDomain: boolean;
  customCss: boolean;
  whiteLabel: boolean;                   // Remove Soullab branding
  apiAccess: boolean;
}

// ============== ONBOARDING ==============

export interface PractitionerOnboarding {
  practitionerId: string;

  // Progress
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];

  // Spiral session data
  spiralSessions: SpiralSession[];

  // Extracted insights
  extractedVoice?: VoiceExtraction;
  extractedFramework?: FrameworkExtraction;
  extractedAesthetics?: AestheticExtraction;
}

export type OnboardingStep =
  | 'profile_created'
  | 'spiral_session_1'
  | 'spiral_session_2'
  | 'spiral_session_3'
  | 'voice_extracted'
  | 'framework_defined'
  | 'aesthetics_chosen'
  | 'materials_uploaded'
  | 'ai_configured'
  | 'theme_applied'
  | 'domain_setup'
  | 'stripe_connected'
  | 'ready_for_launch';

export interface SpiralSession {
  sessionNumber: number;
  date: Date;
  duration: number;                      // minutes
  transcript?: string;
  notes?: string;
  extractedInsights?: string[];
}

export interface VoiceExtraction {
  voiceStyle: VoiceStyle;
  tone: ToneProfile;
  samplePhrases: string[];               // Characteristic ways they speak
  vocabulary: string[];                  // Words/phrases they use often
}

export interface FrameworkExtraction {
  primaryFramework: AstrologyFramework;
  secondaryFrameworks: AstrologyFramework[];
  specialties: string[];
  influences: string[];                  // Authors, traditions
  uniqueApproaches: string[];            // What makes their approach unique
}

export interface AestheticExtraction {
  vibePreset: VibePreset;
  colorPreferences: string[];
  moodKeywords: string[];                // "cosmic", "grounded", "warm"
  inspirations: string[];                // Websites, brands they like
}
