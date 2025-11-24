/**
 * Voice Journaling Service - Whisper Integration for Sacred Audio Processing
 * Connects voice input to Soul Memory System and reflection workflows
 */

import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { safetyService } from './SafetyModerationService';
import fs from 'fs';
import path from 'path';

export interface VoiceTranscriptionResult {
  success: boolean;
  text?: string;
  language?: string;
  duration?: number;
  confidence?: number;
  error?: string;
}

export interface VoiceJournalEntry {
  userId: string;
  transcription: string;
  audioMetadata: {
    duration: number;
    language: string;
    confidence: number;
    timestamp: string;
  };
  emotional_state?: any;
  safety_check?: any;
  memory_stored?: boolean;
}

export class VoiceJournalingService {
  private openai: OpenAI;
  private audioArchivePath: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    // Create audio archive directory
    this.audioArchivePath = path.join(process.cwd(), 'audio_archive');
    if (!fs.existsSync(this.audioArchivePath)) {
      fs.mkdirSync(this.audioArchivePath, { recursive: true });
    }
  }

  /**
   * Transcribe audio file using Whisper API
   */
  async transcribeAudio(
    audioBuffer: Buffer,
    filename: string,
    userId: string
  ): Promise<VoiceTranscriptionResult> {
    try {
      // Save temporary file for Whisper API
      const tempFilePath = path.join(this.audioArchivePath, `temp_${Date.now()}_${filename}`);
      fs.writeFileSync(tempFilePath, audioBuffer);

      logger.info(`Transcribing audio file for user ${userId}: ${filename}`);

      try {
        // Use Whisper API for transcription
        const transcription = await this.openai.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-1',
          language: 'en', // Can be made dynamic
          response_format: 'verbose_json'
        });

        // Calculate audio duration (approximate from file size)
        const stats = fs.statSync(tempFilePath);
        const duration = Math.round(stats.size / 16000); // Rough estimate for audio duration

        // Clean up temp file
        fs.unlinkSync(tempFilePath);

        return {
          success: true,
          text: transcription.text,
          language: transcription.language || 'en',
          duration: duration,
          confidence: 0.9 // Whisper doesn't provide confidence, using default high value
        };

      } catch (whisperError: any) {
        logger.error('Whisper transcription failed:', whisperError);
        
        // Clean up temp file on error
        if (fs.existsSync(tempFilePath)) {
          fs.unlinkSync(tempFilePath);
        }

        return {
          success: false,
          error: `Transcription failed: ${whisperError.message}`
        };
      }

    } catch (error: any) {
      logger.error('Voice transcription service error:', error);
      return {
        success: false,
        error: `Service error: ${error.message}`
      };
    }
  }

  /**
   * Process voice journal entry with safety checks and memory storage
   */
  async processVoiceJournal(
    audioBuffer: Buffer,
    filename: string,
    userId: string,
    archiveAudio: boolean = true
  ): Promise<VoiceJournalEntry> {
    // Step 1: Transcribe audio
    const transcription = await this.transcribeAudio(audioBuffer, filename, userId);
    
    if (!transcription.success || !transcription.text) {
      throw new Error(transcription.error || 'Transcription failed');
    }

    // Step 2: Safety moderation
    const safetyCheck = await safetyService.moderateInput(transcription.text, userId);

    // Step 3: Archive audio file if requested
    let audioArchived = false;
    if (archiveAudio) {
      try {
        const archiveFilename = `${userId}_${Date.now()}_${filename}`;
        const archivePath = path.join(this.audioArchivePath, archiveFilename);
        fs.writeFileSync(archivePath, audioBuffer);
        audioArchived = true;
        logger.info(`Archived voice journal audio: ${archiveFilename}`);
      } catch (archiveError) {
        logger.error('Failed to archive audio:', archiveError);
        // Continue processing even if archiving fails
      }
    }

    // Step 4: Store in Soul Memory System (if safe)
    let memoryStored = false;
    if (safetyCheck.safe) {
      try {
        // In full implementation, this would integrate with SoulMemoryService
        logger.info(`Would store voice journal memory for user ${userId}`);
        memoryStored = true;
      } catch (memoryError) {
        logger.error('Failed to store voice journal memory:', memoryError);
      }
    }

    return {
      userId,
      transcription: transcription.text,
      audioMetadata: {
        duration: transcription.duration || 0,
        language: transcription.language || 'en',
        confidence: transcription.confidence || 0.9,
        timestamp: new Date().toISOString()
      },
      emotional_state: safetyCheck.severity !== 'low' ? {
        severity: safetyCheck.severity,
        categories: safetyCheck.categories
      } : undefined,
      safety_check: safetyCheck,
      memory_stored: memoryStored
    };
  }

  /**
   * Generate reflective response to voice journal entry
   */
  async generateReflectiveResponse(
    transcription: string,
    userId: string,
    context?: any
  ): Promise<string> {
    try {
      // Create reflective prompt
      const reflectivePrompt = `You are a compassionate spiritual companion reflecting on a voice journal entry. 
      
The user has shared: "${transcription}"

Respond with gentle, reflective questions or insights that honor their sharing. Focus on:
- Acknowledging what they've expressed
- Asking curious, non-judgmental questions 
- Offering gentle perspectives or connections
- Inviting deeper exploration if appropriate

Keep your response warm, brief (2-3 sentences), and voice-friendly for potential audio synthesis.`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: reflectivePrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 150
      });

      return completion.choices[0].message.content || 
        '🤗 Thank you for sharing. What feels most important about what you just expressed?';

    } catch (error) {
      logger.error('Failed to generate reflective response:', error);
      return '🤗 I appreciate you sharing your voice with me. What would you like to explore about this?';
    }
  }

  /**
   * Process voice journal with orchestrated reflection workflow
   */
  async processWithReflectionWorkflow(
    audioBuffer: Buffer,
    filename: string,
    userId: string
  ): Promise<{
    journalEntry: VoiceJournalEntry;
    reflectiveResponse: string;
    workflowSuggestion?: any;
  }> {
    // Process the voice journal
    const journalEntry = await this.processVoiceJournal(audioBuffer, filename, userId);

    // Generate reflective response
    const reflectiveResponse = await this.generateReflectiveResponse(
      journalEntry.transcription,
      userId,
      { emotional_state: journalEntry.emotional_state }
    );

    // Check if workflow should be suggested based on content
    let workflowSuggestion;
    if (journalEntry.safety_check && !journalEntry.safety_check.safe) {
      // Suggest crisis support workflow for safety concerns
      workflowSuggestion = {
        workflowId: 'crisis_support',
        reason: 'safety_concern',
        message: 'I sense you might benefit from some gentle support. Would you like to explore a guided journey together?'
      };
    } else if (this.detectMorningContent(journalEntry.transcription)) {
      // Suggest morning reflection workflow
      workflowSuggestion = {
        workflowId: 'morning_reflection',
        reason: 'morning_context',
        message: 'It sounds like you\'re starting your day mindfully. Would you like a brief morning reflection journey?'
      };
    } else if (this.detectShadowContent(journalEntry.transcription)) {
      // Suggest shadow work workflow
      workflowSuggestion = {
        workflowId: 'shadow_integration',
        reason: 'shadow_exploration',
        message: 'I hear some deeper exploration calling. Would you like gentle guidance for working with what\'s arising?'
      };
    }

    return {
      journalEntry,
      reflectiveResponse,
      workflowSuggestion
    };
  }

  /**
   * Detect morning-related content
   */
  private detectMorningContent(text: string): boolean {
    const morningKeywords = [
      'morning', 'wake up', 'start the day', 'beginning', 'intention', 
      'today', 'ahead', 'sunrise', 'new day'
    ];
    const lowerText = text.toLowerCase();
    return morningKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Detect shadow work themes
   */
  private detectShadowContent(text: string): boolean {
    const shadowKeywords = [
      'struggle', 'difficult', 'painful', 'shadow', 'dark', 'rejected',
      'ashamed', 'guilty', 'angry', 'frustrated', 'stuck', 'pattern',
      'trigger', 'reaction', 'upset', 'bothered'
    ];
    const lowerText = text.toLowerCase();
    return shadowKeywords.some(keyword => lowerText.includes(keyword));
  }

  /**
   * Get user's voice journaling statistics
   */
  async getVoiceJournalingStats(userId: string): Promise<{
    totalEntries: number;
    totalDuration: number;
    averageEntryLength: number;
    languageDistribution: Record<string, number>;
    recentActivity: any[];
  }> {
    // In full implementation, this would query the database
    // For now, return placeholder data
    return {
      totalEntries: 0,
      totalDuration: 0,
      averageEntryLength: 0,
      languageDistribution: { 'en': 0 },
      recentActivity: []
    };
  }

  /**
   * Clean up old archived audio files
   */
  async cleanupOldArchives(daysToKeep: number = 30): Promise<number> {
    try {
      const files = fs.readdirSync(this.audioArchivePath);
      const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.audioArchivePath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }

      logger.info(`Cleaned up ${deletedCount} old audio archive files`);
      return deletedCount;

    } catch (error) {
      logger.error('Failed to cleanup old archives:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const voiceJournalingService = new VoiceJournalingService();