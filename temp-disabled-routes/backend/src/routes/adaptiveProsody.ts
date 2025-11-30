/**
 * Adaptive Prosody API Routes
 * Endpoints for testing and using adaptive prosody in conversations
 */

import express from 'express';
import { Logger } from '../types/core';
import { AdaptiveProsodyEngine } from '../services/AdaptiveProsodyEngine';
import { AdaptiveProsodyIntegration } from '../services/AdaptiveProsodyIntegration';

export function createAdaptiveProsodyRoutes(logger: Logger) {
  const router = express.Router();
  const prosodyEngine = new AdaptiveProsodyEngine(logger);
  const integration = new AdaptiveProsodyIntegration(logger);

  /**
   * Analyze tone from user input
   */
  router.post('/analyze-tone', async (req, res) => {
    try {
      const { text, voiceMetrics } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: 'Text input required' });
      }
      
      logger.info('[PROSODY] Analyzing tone for input:', text.substring(0, 100));
      
      const analysis = await prosodyEngine.analyzeUserTone(text, voiceMetrics);
      
      logger.info(`[PROSODY] Detected: ${analysis.dominantElement} element, ${analysis.energyLevel} energy`);
      
      res.json({
        success: true,
        analysis,
        debug: {
          inputLength: text.length,
          dominantElement: analysis.dominantElement,
          energyLevel: analysis.energyLevel,
          needsBalancing: analysis.needsBalancing,
          suggestedBalance: analysis.suggestedBalance
        }
      });
      
    } catch (error: any) {
      logger.error('[PROSODY] Tone analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze tone',
        details: error.message 
      });
    }
  });

  /**
   * Generate adaptive response with prosody
   */
  router.post('/generate-response', async (req, res) => {
    try {
      const { userInput, aiResponse, userId = 'default', voiceMetrics } = req.body;
      
      if (!userInput || !aiResponse) {
        return res.status(400).json({ 
          error: 'Both userInput and aiResponse required' 
        });
      }
      
      logger.info('[PROSODY] Generating adaptive response');
      
      // Analyze user tone
      const toneAnalysis = await prosodyEngine.analyzeUserTone(userInput, voiceMetrics);
      
      // Generate prosody response
      const prosodyResponse = await prosodyEngine.generateAdaptiveResponse(
        toneAnalysis,
        aiResponse
      );
      
      // Get therapeutic guidance
      const therapeuticGuidance = prosodyEngine.getTherapeuticGuidance(
        toneAnalysis.dominantElement,
        toneAnalysis.suggestedBalance
      );
      
      // Generate CI shaping parameters
      const shapingParams = prosodyEngine.generateCIShapingParams(prosodyResponse);
      
      logger.info(`[PROSODY] User=${toneAnalysis.dominantElement} → Mirror=${prosodyResponse.mirrorPhase.element} → Balance=${prosodyResponse.balancePhase.element}`);
      
      res.json({
        success: true,
        toneAnalysis,
        prosodyResponse,
        therapeuticGuidance,
        shapingParams,
        debug: {
          userElement: toneAnalysis.dominantElement,
          userEnergy: toneAnalysis.energyLevel,
          mirrorElement: prosodyResponse.mirrorPhase.element,
          balanceElement: prosodyResponse.balancePhase.element,
          transition: prosodyResponse.balancePhase.transition
        }
      });
      
    } catch (error: any) {
      logger.error('[PROSODY] Response generation error:', error);
      res.status(500).json({ 
        error: 'Failed to generate adaptive response',
        details: error.message 
      });
    }
  });

  /**
   * Test prosody with sample inputs
   */
  router.get('/test', async (req, res) => {
    try {
      const testCases = [
        {
          name: "Fire Energy",
          input: "This is urgent! We need to act NOW!",
          response: "I hear the urgency in your voice. Let's address this together with both clarity and calm."
        },
        {
          name: "Water Energy",
          input: "I feel so emotional about this, it touches my heart deeply",
          response: "Your feelings are valid and important. Let me help you channel this emotion into purposeful action."
        },
        {
          name: "Earth Energy",
          input: "I need a practical, step-by-step plan that's reliable",
          response: "A solid foundation is wise. Let's also explore how to bring flexibility into this structure."
        },
        {
          name: "Air Energy",
          input: "I'm analyzing all the perspectives and possibilities here",
          response: "Your mental clarity is valuable. Let's ground these insights into concrete next steps."
        },
        {
          name: "Aether Energy",
          input: "I feel connected to something greater, a universal truth",
          response: "This spiritual awareness is beautiful. Let's explore how to embody these insights in daily life."
        }
      ];
      
      const results = [];
      
      for (const test of testCases) {
        const analysis = await prosodyEngine.analyzeUserTone(test.input);
        const prosody = await prosodyEngine.generateAdaptiveResponse(
          analysis,
          test.response
        );
        
        results.push({
          name: test.name,
          input: test.input,
          detected: analysis.dominantElement,
          energy: analysis.energyLevel,
          mirror: prosody.mirrorPhase.element,
          balance: prosody.balancePhase.element,
          voiceSpeed: prosody.voiceParameters.speed,
          voicePitch: prosody.voiceParameters.pitch
        });
      }
      
      res.json({
        success: true,
        tests: results,
        summary: {
          totalTests: results.length,
          elements: [...new Set(results.map(r => r.detected))],
          balancingPairs: results.map(r => `${r.detected}→${r.balance}`)
        }
      });
      
    } catch (error: any) {
      logger.error('[PROSODY] Test error:', error);
      res.status(500).json({ 
        error: 'Test failed',
        details: error.message 
      });
    }
  });

  /**
   * Get prosody configuration and rules
   */
  router.get('/config', (req, res) => {
    res.json({
      elements: ['fire', 'water', 'earth', 'air', 'aether'],
      energyLevels: ['very_low', 'low', 'medium_low', 'medium', 'medium_high', 'high', 'very_high'],
      balancingRules: {
        fire: ['earth', 'water'],
        water: ['fire', 'earth'],
        earth: ['air', 'fire'],
        air: ['earth', 'water'],
        aether: ['earth', 'fire']
      },
      voiceRanges: {
        speed: { min: 0.5, max: 2.0, default: 1.0 },
        pitch: { min: -20, max: 20, default: 0 },
        emphasis: { min: 0, max: 1, default: 0.5 },
        warmth: { min: 0, max: 1, default: 0.5 }
      },
      therapeuticIntents: [
        'ground', 'activate', 'cool', 'stabilize', 
        'elevate', 'embody', 'balance'
      ]
    });
  });

  return router;
}

// Export for use in main app
export default createAdaptiveProsodyRoutes;