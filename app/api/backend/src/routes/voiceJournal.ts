/**
 * Voice Journal API Routes
 * Endpoints for voice transcription, journaling, and reflection workflows
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { voiceJournalingService } from '../services/VoiceJournalingService';
import { safetyMiddleware, postResponseSafetyCheck } from '../middleware/SafetyMiddleware';
import { orchestrationEngine } from '../core/orchestration/OrchestrationEngine';
import { comprehensiveSafetyService } from '../services/ComprehensiveSafetyService';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files
    const allowedMimeTypes = [
      'audio/webm',
      'audio/wav',
      'audio/mp3',
      'audio/mpeg',
      'audio/ogg',
      'audio/m4a',
      'audio/x-m4a'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio file type'));
    }
  }
});

/**
 * POST /api/v1/voice/transcribe
 * Transcribe audio to text using Whisper
 */
router.post('/transcribe', 
  upload.single('audio'),
  safetyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID required'
        });
      }

      logger.info('Processing voice transcription', {
        userId,
        fileSize: audioFile.size,
        mimeType: audioFile.mimetype
      });

      // Transcribe audio
      const result = await voiceJournalingService.transcribeAudio(
        audioFile.buffer,
        audioFile.originalname,
        userId
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error
        });
      }

      // Perform safety check on transcription
      const safetyAnalysis = await comprehensiveSafetyService.analyzeSafety(
        result.text!,
        userId
      );

      res.json({
        success: true,
        transcription: {
          text: result.text,
          language: result.language,
          duration: result.duration,
          confidence: result.confidence
        },
        safety: {
          safe: safetyAnalysis.safe,
          riskLevel: safetyAnalysis.riskLevel,
          emotionalState: safetyAnalysis.emotionalState
        }
      });

    } catch (error: any) {
      logger.error('Voice transcription error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Transcription failed'
      });
    }
  }
);

/**
 * POST /api/v1/voice/journal
 * Process voice journal entry with full pipeline
 */
router.post('/journal',
  upload.single('audio'),
  safetyMiddleware,
  postResponseSafetyCheck,
  async (req: Request, res: Response) => {
    try {
      const { userId, sessionId, archiveAudio = true } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({
          success: false,
          error: 'No audio file provided'
        });
      }

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID required'
        });
      }

      logger.info('Processing voice journal', {
        userId,
        sessionId,
        fileSize: audioFile.size
      });

      // Process with full reflection workflow
      const result = await voiceJournalingService.processWithReflectionWorkflow(
        audioFile.buffer,
        audioFile.originalname,
        userId
      );

      // Orchestrate follow-up flow if suggested
      let orchestrationResponse;
      if (result.workflowSuggestion) {
        const orchestrationRequest = {
          userId,
          sessionId: sessionId || `voice_${Date.now()}`,
          input: result.journalEntry.transcription,
          intent: result.workflowSuggestion.workflowId as any,
          context: {
            voiceJournal: true,
            emotionalState: result.journalEntry.emotional_state
          },
          safetyAnalysis: result.journalEntry.safety_check
        };

        orchestrationResponse = await orchestrationEngine.orchestrate(orchestrationRequest);
      }

      res.json({
        success: true,
        journalEntry: {
          transcription: result.journalEntry.transcription,
          metadata: result.journalEntry.audioMetadata,
          emotionalState: result.journalEntry.emotional_state,
          memoryStored: result.journalEntry.memory_stored
        },
        reflection: {
          response: result.reflectiveResponse,
          workflowSuggestion: result.workflowSuggestion
        },
        orchestration: orchestrationResponse
      });

    } catch (error: any) {
      logger.error('Voice journal processing error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Journal processing failed'
      });
    }
  }
);

/**
 * POST /api/v1/voice/session/start
 * Start a voice journaling session
 */
router.post('/session/start',
  safetyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID required'
        });
      }

      // Create session ID
      const sessionId = `voice_session_${userId}_${Date.now()}`;

      // Initialize session in orchestration engine
      const orchestrationContext = {
        userId,
        sessionId,
        input: 'Starting voice journaling session',
        intent: 'journal_reflect' as any,
        preferredModality: 'voice' as any
      };

      const orchestration = await orchestrationEngine.orchestrate(orchestrationContext);

      res.json({
        success: true,
        session: {
          sessionId,
          userId,
          startTime: new Date().toISOString(),
          suggestedAgent: orchestration.selectedAgent,
          suggestedFlow: orchestration.selectedFlow,
          flowParameters: orchestration.flowParameters
        },
        prompts: [
          'What\'s alive in you right now?',
          'What are you grateful for today?',
          'What patterns are you noticing?',
          'What wants to be expressed?'
        ]
      });

    } catch (error: any) {
      logger.error('Session start error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to start session'
      });
    }
  }
);

