/**
 * Community Feedback API Endpoint
 * Connects Trinity user reflections to Navigator Wisdom Engine
 * Part of the Participatory Intelligence Loop
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

// Feedback schema validation
const FeedbackSchema = z.object({
  user_id: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
  faith_context: z.string().min(1),
  elemental_focus: z.enum(['fire', 'water', 'earth', 'air', 'aether']).optional(),
  reflection: z.string().min(10).max(5000),
  insight_level: z.number().min(0).max(1),
  emotional_shift: z.string().optional(),
  ritual_effectiveness: z.number().min(0).max(1).optional(),
  practice_type: z.string().optional(),
  spiritual_phase: z.enum(['initiation', 'grounding', 'collaboration', 'transformation', 'completion']).optional(),
  privacy_level: z.enum(['private', 'anonymous', 'community']).default('anonymous'),
  crisis_indicators: z.array(z.string()).optional(),
  community_share: z.boolean().default(false)
});

type FeedbackData = z.infer<typeof FeedbackSchema>;

interface NavigatorWisdomPayload {
  user_id: string;
  resonance_pattern: {
    elemental_emphasis: Record<string, number>;
    virtue_development: Record<string, number>;
    emotional_tone: string[];
    spiritual_depth: number;
    community_connection: number;
  };
  aggregated_insights: {
    practice_effectiveness: Record<string, number>;
    common_challenges: string[];
    breakthrough_patterns: string[];
  };
  timestamp: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests'
    });
  }

  try {
    // Validate incoming feedback data
    const feedbackData: FeedbackData = FeedbackSchema.parse({
      ...req.body,
      timestamp: req.body.timestamp || new Date().toISOString()
    });

    // Check for crisis indicators
    const crisisKeywords = [
      'suicide', 'self-harm', 'hopeless', 'desperate',
      'crisis', 'emergency', 'can\'t go on', 'want to die'
    ];

    const hasCrisisLanguage = crisisKeywords.some(keyword =>
      feedbackData.reflection.toLowerCase().includes(keyword)
    );

    if (hasCrisisLanguage || feedbackData.crisis_indicators?.length > 0) {
      // Immediate crisis response
      await handleSpiritualCrisis(feedbackData);

      return res.status(200).json({
        message: 'Crisis support activated',
        crisis_response: true,
        support_resources: {
          immediate: 'spiritual-crisis-hotline',
          community: 'pastoral-care-network',
          professional: 'mental-health-referrals'
        }
      });
    }

    // Process feedback for Navigator Wisdom Engine
    const navigatorPayload = await processFeedbackForNavigator(feedbackData);

    // Send to Navigator Wisdom Engine (simulated - replace with actual integration)
    await sendToNavigatorEngine(navigatorPayload);

    // Store feedback in AIN Faith Memory (if user consents)
    if (feedbackData.privacy_level !== 'private') {
      await storeInFaithMemory(feedbackData);
    }

    // Generate community insights (anonymized)
    if (feedbackData.community_share) {
      await contributeToCollectiveWisdom(feedbackData);
    }

    // Log successful processing
    console.log('Feedback processed successfully:', {
      user_id: feedbackData.user_id,
      elemental_focus: feedbackData.elemental_focus,
      insight_level: feedbackData.insight_level,
      community_contribution: feedbackData.community_share
    });

    return res.status(200).json({
      message: 'Feedback received and processed successfully',
      navigator_integration: true,
      community_contribution: feedbackData.community_share,
      next_insights_available: true
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.errors,
        message: 'Please check your feedback format and try again'
      });
    }

    console.error('Feedback processing error:', error);

    return res.status(500).json({
      error: 'Internal server error',
      message: 'Unable to process feedback at this time'
    });
  }
}

// Crisis support handler
async function handleSpiritualCrisis(feedback: FeedbackData): Promise<void> {
  // Immediate notifications to crisis support team
  console.log('SPIRITUAL CRISIS DETECTED:', {
    user_id: feedback.user_id,
    timestamp: feedback.timestamp,
    faith_context: feedback.faith_context
  });

  // TODO: Implement actual crisis response protocols:
  // - Notify on-call spiritual crisis counselors
  // - Send immediate supportive response to user
  // - Escalate to mental health professionals if needed
  // - Activate community prayer/support network
  // - Follow up within 24 hours
}

// Process feedback for Navigator Wisdom Engine
async function processFeedbackForNavigator(feedback: FeedbackData): Promise<NavigatorWisdomPayload> {
  // Analyze reflection text for elemental resonance
  const elementalAnalysis = await analyzeElementalResonance(feedback.reflection);

  // Extract virtue development patterns
  const virtuePatterns = await extractVirtuePatterns(feedback.reflection, feedback.faith_context);

  // Determine spiritual depth indicators
  const spiritualDepth = calculateSpiritualDepth(feedback.insight_level, feedback.ritual_effectiveness);

  return {
    user_id: feedback.user_id,
    resonance_pattern: {
      elemental_emphasis: elementalAnalysis,
      virtue_development: virtuePatterns,
      emotional_tone: [feedback.emotional_shift || 'neutral'],
      spiritual_depth: spiritualDepth,
      community_connection: feedback.community_share ? 1.0 : 0.5
    },
    aggregated_insights: {
      practice_effectiveness: {
        [feedback.practice_type || 'general']: feedback.ritual_effectiveness || 0.5
      },
      common_challenges: [], // Populated by aggregate analysis
      breakthrough_patterns: [] // Identified through pattern recognition
    },
    timestamp: feedback.timestamp || new Date().toISOString()
  };
}

// Analyze text for elemental resonance patterns
async function analyzeElementalResonance(text: string): Promise<Record<string, number>> {
  // Simplified elemental keyword analysis
  // In production, this would use advanced NLP/LLM analysis

  const elementalKeywords = {
    fire: ['inspiration', 'transformation', 'passion', 'vision', 'awakening', 'breakthrough', 'burning'],
    water: ['compassion', 'flow', 'emotion', 'tears', 'healing', 'forgiveness', 'peace'],
    earth: ['grounded', 'service', 'practical', 'community', 'embodied', 'stable', 'rooted'],
    air: ['wisdom', 'clarity', 'understanding', 'insight', 'communication', 'breath', 'light'],
    aether: ['union', 'transcendent', 'mystical', 'silence', 'presence', 'divine', 'beyond']
  };

  const resonance: Record<string, number> = {
    fire: 0, water: 0, earth: 0, air: 0, aether: 0
  };

  const lowerText = text.toLowerCase();

  Object.entries(elementalKeywords).forEach(([element, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        resonance[element] += 1;
      }
    });
  });

  // Normalize to 0-1 range
  const total = Object.values(resonance).reduce((sum, val) => sum + val, 0);
  if (total > 0) {
    Object.keys(resonance).forEach(element => {
      resonance[element] = resonance[element] / total;
    });
  }

  return resonance;
}

// Extract virtue development patterns from reflection
async function extractVirtuePatterns(text: string, tradition: string): Promise<Record<string, number>> {
  // Tradition-specific virtue mapping
  const virtueKeywords = {
    christian: {
      love: ['love', 'charity', 'compassion', 'care'],
      faith: ['faith', 'trust', 'belief', 'hope'],
      humility: ['humble', 'meek', 'servant', 'surrender'],
      forgiveness: ['forgive', 'mercy', 'grace', 'pardon']
    },
    islamic: {
      taqwa: ['consciousness', 'awareness', 'fear of Allah', 'piety'],
      sabr: ['patience', 'perseverance', 'endurance', 'steadfastness'],
      rahman: ['mercy', 'compassion', 'kindness', 'gentleness'],
      ihsan: ['excellence', 'beauty', 'perfection', 'worship']
    },
    buddhist: {
      compassion: ['compassion', 'loving-kindness', 'care', 'metta'],
      wisdom: ['wisdom', 'insight', 'understanding', 'prajna'],
      mindfulness: ['mindful', 'present', 'aware', 'attention'],
      equanimity: ['balance', 'calm', 'peace', 'equanimity']
    },
    hindu: {
      dharma: ['duty', 'righteousness', 'purpose', 'dharma'],
      bhakti: ['devotion', 'love', 'surrender', 'worship'],
      ahimsa: ['non-violence', 'harmlessness', 'peace', 'kindness'],
      moksha: ['liberation', 'freedom', 'realization', 'enlightenment']
    }
  };

  const traditionVirtues = virtueKeywords[tradition as keyof typeof virtueKeywords] ||
                          virtueKeywords.christian; // Default fallback

  const virtueScores: Record<string, number> = {};
  const lowerText = text.toLowerCase();

  Object.entries(traditionVirtues).forEach(([virtue, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        score += 1;
      }
    });
    virtueScores[virtue] = Math.min(score / keywords.length, 1.0);
  });

  return virtueScores;
}

// Calculate spiritual depth from quantitative indicators
function calculateSpiritualDepth(insightLevel: number, ritualEffectiveness?: number): number {
  const baseDepth = insightLevel;
  const ritualBonus = ritualEffectiveness ? (ritualEffectiveness - 0.5) * 0.2 : 0;

  return Math.min(Math.max(baseDepth + ritualBonus, 0), 1);
}

// Send processed data to Navigator Wisdom Engine
async function sendToNavigatorEngine(payload: NavigatorWisdomPayload): Promise<void> {
  // TODO: Implement actual Navigator integration
  console.log('Navigator Wisdom Engine payload:', {
    user_id: payload.user_id,
    elemental_pattern: payload.resonance_pattern.elemental_emphasis,
    spiritual_depth: payload.resonance_pattern.spiritual_depth
  });

  // In production, this would:
  // - Send HTTP request to Navigator API
  // - Update user's spiritual model
  // - Generate new insights and recommendations
  // - Trigger updated dashboard metrics
}

// Store feedback in AIN Faith Memory system
async function storeInFaithMemory(feedback: FeedbackData): Promise<void> {
  // TODO: Integrate with AIN Faith Memory Schema
  console.log('Storing in Faith Memory:', {
    user_id: feedback.user_id,
    type: 'reflection_feedback',
    privacy_level: feedback.privacy_level
  });

  // In production, this would:
  // - Encrypt sensitive spiritual data
  // - Store in user's private memory vault
  // - Update spiritual journey patterns
  // - Contribute to virtue development tracking
}

// Contribute to collective wisdom (anonymized)
async function contributeToCollectiveWisdom(feedback: FeedbackData): Promise<void> {
  // TODO: Aggregate anonymized patterns for community insights
  console.log('Contributing to collective wisdom:', {
    elemental_focus: feedback.elemental_focus,
    effectiveness: feedback.ritual_effectiveness,
    tradition: feedback.faith_context
  });

  // In production, this would:
  // - Anonymize all personal identifiers
  // - Aggregate patterns across community
  // - Generate collective spiritual insights
  // - Feed back into community recommendations
}

// Export types for use in other modules
export type { FeedbackData, NavigatorWisdomPayload };