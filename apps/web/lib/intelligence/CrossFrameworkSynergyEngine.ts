/**
 * CROSS-FRAMEWORK SYNERGY DETECTION ENGINE
 *
 * Detects transformation signatures when 3+ frameworks align
 * Creates clinically meaningful patterns across the complete 9-framework stack
 *
 * BASIC SIGNATURES: 3-4 frameworks (10 patterns)
 * ADVANCED SIGNATURES: 5-6 frameworks (5 patterns) ← NEW!
 * ULTRA-RARE SIGNATURES: 7-9 frameworks (4 patterns) ← NEW!
 *
 * Purpose: Move from single-framework detection to multi-framework intelligence
 * Evolution: From basic patterns to ultra-precise advanced signatures
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import { advancedSynergyEngine } from './AdvancedSynergyEngine';

export interface TransformationSignature {
  name: string;
  description: string;
  frameworks: string[]; // Which frameworks contributed
  frameworkCount: number; // How many frameworks align (3-9)
  complexity: 'basic' | 'advanced' | 'ultra-rare'; // Pattern complexity
  confidence: number; // Overall pattern confidence
  clinicalMeaning: string; // What this means clinically
  therapeuticFocus: string; // What to work with
  interventions: string[]; // Recommended approaches
  urgency: 'critical' | 'high' | 'moderate' | 'low';
}

export class CrossFrameworkSynergyEngine {

  /**
   * Detect transformation signatures from extraction results
   */
  detectSynergies(extraction: ExtractionResult): TransformationSignature[] {
    const signatures: TransformationSignature[] = [];

    // Pattern 1: Complete Shutdown
    const shutdownSignature = this.detectCompleteShutdown(extraction);
    if (shutdownSignature) signatures.push(shutdownSignature);

    // Pattern 2: Trapped Fight
    const trappedFightSignature = this.detectTrappedFight(extraction);
    if (trappedFightSignature) signatures.push(trappedFightSignature);

    // Pattern 3: Trapped Flight
    const trappedFlightSignature = this.detectTrappedFlight(extraction);
    if (trappedFlightSignature) signatures.push(trappedFlightSignature);

    // Pattern 4: Introjection Spiral
    const introjectionSpiralSignature = this.detectIntrojectionSpiral(extraction);
    if (introjectionSpiralSignature) signatures.push(introjectionSpiralSignature);

    // Pattern 5: Shadow Projection Loop
    const shadowProjectionSignature = this.detectShadowProjectionLoop(extraction);
    if (shadowProjectionSignature) signatures.push(shadowProjectionSignature);

    // Pattern 6: Parts Protector Storm
    const protectorStormSignature = this.detectProtectorStorm(extraction);
    if (protectorStormSignature) signatures.push(protectorStormSignature);

    // Pattern 7: Integration Readiness
    const integrationReadinessSignature = this.detectIntegrationReadiness(extraction);
    if (integrationReadinessSignature) signatures.push(integrationReadinessSignature);

    // Pattern 8: Morphogenetic Breakthrough
    const breakthroughSignature = this.detectMorphogeneticBreakthrough(extraction);
    if (breakthroughSignature) signatures.push(breakthroughSignature);

    // Pattern 9: Triple Body Freeze
    const tripleBodyFreezeSignature = this.detectTripleBodyFreeze(extraction);
    if (tripleBodyFreezeSignature) signatures.push(tripleBodyFreezeSignature);

    // Pattern 10: Hyperarousal Cascade
    const hyperarousalCascadeSignature = this.detectHyperarousalCascade(extraction);
    if (hyperarousalCascadeSignature) signatures.push(hyperarousalCascadeSignature);

    // ========================================================================
    // PHASE 4 PATTERNS (Modern Therapeutic Mandala Synergies) 🔥
    // ========================================================================

    // Pattern 11: Values-Action Chasm
    const valuesActionChasmSignature = this.detectValuesActionChasm(extraction);
    if (valuesActionChasmSignature) signatures.push(valuesActionChasmSignature);

    // Pattern 12: Self-Attack Cascade
    const selfAttackCascadeSignature = this.detectSelfAttackCascade(extraction);
    if (selfAttackCascadeSignature) signatures.push(selfAttackCascadeSignature);

    // Pattern 13: Meaning Breakthrough Integration
    const meaningBreakthroughSignature = this.detectMeaningBreakthroughIntegration(extraction);
    if (meaningBreakthroughSignature) signatures.push(meaningBreakthroughSignature);

    // Pattern 14: Schema Activation Cascade
    const schemaActivationSignature = this.detectSchemaActivationCascade(extraction);
    if (schemaActivationSignature) signatures.push(schemaActivationSignature);

    // Pattern 15: DBT Skills Crisis
    const dbtSkillsCrisisSignature = this.detectDBTSkillsCrisis(extraction);
    if (dbtSkillsCrisisSignature) signatures.push(dbtSkillsCrisisSignature);

    // Pattern 16: Compassion System Offline
    const compassionOfflineSignature = this.detectCompassionSystemOffline(extraction);
    if (compassionOfflineSignature) signatures.push(compassionOfflineSignature);

    // Pattern 17: Ecological Overwhelm
    const ecologicalOverwhelmSignature = this.detectEcologicalOverwhelm(extraction);
    if (ecologicalOverwhelmSignature) signatures.push(ecologicalOverwhelmSignature);

    // Pattern 18: Cognitive Fusion Trap
    const cognitiveFusionSignature = this.detectCognitiveFusionTrap(extraction);
    if (cognitiveFusionSignature) signatures.push(cognitiveFusionSignature);

    // ========================================================================
    // ADVANCED SYNERGY ENGINE (5-9 Frameworks)
    // ========================================================================
    // The advanced engine detects high-complexity patterns (5-9 framework combinations)
    const advancedSignatures = advancedSynergyEngine.detectAdvancedSynergies(extraction);
    signatures.push(...advancedSignatures);

    return signatures;
  }

  /**
   * PATTERN 1: Complete Shutdown
   * Alchemy Nigredo + Polyvagal Dorsal + Levine Freeze + Gestalt Retroflection
   */
  private detectCompleteShutdown(extraction: ExtractionResult): TransformationSignature | null {
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;

    if (hasNigredo && hasDorsal && hasFreeze && hasRetroflection) {
      return {
        name: 'Complete Shutdown Pattern',
        description: 'Nigredo dissolution + dorsal shutdown + freeze response + retroflection (turning inward)',
        frameworks: ['Alchemy', 'Polyvagal', 'Levine', 'Gestalt'],
        frameworkCount: 4,
        complexity: 'basic' as const,
        confidence: 0.95,
        clinicalMeaning: 'The person is in complete protective shutdown. Alchemical dissolution (Nigredo) has triggered dorsal vagal immobilization, creating a freeze response that\'s now being turned inward against the self (retroflection). This is the most defended state.',
        therapeuticFocus: 'Gentle activation from freeze, normalize shutdown as protective, micro-movements only',
        interventions: [
          'PRIORITY: Co-regulate and provide safety',
          'Normalize shutdown as protective (not pathologize)',
          'Levine: Gentle thaw from freeze (micro-movements, sensation tracking)',
          'Gestalt: Notice retroflection without forcing outward direction',
          'Alchemy: Honor Nigredo - do NOT push for integration',
          'Polyvagal: Tiny steps toward ventral (safety cues, co-regulation)'
        ],
        urgency: 'critical'
      };
    }

    return null;
  }

  /**
   * PATTERN 2: Trapped Fight
   * Levine Fight + Gestalt Retroflection + Polyvagal Sympathetic + McGilchrist Left
   */
  private detectTrappedFight(extraction: ExtractionResult): TransformationSignature | null {
    const hasFight = extraction.somaticState?.incompleteResponse.type === 'fight';
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';
    const hasLeftDominant = extraction.hemisphericMode?.dominant === 'left' ||
                           extraction.hemisphericMode?.indicators.some(i => i.startsWith('left-'));

    if (hasFight && hasRetroflection && (hasSympathetic || hasLeftDominant)) {
      return {
        name: 'Trapped Fight Response',
        description: 'Incomplete fight response + retroflection + sympathetic activation OR left-brain control',
        frameworks: ['Levine', 'Gestalt', 'Polyvagal', 'McGilchrist'],
        confidence: 0.88,
        clinicalMeaning: 'The body mobilized for fight, but the action was turned inward against the self (retroflection). The nervous system is activated (sympathetic) but the impulse can\'t complete outward. Left-brain may be trying to control the rage.',
        therapeuticFocus: 'Complete the fight response safely, redirect retroflection outward',
        interventions: [
          'Levine: Complete fight through contained expression (jaw, shoulders, pushing)',
          'Gestalt: Notice retroflection → experiment with outward direction',
          'Use pillow/empty chair for safe fight completion',
          'Track jaw clenching, shoulder tension',
          'Voice the "no" (even whispered)',
          'Allow discharge (trembling, shaking)'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 3: Trapped Flight
   * Levine Flight + Gestalt Introjection + Polyvagal Sympathetic
   */
  private detectTrappedFlight(extraction: ExtractionResult): TransformationSignature | null {
    const hasFlight = extraction.somaticState?.incompleteResponse.type === 'flight';
    const hasIntrojection = extraction.gestaltState?.contactDisturbances.introjection.detected;
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';

    if (hasFlight && hasIntrojection && hasSympathetic) {
      return {
        name: 'Trapped Flight Response',
        description: 'Incomplete flight response + introjection ("should be strong") + sympathetic activation',
        frameworks: ['Levine', 'Gestalt', 'Polyvagal'],
        confidence: 0.85,
        clinicalMeaning: 'The nervous system mobilized for escape (sympathetic), the body wants to run (flight), but introjected beliefs ("I should handle this," "I must be strong") prevent the escape from completing. The person is stuck with trapped flight energy.',
        therapeuticFocus: 'Question introjections, complete flight response, discharge trapped energy',
        interventions: [
          'Gestalt: Identify and question introjections ("whose voice is that?")',
          'Levine: Complete flight through leg activation (pedaling, slow running)',
          'Orient to exits (you CAN leave if needed)',
          'Track restless leg energy',
          'Micro-movements: feet pressing, legs engaging',
          'Challenge "should" statements that block escape'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 4: Introjection Spiral
   * Gestalt Introjection + IFS Manager Parts + McGilchrist Left + Jung Persona
   */
  private detectIntrojectionSpiral(extraction: ExtractionResult): TransformationSignature | null {
    const hasIntrojection = extraction.gestaltState?.contactDisturbances.introjection.detected;
    const hasManagerParts = extraction.ifsParts?.parts.some(p => p.type === 'manager');
    const hasLeftDominant = extraction.hemisphericMode?.dominant === 'left' ||
                           extraction.hemisphericMode?.indicators.some(i => i.startsWith('left-'));

    if (hasIntrojection && hasManagerParts && hasLeftDominant) {
      return {
        name: 'Introjection Spiral',
        description: 'Introjected "shoulds" + manager parts enforcing rules + left-brain rigid control',
        frameworks: ['Gestalt', 'IFS', 'McGilchrist', 'Jung'],
        confidence: 0.82,
        clinicalMeaning: 'Swallowed beliefs (introjections) have been internalized by manager parts that rigidly enforce external rules. Left hemisphere provides analytical justification for the "shoulds." The persona (social mask) may be heavily defended. This creates a rigid, rule-bound system.',
        therapeuticFocus: 'Question introjections, dialogue with manager parts, invite right-hemisphere',
        interventions: [
          'Gestalt: Digestion process (list shoulds → whose voice? → keep or spit out)',
          'IFS: Dialogue with managers ("What are you protecting?")',
          'McGilchrist: Invite right hemisphere (embodied, relational, contextual)',
          'Jung: Notice persona vs authentic self',
          'Challenge "good people" narratives',
          'Convert "I should" → "I choose to" or reject'
        ],
        urgency: 'moderate'
      };
    }

    return null;
  }

  /**
   * PATTERN 5: Shadow Projection Loop
   * Jung Shadow + Gestalt Projection + IFS Exile
   */
  private detectShadowProjectionLoop(extraction: ExtractionResult): TransformationSignature | null {
    const hasShadow = extraction.jungianProcess?.shadowWork;
    const hasProjection = extraction.gestaltState?.contactDisturbances.projection.detected;
    const hasExile = extraction.ifsParts?.parts.some(p => p.type === 'exile');

    if (hasShadow && hasProjection && hasExile) {
      return {
        name: 'Shadow Projection Loop',
        description: 'Shadow material + projection onto others + exiled parts',
        frameworks: ['Jung', 'Gestalt', 'IFS'],
        confidence: 0.80,
        clinicalMeaning: 'Disowned parts (shadow, exiles) are being projected onto others instead of owned internally. The Gestalt projection mechanism is carrying Jungian shadow material and IFS exiled parts. What\'s judged "out there" is disowned "in here."',
        therapeuticFocus: 'Reclaim projections, dialogue with exiles, integrate shadow',
        interventions: [
          'Gestalt: Reclaim projections ("I am what I judge in you")',
          'Jung: Shadow integration (own disowned qualities)',
          'IFS: Unburden exiles (what do they carry?)',
          'Notice: Strong judgments = shadow signals',
          'Experiment: "I am [quality I judge]" - where does it live in me?',
          'Paradox: Owning projection reduces its charge'
        ],
        urgency: 'moderate'
      };
    }

    return null;
  }

  /**
   * PATTERN 6: Protector Storm
   * IFS Managers + Firefighters + Polyvagal Sympathetic + Alchemy Nigredo
   */
  private detectProtectorStorm(extraction: ExtractionResult): TransformationSignature | null {
    const hasManagers = extraction.ifsParts?.parts.some(p => p.type === 'manager');
    const hasFirefighters = extraction.ifsParts?.parts.some(p => p.type === 'firefighter');
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';

    if (hasManagers && hasFirefighters && (hasSympathetic || hasNigredo)) {
      return {
        name: 'Protector Storm',
        description: 'Manager + firefighter parts both active + sympathetic OR nigredo chaos',
        frameworks: ['IFS', 'Polyvagal', 'Alchemy'],
        confidence: 0.85,
        clinicalMeaning: 'The system is in protective overdrive. Managers are trying to control, firefighters are trying to distract/escape, and the nervous system is activated (sympathetic) or dissolving (Nigredo). This means exiles are close to the surface and all protectors are mobilized.',
        therapeuticFocus: 'Respect protectors, create safety for Self to emerge',
        interventions: [
          'IFS: Appreciate protectors ("Thank you for trying to help")',
          'Ask managers: "What are you afraid will happen if you relax?"',
          'Ask firefighters: "What pain are you distracting from?"',
          'Don\'t force exile work yet - too much protector activation',
          'Build safety, invite Self energy',
          'Polyvagal: Co-regulate to calm sympathetic'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 7: Integration Readiness
   * Alchemy Citrinitas/Rubedo + Polyvagal Ventral + IFS Self-Led + Jung Individuation
   */
  private detectIntegrationReadiness(extraction: ExtractionResult): TransformationSignature | null {
    const hasHighCoherence = (extraction.alchemicalStage?.primaryStage === 'citrinitas' ||
                             extraction.alchemicalStage?.primaryStage === 'rubedo');
    const hasVentral = extraction.polyvagalState?.state === 'ventral';
    const hasSelfEnergy = extraction.ifsParts?.selfEnergy && extraction.ifsParts.selfEnergy > 0.6;
    const hasIndividuation = extraction.jungianProcess?.individuation;

    if ((hasHighCoherence || hasVentral) && (hasSelfEnergy || hasIndividuation)) {
      return {
        name: 'Integration Readiness',
        description: 'High coherence (Citrinitas/Rubedo) + ventral OR Self energy + individuation',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung'],
        confidence: 0.90,
        clinicalMeaning: 'The system is in a highly integrated state. Alchemical integration (Citrinitas/Rubedo), nervous system safety (ventral), Self energy present, and active individuation all indicate readiness for deep transformation work.',
        therapeuticFocus: 'Facilitate integration, support synthesis, celebrate progress',
        interventions: [
          'Alchemy: Support Coniunctio (union of opposites)',
          'Jung: Deepen individuation work',
          'IFS: Self-led exploration, unburden exiles',
          'Polyvagal: Expand ventral capacity',
          'Gestalt: High-quality contact experiments',
          'This is the OPTIMAL state for transformation'
        ],
        urgency: 'low'
      };
    }

    return null;
  }

  /**
   * PATTERN 8: Morphogenetic Breakthrough
   * Levin Field Emergence + Alchemy Rubedo + High Coherence
   */
  private detectMorphogeneticBreakthrough(extraction: ExtractionResult): TransformationSignature | null {
    const hasFieldEmergence = extraction.narrativeThemes.includes('Morphogenetic Emergence');
    const hasRubedo = extraction.alchemicalStage?.primaryStage === 'rubedo';
    const hasHighCoherence = extraction.alchemicalStage?.coherence && extraction.alchemicalStage.coherence > 0.8;

    if (hasFieldEmergence && (hasRubedo || hasHighCoherence)) {
      return {
        name: 'Morphogenetic Breakthrough',
        description: 'Bioelectric field emergence + Rubedo embodiment + high coherence',
        frameworks: ['Levin', 'Alchemy'],
        confidence: 0.85,
        clinicalMeaning: 'A fundamental reorganization is happening at the bioelectric/morphogenetic level. The field is restructuring coherently (Levin), transformation is embodying (Rubedo), and coherence is high. This represents a quantum leap in consciousness.',
        therapeuticFocus: 'Support field reorganization, anchor new coherence, celebrate emergence',
        interventions: [
          'Levin: Honor bioelectric reorganization',
          'Alchemy: Celebrate Rubedo embodiment',
          'Anchor new coherence in body and life',
          'This is RARE - deep transformation completing',
          'Support Multiplicatio (expansion)',
          'Prepare for next spiral at higher octave'
        ],
        urgency: 'low'
      };
    }

    return null;
  }

  /**
   * PATTERN 9: Triple Body Freeze
   * Polyvagal Dorsal + Levine Freeze + Gestalt Confluence
   */
  private detectTripleBodyFreeze(extraction: ExtractionResult): TransformationSignature | null {
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasConfluence = extraction.gestaltState?.contactDisturbances.confluence.detected;

    if (hasDorsal && hasFreeze && hasConfluence) {
      return {
        name: 'Triple Body Freeze',
        description: 'Dorsal shutdown + freeze response + confluence (boundary loss)',
        frameworks: ['Polyvagal', 'Levine', 'Gestalt'],
        confidence: 0.87,
        clinicalMeaning: 'The body is frozen at three levels: nervous system (dorsal), survival response (freeze), and awareness (confluence/boundary dissolution). This is profound immobilization where even the sense of "I" vs "other" is lost.',
        therapeuticFocus: 'Gentle activation, boundary clarification, titrated thaw',
        interventions: [
          'Polyvagal: Co-regulate, provide safety',
          'Levine: Gentle freeze thaw (micro-movements, pendulation)',
          'Gestalt: Clarify boundaries ("Where do I end?")',
          'Track ANY sensation (even numbness has quality)',
          'Orient to present (reduce dissociation)',
          'NO pushing - respect the protection'
        ],
        urgency: 'critical'
      };
    }

    return null;
  }

  /**
   * PATTERN 10: Hyperarousal Cascade
   * Polyvagal Sympathetic + Levine Fight/Flight + McGilchrist Right + Alchemy Nigredo
   */
  private detectHyperarousalCascade(extraction: ExtractionResult): TransformationSignature | null {
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';
    const hasMobilization = extraction.somaticState?.incompleteResponse.type === 'fight' ||
                           extraction.somaticState?.incompleteResponse.type === 'flight';
    const hasRightDominant = extraction.hemisphericMode?.dominant === 'right' ||
                            extraction.hemisphericMode?.indicators.some(i => i.startsWith('right-'));
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';

    if (hasSympathetic && hasMobilization && (hasRightDominant || hasNigredo)) {
      return {
        name: 'Hyperarousal Cascade',
        description: 'Sympathetic activation + fight/flight response + right-hemisphere OR Nigredo',
        frameworks: ['Polyvagal', 'Levine', 'McGilchrist', 'Alchemy'],
        confidence: 0.83,
        clinicalMeaning: 'The system is in full mobilization: sympathetic nervous system active, fight or flight response engaged, possibly overwhelmed by right-hemisphere emotional/embodied experience, potentially in Nigredo dissolution. This is hyperarousal that could cascade into overwhelm.',
        therapeuticFocus: 'Pendulation to resource, grounding, slow the activation',
        interventions: [
          'PRIORITY: Pendulate to resource (safe memory, place, person)',
          'Polyvagal: Activate vagal brake (slow exhale)',
          'Levine: Track discharge without pushing',
          'Ground through feet/sit bones',
          'Orient to present safety',
          'If Nigredo: Normalize chaos, don\'t process yet',
          'Small doses - titrate activation'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * Get the highest priority signature (most urgent + highest confidence)
   */
  getTopSignature(signatures: TransformationSignature[]): TransformationSignature | null {
    if (signatures.length === 0) return null;

    const urgencyRank = { critical: 4, high: 3, moderate: 2, low: 1 };

    return signatures.sort((a, b) => {
      // First sort by urgency
      const urgencyDiff = urgencyRank[b.urgency] - urgencyRank[a.urgency];
      if (urgencyDiff !== 0) return urgencyDiff;

      // Then by confidence
      return b.confidence - a.confidence;
    })[0];
  }

  // ========================================================================
  // PHASE 4 SYNERGY PATTERNS (Modern Therapeutic Mandala) 🔥
  // ========================================================================

  /**
   * PATTERN 11: Values-Action Chasm
   * ACT (low values-action alignment) + Existential (meaning crisis) + Somatic (freeze) + Polyvagal (dorsal)
   */
  private detectValuesActionChasm(extraction: ExtractionResult): TransformationSignature | null {
    const hasValuesClarity = extraction.actState?.hexaflex.values.clarity && extraction.actState.hexaflex.values.clarity > 0.6;
    const hasLowAction = extraction.actState?.hexaflex.committedAction.level && extraction.actState.hexaflex.committedAction.level < 0.4;
    const hasMeaningCrisis = extraction.existentialState?.existentialGivens.meaninglessness.detected;
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';

    if (hasValuesClarity && hasLowAction && (hasMeaningCrisis || hasFreeze || hasDorsal)) {
      return {
        name: 'Values-Action Chasm',
        description: 'Clear values but inability to act toward them (knowing-doing gap)',
        frameworks: ['ACT', 'Existential', 'Somatic', 'Polyvagal'],
        frameworkCount: 4,
        complexity: 'basic',
        confidence: 0.85,
        clinicalMeaning: 'Person knows what matters but nervous system immobilization prevents movement toward values. Existential clarity blocked by physiological shutdown.',
        therapeuticFocus: 'Gentle nervous system thaw before expecting committed action',
        interventions: [
          'ACT: Micro-commitments (tiny values-aligned actions)',
          'Somatic: Gentle thaw from freeze state',
          'Polyvagal: Safety and co-regulation before action',
          'Existential: Reframe inaction as meaning crisis, not moral failure',
          'Start with: "What is the smallest possible step toward what matters?"'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 12: Self-Attack Cascade
   * CFT (threat dominant) + Schema (Punitive Parent) + Gestalt (retroflection) + IFS (manager/firefighter war)
   */
  private detectSelfAttackCascade(extraction: ExtractionResult): TransformationSignature | null {
    const hasThreatDominant = extraction.cftState?.systemBalance.imbalance === 'threat-dominant';
    const hasPunitiveParent = extraction.schemaTherapyState?.modes.punitiveParent;
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;
    const hasPartsWar = extraction.ifsParts?.parts.length && extraction.ifsParts.parts.length > 2;

    if ((hasThreatDominant || hasPunitiveParent) && hasRetroflection && hasPartsWar) {
      return {
        name: 'Self-Attack Cascade',
        description: 'Multiple systems attacking the self simultaneously',
        frameworks: ['CFT', 'Schema Therapy', 'Gestalt', 'IFS'],
        frameworkCount: 4,
        complexity: 'basic',
        confidence: 0.9,
        clinicalMeaning: 'Threat system hijacked, punitive parent mode active, anger turned inward, parts fighting each other. Compassion system completely offline.',
        therapeuticFocus: 'Rebuild soothing system, soften punitive parent, redirect retroflection outward',
        interventions: [
          'PRIORITY: Interrupt self-attack cycle',
          'CFT: Compassionate other imagery, rebuild soothing system',
          'Schema: Reparent Punitive Parent mode (limited reparenting)',
          'Gestalt: Redirect retroflection - whose anger is this really for?',
          'IFS: Unblend from attacking parts, access Self-energy',
          'Key question: "What if this harsh voice isn\'t helping?"'
        ],
        urgency: 'critical'
      };
    }

    return null;
  }

  /**
   * PATTERN 13: Meaning Breakthrough Integration
   * Existential (purpose clarity) + Alchemy (Citrinitas) + ACT (values clarity) + Polyvagal (ventral) + IFS (Self-energy)
   */
  private detectMeaningBreakthroughIntegration(extraction: ExtractionResult): TransformationSignature | null {
    const hasMeaningClarity = extraction.existentialState?.meaning.clarity && extraction.existentialState.meaning.clarity > 0.7;
    const hasCitrinitas = extraction.alchemicalStage?.primaryStage === 'citrinitas';
    const hasValuesClarity = extraction.actState?.hexaflex.values.clarity && extraction.actState.hexaflex.values.clarity > 0.7;
    const hasVentral = extraction.polyvagalState?.state === 'ventral';
    const hasSelfEnergy = extraction.ifsParts?.selfEnergy;

    if ((hasMeaningClarity || hasCitrinitas) && hasValuesClarity && (hasVentral || hasSelfEnergy)) {
      return {
        name: 'Meaning Breakthrough Integration',
        description: 'Optimal integration state - meaning clear, nervous system safe, Self present',
        frameworks: ['Existential', 'Alchemy', 'ACT', 'Polyvagal', 'IFS'],
        frameworkCount: 5,
        complexity: 'advanced',
        confidence: 0.95,
        clinicalMeaning: 'Peak integration moment. Meaning and values are clear, nervous system feels safe, Self-energy is present, alchemical synthesis happening. This is readiness for embodied action.',
        therapeuticFocus: 'Harvest insights, translate into committed action, celebrate integration',
        interventions: [
          'Existential: Explore existential commitments emerging',
          'ACT: Translate values into specific committed actions',
          'Alchemy: Support Citrinitas integration (dawn breaking after darkness)',
          'IFS: Let Self lead the integration process',
          'CELEBRATE: This is a pivotal moment - acknowledge the transformation',
          'Question: "What wants to be born from this clarity?"'
        ],
        urgency: 'moderate'
      };
    }

    return null;
  }

  /**
   * PATTERN 14: Schema Activation Cascade
   * Schema (early schema triggered) + NARM (developmental trauma) + Constellation (ancestral pattern) + Somatic (collapse)
   */
  private detectSchemaActivationCascade(extraction: ExtractionResult): TransformationSignature | null {
    const hasSchemaActive = extraction.schemaTherapyState?.detected;
    const hasNARMPattern = extraction.narmState?.survivalStyles &&
      Object.values(extraction.narmState.survivalStyles).some(style => style.detected);
    const hasConstellationPattern = extraction.constellationState?.systemicEntanglement.detected ||
      extraction.constellationState?.transgenerationalPattern.detected;
    const hasSomaticCollapse = extraction.somaticState?.arousal.state === 'hypoarousal';

    if (hasSchemaActive && hasNARMPattern && hasConstellationPattern && hasSomaticCollapse) {
      return {
        name: 'Schema Activation Cascade',
        description: 'Present trigger activates early schema, touching developmental wound, connecting to ancestral pattern',
        frameworks: ['Schema Therapy', 'NARM', 'Constellation', 'Somatic'],
        frameworkCount: 4,
        complexity: 'basic',
        confidence: 0.85,
        clinicalMeaning: 'Multi-generational pain collapsing into the body. Present-day event triggered early maladaptive schema, which activated developmental survival pattern, which resonates with family-of-origin/ancestral trauma. This is deep, layered work.',
        therapeuticFocus: 'Titrate carefully, distinguish past from present, maintain dual awareness',
        interventions: [
          'SLOW DOWN: This is deep, multi-layered trauma activation',
          'Schema: Limited reparenting, imagery rescripting for early wound',
          'NARM: Stay connected while contacting pain (don\'t dissociate)',
          'Constellation: Acknowledge systemic/ancestral origins without collapsing',
          'Somatic: Pendulate between resource and activation, titrate carefully',
          'Key: "This belongs to multiple timelines - we\'ll sort them gently"'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 15: DBT Skills Crisis
   * DBT (low distress tolerance) + Polyvagal (sympathetic storm) + Somatic (incomplete fight/flight) + Gestalt (deflection)
   */
  private detectDBTSkillsCrisis(extraction: ExtractionResult): TransformationSignature | null {
    const hasLowDistressTolerance = extraction.dbtState?.distressTolerance.inCrisis;
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';
    const hasIncompleteResponse = extraction.somaticState?.incompleteResponse.detected &&
      (extraction.somaticState.incompleteResponse.type === 'fight' || extraction.somaticState.incompleteResponse.type === 'flight');
    const hasDeflection = extraction.gestaltState?.contactDisturbances.deflection.detected;

    if (hasLowDistressTolerance && hasSympathetic && (hasIncompleteResponse || hasDeflection)) {
      return {
        name: 'DBT Skills Crisis',
        description: 'Overwhelming emotion, no regulation skills, nervous system flooded',
        frameworks: ['DBT', 'Polyvagal', 'Somatic', 'Gestalt'],
        frameworkCount: 4,
        complexity: 'basic',
        confidence: 0.88,
        clinicalMeaning: 'Person is in emotional crisis with limited distress tolerance skills, nervous system in sympathetic activation, can\'t complete fight/flight response, deflecting from present moment. This is acute dysregulation.',
        therapeuticFocus: 'Crisis intervention, distress tolerance > emotion regulation',
        interventions: [
          'IMMEDIATE: TIPP skills (Temperature, Intense exercise, Paced breathing, Paired muscle)',
          'DBT: Distress tolerance skills BEFORE emotion regulation',
          'Polyvagal: Co-regulate (your calm nervous system helps theirs)',
          'Somatic: Help complete incomplete survival response if appropriate',
          'Gestalt: Gentle return to present when they can tolerate it',
          'Not the time for: insight, processing, or deep work'
        ],
        urgency: 'critical'
      };
    }

    return null;
  }

  /**
   * PATTERN 16: Compassion System Offline
   * CFT (soothing system deficient) + Schema (defectiveness) + Compassionate Inquiry (shame masking need)
   */
  private detectCompassionSystemOffline(extraction: ExtractionResult): TransformationSignature | null {
    const hasSoothingDeficit = extraction.cftState?.threeSystems.soothing.level && extraction.cftState.threeSystems.soothing.level < 0.3;
    const hasDefectivenessSchema = extraction.schemaTherapyState?.schemas.defectiveness.detected;
    const hasShamePresent = extraction.compassionateInquiryState?.implicitEmotion.implicitEmotion.includes('shame') ||
      extraction.cftState?.shame.detected;

    if (hasSoothingDeficit && (hasDefectivenessSchema || hasShamePresent)) {
      return {
        name: 'Compassion System Offline',
        description: 'Complete inability to self-soothe or access self-compassion',
        frameworks: ['CFT', 'Schema Therapy', 'Compassionate Inquiry'],
        frameworkCount: 3,
        complexity: 'basic',
        confidence: 0.82,
        clinicalMeaning: 'Soothing system severely under-developed, likely from early emotional deprivation. Defectiveness schema creates shame barrier to self-compassion. Cannot access kindness toward self.',
        therapeuticFocus: 'Slowly, gently rebuild capacity for self-soothing',
        interventions: [
          'CFT: Start with compassionate OTHER imagery (not self yet)',
          'CFT: Soothing rhythm breathing, safe place imagery',
          'Schema: Address "I don\'t deserve compassion" belief',
          'Compassionate Inquiry: "What if the harshness learned to protect you?"',
          'SLOW: Don\'t rush to self-compassion - build soothing capacity first',
          'Key: External sources of soothing before internal'
        ],
        urgency: 'high'
      };
    }

    return null;
  }

  /**
   * PATTERN 17: Ecological Overwhelm
   * Eco-Therapy (ecological grief + overwhelm) + Existential (meaninglessness) + Polyvagal (dorsal)
   */
  private detectEcologicalOverwhelm(extraction: ExtractionResult): TransformationSignature | null {
    const hasEcoGrief = extraction.ecoTherapyState?.ecologicalGrief.detected;
    const hasOverwhelm = extraction.ecoTherapyState?.ecologicalGrief.overwhelm;
    const hasMeaningCrisis = extraction.existentialState?.existentialGivens.meaninglessness.detected;
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';

    if (hasEcoGrief && hasOverwhelm && (hasMeaningCrisis || hasDorsal)) {
      return {
        name: 'Ecological Overwhelm',
        description: 'Climate/ecological grief triggering existential shutdown',
        frameworks: ['Eco-Therapy', 'Existential', 'Polyvagal'],
        frameworkCount: 3,
        complexity: 'basic',
        confidence: 0.78,
        clinicalMeaning: 'Ecological grief (species loss, climate anxiety, habitat destruction) overwhelming capacity to cope, triggering existential meaninglessness and nervous system shutdown. The scale of planetary loss is activating freeze response.',
        therapeuticFocus: 'Titrate grief, restore agency, reconnect to what can be done',
        interventions: [
          'Eco-Therapy: Connect to living nature (even small - a plant, a tree)',
          'Existential: Find meaning IN the grief and response',
          'Polyvagal: Co-regulation, restore safety to feel without collapsing',
          'ACT: Values-based action (even tiny) restores agency',
          'Key: "Your grief is a sign of your love. What does love do?"',
          'Avoid: Toxic positivity or minimizing the real crisis'
        ],
        urgency: 'moderate'
      };
    }

    return null;
  }

  /**
   * PATTERN 18: Cognitive Fusion Trap
   * ACT (high fusion) + CBT (cognitive distortions) + Schema (negative cognitions) + IFS (blended with part)
   */
  private detectCognitiveFusionTrap(extraction: ExtractionResult): TransformationSignature | null {
    const hasFusion = extraction.actState?.cognitiveFusion.detected && extraction.actState.cognitiveFusion.literality > 0.7;
    const hasDistortions = extraction.cbtState?.cognitiveDistortions &&
      Object.values(extraction.cbtState.cognitiveDistortions).filter(Boolean).length >= 3;
    const hasNegativeCognitions = extraction.schemaTherapyState?.shameIdentifications?.detected;
    const hasBlending = extraction.ifsParts?.parts.some(p => p.indicator.includes('blended'));

    if (hasFusion && (hasDistortions || hasNegativeCognitions || hasBlending)) {
      return {
        name: 'Cognitive Fusion Trap',
        description: 'Completely fused with negative thoughts, treating them as literal truth',
        frameworks: ['ACT', 'CBT', 'Schema Therapy', 'IFS'],
        frameworkCount: 4,
        complexity: 'basic',
        confidence: 0.87,
        clinicalMeaning: 'Person is completely blended with negative cognitive content, experiencing thoughts as unquestionable facts. Multiple cognitive distortions active, fused with shame-based identity, blended with critical part.',
        therapeuticFocus: 'Create space between person and thoughts (defusion)',
        interventions: [
          'ACT: "I\'m having the thought that..." (defusion language)',
          'CBT: Thought records, evidence for/against',
          'IFS: "This is a PART of me thinking this, not all of me"',
          'Schema: "This is the Punitive Parent speaking, not truth"',
          'Mindfulness: Notice thoughts as mental events, not facts',
          'Key question: "What if this thought isn\'t as true as it feels?"'
        ],
        urgency: 'moderate'
      };
    }

    return null;
  }
}

export const crossFrameworkSynergyEngine = new CrossFrameworkSynergyEngine();
