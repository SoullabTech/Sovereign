/**
 * CFT (COMPASSION-FOCUSED THERAPY) ENGINE
 *
 * Based on Paul Gilbert's Compassion-Focused Therapy
 *
 * Detects:
 * - Three emotion regulation systems (Threat, Drive, Soothing)
 * - Compassion vs self-criticism patterns
 * - Compassionate mind qualities
 * - Fears of compassion / compassion blocks
 *
 * Core Insight: Many trauma survivors have:
 * - Overactive THREAT system (chronic danger/shame)
 * - Overactive DRIVE system (achievement to feel safe)
 * - Underactive SOOTHING system (can't self-soothe)
 *
 * Elemental Resonance: WATER (compassion, soothing) + EARTH (safety, grounding)
 */

export interface CFTState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Three Systems Model
  threeSystems: {
    // THREAT SYSTEM (protection from danger)
    threat: {
      activated: boolean;
      level: number; // 0-1 (0 = calm, 1 = chronic threat)
      patterns: string[]; // anxiety, anger, disgust, shame
      indicators: string[];
    };

    // DRIVE SYSTEM (achievement, resources, goals)
    drive: {
      activated: boolean;
      level: number; // 0-1 (0 = no drive, 1 = driven/striving)
      patterns: string[]; // achieving, pursuing, wanting
      indicators: string[];
    };

    // SOOTHING SYSTEM (safety, contentment, connection)
    soothing: {
      activated: boolean;
      level: number; // 0-1 (0 = no soothing capacity, 1 = well-resourced)
      patterns: string[]; // self-compassion, kindness, warmth
      indicators: string[];
    };
  };

  // System balance (CFT's core assessment)
  systemBalance: {
    balanced: boolean;
    imbalance: 'threat-dominant' | 'drive-dominant' | 'soothing-deficient' | 'balanced';
    description: string;
  };

  // Self-Criticism vs Self-Compassion
  selfRelationship: {
    selfCriticism: {
      detected: boolean;
      severity: number; // 0-1 (0 = none, 1 = severe/attacking)
      type: 'inadequate-self' | 'hated-self' | 'reassuring-self'; // Gilbert's 3 types
      indicators: string[];
    };

    selfCompassion: {
      detected: boolean;
      level: number; // 0-1 (0 = none, 1 = strong compassion)
      components: {
        selfKindness: boolean; // vs self-judgment
        commonHumanity: boolean; // vs isolation
        mindfulness: boolean; // vs over-identification
      };
      indicators: string[];
    };
  };

  // Compassionate Mind Qualities
  compassionateMind: {
    detected: boolean;
    qualities: {
      sensitivity: boolean; // Noticing suffering
      sympathy: boolean; // Being moved by suffering
      distressTolerance: boolean; // Bearing discomfort
      empathy: boolean; // Understanding suffering
      nonJudgment: boolean; // Suspending evaluation
      careForWellbeing: boolean; // Motivation to help
    };
    strength: number; // 0-1 (overall compassionate capacity)
  };

  // Fears of Compassion (CFT's unique contribution)
  compassionFears: {
    detected: boolean;
    fears: string[]; // "weakness", "vulnerability", "undeserved", "loss of drive"
    resistanceLevel: number; // 0-1 (how much they resist compassion)
    indicators: string[];
  };

  // Shame (CFT's special focus)
  shame: {
    detected: boolean;
    type: 'internal' | 'external' | 'both'; // Internal (self-disgust) vs External (others see me as flawed)
    severity: number; // 0-1
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    water: number; // Compassion flow, soothing, emotional warmth
    earth: number; // Grounding in safety, stable sense of self
  };
}

export class CFTEngine {

  /**
   * Extract CFT state from text
   */
  extract(text: string): CFTState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    // Detect three systems
    const threat = this.detectThreatSystem(lower);
    const drive = this.detectDriveSystem(lower);
    const soothing = this.detectSoothingSystem(lower);

    // Assess system balance
    const systemBalance = this.assessSystemBalance(threat, drive, soothing);

    // Detect self-relationship
    const selfCriticism = this.detectSelfCriticism(lower);
    const selfCompassion = this.detectSelfCompassion(lower);

