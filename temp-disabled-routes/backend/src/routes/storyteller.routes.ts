import { Router } from 'express';
import { StorytellerAgent, StorytellerContext } from '../agents/StorytellerAgent';
import { logger } from '../utils/logger';
import type { ConsciousnessProfile } from '../../lib/types/cognitive-types';

const router = Router();
const storytellerAgent = new StorytellerAgent();

/**
 * POST /api/storyteller/weave
 * Generate a personalized story based on user context
 */
router.post('/weave', async (req, res) => {
  try {
    const {
      userId,
      query,
      emotionalState,
      elementalAffinity = 'aether',
      currentChallenge,
      desiredOutcome,
      previousStories,
      consciousnessProfile
    } = req.body;

    if (!userId || !query) {
      return res.status(400).json({
        error: 'Missing required fields: userId and query are required'
      });
    }

    // Build storyteller context
    const context: StorytellerContext = {
      userQuery: query,
      emotionalState: emotionalState || {
        emotionalBalance: {
          joy: 0.5,
          sadness: 0.3,
          fear: 0.2,
          anger: 0.1,
          surprise: 0.4,
          disgust: 0.1,
          trust: 0.6,
          anticipation: 0.5,
          love: 0.7,
          contempt: 0.1,
          pride: 0.4,
          shame: 0.2,
          curiosity: 0.7,
          awe: 0.6,
          confusion: 0.3,
          excitement: 0.5,
          gratitude: 0.6,
          hope: 0.7,
          boredom: 0.2,
          frustration: 0.3,
          contemplation: 0.6,
          confidence: 0.5
        },
        motivationalDrives: {
          growth: 0.7,
          safety: 0.5,
          connection: 0.6,
          achievement: 0.5,
          understanding: 0.7,
          expression: 0.6,
          transcendence: 0.6,
          contribution: 0.5
        },
        elementalResonance: {
          fire: elementalAffinity === 'fire' ? 0.8 : 0.3,
          water: elementalAffinity === 'water' ? 0.8 : 0.3,
          earth: elementalAffinity === 'earth' ? 0.8 : 0.3,
          air: elementalAffinity === 'air' ? 0.8 : 0.3,
          aether: elementalAffinity === 'aether' ? 0.8 : 0.3
        },
        resonanceScore: 0.7
      },
      elementalAffinity,
      currentChallenge,
      desiredOutcome,
      previousStories
    };

    // Default consciousness profile if not provided
    const defaultConsciousnessProfile: ConsciousnessProfile = consciousnessProfile || {
      awarenessLevel: 0.7,
      integrationDepth: 0.6,
      resonanceField: {
        fire: elementalAffinity === 'fire' ? 0.8 : 0.3,
        water: elementalAffinity === 'water' ? 0.8 : 0.3,
        earth: elementalAffinity === 'earth' ? 0.8 : 0.3,
        air: elementalAffinity === 'air' ? 0.8 : 0.3,
        aether: elementalAffinity === 'aether' ? 0.8 : 0.3
      },
      transformationReadiness: 0.7,
      shadowIntegration: 0.5,
      archetypeActivation: {
        Seeker: 0.8,
        Sage: 0.6,
        Hero: 0.5,
        Healer: 0.5,
        Creator: 0.6
      }
    };

    // Generate story
    const storyResponse = await storytellerAgent.weaveStory(
      context,
      defaultConsciousnessProfile
    );

    // Log successful story generation
    logger.info('Story generated successfully', {
      userId,
      storyType: storyResponse.story.structure.type,
      narrativeStyle: storyResponse.story.style.voice,
      emotionalResonance: storyResponse.metadata.emotionalResonance
    });

    res.json({
      success: true,
      story: storyResponse,
      metadata: {
        generatedAt: new Date().toISOString(),
        userId,
        elementalAffinity
      }
    });

  } catch (error) {
    logger.error('Error generating story', { error });
    res.status(500).json({
      error: 'Failed to generate story',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/storyteller/quick-story
 * Generate a quick story snippet without full context
 */
router.post('/quick-story', async (req, res) => {
  try {
    const { prompt, storyType = 'parable', elementalAffinity = 'aether' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing required field: prompt'
      });
    }

    // Simplified context for quick stories
    const context: StorytellerContext = {
      userQuery: prompt,
      emotionalState: {
        emotionalBalance: {
          joy: 0.5, sadness: 0.3, fear: 0.2, anger: 0.1,
          surprise: 0.4, disgust: 0.1, trust: 0.6, anticipation: 0.5,
          love: 0.7, contempt: 0.1, pride: 0.4, shame: 0.2,
          curiosity: 0.7, awe: 0.6, confusion: 0.3, excitement: 0.5,
          gratitude: 0.6, hope: 0.7, boredom: 0.2, frustration: 0.3,
          contemplation: 0.6, confidence: 0.5
        },
        motivationalDrives: {
          growth: 0.7, safety: 0.5, connection: 0.6, achievement: 0.5,
          understanding: 0.7, expression: 0.6, transcendence: 0.6, contribution: 0.5
        },
        elementalResonance: {
          fire: 0.3, water: 0.3, earth: 0.3, air: 0.3, aether: 0.3
        },
        resonanceScore: 0.7
      },
      elementalAffinity
    };

    const consciousnessProfile: ConsciousnessProfile = {
      awarenessLevel: 0.7,
      integrationDepth: 0.6,
      resonanceField: {
        fire: 0.3, water: 0.3, earth: 0.3, air: 0.3, aether: 0.3
      },
      transformationReadiness: 0.7,
      shadowIntegration: 0.5,
      archetypeActivation: {
        Seeker: 0.8, Sage: 0.6, Hero: 0.5, Healer: 0.5, Creator: 0.6
      }
    };

    // Generate quick story
    const storyResponse = await storytellerAgent.weaveStory(context, consciousnessProfile);

    res.json({
      success: true,
      story: storyResponse.story.content,
      type: storyResponse.story.structure.type,
      wisdom: storyResponse.interpretation.wisdomTeaching
    });

  } catch (error) {
    logger.error('Error generating quick story', { error });
    res.status(500).json({
      error: 'Failed to generate quick story',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;