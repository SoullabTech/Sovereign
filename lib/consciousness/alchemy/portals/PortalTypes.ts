/**
 * Shared types for the Disposable Pixels Portal Architecture
 *
 * This file contains the canonical definitions for portal-related types
 * that are used across all consciousness states and pixel implementations.
 */

import { PopulationPortal } from './PortalArchitecture';

// Portal Identities - the "cultural skins" MAIA can wear
// Using the comprehensive PopulationPortal type for full compatibility
export type PortalId = PopulationPortal;

// Complexity Tiers - how deep/sophisticated the UI expression should be
export type ComplexityTier = 'beginner' | 'intermediate' | 'advanced';

// Safety Levels - crisis detection and required support urgency
export type SafetyLevel = 'low' | 'moderate' | 'elevated' | 'critical';

// Common interface for all engine states
export interface BaseEngineState {
  state: string;
  safetyLevel: SafetyLevel;
  recommendedMode: 'guided' | 'self-directed' | 'emergency';
  mercuryAspect: 'Hermes-Messenger' | 'Hermes-Guardian' | 'Hermes-Healer' | 'Hermes-Psychopomp';
  spiralogicPhase: string; // e.g., 'F1 → W1 transition'
}

// Base pixel configuration interface that all states should extend
export interface BasePixelConfig {
  headline: string;
  subtext: string;
  icon: string;
  actionLabel: string;
  supportGuidance: string;
  emergingText: string;
  complexityAdaptations: {
    beginner: Partial<BasePixelConfig>;
    intermediate: Partial<BasePixelConfig>;
    advanced: Partial<BasePixelConfig>;
  };
}

// Portal metadata for rendering and styling
export interface PortalMetadata {
  id: PortalId;
  displayName: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  iconGradient: string;
  targetAudience: string;
}

export const PORTAL_METADATA: Record<PortalId, PortalMetadata> = {
  shamanic: {
    id: 'shamanic',
    displayName: 'Shamanic',
    description: 'Sacred journey and ceremonial healing language',
    primaryColor: 'amber',
    secondaryColor: 'orange',
    iconGradient: 'from-amber-500 to-orange-600',
    targetAudience: 'Spiritual practitioners, ceremonial healers, plant medicine workers'
  },
  therapeutic: {
    id: 'therapeutic',
    displayName: 'Therapeutic',
    description: 'Clinical psychology and healing-oriented frameworks',
    primaryColor: 'green',
    secondaryColor: 'emerald',
    iconGradient: 'from-green-500 to-emerald-600',
    targetAudience: 'Therapists, counselors, mental health professionals'
  },
  corporate: {
    id: 'corporate',
    displayName: 'Corporate',
    description: 'Executive leadership and organizational development language',
    primaryColor: 'blue',
    secondaryColor: 'indigo',
    iconGradient: 'from-blue-500 to-indigo-600',
    targetAudience: 'Executives, managers, organizational leaders'
  },
  religious: {
    id: 'religious',
    displayName: 'Religious',
    description: 'Faith-based spiritual development and religious frameworks',
    primaryColor: 'purple',
    secondaryColor: 'violet',
    iconGradient: 'from-purple-500 to-violet-600',
    targetAudience: 'Religious practitioners, faith communities, spiritual directors'
  },
  academic: {
    id: 'academic',
    displayName: 'Academic',
    description: 'Research-based psychological and scientific frameworks',
    primaryColor: 'indigo',
    secondaryColor: 'teal',
    iconGradient: 'from-indigo-500 to-teal-600',
    targetAudience: 'Researchers, academics, students, intellectuals'
  },
  recovery: {
    id: 'recovery',
    displayName: 'Recovery',
    description: '12-step programs and addiction recovery language',
    primaryColor: 'green',
    secondaryColor: 'blue',
    iconGradient: 'from-green-500 to-blue-600',
    targetAudience: 'Recovery community, 12-step participants, addiction specialists'
  },
  creative: {
    id: 'creative',
    displayName: 'Creative',
    description: 'Artistic expression and creative development frameworks',
    primaryColor: 'red',
    secondaryColor: 'pink',
    iconGradient: 'from-red-500 to-pink-600',
    targetAudience: 'Artists, musicians, creative professionals, makers'
  },
  parental: {
    id: 'parental',
    displayName: 'Parental',
    description: 'Family systems and parenting development frameworks',
    primaryColor: 'yellow',
    secondaryColor: 'orange',
    iconGradient: 'from-yellow-500 to-orange-600',
    targetAudience: 'Parents, families, child development professionals'
  },
  elder: {
    id: 'elder',
    displayName: 'Elder',
    description: 'Wisdom-keeper and late-life development frameworks',
    primaryColor: 'gray',
    secondaryColor: 'slate',
    iconGradient: 'from-gray-500 to-slate-600',
    targetAudience: 'Seniors, elders, aging adults, wisdom keepers'
  },
  youth: {
    id: 'youth',
    displayName: 'Youth',
    description: 'Identity formation and young adult development frameworks',
    primaryColor: 'lime',
    secondaryColor: 'green',
    iconGradient: 'from-lime-500 to-green-600',
    targetAudience: 'Teenagers, young adults, identity seekers'
  },
  coach: {
    id: 'coach',
    displayName: 'Coach',
    description: 'Life coaching and transformation-focused frameworks',
    primaryColor: 'coral',
    secondaryColor: 'teal',
    iconGradient: 'from-red-400 to-teal-400',
    targetAudience: 'Life coaches, transformation coaches, wellness coaches, client-focused practitioners'
  },
  gen_z: {
    id: 'gen_z',
    displayName: 'Gen Z',
    description: 'Digital-native, mental health aware, socially conscious frameworks',
    primaryColor: 'purple',
    secondaryColor: 'indigo',
    iconGradient: 'from-purple-500 to-indigo-600',
    targetAudience: 'Gen Z (1997-2012): Social justice advocates, digital natives, mental health aware'
  },
  gen_alpha: {
    id: 'gen_alpha',
    displayName: 'Gen Alpha',
    description: 'Post-digital native, gamified, future-focused development frameworks',
    primaryColor: 'cyan',
    secondaryColor: 'blue',
    iconGradient: 'from-cyan-500 to-blue-600',
    targetAudience: 'Gen Alpha (2012+): Post-digital natives, gamification-oriented, climate-conscious'
  }
};

