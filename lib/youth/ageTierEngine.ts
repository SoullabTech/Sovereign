/**
 * Age-Tier State Engine
 *
 * Single source of truth for all youth developmental constraints.
 * Every system that needs to know about a user's developmental tier
 * queries this engine rather than re-implementing age logic.
 *
 * Tiers:
 *   under13 — Guided mode. Guardian required. No shadow work.
 *   tier2   — 13-15. Supported sovereignty. Guardian mirror active.
 *   tier3   — 16-17. Emerging independence. Guardian mirror optional.
 *   adult   — 18+. Full access. No youth constraints.
 *
 * Principle: supported sovereignty, not surveillance.
 * Earth around Water — structure around depth.
 */

export type DevelopmentalTier = 'under13' | 'tier2' | 'tier3' | 'adult';

export type MemoryMode = 'none' | 'short' | 'full';
export type UndercraftAccess = 'none' | 'light' | 'moderate' | 'full';
export type CrisisThreshold = 'sensitive' | 'standard';
export type GuardianMirrorDefault = 'required' | 'optional' | 'none';
export type LanguageStyle = 'concrete' | 'supportive' | 'adult-leaning';

/** Inner Lands territory identifiers */
export type LandId =
  | 'watchtower'
  | 'furnace'
  | 'undercroft'
  | 'well'
  | 'crossroads'
  | 'forge';

const ALL_TERRITORIES: LandId[] = [
  'watchtower', 'furnace', 'undercroft', 'well', 'crossroads', 'forge',
];

const GUIDED_TERRITORIES: LandId[] = [
  'watchtower', 'well', 'crossroads',
];

const SUPPORTED_TERRITORIES: LandId[] = [
  'watchtower', 'furnace', 'well', 'crossroads', 'forge',
  // undercroft is readiness-gated, not listed as freely available
];

export interface TierConfig {
  tier: DevelopmentalTier;
  label: string;
  maxSessionMinutes: number;
  memoryMode: MemoryMode;
  availableTerritories: LandId[];
  undercraftAccess: UndercraftAccess;
  crisisThreshold: CrisisThreshold;
  guardianRequired: boolean;
  guardianMirrorDefault: GuardianMirrorDefault;
  languageStyle: LanguageStyle;
  shadowWorkDepth: 0 | 1 | 2 | 3;
  maxResponseSentences: number;
}

// ---------------------------------------------------------------------------
// Tier configurations
// ---------------------------------------------------------------------------

const TIER_CONFIGS: Record<DevelopmentalTier, TierConfig> = {
  under13: {
    tier: 'under13',
    label: 'Guided Exploration',
    maxSessionMinutes: 5,
    memoryMode: 'none',
    availableTerritories: GUIDED_TERRITORIES,
    undercraftAccess: 'none',
    crisisThreshold: 'sensitive',
    guardianRequired: true,
    guardianMirrorDefault: 'required',
    languageStyle: 'concrete',
    shadowWorkDepth: 0,
    maxResponseSentences: 3,
  },

  tier2: {
    tier: 'tier2',
    label: 'Supported Sovereignty',
    maxSessionMinutes: 25,
    memoryMode: 'short',
    availableTerritories: SUPPORTED_TERRITORIES,
    undercraftAccess: 'light',       // readiness-gated, encounters 1-3 only
    crisisThreshold: 'sensitive',
    guardianRequired: true,
    guardianMirrorDefault: 'required',
    languageStyle: 'concrete',
    shadowWorkDepth: 1,
    maxResponseSentences: 4,
  },

  tier3: {
    tier: 'tier3',
    label: 'Emerging Independence',
    maxSessionMinutes: 50,
    memoryMode: 'full',
    availableTerritories: ALL_TERRITORIES,
    undercraftAccess: 'moderate',    // readiness-gated, all encounters
    crisisThreshold: 'standard',
    guardianRequired: false,
    guardianMirrorDefault: 'optional',
    languageStyle: 'adult-leaning',
    shadowWorkDepth: 2,
    maxResponseSentences: 6,
  },

  adult: {
    tier: 'adult',
    label: 'Full Access',
    maxSessionMinutes: 90,
    memoryMode: 'full',
    availableTerritories: ALL_TERRITORIES,
    undercraftAccess: 'full',
    crisisThreshold: 'standard',
    guardianRequired: false,
    guardianMirrorDefault: 'none',
    languageStyle: 'adult-leaning',
    shadowWorkDepth: 3,
    maxResponseSentences: 0,        // 0 = no limit
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compute developmental tier from age in years.
 */
export function computeTierFromAge(age: number): DevelopmentalTier {
  if (age < 13) return 'under13';
  if (age <= 15) return 'tier2';
  if (age <= 17) return 'tier3';
  return 'adult';
}

/**
 * Compute developmental tier from birth date string or Date object.
 */
export function computeTierFromBirthDate(birthDate: string | Date): DevelopmentalTier {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return computeTierFromAge(age);
}

/**
 * Get the full tier configuration for a given developmental tier.
 */
export function getTierConfig(tier: DevelopmentalTier): TierConfig {
  return TIER_CONFIGS[tier];
}

/**
 * Returns true if the tier represents a youth user (under 18).
 */
export function isYouthTier(tier: DevelopmentalTier): boolean {
  return tier !== 'adult';
}

/**
 * Check if a specific territory is available for a given tier.
 * Note: for undercroft, this returns the _potential_ availability.
 * Actual access for youth tiers requires readiness assessment.
 */
export function isTerritoryAvailable(territory: LandId, tier: DevelopmentalTier): boolean {
  const config = TIER_CONFIGS[tier];
  if (territory === 'undercroft') {
    return config.undercraftAccess !== 'none';
  }
  return config.availableTerritories.includes(territory);
}

/**
 * Check if shadow work of a given depth is allowed for a tier.
 * Depth levels: 0 = none, 1 = light, 2 = moderate, 3 = full
 */
export function isShadowWorkAllowed(depth: number, tier: DevelopmentalTier): boolean {
  return depth <= TIER_CONFIGS[tier].shadowWorkDepth;
}