    // Detect compassionate mind qualities
    const compassionateMind = this.detectCompassionateMind(lower);

    // Detect fears of compassion
    const compassionFears = this.detectCompassionFears(lower);

    // Detect shame
    const shame = this.detectShame(lower);

    // Calculate elemental resonance
    const elementalResonance = this.calculateElementalResonance(soothing, selfCompassion, threat);

    // Aggregate indicators
    if (threat.activated) indicators.push(...threat.indicators);
    if (drive.activated) indicators.push(...drive.indicators);
    if (soothing.activated) indicators.push(...soothing.indicators);
    if (selfCriticism.detected) indicators.push(...selfCriticism.indicators);
    if (selfCompassion.detected) indicators.push(...selfCompassion.indicators);
    if (compassionFears.detected) indicators.push(...compassionFears.indicators);
    if (shame.detected) indicators.push(...shame.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.8 : 0;

    return {
      detected,
      confidence,
      indicators,
      threeSystems: { threat, drive, soothing },
      systemBalance,
      selfRelationship: { selfCriticism, selfCompassion },
      compassionateMind,
      compassionFears,
      shame,
      elementalResonance
    };
  }

  /**
   * Detect THREAT system activation
   */
  private detectThreatSystem(text: string): CFTState['threeSystems']['threat'] {
    let activated = false;
    let level = 0.5;
    const patterns: string[] = [];
    const indicators: string[] = [];

    // Threat emotions
    const threatPatterns = [
      { pattern: /\b(anxious|anxiety|worried|worry|fear|afraid|scared|terrified|panic)\b/i, emotion: 'fear/anxiety' },
      { pattern: /\b(angry|rage|fury|irritated|annoyed|pissed)\b/i, emotion: 'anger' },
      { pattern: /\b(disgust|disgusted|repulsed|gross)\b/i, emotion: 'disgust' },
      { pattern: /\b(shame|ashamed|humiliated|embarrassed)\b/i, emotion: 'shame' }
    ];

    for (const { pattern, emotion } of threatPatterns) {
      if (pattern.test(text)) {
        activated = true;
        level = Math.max(level, 0.7);
        patterns.push(emotion);
        indicators.push('threat-emotion-detected');
      }
    }

    // Chronic threat language
    if (/\b(always|constantly|never safe|on edge|vigilant|hypervigilant)\b/i.test(text)) {
      level = Math.max(level, 0.9);
      indicators.push('chronic-threat');
    }

    // Threat system overwhelm
    if (/\b(overwhelm|can't handle|too much|breaking|collapsing)\b/i.test(text)) {
      level = Math.max(level, 0.8);
      indicators.push('threat-overwhelm');
    }

    return { activated, level, patterns, indicators };
  }

  /**
   * Detect DRIVE system activation
   */
  private detectDriveSystem(text: string): CFTState['threeSystems']['drive'] {
    let activated = false;
    let level = 0.5;
    const patterns: string[] = [];
    const indicators: string[] = [];

    // Drive language (achieving, pursuing, wanting)
    const drivePatterns = [
      { pattern: /\b(achieve|achieving|accomplish|succeed|win|goal|target)\b/i, type: 'achievement' },
      { pattern: /\b(want|need|desire|crave|must have)\b/i, type: 'wanting' },
      { pattern: /\b(striving|pursuing|chasing|driven|motivated)\b/i, type: 'pursuing' },
      { pattern: /\b(more|better|best|perfect|optimize)\b/i, type: 'perfectionism' }
    ];

    for (const { pattern, type } of drivePatterns) {
      if (pattern.test(text)) {
        activated = true;
        level = Math.max(level, 0.6);
        patterns.push(type);
        indicators.push('drive-system-active');
      }
    }

    // Compulsive drive (too much)
    if (/\b(never enough|can't stop|have to keep|relentless|exhausting)\b/i.test(text)) {
      level = Math.max(level, 0.9);
      indicators.push('compulsive-drive');
    }

    return { activated, level, patterns, indicators };
  }

  /**
   * Detect SOOTHING system activation
   */
  private detectSoothingSystem(text: string): CFTState['threeSystems']['soothing'] {
    let activated = false;
    let level = 0.5;
    const patterns: string[] = [];
    const indicators: string[] = [];

    // Soothing language
    const soothingPatterns = [
      { pattern: /\b(calm|peace|peaceful|serene|tranquil|still)\b/i, type: 'calmness' },
      { pattern: /\b(safe|safety|secure|protected)\b/i, type: 'safety' },
      { pattern: /\b(warm|warmth|tender|gentle|soft|kind)\b/i, type: 'warmth' },
      { pattern: /\b(content|contentment|satisfied|enough)\b/i, type: 'contentment' },
      { pattern: /\b(connect|connection|belonging|held|supported)\b/i, type: 'connection' }
    ];

    for (const { pattern, type } of soothingPatterns) {
      if (pattern.test(text)) {
        activated = true;
        level = Math.max(level, 0.7);
        patterns.push(type);
        indicators.push('soothing-system-active');
      }
    }

    // Self-soothing capacity
    if (/\b(soothe|soothing) (myself|my)/i.test(text)) {
      level = Math.max(level, 0.8);
      indicators.push('self-soothing-capacity');
    }

    // Soothing system DEFICIT (very common in trauma)
    if (/\b(can't (calm|soothe|relax)|never feel safe|don't know how to|no comfort)\b/i.test(text)) {
      level = Math.min(level, 0.2);
      indicators.push('soothing-system-deficit');
    }

    return { activated, level, patterns, indicators };
  }

  /**
   * Assess three systems balance
   */
  private assessSystemBalance(
    threat: CFTState['threeSystems']['threat'],
    drive: CFTState['threeSystems']['drive'],
    soothing: CFTState['threeSystems']['soothing']
  ): CFTState['systemBalance'] {
    let imbalance: CFTState['systemBalance']['imbalance'] = 'balanced';
    let description = 'Systems appear balanced';

    // Threat-dominant (most common in trauma)
    if (threat.level > 0.7 && soothing.level < 0.4) {
      imbalance = 'threat-dominant';
      description = 'Threat system dominant, soothing system under-resourced (chronic anxiety/shame)';
    }

    // Drive-dominant (compensation for threat)
    else if (drive.level > 0.7 && soothing.level < 0.4) {
      imbalance = 'drive-dominant';
      description = 'Drive system dominant, using achievement to feel safe (burnout risk)';
    }

    // Soothing-deficient (can happen with balanced threat/drive)
    else if (soothing.level < 0.3) {
      imbalance = 'soothing-deficient';
      description = 'Soothing system deficient, difficulty self-regulating and feeling safe';
    }

    const balanced = imbalance === 'balanced';

    return { balanced, imbalance, description };
  }

  /**
   * Detect self-criticism
   */
  private detectSelfCriticism(text: string): CFTState['selfRelationship']['selfCriticism'] {
    let detected = false;
    let severity = 0.5;
    let type: 'inadequate-self' | 'hated-self' | 'reassuring-self' = 'inadequate-self';
    const indicators: string[] = [];

    // INADEQUATE SELF (most common - "I'm not good enough")
    const inadequatePatterns = [
      /\b(i'm|i am) (not (good|smart|strong|capable) enough|inadequate|insufficient|lacking)\b/i,
      /\b(should (be|do|have)|supposed to) (better|more)\b/i,
      /\b(failing|failure|can't do|not capable)\b/i
    ];

    for (const pattern of inadequatePatterns) {
      if (pattern.test(text)) {
        detected = true;
        severity = Math.max(severity, 0.6);
        type = 'inadequate-self';
        indicators.push('inadequate-self-criticism');
        break;
      }
    }

    // HATED SELF (severe - "I hate myself / I'm disgusting")
    const hatedPatterns = [
      /\b(i (hate|despise|loathe) myself|disgusted (with|by) myself)\b/i,
      /\b(i'm|i am) (disgusting|pathetic|worthless|garbage|trash)\b/i,
      /\b(wish i (was|were) dead|shouldn't exist)\b/i
    ];

    for (const pattern of hatedPatterns) {
      if (pattern.test(text)) {
        detected = true;
        severity = Math.max(severity, 0.9);
        type = 'hated-self';
        indicators.push('hated-self-criticism');
        break;
      }
    }

    // REASSURING SELF (anxious self-criticism - "You need to get it together")
    const reassuringPatterns = [
      /\b(need to|have to|must) (get it together|pull myself together|try harder)\b/i,
      /\b(come on|get it together|shape up)\b/i
    ];

    for (const pattern of reassuringPatterns) {
      if (pattern.test(text)) {
        detected = true;
        severity = Math.max(severity, 0.5);
        type = 'reassuring-self';
        indicators.push('reassuring-self-criticism');
        break;
      }
    }

    return { detected, severity, type, indicators };
  }

  /**
   * Detect self-compassion
   */
  private detectSelfCompassion(text: string): CFTState['selfRelationship']['selfCompassion'] {
    let detected = false;
    let level = 0.5;
    const components = {
      selfKindness: false,
      commonHumanity: false,
      mindfulness: false
    };
    const indicators: string[] = [];

    // Self-kindness (vs self-judgment)
    if (/\b(kind to myself|treat myself (with )?kindness|gentle with myself|care for myself)\b/i.test(text)) {
      detected = true;
      components.selfKindness = true;
      level = Math.max(level, 0.7);
      indicators.push('self-kindness');
    }

    // Common humanity (vs isolation - "I'm not alone in this")
    if (/\b(not (alone|just me)|others (feel|struggle|experience) this|human to|we all)\b/i.test(text)) {
      detected = true;
      components.commonHumanity = true;
      level = Math.max(level, 0.7);
      indicators.push('common-humanity');
    }

    // Mindfulness (vs over-identification - holding pain mindfully)
    if (/\b(hold|holding) (this|the pain|my) (gently|with awareness|mindfully)\b/i.test(text)) {
      detected = true;
      components.mindfulness = true;
      level = Math.max(level, 0.7);
      indicators.push('mindful-holding');
    }

    // Explicit self-compassion language
    if (/\b(self.compassion|compassion (for|toward) myself|compassionate (to|with) myself)\b/i.test(text)) {
      detected = true;
      level = Math.max(level, 0.8);
      indicators.push('explicit-self-compassion');
    }

    return { detected, level, components, indicators };
  }

  /**
   * Detect compassionate mind qualities
   */
  private detectCompassionateMind(text: string): CFTState['compassionateMind'] {
    let detected = false;
    const qualities = {
      sensitivity: false,
      sympathy: false,
      distressTolerance: false,
      empathy: false,
      nonJudgment: false,
      careForWellbeing: false
    };

    // Sensitivity (noticing suffering)
    if (/\b(notice|noticing|aware of|see|sensing) (the|my|this) (pain|suffering|struggle)\b/i.test(text)) {
      qualities.sensitivity = true;
      detected = true;
    }

    // Sympathy (being moved by suffering)
    if (/\b(moved by|touched by|heart (breaks|aches) for)\b/i.test(text)) {
      qualities.sympathy = true;
      detected = true;
    }

    // Distress tolerance (bearing discomfort)
    if (/\b(can (bear|hold|stay with)|tolerat(e|ing) (the|this))\b/i.test(text)) {
      qualities.distressTolerance = true;
      detected = true;
    }

    // Empathy (understanding suffering)
    if (/\b(understand|makes sense|see why)\b/i.test(text)) {
      qualities.empathy = true;
      detected = true;
    }

    // Non-judgment (suspending evaluation)
    if (/\b(without judg(e|ing|ment)|no judgment|not judging)\b/i.test(text)) {
      qualities.nonJudgment = true;
      detected = true;
    }

    // Care for wellbeing (motivation to help)
    if (/\b(want (to|my|your) (heal|feel better|be okay|be well)|care (about|for))\b/i.test(text)) {
      qualities.careForWellbeing = true;
      detected = true;
    }

    const qualityCount = Object.values(qualities).filter(Boolean).length;
    const strength = qualityCount / 6;

    return { detected, qualities, strength };
  }

  /**
   * Detect fears of compassion (CFT's unique insight)
   */
  private detectCompassionFears(text: string): CFTState['compassionFears'] {
    let detected = false;
    const fears: string[] = [];
    let resistanceLevel = 0.5;
    const indicators: string[] = [];

    // Fear compassion = weakness
    if (/\b(compassion|kindness|soft).*(weak|weakness|soft)\b/i.test(text)) {
      detected = true;
      fears.push('fear compassion means weakness');
      resistanceLevel = Math.max(resistanceLevel, 0.7);
      indicators.push('compassion-as-weakness');
    }

    // Fear compassion = vulnerability
    if (/\b(if i|can't) (open|soften|let.*in).*(hurt|vulnerable|attacked)\b/i.test(text)) {
      detected = true;
      fears.push('fear compassion creates vulnerability');
      resistanceLevel = Math.max(resistanceLevel, 0.8);
      indicators.push('compassion-as-vulnerability');
    }

    // Don't deserve compassion
    if (/\b(don't deserve|unworthy|not worthy|shouldn't) (compassion|kindness|care)\b/i.test(text)) {
      detected = true;
      fears.push('belief that they don\'t deserve compassion');
      resistanceLevel = Math.max(resistanceLevel, 0.8);
      indicators.push('undeserving-of-compassion');
    }

    // Fear losing drive/motivation
    if (/\b(if i.*compassion|being kind to myself).*(lazy|complacent|stop trying|lose.*drive)\b/i.test(text)) {
      detected = true;
      fears.push('fear compassion will reduce motivation');
      resistanceLevel = Math.max(resistanceLevel, 0.7);
      indicators.push('compassion-undermines-drive');
    }

    return { detected, fears, resistanceLevel, indicators };
  }

  /**
   * Detect shame (CFT's special focus)
   */
  private detectShame(text: string): CFTState['shame'] {
    let detected = false;
    let type: 'internal' | 'external' | 'both' = 'internal';
    let severity = 0.5;
    const indicators: string[] = [];

    // INTERNAL shame (self-disgust, "I am flawed")
    const internalShamePatterns = [
      /\b(ashamed|shame|humiliated|mortified|embarrassed)\b/i,
      /\b(i'm|i am) (disgusting|pathetic|defective|broken|damaged)\b/i,
      /\b(hate|despise) myself\b/i
    ];

    for (const pattern of internalShamePatterns) {
      if (pattern.test(text)) {
        detected = true;
        type = 'internal';
        severity = Math.max(severity, 0.7);
        indicators.push('internal-shame');
        break;
      }
    }

    // EXTERNAL shame (others see me as flawed)
    const externalShamePatterns = [
      /\b(they|everyone|people) (see|think|know|can tell) (i'm|how)\b/i,
      /\b(exposed|revealed|found out|discovered)\b/i,
      /\b(judg(e|ing|ment)|eyes on me|watching me)\b/i
    ];

    for (const pattern of externalShamePatterns) {
      if (pattern.test(text)) {
        detected = true;
        if (type === 'internal') {
          type = 'both';
        } else {
          type = 'external';
        }
        severity = Math.max(severity, 0.7);
        indicators.push('external-shame');
        break;
      }
    }

    // Shame language intensity
    if (/\b(unbearable|excruciating|crushing|overwhelming) (shame|humiliation)\b/i.test(text)) {
      severity = Math.max(severity, 0.9);
      indicators.push('intense-shame');
    }

    return { detected, type, severity, indicators };
  }

  /**
   * Calculate elemental resonance
   */
  private calculateElementalResonance(
    soothing: CFTState['threeSystems']['soothing'],
    selfCompassion: CFTState['selfRelationship']['selfCompassion'],
    threat: CFTState['threeSystems']['threat']
  ): CFTState['elementalResonance'] {
    // WATER = soothing system + self-compassion (flow, warmth, emotional healing)
    const water = (soothing.level + selfCompassion.level) / 2;

    // EARTH = safety, stable self (inverse of threat level)
    const earth = 1 - threat.level;

    return { water, earth };
  }
}

// Singleton instance
export const cftEngine = new CFTEngine();
