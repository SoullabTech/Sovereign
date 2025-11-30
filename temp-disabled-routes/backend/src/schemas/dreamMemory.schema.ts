import { z } from 'zod';

// ===============================================
// ARCHETYPAL RESONANCE PATTERNS
// ===============================================

export const JungianArchetypeSchema = z.enum([
  'hero',
  'shadow',
  'anima',
  'animus',
  'wise_old_man',
  'wise_old_woman',
  'trickster',
  'mother',
  'father',
  'child',
  'maiden',
  'magician',
  'ruler',
  'rebel',
  'lover',
  'creator',
  'destroyer',
  'caregiver',
  'seeker',
  'sage'
]);

export const DreamSymbolSchema = z.object({
  symbol: z.string(),
  meaning: z.string().optional(),
  frequency: z.number().min(0).max(1),
  emotionalCharge: z.number().min(-1).max(1),
  personalAssociation: z.string().optional(),
  collectiveAssociation: z.string().optional(),
  archetype: JungianArchetypeSchema.optional()
});

export const EmotionalToneSchema = z.object({
  primary: z.enum([
    'joy', 'sadness', 'anger', 'fear', 'surprise',
    'disgust', 'trust', 'anticipation', 'love', 'awe'
  ]),
  intensity: z.number().min(0).max(1),
  valence: z.number().min(-1).max(1), // negative to positive
  arousal: z.number().min(0).max(1),   // calm to excited
  complexity: z.number().min(0).max(1) // simple to complex
});

// ===============================================
// DREAM MEMORY SCHEMA
// ===============================================

export const DreamMemorySchema = z.object({
  // Core Fields
  id: z.string().uuid(),
  userId: z.string(),
  timestamp: z.string().datetime(),
  
  // Dream Content
  content: z.string().min(1),
  narrative: z.string().optional(),
  setting: z.string().optional(),
  characters: z.array(z.string()).optional(),
  
  // Dream Type Classification
  type: z.enum([
    'lucid',
    'nightmare',
    'recurring',
    'prophetic',
    'healing',
    'shadow_work',
    'visitation',
    'astral',
    'ordinary',
    'symbolic',
    'archetypal',
    'precognitive',
    'telepathic',
    'shamanic'
  ]),
  
  // Archetypal Resonance
  archetypes: z.array(JungianArchetypeSchema),
  archetypeStrength: z.record(JungianArchetypeSchema, z.number().min(0).max(1)).optional(),
  
  // Dream Symbols
  dreamSymbols: z.array(DreamSymbolSchema),
  symbolDensity: z.number().min(0).max(1).optional(), // How symbol-rich the dream is
  
  // Emotional Landscape
  emotionalTone: EmotionalToneSchema,
  emotionalJourney: z.array(EmotionalToneSchema).optional(), // Emotional progression
  
  // Shadow Aspects
  shadowAspects: z.object({
    present: z.boolean(),
    shadowFigures: z.array(z.string()).optional(),
    shadowThemes: z.array(z.enum([
      'repression',
      'denial',
      'projection',
      'integration',
      'confrontation',
      'acceptance',
      'transformation'
    ])).optional(),
    integrationOpportunity: z.string().optional(),
    resistancePatterns: z.array(z.string()).optional()
  }).optional(),
  
  // Integration & Processing
  integrationLevel: z.number().min(0).max(100),
  processingStage: z.enum([
    'raw',           // Just recorded
    'reflecting',    // Being contemplated
    'analyzing',     // Deep analysis
    'integrating',   // Active integration
    'integrated',    // Fully integrated
    'transforming'   // Leading to transformation
  ]),
  
  // Sacred & Spiritual Context
  sacredContext: z.boolean(),
  spiritualSignificance: z.string().optional(),
  
  // Elemental Association
  element: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
  elementalBalance: z.object({
    fire: z.number().min(0).max(1),
    water: z.number().min(0).max(1),
    earth: z.number().min(0).max(1),
    air: z.number().min(0).max(1),
    aether: z.number().min(0).max(1)
  }).optional(),
  
  // Spiral Phase Mapping
  spiralPhase: z.enum([
    'descent',       // Going into shadow
    'dissolution',   // Breaking down patterns
    'void',         // Dark night of soul
    'rebirth',      // New emergence
    'integration',  // Bringing together
    'ascent',       // Rising consciousness
    'illumination'  // Breakthrough insight
  ]).optional(),
  
  // Connections & Patterns
  relatedDreams: z.array(z.string().uuid()).optional(),
  recurringElements: z.array(z.string()).optional(),
  patternId: z.string().uuid().optional(), // Links to recurring pattern
  
  // Oracle & AI Analysis
  oracleInterpretation: z.string().optional(),
  aiInsights: z.object({
    themes: z.array(z.string()),
    guidance: z.string(),
    questions: z.array(z.string()),
    actionItems: z.array(z.string()).optional()
  }).optional(),
  
  // Metadata
  metadata: z.object({
    moonPhase: z.string().optional(),
    sleepQuality: z.number().min(0).max(10).optional(),
    lucidityLevel: z.number().min(0).max(10).optional(),
    rememberanceClarity: z.number().min(0).max(10).optional(),
    retreatContext: z.boolean().optional(),
    medicineJourney: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    private: z.boolean().default(false)
  }).optional(),
  
  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  processedAt: z.string().datetime().optional()
});

