/**
 * DBT (DIALECTICAL BEHAVIOR THERAPY) ENGINE
 *
 * Based on Marsha Linehan's Dialectical Behavior Therapy
 *
 * Detects skill usage across 4 modules:
 * 1. Mindfulness (core skill - being present)
 * 2. Distress Tolerance (surviving crisis without making it worse)
 * 3. Emotion Regulation (understanding and changing emotional states)
 * 4. Interpersonal Effectiveness (asking for what you need, setting boundaries)
 *
 * Also detects:
 * - Dialectical thinking (both/and vs either/or)
 * - Wise Mind (integration of emotional + rational)
 * - Emotional dysregulation patterns
 *
 * Elemental Resonance: ALL ELEMENTS (comprehensive skills framework)
 * - Mindfulness = AIR
 * - Emotion Regulation = WATER
 * - Distress Tolerance = EARTH
 * - Interpersonal Effectiveness = AIR
 * - Wise Mind = AETHER
 */

export interface DBTState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Overall DBT skill capacity
  skillCapacity: number; // 0-1 (0 = no skills, 1 = strong skill use)

  // Module 1: MINDFULNESS (core skill)
  mindfulness: {
    detected: boolean;
    skills: {
      observe: boolean; // Just noticing
      describe: boolean; // Putting words to experience
      participate: boolean; // Full engagement
      nonJudgmental: boolean; // Without evaluation
      oneMindfully: boolean; // One thing at a time
      effectively: boolean; // Focus on what works
    };
    level: number; // 0-1 (overall mindfulness capacity)
    indicators: string[];
  };

  // Module 2: DISTRESS TOLERANCE (crisis survival)
  distressTolerance: {
    detected: boolean;
    skills: {
      // Crisis survival skills
      TIPP: boolean; // Temperature, Intense exercise, Paced breathing, Paired muscle relaxation
      distract: boolean; // ACCEPTS (Activities, Contributing, Comparisons, Emotions, Pushing away, Thoughts, Sensations)
      selfSoothe: boolean; // 5 senses soothing
      IMPROVE: boolean; // Imagery, Meaning, Prayer, Relaxation, One thing, Vacation, Encouragement

      // Reality acceptance skills
      radicalAcceptance: boolean; // Complete acceptance of reality
      turningTheMind: boolean; // Choosing acceptance over and over
      willingness: boolean; // Willingness vs willfulness
    };
    level: number; // 0-1 (overall distress tolerance)
    inCrisis: boolean; // Are they in crisis now?
    indicators: string[];
  };

  // Module 3: EMOTION REGULATION
  emotionRegulation: {
    detected: boolean;
    skills: {
      identify: boolean; // Identify and label emotions
      understand: boolean; // Understand function of emotions
      reduceVulnerability: boolean; // PLEASE (Physical health, treat iLlness, balanced Eating, Avoid mood-altering substances, balanced Sleep, Exercise)
      accumulate: boolean; // Accumulate positive emotions
      buildMastery: boolean; // Do things that create competence
      copingAhead: boolean; // Rehearse coping for future stressors
      opposite: boolean; // Opposite action (act opposite to emotion urge)
      problemSolve: boolean; // Direct problem solving
    };
    level: number; // 0-1 (overall emotion regulation)
    dysregulation: {
      detected: boolean;
      severity: number; // 0-1 (how dysregulated)
      indicators: string[];
    };
    indicators: string[];
  };

  // Module 4: INTERPERSONAL EFFECTIVENESS
  interpersonalEffectiveness: {
    detected: boolean;
    skills: {
      // DEAR MAN (getting what you want)
      DEARMAN: boolean; // Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate

      // GIVE (keeping the relationship)
      GIVE: boolean; // Gentle, Interested, Validate, Easy manner

      // FAST (keeping self-respect)
      FAST: boolean; // Fair, Apologies (no excessive), Stick to values, Truthful
    };
    level: number; // 0-1 (overall interpersonal effectiveness)
    indicators: string[];
  };

  // WISE MIND (integration of emotional + rational)
  wiseMind: {
    detected: boolean;
    state: 'emotion-mind' | 'reasonable-mind' | 'wise-mind';
    description: string;
    indicators: string[];
  };

  // DIALECTICAL THINKING (both/and vs either/or)
  dialecticalThinking: {
    detected: boolean;
    level: number; // 0-1 (0 = rigid either/or, 1 = fluid both/and)
    examples: string[]; // Detected dialectical statements
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    fire: number; // Opposite action, willingness, building mastery
    water: number; // Emotion regulation, self-soothing
    earth: number; // Distress tolerance, grounding, PLEASE skills
    air: number; // Mindfulness, interpersonal skills, wise mind
    aether: number; // Wise mind integration
  };
}

