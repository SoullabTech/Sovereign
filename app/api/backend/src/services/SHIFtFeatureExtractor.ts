/**
 * SHIFt Feature Extractor
 * 
 * Extracts conversational, behavioral, and content quality signals
 * from user sessions for implicit facet scoring.
 */

import { 
  SHIFtFeatures, 
  ConversationalSignals, 
  BehavioralSignals, 
  ContentQualitySignals 
} from '../types/shift';
import { logger } from '../utils/logger';

export class SHIFtFeatureExtractor {
  // Lexicons for pattern matching
  private static readonly PURPOSE_TOKENS = [
    'purpose', 'meaning', 'why', 'mission', 'calling', 'vision',
    'meant to', 'destined', 'life\'s work', 'contribution'
  ];

  private static readonly ACTION_VERBS = [
    'will', 'going to', 'commit', 'promise', 'start', 'begin',
    'implement', 'create', 'build', 'launch', 'complete'
  ];

  private static readonly COHERENCE_MARKERS = [
    'fits', 'aligns', 'connects', 'makes sense', 'next step',
    'builds on', 'follows from', 'path', 'journey', 'direction'
  ];

  private static readonly ROUTINE_MARKERS = [
    'sleep', 'wake', 'morning', 'evening', 'routine', 'practice',
    'meditation', 'exercise', 'walk', 'meal', 'ritual', 'habit'
  ];

  private static readonly META_VERBS = [
    'notice', 'noticing', 'observe', 'realize', 'reframe', 'perspective',
    'reflect', 'consider', 'understand', 'insight', 'awareness'
  ];

  private static readonly VALUES_LEXICON = [
    'integrity', 'honesty', 'compassion', 'service', 'justice',
    'beauty', 'truth', 'wisdom', 'courage', 'love', 'growth',
    'creativity', 'freedom', 'connection', 'authenticity'
  ];

  private static readonly WHOLENESS_MARKERS = [
    'peace with', 'complete', 'whole', 'integrated', 'resolved',
    'chapter closed', 'new chapter', 'acceptance', 'gratitude'
  ];

  private static readonly EMOTION_WORDS = [
    'feel', 'feeling', 'felt', 'emotion', 'angry', 'sad', 'happy',
    'afraid', 'excited', 'anxious', 'calm', 'peaceful', 'frustrated'
  ];

  private static readonly FLOODING_MARKERS = [
    'overwhelmed', 'drowning', 'too much', 'can\'t handle',
    'falling apart', 'losing it', 'breaking down', 'spiral'
  ];

  /**
   * Extract features from a session
   */
  async extractFeatures(
    text: string,
    events: Array<{ type: string; payload: any }> = [],
    metrics?: any
  ): Promise<SHIFtFeatures> {
    const sentences = this.tokenizeSentences(text);
    const words = text.toLowerCase().split(/\s+/);
    
    // Extract conversational signals
    const conversational = this.extractConversationalSignals(sentences, words);
    
    // Extract behavioral signals
    const behavioral = this.extractBehavioralSignals(events, metrics);
    
    // Extract content quality signals
    const contentQuality = this.extractContentQualitySignals(text, sentences);
    
    return {
      conversational,
      behavioral,
      contentQuality,
      timestamp: new Date(),
      sessionId: `${Date.now()}`
    };
  }

  /**
   * Extract conversational signals from text
   */
  private extractConversationalSignals(sentences: string[], words: string[]): ConversationalSignals {
    const totalSentences = Math.max(sentences.length, 1);
    const totalWords = Math.max(words.length, 1);

    // Meaning density: % of sentences with purpose tokens
    const meaningDensity = sentences.filter(s => 
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.PURPOSE_TOKENS)
    ).length / totalSentences;

    // Action commitments: count of action verb + future time
    const actionCommitmentCount = sentences.filter(s => {
      const lower = s.toLowerCase();
      return this.containsAny(lower, SHIFtFeatureExtractor.ACTION_VERBS) &&
             (lower.includes('tomorrow') || lower.includes('week') || lower.includes('will'));
    }).length;

    // Truth naming: detect patterns of naming difficult things
    const truthNaming = sentences.some(s => {
      const lower = s.toLowerCase();
      return (lower.includes('truth is') || lower.includes('honestly') || 
              lower.includes('admit') || lower.includes('confess')) &&
             (lower.includes('hard') || lower.includes('difficult') || lower.includes('afraid'));
    });

