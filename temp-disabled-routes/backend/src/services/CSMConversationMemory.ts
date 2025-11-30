// CSM Conversation Memory Service
// Manages conversation context and audio segments for Sesame CSM voice generation

import { EventEmitter } from 'events';
import { Segment } from './EnhancedSesameMayaRefiner';

export interface AudioSegment extends Segment {
  timestamp: number;
  duration: number;
  audioBuffer?: Buffer;
  emotionalTone?: string;
}

export interface ConversationTurn {
  id: string;
  threadId: string;
  timestamp: number;
  userMessage: string;
  mayaResponse: string;
  audioSegment?: AudioSegment;
  element: string;
  emotionalState?: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  breakthroughMarkers?: string[];
}

export interface ConversationStats {
  turnCount: number;
  averageResponseTime: number;
  emotionalCoherence: number;
  voiceConsistency: number;
  lastInteraction: number;
}

export class CSMConversationMemory extends EventEmitter {
  private conversations: Map<string, ConversationTurn[]> = new Map();
  private audioCache: Map<string, Buffer> = new Map();
  private stats: Map<string, ConversationStats> = new Map();
  private maxTurnsPerThread = 20;
  private maxCacheSize = 100 * 1024 * 1024; // 100MB
  private currentCacheSize = 0;

  constructor() {
    super();
    this.startCleanupInterval();
  }

  /** Add a conversation turn with audio */
  async addTurn(turn: ConversationTurn): Promise<void> {
    const { threadId } = turn;
    
    // Get or create conversation history
    const history = this.conversations.get(threadId) || [];
    
    // Add turn to history
    history.push(turn);
    
    // Maintain max turns per thread
    if (history.length > this.maxTurnsPerThread) {
      const removed = history.shift();
      if (removed?.audioSegment?.audioBuffer) {
        this.removeFromCache(removed.id);
      }
    }
    
    // Update conversation map
    this.conversations.set(threadId, history);
    
    // Cache audio if provided
    if (turn.audioSegment?.audioBuffer) {
      await this.cacheAudio(turn.id, turn.audioSegment.audioBuffer);
    }
    
    // Update stats
    this.updateStats(threadId, turn);
    
    // Emit event
    this.emit('turnAdded', { threadId, turn });
  }

  /** Get conversation context for CSM */
  getContextSegments(threadId: string, maxSegments: number = 5): Segment[] {
    const history = this.conversations.get(threadId) || [];
    
    // Get most recent turns
    const recentTurns = history.slice(-maxSegments);
    
    // Convert to CSM segments with audio
    return recentTurns
      .filter(turn => turn.audioSegment)
      .map(turn => ({
        speaker: turn.audioSegment!.speaker,
        text: turn.audioSegment!.text,
        audio: turn.audioSegment!.audioBuffer
      }));
  }

  /** Get conversation history with insights */
  getConversationHistory(threadId: string): {
    turns: ConversationTurn[];
    insights: {
      emotionalJourney: string[];
      keyMoments: ConversationTurn[];
      voiceConsistency: number;
      relationshipDepth: number;
    };
  } {
    const history = this.conversations.get(threadId) || [];
    
    return {
      turns: history,
      insights: {
        emotionalJourney: this.analyzeEmotionalJourney(history),
        keyMoments: this.identifyKeyMoments(history),
        voiceConsistency: this.calculateVoiceConsistency(history),
        relationshipDepth: this.calculateRelationshipDepth(history)
      }
    };
  }

  /** Get conversation for breakthrough detection */
  getBreakthroughContext(threadId: string): {
    recentExchanges: ConversationTurn[];
    emotionalPeaks: ConversationTurn[];
    transformativeLanguage: string[];
  } {
    const history = this.conversations.get(threadId) || [];
    const recent = history.slice(-5);
    
    return {
      recentExchanges: recent,
      emotionalPeaks: this.findEmotionalPeaks(history),
      transformativeLanguage: this.extractTransformativeLanguage(history)
    };
  }

