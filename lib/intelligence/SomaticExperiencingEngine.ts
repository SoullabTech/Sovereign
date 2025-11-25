/**
 * SOMATIC EXPERIENCING ENGINE (Peter Levine)
 *
 * Tracks the body's incomplete survival responses and discharge patterns
 *
 * Core Concepts:
 * - Incomplete trauma cycles (fight/flight/freeze that didn't complete)
 * - Discharge patterns (trembling, shaking, releasing)
 * - SIBAM model (Sensation → Image → Behavior → Affect → Meaning)
 * - Titration (working with small amounts of activation)
 * - Pendulation (swinging between activation ↔ resource)
 * - Organismic completion (body finishing what it started)
 */

export interface SomaticState {
  detected: boolean;

  // Incomplete survival responses
  incompleteResponse: {
    detected: boolean;
    type: 'fight' | 'flight' | 'freeze' | 'fawn' | 'unknown';
    confidence: number;
    indicators: string[];
  };

  // Discharge patterns
  discharge: {
    active: boolean;
    type: 'trembling' | 'shaking' | 'waves' | 'release' | 'none';
    confidence: number;
    indicators: string[];
  };

  // SIBAM layers (which layer is most active?)
  sibamLayer: {
    primary: 'sensation' | 'image' | 'behavior' | 'affect' | 'meaning' | 'mixed';
    indicators: {
      sensation: string[];
      image: string[];
      behavior: string[];
      affect: string[];
      meaning: string[];
    };
  };

  // Arousal level
  arousal: {
    level: number; // 0-1 (0 = shutdown, 0.5 = window of tolerance, 1 = overwhelm)
    state: 'hypoarousal' | 'window' | 'hyperarousal';
    windowOfTolerance: boolean; // Can they work with this?
  };

  // Treatment guidance
  guidance: {
    titrationNeeded: boolean; // Go slower?
    pendulationNeeded: boolean; // Need to swing to resource?
    resourceAvailable: boolean; // Safe base to return to?
    completionPossible: boolean; // Can the response complete now?
  };
}

export class SomaticExperiencingEngine {

  /**
   * Extract somatic state from text
   */
  extract(text: string): SomaticState {
    const lower = text.toLowerCase();

    // Detect incomplete responses
    const incompleteResponse = this.detectIncompleteResponse(lower);

    // Detect discharge patterns
    const discharge = this.detectDischarge(lower);

    // Detect SIBAM layer
    const sibamLayer = this.detectSIBAMLayer(lower);

    // Assess arousal level
    const arousal = this.assessArousal(lower);

    // Generate guidance
    const guidance = this.generateGuidance(incompleteResponse, discharge, arousal);

    const detected = incompleteResponse.detected || discharge.active;

    return {
      detected,
      incompleteResponse,
      discharge,
      sibamLayer,
      arousal,
      guidance
    };
  }

