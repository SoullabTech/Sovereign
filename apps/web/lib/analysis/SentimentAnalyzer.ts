import { supabase } from '@/lib/supabaseClient';

export interface SentimentResult {
  score: number; // -1 to 1
  magnitude: number; // 0 to 1 (intensity)
  emotion: EmotionalState;
  confidence: number; // 0 to 1
  aspects: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    disgust: number;
    trust: number;
    anticipation: number;
  };
  temporalShift?: 'past' | 'present' | 'future';
  energyLevel: 'low' | 'medium' | 'high';
  clarity: 'confused' | 'uncertain' | 'clear' | 'crystalline';
}

export type EmotionalState = 
  | 'joyful' 
  | 'peaceful' 
  | 'excited'
  | 'grateful'
  | 'loving'
  | 'hopeful'
  | 'neutral'
  | 'contemplative'
  | 'melancholic'
  | 'anxious'
  | 'frustrated'
  | 'angry'
  | 'fearful'
  | 'overwhelmed'
  | 'numb';

export interface ConversationSentiment {
  overall: number; // Running average
  trend: 'improving' | 'stable' | 'declining';
  volatility: number; // 0 to 1 (emotional stability)
  dominantEmotion: EmotionalState;
  emotionalJourney: {
    timestamp: Date;
    sentiment: SentimentResult;
    trigger?: string;
  }[];
}

export class SentimentAnalyzer {
  private emotionLexicon: Map<string, { emotion: string; weight: number }>;
  private contextWindow: string[] = [];
  private conversationHistory: ConversationSentiment;
  
  constructor() {
    this.emotionLexicon = this.initializeLexicon();
    this.conversationHistory = {
      overall: 0,
      trend: 'stable',
      volatility: 0,
      dominantEmotion: 'neutral',
      emotionalJourney: []
    };
  }
  
  private initializeLexicon(): Map<string, { emotion: string; weight: number }> {
    const lexicon = new Map();
    
    // Joy spectrum
    const joyWords = [
      { word: 'happy', weight: 0.8 },
      { word: 'joyful', weight: 0.9 },
      { word: 'excited', weight: 0.85 },
      { word: 'delighted', weight: 0.9 },
      { word: 'thrilled', weight: 0.95 },
      { word: 'blessed', weight: 0.8 },
      { word: 'grateful', weight: 0.75 },
      { word: 'wonderful', weight: 0.8 },
      { word: 'amazing', weight: 0.85 },
      { word: 'fantastic', weight: 0.85 },
      { word: 'love', weight: 0.9 },
      { word: 'adore', weight: 0.95 },
      { word: 'appreciate', weight: 0.7 }
    ];
    
    // Sadness spectrum
    const sadnessWords = [
      { word: 'sad', weight: -0.8 },
      { word: 'depressed', weight: -0.95 },
      { word: 'melancholy', weight: -0.7 },
      { word: 'lonely', weight: -0.85 },
      { word: 'grief', weight: -0.9 },
      { word: 'sorrow', weight: -0.85 },
      { word: 'heartbroken', weight: -0.95 },
      { word: 'disappointed', weight: -0.7 },
      { word: 'hurt', weight: -0.8 },
      { word: 'crying', weight: -0.85 },
      { word: 'tears', weight: -0.8 },
      { word: 'miss', weight: -0.6 },
      { word: 'lost', weight: -0.75 }
    ];
    
    // Anger spectrum
    const angerWords = [
      { word: 'angry', weight: -0.85 },
      { word: 'furious', weight: -0.95 },
      { word: 'irritated', weight: -0.6 },
      { word: 'frustrated', weight: -0.7 },
      { word: 'annoyed', weight: -0.65 },
      { word: 'mad', weight: -0.8 },
      { word: 'rage', weight: -0.95 },
      { word: 'hate', weight: -0.9 },
      { word: 'disgusted', weight: -0.8 },
      { word: 'resentful', weight: -0.75 }
    ];
    
    // Fear spectrum
    const fearWords = [
      { word: 'afraid', weight: -0.8 },
      { word: 'scared', weight: -0.85 },
      { word: 'terrified', weight: -0.95 },
      { word: 'anxious', weight: -0.75 },
      { word: 'worried', weight: -0.7 },
      { word: 'nervous', weight: -0.65 },
      { word: 'panic', weight: -0.9 },
      { word: 'dread', weight: -0.85 },
      { word: 'uneasy', weight: -0.6 },
      { word: 'tense', weight: -0.65 }
    ];
    
    // Peace spectrum
    const peaceWords = [
      { word: 'peaceful', weight: 0.8 },
      { word: 'calm', weight: 0.75 },
      { word: 'serene', weight: 0.85 },
      { word: 'tranquil', weight: 0.85 },
      { word: 'relaxed', weight: 0.7 },
      { word: 'centered', weight: 0.75 },
      { word: 'balanced', weight: 0.7 },
      { word: 'grounded', weight: 0.75 },
      { word: 'content', weight: 0.7 },
      { word: 'satisfied', weight: 0.65 }
    ];
    
    // Hope spectrum
    const hopeWords = [
      { word: 'hopeful', weight: 0.75 },
      { word: 'optimistic', weight: 0.8 },
      { word: 'inspired', weight: 0.85 },
      { word: 'motivated', weight: 0.8 },
      { word: 'encouraged', weight: 0.75 },
      { word: 'confident', weight: 0.8 },
      { word: 'determined', weight: 0.75 },
      { word: 'empowered', weight: 0.85 },
      { word: 'possibilities', weight: 0.7 },
      { word: 'potential', weight: 0.65 }
    ];
    
    // Populate lexicon
    joyWords.forEach(item => lexicon.set(item.word, { emotion: 'joy', weight: item.weight }));
    sadnessWords.forEach(item => lexicon.set(item.word, { emotion: 'sadness', weight: item.weight }));
    angerWords.forEach(item => lexicon.set(item.word, { emotion: 'anger', weight: item.weight }));
    fearWords.forEach(item => lexicon.set(item.word, { emotion: 'fear', weight: item.weight }));
    peaceWords.forEach(item => lexicon.set(item.word, { emotion: 'peace', weight: item.weight }));
    hopeWords.forEach(item => lexicon.set(item.word, { emotion: 'hope', weight: item.weight }));
    
    return lexicon;
  }
  
