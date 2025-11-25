/**
 * COMPASSIONATE INQUIRY ENGINE
 *
 * Based on Gabor Maté's Compassionate Inquiry
 *
 * Detects:
 * - Implicit emotion (emotions beneath surface presentation)
 * - Authentic vs adaptive self
 * - Childhood wound origins
 * - Addiction as self-soothing
 * - Body-based truth
 *
 * Core Insight: "The question is not why the addiction, but why the pain."
 * Symptoms arise from suppressed emotion and disconnection from authentic self.
 *
 * Elemental Resonance: WATER (implicit emotion) + AETHER (authentic self)
 */

export interface CompassionateInquiryState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Implicit Emotion (emotions beneath the surface)
  implicitEmotion: {
    detected: boolean;
    surfacePresentation: string; // What they show
    implicitEmotion: string; // What's beneath
    confidence: number;
    indicators: string[];
  };

  // Authentic Self vs Adaptive Self
  selfPresentation: {
    authenticSelf: boolean; // True self emerging
    adaptiveSelf: boolean; // False self protecting
    description: string;
    indicators: string[];
  };

  // Childhood Wound (developmental origins)
  childhoodWound: {
    detected: boolean;
    woundType: string; // 'abandonment', 'emotional neglect', 'invalidation', etc.
    stillActive: boolean; // Is the wound active now?
    indicators: string[];
  };

  // Addiction/Coping (Maté's core focus)
  addictionCoping: {
    detected: boolean;
    substance: boolean; // Substance addiction
    process: boolean; // Process addiction (work, sex, etc.)
    function: string; // What does it serve? (soothing, numbing, escape)
    underlyingPain: string; // What pain is it masking?
    indicators: string[];
  };

  // Body-Based Truth (somatic awareness)
  bodyTruth: {
    detected: boolean;
    bodyKnows: boolean; // "My body knows something my mind doesn't"
    somaticConflict: boolean; // Body vs mind disconnect
    indicators: string[];
  };

  // Compassionate Curiosity (the inquiry itself)
  compassionateInquiry: {
    active: boolean; // Are they asking compassionate questions?
    selfCompassion: boolean; // Approaching self with kindness
    indicators: string[];
  };

  // Elemental resonance
  elementalResonance: {
    water: number; // Implicit emotion, compassion flow
    aether: number; // Authentic self, truth
  };
}

export class CompassionateInquiryEngine {
  extract(text: string): CompassionateInquiryState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    const implicitEmotion = this.detectImplicitEmotion(lower);
    const selfPresentation = this.detectSelfPresentation(lower);
    const childhoodWound = this.detectChildhoodWound(lower);
    const addictionCoping = this.detectAddictionCoping(lower);
    const bodyTruth = this.detectBodyTruth(lower);
    const compassionateInquiry = this.detectCompassionateInquiry(lower);

    const elementalResonance = this.calculateElementalResonance(
      implicitEmotion,
      selfPresentation
    );

    if (implicitEmotion.detected) indicators.push(...implicitEmotion.indicators);
    if (childhoodWound.detected) indicators.push(...childhoodWound.indicators);
    if (addictionCoping.detected) indicators.push(...addictionCoping.indicators);
    if (bodyTruth.detected) indicators.push(...bodyTruth.indicators);

    const detected = indicators.length > 0;
    const confidence = detected ? 0.75 : 0;