export class DBTEngine {

  /**
   * Extract DBT state from text
   */
  extract(text: string): DBTState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    // Detect four modules
    const mindfulness = this.detectMindfulness(lower);
    const distressTolerance = this.detectDistressTolerance(lower);
    const emotionRegulation = this.detectEmotionRegulation(lower);
    const interpersonalEffectiveness = this.detectInterpersonalEffectiveness(lower);

    // Detect wise mind
    const wiseMind = this.detectWiseMind(lower);

    // Detect dialectical thinking
    const dialecticalThinking = this.detectDialecticalThinking(lower);

    // Calculate overall skill capacity
    const skillCapacity = this.calculateSkillCapacity(
      mindfulness,
      distressTolerance,
      emotionRegulation,
      interpersonalEffectiveness
    );

    // Calculate elemental resonance
    const elementalResonance = this.calculateElementalResonance(
      mindfulness,
      distressTolerance,
      emotionRegulation,
      interpersonalEffectiveness,
      wiseMind
    );

    // Aggregate indicators
    if (mindfulness.detected) indicators.push(...mindfulness.indicators);
    if (distressTolerance.detected) indicators.push(...distressTolerance.indicators);
    if (emotionRegulation.detected) indicators.push(...emotionRegulation.indicators);
    if (interpersonalEffectiveness.detected) indicators.push(...interpersonalEffectiveness.indicators);
    if (wiseMind.detected) indicators.push(...wiseMind.indicators);
    if (dialecticalThinking.detected) indicators.push(...dialecticalThinking.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? skillCapacity : 0;

    return {
      detected,
      confidence,
      indicators,
      skillCapacity,
      mindfulness,
      distressTolerance,
      emotionRegulation,
      interpersonalEffectiveness,
      wiseMind,
      dialecticalThinking,
      elementalResonance
    };
  }