  analyze(text: string, context?: string[]): SentimentResult {
    // Update context window
    if (context) {
      this.contextWindow = context;
    }
    
    const words = this.tokenize(text);
    const aspects = this.analyzeEmotionalAspects(words);
    const linguisticFeatures = this.analyzeLinguisticFeatures(text);
    const contextualAdjustment = this.applyContextualAnalysis(text, words);
    
    // Calculate base sentiment
    let sentimentScore = this.calculateWeightedSentiment(words, aspects);
    
    // Apply modifiers
    sentimentScore = this.applyIntensifiers(text, sentimentScore);
    sentimentScore = this.applyNegation(text, sentimentScore);
    sentimentScore += contextualAdjustment;
    
    // Determine magnitude (intensity)
    const magnitude = this.calculateMagnitude(text, aspects);
    
    // Determine emotional state
    const emotion = this.determineEmotionalState(aspects, sentimentScore);
    
    // Calculate confidence
    const confidence = this.calculateConfidence(words, aspects);
    
    // Analyze temporal focus
    const temporalShift = this.analyzeTemporalFocus(text);
    
    // Analyze energy level
    const energyLevel = this.analyzeEnergyLevel(text, linguisticFeatures);
    
    // Analyze clarity
    const clarity = this.analyzeClarity(text, linguisticFeatures);
    
    // Create result
    const result: SentimentResult = {
      score: Math.max(-1, Math.min(1, sentimentScore)),
      magnitude,
      emotion,
      confidence,
      aspects,
      temporalShift,
      energyLevel,
      clarity
    };
    
    // Update conversation history
    this.updateConversationHistory(result);
    
    return result;
  }
  