// Complexity tier metadata for adaptive UX
export interface ComplexityMetadata {
  tier: ComplexityTier;
  displayName: string;
  description: string;
  textComplexity: string;
  supportLevel: string;
}

export const COMPLEXITY_METADATA: Record<ComplexityTier, ComplexityMetadata> = {
  beginner: {
    tier: 'beginner',
    displayName: 'Beginner',
    description: 'New to consciousness work, needs simple explanations and high support',
    textComplexity: 'Plain language, minimal jargon, concrete examples',
    supportLevel: 'High touch, step-by-step guidance'
  },
  intermediate: {
    tier: 'intermediate',
    displayName: 'Intermediate',
    description: 'Some experience with inner work, can handle moderate complexity',
    textComplexity: 'Balanced technical and accessible language',
    supportLevel: 'Moderate guidance with options for deeper exploration'
  },
  advanced: {
    tier: 'advanced',
    displayName: 'Advanced',
    description: 'Experienced practitioners who want technical depth and autonomy',
    textComplexity: 'Technical language, frameworks, nuanced concepts',
    supportLevel: 'Minimal guidance, focused on advanced insights'
  }
};

// Helper function to get portal styling
export function getPortalStyling(portalId: PortalId): {
  container: string;
  accentColor: string;
  buttonColor: string;
} {
  const metadata = PORTAL_METADATA[portalId];
  const baseClasses = "rounded-lg shadow-md p-6 transition-all duration-300";

  switch (portalId) {
    case 'shamanic':
      return {
        container: `${baseClasses} bg-gradient-to-br from-amber-100 to-orange-200 border-2 border-amber-300`,
        accentColor: 'text-amber-700',
        buttonColor: 'bg-amber-600 hover:bg-amber-700 text-white'
      };
    case 'therapeutic':
      return {
        container: `${baseClasses} bg-gradient-to-br from-green-100 to-emerald-200 border-2 border-green-300`,
        accentColor: 'text-green-700',
        buttonColor: 'bg-green-600 hover:bg-green-700 text-white'
      };
    case 'corporate':
      return {
        container: `${baseClasses} bg-gradient-to-br from-blue-100 to-indigo-200 border-2 border-blue-300`,
        accentColor: 'text-blue-700',
        buttonColor: 'bg-blue-600 hover:bg-blue-700 text-white'
      };
    default:
      return {
        container: baseClasses,
        accentColor: 'text-gray-700',
        buttonColor: 'bg-gray-600 hover:bg-gray-700 text-white'
      };
  }
}