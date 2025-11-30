/**
 * WellbeingMonitor - Invisible Safety Net
 * 
 * Tracks concerning patterns without explicit warnings.
 * When thresholds exceeded, shifts responses toward grounding
 * rather than triggering alarms.
 * 
 * Core principle: Implicit safety through design, not explicit warnings.
 */

export interface WellbeingIndicators {
  sleepMentions: { count: number; lastMention: Date; hoursReported: number[] };
  grandiosity: { count: number; lastDetected: Date; severity: number };
  paranoidThemes: { count: number; lastDetected: Date; severity: number };
  dissociation: { count: number; lastDetected: Date; severity: number };
  meaningVelocity: { insightsPerHour: number; lastCalculated: Date };
  isolation: { noMentionOfOthers: number; lastSocialMention: Date };
  basicNeeds: { lastFoodMention: Date; lastSelfCareMention: Date };
}

export interface GroundingShift {
  shiftActivated: boolean;
  shiftLevel: 'mild' | 'moderate' | 'strong';
  recommendedContent: string[];
  footerMessage?: string;
  toneAdjustments: {
    reduceAbstract: boolean;
    increasePractical: boolean;
    addOrdinaryLife: boolean;
    emphasizeBasicNeeds: boolean;
  };
}

export class WellbeingMonitorService {
  private static instance: WellbeingMonitorService;
  private userIndicators: Map<string, WellbeingIndicators> = new Map();
  
  // Thresholds for concern (tunable based on real usage)
  private readonly thresholds = {
    sleepHours: 4,
    sleepDaysOfConcern: 2,
    grandiositySeverity: 0.7,
    paranoidSeverity: 0.6,
    dissociationSeverity: 0.7,
    maxInsightsPerHour: 5,
    isolationDays: 3,
    basicNeedsDays: 2
  };
  
  // Grounding content suggestions
  private readonly groundingContent = {
    mild: [
      "Taking a short walk can help insights settle",
      "Sometimes the most profound truth is in a warm cup of tea",
      "The mystics knew: enlightenment, then laundry",
      "Wisdom often comes through simple acts of daily care"
    ],
    moderate: [
      "Deep insights are like seeds - they need time in darkness before sprouting",
      "Integration is slower than revelation - this is natural and necessary",
      "Even profound experiences benefit from ordinary anchors",
      "Your body might have wisdom about pacing that deserves attention"
    ],
    strong: [
      "Sometimes the wisest action is the most mundane one available",
      "Grounding in simple routines often clarifies complex experiences",
      "The body knows things the mind hasn't figured out yet",
      "Taking care of basics creates space for integration"
    ]
  };
  
  static getInstance(): WellbeingMonitorService {
    if (!WellbeingMonitorService.instance) {
      WellbeingMonitorService.instance = new WellbeingMonitorService();
    }
    return WellbeingMonitorService.instance;
  }
  
  /**
   * Process user input for wellbeing indicators (silent tracking)
   */
  async trackIndicators(userId: string, userInput: string, sessionContext?: any): Promise<void> {
    let indicators = this.userIndicators.get(userId) || this.initializeIndicators();
    
    // Track sleep mentions
    indicators = await this.trackSleepMentions(indicators, userInput);
    
    // Track grandiosity markers
    indicators = await this.trackGrandiosity(indicators, userInput);
    
    // Track paranoid themes
    indicators = await this.trackParanoidThemes(indicators, userInput);
    
    // Track dissociation indicators
    indicators = await this.trackDissociation(indicators, userInput);
    
    // Track meaning-making velocity
    indicators = await this.trackMeaningVelocity(indicators, userInput, sessionContext);
    
    // Track isolation indicators
    indicators = await this.trackIsolation(indicators, userInput);
    
    // Track basic needs mentions
    indicators = await this.trackBasicNeeds(indicators, userInput);
    
    this.userIndicators.set(userId, indicators);
  }
  
  /**
   * Determine if grounding shift should be activated and how strong
   */
  async assessGroundingNeed(userId: string): Promise<GroundingShift> {
    const indicators = this.userIndicators.get(userId);
    if (!indicators) {
      return this.noShiftNeeded();
    }
    
    let concernLevel = 0;
    const concerns: string[] = [];
    
    // Assess sleep concerns
    if (this.sleepConcernDetected(indicators)) {
      concernLevel += 2;
      concerns.push('sleep');
    }
    
    // Assess grandiosity
    if (indicators.grandiosity.severity > this.thresholds.grandiositySeverity) {
      concernLevel += 3;
      concerns.push('grandiosity');
    }
    
    // Assess paranoid themes
    if (indicators.paranoidThemes.severity > this.thresholds.paranoidSeverity) {
      concernLevel += 3;
      concerns.push('paranoia');
    }
    
    // Assess dissociation
    if (indicators.dissociation.severity > this.thresholds.dissociationSeverity) {
      concernLevel += 2;
      concerns.push('dissociation');
    }
    
    // Assess meaning velocity
    if (indicators.meaningVelocity.insightsPerHour > this.thresholds.maxInsightsPerHour) {
      concernLevel += 2;
      concerns.push('velocity');
    }
    
    // Assess isolation
    if (this.isolationConcernDetected(indicators)) {
      concernLevel += 1;
      concerns.push('isolation');
    }
    
    // Assess basic needs neglect
    if (this.basicNeedsConcernDetected(indicators)) {
      concernLevel += 1;
      concerns.push('basicNeeds');
    }
    
    return this.generateGroundingShift(concernLevel, concerns);
  }
  