  /**
   * MODULE 1: Mindfulness
   */
  private detectMindfulness(text: string): DBTState['mindfulness'] {
    let detected = false;
    const skills = {
      observe: false,
      describe: false,
      participate: false,
      nonJudgmental: false,
      oneMindfully: false,
      effectively: false
    };
    const indicators: string[] = [];

    // OBSERVE (just noticing)
    if (/\b(notice|noticing|observ(e|ing)|aware|awareness) (the|my|this)\b/i.test(text)) {
      skills.observe = true;
      detected = true;
      indicators.push('mindfulness-observe');
    }

    // DESCRIBE (putting words to experience)
    if (/\b(i feel|i notice|i sense|i'm experiencing)\b/i.test(text)) {
      skills.describe = true;
      detected = true;
      indicators.push('mindfulness-describe');
    }

    // PARTICIPATE (full engagement)
    if (/\b(fully (present|engaged|here)|completely in|absorbed in)\b/i.test(text)) {
      skills.participate = true;
      detected = true;
      indicators.push('mindfulness-participate');
    }

    // NON-JUDGMENTAL (without evaluation)
    if (/\b(without judg|no judgment|not judging|just (is|noticing))\b/i.test(text)) {
      skills.nonJudgmental = true;
      detected = true;
      indicators.push('mindfulness-nonjudgmental');
    }

    // ONE-MINDFULLY (one thing at a time)
    if (/\b(one thing|this moment|just (this|now)|present)\b/i.test(text)) {
      skills.oneMindfully = true;
      detected = true;
      indicators.push('mindfulness-onemindfully');
    }

    // EFFECTIVELY (focus on what works)
    if (/\b(what works|effective|doing what's needed)\b/i.test(text)) {
      skills.effectively = true;
      detected = true;
      indicators.push('mindfulness-effectively');
    }

    const skillCount = Object.values(skills).filter(Boolean).length;
    const level = skillCount / 6;

    return { detected, skills, level, indicators };
  }

  /**
   * MODULE 2: Distress Tolerance
   */
  private detectDistressTolerance(text: string): DBTState['distressTolerance'] {
    let detected = false;
    const skills = {
      TIPP: false,
      distract: false,
      selfSoothe: false,
      IMPROVE: false,
      radicalAcceptance: false,
      turningTheMind: false,
      willingness: false
    };
    const indicators: string[] = [];
    let inCrisis = false;

    // TIPP skills (Temperature, Intense exercise, Paced breathing, Paired muscle relaxation)
    const TIPPPatterns = [
      /\b(cold water|ice|splash water on face)\b/i, // Temperature
      /\b(run|running|exercise|workout|intense movement)\b/i, // Intense exercise
      /\b(paced breath|box breath|4-7-8|deep breath)\b/i, // Paced breathing
      /\b(tense and release|progressive muscle|paired muscle)\b/i // Paired muscle
    ];
    for (const pattern of TIPPPatterns) {
      if (pattern.test(text)) {
        skills.TIPP = true;
        detected = true;
        indicators.push('TIPP-skill');
        break;
      }
    }

    // DISTRACT (ACCEPTS)
    if (/\b(distract|go for a walk|call a friend|watch|read|puzzle|game)\b/i.test(text)) {
      skills.distract = true;
      detected = true;
      indicators.push('distract-skill');
    }

    // SELF-SOOTHE (5 senses)
    if (/\b(candle|music|soft|scent|bath|comfort|soothe)\b/i.test(text)) {
      skills.selfSoothe = true;
      detected = true;
      indicators.push('self-soothe-skill');
    }

    // IMPROVE moment
    if (/\b(imagery|visualiz|prayer|meditat|vacation|encourage|meaning)\b/i.test(text)) {
      skills.IMPROVE = true;
      detected = true;
      indicators.push('IMPROVE-skill');
    }

    // RADICAL ACCEPTANCE
    if (/\b(radical acceptance|completely accept|it is what it is|can't change it)\b/i.test(text)) {
      skills.radicalAcceptance = true;
      detected = true;
      indicators.push('radical-acceptance');
    }

    // TURNING THE MIND (choosing acceptance repeatedly)
    if (/\b(turn(ing)? (my )?mind|choose acceptance|choosing to accept)\b/i.test(text)) {
      skills.turningTheMind = true;
      detected = true;
      indicators.push('turning-the-mind');
    }

    // WILLINGNESS (vs willfulness)
    if (/\b(willing|willingness|what's needed|doing what works)\b/i.test(text)) {
      skills.willingness = true;
      detected = true;
      indicators.push('willingness');
    }

    // Detect if in crisis
    if (/\b(crisis|emergency|can't handle|overwhelm|breaking|collapsing)\b/i.test(text)) {
      inCrisis = true;
      indicators.push('in-crisis');
    }

    const skillCount = Object.values(skills).filter(Boolean).length;
    const level = skillCount / 7;

    return { detected, skills, level, inCrisis, indicators };
  }

  /**
   * MODULE 3: Emotion Regulation
   */
  private detectEmotionRegulation(text: string): DBTState['emotionRegulation'] {
    let detected = false;
    const skills = {
      identify: false,
      understand: false,
      reduceVulnerability: false,
      accumulate: false,
      buildMastery: false,
      copingAhead: false,
      opposite: false,
      problemSolve: false
    };
    const indicators: string[] = [];

    // IDENTIFY emotions
    if (/\b(i feel|i'm feeling|the emotion is|identify the)\b/i.test(text)) {
      skills.identify = true;
      detected = true;
      indicators.push('identify-emotion');
    }

    // UNDERSTAND function of emotions
    if (/\b(emotion (is telling|wants|signals)|purpose of|function of)\b/i.test(text)) {
      skills.understand = true;
      detected = true;
      indicators.push('understand-emotion-function');
    }

    // REDUCE VULNERABILITY (PLEASE skills)
    const PLEASEPatterns = [
      /\b(sleep|sleeping|rest)\b/i,
      /\b(eat|eating|meal|nutrition)\b/i,
      /\b(exercise|workout|movement)\b/i,
      /\b(medication|doctor|health)\b/i,
      /\b(avoid (alcohol|drugs|substance))\b/i
    ];
    for (const pattern of PLEASEPatterns) {
      if (pattern.test(text)) {
        skills.reduceVulnerability = true;
        detected = true;
        indicators.push('PLEASE-skill');
        break;
      }
    }

    // ACCUMULATE positive emotions
    if (/\b(positive (experience|moment|activity)|do (something|things) (i enjoy|enjoyable))\b/i.test(text)) {
      skills.accumulate = true;
      detected = true;
      indicators.push('accumulate-positives');
    }

    // BUILD MASTERY
    if (/\b(accomplish|achievement|mastery|learn|competence|capable)\b/i.test(text)) {
      skills.buildMastery = true;
      detected = true;
      indicators.push('build-mastery');
    }

    // COPE AHEAD
    if (/\b(prepare|plan for|rehearse|practice|when.*happens i'll)\b/i.test(text)) {
      skills.copingAhead = true;
      detected = true;
      indicators.push('cope-ahead');
    }

    // OPPOSITE ACTION (act opposite to emotion urge)
    if (/\b(opposite action|act opposite|do the opposite|even though.*i (did|will))\b/i.test(text)) {
      skills.opposite = true;
      detected = true;
      indicators.push('opposite-action');
    }

    // PROBLEM SOLVE
    if (/\b(solve|solution|fix|address the problem|take action)\b/i.test(text)) {
      skills.problemSolve = true;
      detected = true;
      indicators.push('problem-solve');
    }

    // Detect DYSREGULATION
    const dysregulation = this.detectEmotionalDysregulation(text);

    const skillCount = Object.values(skills).filter(Boolean).length;
    const level = skillCount / 8;

    return { detected, skills, level, dysregulation, indicators };
  }

  /**
   * Detect emotional dysregulation
   */
  private detectEmotionalDysregulation(text: string): DBTState['emotionRegulation']['dysregulation'] {
    let detected = false;
    let severity = 0.5;
    const indicators: string[] = [];

    // Rapid mood changes
    if (/\b(mood (swing|shift)|up and down|all over the place)\b/i.test(text)) {
      detected = true;
      severity = Math.max(severity, 0.7);
      indicators.push('mood-instability');
    }

    // Intense emotional reactions
    if (/\b(explode|rage|meltdown|lost it|0 to 100)\b/i.test(text)) {
      detected = true;
      severity = Math.max(severity, 0.8);
      indicators.push('intense-reactivity');
    }

    // Difficulty returning to baseline
    if (/\b(can't (calm down|come down)|stays (high|intense)|won't settle)\b/i.test(text)) {
      detected = true;
      severity = Math.max(severity, 0.7);
      indicators.push('slow-return-to-baseline');
    }

    // Emotional overwhelm
    if (/\b(overwhelm|flooded|too much|can't handle)\b/i.test(text)) {
      detected = true;
      severity = Math.max(severity, 0.8);
      indicators.push('emotional-overwhelm');
    }

    return { detected, severity, indicators };
  }

  /**
   * MODULE 4: Interpersonal Effectiveness
   */
  private detectInterpersonalEffectiveness(text: string): DBTState['interpersonalEffectiveness'] {
    let detected = false;
    const skills = {
      DEARMAN: false,
      GIVE: false,
      FAST: false
    };
    const indicators: string[] = [];

    // DEAR MAN (getting what you want)
    const DEARMANPatterns = [
      /\b(i need|i want|asking for|request)\b/i, // Assert
      /\b(describe|explain|tell you)\b/i, // Describe
      /\b(it's important because|i feel)\b/i, // Express
      /\b(stay focused|keep coming back to|mindful)\b/i, // Mindful
      /\b(negotiate|compromise|willing to)\b/i // Negotiate
    ];
    for (const pattern of DEARMANPatterns) {
      if (pattern.test(text)) {
        skills.DEARMAN = true;
        detected = true;
        indicators.push('DEARMAN-skill');
        break;
      }
    }

    // GIVE (keeping the relationship)
    const GIVEPatterns = [
      /\b(gentle|kind|soft)\b/i, // Gentle
      /\b(listen|interested|curious)\b/i, // Interested
      /\b(validate|makes sense|i hear you)\b/i, // Validate
      /\b(easy manner|light|humor)\b/i // Easy manner
    ];
    for (const pattern of GIVEPatterns) {
      if (pattern.test(text)) {
        skills.GIVE = true;
        detected = true;
        indicators.push('GIVE-skill');
        break;
      }
    }

    // FAST (keeping self-respect)
    const FASTPatterns = [
      /\b(fair|treat (myself|others) fairly)\b/i, // Fair
      /\b(no (unnecessary )?apolog|don't say sorry)\b/i, // No excessive apologies
      /\b(stick to values|honor myself|self-respect)\b/i, // Stick to values
      /\b(honest|truthful|authentic)\b/i // Truthful
    ];
    for (const pattern of FASTPatterns) {
      if (pattern.test(text)) {
        skills.FAST = true;
        detected = true;
        indicators.push('FAST-skill');
        break;
      }
    }

    const skillCount = Object.values(skills).filter(Boolean).length;
    const level = skillCount / 3;

    return { detected, skills, level, indicators };
  }

  /**
   * Detect WISE MIND (integration of emotional + rational)
   */
  private detectWiseMind(text: string): DBTState['wiseMind'] {
    let detected = false;
    let state: 'emotion-mind' | 'reasonable-mind' | 'wise-mind' = 'reasonable-mind';
    let description = '';
    const indicators: string[] = [];

    // EMOTION MIND (all emotion, no logic)
    if (/\b(i (just|only) feel|don't care (about|what)|feelings are all)\b/i.test(text)) {
      detected = true;
      state = 'emotion-mind';
      description = 'Emotion mind active - all feeling, minimal rational input';
      indicators.push('emotion-mind');
    }

    // REASONABLE MIND (all logic, no emotion)
    else if (/\b(logically|rationally|makes sense|think it through|analyze)\b/i.test(text) &&
             !/\b(feel|emotion|heart)\b/i.test(text)) {
      detected = true;
      state = 'reasonable-mind';
      description = 'Reasonable mind active - all logic, minimal emotional input';
      indicators.push('reasonable-mind');
    }

    // WISE MIND (integration of both)
    else if (/\b(wise mind|both (feel|think) and|gut|intuition|inner knowing)\b/i.test(text)) {
      detected = true;
      state = 'wise-mind';
      description = 'Wise mind active - integration of emotional and rational knowing';
      indicators.push('wise-mind');
    }

    return { detected, state, description, indicators };
  }

  /**
   * Detect DIALECTICAL THINKING (both/and vs either/or)
   */
  private detectDialecticalThinking(text: string): DBTState['dialecticalThinking'] {
    let detected = false;
    let level = 0.5;
    const examples: string[] = [];
    const indicators: string[] = [];

    // BOTH/AND language (dialectical)
    const dialecticalPatterns = [
      /\b(both.*and|can be.*and also|true.*and.*true)\b/i,
      /\b(yes.*but also|on one hand.*on the other)\b/i,
      /\b(paradox|contradiction.*true)\b/i
    ];

    for (const pattern of dialecticalPatterns) {
      const match = text.match(pattern);
      if (match) {
        detected = true;
        level = Math.max(level, 0.8);
        examples.push(match[0]);
        indicators.push('dialectical-thinking');
      }
    }

    // EITHER/OR language (non-dialectical)
    const eitherOrPatterns = [
      /\b(either.*or|all or nothing|black (and|or) white)\b/i,
      /\b(always|never|everyone|nobody|completely|totally)\b/i
    ];

    const eitherOrCount = eitherOrPatterns.reduce((count, pattern) => {
      return count + (pattern.test(text) ? 1 : 0);
    }, 0);

    if (eitherOrCount >= 2) {
      level = Math.min(level, 0.3);
      indicators.push('either-or-thinking');
    }

    return { detected, level, examples, indicators };
  }

  /**
   * Calculate overall skill capacity
   */
  private calculateSkillCapacity(
    mindfulness: DBTState['mindfulness'],
    distressTolerance: DBTState['distressTolerance'],
    emotionRegulation: DBTState['emotionRegulation'],
    interpersonalEffectiveness: DBTState['interpersonalEffectiveness']
  ): number {
    return (
      mindfulness.level +
      distressTolerance.level +
      emotionRegulation.level +
      interpersonalEffectiveness.level
    ) / 4;
  }

  /**
   * Calculate elemental resonance
   */
  private calculateElementalResonance(
    mindfulness: DBTState['mindfulness'],
    distressTolerance: DBTState['distressTolerance'],
    emotionRegulation: DBTState['emotionRegulation'],
    interpersonalEffectiveness: DBTState['interpersonalEffectiveness'],
    wiseMind: DBTState['wiseMind']
  ): DBTState['elementalResonance'] {
    // FIRE = Opposite action, willingness, building mastery
    const fire = emotionRegulation.skills.opposite || emotionRegulation.skills.buildMastery
      ? emotionRegulation.level
      : 0.3;

    // WATER = Emotion regulation, self-soothing
    const water = (emotionRegulation.level + (distressTolerance.skills.selfSoothe ? 0.3 : 0)) / 1.3;

    // EARTH = Distress tolerance, grounding, PLEASE skills
    const earth = distressTolerance.level;

    // AIR = Mindfulness, interpersonal skills
    const air = (mindfulness.level + interpersonalEffectiveness.level) / 2;

    // AETHER = Wise mind integration
    const aether = wiseMind.state === 'wise-mind' ? 0.8 : 0.3;

    return { fire, water, earth, air, aether };
  }
}

// Singleton instance
export const dbtEngine = new DBTEngine();
