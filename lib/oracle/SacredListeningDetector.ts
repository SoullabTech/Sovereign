/**
 * Sacred Listening Detector
 * Identifies deeper patterns and cues in user input that require sacred attention
 */

interface SacredCue {
  type: 'transition' | 'shadow' | 'longing' | 'emergence' | 'resistance' | 'celebration' | 'questioning' | 'sharing' | 'interest';
  confidence: number;
  depth: 'surface' | 'midwater' | 'deep';
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  suggestedResponse: 'witness' | 'reflect' | 'question' | 'hold' | 'celebrate' | 'explore' | 'follow_thread';
  topic?: string; // What they're interested in talking about
}

interface ListeningContext {
  previousMessages: string[];
  emotionalTrend: 'rising' | 'falling' | 'stable' | 'oscillating';
  engagementLevel: number; // 0-1
  timeInConversation: number; // minutes
}

export class SacredListeningDetector {

  /**
   * Detect sacred cues in user input
   */
  detectCues(input: string, context?: ListeningContext): SacredCue[] {
    const cues: SacredCue[] = [];
    const lower = input.toLowerCase();

    // PRIORITY 1: SHARING/INTEREST - User mentioning something they want to talk about
    const interestTopic = this.detectInterest(input);
    if (interestTopic) {
      cues.push({
        type: 'interest',
        confidence: 0.95,
        depth: 'surface',
        element: 'air',
        suggestedResponse: 'follow_thread',
        topic: interestTopic
      });
    }

    // 2. SHARING PATTERNS - User is sharing something meaningful
    if (this.detectSharing(lower)) {
      cues.push({
        type: 'sharing',
        confidence: 0.9,
        depth: 'midwater',
        element: 'water',
        suggestedResponse: 'explore',
        topic: this.extractTopic(input)
      });
    }

    // 3. TRANSITION PATTERNS - User is between states
    if (this.detectTransition(lower)) {
      cues.push({
        type: 'transition',
        confidence: 0.8,
        depth: 'midwater',
        element: 'water',
        suggestedResponse: 'hold'
      });
    }

    // 2. SHADOW WORK - Unconscious material surfacing
    if (this.detectShadow(lower)) {
      cues.push({
        type: 'shadow',
        confidence: 0.7,
        depth: 'deep',
        element: 'aether',
        suggestedResponse: 'witness'
      });
    }

    // 3. LONGING - Deep desires and needs
    if (this.detectLonging(lower)) {
      cues.push({
        type: 'longing',
        confidence: 0.75,
        depth: 'deep',
        element: 'fire',
        suggestedResponse: 'explore'
      });
    }

    // 4. EMERGENCE - Something new trying to be born
    if (this.detectEmergence(lower)) {
      cues.push({
        type: 'emergence',
        confidence: 0.85,
        depth: 'midwater',
        element: 'air',
        suggestedResponse: 'celebrate'
      });
    }

    // 5. RESISTANCE - Stuck patterns or defenses
    if (this.detectResistance(lower)) {
      cues.push({
        type: 'resistance',
        confidence: 0.7,
        depth: 'surface',
        element: 'earth',
        suggestedResponse: 'reflect'
      });
    }

    // 6. DEEP QUESTIONING - Existential inquiry
    if (this.detectQuestioning(lower)) {
      cues.push({
        type: 'questioning',
        confidence: 0.8,
        depth: 'deep',
        element: 'air',
        suggestedResponse: 'question'
      });
    }

    // 7. CELEBRATION - Joy that needs witnessing
    if (this.detectCelebration(lower)) {
      cues.push({
        type: 'celebration',
        confidence: 0.9,
        depth: 'surface',
        element: 'fire',
        suggestedResponse: 'celebrate'
      });
    }

    return cues;
  }

