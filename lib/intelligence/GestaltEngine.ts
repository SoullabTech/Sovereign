/**
 * GESTALT ENGINE (Fritz Perls)
 *
 * Tracks contact boundary disturbances and awareness interruptions
 *
 * Core Concepts:
 * - Contact Boundary Disturbances (5 ways we interrupt authentic contact)
 *   • Confluence (merged boundaries)
 *   • Introjection (swallowed beliefs)
 *   • Projection (disowned parts on others)
 *   • Retroflection (action turned inward)
 *   • Deflection (avoiding contact)
 * - Contact Cycle (sensation → awareness → energy → action → contact → withdrawal)
 * - Figure/Ground (what stands out vs background)
 * - Here-and-now awareness
 * - Organismic self-regulation
 */

export interface GestaltState {
  detected: boolean;

  // Contact boundary disturbances
  contactDisturbances: {
    confluence: {
      detected: boolean;
      confidence: number;
      indicators: string[];
    };
    introjection: {
      detected: boolean;
      confidence: number;
      indicators: string[];
    };
    projection: {
      detected: boolean;
      confidence: number;
      indicators: string[];
    };
    retroflection: {
      detected: boolean;
      confidence: number;
      indicators: string[];
    };
    deflection: {
      detected: boolean;
      confidence: number;
      indicators: string[];
    };
  };

  // Contact cycle position
  contactCycle: {
    phase: 'sensation' | 'awareness' | 'mobilization' | 'action' | 'contact' | 'withdrawal' | 'assimilation' | 'stuck';
    stuck: boolean;
    stuckAt?: string;
  };

  // Awareness quality
  awareness: {
    hereAndNow: number; // 0-1 (present moment vs past/future)
    figureClarity: number; // 0-1 (what's important is clear)
    contactQuality: number; // 0-1 (can fully engage)
  };
}

export class GestaltEngine {

  /**
   * Extract Gestalt state from text
   */
  extract(text: string): GestaltState {
    const lower = text.toLowerCase();

    // Detect contact boundary disturbances
    const contactDisturbances = this.detectContactDisturbances(lower);

    // Detect contact cycle position
    const contactCycle = this.detectContactCycle(lower);

    // Assess awareness quality
    const awareness = this.assessAwareness(lower);

    // Detected if any disturbance found
    const detected = Object.values(contactDisturbances).some(d => d.detected);

    return {
      detected,
      contactDisturbances,
      contactCycle,
      awareness
    };
  }

  /**
   * Detect the 5 contact boundary disturbances
   */
  private detectContactDisturbances(text: string) {
    return {
      confluence: this.detectConfluence(text),
      introjection: this.detectIntrojection(text),
      projection: this.detectProjection(text),
      retroflection: this.detectRetroflection(text),
      deflection: this.detectDeflection(text)
    };
  }

