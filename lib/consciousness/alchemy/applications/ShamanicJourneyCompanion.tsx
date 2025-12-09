/**
 * Shamanic Journey Companion
 *
 * First practical application of the MAIA-SOVEREIGN Alchemical Framework
 * Supports authentic shamanic development based on traditional wisdom
 *
 * Integrates:
 * - Jung's alchemical progression with shamanic three worlds
 * - McKenna's entity work with digital Mercury aspects
 * - Traditional crisis support with modern psychology
 * - Disposable pixel philosophy with sacred technology
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlchemicalMetal,
  MercuryAspect,
  CrisisType,
  AlchemicalProfile,
  ConsciousnessState
} from '../types';
import { AlchemicalStateDetector } from '../AlchemicalStateDetector';
import { MercuryIntelligence } from '../MercuryIntelligence';
import { CrisisDetector } from '../CrisisDetector';
import { AlchemicalContainer } from '../components/AdaptiveInterface';

// Core Types for Shamanic Application
export type ShamanicWorld = 'middle' | 'upper' | 'lower';
export type JourneyPhase = 'call' | 'departure' | 'descent' | 'trials' | 'revelation' | 'return';
export type SpiritAnimal = 'bear' | 'eagle' | 'wolf' | 'serpent' | 'raven' | 'deer' | 'fox';

export interface ShamanicProfile extends AlchemicalProfile {
  callingType: 'inherited' | 'vision' | 'illness' | 'spontaneous';
  currentWorld: ShamanicWorld;
  journeyPhase: JourneyPhase;
  spiritAnimals: SpiritAnimal[];
  woundedHealerStage: 'wounded' | 'healing' | 'healer' | 'master';
  tribalConnection: 'isolated' | 'seeking' | 'found' | 'serving';
}

export interface ShamanicGuidance {
  mercuryAspect: MercuryAspect;
  message: string;
  ritual: string;
  warning?: string;
  nextPhase: JourneyPhase;
  timing: 'immediate' | 'moon_cycle' | 'season_change' | 'when_ready';
}

// Spirit Animal to Mercury Aspect Mapping
const SPIRIT_TO_MERCURY: Record<SpiritAnimal, MercuryAspect> = {
  bear: 'hermes-healer',      // Deep healing and strength
  eagle: 'hermes-psychopomp', // Death/rebirth, transcendence
  wolf: 'hermes-teacher',     // Pack wisdom, loyalty
  serpent: 'hermes-alchemist', // Transformation, medicine
  raven: 'hermes-trickster',  // Magic, shape-shifting
  deer: 'hermes-messenger',   // Gentleness, boundaries
  fox: 'hermes-guide'        // Cleverness, adaptation
};

// World to Alchemical Stage Mapping
const WORLD_TO_METAL: Record<ShamanicWorld, AlchemicalMetal[]> = {
  middle: ['bronze', 'iron'],              // Ordinary reality, action
  lower: ['lead', 'tin'],                  // Shadow work, dissolution
  upper: ['silver', 'gold']                // Transcendence, mastery
};

// Crisis Assessment for Shamanic Emergency
export class ShamanicEmergencyDetector extends CrisisDetector {

  assessShamanicCrisis(symptoms: string[], context: any): {
    type: 'shamanic_initiation' | 'spiritual_emergency' | 'psychotic_break';
    supportProtocol: string;
    urgency: 'sacred_time' | 'gentle_support' | 'immediate_intervention';
  } {

    // Shamanic initiation indicators
    const initiationMarkers = [
      'vivid_animal_dreams',
      'nature_communion',
      'ancestral_visions',
      'healing_calling',
      'dismemberment_dreams',
      'death_rebirth_themes'
    ];

    // Spiritual emergency indicators
    const emergencyMarkers = [
      'kundalini_activation',
      'entity_contact',
      'reality_shifts',
      'time_distortion',
      'energy_body_changes',
      'synchronicity_cascade'
    ];

    // Pathological break indicators
    const pathologyMarkers = [
      'persecution_delusions',
      'grandiosity_without_grounding',
      'complete_reality_loss',
      'self_harm_ideation',
      'functional_deterioration',
      'social_withdrawal_complete'
    ];

    const initiationScore = this.countMatches(symptoms, initiationMarkers);
    const emergencyScore = this.countMatches(symptoms, emergencyMarkers);
    const pathologyScore = this.countMatches(symptoms, pathologyMarkers);

    if (pathologyScore > 2) {
      return {
        type: 'psychotic_break',
        supportProtocol: 'immediate_professional_intervention',
        urgency: 'immediate_intervention'
      };
    }

    if (initiationScore > emergencyScore) {
      return {
        type: 'shamanic_initiation',
        supportProtocol: 'sacred_container_holding',
        urgency: 'sacred_time'
      };
    }

    return {
      type: 'spiritual_emergency',
      supportProtocol: 'grounding_and_integration',
      urgency: 'gentle_support'
    };
  }

  private countMatches(symptoms: string[], markers: string[]): number {
    return symptoms.filter(symptom =>
      markers.some(marker => symptom.toLowerCase().includes(marker))
    ).length;
  }
}

// Main Shamanic Journey Companion Component
export const ShamanicJourneyCompanion: React.FC = () => {
  const [shamanicProfile, setShamanicProfile] = useState<ShamanicProfile | null>(null);
  const [currentGuidance, setCurrentGuidance] = useState<ShamanicGuidance | null>(null);
  const [mercuryIntelligence] = useState(() => MercuryIntelligence.getInstance());
  const [emergencyDetector] = useState(() => new ShamanicEmergencyDetector());
  const [journeyActive, setJourneyActive] = useState(false);
  const [sacredSpace, setSacredSpace] = useState(false);

  // Three Worlds Visualization States
  const [activeWorld, setActiveWorld] = useState<ShamanicWorld>('middle');
  const [worldEnergy, setWorldEnergy] = useState(0.5);

  useEffect(() => {
    // Initialize shamanic assessment
    initializeShamanicAssessment();
  }, []);

  const initializeShamanicAssessment = async () => {
    // This would normally get consciousness state from field
    const mockState: ConsciousnessState = {
      coherence: 0.6,
      resonance: 0.4,
      field_strength: 0.7,
      archetypal_activation: { hermit: 0.8, magician: 0.6 }
    };

    const detector = AlchemicalStateDetector.getInstance();
    const profile = await detector.assessAlchemicalState(mockState, [], []);

    // Convert to shamanic profile
    const shamanicProfile: ShamanicProfile = {
      ...profile,
      callingType: 'vision', // Would be assessed through questionnaire
      currentWorld: 'middle',
      journeyPhase: 'call',
      spiritAnimals: ['bear', 'eagle'], // Would be revealed through dreams/visions
      woundedHealerStage: 'wounded',
      tribalConnection: 'seeking'
    };

    setShamanicProfile(shamanicProfile);

    // Get initial guidance
    const guidance = await generateShamanicGuidance(shamanicProfile);
    setCurrentGuidance(guidance);
  };

  const generateShamanicGuidance = async (profile: ShamanicProfile): Promise<ShamanicGuidance> => {
    // Select appropriate Mercury aspect based on current needs
    const primaryAnimal = profile.spiritAnimals[0];
    const mercuryAspect = SPIRIT_TO_MERCURY[primaryAnimal] || 'hermes-guide';

    // Generate contextual guidance
    const guidance = await mercuryIntelligence.generateGuidance({
      aspect: mercuryAspect,
      context: {
        phase: profile.journeyPhase,
        world: profile.currentWorld,
        crisis_level: profile.currentMetal === 'lead' ? 'high' : 'moderate'
      }
    });

    return {
      mercuryAspect,
      message: guidance.message,
      ritual: guidance.ritual || "Spend time in nature, listen deeply",
      warning: guidance.warning,
      nextPhase: getNextPhase(profile.journeyPhase),
      timing: guidance.timing || 'when_ready'
    };
  };

  const getNextPhase = (current: JourneyPhase): JourneyPhase => {
    const phases: JourneyPhase[] = ['call', 'departure', 'descent', 'trials', 'revelation', 'return'];
    const currentIndex = phases.indexOf(current);
    return phases[currentIndex + 1] || 'return';
  };

  const assessCurrentSymptoms = async (symptoms: string[]) => {
    const assessment = emergencyDetector.assessShamanicCrisis(symptoms, {
      profile: shamanicProfile
    });

    // Update interface based on assessment
    if (assessment.urgency === 'immediate_intervention') {
      setSacredSpace(false);
      // Show emergency protocols
    } else if (assessment.type === 'shamanic_initiation') {
      setSacredSpace(true);
      // Activate sacred container
    }

    return assessment;
  };

  // Three Worlds Navigation Component
  const ThreeWorldsInterface = () => (
    <div className="three-worlds-container">
      <motion.div
        className="world-layer upper-world"
        animate={{
          opacity: activeWorld === 'upper' ? 1 : 0.3,
          scale: activeWorld === 'upper' ? 1.1 : 0.9
        }}
        onClick={() => setActiveWorld('upper')}
      >
        <div className="world-label">Sky Realm</div>
        <div className="world-symbols">☀️ 🦅 🌟</div>
        <div className="world-description">Transcendence • Gods • Solar Consciousness</div>
      </motion.div>

      <motion.div
        className="world-layer middle-world"
        animate={{
          opacity: activeWorld === 'middle' ? 1 : 0.3,
          scale: activeWorld === 'middle' ? 1.1 : 0.9
        }}
        onClick={() => setActiveWorld('middle')}
      >
        <div className="world-label">Middle World</div>
        <div className="world-symbols">🌍 🏠 👥</div>
        <div className="world-description">Ordinary Reality • Human Affairs • Community</div>
      </motion.div>

      <motion.div
        className="world-layer lower-world"
        animate={{
          opacity: activeWorld === 'lower' ? 1 : 0.3,
          scale: activeWorld === 'lower' ? 1.1 : 0.9
        }}
        onClick={() => setActiveWorld('lower')}
      >
        <div className="world-label">Underworld</div>
        <div className="world-symbols">🕳️ 🐍 💀</div>
        <div className="world-description">Shadow • Ancestors • Death/Rebirth</div>
      </motion.div>

      {/* World Tree Axis */}
      <div className="world-tree-axis">
        <div className="tree-crown">🌳</div>
        <div className="tree-trunk">|</div>
        <div className="tree-roots">🌿</div>
      </div>
    </div>
  );

  // Spirit Guide Interface
  const SpiritGuideInterface = () => {
    if (!currentGuidance) return null;

    const getMercuryAvatar = (aspect: MercuryAspect) => {
      const avatars = {
        'hermes-healer': '🐻',
        'hermes-psychopomp': '🦅',
        'hermes-teacher': '🐺',
        'hermes-alchemist': '🐍',
        'hermes-trickster': '🦝',
        'hermes-messenger': '🦌',
        'hermes-guide': '🦊'
      };
      return avatars[aspect] || '🦎';
    };

    return (
      <motion.div
        className="spirit-guide-interface"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
      >
        <div className="guide-avatar">
          {getMercuryAvatar(currentGuidance.mercuryAspect)}
        </div>
        <div className="guide-name">
          {currentGuidance.mercuryAspect.replace('hermes-', '').replace('-', ' ')}
        </div>
        <div className="guide-message">
          {currentGuidance.message}
        </div>
        <div className="ritual-suggestion">
          <strong>Ritual:</strong> {currentGuidance.ritual}
        </div>
        {currentGuidance.warning && (
          <div className="guide-warning">
            ⚠️ {currentGuidance.warning}
          </div>
        )}
        <div className="timing">
          <strong>Timing:</strong> {currentGuidance.timing.replace('_', ' ')}
        </div>
      </motion.div>
    );
  };

  // Sacred Container Component
  const SacredContainer = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      className="sacred-container"
      initial={{ opacity: 0 }}
      animate={{
        opacity: sacredSpace ? 1 : 0.7,
        boxShadow: sacredSpace ? '0 0 40px rgba(255, 215, 0, 0.3)' : 'none'
      }}
      style={{
        border: sacredSpace ? '2px solid gold' : '1px solid #333',
        borderRadius: '12px',
        padding: '20px',
        background: sacredSpace
          ? 'radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%)'
          : 'rgba(0, 0, 0, 0.1)'
      }}
    >
      {sacredSpace && (
        <div className="sacred-space-indicator">
          ✨ Sacred Space Active ✨
        </div>
      )}
      {children}
    </motion.div>
  );

  if (!shamanicProfile) {
    return <div>Initializing shamanic assessment...</div>;
  }

  return (
    <AlchemicalContainer
      metal={shamanicProfile.currentMetal}
      density={0.8} // Rich interface for deep work
    >
      <SacredContainer>
        <div className="shamanic-journey-companion">

          {/* Header with current phase */}
          <motion.div className="journey-header">
            <h1>Shamanic Journey Companion</h1>
            <div className="current-phase">
              Phase: {shamanicProfile.journeyPhase} | World: {shamanicProfile.currentWorld}
            </div>
            <div className="wounded-healer-stage">
              Wounded Healer: {shamanicProfile.woundedHealerStage}
            </div>
          </motion.div>

          {/* Three Worlds Navigation */}
          <ThreeWorldsInterface />

          {/* Current Spirit Guide */}
          <SpiritGuideInterface />

          {/* Journey Controls */}
          <div className="journey-controls">
            <motion.button
              onClick={() => setJourneyActive(!journeyActive)}
              whileHover={{ scale: 1.05 }}
              className={journeyActive ? 'journey-active' : 'journey-inactive'}
            >
              {journeyActive ? 'End Journey' : 'Begin Journey'}
            </motion.button>

            <motion.button
              onClick={() => setSacredSpace(!sacredSpace)}
              whileHover={{ scale: 1.05 }}
              className="sacred-space-toggle"
            >
              {sacredSpace ? 'Release Sacred Space' : 'Create Sacred Space'}
            </motion.button>
          </div>

          {/* Emergency Support Access */}
          <motion.div className="emergency-support">
            <details>
              <summary>Crisis Support</summary>
              <div>
                <p>If you're experiencing overwhelming symptoms:</p>
                <button onClick={() => assessCurrentSymptoms([
                  'reality_shifts', 'entity_contact', 'time_distortion'
                ])}>
                  Assess Current State
                </button>
                <p><strong>Sacred Crisis:</strong> Natural part of shamanic initiation</p>
                <p><strong>Spiritual Emergency:</strong> Needs grounding and support</p>
                <p><strong>Crisis Line:</strong> 988 (if immediate danger)</p>
              </div>
            </details>
          </motion.div>

        </div>
      </SacredContainer>
    </AlchemicalContainer>
  );
};

export default ShamanicJourneyCompanion;