    return {
      detected,
      confidence,
      indicators,
      implicitEmotion,
      selfPresentation,
      childhoodWound,
      addictionCoping,
      bodyTruth,
      compassionateInquiry,
      elementalResonance
    };
  }

  private detectImplicitEmotion(text: string): CompassionateInquiryState['implicitEmotion'] {
    let detected = false;
    let surfacePresentation = '';
    let implicitEmotion = '';
    let confidence = 0.5;
    const indicators: string[] = [];

    // Anger masking hurt
    if (/\b(angry|rage|mad)\b/i.test(text) && /\b(hurt|pain|wounded)\b/i.test(text)) {
      detected = true;
      surfacePresentation = 'anger';
      implicitEmotion = 'hurt/pain beneath';
      confidence = 0.8;
      indicators.push('anger-masking-hurt');
    }

    // Anxiety masking grief
    if (/\b(anxious|anxiety|worried)\b/i.test(text) && /\b(loss|grief|lost)\b/i.test(text)) {
      detected = true;
      surfacePresentation = 'anxiety';
      implicitEmotion = 'grief beneath';
      confidence = 0.7;
      indicators.push('anxiety-masking-grief');
    }

    // Numbness masking pain
    if (/\b(numb|nothing|empty)\b/i.test(text)) {
      detected = true;
      surfacePresentation = 'numbness';
      implicitEmotion = 'overwhelming pain beneath';
      confidence = 0.8;
      indicators.push('numbness-masking-pain');
    }

    // Shame masking need
    if (/\b(ashamed|shame)\b/i.test(text) && /\b(need|want)\b/i.test(text)) {
      detected = true;
      surfacePresentation = 'shame';
      implicitEmotion = 'unmet need beneath';
      confidence = 0.7;
      indicators.push('shame-masking-need');
    }

    return { detected, surfacePresentation, implicitEmotion, confidence, indicators };
  }

  private detectSelfPresentation(text: string): CompassionateInquiryState['selfPresentation'] {
    let authenticSelf = false;
    let adaptiveSelf = false;
    let description = '';
    const indicators: string[] = [];

    // Authentic self emerging
    if (/\b(real me|true self|authentic|who i really am)\b/i.test(text)) {
      authenticSelf = true;
      description = 'Authentic self emerging, real truth surfacing';
      indicators.push('authentic-self');
    }

    // Adaptive self (false self protecting)
    if (/\b(pretend|mask|hide|fake|not really me|who i have to be)\b/i.test(text)) {
      adaptiveSelf = true;
      description = 'Adaptive self active - protecting through false presentation';
      indicators.push('adaptive-self');
    }

    // Good child vs real child
    if (/\b(good (boy|girl|child)|be good|make them happy)\b/i.test(text)) {
      adaptiveSelf = true;
      description = 'Adaptive "good child" protecting authentic needs';
      indicators.push('good-child-adaptation');
    }

    return { authenticSelf, adaptiveSelf, description, indicators };
  }

  private detectChildhoodWound(text: string): CompassionateInquiryState['childhoodWound'] {
    let detected = false;
    let woundType = '';
    let stillActive = false;
    const indicators: string[] = [];

    const wounds = [
      { pattern: /\b(abandon|left|alone as a child)\b/i, type: 'abandonment' },
      { pattern: /\b(no one (saw|heard|cared)|emotional(ly)? (absent|unavailable))\b/i, type: 'emotional neglect' },
      { pattern: /\b(not allowed to|couldn't (feel|express|be))\b/i, type: 'invalidation/suppression' },
      { pattern: /\b(had to be|responsible for|take care of)\b/i, type: 'parentification' },
      { pattern: /\b(not safe|afraid|scared) (growing up|as a child)\b/i, type: 'lack of safety' }
    ];

    for (const { pattern, type } of wounds) {
      if (pattern.test(text)) {
        detected = true;
        woundType = type;
        indicators.push('childhood-wound');
        break;
      }
    }

    // Check if wound is still active
    if (detected && /\b(still|always|even now|to this day)\b/i.test(text)) {
      stillActive = true;
      indicators.push('wound-still-active');
    }

    return { detected, woundType, stillActive, indicators };
  }

  private detectAddictionCoping(text: string): CompassionateInquiryState['addictionCoping'] {
    let detected = false;
    let substance = false;
    let process = false;
    let functionDescription = '';
    let underlyingPain = '';
    const indicators: string[] = [];

    // Substance addiction
    if (/\b(drink|alcohol|drug|weed|substance|pill|cocaine|heroin)\b/i.test(text)) {
      detected = true;
      substance = true;
      indicators.push('substance-use');
    }

    // Process addiction
    if (/\b(work (all|too much)|workaholic|sex|shopping|phone|scroll)\b/i.test(text)) {
      detected = true;
      process = true;
      indicators.push('process-addiction');
    }

    // Function (what does it serve?)
    if (/\b(numb|escape|forget|don't feel|avoid)\b/i.test(text)) {
      functionDescription = 'numbing/escaping pain';
      indicators.push('addiction-as-escape');
    }

    if (/\b(calm|soothe|relax|settle)\b/i.test(text)) {
      functionDescription = 'self-soothing/regulation';
      indicators.push('addiction-as-soothing');
    }

    // Underlying pain (Maté's question: "Why the pain?")
    if (detected) {
      if (/\b(lonely|alone|isolated)\b/i.test(text)) {
        underlyingPain = 'loneliness/disconnection';
      } else if (/\b(shame|ashamed|worthless)\b/i.test(text)) {
        underlyingPain = 'shame';
      } else if (/\b(pain|hurt|trauma)\b/i.test(text)) {
        underlyingPain = 'unprocessed trauma/pain';
      } else {
        underlyingPain = 'unmet emotional needs';
      }
    }

    return { detected, substance, process, function: functionDescription, underlyingPain, indicators };
  }

  private detectBodyTruth(text: string): CompassionateInquiryState['bodyTruth'] {
    let detected = false;
    let bodyKnows = false;
    let somaticConflict = false;
    const indicators: string[] = [];

    // Body knows
    if (/\b(body (knows|tells|remembers)|feel it in my body)\b/i.test(text)) {
      detected = true;
      bodyKnows = true;
      indicators.push('body-knows');
    }

    // Somatic conflict (body vs mind)
    if (/\b(body (says|feels).*but (mind|i think))\b/i.test(text) ||
        /\b(mind (says|thinks).*but (body|i feel))\b/i.test(text)) {
      detected = true;
      somaticConflict = true;
      indicators.push('somatic-conflict');
    }

    // Body doesn't lie
    if (/\b(body (doesn't|won't) lie|truth (in|is) (my )?body)\b/i.test(text)) {
      detected = true;
      bodyKnows = true;
    }

    return { detected, bodyKnows, somaticConflict, indicators };
  }

  private detectCompassionateInquiry(text: string): CompassionateInquiryState['compassionateInquiry'] {
    let active = false;
    let selfCompassion = false;
    const indicators: string[] = [];

    // Compassionate questions
    if (/\b(what (if|am i|was i)|why (do|did) i|where (does|did) (this|that) come from)\b/i.test(text)) {
      active = true;
      indicators.push('compassionate-inquiry-active');
    }

    // Self-compassion
    if (/\b(kind to myself|compassion for myself|makes sense (that|why))\b/i.test(text)) {
      selfCompassion = true;
      indicators.push('self-compassion');
    }

    return { active, selfCompassion, indicators };
  }

  private calculateElementalResonance(
    implicitEmotion: CompassionateInquiryState['implicitEmotion'],
    selfPresentation: CompassionateInquiryState['selfPresentation']
  ): CompassionateInquiryState['elementalResonance'] {
    const water = implicitEmotion.detected ? 0.8 : 0.4;
    const aether = selfPresentation.authenticSelf ? 0.8 : 0.3;
    return { water, aether };
  }
}

export const compassionateInquiryEngine = new CompassionateInquiryEngine();
