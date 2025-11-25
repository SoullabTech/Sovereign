/**
 * SCHEMA THERAPY ENGINE
 *
 * Based on Jeffrey Young's Schema Therapy
 *
 * Detects:
 * - Early Maladaptive Schemas (18 core schemas)
 * - Schema Modes (child, parent, coping modes)
 * - Schema Coping Styles (surrender, avoidance, overcompensation)
 * - Core emotional needs (unmet in childhood)
 *
 * Core Insight: Early maladaptive schemas form when core childhood needs aren't met.
 * These schemas continue operating unconsciously in adulthood.
 *
 * Elemental Resonance: EARTH (structural repair, foundations) + WATER (emotional healing)
 */

export interface SchemaTherapyState {
  detected: boolean;
  confidence: number;
  indicators: string[];

  // Early Maladaptive Schemas (organized by domain)
  schemas: {
    // DOMAIN 1: Disconnection & Rejection
    abandonment: { detected: boolean; confidence: number; indicators: string[] };
    mistrust: { detected: boolean; confidence: number; indicators: string[] };
    emotionalDeprivation: { detected: boolean; confidence: number; indicators: string[] };
    defectiveness: { detected: boolean; confidence: number; indicators: string[] };
    socialIsolation: { detected: boolean; confidence: number; indicators: string[] };

    // DOMAIN 2: Impaired Autonomy & Performance
    dependence: { detected: boolean; confidence: number; indicators: string[] };
    vulnerability: { detected: boolean; confidence: number; indicators: string[] };
    enmeshment: { detected: boolean; confidence: number; indicators: string[] };
    failure: { detected: boolean; confidence: number; indicators: string[] };

    // DOMAIN 3: Impaired Limits
    entitlement: { detected: boolean; confidence: number; indicators: string[] };
    insufficientSelfControl: { detected: boolean; confidence: number; indicators: string[] };

    // DOMAIN 4: Other-Directedness
    subjugation: { detected: boolean; confidence: number; indicators: string[] };
    selfSacrifice: { detected: boolean; confidence: number; indicators: string[] };
    approvalSeeking: { detected: boolean; confidence: number; indicators: string[] };

    // DOMAIN 5: Overvigilance & Inhibition
    negativity: { detected: boolean; confidence: number; indicators: string[] };
    emotionalInhibition: { detected: boolean; confidence: number; indicators: string[] };
    unrelentingStandards: { detected: boolean; confidence: number; indicators: string[] };
    punitiveness: { detected: boolean; confidence: number; indicators: string[] };
  };

  // Schema Modes (active states)
  modes: {
    // CHILD MODES
    vulnerableChild: boolean;
    angryChild: boolean;
    impulsiveChild: boolean;
    happyChild: boolean;

    // DYSFUNCTIONAL PARENT MODES
    punitiveParent: boolean;
    demandingParent: boolean;

    // COPING MODES
    compliantSurrenderer: boolean;
    detachedProtector: boolean;
    overcompensator: boolean;

    // HEALTHY MODES
    healthyAdult: boolean;
  };

  // Active Mode (primary mode detected)
  activeMode: {
    mode: string;
    description: string;
    intensity: number; // 0-1
  };

  // Coping Styles
  copingStyle: {
    surrender: boolean; // Giving in to schema
    avoidance: boolean; // Avoiding schema triggers
    overcompensation: boolean; // Fighting schema by doing opposite
  };

  // Unmet Core Needs (which childhood needs weren't met)
  unmetNeeds: {
    safety: boolean;
    connection: boolean;
    autonomy: boolean;
    selfEsteem: boolean;
    selfExpression: boolean;
    realisticLimits: boolean;
  };

  // Elemental resonance
  elementalResonance: {
    earth: number; // Structural repair, rebuilding foundations
    water: number; // Emotional healing, reparenting
  };
}

export class SchemaTherapyEngine {