  /** Analyze voice consistency across conversation */
  async analyzeVoiceCoherence(threadId: string): Promise<{
    coherenceScore: number;
    consistencyMetrics: {
      pitch: number;
      tone: number;
      pacing: number;
      emotionalAlignment: number;
    };
    recommendations: string[];
  }> {
    const segments = this.getContextSegments(threadId, 10);
    
    // Placeholder for actual audio analysis
    // In production, this would analyze actual audio characteristics
    return {
      coherenceScore: 0.85,
      consistencyMetrics: {
        pitch: 0.9,
        tone: 0.88,
        pacing: 0.82,
        emotionalAlignment: 0.87
      },
      recommendations: [
        "Maintain consistent pacing in emotional moments",
        "Enhance tonal warmth during breakthroughs"
      ]
    };
  }

  /** Get optimal context for next response */
  getOptimalContext(
    threadId: string,
    currentEmotion: { valence: number; arousal: number },
    element: string
  ): Segment[] {
    const history = this.conversations.get(threadId) || [];
    
    // Select segments that best support current emotional state
    const relevantTurns = history.filter(turn => {
      if (!turn.emotionalState) return false;
      
      // Prefer similar emotional states for coherence
      const emotionalDistance = Math.abs(turn.emotionalState.valence - currentEmotion.valence) +
                              Math.abs(turn.emotionalState.arousal - currentEmotion.arousal);
      
      return emotionalDistance < 0.5;
    });
    
    // Also include any breakthrough moments
    const breakthroughs = history.filter(turn => 
      turn.breakthroughMarkers && turn.breakthroughMarkers.length > 0
    );
    
    // Combine and convert to segments
    const combined = [...relevantTurns, ...breakthroughs]
      .slice(-5)
      .filter(turn => turn.audioSegment)
      .map(turn => ({
        speaker: turn.audioSegment!.speaker,
        text: turn.audioSegment!.text,
        audio: turn.audioSegment!.audioBuffer
      }));
    
    return combined;
  }

  /** Private methods */

  private async cacheAudio(turnId: string, audio: Buffer): Promise<void> {
    const size = audio.length;
    
    // Check cache size limit
    if (this.currentCacheSize + size > this.maxCacheSize) {
      await this.evictOldestAudio(size);
    }
    
    this.audioCache.set(turnId, audio);
    this.currentCacheSize += size;
  }

  private removeFromCache(turnId: string): void {
    const audio = this.audioCache.get(turnId);
    if (audio) {
      this.currentCacheSize -= audio.length;
      this.audioCache.delete(turnId);
    }
  }

  private async evictOldestAudio(neededSize: number): Promise<void> {
    const entries = Array.from(this.audioCache.entries());
    let freedSize = 0;
    
    for (const [id, audio] of entries) {
      this.removeFromCache(id);
      freedSize += audio.length;
      
      if (freedSize >= neededSize) break;
    }
  }

  private updateStats(threadId: string, turn: ConversationTurn): void {
    const existing = this.stats.get(threadId) || {
      turnCount: 0,
      averageResponseTime: 0,
      emotionalCoherence: 0.8,
      voiceConsistency: 0.85,
      lastInteraction: Date.now()
    };
    
    this.stats.set(threadId, {
      ...existing,
      turnCount: existing.turnCount + 1,
      lastInteraction: Date.now()
    });
  }

  private analyzeEmotionalJourney(history: ConversationTurn[]): string[] {
    const journey: string[] = [];
    
    let prevValence = 0.5;
    for (const turn of history) {
      if (!turn.emotionalState) continue;
      
      const valence = turn.emotionalState.valence;
      
      if (valence > prevValence + 0.2) {
        journey.push(`Positive shift at turn ${history.indexOf(turn) + 1}`);
      } else if (valence < prevValence - 0.2) {
        journey.push(`Challenging moment at turn ${history.indexOf(turn) + 1}`);
      }
      
      prevValence = valence;
    }
    
    return journey;
  }