// ===============================================
// ARCHETYPAL PATTERN DETECTION
// ===============================================

export const ArchetypalPatternSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  archetype: JungianArchetypeSchema,
  
  // Pattern Strength & Frequency
  activationCount: z.number().int().min(0),
  patternStrength: z.number().min(0).max(1),
  lastActivated: z.string().datetime(),
  firstDetected: z.string().datetime(),
  
  // Related Memories
  relatedMemories: z.array(z.string().uuid()),
  dreamOccurrences: z.array(z.object({
    dreamId: z.string().uuid(),
    timestamp: z.string().datetime(),
    strength: z.number().min(0).max(1),
    context: z.string().optional()
  })),
  
  // Evolution & Development
  evolutionStage: z.enum([
    'emerging',     // Just beginning to appear
    'developing',   // Growing stronger
    'active',       // Fully active
    'integrating',  // Being integrated
    'transformed',  // Has transformed
    'transcended'   // Moved beyond
  ]),
  
  // Insights & Guidance
  insights: z.array(z.string()),
  integrationSuggestions: z.array(z.string()),
  shadowWork: z.string().optional(),
  
  // Relationships with other archetypes
  relationships: z.array(z.object({
    archetype: JungianArchetypeSchema,
    relationshipType: z.enum([
      'complementary',
      'opposing',
      'balancing',
      'evolving_into',
      'emerging_from'
    ]),
    strength: z.number().min(0).max(1)
  })).optional()
});

// ===============================================
// DREAM PATTERN RECOGNITION
// ===============================================

export const DreamPatternSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  patternName: z.string(),
  
  // Pattern Type
  patternType: z.enum([
    'recurring_symbol',
    'recurring_theme',
    'recurring_character',
    'recurring_setting',
    'emotional_pattern',
    'transformation_sequence',
    'prophetic_pattern',
    'shadow_pattern',
    'integration_journey'
  ]),
  
  // Pattern Data
  occurrences: z.number().int().min(2), // At least 2 to be a pattern
  dreams: z.array(z.string().uuid()),
  
  // Common Elements
  commonSymbols: z.array(DreamSymbolSchema),
  commonArchetypes: z.array(JungianArchetypeSchema),
  commonEmotions: z.array(z.string()),
  
  // Pattern Analysis
  significance: z.string(),
  interpretation: z.string(),
  evolutionNotes: z.string().optional(),
  
  // Guidance
  workingWith: z.string().optional(), // How to work with this pattern
  integrationPath: z.string().optional(),
  
  // Timeline
  firstOccurrence: z.string().datetime(),
  lastOccurrence: z.string().datetime(),
  activePhase: z.boolean(),
  
  // Metadata
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// ===============================================
// DREAM JOURNEY THREAD
// ===============================================

export const DreamJourneyThreadSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  threadName: z.string(),
  
  // Thread Type
  threadType: z.enum([
    'shadow_work',
    'anima_animus_integration',
    'hero_journey',
    'transformation_cycle',
    'healing_sequence',
    'prophetic_series',
    'initiation_path'
  ]),
  
  // Dreams in Sequence
  dreamSequence: z.array(z.object({
    dreamId: z.string().uuid(),
    position: z.number().int(),
    timestamp: z.string().datetime(),
    keyInsight: z.string().optional()
  })),
  
  // Journey Progression
  currentPhase: z.string(),
  completionPercentage: z.number().min(0).max(100),
  breakthroughs: z.array(z.object({
    dreamId: z.string().uuid(),
    insight: z.string(),
    timestamp: z.string().datetime()
  })),
  
  // Integration Status
  integrationNotes: z.string().optional(),
  activeWork: z.boolean(),
  guidanceReceived: z.array(z.string()),
  
  // Timestamps
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional()
});

// ===============================================
// EXPORT TYPES
// ===============================================

export type DreamMemory = z.infer<typeof DreamMemorySchema>;
export type ArchetypalPattern = z.infer<typeof ArchetypalPatternSchema>;
export type DreamPattern = z.infer<typeof DreamPatternSchema>;
export type DreamJourneyThread = z.infer<typeof DreamJourneyThreadSchema>;
export type JungianArchetype = z.infer<typeof JungianArchetypeSchema>;
export type DreamSymbol = z.infer<typeof DreamSymbolSchema>;
export type EmotionalTone = z.infer<typeof EmotionalToneSchema>;

// ===============================================
// VALIDATION HELPERS
// ===============================================

export const validateDreamMemory = (data: unknown): DreamMemory => {
  return DreamMemorySchema.parse(data);
};

export const validateArchetypalPattern = (data: unknown): ArchetypalPattern => {
  return ArchetypalPatternSchema.parse(data);
};

export const validateDreamPattern = (data: unknown): DreamPattern => {
  return DreamPatternSchema.parse(data);
};