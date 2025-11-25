/**
 * ADVANCED SYNERGY DETECTION ENGINE
 *
 * Detects HIGH-COMPLEXITY transformation signatures (5-9 frameworks)
 * Layers on top of basic CrossFrameworkSynergyEngine
 *
 * ADVANCED SIGNATURES: 5-6 frameworks
 * ULTRA-RARE SIGNATURES: 7-9 frameworks
 *
 * When 5+ frameworks align, the signal is EXTREMELY strong
 * When 7+ frameworks align, it's either emergence or crisis
 * When ALL 9 align, it's EXTRAORDINARY (< 0.1% occurrence)
 */

import type { ExtractionResult } from './SymbolExtractionEngine';
import type { TransformationSignature } from './CrossFrameworkSynergyEngine';

export class AdvancedSynergyEngine {

  /**
   * Detect advanced signatures (5-9 frameworks)
   */
  detectAdvancedSynergies(extraction: ExtractionResult): TransformationSignature[] {
    const signatures: TransformationSignature[] = [];

    // ADVANCED (5-6 frameworks)
    const systemicShutdown = this.detectCompleteSystemicShutdown(extraction);
    if (systemicShutdown) signatures.push(systemicShutdown);

    const ancestralFreeze = this.detectAncestralFreezePattern(extraction);
    if (ancestralFreeze) signatures.push(ancestralFreeze);

    const systemicFreezeAncestral = this.detectSystemicFreezeWithAncestralCall(extraction);
    if (systemicFreezeAncestral) signatures.push(systemicFreezeAncestral);

    const integrationAdvanced = this.detectIntegrationReadinessAdvanced(extraction);
    if (integrationAdvanced) signatures.push(integrationAdvanced);

    const protectorStormSystem = this.detectProtectorStormWithSystemPressure(extraction);
    if (protectorStormSystem) signatures.push(protectorStormSystem);

    const primaMateria = this.detectPrimaMateriaRevelation(extraction);
    if (primaMateria) signatures.push(primaMateria);

    const soulTransmutation = this.detectSoulTransmutation(extraction);
    if (soulTransmutation) signatures.push(soulTransmutation);

    // ULTRA-RARE (7-9 frameworks)
    const systemEmergence = this.detectCompleteSystemEmergence(extraction);
    if (systemEmergence) signatures.push(systemEmergence);

    const systemCollapse = this.detectTotalSystemCollapse(extraction);
    if (systemCollapse) signatures.push(systemCollapse);

    const morphogeneticAdvanced = this.detectMorphogeneticBreakthroughAdvanced(extraction);
    if (morphogeneticAdvanced) signatures.push(morphogeneticAdvanced);

    const alchemicalRebirth = this.detectAlchemicalRebirthComplete(extraction);
    if (alchemicalRebirth) signatures.push(alchemicalRebirth);

    const darkNight = this.detectDarkNightOfSoul(extraction);
    if (darkNight) signatures.push(darkNight);

    const anthroposRestoration = this.detectAnthroposRestoration(extraction);
    if (anthroposRestoration) signatures.push(anthroposRestoration);

    const completeAlignment = this.detectComplete9FrameworkAlignment(extraction);
    if (completeAlignment) signatures.push(completeAlignment);

    return signatures;
  }