/**
 * POST /api/v1/voice/session/end
 * End a voice journaling session with summary
 */
router.post('/session/end',
  safetyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId, sessionId } = req.body;

      if (!userId || !sessionId) {
        return res.status(400).json({
          success: false,
          error: 'User ID and Session ID required'
        });
      }

      // Get session statistics
      const stats = await voiceJournalingService.getVoiceJournalingStats(userId);

      // Generate session insights (placeholder for now)
      const insights = {
        emotionalJourney: 'Your voice carried both vulnerability and strength today',
        keyThemes: ['self-discovery', 'gratitude', 'growth'],
        suggestions: [
          'Consider exploring the theme of growth in tomorrow\'s reflection',
          'Your gratitude practice is deepening - keep nurturing it'
        ]
      };

      res.json({
        success: true,
        session: {
          sessionId,
          endTime: new Date().toISOString(),
          statistics: stats
        },
        insights,
        nextSteps: [
          {
            type: 'reflection',
            prompt: 'What did you discover in your voice today?'
          },
          {
            type: 'integration',
            prompt: 'How will you carry today\'s insights forward?'
          }
        ]
      });

    } catch (error: any) {
      logger.error('Session end error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to end session'
      });
    }
  }
);

/**
 * GET /api/v1/voice/history
 * Get user's voice journal history
 */
router.get('/history',
  safetyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID required'
        });
      }

      const stats = await voiceJournalingService.getVoiceJournalingStats(String(userId));

      res.json({
        success: true,
        history: stats.recentActivity,
        statistics: {
          totalEntries: stats.totalEntries,
          totalDuration: stats.totalDuration,
          averageLength: stats.averageEntryLength
        }
      });

    } catch (error: any) {
      logger.error('History fetch error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch history'
      });
    }
  }
);

/**
 * POST /api/v1/voice/reflect
 * Generate AI reflection on voice journal entry
 */
router.post('/reflect',
  safetyMiddleware,
  postResponseSafetyCheck,
  async (req: Request, res: Response) => {
    try {
      const { userId, transcription, context } = req.body;

      if (!userId || !transcription) {
        return res.status(400).json({
          success: false,
          error: 'User ID and transcription required'
        });
      }

      // Generate reflective response
      const reflection = await voiceJournalingService.generateReflectiveResponse(
        transcription,
        userId,
        context
      );

      // Check if deeper work is suggested
      const orchestrationRequest = {
        userId,
        sessionId: `reflection_${Date.now()}`,
        input: transcription,
        context: {
          reflectionRequested: true,
          ...context
        }
      };

      const orchestration = await orchestrationEngine.orchestrate(orchestrationRequest);

      res.json({
        success: true,
        reflection: {
          response: reflection,
          suggestedFlow: orchestration.selectedFlow,
          suggestions: orchestration.suggestions
        }
      });

    } catch (error: any) {
      logger.error('Reflection generation error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate reflection'
      });
    }
  }
);

/**
 * POST /api/v1/voice/weekly-reflection
 * Generate weekly voice journal reflection
 */
router.post('/weekly-reflection',
  safetyMiddleware,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID required'
        });
      }

      // For now, return a structured weekly reflection
      // In full implementation, this would analyze actual journal entries
      const weeklyReflection = {
        summary: 'This week, your voice carried themes of growth and self-discovery',
        emotionalJourney: {
          start: 'seeking',
          middle: 'processing',
          current: 'integrating'
        },
        keyInsights: [
          'You\'re learning to trust your inner voice more deeply',
          'Gratitude has become a consistent theme in your reflections',
          'You\'re moving from questioning to knowing'
        ],
        patterns: [
          {
            type: 'growth',
            description: 'Increasing clarity in self-expression'
          },
          {
            type: 'rhythm',
            description: 'Morning reflections tend to be most insightful'
          }
        ],
        suggestions: [
          'Continue your morning voice practice - it\'s serving you well',
          'Consider exploring the theme of trust more deeply',
          'Your gratitude practice is ripening - perhaps share it with others'
        ],
        celebr: 'Your commitment to daily reflection is creating real transformation'
      };

      res.json({
        success: true,
        weeklyReflection
      });

    } catch (error: any) {
      logger.error('Weekly reflection error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate weekly reflection'
      });
    }
  }
);

/**
 * DELETE /api/v1/voice/cleanup
 * Clean up old audio archives (admin only)
 */
router.delete('/cleanup',
  async (req: Request, res: Response) => {
    try {
      // In production, add admin authentication here
      const { daysToKeep = 30 } = req.body;

      const deletedCount = await voiceJournalingService.cleanupOldArchives(daysToKeep);

      res.json({
        success: true,
        message: `Cleaned up ${deletedCount} old audio files`
      });

    } catch (error: any) {
      logger.error('Cleanup error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Cleanup failed'
      });
    }
  }
);

export default router;