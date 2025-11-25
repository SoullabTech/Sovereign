/**
 * 🌟 SoulLab Metadata Schema
 * Rich contextual metadata for journals, stories, and relived moments.
 * This turns raw user text into living mythic data.
 */

export type ElementType = "fire" | "water" | "earth" | "air" | "aether";
export type ConsciousnessLevel = "ego" | "soul" | "cosmic" | "universal";
export type DevelopmentalPhase = "awakening" | "dark-night" | "illumination" | "integration" | "embodiment";
export type EntryType = "journal" | "story" | "moment";

/**
 * Elemental signature captures the energetic quality of content
 */
export interface ElementalSignature {
  dominant: ElementType;
  balance: Record<ElementType, number>; // 0–1 scale for each element
  intensity: number; // 0–1 overall resonance intensity
  dynamics?: {
    rising?: ElementType[]; // Elements gaining strength
    falling?: ElementType[]; // Elements diminishing
    fusion?: string; // e.g., "steam" (fire+water), "lava" (fire+earth)
  };
}

/**
 * Archetypal patterns recognized in the content
 */
export interface ArchetypalSignal {
  archetype: string; // e.g., "Seeker", "Healer", "Creator", "Sovereign"
  confidence: number; // 0–1
  fusion?: string[]; // "Digital Shaman" = ["Shaman", "Technologist"]
  shadow?: string; // Shadow aspect if present
  evolution?: {
    from?: string; // Previous archetype
    toward?: string; // Emerging archetype
  };
}

/**
 * Consciousness development profile
 */
export interface ConsciousnessProfile {
  level: ConsciousnessLevel;
  developmentalPhase: DevelopmentalPhase;
  readinessForTruth: number; // 0–1 scale
  shadowIndicators?: string[]; // e.g., ["avoidance", "projection", "denial"]
  integrationMarkers?: string[]; // e.g., ["acceptance", "compassion", "presence"]
  hemisphericBalance?: {
    leftBrain: number; // 0–1 analytical/linguistic
    rightBrain: number; // 0–1 intuitive/holistic
  };
}

/**
 * Rich metadata attached to every captured experience
 */
export interface SoulLabMetadata {
  elemental: ElementalSignature;
  archetypal: ArchetypalSignal[];
  consciousness: ConsciousnessProfile;
  sentiment?: string; // e.g., "hopeful", "grief", "awe", "threshold"
  collectiveResonance?: number; // 0–1 morphic field strength
  symbols?: string[]; // Distilled metaphors or key images
  themes?: string[]; // Recurring patterns
  seasonality?: {
    literal?: string; // "spring", "summer", "fall", "winter"
    metaphorical?: string; // "planting", "blooming", "harvesting", "composting"
  };
  timestamp: string;
}

/**
 * Journal entry with metadata
 */
export interface JournalEntry {
  id: string;
  userId: string;
  content: string;
  title?: string;
  metadata: SoulLabMetadata;
  threadIds?: string[]; // Links to story threads
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Story fragment with narrative structure
 */
export interface StoryFragment {
  id: string;
  userId: string;
  title?: string;
  content: string;
  storyArc?: {
    stage: "beginning" | "rising" | "climax" | "falling" | "resolution";
    tension?: number; // 0–1
    transformation?: string; // What shifted
  };
  metadata: SoulLabMetadata;
  threadIds?: string[];
  createdAt: Date;
}

/**
 * Relived moment - embodied memory work
 */
export interface RelivedMoment {
  id: string;
  userId: string;
  momentDescription: string;
  sensoryDetails?: {
    visual?: string;
    auditory?: string;
    kinesthetic?: string;
    olfactory?: string;
    gustatory?: string;
  };
  emotionalTexture?: string;
  somaticMarkers?: string[]; // Body sensations
  metadata: SoulLabMetadata;
  threadIds?: string[];
  originalDate?: Date; // When the moment originally occurred
  createdAt: Date; // When it was relived/recorded
}

/**
 * Story thread that weaves experiences together
 */
export interface StoryThread {
  id: string;
  userId: string;
  title: string;
  description?: string;
  archetype?: string; // Dominant archetype of this thread
  element?: ElementType; // Dominant element
  entries: Array<{
    type: EntryType;
    id: string;
    timestamp: Date;
  }>;
  insights?: string[]; // Maya's observations about the thread
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User profile with accumulated patterns
 */
export interface UserSoulProfile {
  userId: string;
  dominantElements: ElementType[];
  activeArchetypes: string[];
  developmentalStage: DevelopmentalPhase;
  languageTier: "everyday" | "metaphorical" | "alchemical";
  preferredStyle: "technical" | "philosophical" | "dramatic" | "soulful";
  storyThreads: string[]; // Thread IDs
  sacredWords?: string[]; // Words that repeatedly appear with high resonance
  growthEdge?: string; // Current developmental frontier
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Language tier variants for the same content
 */
export interface TieredResponse {
  everyday: string; // Plain language
  metaphorical: string; // Gentle elemental introduction
  alchemical: string; // Full technical depth
}

/**
 * Maya's role configuration
 */
export interface MayaRole {
  primary: "mirror"; // Always the center
  active?: "teacher" | "guide" | "consultant" | "coach" | "oracle";
  style: "technical" | "philosophical" | "dramatic" | "soulful";
  languageTier: "everyday" | "metaphorical" | "alchemical";
}

/**
 * Conversation flow state
 */
export interface ConversationState {
  userId: string;
  sessionId: string;
  exchangeCount: number;
  currentRole: MayaRole;
  lastElement: ElementType;
  lastArchetype?: string;
  momentum: "building" | "sustaining" | "completing";
  threadContext?: string[]; // Active thread IDs
  createdAt: Date;
  updatedAt: Date;
}