  private detectTransition(text: string): boolean {
    const patterns = [
      /between|neither|both|changing|shifting|transforming/,
      /used to be|not anymore|becoming|turning into/,
      /don't know who i am|lost myself|finding myself/,
      /everything.*different|nothing.*same/,
      /threshold|crossroads|edge/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectShadow(text: string): boolean {
    const patterns = [
      /part of me|side of me|voice in my head/,
      /hate.*about myself|ashamed|guilty/,
      /keep doing|can't stop|pattern/,
      /triggered|reactive|defensive/,
      /dark|shadow|hidden/,
      /pretend|facade|mask/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectLonging(text: string): boolean {
    const patterns = [
      /wish|hope|dream|yearn|long for/,
      /if only|someday|imagine if/,
      /missing|miss|nostalgic/,
      /want.*but|need.*but/,
      /craving|hungry for|thirsty for/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectEmergence(text: string): boolean {
    const patterns = [
      /realizing|discovering|noticing|seeing/,
      /for the first time|never.*before|new/,
      /opening|expanding|growing/,
      /breakthrough|insight|revelation/,
      /something.*clicking|makes sense now/,
      /awakening|waking up/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectResistance(text: string): boolean {
    const patterns = [
      /but|however|although|except/,
      /can't|won't|shouldn't|mustn't/,
      /stuck|blocked|trapped|frozen/,
      /same.*problem|keeps happening|never changes/,
      /trying.*but|want.*but can't/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectQuestioning(text: string): boolean {
    const patterns = [
      /why.*i|what.*purpose|meaning/,
      /who am i|what am i doing|where.*going/,
      /point of|reason for|worth it/,
      /supposed to|should i|right thing/,
      /matter|difference|impact/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectCelebration(text: string): boolean {
    const patterns = [
      /amazing|wonderful|incredible|fantastic/,
      /breakthrough|victory|succeeded|accomplished/,
      /proud|happy|joyful|elated/,
      /finally|at last|made it/,
      /grateful|thankful|blessed/
    ];
    return patterns.some(p => p.test(text));
  }

  private detectInterest(text: string): string | null {
    // Detect when someone mentions something they're doing/working on/interested in
    const patterns = [
      /my (\w+) (?:is|are) (\w+ing)/gi,  // "my work is progressing"
      /working on (\w+)/gi,
      /been (\w+ing)/gi,
      /started (\w+)/gi,
      /my (\w+)/gi,  // "my project", "my day", "my job"
      /doing (\w+)/gi,
      /learning (\w+)/gi,
      /exploring (\w+)/gi,
      /thinking about (\w+)/gi,
      /interested in (\w+)/gi
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(text);
      if (match) {
        // Extract the topic they mentioned
        return match[1] || 'that';
      }
    }

    // Also check for specific topics mentioned
    if (/work|job|project|business/.test(text.toLowerCase())) return 'work';
    if (/family|kids|children|partner|spouse/.test(text.toLowerCase())) return 'family';
    if (/health|exercise|fitness|wellness/.test(text.toLowerCase())) return 'health';
    if (/creative|art|music|writing/.test(text.toLowerCase())) return 'creativity';
    if (/study|school|learning|education/.test(text.toLowerCase())) return 'learning';

    return null;
  }

  private detectSharing(text: string): boolean {
    const patterns = [
      /i (?:just|recently|today|yesterday)/,
      /been (?:thinking|working|doing)/,
      /my \w+ (?:is|are|was|were)/,
      /feeling \w+ about/,
      /excited about|happy about|worried about/,
      /love it|loving|enjoying/
    ];
    return patterns.some(p => p.test(text));
  }

  private extractTopic(text: string): string {
    // Try to extract what they're talking about
    const words = text.split(/\s+/);
    const importantWords = ['work', 'project', 'family', 'health', 'day', 'life', 'relationship', 'job', 'goal', 'dream', 'plan'];

    for (const word of importantWords) {
      if (text.toLowerCase().includes(word)) {
        return word;
      }
    }

    // Look for "my X" patterns
    const myPattern = /my (\w+)/i;
    const match = myPattern.exec(text);
    if (match) {
      return match[1];
    }

    return 'that';
  }

  /**
   * Generate a response strategy based on detected cues
   */
  generateStrategy(cues: SacredCue[]): {
    primaryApproach: string;
    depth: 'surface' | 'midwater' | 'deep';
    responseType: string;
    avoidPatterns: string[];
  } {
    if (cues.length === 0) {
      return {
        primaryApproach: 'gentle_presence',
        depth: 'surface',
        responseType: 'witness',
        avoidPatterns: ['advice', 'analysis', 'fixing']
      };
    }

    // Find the strongest cue
    const primaryCue = cues.reduce((a, b) =>
      a.confidence > b.confidence ? a : b
    );

    // Map cue to approach
    const approaches: Record<string, any> = {
      interest: {
        primaryApproach: 'follow_interest',
        avoidPatterns: ['ignoring', 'redirecting', 'minimizing'],
        useTopic: true
      },
      sharing: {
        primaryApproach: 'explore_together',
        avoidPatterns: ['dismissing', 'advice_giving', 'topic_switching'],
        useTopic: true
      },
      transition: {
        primaryApproach: 'hold_liminal_space',
        avoidPatterns: ['rushing', 'solving', 'defining']
      },
      shadow: {
        primaryApproach: 'compassionate_mirroring',
        avoidPatterns: ['judgment', 'fixing', 'exposing']
      },
      longing: {
        primaryApproach: 'honor_desire',
        avoidPatterns: ['dismissing', 'practical_advice', 'reality_checking']
      },
      emergence: {
        primaryApproach: 'celebrate_becoming',
        avoidPatterns: ['questioning', 'doubting', 'warning']
      },
      resistance: {
        primaryApproach: 'gentle_curiosity',
        avoidPatterns: ['pushing', 'confronting', 'analyzing']
      },
      questioning: {
        primaryApproach: 'sit_with_mystery',
        avoidPatterns: ['answering', 'explaining', 'certainty']
      },
      celebration: {
        primaryApproach: 'amplify_joy',
        avoidPatterns: ['minimizing', 'cautioning', 'shifting_focus']
      }
    };

    const approach = approaches[primaryCue.type];

    return {
      primaryApproach: approach.primaryApproach,
      depth: primaryCue.depth,
      responseType: primaryCue.suggestedResponse,
      avoidPatterns: approach.avoidPatterns
    };
  }
}

export const sacredListening = new SacredListeningDetector();