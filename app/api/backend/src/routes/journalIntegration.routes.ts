/**
 * Journal Integration Routes - Beta Build
 * Comprehensive journaling endpoints for Spiralogic Oracle System
 */

import { Router } from 'express';
import { journalingService } from '../services/journalingService';
import { voiceJournalingService } from '../services/VoiceJournalingService';
import { logger } from '../utils/logger';
import multer from 'multer';

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for audio
});

/**
 * Health check for journal service
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'journal',
    status: 'operational',
    features: [
      'text-journaling',
      'voice-journaling',
      'pattern-analysis',
      'elemental-resonance',
      'sentiment-tracking'
    ]
  });
});

/**
 * Create a new journal entry
 * POST /api/journal/entry
 */
router.post('/entry', async (req, res) => {
  try {
    const { userId, title, content, mood, tags, isPrivate } = req.body;
    
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId and content are required'
      });
    }

    const result = await journalingService.processJournalRequest({
      userId,
      action: 'create',
      content,
      title,
      mood,
      tags,
      isPrivate
    });

    res.json(result);
  } catch (error) {
    logger.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create journal entry'
    });
  }
});

/**
 * Retrieve journal entries for a user
 * GET /api/journal/entries
 */
router.get('/entries', async (req, res) => {
  try {
    const { 
      userId, 
      limit = '20', 
      offset = '0', 
      sortBy = 'date', 
      sortOrder = 'desc',
      searchTerm,
      startDate,
      endDate
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const dateRange = startDate && endDate ? {
      start: startDate as string,
      end: endDate as string
    } : undefined;

    const result = await journalingService.processJournalRequest({
      userId: userId as string,
      action: 'retrieve',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      searchTerm: searchTerm as string,
      dateRange
    });

    res.json(result);
  } catch (error) {
    logger.error('Error retrieving journal entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve journal entries'
    });
  }
});

/**
 * Update a journal entry
 * PUT /api/journal/entry/:entryId
 */
router.put('/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { userId, title, content, mood, tags, isPrivate } = req.body;

    if (!userId || !entryId) {
      return res.status(400).json({
        success: false,
        error: 'userId and entryId are required'
      });
    }

    const result = await journalingService.processJournalRequest({
      userId,
      action: 'update',
      entryId,
      content,
      title,
      mood,
      tags,
      isPrivate
    });

    res.json(result);
  } catch (error) {
    logger.error('Error updating journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update journal entry'
    });
  }
});

/**
 * Delete a journal entry
 * DELETE /api/journal/entry/:entryId
 */
router.delete('/entry/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const { userId } = req.query;

    if (!userId || !entryId) {
      return res.status(400).json({
        success: false,
        error: 'userId and entryId are required'
      });
    }

    const result = await journalingService.processJournalRequest({
      userId: userId as string,
      action: 'delete',
      entryId
    });

    res.json(result);
  } catch (error) {
    logger.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete journal entry'
    });
  }
});

/**
 * Analyze journal patterns for a user
 * GET /api/journal/analyze
 */
router.get('/analyze', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const result = await journalingService.processJournalRequest({
      userId: userId as string,
      action: 'analyze'
    });

    res.json(result);
  } catch (error) {
    logger.error('Error analyzing journal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze journal patterns'
    });
  }
});

/**
 * Process voice journal entry
 * POST /api/journal/voice
 */
router.post('/voice', upload.single('audio'), async (req, res) => {
  try {
    const { userId } = req.body;
    const audioFile = req.file;

    if (!userId || !audioFile) {
      return res.status(400).json({
        success: false,
        error: 'userId and audio file are required'
      });
    }

    // Process voice journal with reflection workflow
    const result = await voiceJournalingService.processWithReflectionWorkflow(
      audioFile.buffer,
      audioFile.originalname,
      userId
    );

    // Store transcription as journal entry
    if (result.journalEntry.transcription) {
      await journalingService.processJournalRequest({
        userId,
        action: 'create',
        content: result.journalEntry.transcription,
        title: `Voice Journal - ${new Date().toLocaleDateString()}`,
        tags: ['voice', 'reflection']
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Error processing voice journal:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice journal'
    });
  }
});

/**
 * Get voice journaling statistics
 * GET /api/journal/voice/stats
 */
router.get('/voice/stats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    const stats = await voiceJournalingService.getVoiceJournalingStats(userId as string);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Error getting voice stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get voice journaling statistics'
    });
  }
});

/**
 * Weekly assessment endpoint
 * POST /api/journal/assessment
 */
router.post('/assessment', async (req, res) => {
  try {
    const { userId, awareness, flow, friction, shift } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId is required'
      });
    }

    // Create assessment as special journal entry
    const assessmentContent = `
Weekly Assessment - ${new Date().toLocaleDateString()}

Awareness: ${awareness || 'Not specified'}
Flow: ${flow || 'Not specified'}
Friction: ${friction || 'Not specified'}
Shift: ${shift || 'Not specified'}
    `.trim();

    const result = await journalingService.processJournalRequest({
      userId,
      action: 'create',
      content: assessmentContent,
      title: 'Weekly Sacred Mirror Assessment',
      tags: ['assessment', 'weekly', 'sacred-mirror'],
      mood: 'neutral'
    });

    res.json({
      success: true,
      message: 'Assessment saved successfully',
      data: result.data
    });
  } catch (error) {
    logger.error('Error saving assessment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save assessment'
    });
  }
});

/**
 * Get journal suggestions/prompts
 * GET /api/journal/prompts
 */
router.get('/prompts', async (req, res) => {
  try {
    const { timeOfDay = 'general', mood } = req.query;
    
    const prompts: Record<string, string[]> = {
      morning: [
        "What's alive in you this morning?",
        "What intention wants to emerge today?",
        "How is your body greeting this day?"
      ],
      evening: [
        "What moment from today stays with you?",
        "Where did you feel most yourself?",
        "What's ready to be released?"
      ],
      general: [
        "What's present for you right now?",
        "What pattern is revealing itself?",
        "What wisdom is emerging?"
      ],
      emotional: [
        "What's the texture of this feeling?",
        "Where does this live in your body?",
        "What is this emotion trying to tell you?"
      ]
    };

    const selectedPrompts = mood === 'emotional' 
      ? prompts.emotional 
      : prompts[timeOfDay as string] || prompts.general;

    res.json({
      success: true,
      prompts: selectedPrompts
    });
  } catch (error) {
    logger.error('Error getting prompts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get journal prompts'
    });
  }
});

export default router;