  /**
   * Detect incomplete survival responses
   */
  private detectIncompleteResponse(text: string): SomaticState['incompleteResponse'] {
    let detected = false;
    let type: 'fight' | 'flight' | 'freeze' | 'fawn' | 'unknown' = 'unknown';
    let confidence = 0;
    const indicators: string[] = [];

    // Track each response type with its confidence
    const responses: Array<{ type: 'fight' | 'flight' | 'freeze' | 'fawn', confidence: number }> = [];

    // FIGHT response (incomplete aggression/anger)
    const fightPatterns = [
      /want to (hit|punch|push|attack|fight|rage|scream)/i,
      /\b(anger|rage|fury) (trapped|stuck|held|inside|can't let out)/i,
      /clench(ed|ing) (fist|jaw|teeth)/i,
      /shoulders (tight|tense|raised)/i,
      /want to push (away|them|it)/i,
      /holding (back|in) (anger|rage|fury)/i
    ];

    for (const pattern of fightPatterns) {
      if (pattern.test(text)) {
        detected = true;
        responses.push({ type: 'fight', confidence: 0.7 });
        indicators.push('incomplete-fight-response');
        break;
      }
    }

    // FLIGHT response (incomplete escape/running)
    const flightPatterns = [
      /want to (run|escape|flee|get away|leave)/i,
      /\b(running|fleeing) (but can't|stuck|trapped)/i,
      /legs (want to move|feel restless|need to run)/i,
      /trapped|can't escape|no way out/i,
      /energy to run but (can't|won't|stuck)/i
    ];

    for (const pattern of flightPatterns) {
      if (pattern.test(text)) {
        detected = true;
        responses.push({ type: 'flight', confidence: 0.7 });
        indicators.push('incomplete-flight-response');
        break;
      }
    }

    // FREEZE response (immobilization/shutdown)
    const freezePatterns = [
      /\b(froze|frozen|freeze|freezing)\b/i,
      /can't move|cannot move|can not move|couldn't move|could not move|unable to move/i,
      /\b(stuck|immobilized|immobile|immobility|paralyzed)\b/i,
      /body (won't respond|shut down|went numb|completely numb)/i,
      /playing dead|going blank|dissociat/i,
      // Specific body parts frozen/immobile
      /(cannot|can't|unable to) move (my )?(arms?|legs?|hands?|feet|body)/i,
      /arms? (won't move|can't move|frozen|stuck|paralyzed)/i,
      /legs? (won't move|can't move|frozen|stuck|paralyzed)/i,
      // Shutdown language
      /\b(shut down|shutdown|shutting down) (completely)?/i,
      /system.{0,20}(offline|shut down|shutdown)/i,
      /went (completely )?numb/i,
      // Withdrawal/collapse
      /staying small/i,
      /completely numb/i,
      /feel(ing)? nothing/i
    ];

    for (const pattern of freezePatterns) {
      if (pattern.test(text)) {
        detected = true;
        responses.push({ type: 'freeze', confidence: 0.8 });
        indicators.push('freeze-response-active');
        break;
      }
    }

    // FAWN response (people-pleasing/appeasement)
    const fawnPatterns = [
      /can't say no|always say yes/i,
      /people.?pleas(ing|er)/i,
      /don't want to upset|afraid they'll be angry/i,
      /appeas(e|ing)|make them happy/i,
      /lose myself (in|with|for) (them|others)/i
    ];

    for (const pattern of fawnPatterns) {
      if (pattern.test(text)) {
        detected = true;
        responses.push({ type: 'fawn', confidence: 0.6 });
        indicators.push('fawn-response-active');
        break;
      }
    }

    // Select the FIRST detected response (most prominent in text order)
    if (responses.length > 0) {
      type = responses[0].type;
      confidence = responses[0].confidence;
    }

    // General incomplete response markers
    if (/incomplete|unfinished|didn't complete|never finished/i.test(text)) {
      detected = true;
      confidence = Math.max(confidence, 0.5);
      indicators.push('incomplete-response-language');
    }

    return {
      detected,
      type,
      confidence,
      indicators
    };
  }

  /**
   * Detect discharge patterns (body releasing trapped energy)
   */
  private detectDischarge(text: string): SomaticState['discharge'] {
    let active = false;
    let type: 'trembling' | 'shaking' | 'waves' | 'release' | 'none' = 'none';
    let confidence = 0;
    const indicators: string[] = [];

    // TREMBLING
    if (/\b(trembl(e|ing)|quiver(ing)?|vibrat(e|ing))\b/i.test(text)) {
      active = true;
      type = 'trembling';
      confidence = 0.9;
      indicators.push('trembling-discharge');
    }

    // SHAKING
    if (/\b(shak(e|ing)|shook)\b/i.test(text)) {
      active = true;
      type = 'shaking';
      confidence = 0.9;
      indicators.push('shaking-discharge');
    }

    // WAVES (hot/cold, energy moving)
    if (/(hot|cold|warm) (waves|flush|surge)/i.test(text) ||
        /energy (moving|flowing|surging|releasing)/i.test(text)) {
      active = true;
      type = 'waves';
      confidence = 0.7;
      indicators.push('wave-discharge');
    }

    // RELEASE language
    if (/\b(releasing|letting go|flowing out|moving through)\b/i.test(text)) {
      active = true;
      type = 'release';
      confidence = 0.6;
      indicators.push('release-language');
    }

    return {
      active,
      type,
      confidence,
      indicators
    };
  }

  /**
   * Detect which SIBAM layer is most active
   * S = Sensation, I = Image, B = Behavior, A = Affect, M = Meaning
   */
  private detectSIBAMLayer(text: string): SomaticState['sibamLayer'] {
    const indicators = {
      sensation: [] as string[],
      image: [] as string[],
      behavior: [] as string[],
      affect: [] as string[],
      meaning: [] as string[]
    };

    // SENSATION layer (body sensations)
    const sensationPatterns = [
      /\b(tight|tense|numb|buzz|tingle|pressure|heavy|light|cold|hot|warm|ache|pain)\b/i,
      /chest|throat|stomach|shoulders|jaw|legs|arms|back/i,
      /feel (in|on) my (body|chest|stomach|throat)/i
    ];

    for (const pattern of sensationPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        indicators.sensation.push(matches[0]);
      }
    }

    // IMAGE layer (visual/mental imagery)
    const imagePatterns = [
      /\b(see|seeing|picture|image|vision|visual)\b/i,
      /(darkness|light|walls|closing in|opening up)/i,
      /like (a|being) (trap|cage|box|tunnel|pit)/i
    ];

    for (const pattern of imagePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        indicators.image.push(matches[0]);
      }
    }

    // BEHAVIOR layer (impulses to act)
    const behaviorPatterns = [
      /want to (run|hit|hide|push|pull|leave|stay|fight|flee)/i,
      /impulse to|urge to|need to/i,
      /can't (stop|help|control) (myself|it)/i
    ];

    for (const pattern of behaviorPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        indicators.behavior.push(matches[0]);
      }
    }

    // AFFECT layer (emotions/feelings)
    const affectPatterns = [
      /\b(scared|afraid|terrified|anxious|angry|sad|grief|rage|fear|panic|shame)\b/i,
      /feel (so|very|really) (scared|angry|sad|afraid)/i,
      /\b(emotion|feeling|emotional)\b/i
    ];

    for (const pattern of affectPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        indicators.affect.push(matches[0]);
      }
    }

    // MEANING layer (beliefs/interpretations)
    const meaningPatterns = [
      /\b(means|meaning|believe|think|understand|realize)\b/i,
      /this means|what this tells me|i'm learning that/i,
      /because|therefore|so this shows/i
    ];

    for (const pattern of meaningPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        indicators.meaning.push(matches[0]);
      }
    }