  /**
   * Extract Schema Therapy state from text
   */
  extract(text: string): SchemaTherapyState {
    const lower = text.toLowerCase();
    const indicators: string[] = [];

    // Detect all 18 schemas
    const schemas = this.detectSchemas(lower);

    // Detect schema modes
    const modes = this.detectModes(lower);

    // Determine active mode
    const activeMode = this.determineActiveMode(modes, lower);

    // Detect coping styles
    const copingStyle = this.detectCopingStyles(lower);

    // Detect unmet core needs
    const unmetNeeds = this.detectUnmetNeeds(schemas);

    // Calculate elemental resonance
    const elementalResonance = this.calculateElementalResonance(schemas, modes);

    // Aggregate indicators
    Object.values(schemas).forEach(schema => {
      if (schema.detected) indicators.push(...schema.indicators);
    });

    const detected = indicators.length > 0;
    const confidence = detected ? 0.75 : 0;

    return {
      detected,
      confidence,
      indicators,
      schemas,
      modes,
      activeMode,
      copingStyle,
      unmetNeeds,
      elementalResonance
    };
  }

  /**
   * Detect all 18 Early Maladaptive Schemas
   */
  private detectSchemas(text: string): SchemaTherapyState['schemas'] {
    return {
      // DOMAIN 1: Disconnection & Rejection
      abandonment: this.detectSchema(text, [
        /\b(abandon|left|leave me|everyone leaves|people leave)\b/i,
        /\b(alone|can't be alone|terrified of being alone)\b/i,
        /\b(cling|clingy|desperate|need you)\b/i
      ], 'abandonment-schema'),

      mistrust: this.detectSchema(text, [
        /\b(can't trust|don't trust|trust issues|betray|betrayed)\b/i,
        /\b(people (will|always) hurt|waiting for (them|it) to hurt)\b/i,
        /\b(suspicious|paranoid|watch my back)\b/i
      ], 'mistrust-schema'),

      emotionalDeprivation: this.detectSchema(text, [
        /\b(no one (cares|understands|gets me)|nobody cares)\b/i,
        /\b(needs (don't|never) (matter|get met)|unimportant)\b/i,
        /\b(emotionally unavailable|cold|distant)\b/i
      ], 'emotional-deprivation-schema'),

      defectiveness: this.detectSchema(text, [
        /\b(defective|broken|damaged|flawed|wrong (with|inside) me)\b/i,
        /\b(if they (knew|saw) the real me|hide who i am)\b/i,
        /\b(unlovable|not worthy|don't deserve)\b/i
      ], 'defectiveness-schema'),

      socialIsolation: this.detectSchema(text, [
        /\b(don't (fit|belong)|outsider|different from everyone)\b/i,
        /\b(alien|weird|not like them)\b/i,
        /\b(isolated|alone|no one like me)\b/i
      ], 'social-isolation-schema'),

      // DOMAIN 2: Impaired Autonomy & Performance
      dependence: this.detectSchema(text, [
        /\b(can't (do|manage|handle) (it|this) (alone|myself))\b/i,
        /\b(need (someone|help)|helpless|incompetent)\b/i,
        /\b(depend|dependent|rely on)\b/i
      ], 'dependence-schema'),

      vulnerability: this.detectSchema(text, [
        /\b(something (bad|terrible) (will|is going to) happen)\b/i,
        /\b(catastrophe|disaster waiting|other shoe)\b/i,
        /\b(vulnerable|unsafe|not safe)\b/i
      ], 'vulnerability-schema'),

      enmeshment: this.detectSchema(text, [
        /\b(can't (separate|be different|have own)|merged|fused)\b/i,
        /\b(guilt.*independent|disloyal|betray.*family)\b/i,
        /\b(enmeshed|no boundaries|lose myself)\b/i
      ], 'enmeshment-schema'),

      failure: this.detectSchema(text, [
        /\b(i'm a failure|always fail|can't succeed)\b/i,
        /\b(inadequate|not (good|smart|capable) enough)\b/i,
        /\b(mess (up|everything up)|screw (up|things up))\b/i
      ], 'failure-schema'),

      // DOMAIN 3: Impaired Limits
      entitlement: this.detectSchema(text, [
        /\b(deserve (more|better)|special|rules don't apply)\b/i,
        /\b(entitled|owed|should get what i want)\b/i
      ], 'entitlement-schema'),

      insufficientSelfControl: this.detectSchema(text, [
        /\b(can't (control|stop) myself|no self-control)\b/i,
        /\b(impulsive|act without thinking)\b/i,
        /\b(can't (delay|wait)|have to (have|do) it now)\b/i
      ], 'insufficient-self-control-schema'),

      // DOMAIN 4: Other-Directedness
      subjugation: this.detectSchema(text, [
        /\b(have to|forced to|no choice)\b/i,
        /\b(controlled|control me|do what (they|others) want)\b/i,
        /\b(can't say no|my needs don't matter)\b/i
      ], 'subjugation-schema'),

      selfSacrifice: this.detectSchema(text, [
        /\b(always (give|help|take care of)|never for me)\b/i,
        /\b(sacrifice|put (them|others) first|my needs last)\b/i,
        /\b(guilty if i don't|selfish if i)\b/i
      ], 'self-sacrifice-schema'),

      approvalSeeking: this.detectSchema(text, [
        /\b(need (approval|validation|praise|recognition))\b/i,
        /\b(what (will|do) they think|people-pleasing)\b/i,
        /\b(be liked|accepted|fit in)\b/i
      ], 'approval-seeking-schema'),

      // DOMAIN 5: Overvigilance & Inhibition
      negativity: this.detectSchema(text, [
        /\b(pessimist|negative|worst.*happen)\b/i,
        /\b(focus on (the )?negative|what's wrong)\b/i,
        /\b(glass half empty|always waiting for bad)\b/i
      ], 'negativity-schema'),

      emotionalInhibition: this.detectSchema(text, [
        /\b(can't (show|express|feel)|shut down emotionally)\b/i,
        /\b(hide feelings|don't (cry|show|let))\b/i,
        /\b(control (myself|emotions)|keep it in)\b/i
      ], 'emotional-inhibition-schema'),

      unrelentingStandards: this.detectSchema(text, [
        /\b(perfect|perfectionism|never (good|enough))\b/i,
        /\b(high standards|should be (better|more))\b/i,
        /\b(relentless|driven|must achieve)\b/i
      ], 'unrelenting-standards-schema'),

      punitiveness: this.detectSchema(text, [
        /\b(punish|deserve (punishment|pain)|should suffer)\b/i,
        /\b(harsh|unforgiving|no mercy)\b/i,
        /\b(mistakes (should|must) be punished)\b/i
      ], 'punitiveness-schema')
    };
  }

  /**
   * Helper to detect individual schema
   */
  private detectSchema(
    text: string,
    patterns: RegExp[],
    indicatorLabel: string
  ): { detected: boolean; confidence: number; indicators: string[] } {
    let detected = false;
    let confidence = 0;
    const indicators: string[] = [];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        detected = true;
        confidence = Math.max(confidence, 0.7);
        indicators.push(indicatorLabel);
        break;
      }
    }

    return { detected, confidence, indicators };
  }

  /**
   * Detect Schema Modes
   */
  private detectModes(text: string): SchemaTherapyState['modes'] {
    return {
      // CHILD MODES
      vulnerableChild: /\b(scared|afraid|hurt|helpless|lost|small|tiny|little)\b/i.test(text),
      angryChild: /\b(angry|rage|furious|mad|hate|unfair)\b/i.test(text),
      impulsiveChild: /\b(want it now|can't wait|need it|have to have)\b/i.test(text),
      happyChild: /\b(playful|joy|delight|fun|happy)\b/i.test(text),

      // DYSFUNCTIONAL PARENT MODES
      punitiveParent: /\b(should|must|have to|failure|pathetic|worthless|deserve pain)\b/i.test(text),
      demandingParent: /\b(not good enough|try harder|more|better|perfect)\b/i.test(text),

      // COPING MODES
      compliantSurrenderer: /\b(whatever (you|they) want|just go along|don't fight)\b/i.test(text),
      detachedProtector: /\b(numb|shut down|disconnect|don't care|nothing)\b/i.test(text),
      overcompensator: /\b(prove|show them|never (again|be)|strong|powerful)\b/i.test(text),

      // HEALTHY MODES
      healthyAdult: /\b(balanced|reasonable|both|perspective|healthy)\b/i.test(text)
    };
  }

  /**
   * Determine the active (primary) mode
   */
  private determineActiveMode(
    modes: SchemaTherapyState['modes'],
    text: string
  ): SchemaTherapyState['activeMode'] {
    // Priority order (most urgent first)
    if (modes.vulnerableChild) {
      return {
        mode: 'Vulnerable Child',
        description: 'Feeling scared, helpless, hurt, or overwhelmed',
        intensity: 0.8
      };
    }
    if (modes.angryChild) {
      return {
        mode: 'Angry Child',
        description: 'Feeling rage, fury, or intense anger at perceived injustice',
        intensity: 0.8
      };
    }
    if (modes.punitiveParent) {
      return {
        mode: 'Punitive Parent',
        description: 'Self-attacking, self-punishing, harsh self-criticism',
        intensity: 0.9
      };
    }
    if (modes.detachedProtector) {
      return {
        mode: 'Detached Protector',
        description: 'Emotionally shut down, numb, disconnected as protection',
        intensity: 0.7
      };
    }
    if (modes.demandingParent) {
      return {
        mode: 'Demanding Parent',
        description: 'Pushing self to achieve, never good enough',
        intensity: 0.7
      };
    }
    if (modes.overcompensator) {
      return {
        mode: 'Overcompensator',
        description: 'Fighting schema by doing the opposite (proving worthiness)',
        intensity: 0.6
      };
    }
    if (modes.healthyAdult) {
      return {
        mode: 'Healthy Adult',
        description: 'Balanced, rational, caring adult perspective',
        intensity: 0.7
      };
    }

    return {
      mode: 'Unknown',
      description: 'No clear mode detected',
      intensity: 0.3
    };
  }

  /**
   * Detect Schema Coping Styles
   */
  private detectCopingStyles(text: string): SchemaTherapyState['copingStyle'] {
    return {
      // SURRENDER (giving in to schema)
      surrender: /\b(always happens|i knew it|of course|give up|accept it)\b/i.test(text),

      // AVOIDANCE (avoiding triggers)
      avoidance: /\b(avoid|stay away|don't (go|do|try)|safer not to)\b/i.test(text),

      // OVERCOMPENSATION (fighting schema by doing opposite)
      overcompensation: /\b(prove|show|never again|be perfect|be strong)\b/i.test(text)
    };
  }

  /**
   * Detect which core needs went unmet
   */
  private detectUnmetNeeds(schemas: SchemaTherapyState['schemas']): SchemaTherapyState['unmetNeeds'] {
    return {
      safety: schemas.abandonment.detected || schemas.mistrust.detected || schemas.vulnerability.detected,
      connection: schemas.emotionalDeprivation.detected || schemas.defectiveness.detected || schemas.socialIsolation.detected,
      autonomy: schemas.dependence.detected || schemas.enmeshment.detected || schemas.vulnerability.detected,
      selfEsteem: schemas.defectiveness.detected || schemas.failure.detected,
      selfExpression: schemas.emotionalInhibition.detected || schemas.subjugation.detected,
      realisticLimits: schemas.entitlement.detected || schemas.insufficientSelfControl.detected
    };
  }

  /**
   * Calculate elemental resonance
   */
  private calculateElementalResonance(
    schemas: SchemaTherapyState['schemas'],
    modes: SchemaTherapyState['modes']
  ): SchemaTherapyState['elementalResonance'] {
    // Count activated schemas (structural issues)
    const schemaCount = Object.values(schemas).filter(s => s.detected).length;

    // EARTH = Structural repair (rebuilding early foundations)
    const earth = schemaCount > 0 ? 0.8 : 0.3;

    // WATER = Emotional healing (reparenting vulnerable child)
    const water = modes.vulnerableChild || modes.angryChild ? 0.8 : 0.4;

    return { earth, water };
  }
}

// Singleton instance
export const schemaTherapyEngine = new SchemaTherapyEngine();