  private tokenize(text: string): string[] {
    return text.toLowerCase()
      .replace(/[^\w\s'-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }
  
  private analyzeEmotionalAspects(words: string[]): SentimentResult['aspects'] {
    const aspects = {
      joy: 0,
      sadness: 0,
      anger: 0,
      fear: 0,
      surprise: 0,
      disgust: 0,
      trust: 0,
      anticipation: 0
    };
    
    words.forEach(word => {
      const lexiconEntry = this.emotionLexicon.get(word);
      if (lexiconEntry) {
        const { emotion, weight } = lexiconEntry;
        
        switch(emotion) {
          case 'joy':
            aspects.joy += Math.abs(weight);
            aspects.trust += Math.abs(weight) * 0.5;
            break;
          case 'sadness':
            aspects.sadness += Math.abs(weight);
            break;
          case 'anger':
            aspects.anger += Math.abs(weight);
            aspects.disgust += Math.abs(weight) * 0.3;
            break;
          case 'fear':
            aspects.fear += Math.abs(weight);
            aspects.anticipation += Math.abs(weight) * 0.4;
            break;
          case 'peace':
            aspects.trust += Math.abs(weight);
            aspects.joy += Math.abs(weight) * 0.3;
            break;
          case 'hope':
            aspects.anticipation += Math.abs(weight);
            aspects.joy += Math.abs(weight) * 0.4;
            break;
        }
      }
    });
    
    // Normalize aspects
    const total = Object.values(aspects).reduce((sum, val) => sum + val, 0);
    if (total > 0) {
      Object.keys(aspects).forEach(key => {
        aspects[key as keyof typeof aspects] = aspects[key as keyof typeof aspects] / total;
      });
    }
    
    return aspects;
  }
  
  private analyzeLinguisticFeatures(text: string): {
    exclamations: number;
    questions: number;
    ellipses: number;
    capitals: number;
    wordCount: number;
    avgWordLength: number;
  } {
    return {
      exclamations: (text.match(/!/g) || []).length,
      questions: (text.match(/\?/g) || []).length,
      ellipses: (text.match(/\.\.\./g) || []).length,
      capitals: (text.match(/[A-Z]{2,}/g) || []).length,
      wordCount: text.split(/\s+/).length,
      avgWordLength: text.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / text.split(/\s+/).length
    };
  }
  
  private calculateWeightedSentiment(words: string[], aspects: SentimentResult['aspects']): number {
    let sentiment = 0;
    let weightSum = 0;
    
    words.forEach(word => {
      const lexiconEntry = this.emotionLexicon.get(word);
      if (lexiconEntry) {
        sentiment += lexiconEntry.weight;
        weightSum += Math.abs(lexiconEntry.weight);
      }
    });
    
    // Add aspect-based adjustment
    sentiment += (aspects.joy - aspects.sadness) * 0.3;
    sentiment += (aspects.trust - aspects.fear) * 0.2;
    sentiment += (aspects.anticipation - aspects.anger) * 0.1;
    
    return weightSum > 0 ? sentiment / Math.sqrt(weightSum) : 0;
  }
  
  private applyIntensifiers(text: string, baseSentiment: number): number {
    const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'totally', 'completely', 'really', 'so'];
    const diminishers = ['slightly', 'somewhat', 'fairly', 'rather', 'quite', 'pretty', 'kind of', 'sort of'];
    
    let intensifierCount = 0;
    let diminisherCount = 0;
    
    const lowerText = text.toLowerCase();
    intensifiers.forEach(word => {
      if (lowerText.includes(word)) intensifierCount++;
    });
    diminishers.forEach(word => {
      if (lowerText.includes(word)) diminisherCount++;
    });
    
    const intensityMultiplier = 1 + (intensifierCount * 0.3) - (diminisherCount * 0.2);
    return baseSentiment * intensityMultiplier;
  }
  
  private applyNegation(text: string, baseSentiment: number): number {
    const negations = ['not', "n't", 'no', 'never', 'neither', 'nor', 'none', 'nothing', 'nowhere', 'nobody'];
    const lowerText = text.toLowerCase();
    
    let negationCount = 0;
    negations.forEach(neg => {
      const regex = new RegExp(`\\b${neg}\\b`, 'g');
      const matches = lowerText.match(regex);
      if (matches) negationCount += matches.length;
    });
    
    // Odd number of negations flips sentiment
    if (negationCount % 2 === 1) {
      return baseSentiment * -0.8; // Not complete reversal to account for nuance
    }
    
    return baseSentiment;
  }
  
  private applyContextualAnalysis(text: string, words: string[]): number {
    let contextAdjustment = 0;
    
    // Check for sarcasm indicators
    if (text.includes('...') && text.includes('!')) {
      contextAdjustment -= 0.2;
    }
    
    // Check for mixed signals (positive and negative in same text)
    const hasPositive = words.some(w => this.emotionLexicon.get(w)?.weight > 0);
    const hasNegative = words.some(w => this.emotionLexicon.get(w)?.weight < 0);
    
    if (hasPositive && hasNegative) {
      // Mixed emotions reduce confidence and lean slightly negative
      contextAdjustment -= 0.1;
    }
    
    // Check context window for emotional momentum
    if (this.contextWindow.length > 0) {
      const recentSentiments = this.contextWindow.map(ctx => {
        const ctxWords = this.tokenize(ctx);
        return this.calculateWeightedSentiment(ctxWords, this.analyzeEmotionalAspects(ctxWords));
      });
      
      const avgRecent = recentSentiments.reduce((sum, s) => sum + s, 0) / recentSentiments.length;
      // Emotional momentum - current sentiment influenced by recent context
      contextAdjustment += avgRecent * 0.2;
    }
    
    return contextAdjustment;
  }
  
  private calculateMagnitude(text: string, aspects: SentimentResult['aspects']): number {
    // Calculate emotional intensity
    const features = this.analyzeLinguisticFeatures(text);
    
    let magnitude = 0;
    
    // Punctuation intensity
    magnitude += Math.min(features.exclamations * 0.2, 0.4);
    magnitude += Math.min(features.capitals * 0.1, 0.2);
    
    // Emotional diversity (multiple emotions = higher magnitude)
    const activeEmotions = Object.values(aspects).filter(v => v > 0.1).length;
    magnitude += activeEmotions * 0.1;
    
    // Word count (longer expressions often more intense)
    if (features.wordCount > 50) magnitude += 0.2;
    else if (features.wordCount > 20) magnitude += 0.1;
    
    // Peak emotion intensity
    const maxEmotion = Math.max(...Object.values(aspects));
    magnitude += maxEmotion * 0.3;
    
    return Math.min(1, magnitude);
  }
  
  private determineEmotionalState(aspects: SentimentResult['aspects'], sentiment: number): EmotionalState {
    // Find dominant emotion
    const emotions = Object.entries(aspects).sort((a, b) => b[1] - a[1]);
    const dominant = emotions[0];
    const secondary = emotions[1];
    
    // Map to emotional states
    if (sentiment > 0.6) {
      if (dominant[0] === 'joy') return 'joyful';
      if (dominant[0] === 'anticipation') return 'excited';
      if (dominant[0] === 'trust') return 'peaceful';
      return 'hopeful';
    } else if (sentiment > 0.2) {
      if (dominant[0] === 'trust') return 'peaceful';
      if (dominant[0] === 'anticipation') return 'hopeful';
      return 'grateful';
    } else if (sentiment > -0.2) {
      if (dominant[0] === 'anticipation') return 'contemplative';
      return 'neutral';
    } else if (sentiment > -0.6) {
      if (dominant[0] === 'sadness') return 'melancholic';
      if (dominant[0] === 'fear') return 'anxious';
      if (dominant[0] === 'anger') return 'frustrated';
      return 'contemplative';
    } else {
      if (dominant[0] === 'sadness') {
        if (secondary[0] === 'fear') return 'overwhelmed';
        return 'melancholic';
      }
      if (dominant[0] === 'anger') return 'angry';
      if (dominant[0] === 'fear') return 'fearful';
      if (dominant[0] === 'disgust') return 'frustrated';
      return 'numb';
    }
  }
  
  private calculateConfidence(words: string[], aspects: SentimentResult['aspects']): number {
    let confidence = 0.5; // Base confidence
    
    // More emotional words = higher confidence
    const emotionalWords = words.filter(w => this.emotionLexicon.has(w));
    confidence += Math.min(emotionalWords.length * 0.05, 0.3);
    
    // Clear dominant emotion = higher confidence
    const sortedAspects = Object.values(aspects).sort((a, b) => b - a);
    if (sortedAspects[0] > sortedAspects[1] * 2) {
      confidence += 0.2;
    }
    
    return Math.min(1, confidence);
  }
  
  private analyzeTemporalFocus(text: string): 'past' | 'present' | 'future' | undefined {
    const pastMarkers = ['was', 'were', 'had', 'used to', 'remember', 'recalled', 'yesterday', 'before', 'ago'];
    const presentMarkers = ['am', 'is', 'are', 'now', 'today', 'currently', 'presently', 'right now'];
    const futureMarkers = ['will', 'shall', 'going to', 'tomorrow', 'soon', 'later', 'next', 'plan', 'hope'];
    
    const lowerText = text.toLowerCase();
    let pastCount = 0, presentCount = 0, futureCount = 0;
    
    pastMarkers.forEach(marker => {
      if (lowerText.includes(marker)) pastCount++;
    });
    presentMarkers.forEach(marker => {
      if (lowerText.includes(marker)) presentCount++;
    });
    futureMarkers.forEach(marker => {
      if (lowerText.includes(marker)) futureCount++;
    });
    
    if (pastCount > presentCount && pastCount > futureCount) return 'past';
    if (presentCount > pastCount && presentCount > futureCount) return 'present';
    if (futureCount > pastCount && futureCount > presentCount) return 'future';
    
    return undefined;
  }
  
  private analyzeEnergyLevel(text: string, features: any): 'low' | 'medium' | 'high' {
    let energy = 0;
    
    // Exclamations and capitals indicate high energy
    energy += features.exclamations * 0.3;
    energy += features.capitals * 0.2;
    
    // Question marks can indicate uncertainty (lower energy)
    energy -= features.questions * 0.1;
    
    // Word count and complexity
    if (features.wordCount > 30) energy += 0.2;
    if (features.avgWordLength > 6) energy += 0.1;
    
    // Energy words
    const highEnergyWords = ['excited', 'amazing', 'incredible', 'wow', 'fantastic', 'awesome'];
    const lowEnergyWords = ['tired', 'exhausted', 'drained', 'weak', 'slow', 'heavy'];
    
    const lowerText = text.toLowerCase();
    highEnergyWords.forEach(word => {
      if (lowerText.includes(word)) energy += 0.3;
    });
    lowEnergyWords.forEach(word => {
      if (lowerText.includes(word)) energy -= 0.3;
    });
    
    if (energy > 0.5) return 'high';
    if (energy < -0.2) return 'low';
    return 'medium';
  }
  
  private analyzeClarity(text: string, features: any): 'confused' | 'uncertain' | 'clear' | 'crystalline' {
    let clarity = 0;
    
    // Questions and ellipses suggest uncertainty
    clarity -= features.questions * 0.2;
    clarity -= features.ellipses * 0.3;
    
    // Clarity markers
    const clarityWords = ['clear', 'understand', 'realize', 'know', 'certain', 'sure', 'definite'];
    const confusionWords = ['confused', 'uncertain', 'maybe', 'perhaps', 'possibly', "don't know", 'unsure'];
    
    const lowerText = text.toLowerCase();
    clarityWords.forEach(word => {
      if (lowerText.includes(word)) clarity += 0.3;
    });
    confusionWords.forEach(word => {
      if (lowerText.includes(word)) clarity -= 0.3;
    });
    
    // Sentence structure (shorter, clearer sentences = higher clarity)
    if (features.avgWordLength < 5 && features.wordCount < 20) clarity += 0.2;
    
    if (clarity > 0.5) return 'crystalline';
    if (clarity > 0) return 'clear';
    if (clarity > -0.5) return 'uncertain';
    return 'confused';
  }
  
  private updateConversationHistory(result: SentimentResult) {
    // Add to journey
    this.conversationHistory.emotionalJourney.push({
      timestamp: new Date(),
      sentiment: result
    });
    
    // Keep only last 50 entries
    if (this.conversationHistory.emotionalJourney.length > 50) {
      this.conversationHistory.emotionalJourney.shift();
    }
    
    // Calculate overall sentiment (weighted average, recent entries weighted more)
    const weights = this.conversationHistory.emotionalJourney.map((_, i) => 
      Math.pow(1.1, i / this.conversationHistory.emotionalJourney.length)
    );
    const weightedSum = this.conversationHistory.emotionalJourney.reduce((sum, entry, i) => 
      sum + entry.sentiment.score * weights[i], 0
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    this.conversationHistory.overall = weightedSum / totalWeight;
    
    // Determine trend
    if (this.conversationHistory.emotionalJourney.length >= 3) {
      const recent = this.conversationHistory.emotionalJourney.slice(-3);
      const recentAvg = recent.reduce((sum, e) => sum + e.sentiment.score, 0) / 3;
      const older = this.conversationHistory.emotionalJourney.slice(-6, -3);
      
      if (older.length === 3) {
        const olderAvg = older.reduce((sum, e) => sum + e.sentiment.score, 0) / 3;
        
        if (recentAvg > olderAvg + 0.2) this.conversationHistory.trend = 'improving';
        else if (recentAvg < olderAvg - 0.2) this.conversationHistory.trend = 'declining';
        else this.conversationHistory.trend = 'stable';
      }
    }
    
    // Calculate volatility (standard deviation of recent sentiments)
    if (this.conversationHistory.emotionalJourney.length >= 5) {
      const recent = this.conversationHistory.emotionalJourney.slice(-5);
      const mean = recent.reduce((sum, e) => sum + e.sentiment.score, 0) / 5;
      const variance = recent.reduce((sum, e) => 
        sum + Math.pow(e.sentiment.score - mean, 2), 0
      ) / 5;
      this.conversationHistory.volatility = Math.sqrt(variance);
    }
    
    // Update dominant emotion
    const emotionCounts = new Map<EmotionalState, number>();
    this.conversationHistory.emotionalJourney.slice(-10).forEach(entry => {
      const count = emotionCounts.get(entry.sentiment.emotion) || 0;
      emotionCounts.set(entry.sentiment.emotion, count + 1);
    });
    
    let maxCount = 0;
    let dominantEmotion: EmotionalState = 'neutral';
    emotionCounts.forEach((count, emotion) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });
    this.conversationHistory.dominantEmotion = dominantEmotion;
  }
  
  getConversationSentiment(): ConversationSentiment {
    return this.conversationHistory;
  }
  
  // Get sentiment insights for oracle responses
  getSentimentInsights(): {
    needsSupport: boolean;
    suggestedTone: 'uplifting' | 'grounding' | 'exploring' | 'challenging';
    emotionalNeeds: string[];
    responseGuidance: string;
  } {
    const current = this.conversationHistory;
    
    // Determine if user needs support
    const needsSupport = current.overall < -0.3 || 
                         current.volatility > 0.7 ||
                         current.trend === 'declining';
    
    // Suggest appropriate tone
    let suggestedTone: 'uplifting' | 'grounding' | 'exploring' | 'challenging';
    if (current.overall < -0.5) {
      suggestedTone = 'uplifting';
    } else if (current.volatility > 0.6) {
      suggestedTone = 'grounding';
    } else if (current.overall > 0.3 && current.trend === 'improving') {
      suggestedTone = 'exploring';
    } else {
      suggestedTone = 'challenging';
    }
    
    // Identify emotional needs
    const emotionalNeeds: string[] = [];
    if (current.dominantEmotion === 'anxious' || current.dominantEmotion === 'fearful') {
      emotionalNeeds.push('safety', 'reassurance', 'grounding');
    }
    if (current.dominantEmotion === 'melancholic' || current.dominantEmotion === 'numb') {
      emotionalNeeds.push('validation', 'hope', 'gentle activation');
    }
    if (current.dominantEmotion === 'angry' || current.dominantEmotion === 'frustrated') {
      emotionalNeeds.push('understanding', 'space', 'constructive outlet');
    }
    if (current.dominantEmotion === 'overwhelmed') {
      emotionalNeeds.push('simplification', 'prioritization', 'breath');
    }
    
    // Generate response guidance
    let responseGuidance = '';
    if (needsSupport) {
      responseGuidance = 'User is in a vulnerable state. Respond with extra compassion and validation. ';
    }
    
    if (current.volatility > 0.7) {
      responseGuidance += 'Emotional volatility detected. Help stabilize through grounding exercises. ';
    }
    
    if (current.trend === 'improving') {
      responseGuidance += 'Positive momentum building. Acknowledge and reinforce progress. ';
    } else if (current.trend === 'declining') {
      responseGuidance += 'Emotional decline detected. Check in about immediate needs and offer support. ';
    }
    
    return {
      needsSupport,
      suggestedTone,
      emotionalNeeds,
      responseGuidance: responseGuidance || 'Maintain balanced, supportive presence.'
    };
  }
  
  // Analyze sentiment trajectory for breakthrough detection
  detectEmotionalBreakthrough(): {
    detected: boolean;
    type?: 'release' | 'insight' | 'shift' | 'integration';
    description?: string;
  } {
    if (this.conversationHistory.emotionalJourney.length < 5) {
      return { detected: false };
    }
    
    const recent = this.conversationHistory.emotionalJourney.slice(-5);
    const earlier = this.conversationHistory.emotionalJourney.slice(-10, -5);
    
    if (earlier.length < 3) {
      return { detected: false };
    }
    
    const recentAvg = recent.reduce((sum, e) => sum + e.sentiment.score, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, e) => sum + e.sentiment.score, 0) / earlier.length;
    
    // Detect major positive shift
    if (recentAvg > earlierAvg + 0.5) {
      return {
        detected: true,
        type: 'shift',
        description: 'Major positive emotional shift detected'
      };
    }
    
    // Detect emotional release (high volatility followed by calm)
    const recentVolatility = this.calculateLocalVolatility(recent);
    const earlierVolatility = this.calculateLocalVolatility(earlier);
    
    if (earlierVolatility > 0.7 && recentVolatility < 0.3) {
      return {
        detected: true,
        type: 'release',
        description: 'Emotional release and stabilization detected'
      };
    }
    
    // Detect insight (confusion to clarity)
    const recentClarity = recent.filter(e => e.sentiment.clarity === 'clear' || e.sentiment.clarity === 'crystalline').length;
    const earlierClarity = earlier.filter(e => e.sentiment.clarity === 'clear' || e.sentiment.clarity === 'crystalline').length;
    
    if (recentClarity >= 3 && earlierClarity <= 1) {
      return {
        detected: true,
        type: 'insight',
        description: 'Clarity breakthrough detected'
      };
    }
    
    // Detect integration (multiple emotions in balance)
    const recentEmotions = new Set(recent.map(e => e.sentiment.emotion));
    if (recentEmotions.size >= 3 && Math.abs(recentAvg) < 0.2 && recentVolatility < 0.4) {
      return {
        detected: true,
        type: 'integration',
        description: 'Emotional integration and balance achieved'
      };
    }
    
    return { detected: false };
  }
  
  private calculateLocalVolatility(entries: any[]): number {
    if (entries.length < 2) return 0;
    
    const scores = entries.map(e => e.sentiment.score);
    const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length;
    
    return Math.sqrt(variance);
  }
  
  // Save sentiment history to database
  async saveSentimentHistory(userId: string) {
    if (!supabase) {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`sentiment-history-${userId}`, JSON.stringify(this.conversationHistory));
      }
      return;
    }
    
    try {
      await supabase
        .from('sentiment_history')
        .upsert({
          user_id: userId,
          conversation_sentiment: this.conversationHistory,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving sentiment history:', error);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`sentiment-history-${userId}`, JSON.stringify(this.conversationHistory));
      }
    }
  }
  
  // Load sentiment history from database
  static async loadHistory(userId: string): Promise<SentimentAnalyzer> {
    const analyzer = new SentimentAnalyzer();
    
    if (supabase) {
      try {
        const { data } = await supabase
          .from('sentiment_history')
          .select('conversation_sentiment')
          .eq('user_id', userId)
          .single();
        
        if (data?.conversation_sentiment) {
          analyzer.conversationHistory = data.conversation_sentiment;
          return analyzer;
        }
      } catch (error) {
        console.error('Error loading sentiment history:', error);
      }
    }
    
    // Check localStorage (only in browser)
    const saved = (typeof window !== 'undefined' && window.localStorage)
      ? localStorage.getItem(`sentiment-history-${userId}`)
      : null;
    if (saved) {
      analyzer.conversationHistory = JSON.parse(saved);
    }
    
    return analyzer;
  }
}