    // Determine primary layer
    const counts = {
      sensation: indicators.sensation.length,
      image: indicators.image.length,
      behavior: indicators.behavior.length,
      affect: indicators.affect.length,
      meaning: indicators.meaning.length
    };

    const maxCount = Math.max(...Object.values(counts));
    const primary = maxCount === 0 ? 'mixed' :
      Object.entries(counts).find(([_, count]) => count === maxCount)![0] as any;

    return {
      primary,
      indicators
    };
  }

  /**
   * Assess arousal level (window of tolerance)
   */
  private assessArousal(text: string): SomaticState['arousal'] {
    let level = 0.5; // Default: window of tolerance

    // HYPOAROUSAL markers (shutdown, too low)
    const hypoMarkers = [
      /\b(numb|shutdown|frozen|disconnected|dissociat|spaced out|blank|empty)\b/i,
      /can't feel (anything|it|my body)/i,
      /feel nothing|no feeling|no sensation/i
    ];

    for (const pattern of hypoMarkers) {
      if (pattern.test(text)) {
        level = Math.min(level, 0.2);
      }
    }

    // HYPERAROUSAL markers (overwhelm, too high)
    const hyperMarkers = [
      /\b(overwhelm|panic|frantic|racing|spinning|can't stop|too much)\b/i,
      /heart (racing|pounding)/i,
      /can't (breathe|think|calm down)/i,
      /out of control/i
    ];

    for (const pattern of hyperMarkers) {
      if (pattern.test(text)) {
        level = Math.max(level, 0.8);
      }
    }

    // Determine state
    let state: 'hypoarousal' | 'window' | 'hyperarousal';
    if (level < 0.3) {
      state = 'hypoarousal';
    } else if (level > 0.7) {
      state = 'hyperarousal';
    } else {
      state = 'window';
    }

    const windowOfTolerance = state === 'window';

    return {
      level,
      state,
      windowOfTolerance
    };
  }

  /**
   * Generate treatment guidance based on somatic state
   */
  private generateGuidance(
    incompleteResponse: SomaticState['incompleteResponse'],
    discharge: SomaticState['discharge'],
    arousal: SomaticState['arousal']
  ): SomaticState['guidance'] {

    // Titration needed if outside window
    const titrationNeeded = !arousal.windowOfTolerance;

    // Pendulation needed if stuck in hyperarousal
    const pendulationNeeded = arousal.state === 'hyperarousal';

    // Resource needed if in hypoarousal or hyperarousal
    const resourceAvailable = arousal.windowOfTolerance;

    // Completion possible only if in window AND incomplete response detected
    const completionPossible =
      arousal.windowOfTolerance &&
      incompleteResponse.detected &&
      !discharge.active; // Don't interrupt active discharge!

    return {
      titrationNeeded,
      pendulationNeeded,
      resourceAvailable,
      completionPossible
    };
  }
}

export const somaticExperiencingEngine = new SomaticExperiencingEngine();
