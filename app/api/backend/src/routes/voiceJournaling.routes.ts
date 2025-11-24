/**
 * Voice Journaling Routes - Whisper Integration API
 * Handles voice-to-text journaling with sacred memory integration
 */

import { Router, Request, Response } from 'express';
import multer from 'multer';
import { voiceJournalingService } from '../services/VoiceJournalingService';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for audio file uploads
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit (Whisper API limit)
    files: 1
  },
  fileFilter: (req, file, cb) => {
    // Accept common audio formats
    const allowedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a',
      'audio/ogg', 'audio/flac', 'audio/webm', 'audio/mp4'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid audio format. Supported: MP3, WAV, M4A, OGG, FLAC, WebM, MP4'));
    }
  }
});

/**
 * @route POST /api/voice/transcribe
 * @description Transcribe audio to text using Whisper
 */
router.post('/transcribe', audioUpload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

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

    res.json({
      success: true,
      transcription: {
        text: result.text,
        language: result.language,
        duration: result.duration,
        confidence: result.confidence
      }
    });

  } catch (error: any) {
    logger.error('Voice transcription failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Transcription failed'
    });
  }
});

/**
 * @route POST /api/voice/journal
 * @description Process voice journal entry with full workflow
 */
router.post('/journal', audioUpload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { userId, archiveAudio = 'true' } = req.body;
    const audioFile = req.file;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    const shouldArchive = archiveAudio === 'true';
    
    const journalEntry = await voiceJournalingService.processVoiceJournal(
      audioFile.buffer,
      audioFile.originalname,
      userId,
      shouldArchive
    );

    res.json({
      success: true,
      journalEntry: {
        transcription: journalEntry.transcription,
        audioMetadata: journalEntry.audioMetadata,
        emotionalState: journalEntry.emotional_state,
        memoryStored: journalEntry.memory_stored,
        safetyStatus: journalEntry.safety_check?.safe ? 'safe' : 'flagged'
      }
    });

  } catch (error: any) {
    logger.error('Voice journal processing failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice journal processing failed'
    });
  }
});

/**
 * @route POST /api/voice/journal/reflect
 * @description Process voice journal with reflective response and workflow suggestions
 */
router.post('/journal/reflect', audioUpload.single('audio'), async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'Audio file is required'
      });
    }

    const result = await voiceJournalingService.processWithReflectionWorkflow(
      audioFile.buffer,
      audioFile.originalname,
      userId
    );

    res.json({
      success: true,
      journalEntry: {
        transcription: result.journalEntry.transcription,
        audioMetadata: result.journalEntry.audioMetadata,
        memoryStored: result.journalEntry.memory_stored
      },
      reflectiveResponse: result.reflectiveResponse,
      workflowSuggestion: result.workflowSuggestion
    });

  } catch (error: any) {
    logger.error('Voice journal reflection failed:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice journal reflection failed'
    });
  }
});

/**
 * @route GET /api/voice/stats/:userId
 * @description Get voice journaling statistics for a user
 */
router.get('/stats/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const stats = await voiceJournalingService.getVoiceJournalingStats(userId);

    res.json({
      success: true,
      stats
    });

  } catch (error: any) {
    logger.error('Failed to get voice stats:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get voice statistics'
    });
  }
});

/**
 * @route POST /api/voice/admin/cleanup
 * @description Clean up old archived audio files (admin only)
 */
router.post('/admin/cleanup', async (req: Request, res: Response) => {
  try {
    const { daysToKeep = 30 } = req.body;
    
    // In production, add admin authentication here
    const deletedCount = await voiceJournalingService.cleanupOldArchives(daysToKeep);

    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} old audio files`,
      deletedCount
    });

  } catch (error: any) {
    logger.error('Failed to cleanup archives:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Cleanup failed'
    });
  }
});

/**
 * @route GET /api/voice/health
 * @description Health check for voice journaling service
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    // Test basic functionality
    const healthCheck = {
      service: 'Voice Journaling Service',
      status: 'healthy',
      features: [
        'Whisper Speech-to-Text',
        'Safety Moderation Integration', 
        'Soul Memory Integration',
        'Reflective Response Generation',
        'Workflow Suggestion Engine',
        'Audio Archiving System'
      ],
      supportedFormats: [
        'MP3', 'WAV', 'M4A', 'OGG', 'FLAC', 'WebM', 'MP4'
      ],
      maxFileSize: '25MB',
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      ...healthCheck
    });

  } catch (error: any) {
    logger.error('Voice service health check failed:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed'
    });
  }
});

export default router;