  private identifyKeyMoments(history: ConversationTurn[]): ConversationTurn[] {
    return history.filter(turn => {
      // Key moments have breakthroughs or high emotional intensity
      const hasBreakthrough = turn.breakthroughMarkers && turn.breakthroughMarkers.length > 0;
      const highEmotion = turn.emotionalState && 
        (turn.emotionalState.arousal > 0.7 || turn.emotionalState.valence > 0.8);
      
      return hasBreakthrough || highEmotion;
    });
  }

  private calculateVoiceConsistency(history: ConversationTurn[]): number {
    // Simplified consistency calculation
    // In production, would analyze actual audio characteristics
    const turnsWithAudio = history.filter(t => t.audioSegment);
    if (turnsWithAudio.length < 2) return 1.0;
    
    // Simulate consistency based on element changes
    let consistencyScore = 1.0;
    for (let i = 1; i < turnsWithAudio.length; i++) {
      if (turnsWithAudio[i].element !== turnsWithAudio[i-1].element) {
        consistencyScore -= 0.05;
      }
    }
    
    return Math.max(0.7, consistencyScore);
  }

  private calculateRelationshipDepth(history: ConversationTurn[]): number {
    // Simple depth calculation based on conversation length and breakthroughs
    const baseDepth = Math.min(history.length / 20, 0.5);
    const breakthroughBonus = history.filter(t => 
      t.breakthroughMarkers && t.breakthroughMarkers.length > 0
    ).length * 0.1;
    
    return Math.min(1.0, baseDepth + breakthroughBonus);
  }

  private findEmotionalPeaks(history: ConversationTurn[]): ConversationTurn[] {
    return history.filter(turn => 
      turn.emotionalState && 
      (turn.emotionalState.arousal > 0.8 || 
       Math.abs(turn.emotionalState.valence - 0.5) > 0.4)
    );
  }

  private extractTransformativeLanguage(history: ConversationTurn[]): string[] {
    const transformativePatterns = [
      /i (realize|understand|see) now/i,
      /breakthrough/i,
      /transform/i,
      /never thought of it that way/i,
      /this changes everything/i,
      /i feel different/i
    ];
    
    const matches: string[] = [];
    for (const turn of history) {
      for (const pattern of transformativePatterns) {
        const match = turn.userMessage.match(pattern);
        if (match) {
          matches.push(match[0]);
        }
      }
    }
    
    return [...new Set(matches)];
  }

  private startCleanupInterval(): void {
    // Clean up old conversations every hour
    setInterval(() => {
      const oneHourAgo = Date.now() - 3600000;
      
      for (const [threadId, stats] of this.stats.entries()) {
        if (stats.lastInteraction < oneHourAgo) {
          this.conversations.delete(threadId);
          this.stats.delete(threadId);
          
          // Remove associated audio
          const history = this.conversations.get(threadId) || [];
          for (const turn of history) {
            if (turn.audioSegment?.audioBuffer) {
              this.removeFromCache(turn.id);
            }
          }
        }
      }
    }, 3600000);
  }

  /** Get memory statistics */
  getMemoryStats(): {
    activeThreads: number;
    totalTurns: number;
    cacheSize: number;
    oldestThread: number;
  } {
    let totalTurns = 0;
    let oldestInteraction = Date.now();
    
    for (const [_, history] of this.conversations) {
      totalTurns += history.length;
    }
    
    for (const [_, stats] of this.stats) {
      if (stats.lastInteraction < oldestInteraction) {
        oldestInteraction = stats.lastInteraction;
      }
    }
    
    return {
      activeThreads: this.conversations.size,
      totalTurns,
      cacheSize: this.currentCacheSize,
      oldestThread: oldestInteraction
    };
  }
}

// Export singleton instance
export const csmConversationMemory = new CSMConversationMemory();