  /**
   * CONFLUENCE: Merged boundaries, can't tell where I end and you begin
   */
  private detectConfluence(text: string) {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    const confluencePatterns = [
      /we (always|never|should|must|feel|think)/i,
      /everyone (feels|thinks|knows|agrees)/i,
      /(can't|don't) (tell|know) where (i|you) (end|begin)/i,
      /lose myself (in|with|for)/i,
      /merge|fuse|blend|disappear into/i,
      /no boundaries|boundaries gone/i,
      /become (one|them|it)/i
    ];

    for (const pattern of confluencePatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.7);
        indicators.push('confluence-language');
        break;
      }
    }

    // Loss of "I" language
    const iStatements = (text.match(/\bi\b/gi) || []).length;
    const weStatements = (text.match(/\bwe\b/gi) || []).length;
    if (weStatements > iStatements * 2 && weStatements > 3) {
      detected = true;
      confidence = Math.max(confidence, 0.6);
      indicators.push('excessive-we-language');
    }

    return { detected, confidence, indicators };
  }

  /**
   * INTROJECTION: Swallowed beliefs whole, unquestioned "shoulds"
   */
  private detectIntrojection(text: string) {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    const introjectionPatterns = [
      /\b(i|we) (should|must|have to|need to|supposed to|ought to)\b/i,
      /(good|real) (people|men|women|mothers|fathers) (don't|never|always)/i,
      /my (parents|mother|father|family) (always said|told me|taught me)/i,
      /(everyone|people) (say|think|believe|know) that/i,
      /been told (that|to)|taught (that|to)|learned (that|to)/i,
      /\b(rule|norm|expectation) (is|was|says)\b/i
    ];

    for (const pattern of introjectionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.7);
        indicators.push('introjection-language');
        break;
      }
    }

    // Count "should" statements
    const shouldCount = (text.match(/should|must|have to|supposed to/gi) || []).length;
    if (shouldCount >= 2) {
      detected = true;
      confidence = Math.max(confidence, 0.8);
      indicators.push('multiple-shoulds');
    }

    return { detected, confidence, indicators };
  }

  /**
   * PROJECTION: Putting disowned parts onto others
   */
  private detectProjection(text: string) {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    const projectionPatterns = [
      /(you|they|he|she) (are|is) (so|very|really|always) (angry|selfish|controlling|judgmental)/i,
      /(you|they) make me (feel|angry|sad|upset)/i,
      /they're the (problem|one|reason)/i,
      /blame/i,
      /if only (you|they) would/i,
      /(you|they) (never|always)/i
    ];

    for (const pattern of projectionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.6);
        indicators.push('projection-language');
        break;
      }
    }

    // High "you/they" to "I" ratio suggests projection
    const youTheyCount = (text.match(/\b(you|they|he|she)\b/gi) || []).length;
    const iMeCount = (text.match(/\b(i|me|my)\b/gi) || []).length;
    if (youTheyCount > iMeCount && youTheyCount > 5) {
      detected = true;
      confidence = Math.max(confidence, 0.5);
      indicators.push('other-focused-language');
    }

    return { detected, confidence, indicators };
  }

  /**
   * RETROFLECTION: Doing to self what wanted to do to others/world
   */
  private detectRetroflection(text: string) {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    const retroflectionPatterns = [
      /\b(holding|keeping|bottling) (it|everything|feelings) (in|inside|down)\b/i,
      /bite my (tongue|lip)/i,
      /can't (let it out|express|say it|show it)/i,
      /turn (it|anger|rage) (inward|on myself|against myself)/i,
      /do (to|against) myself/i,
      /(punish|hurt|hate|criticize|judge) myself/i,
      /clench|grit|tighten|hold (tight|tense)/i,
      /swallow (it|my words|my feelings)/i
    ];

    for (const pattern of retroflectionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.8);
        indicators.push('retroflection-language');
        break;
      }
    }

    // Self-harm or self-criticism language
    if (/\b(hate|hurt|punish|criticize|blame) myself\b/i.test(text)) {
      detected = true;
      confidence = Math.max(confidence, 0.9);
      indicators.push('self-directed-action');
    }

    return { detected, confidence, indicators };
  }

  /**
   * DEFLECTION: Avoiding direct contact through humor, topic changes, abstracting
   */
  private detectDeflection(text: string) {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    const deflectionPatterns = [
      /\b(anyway|whatever|but|however|actually|speaking of|oh|by the way)\b/i,
      /\b(lol|haha|lmao)\b/i,
      /(joke|kidding|funny|humor)/i,
      /\b(abstract|theory|general|concept|philosophy)\b/i,
      /in general|theoretically|hypothetically/i
    ];

    for (const pattern of deflectionPatterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.5);
        indicators.push('deflection-markers');
        break;
      }
    }

    // Multiple topic markers suggest deflection
    const topicChanges = (text.match(/anyway|but|however|speaking of|by the way/gi) || []).length;
    if (topicChanges >= 2) {
      detected = true;
      confidence = Math.max(confidence, 0.6);
      indicators.push('topic-shifting');
    }

    // Intellectualizing (avoiding feeling by analyzing)
    if (/\b(analyze|think about|consider|examine|understand|figure out)\b/i.test(text) &&
        !/\b(feel|feeling|emotion|sense)\b/i.test(text)) {
      detected = true;
      confidence = Math.max(confidence, 0.6);
      indicators.push('intellectualizing');
    }

    return { detected, confidence, indicators };
  }

  /**
   * Detect contact cycle phase
   */
  private detectContactCycle(text: string): GestaltState['contactCycle'] {
    let phase: GestaltState['contactCycle']['phase'] = 'stuck';
    let stuck = false;
    let stuckAt: string | undefined;

    // SENSATION: "I notice/feel something"
    if (/\b(notice|feel|sense|aware of) (something|a|an|the)\b/i.test(text)) {
      phase = 'sensation';
    }

    // AWARENESS: "I recognize what it is"
    if (/\b(realize|recognize|understand|see|aware) (that|what|this is)\b/i.test(text)) {
      phase = 'awareness';
    }

    // MOBILIZATION: "Energy rising, preparing to act"
    if (/\b(want to|need to|urge to|impulse to|energy (to|for)|ready to)\b/i.test(text)) {
      phase = 'mobilization';
    }

    // ACTION: "I did something, I'm doing"
    if (/\b(i (did|do|am|was) (say|tell|push|pull|leave|stay|fight|run))\b/i.test(text)) {
      phase = 'action';
    }

    // CONTACT: "Full engagement"
    if (/\b(fully (present|engaged|here|with)|complete contact|totally in it)\b/i.test(text)) {
      phase = 'contact';
    }

    // WITHDRAWAL: "Natural completion, pulling back"
    if (/\b(complete|finished|done|withdraw|rest|integrate|step back)\b/i.test(text)) {
      phase = 'withdrawal';
    }

    // ASSIMILATION: "Taking it in, learning"
    if (/\b(learning|integrat(e|ing)|taking in|understanding|wisdom|insight)\b/i.test(text)) {
      phase = 'assimilation';
    }

    // Detect if stuck
    const stuckPatterns = [
      { pattern: /can't (feel|sense|notice)/i, at: 'sensation' },
      { pattern: /don't (know|understand|see) what/i, at: 'awareness' },
      { pattern: /want to but (can't|won't|shouldn't)/i, at: 'mobilization' },
      { pattern: /can't (act|do|move|say)/i, at: 'action' },
      { pattern: /can't (connect|be with|stay with)/i, at: 'contact' },
      { pattern: /can't (let go|finish|complete)/i, at: 'withdrawal' }
    ];

    for (const { pattern, at } of stuckPatterns) {
      if (pattern.test(text)) {
        stuck = true;
        stuckAt = at;
        phase = 'stuck';
        break;
      }
    }

    return { phase, stuck, stuckAt };
  }

  /**
   * Assess awareness quality
   */
  private assessAwareness(text: string): GestaltState['awareness'] {
    let hereAndNow = 0.5;
    let figureClarity = 0.5;
    let contactQuality = 0.5;

    // HERE-AND-NOW: Present moment vs past/future
    const presentMarkers = /\b(now|right now|this moment|currently|present)\b/gi;
    const pastMarkers = /\b(was|were|had|used to|back then|before)\b/gi;
    const futureMarkers = /\b(will|going to|planning|hope|worry about)\b/gi;

    const presentCount = (text.match(presentMarkers) || []).length;
    const pastCount = (text.match(pastMarkers) || []).length;
    const futureCount = (text.match(futureMarkers) || []).length;
    const total = presentCount + pastCount + futureCount;

    if (total > 0) {
      hereAndNow = presentCount / total;
    }

    // FIGURE CLARITY: What's important is clear vs confused
    if (/\b(clear|obvious|stands out|important|central|focus)\b/i.test(text)) {
      figureClarity = 0.7;
    }
    if (/\b(confused|unclear|don't know|mixed up|foggy|vague)\b/i.test(text)) {
      figureClarity = 0.3;
    }

    // CONTACT QUALITY: Can fully engage
    if (/\b(fully|completely|totally) (present|here|with|engaged)\b/i.test(text)) {
      contactQuality = 0.8;
    }
    if (/\b(can't (connect|be with|stay with)|disconnected|distant|detached)\b/i.test(text)) {
      contactQuality = 0.2;
    }

    return {
      hereAndNow,
      figureClarity,
      contactQuality
    };
  }
}

export const gestaltEngine = new GestaltEngine();