  /**
   * Get appropriate grounding content based on concern level
   */
  getGroundingContent(shiftLevel: 'mild' | 'moderate' | 'strong'): string[] {
    return this.groundingContent[shiftLevel];
  }
  
  /**
   * Check if user needs gentle check-in footer
   */
  shouldShowCheckInFooter(userId: string): string | null {
    const indicators = this.userIndicators.get(userId);
    if (!indicators) return null;
    
    const now = new Date();
    const hoursSinceFood = indicators.basicNeeds.lastFoodMention ? 
      (now.getTime() - indicators.basicNeeds.lastFoodMention.getTime()) / (1000 * 60 * 60) : 999;
    
    const hoursSinceSelfCare = indicators.basicNeeds.lastSelfCareMention ?
      (now.getTime() - indicators.basicNeeds.lastSelfCareMention.getTime()) / (1000 * 60 * 60) : 999;
    
    if (hoursSinceFood > 8 || hoursSinceSelfCare > 12) {
      return "Quick check: When did you last eat something nourishing? Sometimes wisdom comes through the simple acts of daily care.";
    }
    
    if (this.sleepConcernDetected(indicators) || indicators.meaningVelocity.insightsPerHour > 3) {
      return "Gentle reminder: Integration often happens best when we're well-rested and grounded in routine.";
    }
    
    return null;
  }
  
  // Private tracking methods
  
  private initializeIndicators(): WellbeingIndicators {
    return {
      sleepMentions: { count: 0, lastMention: new Date(), hoursReported: [] },
      grandiosity: { count: 0, lastDetected: new Date(0), severity: 0 },
      paranoidThemes: { count: 0, lastDetected: new Date(0), severity: 0 },
      dissociation: { count: 0, lastDetected: new Date(0), severity: 0 },
      meaningVelocity: { insightsPerHour: 0, lastCalculated: new Date() },
      isolation: { noMentionOfOthers: 0, lastSocialMention: new Date() },
      basicNeeds: { lastFoodMention: new Date(), lastSelfCareMention: new Date() }
    };
  }
  
  private async trackSleepMentions(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const sleepKeywords = ['sleep', 'slept', 'tired', 'exhausted', 'insomnia', 'awake', 'rest'];
    const hoursPattern = /(\d+)\s*hour/gi;
    
    if (sleepKeywords.some(keyword => input.toLowerCase().includes(keyword))) {
      indicators.sleepMentions.count++;
      indicators.sleepMentions.lastMention = new Date();
      
      // Extract hours if mentioned
      const hoursMatches = input.match(hoursPattern);
      if (hoursMatches) {
        const hours = hoursMatches.map(match => parseInt(match.match(/\d+/)?.[0] || '8'));
        indicators.sleepMentions.hoursReported.push(...hours);
      }
    }
    
    return indicators;
  }
  
