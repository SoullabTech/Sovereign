/**
 * Collective Wisdom Field
 *
 * The Crystal with Infinite Facets
 *
 * Each contributor (theorist, practitioner, seeker) is mesmerized by their unique facet,
 * yet all facets emanate from the One (Buddha in white light sphere).
 *
 * This field holds:
 * 1. Cross-journey pattern recognition (engineer→facilitator, seeker→healer, etc.)
 * 2. Interference pattern tracking (God Between arising signatures)
 * 3. Tradition integration (how Buddhist + Christian + Indigenous + Spiralogic illuminate each other)
 * 4. Wisdom spiraling between contributors (not extracting FROM, but spiraling BETWEEN)
 *
 * "It is about us" - Kelly
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!
});

// Journey threshold pattern
export interface JourneyPattern {
  patternId: string;
  patternName: string;  // "engineer-to-facilitator", "wounded-healer awakening", etc.
  contributingSouls: Array<{
    userId: string;
    name?: string;
    uniqueGift: string;
    journeyPhase: string;
  }>;
  commonThresholds: string[];  // Shared experiences across multiple journeys
  elementalSignatures: {        // How this pattern shows up elementally
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  wisdomExtracted: string;      // Pattern-level wisdom (anonymized)
  exampleJourneys: string[];    // Pointers to actual journeys (privacy-preserving)
}

// God Between arising signature
export interface InterferenceSignature {
  signatureId: string;
  whenWhoMeets: string[];         // ["Kelly + Nathan", "engineer + mystic", etc.]
  whatEmerges: string;            // What arose that neither brought alone
  conditions: string[];           // What made it possible
  somaticMarkers: string[];       // Goosebumps, tears, somatic shift, etc.
  timestamp: Date;
  sessionId: string;
  depthLevel: number;             // 1-10 how deep/profound
}

// Cross-tradition parallel (Rosetta Stone)
export interface TraditionParallel {
  parallelId: string;
  universalPrinciple: string;    // "Sacred arising in relationship", etc.

  traditions: Array<{
    tradition: string;
    terminology: string;
    practices: string[];
    uniqueGifts: string[];
    keyTexts: string[];
  }>;

  spiralogicMapping: {
    elements: string[];
    archetypes: string[];
    practices: string[];
  };

  synthesisInsight: string;      // What MAIA learns from seeing the parallel
  contributingSources: string[]; // Documents/users that revealed this
}

// Collective contribution metadata
export interface WisdomContribution {
  contributionId: string;
  userId: string;
  userName?: string;
  timestamp: Date;

  // What was contributed
  contentType: 'conversation' | 'document' | 'practice' | 'breakthrough';
  content: string;               // Anonymized wisdom (not raw conversation)

  // Pattern it strengthens
  strengthensPattern?: string;   // Journey pattern ID
  revealsParallel?: string;      // Tradition parallel ID
  createsInterference?: string;  // Interference signature ID

  // What field offers back to contributor
  reciprocalGift: string;

  // Privacy
  privacyLevel: 'attributed' | 'anonymous' | 'private';
  optedInToCollective: boolean;
}

/**
 * Collective Wisdom Field
 * Where all facets recognize their connection to the One
 */
export class CollectiveWisdomField {
  // In-memory caches (would be Redis in production)
  private journeyPatterns = new Map<string, JourneyPattern>();
  private interferenceSignatures = new Map<string, InterferenceSignature>();
  private traditionParallels = new Map<string, TraditionParallel>();

  constructor() {
    console.log('🔮 Collective Wisdom Field initialized');
    this.loadExistingPatterns();
  }

  /**
   * Load existing patterns from database
   */
  private async loadExistingPatterns() {
    try {
      // Load journey patterns
      const { data: patterns } = await supabase
        .from('collective_journey_patterns')
        .select('*');

      if (patterns) {
        patterns.forEach(p => {
          this.journeyPatterns.set(p.pattern_id, p as JourneyPattern);
        });
        console.log(`   ✓ Loaded ${patterns.length} journey patterns`);
      }

      // Load interference signatures
      const { data: signatures } = await supabase
        .from('collective_interference_signatures')
        .select('*');

      if (signatures) {
        signatures.forEach(s => {
          this.interferenceSignatures.set(s.signature_id, s as InterferenceSignature);
        });
        console.log(`   ✓ Loaded ${signatures.length} interference signatures`);
      }

      // Load tradition parallels
      const { data: parallels } = await supabase
        .from('collective_tradition_parallels')
        .select('*');

      if (parallels) {
        parallels.forEach(p => {
          this.traditionParallels.set(p.parallel_id, p as TraditionParallel);
        });
        console.log(`   ✓ Loaded ${parallels.length} tradition parallels`);
      }

    } catch (error) {
      console.error('Failed to load patterns:', error);
    }
  }