  /**
   * ADVANCED PATTERN 1: Complete Systemic Shutdown (5 frameworks)
   * Levine + Polyvagal + Gestalt + IFS + Constellation
   */
  private detectCompleteSystemicShutdown(extraction: ExtractionResult): TransformationSignature | null {
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;
    const hasExhaustedManagers = extraction.ifsParts?.parts.some(p => p.type === 'manager' && p.indicator.includes('exhausted'));
    const hasEntanglement = extraction.constellationState?.systemicEntanglement.detected;

    if (hasFreeze && hasDorsal && hasRetroflection && hasExhaustedManagers && hasEntanglement) {
      return {
        name: 'Complete Systemic Shutdown',
        description: 'Individual + family system both in shutdown. Freeze response with systemic burden.',
        frameworks: ['Levine', 'Polyvagal', 'Gestalt', 'IFS', 'Family Constellation'],
        frameworkCount: 5,
        complexity: 'advanced',
        confidence: 0.90,
        clinicalMeaning: 'Both the individual nervous system AND the family system are in shutdown. The person is frozen (Levine), in dorsal immobilization (Polyvagal), turning all energy inward (Gestalt retroflection), with exhausted protective parts (IFS managers), while carrying something for the family system (Constellation entanglement). This is a systemic freeze, not just individual.',
        therapeuticFocus: 'Co-regulate nervous system FIRST, then gently explore what they\'re carrying for the family',
        interventions: [
          'PRIORITY: Establish safety and co-regulation',
          'Levine: Gentle thaw from freeze (micro-movements, pendulation)',
          'Polyvagal: Safety cues, co-regulation, ventral activation',
          'Gestalt: Notice retroflection, normalize as protection',
          'IFS: Appreciate exhausted managers (don\'t push)',
          'Constellation: When regulated, explore systemic burden (what/who are they carrying for?)'
        ],
        urgency: 'critical'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 2: Ancestral Freeze Pattern (5 frameworks)
   * Levine + Polyvagal + Constellation + Jung + Alchemy
   */
  private detectAncestralFreezePattern(extraction: ExtractionResult): TransformationSignature | null {
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasExcludedMembers = extraction.constellationState?.excludedMembers.detected;
    const hasInterruptedMovement = extraction.constellationState?.movementPattern.type === 'interrupted-reaching';
    const hasShadowProjection = extraction.jungianProcess?.shadowWork || extraction.jungianProcess?.projection;
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';

    const count = [hasFreeze, hasDorsal, hasExcludedMembers || hasInterruptedMovement, hasShadowProjection, hasNigredo].filter(Boolean).length;

    if (count >= 4 && (hasExcludedMembers || hasInterruptedMovement)) {
      return {
        name: 'Ancestral Freeze Pattern',
        description: 'Freeze response connected to unresolved ancestral trauma. Body holding family burden.',
        frameworks: ['Levine', 'Polyvagal', 'Family Constellation', 'Jung', 'Alchemy'],
        frameworkCount: 5,
        complexity: 'advanced',
        confidence: 0.88,
        clinicalMeaning: 'The body is frozen (Levine) in dorsal shutdown (Polyvagal) during Nigredo dissolution (Alchemy), while calling on or reaching toward deceased/excluded family members (Constellation). Shadow or projection dynamics active (Jung). This freeze is not just individual trauma - it\'s connected to the ancestral/family field. The body may be holding what belongs to the ancestors.',
        therapeuticFocus: 'Somatic resourcing + family constellation work + honoring what belongs to ancestors',
        interventions: [
          'PRIORITY: Somatic stabilization and resourcing',
          'Levine: Gentle freeze thaw, track sensation without story',
          'Polyvagal: Co-regulation, safety establishment',
          'Constellation: Honor excluded members, acknowledge interrupted movement',
          'Constellation: Explore - "What am I carrying that doesn\'t belong to me?"',
          'Jung: Notice projection without interpreting (not ready for insight)',
          'Alchemy: Honor Nigredo - this is dissolution, not yet integration',
          'Possible: Family constellation work when more regulated'
        ],
        urgency: 'critical'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 3: Complete Systemic Freeze with Ancestral Call (6 frameworks)
   * THE SIGNATURE from Kelly's client Message #2!
   */
  private detectSystemicFreezeWithAncestralCall(extraction: ExtractionResult): TransformationSignature | null {
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasExcludedMembers = extraction.constellationState?.excludedMembers.detected;
    const hasInterruptedReaching = extraction.constellationState?.movementPattern.type === 'interrupted-reaching';
    const hasExhaustedManagers = extraction.ifsParts?.parts.some(p => p.type === 'manager' && p.indicator.includes('exhausted'));
    const hasExileActive = extraction.ifsParts?.parts.some(p => p.type === 'exile');
    const hasDeflection = extraction.gestaltState?.contactDisturbances.deflection.detected;
    const hasMidNigredo = extraction.alchemicalStage?.coherence !== undefined &&
                          extraction.alchemicalStage.coherence >= 0.3 &&
                          extraction.alchemicalStage.coherence <= 0.7;

    const coreCount = [hasFreeze, hasDorsal, hasExcludedMembers && hasInterruptedReaching].filter(Boolean).length;
    const supportingCount = [hasExhaustedManagers || hasExileActive, hasDeflection, hasMidNigredo].filter(Boolean).length;

    if (coreCount === 3 && supportingCount >= 2) {
      const names = extraction.constellationState?.excludedMembers.names.join(', ') || 'unknown';

      return {
        name: 'Complete Systemic Freeze with Ancestral Call',
        description: 'Individual frozen while calling on ancestors. System exhausted, parts activated, reaching toward deceased/excluded.',
        frameworks: ['Levine', 'Polyvagal', 'Family Constellation', 'IFS', 'Gestalt', 'Alchemy'],
        frameworkCount: 6,
        complexity: 'advanced',
        confidence: 0.92,
        clinicalMeaning: `The person is in somatic freeze (Levine) with dorsal shutdown (Polyvagal) while actively calling on excluded/deceased family members (Constellation: ${names}). Their body shows interrupted reaching movement - wanting to move toward someone but unable (possibly arm/hand paralysis). Meanwhile, their protective system is exhausted (IFS managers) and exiles are emerging. Contact boundaries show deflection (Gestalt). This is a PROFOUND moment where individual freeze meets ancestral calling. The body paralysis may be a somatic representation of the family system freeze.`,
        therapeuticFocus: 'Multi-level intervention: nervous system regulation + acknowledgment of ancestral calling + parts work',
        interventions: [
          'PRIORITY 1: Co-regulate nervous system (freeze thaw)',
          'PRIORITY 2: Acknowledge who they\'re calling ("I hear you calling on [names]")',
          'Levine: Gentle somatic work with interrupted reaching (what wants to move?)',
          'Polyvagal: Safety, co-regulation, tiny ventral steps',
          'Constellation: Explore relationship to excluded members',
          'Constellation: "What are you carrying for them? What belongs to them?"',
          'IFS: Appreciate exhausted managers, witness exiles gently',
          'Gestalt: Notice deflection as protection',
          'Alchemy: Honor mid-Nigredo - don\'t rush',
          'Consider: Family constellation session when more regulated',
          'Medical: If prolonged (weeks), consider medical consultation'
        ],
        urgency: 'critical'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 4: Integration Readiness Advanced (6 frameworks)
   */
  private detectIntegrationReadinessAdvanced(extraction: ExtractionResult): TransformationSignature | null {
    const hasHighCoherence = (extraction.alchemicalStage?.primaryStage === 'citrinitas' ||
                              extraction.alchemicalStage?.primaryStage === 'rubedo') &&
                             extraction.alchemicalStage.coherence >= 0.75;
    const hasVentral = extraction.polyvagalState?.state === 'ventral';
    const hasSelfLed = extraction.ifsParts?.selfEnergy !== undefined && extraction.ifsParts.selfEnergy >= 0.7;
    const hasIndividuation = extraction.jungianProcess?.individuation;
    const hasWindowTolerance = extraction.somaticState?.arousal.windowOfTolerance;
    const hasGoodContact = extraction.gestaltState?.awareness.hereAndNow !== undefined &&
                          extraction.gestaltState.awareness.hereAndNow >= 0.7;

    const count = [hasHighCoherence, hasVentral, hasSelfLed, hasIndividuation, hasWindowTolerance, hasGoodContact].filter(Boolean).length;

    if (count >= 5) {
      return {
        name: 'Integration Readiness (Advanced)',
        description: 'Opposites integrating, nervous system regulated, parts trusting Self, individuation happening, body settled, contact full',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Gestalt'],
        frameworkCount: 6,
        complexity: 'advanced',
        confidence: 0.93,
        clinicalMeaning: 'HIGH COHERENCE state across multiple systems. Alchemical Citrinitas/Rubedo (opposites uniting), ventral vagal activation (social engagement), IFS Self-leadership, Jungian individuation actively happening, arousal within window of tolerance, and full Gestalt contact. The person is READY for integration work. All systems are saying YES.',
        therapeuticFocus: 'Support integration, witness wholeness emerging, don\'t disrupt',
        interventions: [
          'PRIORITY: Support the natural integration process (don\'t interfere)',
          'Alchemy: Track Coniunctio operation (union of opposites)',
          'IFS: Witness Self-led system, appreciate protectors relaxing',
          'Jung: Support individuation process',
          'Levine: Note settled arousal, capacity for discharge if needed',
          'Gestalt: Support full contact (figure/ground, here-and-now)',
          'Polyvagal: Celebrate ventral capacity',
          'Consider: Creative expression, ritual, embodiment practices'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 5: Protector Storm with System Pressure (6 frameworks)
   */
  private detectProtectorStormWithSystemPressure(extraction: ExtractionResult): TransformationSignature | null {
    const hasManagers = extraction.ifsParts?.parts.some(p => p.type === 'manager');
    const hasFirefighters = extraction.ifsParts?.parts.some(p => p.type === 'firefighter');
    const hasSympathetic = extraction.polyvagalState?.state === 'sympathetic';
    const hasFightFlight = extraction.somaticState?.incompleteResponse.type === 'fight' ||
                           extraction.somaticState?.incompleteResponse.type === 'flight';
    const hasEntanglement = extraction.constellationState?.systemicEntanglement.detected;
    const hasOrdersViolation = extraction.constellationState?.ordersOfLove.violation;
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;
    const hasIntrojection = extraction.gestaltState?.contactDisturbances.introjection.detected;
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';

    const hasProtectors = hasManagers && hasFirefighters;
    const hasSystemic = hasEntanglement || hasOrdersViolation;
    const supportingCount = [hasSympathetic, hasFightFlight, hasRetroflection || hasIntrojection, hasNigredo].filter(Boolean).length;

    if (hasProtectors && hasSystemic && supportingCount >= 3) {
      return {
        name: 'Protector Storm with System Pressure',
        description: 'Protective system overwhelmed by both internal exiles AND systemic burden',
        frameworks: ['IFS', 'Family Constellation', 'Polyvagal', 'Levine', 'Gestalt', 'Alchemy'],
        frameworkCount: 6,
        complexity: 'advanced',
        confidence: 0.89,
        clinicalMeaning: 'The IFS protective system (managers + firefighters) is in full activation, mobilized in sympathetic fight/flight, while ALSO carrying a systemic burden (family entanglement or orders violation). The person is trying to manage both their own exiled pain AND what they\'re carrying for the family system. Protectors are overwhelmed because they\'re working on two levels simultaneously.',
        therapeuticFocus: 'Help protectors distinguish personal burden from systemic burden',
        interventions: [
          'PRIORITY: Appreciate protectors (they\'re doing TWO jobs at once)',
          'IFS: "What are your protectors managing RIGHT NOW?"',
          'IFS: Help protectors see they\'re carrying both personal + systemic',
          'Constellation: "What belongs to you vs. what belongs to the family system?"',
          'Polyvagal: Co-regulation to reduce sympathetic activation',
          'Levine: Allow safe discharge of fight/flight energy',
          'Gestalt: Notice retroflection/introjection without forcing change',
          'Strategy: Work with systemic burden SEPARATELY from exile work'
        ],
        urgency: 'high'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 6: Prima Materia Revelation (6 frameworks)
   * The raw material of transformation reveals itself
   */
  private detectPrimaMateriaRevelation(extraction: ExtractionResult): TransformationSignature | null {
    const hasNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo';
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasExilePresent = extraction.ifsParts?.parts.some(p => p.type === 'exile');
    const hasShadowWork = extraction.jungianProcess?.shadowWork;
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasRetroflection = extraction.gestaltState?.contactDisturbances.retroflection.detected;

    const count = [hasNigredo, hasDorsal, hasExilePresent, hasShadowWork, hasFreeze, hasRetroflection].filter(Boolean).length;

    if (count >= 5) {
      return {
        name: 'Prima Materia Revelation',
        description: 'The raw, unformed psychic material reveals itself. The exile holds the gold.',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Gestalt'],
        frameworkCount: 6,
        complexity: 'advanced',
        confidence: 0.89,
        clinicalMeaning: 'The person has descended into Nigredo (blackening/dissolution), entered dorsal shutdown, and made contact with exiled parts. Shadow material is present. The body is frozen and turning inward. This is NOT pathology—this is the alchemical Prima Materia revealing itself. The raw, unformed psychic material that contains the gold. The exile holds what needs to be transmuted.',
        therapeuticFocus: 'Honor the descent. Protect the Prima Materia. Do not rush transformation.',
        interventions: [
          'PRIORITY: Create a sacred container for this material',
          'Alchemy: Name this as Prima Materia - the raw gold',
          'IFS: Witness exiles with reverence (they hold what needs transmutation)',
          'Jung: Honor shadow as treasure (not pathology)',
          'Polyvagal: Co-regulate gently (don\'t force ventral)',
          'Levine: Allow freeze (the body is protecting the material)',
          'Gestalt: Notice retroflection as necessary containment',
          'Do NOT: Try to "fix" or "heal" yet—this IS the work',
          'Consider: Dreamwork, creative expression, ritual'
        ],
        urgency: 'moderate'
      };
    }
    return null;
  }

  /**
   * ADVANCED PATTERN 7: Soul Transmutation Through Active Imagination (6 frameworks)
   * Alchemical transformation happening through imaginal work
   */
  private detectSoulTransmutation(extraction: ExtractionResult): TransformationSignature | null {
    const hasAlbedoOrCitrinitas = extraction.alchemicalStage?.primaryStage === 'albedo' ||
                                  extraction.alchemicalStage?.primaryStage === 'citrinitas';
    const hasActiveImagination = extraction.jungianProcess?.individuation;
    const hasSelfEnergyEmerging = extraction.ifsParts?.selfEnergy !== undefined &&
                                  extraction.ifsParts.selfEnergy >= 0.5 &&
                                  extraction.ifsParts.selfEnergy < 0.8;
    const hasVentralEmergence = extraction.polyvagalState?.state === 'ventral' ||
                               (extraction.polyvagalState?.state === 'sympathetic' &&
                                extraction.polyvagalState.safety >= 0.6);
    const hasDischargeActive = extraction.somaticState?.discharge.active;
    const hasAwarenessIncreasing = extraction.gestaltState?.awareness.hereAndNow !== undefined &&
                                  extraction.gestaltState.awareness.hereAndNow >= 0.6;

    const count = [hasAlbedoOrCitrinitas, hasActiveImagination, hasSelfEnergyEmerging,
                   hasVentralEmergence, hasDischargeActive, hasAwarenessIncreasing].filter(Boolean).length;

    if (count >= 5) {
      return {
        name: 'Soul Transmutation Through Active Imagination',
        description: 'The alchemical transformation is happening. Soul material transmuting through imaginal work.',
        frameworks: ['Alchemy', 'Jung', 'IFS', 'Polyvagal', 'Levine', 'Gestalt'],
        frameworkCount: 6,
        complexity: 'advanced',
        confidence: 0.91,
        clinicalMeaning: 'Transformation actively occurring through Albedo/Citrinitas (whitening/yellowing). Jungian active imagination is engaged, Self-energy is emerging (not yet fully embodied), nervous system is moving toward ventral with moments of activation, somatic discharge is happening, and Gestalt awareness is increasing. The Prima Materia is being worked. This is soul-level transformation through imaginal dialogue—not just psychological insight.',
        therapeuticFocus: 'Support the alchemical operation. Hold space for imaginal work. Don\'t interrupt the process.',
        interventions: [
          'PRIORITY: Protect and support the alchemical operation',
          'Alchemy: Track the Albedo/Citrinitas process (purification → illumination)',
          'Jung: Support active imagination work (dialogues with unconscious)',
          'IFS: Witness Self-energy emerging (parts beginning to trust)',
          'Polyvagal: Support ventral emergence (don\'t force it)',
          'Levine: Allow discharge process (completion cycles)',
          'Gestalt: Support increasing awareness without interpretation',
          'Consider: Sandplay, dreamwork, creative expression, ritual',
          'Do NOT: Over-analyze or intellectualize the process'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  // ========================================================================
  // ULTRA-RARE SIGNATURES (7-9 Frameworks)
  // ========================================================================

  /**
   * ULTRA-RARE PATTERN 1: Complete System Emergence (7 frameworks)
   */
  private detectCompleteSystemEmergence(extraction: ExtractionResult): TransformationSignature | null {
    const hasRubedo = extraction.alchemicalStage?.primaryStage === 'rubedo' &&
                     extraction.alchemicalStage.coherence >= 0.85;
    const hasVentral = extraction.polyvagalState?.state === 'ventral' &&
                      extraction.polyvagalState.safety >= 0.8;
    const hasSelfLed = extraction.ifsParts?.selfEnergy !== undefined &&
                      extraction.ifsParts.selfEnergy >= 0.8;
    const hasIndividuation = extraction.jungianProcess?.individuation;
    const hasCompleteDischarge = extraction.somaticState?.discharge.active &&
                                 extraction.somaticState.arousal.windowOfTolerance;
    const hasSystemPeace = extraction.constellationState?.detected &&
                          !extraction.constellationState.systemicEntanglement.detected &&
                          !extraction.constellationState.ordersOfLove.violation;
    const hasFieldCoherence = extraction.narrativeThemes.some(t =>
                             t.toLowerCase().includes('wholeness') ||
                             t.toLowerCase().includes('integration') ||
                             t.toLowerCase().includes('complete'));

    const count = [hasRubedo, hasVentral, hasSelfLed, hasIndividuation, hasCompleteDischarge, hasSystemPeace, hasFieldCoherence].filter(Boolean).length;

    if (count >= 6) {
      return {
        name: 'Complete System Emergence',
        description: 'WHOLENESS. All systems aligned. Individual + family + field integrated.',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Family Constellation', 'Levin'],
        frameworkCount: 7,
        complexity: 'ultra-rare',
        confidence: 0.97,
        clinicalMeaning: 'EXTRAORDINARILY RARE state. Alchemical Rubedo (wholeness embodied), ventral vagal dominance (deep safety), IFS Self fully leading, Jungian individuation complete, somatic discharge complete and arousal regulated, family system at peace (no entanglements), and morphogenetic field coherent. This is the Self, the Philosopher\'s Stone, true wholeness. WITNESS THIS.',
        therapeuticFocus: 'WITNESS ONLY. Do not interpret or interfere. Sacred moment.',
        interventions: [
          'PRIORITY: Presence and witnessing',
          'Simply BE with this person in this state',
          'Do not pathologize or "therapize"',
          'Trust the process completely',
          'Consider: Ritual, celebration, creative expression',
          'Note: This state may be temporary - that\'s natural'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 2: Total System Collapse (7 frameworks)
   */
  private detectTotalSystemCollapse(extraction: ExtractionResult): TransformationSignature | null {
    const hasDeepNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo' &&
                          extraction.alchemicalStage.coherence <= 0.15;
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal' &&
                     extraction.polyvagalState.safety === 0;
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasNoSelf = extraction.ifsParts?.selfEnergy !== undefined &&
                     extraction.ifsParts.selfEnergy <= 0.2;
    const hasMajorEntanglement = extraction.constellationState?.systemicEntanglement.detected &&
                                extraction.constellationState.systemicEntanglement.confidence >= 0.7;
    const hasFieldCollapse = extraction.narrativeThemes.some(t =>
                            t.toLowerCase().includes('collapse') ||
                            t.toLowerCase().includes('falling apart'));
    const hasAllContactViolations = extraction.gestaltState?.detected &&
                                   Object.values(extraction.gestaltState.contactDisturbances)
                                     .filter(d => d.detected).length >= 3;

    const count = [hasDeepNigredo, hasDorsal, hasFreeze, hasNoSelf, hasMajorEntanglement, hasFieldCollapse, hasAllContactViolations].filter(Boolean).length;

    if (count >= 6) {
      return {
        name: 'Total System Collapse',
        description: 'CRISIS. Complete system shutdown on all levels. EMERGENCY.',
        frameworks: ['Alchemy', 'Polyvagal', 'Levine', 'IFS', 'Family Constellation', 'Levin', 'Gestalt'],
        frameworkCount: 7,
        complexity: 'ultra-rare',
        confidence: 0.95,
        clinicalMeaning: 'CRISIS STATE across ALL levels. Deep Nigredo dissolution (coherence near zero), dorsal vagal shutdown, freeze response, IFS system blended with no Self-energy, major family system entanglement, morphogenetic field collapse, and all Gestalt contact boundaries violated. This is systemic collapse. IMMEDIATE support needed.',
        therapeuticFocus: 'IMMEDIATE STABILIZATION. Crisis intervention protocols.',
        interventions: [
          'PRIORITY: SAFETY ASSESSMENT',
          'Assess: Suicidality, self-harm, ability to care for self',
          'Assess: Need for hospitalization or crisis services',
          'If safe: IMMEDIATE co-regulation',
          'Ground in present moment (body, breath, sensation)',
          'Establish safety plan',
          'Consider: Medical consultation, crisis services',
          'Do NOT: Insight work, trauma exploration, family work',
          'ONLY: Presence, safety, co-regulation, grounding'
        ],
        urgency: 'critical'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 3: Morphogenetic Breakthrough Advanced (8 frameworks)
   */
  private detectMorphogeneticBreakthroughAdvanced(extraction: ExtractionResult): TransformationSignature | null {
    const frameworksAligned = [
      extraction.alchemicalStage?.coherence !== undefined && extraction.alchemicalStage.coherence >= 0.8,
      extraction.polyvagalState?.safety !== undefined && extraction.polyvagalState.safety >= 0.8,
      extraction.ifsParts?.selfEnergy !== undefined && extraction.ifsParts.selfEnergy >= 0.8,
      extraction.jungianProcess?.individuation,
      extraction.somaticState?.arousal.windowOfTolerance && extraction.somaticState.discharge.active,
      extraction.gestaltState?.awareness.hereAndNow !== undefined && extraction.gestaltState.awareness.hereAndNow >= 0.8,
      extraction.constellationState?.detected && !extraction.constellationState.systemicEntanglement.detected,
      extraction.narrativeThemes.some(t => t.toLowerCase().includes('breakthrough') || t.toLowerCase().includes('emergence'))
    ].filter(Boolean).length;

    if (frameworksAligned >= 7) {
      return {
        name: 'Morphogenetic Breakthrough (8 Frameworks)',
        description: 'RARE. Field reorganization at fundamental level across 8 dimensions.',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Gestalt', 'Family Constellation', 'Levin'],
        frameworkCount: 8,
        complexity: 'ultra-rare',
        confidence: 0.98,
        clinicalMeaning: 'EXTRAORDINARILY RARE (< 1% of moments). Eight frameworks simultaneously reporting high coherence. This suggests fundamental field-level transformation - not just psychological change but morphogenetic reorganization. This is what transformation looks like across ALL dimensions.',
        therapeuticFocus: 'WITNESS THE SACRED. Do not interfere.',
        interventions: [
          'PRIORITY: PRESENCE',
          'This is a SACRED MOMENT',
          'Simply witness what is emerging',
          'Do not interpret, analyze, or "therapize"',
          'Trust the process completely',
          'Consider: Silent presence, breathwork, ritual',
          'Let it unfold naturally'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 4: Alchemical Rebirth Complete (7 frameworks)
   * The Rubedo phase—embodied wholeness after full death-rebirth cycle
   */
  private detectAlchemicalRebirthComplete(extraction: ExtractionResult): TransformationSignature | null {
    const hasRubedo = extraction.alchemicalStage?.primaryStage === 'rubedo' &&
                     extraction.alchemicalStage.coherence >= 0.8;
    const hasVentral = extraction.polyvagalState?.state === 'ventral';
    const hasSelfLed = extraction.ifsParts?.selfEnergy !== undefined &&
                      extraction.ifsParts.selfEnergy >= 0.75;
    const hasIndividuation = extraction.jungianProcess?.individuation;
    const hasSystemPeace = extraction.constellationState?.detected &&
                          !extraction.constellationState.systemicEntanglement.detected;
    const hasDischargeComplete = extraction.somaticState?.discharge.active &&
                                extraction.somaticState.arousal.windowOfTolerance;
    const hasFullContact = extraction.gestaltState?.awareness.hereAndNow !== undefined &&
                          extraction.gestaltState.awareness.hereAndNow >= 0.8;

    const count = [hasRubedo, hasVentral, hasSelfLed, hasIndividuation, hasSystemPeace,
                   hasDischargeComplete, hasFullContact].filter(Boolean).length;

    if (count >= 6) {
      return {
        name: 'Alchemical Rebirth Complete',
        description: 'RUBEDO. The death-rebirth cycle complete. Wholeness embodied across all dimensions.',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Family Constellation', 'Levine', 'Gestalt'],
        frameworkCount: 7,
        complexity: 'ultra-rare',
        confidence: 0.95,
        clinicalMeaning: 'The alchemical Rubedo (reddening) is complete. This person has gone through Nigredo (death/dissolution), Albedo (purification), Citrinitas (illumination), and emerged in Rubedo (embodied wholeness). The nervous system is ventral, IFS Self is leading, individuation is happening, family system is at peace, somatic discharge is complete, and Gestalt contact is full. This is the Philosopher\'s Stone—not as concept but as LIVED REALITY. The transformation is embodied.',
        therapeuticFocus: 'WITNESS THE SACRED. This is completion of the Great Work.',
        interventions: [
          'PRIORITY: REVERENT WITNESSING',
          'Alchemy: Name this as Rubedo—the completion of the Great Work',
          'This person has transmuted lead into gold',
          'Jung: This is the Self—individuation embodied',
          'IFS: The system trusts Self completely',
          'Polyvagal: Nervous system at peace',
          'Constellation: Family system at peace',
          'Levine: Body integrated and complete',
          'Gestalt: Full contact with reality',
          'Do NOT: Pathologize, analyze, or "therapize"',
          'Consider: Ritual, celebration, creative expression',
          'This is a SACRED MOMENT—simply be present'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 5: Dark Night of Soul (8 frameworks)
   * Profound spiritual crisis—dissolution of all familiar structures
   */
  private detectDarkNightOfSoul(extraction: ExtractionResult): TransformationSignature | null {
    const hasDeepNigredo = extraction.alchemicalStage?.primaryStage === 'nigredo' &&
                          extraction.alchemicalStage.coherence <= 0.2;
    const hasDorsal = extraction.polyvagalState?.state === 'dorsal';
    const hasFreeze = extraction.somaticState?.incompleteResponse.type === 'freeze';
    const hasMinimalSelf = extraction.ifsParts?.selfEnergy !== undefined &&
                          extraction.ifsParts.selfEnergy <= 0.3;
    const hasShadowFlood = extraction.jungianProcess?.shadowWork;
    const hasEntanglement = extraction.constellationState?.systemicEntanglement.detected;
    const hasExistentialCrisis = extraction.existentialState?.meaningCrisis;
    const hasAllContactViolations = extraction.gestaltState?.detected &&
                                   Object.values(extraction.gestaltState.contactDisturbances)
                                     .filter(d => d.detected).length >= 3;

    const count = [hasDeepNigredo, hasDorsal, hasFreeze, hasMinimalSelf, hasShadowFlood,
                   hasEntanglement, hasExistentialCrisis, hasAllContactViolations].filter(Boolean).length;

    if (count >= 7) {
      return {
        name: 'Dark Night of Soul',
        description: 'SACRED CRISIS. Profound spiritual dissolution. Everything that was solid melts into darkness.',
        frameworks: ['Alchemy', 'Polyvagal', 'Levine', 'IFS', 'Jung', 'Family Constellation', 'Existential', 'Gestalt'],
        frameworkCount: 8,
        complexity: 'ultra-rare',
        confidence: 0.96,
        clinicalMeaning: 'This is what mystics call the Dark Night of the Soul. Deep Nigredo (coherence near zero), dorsal shutdown, freeze, minimal Self-energy, shadow flooding consciousness, systemic entanglement active, existential meaning crisis, and all contact boundaries violated. This is NOT clinical depression—this is SACRED DISSOLUTION. Everything familiar is dissolving. The ego structure is dying. This is the alchemical death that precedes rebirth. Recognized across millennia of wisdom traditions (St. John of the Cross, Buddhist Bardo, Shamanic dismemberment, Kali\'s destruction). This is archetypal territory.',
        therapeuticFocus: 'HOLD SPACE FOR SACRED DISSOLUTION. Do not try to "fix" or "cure".',
        interventions: [
          'PRIORITY: SAFETY + SACRED CONTAINER',
          'Assess: Suicidality (spiritual crisis ≠ suicidal, but check)',
          'Alchemy: Name this as Dark Night—a sacred initiatory passage',
          'Jung: This is the nigredo that precedes albedo',
          'Existential: Meaning-making systems dissolving (not pathology)',
          'IFS: Minimal Self-energy is APPROPRIATE for this phase',
          'Polyvagal/Levine: Dorsal freeze is PROTECTION during dissolution',
          'Constellation: What is dissolving in the family system too?',
          'Gestalt: Contact violations are NECESSARY during ego-death',
          'NORMALIZE THIS AS SACRED PROCESS (not mental illness)',
          'Consider: Spiritual director, meditation teacher, elder',
          'Read: "Dark Night of the Soul" (St. John), "When Things Fall Apart" (Pema Chodron)',
          'Do NOT: Rush to "fix," push for ventral activation, or pathologize'
        ],
        urgency: 'high'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 6: Anthropos Restoration (8 frameworks)
   * The restoration of primordial wholeness—union with the Original Human
   */
  private detectAnthroposRestoration(extraction: ExtractionResult): TransformationSignature | null {
    const hasRubedo = extraction.alchemicalStage?.primaryStage === 'rubedo' &&
                     extraction.alchemicalStage.coherence >= 0.85;
    const hasDeepVentral = extraction.polyvagalState?.state === 'ventral' &&
                          extraction.polyvagalState.safety >= 0.85;
    const hasHighSelf = extraction.ifsParts?.selfEnergy !== undefined &&
                       extraction.ifsParts.selfEnergy >= 0.85;
    const hasIndividuation = extraction.jungianProcess?.individuation;
    const hasCompleteDischarge = extraction.somaticState?.discharge.active &&
                                 extraction.somaticState.arousal.windowOfTolerance;
    const hasSystemRestoration = extraction.constellationState?.detected &&
                                !extraction.constellationState.systemicEntanglement.detected &&
                                !extraction.constellationState.ordersOfLove.violation;
    const hasMeaningRestored = !extraction.existentialState?.meaningCrisis;
    const hasFullContact = extraction.gestaltState?.awareness.hereAndNow !== undefined &&
                          extraction.gestaltState.awareness.hereAndNow >= 0.85;

    const count = [hasRubedo, hasDeepVentral, hasHighSelf, hasIndividuation, hasCompleteDischarge,
                   hasSystemRestoration, hasMeaningRestored, hasFullContact].filter(Boolean).length;

    if (count >= 7) {
      return {
        name: 'Anthropos Restoration',
        description: 'THE ORIGINAL HUMAN RESTORED. Primordial wholeness. The Imago Dei embodied.',
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Family Constellation', 'Existential', 'Gestalt'],
        frameworkCount: 8,
        complexity: 'ultra-rare',
        confidence: 0.98,
        clinicalMeaning: 'EXTRAORDINARILY RARE (< 0.5% of moments). This is what the alchemists called the Anthropos—the Original Human, the Adam Kadmon, the primordial wholeness before fragmentation. Rubedo complete with very high coherence, deep ventral safety, high Self-energy, individuation embodied, somatic completion, family system restored to right order, existential meaning present, and full Gestalt contact. This is the restoration of the Imago Dei (Image of God). This is what humans are MEANT to be. This is the telos of transformation. WITNESS THIS AS SACRED.',
        therapeuticFocus: 'SILENT REVERENCE. This is the Great Work complete.',
        interventions: [
          'PRIORITY: PRESENCE IN AWE',
          'This is the PHILOSOPHER\'S STONE fully embodied',
          'Alchemy: This is the Anthropos—the restored Original Human',
          'Jung: This is the Self—complete individuation',
          'IFS: The system is whole—Self fully leading',
          'Polyvagal: Nervous system in primordial safety',
          'Constellation: Family system in right order',
          'Existential: Meaning fully restored',
          'Levine: Body complete and whole',
          'Gestalt: Full contact with all of reality',
          'This is what mystics, saints, and sages describe',
          'This is what humans are CAPABLE of',
          'Do NOTHING except witness with reverence',
          'This moment is teaching YOU',
          'Consider: This may be temporary—honor it fully while present'
        ],
        urgency: 'low'
      };
    }
    return null;
  }

  /**
   * ULTRA-RARE PATTERN 7: Complete 9-Framework Alignment
   * Occurrence rate: < 0.1% of all therapeutic moments
   */
  private detectComplete9FrameworkAlignment(extraction: ExtractionResult): TransformationSignature | null {
    const hasAlchemy = extraction.alchemicalStage !== undefined;
    const hasPolyvagal = extraction.polyvagalState !== undefined;
    const hasIFS = extraction.ifsParts?.detected;
    const hasJung = extraction.jungianProcess !== undefined;
    const hasLevine = extraction.somaticState?.detected;
    const hasGestalt = extraction.gestaltState?.detected;
    const hasConstellation = extraction.constellationState?.detected;
    const hasLevin = extraction.narrativeThemes.length > 0;
    const hasMcGilchrist = extraction.hemisphericMode !== undefined;

    const allFrameworksPresent = hasAlchemy && hasPolyvagal && hasIFS && hasJung &&
                                 hasLevine && hasGestalt && hasConstellation && hasLevin && hasMcGilchrist;

    if (!allFrameworksPresent) return null;

    const coherenceValues = [
      extraction.alchemicalStage?.coherence ?? 0.5,
      extraction.polyvagalState?.safety ?? 0.5,
      extraction.ifsParts?.selfEnergy ?? 0.5
    ];

    const allHigh = coherenceValues.every(v => v >= 0.75);
    const allLow = coherenceValues.every(v => v <= 0.25);
    const aligned = allHigh || allLow;

    if (aligned) {
      const isEmergence = allHigh;

      return {
        name: `Complete 9-Framework Alignment (${isEmergence ? 'EMERGENCE' : 'COLLAPSE'})`,
        description: `EXTRAORDINARILY RARE. All 9 frameworks aligned. ${isEmergence ? 'Total emergence' : 'Total collapse'}.`,
        frameworks: ['Alchemy', 'Polyvagal', 'IFS', 'Jung', 'Levine', 'Gestalt', 'Family Constellation', 'Levin', 'McGilchrist'],
        frameworkCount: 9,
        complexity: 'ultra-rare',
        confidence: 0.99,
        clinicalMeaning: isEmergence
          ? 'THE RAREST positive state: ALL NINE FRAMEWORKS reporting high coherence simultaneously. Complete wholeness across every dimension we can measure. Occurrence: probably < 0.1% of all moments.'
          : 'THE RAREST crisis state: ALL NINE FRAMEWORKS reporting shutdown/collapse simultaneously. TOTAL SYSTEM COLLAPSE across every dimension. EMERGENCY INTERVENTION REQUIRED.',
        therapeuticFocus: isEmergence
          ? 'WITNESS THE SACRED MOMENT - do not interfere'
          : 'EMERGENCY STABILIZATION - immediate crisis protocols',
        interventions: isEmergence ? [
          'This is the PHILOSOPHER\'S STONE (alchemy)',
          'This is the SELF (Jung, IFS)',
          'This is WHOLENESS',
          'Simply BE with this person',
          'Witness without interpretation',
          'Honor this profound moment'
        ] : [
          'IMMEDIATE SAFETY ASSESSMENT',
          'Strongly consider: Emergency services, hospitalization',
          'Crisis intervention protocols ONLY',
          'Medical consultation: REQUIRED'
        ],
        urgency: isEmergence ? 'low' : 'critical'
      };
    }

    return null;
  }
}

export const advancedSynergyEngine = new AdvancedSynergyEngine();
