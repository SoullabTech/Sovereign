/**
 * 🌸 Sacred Type Definitions
 * Core types for the Holoflower ecosystem
 */

// Asset types that can be attached to sessions
export type AssetType = "doc" | "audio" | "video" | "image";

// Sacred asset attached to a session
export interface SacredAsset {
  id: string;
  type: AssetType;
  title: string;
  previewUrl: string;
  fullUrl: string;
  uploadedAt: string;
  metadata?: {
    duration?: number; // for audio/video in seconds
    pageCount?: number; // for documents
    dimensions?: { width: number; height: number }; // for images
    fileSize?: number; // in bytes
    mimeType?: string;
    element?: ElementType; // dominant element detected
    aetherResonance?: number; // 0-1 mystical content score
    keywords?: string[];
    wisdomQuotes?: string[];
  };
}

// Element types in the Spiralogic system
export type ElementType = "Fire" | "Water" | "Earth" | "Air" | "Aether";

// Holoflower session with full tracking
export interface Session {
  id: string;
  userId?: string;
  date: string;
  timestamp: number;
  
  // Petal states (12 petals)
  checkIns: Record<string, number>;
  
  // Primary element and coherence
  primaryFacetId: string;
  dominantElement?: ElementType;
  coherence?: number; // 0-1 overall harmony score
  
  // Aether transcendence
  aetherStage?: number; // 0-3 stages of transcendence
  aetherResonance?: number; // 0-1 mystical activation
  
  // Shadow integration
  shadowIntegration?: number; // 0-1 shadow work progress
  shadowPetals?: Record<string, number>; // shadow aspects per petal
  
  // Sacred assets linked to this session
  assets?: SacredAsset[];
  
  // Session metadata
  metadata?: {
    deviceTier?: "SACRED" | "RITUAL" | "LIGHT" | "ESSENCE";
    location?: { lat: number; lng: number };
    moonPhase?: number; // 0-1 lunar cycle position
    duration?: number; // session length in seconds
    ritualType?: "conversation" | "meditation" | "document" | "voice";
    oracleMode?: string; // which oracle archetype was active
  };
}

// Timeline view of sessions
export interface Timeline {
  sessions: Session[];
  totalSessions: number;
  averageCoherence: number;
  dominantElements: Record<ElementType, number>; // count per element
  growthTrajectory: "ascending" | "stable" | "exploring";
  firstSession: string;
  lastSession: string;
}

// Sacred Library document
export interface SacredDocument {
  id: string;
  userId: string;
  filename: string;
  uploadedAt: string;
  contentHash: string;
  
  // Document analysis
  petalMapping: Record<string, number>; // relevance to each petal
  aetherScore: number; // mystical content detection
  dominantElements: ElementType[];
  
  // Extracted wisdom
  keyPassages: {
    text: string;
    petalAssociations: string[];
    resonanceScore: number;
  }[];
  
  // Search and filtering
  fullText?: string;
  tsvector?: string; // for Postgres full-text search
  tags?: string[];
}

// Wisdom quote from documents
export interface WisdomQuote {
  id: string;
  documentId: string;
  userId: string;
  quoteText: string;
  context?: string;
  pageNumber?: number;
  
  // Associations
  petalAssociations: string[];
  elementResonance: Partial<Record<ElementType, number>>;
  
  // User interaction
  userNotes?: string;
  favorited: boolean;
  shareCount: number;
  meditationCount: number;
}