/**
 * 🌟 Onboarding Ceremony API Routes
 * 
 * Sacred API endpoints for initiating users into their AIN journey
 * with their personal Oracle agent assignment.
 */

import { Router } from 'express';
import { get } from '../core/di/container';
import { TOKENS } from '../core/di/tokens';
import { OnboardingCeremony, type CeremonyInitiation } from '../services/OnboardingCeremony';
import { PersonalOracleAgent } from '../agents/PersonalOracleAgent';
import { logger } from '../utils/logger';
import { generateRequestId, successResponse, errorResponse } from '../utils/sharedUtilities';

const router = Router();

/**
 * 🎭 POST /api/onboarding/ceremony - Sacred initiation ceremony
 * 
 * Assigns a PersonalOracleAgent to a new user with full cognitive architecture
 * integration (Sesame CSM, MicroPsi, LIDA, SOAR, ACT-R, POET, etc.)
 */
router.post('/ceremony', async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const ceremony = get<OnboardingCeremony>(TOKENS.ONBOARDING_CEREMONY);
    
    const initiation: CeremonyInitiation = {
      userId: req.body.userId,
      preferences: req.body.preferences,
      ceremonialContext: req.body.ceremonialContext
    };

    if (!initiation.userId) {
      return res.status(400).json(errorResponse(
        'userId is required for ceremony initiation',
        400,
        requestId
      ));
    }

    logger.info('Sacred ceremony initiated', {
      userId: initiation.userId,
      requestId,
      hasPreferences: !!initiation.preferences,
      hasCeremonialContext: !!initiation.ceremonialContext
    });

    const result = await ceremony.initiateSacredJourney(initiation);
    
    res.json(result);

  } catch (error) {
    logger.error('Ceremony API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestId
    });
    
    res.status(500).json(errorResponse(
      'Sacred ceremony failed. Please try again.',
      500,
      requestId
    ));
  }
});

/**
 * 🔮 GET /api/onboarding/oracle/:userId - Retrieve user's Oracle agent
 */
router.get('/oracle/:userId', async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { userId } = req.params;
    const ceremony = get<OnboardingCeremony>(TOKENS.ONBOARDING_CEREMONY);
    
    const result = await ceremony.getUserOracle(userId);
    
    if (result.success && result.data) {
      // Return Oracle metadata instead of the full instance
      res.json(successResponse({
        hasOracle: true,
        oracleType: 'PersonalOracleAgent',
        features: [
          'Sesame CSM conversational intelligence',
          'MicroPsi emotional modeling',
          'Full elemental cognitive architectures',
          'Spiralogic consciousness processing',
          'Oracle state machine progression'
        ]
      }, requestId));
    } else {
      res.status(404).json(result);
    }

  } catch (error) {
    logger.error('Oracle retrieval API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId
    });
    
    res.status(500).json(errorResponse(
      'Failed to retrieve Oracle agent',
      500,
      requestId
    ));
  }
});

/**
 * 💬 POST /api/onboarding/oracle/:userId/consult - Consult with user's Oracle
 * 
 * Direct consultation with the user's bound PersonalOracleAgent
 * utilizing all cognitive architectures and refinements
 */
router.post('/oracle/:userId/consult', async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { userId } = req.params;
    const ceremony = get<OnboardingCeremony>(TOKENS.ONBOARDING_CEREMONY);
    
    const oracleResult = await ceremony.getUserOracle(userId);
    
    if (!oracleResult.success || !oracleResult.data) {
      return res.status(404).json(errorResponse(
        'No Oracle found. Please complete onboarding ceremony first.',
        404,
        requestId
      ));
    }

    const oracle = oracleResult.data as PersonalOracleAgent;
    
    const consultation = await oracle.consult({
      input: req.body.input,
      userId,
      sessionId: req.body.sessionId,
      targetElement: req.body.targetElement,
      context: req.body.context
    });

    res.json(consultation);

  } catch (error) {
    logger.error('Oracle consultation API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId
    });
    
    res.status(500).json(errorResponse(
      'Oracle consultation failed',
      500,
      requestId
    ));
  }
});

/**
 * 📊 GET /api/onboarding/oracle/:userId/state - Get Oracle state and progression
 */
router.get('/oracle/:userId/state', async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { userId } = req.params;
    const ceremony = get<OnboardingCeremony>(TOKENS.ONBOARDING_CEREMONY);
    
    const oracleResult = await ceremony.getUserOracle(userId);
    
    if (!oracleResult.success || !oracleResult.data) {
      return res.status(404).json(errorResponse(
        'No Oracle found. Please complete onboarding ceremony first.',
        404,
        requestId
      ));
    }

    const oracle = oracleResult.data as PersonalOracleAgent;
    const stateResult = await oracle.getOracleState(userId);

    res.json(stateResult);

  } catch (error) {
    logger.error('Oracle state API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId
    });
    
    res.status(500).json(errorResponse(
      'Failed to retrieve Oracle state',
      500,
      requestId
    ));
  }
});

/**
 * 🔄 POST /api/onboarding/oracle/:userId/transition - Request stage transition
 */
router.post('/oracle/:userId/transition', async (req, res) => {
  const requestId = generateRequestId();
  
  try {
    const { userId } = req.params;
    const { targetStage, reason } = req.body;
    const ceremony = get<OnboardingCeremony>(TOKENS.ONBOARDING_CEREMONY);
    
    const oracleResult = await ceremony.getUserOracle(userId);
    
    if (!oracleResult.success || !oracleResult.data) {
      return res.status(404).json(errorResponse(
        'No Oracle found. Please complete onboarding ceremony first.',
        404,
        requestId
      ));
    }

    const oracle = oracleResult.data as PersonalOracleAgent;
    const transitionResult = await oracle.requestStageTransition(userId, targetStage, reason);

    res.json(transitionResult);

  } catch (error) {
    logger.error('Stage transition API error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: req.params.userId,
      requestId
    });
    
    res.status(500).json(errorResponse(
      'Stage transition failed',
      500,
      requestId
    ));
  }
});

export default router;