  /**
   * Contribute wisdom to collective field
   * Returns what the field offers back
   */
  async contribute(contribution: Omit<WisdomContribution, 'contributionId' | 'reciprocalGift'>): Promise<{
    contributionId: string;
    reciprocalGift: string;
    patternsStrengthened: string[];
    parallelsRevealed: string[];
  }> {
    const contributionId = `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`\n🌀 Collective contribution from ${contribution.userName || 'anonymous'}`);
    console.log(`   Type: ${contribution.contentType}`);
    console.log(`   Opted in: ${contribution.optedInToCollective}`);

    if (!contribution.optedInToCollective) {
      console.log('   ⚠ Not opted into collective - storing privately');
      return {
        contributionId,
        reciprocalGift: 'Your wisdom is honored privately',
        patternsStrengthened: [],
        parallelsRevealed: []
      };
    }

    // Analyze contribution for patterns
    const analysis = await this.analyzeContribution(contribution);

    // Update or create journey patterns
    const patternsStrengthened = await this.updateJourneyPatterns(contribution, analysis);

    // Detect or create tradition parallels
    const parallelsRevealed = await this.updateTraditionParallels(contribution, analysis);

    // Check if this creates interference signature
    if (contribution.createsInterference) {
      await this.recordInterferenceSignature(contribution);
    }

    // Determine reciprocal gift
    const reciprocalGift = await this.determineReciprocalGift(contribution, analysis, patternsStrengthened, parallelsRevealed);

    // Store contribution
    await supabase.from('collective_contributions').insert({
      contribution_id: contributionId,
      user_id: contribution.userId,
      user_name: contribution.userName,
      timestamp: contribution.timestamp,
      content_type: contribution.contentType,
      content: contribution.content,
      strengthens_pattern: contribution.strengthensPattern,
      reveals_parallel: contribution.revealsParallel,
      creates_interference: contribution.createsInterference,
      reciprocal_gift: reciprocalGift,
      privacy_level: contribution.privacyLevel,
      patterns_strengthened: patternsStrengthened,
      parallels_revealed: parallelsRevealed
    });

    console.log(`   ✨ Patterns strengthened: ${patternsStrengthened.length}`);
    console.log(`   🗿 Parallels revealed: ${parallelsRevealed.length}`);
    console.log(`   🎁 Reciprocal gift: ${reciprocalGift.substring(0, 100)}...`);

    return {
      contributionId,
      reciprocalGift,
      patternsStrengthened,
      parallelsRevealed
    };
  }

  /**
   * Analyze contribution using AI
   */
  private async analyzeContribution(contribution: any): Promise<{
    journeyThemes: string[];
    traditionsDetected: string[];
    elementalSignature: any;
    depthLevel: number;
  }> {
    try {
      const prompt = `Analyze this wisdom contribution for collective field patterns:

Content: "${contribution.content.substring(0, 2000)}"

Provide JSON:
{
  "journeyThemes": ["theme1", "theme2", ...],
  "traditionsDetected": ["tradition1", ...],
  "elementalSignature": { "fire": 0-1, "water": 0-1, "earth": 0-1, "air": 0-1, "aether": 0-1 },
  "depthLevel": 1-10
}`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: 'You are analyzing contributions to the collective wisdom field.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content || '{}');

    } catch (error) {
      console.error('Contribution analysis error:', error);
      return {
        journeyThemes: [],
        traditionsDetected: [],
        elementalSignature: { fire: 0.2, water: 0.2, earth: 0.2, air: 0.2, aether: 0.2 },
        depthLevel: 5
      };
    }
  }

  /**
   * Update journey patterns with new contribution
   */
  private async updateJourneyPatterns(contribution: any, analysis: any): Promise<string[]> {
    const strengthened: string[] = [];

    for (const theme of analysis.journeyThemes) {
      // Find existing pattern or create new
      let pattern = Array.from(this.journeyPatterns.values())
        .find(p => p.patternName.toLowerCase().includes(theme.toLowerCase()));

      if (!pattern) {
        // Create new pattern
        pattern = {
          patternId: `jp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          patternName: theme,
          contributingSouls: [],
          commonThresholds: [],
          elementalSignatures: { fire: 0, water: 0, earth: 0, air: 0, aether: 0 },
          wisdomExtracted: '',
          exampleJourneys: []
        };
      }

      // Add contributor if not already present
      if (!pattern.contributingSouls.find(s => s.userId === contribution.userId)) {
        pattern.contributingSouls.push({
          userId: contribution.userId,
          name: contribution.privacyLevel === 'attributed' ? contribution.userName : undefined,
          uniqueGift: theme,
          journeyPhase: 'active'
        });
      }

      // Update elemental signature (weighted average)
      const totalContributors = pattern.contributingSouls.length;
      Object.keys(pattern.elementalSignatures).forEach(element => {
        pattern!.elementalSignatures[element as keyof typeof pattern.elementalSignatures] =
          ((pattern!.elementalSignatures[element as keyof typeof pattern.elementalSignatures] * (totalContributors - 1)) +
           (analysis.elementalSignature[element] || 0)) / totalContributors;
      });

      // Store updated pattern
      await supabase.from('collective_journey_patterns').upsert({
        pattern_id: pattern.patternId,
        pattern_name: pattern.patternName,
        contributing_souls: pattern.contributingSouls,
        common_thresholds: pattern.commonThresholds,
        elemental_signatures: pattern.elementalSignatures,
        wisdom_extracted: pattern.wisdomExtracted,
        example_journeys: pattern.exampleJourneys,
        updated_at: new Date().toISOString()
      });

      this.journeyPatterns.set(pattern.patternId, pattern);
      strengthened.push(pattern.patternId);
    }

    return strengthened;
  }

  /**
   * Update tradition parallels
   */
  private async updateTraditionParallels(contribution: any, analysis: any): Promise<string[]> {
    const revealed: string[] = [];

    if (analysis.traditionsDetected.length === 0) {
      return revealed;
    }

    // Look for cross-tradition parallels
    for (const tradition of analysis.traditionsDetected) {
      // Check if we have Spiralogic equivalent for concepts in this tradition
      const parallel = await this.detectTraditionParallel(tradition, contribution.content);

      if (parallel) {
        // Store parallel
        await supabase.from('collective_tradition_parallels').upsert({
          parallel_id: parallel.parallelId,
          universal_principle: parallel.universalPrinciple,
          traditions: parallel.traditions,
          spiralogic_mapping: parallel.spiralogicMapping,
          synthesis_insight: parallel.synthesisInsight,
          contributing_sources: parallel.contributingSources,
          updated_at: new Date().toISOString()
        });

        this.traditionParallels.set(parallel.parallelId, parallel);
        revealed.push(parallel.parallelId);
      }
    }

    return revealed;
  }

  /**
   * Detect tradition parallel (simplified - would use full knowledge graph)
   */
  private async detectTraditionParallel(tradition: string, content: string): Promise<TraditionParallel | null> {
    // Simplified example - would use sophisticated mapping
    if (tradition === 'Buddhism' && content.toLowerCase().includes('emptiness')) {
      return {
        parallelId: `tp_buddhism_emptiness_${Date.now()}`,
        universalPrinciple: 'Void as Creative Potential',
        traditions: [
          {
            tradition: 'Buddhism',
            terminology: 'Śūnyatā (emptiness)',
            practices: ['Meditation on emptiness', 'Heart Sutra contemplation'],
            uniqueGifts: ['2,500 years of refined practice', 'Precise phenomenology'],
            keyTexts: ['Heart Sutra', 'Nāgārjuna']
          },
          {
            tradition: 'Spiralogic',
            terminology: 'Aether - field of infinite possibility',
            practices: ['Void meditation', 'Creative emergence practices'],
            uniqueGifts: ['Embodied elemental framework', 'Western clinical integration'],
            keyTexts: ['Elemental Alchemy']
          }
        ],
        spiralogicMapping: {
          elements: ['aether'],
          archetypes: ['mystic', 'sage'],
          practices: ['Void meditation', 'Aether embodiment']
        },
        synthesisInsight: 'Both traditions work with the void as creative potential, not nihilistic absence. Buddhism offers 2,500 years of refined phenomenology; Spiralogic offers embodied Western framework.',
        contributingSources: ['current']
      };
    }

    return null;
  }

  /**
   * Record interference signature (God Between arising)
   */
  private async recordInterferenceSignature(contribution: any): Promise<void> {
    const signature: InterferenceSignature = {
      signatureId: contribution.createsInterference || `sig_${Date.now()}`,
      whenWhoMeets: ['unknown'], // Would be detected from context
      whatEmerges: 'Sacred arising detected',
      conditions: [],
      somaticMarkers: [],
      timestamp: contribution.timestamp,
      sessionId: 'unknown',
      depthLevel: 8
    };

    await supabase.from('collective_interference_signatures').insert({
      signature_id: signature.signatureId,
      when_who_meets: signature.whenWhoMeets,
      what_emerges: signature.whatEmerges,
      conditions: signature.conditions,
      somatic_markers: signature.somaticMarkers,
      timestamp: signature.timestamp,
      session_id: signature.sessionId,
      depth_level: signature.depthLevel
    });

    this.interferenceSignatures.set(signature.signatureId, signature);
    console.log(`   ✨ Interference signature recorded: ${signature.whatEmerges}`);
  }

  /**
   * Determine what the field offers back to contributor
   */
  private async determineReciprocalGift(
    contribution: any,
    analysis: any,
    patternsStrengthened: string[],
    parallelsRevealed: string[]
  ): Promise<string> {
    const gifts: string[] = [];

    // Gift 1: Recognition of pattern contribution
    if (patternsStrengthened.length > 0) {
      const patterns = patternsStrengthened.map(id => this.journeyPatterns.get(id)?.patternName).filter(Boolean);
      gifts.push(`Your journey strengthens the field's understanding of: ${patterns.join(', ')}`);
    }

    // Gift 2: Cross-tradition wisdom
    if (parallelsRevealed.length > 0) {
      gifts.push(`You've helped reveal sacred parallels across wisdom traditions - the field now offers these connections to all seekers`);
    }

    // Gift 3: Wisdom from similar journeys
    const similarJourneys = await this.findSimilarJourneys(contribution.userId, analysis.journeyThemes);
    if (similarJourneys.length > 0) {
      gifts.push(`Wisdom from ${similarJourneys.length} soul(s) on similar journeys is now available to support yours`);
    }

    // Gift 4: Recognition of unique gift
    gifts.push(`Your unique facet illuminates the whole crystal - what you bring, only you can bring`);

    return gifts.join('. ') || 'Your wisdom is woven into the collective field';
  }

  /**
   * Find similar journeys for reciprocal support
   */
  private async findSimilarJourneys(userId: string, themes: string[]): Promise<any[]> {
    // Would do semantic search across journeys
    // For now, simplified
    return [];
  }

  /**
   * Find relevant patterns for a user's journey
   */
  async findRelevantPatterns(userId: string, journeyContext: string): Promise<JourneyPattern[]> {
    const allPatterns = Array.from(this.journeyPatterns.values());

    // Simple keyword matching (would use semantic search in production)
    return allPatterns.filter(pattern =>
      journeyContext.toLowerCase().includes(pattern.patternName.toLowerCase())
    );
  }

  /**
   * Find relevant tradition parallels
   */
  async findRelevantParallels(concepts: string[]): Promise<TraditionParallel[]> {
    const allParallels = Array.from(this.traditionParallels.values());

    return allParallels.filter(parallel =>
      concepts.some(concept =>
        parallel.universalPrinciple.toLowerCase().includes(concept.toLowerCase())
      )
    );
  }

  /**
   * Get field statistics
   */
  async getFieldStats(): Promise<{
    totalContributions: number;
    journeyPatterns: number;
    interferenceSignatures: number;
    traditionParallels: number;
    contributingSouls: number;
  }> {
    const { count: contributions } = await supabase
      .from('collective_contributions')
      .select('*', { count: 'exact', head: true });

    const uniqueContributors = new Set<string>();
    this.journeyPatterns.forEach(p => {
      p.contributingSouls.forEach(s => uniqueContributors.add(s.userId));
    });

    return {
      totalContributions: contributions || 0,
      journeyPatterns: this.journeyPatterns.size,
      interferenceSignatures: this.interferenceSignatures.size,
      traditionParallels: this.traditionParallels.size,
      contributingSouls: uniqueContributors.size
    };
  }
}

/**
 * Singleton
 */
let collectiveField: CollectiveWisdomField | null = null;

export function getCollectiveWisdomField(): CollectiveWisdomField {
  if (!collectiveField) {
    collectiveField = new CollectiveWisdomField();
  }
  return collectiveField;
}