  private async trackGrandiosity(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const grandioseMarkers = [
      'chosen', 'special mission', 'unique understanding', 'only I can',
      'destined', 'meant to', 'called to save', 'enlightened', 'awakened'
    ];
    
    let severity = 0;
    let count = 0;
    
    grandioseMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        count++;
        severity += 0.3;
      }
    });
    
    if (count > 0) {
      indicators.grandiosity.count += count;
      indicators.grandiosity.lastDetected = new Date();
      indicators.grandiosity.severity = Math.min(1.0, indicators.grandiosity.severity + severity);
    }
    
    return indicators;
  }
  
  private async trackParanoidThemes(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const paranoidMarkers = [
      'being watched', 'testing me', 'they know', 'conspiracy',
      'targeted', 'following', 'monitoring', 'surveillance'
    ];
    
    let severity = 0;
    let count = 0;
    
    paranoidMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        count++;
        severity += 0.4;
      }
    });
    
    if (count > 0) {
      indicators.paranoidThemes.count += count;
      indicators.paranoidThemes.lastDetected = new Date();
      indicators.paranoidThemes.severity = Math.min(1.0, indicators.paranoidThemes.severity + severity);
    }
    
    return indicators;
  }
  
  private async trackDissociation(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const dissociationMarkers = [
      'unreal', 'floating', 'watching myself', 'detached', 'numb',
      'not in my body', 'dreamlike', 'foggy', 'disconnected'
    ];
    
    let severity = 0;
    let count = 0;
    
    dissociationMarkers.forEach(marker => {
      if (input.toLowerCase().includes(marker)) {
        count++;
        severity += 0.3;
      }
    });
    
    if (count > 0) {
      indicators.dissociation.count += count;
      indicators.dissociation.lastDetected = new Date();
      indicators.dissociation.severity = Math.min(1.0, indicators.dissociation.severity + severity);
    }
    
    return indicators;
  }
  
  private async trackMeaningVelocity(indicators: WellbeingIndicators, input: string, context?: any): Promise<WellbeingIndicators> {
    const insightMarkers = [
      'realize', 'understand', 'insight', 'revelation', 'clarity',
      'breakthrough', 'epiphany', 'profound', 'deep truth'
    ];
    
    const insightCount = insightMarkers.filter(marker => 
      input.toLowerCase().includes(marker)
    ).length;
    
    if (insightCount > 0) {
      const now = new Date();
      const hoursSinceLastCalc = (now.getTime() - indicators.meaningVelocity.lastCalculated.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLastCalc < 1) {
        indicators.meaningVelocity.insightsPerHour += insightCount;
      } else {
        indicators.meaningVelocity.insightsPerHour = insightCount / (hoursSinceLastCalc || 1);
        indicators.meaningVelocity.lastCalculated = now;
      }
    }
    
    return indicators;
  }
  
  private async trackIsolation(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const socialMarkers = [
      'friend', 'family', 'partner', 'colleague', 'talked to',
      'conversation', 'others', 'people', 'community'
    ];
    
    const hasSocialMention = socialMarkers.some(marker => 
      input.toLowerCase().includes(marker)
    );
    
    if (hasSocialMention) {
      indicators.isolation.lastSocialMention = new Date();
      indicators.isolation.noMentionOfOthers = 0;
    } else {
      indicators.isolation.noMentionOfOthers++;
    }
    
    return indicators;
  }
  
  private async trackBasicNeeds(indicators: WellbeingIndicators, input: string): Promise<WellbeingIndicators> {
    const foodMarkers = ['eat', 'food', 'meal', 'hungry', 'nutrition', 'cook'];
    const selfCareMarkers = ['shower', 'bath', 'clean', 'exercise', 'walk', 'self-care'];
    
    if (foodMarkers.some(marker => input.toLowerCase().includes(marker))) {
      indicators.basicNeeds.lastFoodMention = new Date();
    }
    
    if (selfCareMarkers.some(marker => input.toLowerCase().includes(marker))) {
      indicators.basicNeeds.lastSelfCareMention = new Date();
    }
    
    return indicators;
  }
  
  // Assessment helper methods
  
  private sleepConcernDetected(indicators: WellbeingIndicators): boolean {
    const recentHours = indicators.sleepMentions.hoursReported.slice(-3);
    const lowSleepDays = recentHours.filter(hours => hours < this.thresholds.sleepHours).length;
    return lowSleepDays >= this.thresholds.sleepDaysOfConcern;
  }
  
  private isolationConcernDetected(indicators: WellbeingIndicators): boolean {
    const daysSinceSocial = (new Date().getTime() - indicators.isolation.lastSocialMention.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceSocial > this.thresholds.isolationDays;
  }
  
  private basicNeedsConcernDetected(indicators: WellbeingIndicators): boolean {
    const daysSinceFood = (new Date().getTime() - indicators.basicNeeds.lastFoodMention.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceSelfCare = (new Date().getTime() - indicators.basicNeeds.lastSelfCareMention.getTime()) / (1000 * 60 * 60 * 24);
    
    return daysSinceFood > this.thresholds.basicNeedsDays || 
           daysSinceSelfCare > this.thresholds.basicNeedsDays;
  }
  
  private noShiftNeeded(): GroundingShift {
    return {
      shiftActivated: false,
      shiftLevel: 'mild',
      recommendedContent: [],
      toneAdjustments: {
        reduceAbstract: false,
        increasePractical: false,
        addOrdinaryLife: false,
        emphasizeBasicNeeds: false
      }
    };
  }
  
  private generateGroundingShift(concernLevel: number, concerns: string[]): GroundingShift {
    if (concernLevel === 0) {
      return this.noShiftNeeded();
    }
    
    const shiftLevel: 'mild' | 'moderate' | 'strong' = 
      concernLevel >= 5 ? 'strong' :
      concernLevel >= 3 ? 'moderate' : 'mild';
    
    const toneAdjustments = {
      reduceAbstract: concernLevel >= 2,
      increasePractical: true,
      addOrdinaryLife: concernLevel >= 3,
      emphasizeBasicNeeds: concerns.includes('basicNeeds') || concerns.includes('sleep')
    };
    
    return {
      shiftActivated: true,
      shiftLevel,
      recommendedContent: this.groundingContent[shiftLevel],
      footerMessage: this.shouldShowCheckInFooter('current') || undefined,
      toneAdjustments
    };
  }
}