    // Coherence markers
    const coherenceMarkers = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.COHERENCE_MARKERS)
    ).length / totalSentences;

    // Routine language
    const routineLanguage = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.ROUTINE_MARKERS)
    ).length / totalSentences;

    // Affect regulation: ratio of emotion words to flooding markers
    const emotionCount = words.filter(w => 
      SHIFtFeatureExtractor.EMOTION_WORDS.includes(w)
    ).length;
    const floodingCount = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.FLOODING_MARKERS)
    ).length;
    const affectRegulationOk = emotionCount > 0 
      ? Math.max(0, 1 - (floodingCount / emotionCount))
      : 0.5;

    // Reciprocity index
    const offers = (text.match(/\b(offer|help|support|give)\b/gi) || []).length;
    const asks = (text.match(/\b(need|request|ask|help me)\b/gi) || []).length;
    const thanks = (text.match(/\b(thank|grateful|appreciate)\b/gi) || []).length;
    const reciprocityIndex = (offers + asks + thanks) / totalWords;

    // Meta references
    const metaReferences = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.META_VERBS)
    ).length / totalSentences;

    // Values hits
    const valuesHits = words.filter(w =>
      SHIFtFeatureExtractor.VALUES_LEXICON.includes(w)
    ).length;

    // Wholeness references
    const wholenessReferences = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), SHIFtFeatureExtractor.WHOLENESS_MARKERS)
    ).length / totalSentences;

    // Integration commitment
    const integrationCommitment = sentences.some(s => {
      const lower = s.toLowerCase();
      return (lower.includes('try') || lower.includes('practice')) &&
             (lower.includes('days') || lower.includes('week')) &&
             (lower.includes('will') || lower.includes('going to'));
    });

    // Integrity repair
    const integrityRepair = sentences.some(s => {
      const lower = s.toLowerCase();
      return (lower.includes('apologize') || lower.includes('sorry') || 
              lower.includes('make it right') || lower.includes('repair')) &&
             (lower.includes('will') || lower.includes('commit'));
    });

    return {
      meaningDensity: Math.min(1, meaningDensity),
      actionCommitmentCount,
      truthNaming,
      coherenceMarkers: Math.min(1, coherenceMarkers),
      routineLanguage: Math.min(1, routineLanguage),
      affectRegulationOk: Math.min(1, affectRegulationOk),
      reciprocityIndex: Math.min(1, reciprocityIndex * 10), // normalize
      metaReferences: Math.min(1, metaReferences),
      valuesHits,
      wholenessReferences: Math.min(1, wholenessReferences),
      integrationCommitment,
      integrityRepair
    };
  }

  /**
   * Extract behavioral signals from events and metrics
   */
  private extractBehavioralSignals(
    events: Array<{ type: string; payload: any }>,
    metrics?: any
  ): BehavioralSignals {
    // Use provided metrics or extract from events
    const streakDays = metrics?.streakDays || 
      this.extractStreakFromEvents(events);
    
    const journalsLast7Days = metrics?.journalEntries ||
      events.filter(e => e.type === 'journal.created').length;
    
    const ritualsLast7Days = metrics?.ritualsAttended ||
      events.filter(e => e.type === 'ritual.attended').length;
    
    // Task completion rate
    const tasksCreated = events.filter(e => e.type === 'task.created').length;
    const tasksCompleted = events.filter(e => e.type === 'task.completed').length;
    const tasksCompletionRate = tasksCreated > 0 
      ? tasksCompleted / tasksCreated 
      : 0.5;
    
    // On-time rate
    const scheduledEvents = events.filter(e => e.type === 'event.scheduled');
    const onTimeEvents = scheduledEvents.filter(e => 
      e.payload?.arrivedOnTime === true
    );
    const ontimeRate = scheduledEvents.length > 0
      ? onTimeEvents.length / scheduledEvents.length
      : 0.5;
    
    // Help seeking
    const helpSeekingAppropriate = events.some(e =>
      e.type === 'support.requested' || e.type === 'help.asked'
    );

    return {
      streakDays,
      journalsLast7Days: Math.min(7, journalsLast7Days),
      ritualsLast7Days: Math.min(7, ritualsLast7Days),
      tasksCompletionRate: Math.min(1, tasksCompletionRate),
      ontimeRate: Math.min(1, ontimeRate),
      helpSeekingAppropriate
    };
  }

  /**
   * Extract content quality signals
   */
  private extractContentQualitySignals(
    text: string,
    sentences: string[]
  ): ContentQualitySignals {
    // Readability variance (simplified)
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => 
      sum + Math.pow(len - avgLength, 2), 0
    ) / sentenceLengths.length;
    const readabilityVariance = Math.sqrt(variance);

    // Sentiment variance (simplified - would use NLP in production)
    const positiveCount = (text.match(/\b(good|great|happy|excited|love|wonderful)\b/gi) || []).length;
    const negativeCount = (text.match(/\b(bad|sad|angry|hate|terrible|awful)\b/gi) || []).length;
    const totalEmotiveWords = positiveCount + negativeCount;
    const sentimentVariance = totalEmotiveWords > 0
      ? Math.abs(positiveCount - negativeCount) / totalEmotiveWords
      : 0.5;

    // Avoidance score
    const avoidancePatterns = [
      'maybe later', 'not ready', 'can\'t talk about',
      'don\'t want to', 'let\'s change', 'rather not'
    ];
    const avoidanceCount = sentences.filter(s =>
      this.containsAny(s.toLowerCase(), avoidancePatterns)
    ).length;
    const avoidanceScore = Math.min(1, avoidanceCount / Math.max(sentences.length, 1));

    return {
      readabilityVariance,
      sentimentVariance,
      avoidanceScore
    };
  }

  /**
   * Helper: tokenize into sentences
   */
  private tokenizeSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /**
   * Helper: check if text contains any of the tokens
   */
  private containsAny(text: string, tokens: string[]): boolean {
    return tokens.some(token => text.includes(token));
  }

  /**
   * Helper: extract streak from events
   */
  private extractStreakFromEvents(events: Array<{ type: string; payload: any }>): number {
    const practiceEvents = events
      .filter(e => e.type === 'practice.completed')
      .sort((a, b) => new Date(b.payload?.timestamp || 0).getTime() - 
                     new Date(a.payload?.timestamp || 0).getTime());
    
    if (practiceEvents.length === 0) return 0;
    
    let streak = 1;
    for (let i = 1; i < practiceEvents.length; i++) {
      const current = new Date(practiceEvents[i].payload?.timestamp || 0);
      const previous = new Date(practiceEvents[i - 1].payload?.timestamp || 0);
      const daysDiff = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }
}