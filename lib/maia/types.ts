/**
 * 🌀 MAIA Platform Agent Types
 *
 * Type definitions for the Platform Agent system that transforms
 * Community Commons content into various publication formats
 */

// ====================================================================
// CORE TYPES
// ====================================================================

export type FormatType =
  | 'substack-post'           // Narrative blog post format
  | 'community-post'          // Community Commons format
  | 'community-to-substack'   // Transform Community Commons to Substack
  | 'substack-series'         // Multi-part Substack series
  | 'podcast-script'          // Script with breath cues
  | 'session-guide'           // Workshop/session materials
  | 'meditation-guide'        // Guided practice
  | 'handout-pdf';           // Printable materials

export interface ContentTransformation {
  sourceFormat: FormatType;
  targetFormat: FormatType;
  preserveVoice: boolean;
  adaptForAudience: string;
}

// ====================================================================
// CONTENT TYPES
// ====================================================================

export interface CommunityCommonsPost {
  title: string;
  subtitle?: string;
  metadata: {
    type: 'community-contribution';
    contributionType: 'experience' | 'practice' | 'question' | 'creative';
    tags: string[];
    status: 'to-review' | 'published' | 'draft';
    submitted: string;
    contributor: string;
    published?: string;
  };
  sections: {
    experience?: string;
    context?: string;
    whatEmerged?: string;
    technicalImplementation?: string;
    alchemicalConnections?: string;
    whatThisMeans?: string;
    questionsThisRaises?: string;
    communityReflections?: string;
  };
  rawContent: string;
}

export interface SubstackPost {
  title: string;
  subtitle?: string;
  hook: string;               // Engaging opening
  sections: SubstackSection[];
  pullQuotes: string[];
  callToAction: string;
  metadata: {
    tags: string[];
    estimatedReadTime: number;
    seriesInfo?: {
      name: string;
      episode: number;
      totalEpisodes?: number;
    };
    crossPlatformLinks: {
      communityCommonsUrl?: string;
      technicalDetails?: string;
    };
  };
  markdown: string;
}

export interface SubstackSection {
  heading?: string;
  content: string;
  style: 'narrative' | 'insight' | 'application' | 'bridge';
}

// ====================================================================
// VOICE AND STYLE
// ====================================================================

export interface StyleProfile {
  poeticDensity: number;              // 0-1 (metaphorical vs literal)
  clinicalPrecision: number;          // 0-1 (scientific vs intuitive)
  kitchenTableMysticism: number;      // 0-1 (everyday vs grandiose)
  breathPacing: 'fast' | 'medium' | 'slow';
  sentenceRhythm: 'staccato' | 'flowing' | 'varied';

  // Soullab-specific patterns
  openingStyle: 'experiential-hook' | 'direct-provocation' | 'question-opening';
  transitionStyle: 'bridging-wisdom' | 'flowing' | 'abrupt';
  closingStyle: 'invitation-forward' | 'call-to-action' | 'open-question';

  technicalIntegration: 'story-wrapped' | 'separate-sections' | 'interweaved';
  communityConnection: 'always-present' | 'subtle' | 'explicit';
}

export interface VoiceFingerprint {
  openingPatterns: string[];
  sentenceRhythms: number[];          // Word counts in sequence
  metaphorDensity: number;            // Percentage of paragraphs with metaphor
  clinicalRatio: number;              // Technical vs poetic language ratio
  paragraphPattern: 'short' | 'varied' | 'long';
  transitionPhrases: string[];
  closingPatterns: string[];
}

// ====================================================================
// TRANSFORMATION INPUTS
// ====================================================================

export interface PlatformAgentInput {
  // Source content
  transmission: {
    rawText: string;
    sourceFormat: FormatType;
    filePath?: string;
    timestamp: Date;
  };

  // User intent
  userIntent: {
    command: string;                 // "Transform to Substack post"
    targetFormat: FormatType;
    parameters?: {
      tone?: 'poetic' | 'clinical' | 'conversational';
      length?: 'keep-as-is' | 'expand' | 'condense';
      audience?: string;
      seriesInfo?: {
        name: string;
        episode: number;
      };
    };
  };

  // Context for voice consistency
  context: {
    userProfile: {
      userId: string;
      styleProfile: StyleProfile;
      voiceFingerprint?: VoiceFingerprint;
    };
    crossPlatformLinks?: {
      originalUrl?: string;
      technicalDetailsUrl?: string;
    };
  };
}

// ====================================================================
// TRANSFORMATION OUTPUTS
// ====================================================================

export interface PlatformAgentOutput {
  // Transformed content
  content: {
    format: FormatType;
    data: SubstackPost | CommunityCommonsPost;
  };

  // Export options
  exports: {
    markdown?: string;
    html?: string;
    json?: any;
  };

  // Cross-platform integration
  crossPlatformData: {
    originalSource?: string;
    bidirectionalLinks: {
      sourceUrl?: string;
      targetUrl?: string;
      technicalDetails?: string;
    };
  };

  // MAIA's reflection on the transformation
  reflection: {
    summary: string;
    preservationNotes: string[];
    suggestions: string[];
    voiceFidelity: number;          // 0-1 confidence in voice preservation
  };
}

// ====================================================================
// SERIES MANAGEMENT
// ====================================================================

export interface SubstackSeries {
  name: string;
  description: string;
  episodes: SubstackSeriesEpisode[];
  overallArc: string;
  targetAudience: string[];
  publishingSchedule: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    dayOfWeek?: string;
    startDate: Date;
  };
}

export interface SubstackSeriesEpisode {
  episodeNumber: number;
  title: string;
  description: string;
  status: 'planned' | 'draft' | 'ready' | 'published';
  sourceContent?: {
    communityCommonsPath: string;
    adaptationNotes: string;
  };
  crossReferences: string[];
  publishDate?: Date;
}

// ====================================================================
// CONSCIOUSNESS TECHNOLOGY SPECIFIC
// ====================================================================

export interface ConsciousnessTechContent {
  ancientWisdomConnections: string[];
  technicalImplementation: {
    codeExamples?: string[];
    architectureNotes?: string[];
    demonstrationLinks?: string[];
  };
  practicalApplications: string[];
  communityEngagement: {
    discussionPrompts: string[];
    experimentSuggestions: string[];
    resourceLinks: string[];
  };
}

// ====================================================================
// ERROR HANDLING
// ====================================================================

export interface TransformationError {
  type: 'voice-preservation' | 'format-mismatch' | 'content-parsing' | 'platform-integration';
  message: string;
  suggestions: string[];
  partialResult?: Partial<PlatformAgentOutput>;
}

// ====================================================================
// CONFIGURATION
// ====================================================================

export interface PlatformAgentConfig {
  defaultStyleProfile: StyleProfile;
  supportedTransformations: ContentTransformation[];
  platformEndpoints: {
    substack?: {
      apiKey: string;
      publicationUrl: string;
    };
    communityCommons?: {
      basePath: string;
    };
  };
  voiceLearning: {
    enabled: boolean;
    feedbackWeight: number;      // How much to adjust from user edits
    corpusAnalysisDepth: number; // How many past posts to analyze
  };
}