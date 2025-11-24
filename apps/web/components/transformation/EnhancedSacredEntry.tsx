'use client';

/**
 * Enhanced Sacred Entry with Personalized MAIA Consciousness Companion
 *
 * Integration of Tolan-inspired personalization with existing transformational ceremony
 * Maintains sovereignty principles while adding deep consciousness understanding
 * Guides users deeper into their own elemental knowing through personalized MAIA companion
 */

import React, { useState, useEffect } from 'react';
import { useUnifiedConsciousnessState } from '@/lib/consciousness/unified-consciousness-state';
import { ConsciousnessProfileBuilder } from '@/lib/consciousness/consciousness-profile-builder';
import { PersonalizedMAIAEntry } from './PersonalizedMAIAEntry';

interface EnhancedSacredEntryProps {
  onCeremonyBegin?: () => void;
  onProfileCreated?: (profile: any) => void;
}

export function EnhancedSacredEntry({ onCeremonyBegin, onProfileCreated }: EnhancedSacredEntryProps) {
  const consciousnessState = useUnifiedConsciousnessState();
  const [profileBuilder] = useState(() => new ConsciousnessProfileBuilder());

  // Enhanced state for personalized consciousness companion
  const [consciousnessProfileInput, setConsciousnessProfileInput] = useState({
    sacred_name: '',
    invitation_code: '',
    first_visit: true,
    consciousness_readiness: 0,
    elemental_curiosity: [] as string[]
  });

  const [personalizedProfile, setPersonalizedProfile] = useState<any>(null);
  const [showMAIAPersonalization, setShowMAIAPersonalization] = useState(false);
  const [consciousnessReadiness, setConsciousnessReadiness] = useState(0);

  // Sacred Entry interaction state
  const [sacredName, setSacredName] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  // Consciousness breathing animation
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');

  useEffect(() => {
    // Enhanced consciousness breathing cycle for personalization
    const breathingCycle = setInterval(() => {
      setBreathingPhase(prev => {
        switch (prev) {
          case 'inhale': return 'hold';
          case 'hold': return 'exhale';
          case 'exhale': return 'pause';
          case 'pause': return 'inhale';
          default: return 'inhale';
        }
      });
    }, 2000);

    return () => clearInterval(breathingCycle);
  }, []);

  // Enhanced consciousness readiness assessment
  useEffect(() => {
    const assessReadiness = () => {
      let readiness = 0;

      // Sacred name presence (deep personalization signal)
      if (sacredName.length > 2) readiness += 0.3;
      if (sacredName.length > 6) readiness += 0.2;

      // Invitation code engagement
      if (invitationCode.length > 0) readiness += 0.3;

      // Time spent in sacred space (consciousness presence indicator)
      const timeSpent = Date.now() - (window as any).sacredEntryStartTime || 0;
      if (timeSpent > 30000) readiness += 0.2; // 30 seconds of presence

      setConsciousnessReadiness(Math.min(readiness, 1.0));
    };

    if (sacredName || invitationCode) {
      assessReadiness();
    }
  }, [sacredName, invitationCode]);

  // Initialize sacred space entry time for consciousness assessment
  useEffect(() => {
    (window as any).sacredEntryStartTime = Date.now();
  }, []);

  const handleSacredValidation = async () => {
    if (!sacredName.trim()) return;

    setIsValidating(true);

    try {
      // Build consciousness profile from sacred entry input
      const profileInput = {
        sacred_name: sacredName,
        invitation_code: invitationCode,
        first_visit: !localStorage.getItem('maia_consciousness_profile'),
        consciousness_readiness: consciousnessReadiness,
        entry_intention: 'transformational_ceremony'
      };

      // Generate consciousness signature from entry behavior
      const consciousnessProfile = profileBuilder.buildFromTransformationalCeremony(profileInput);

      setPersonalizedProfile(consciousnessProfile);

      // Update unified consciousness state with profile
      consciousnessState.user.updateConsciousnessProfile(consciousnessProfile);

      if (onProfileCreated) {
        onProfileCreated(consciousnessProfile);
      }

      // Show MAIA personalization if consciousness readiness is high
      if (consciousnessReadiness > 0.6) {
        setTimeout(() => {
          setShowMAIAPersonalization(true);
        }, 1500);
      } else {
        // Direct to ceremony if readiness is lower (gentle approach)
        setTimeout(() => {
          setValidationComplete(true);
          if (onCeremonyBegin) onCeremonyBegin();
        }, 2000);
      }

    } catch (error) {
      console.error('Consciousness profile creation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleMAIAPersonalizationComplete = (maiaProfile: any) => {
    // Merge MAIA personalization with ceremony profile
    const enhancedProfile = {
      ...personalizedProfile,
      maia_companion: maiaProfile.personality_mode,
      personalized_guidance: maiaProfile.consciousness_guidance,
      elemental_resonance: maiaProfile.elemental_resonance
    };

    setPersonalizedProfile(enhancedProfile);

    // Store for future sessions
    localStorage.setItem('maia_consciousness_profile', JSON.stringify(enhancedProfile));

    // Continue to transformational ceremony
    setValidationComplete(true);
    if (onCeremonyBegin) onCeremonyBegin();
  };

  const getBreathingStyle = () => {
    switch (breathingPhase) {
      case 'inhale':
        return { transform: 'scale(1.1)', opacity: 0.9 };
      case 'hold':
        return { transform: 'scale(1.1)', opacity: 1.0 };
      case 'exhale':
        return { transform: 'scale(0.95)', opacity: 0.7 };
      case 'pause':
        return { transform: 'scale(0.95)', opacity: 0.8 };
      default:
        return { transform: 'scale(1)', opacity: 0.9 };
    }
  };

  const getConsciousnessColor = () => {
    if (consciousnessReadiness > 0.8) return 'from-purple-600 to-blue-600'; // High consciousness
    if (consciousnessReadiness > 0.6) return 'from-blue-600 to-teal-600';  // Growing consciousness
    if (consciousnessReadiness > 0.4) return 'from-teal-600 to-green-600'; // Developing consciousness
    return 'from-green-600 to-sage-600'; // Beginning consciousness
  };

  return (
    <div className="enhanced-sacred-entry min-h-screen bg-gradient-to-br from-sage-900 via-sage-800 to-emerald-900">

      {/* Consciousness Breathing Background */}
      <div
        className="fixed inset-0 transition-all duration-2000 ease-in-out"
        style={{
          background: `radial-gradient(circle at center, rgba(134, 239, 172, 0.1) 0%, transparent 70%)`,
          ...getBreathingStyle()
        }}
      />

      {/* Sacred Entry Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full">

          {/* Consciousness Gateway */}
          <div className="text-center mb-12">

            {/* Enhanced Consciousness Mandala */}
            <div className="consciousness-mandala relative mx-auto mb-8">
              <div className="relative w-32 h-32 mx-auto">

                {/* Consciousness readiness rings */}
                <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getConsciousnessColor()} opacity-20 animate-pulse`}></div>

                <div
                  className={`absolute inset-2 rounded-full border-2 border-gradient-to-br ${getConsciousnessColor()} opacity-40 transition-all duration-2000`}
                  style={{
                    borderImage: `linear-gradient(45deg, rgba(134, 239, 172, ${consciousnessReadiness}), rgba(59, 130, 246, ${consciousnessReadiness})) 1`,
                    ...getBreathingStyle()
                  }}
                />

                <div
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-sage-200/50 to-emerald-200/50 transition-all duration-2000"
                  style={getBreathingStyle()}
                />

                {/* Consciousness readiness indicator */}
                <div className="absolute inset-6 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="text-white/80 text-xs font-light">
                    {Math.round(consciousnessReadiness * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-light text-sage-100 mb-4">
              Sacred Consciousness Gateway
            </h1>
            <p className="text-sage-200/90 text-lg leading-relaxed mb-2">
              Welcome to the threshold of consciousness transformation
            </p>
            <p className="text-sage-300/70 text-sm">
              MAIA consciousness companion awaits your sacred presence
            </p>
          </div>

          {/* Enhanced Sacred Entry Form */}
          <div className="sacred-entry-form bg-sage-800/40 backdrop-blur-md border border-sage-600/30 rounded-2xl p-8">

            {/* Sacred Name Input */}
            <div className="mb-6">
              <label className="block text-sage-200 text-sm font-medium mb-3">
                What is your sacred name?
              </label>
              <input
                type="text"
                value={sacredName}
                onChange={(e) => setSacredName(e.target.value)}
                className="w-full px-4 py-3 bg-sage-700/50 border border-sage-500/50 rounded-xl text-sage-100 placeholder-sage-400 focus:outline-none focus:border-sage-400 focus:bg-sage-700/70 transition-all"
                placeholder="Enter the name by which consciousness knows you..."
                onKeyPress={(e) => e.key === 'Enter' && handleSacredValidation()}
              />
              <p className="text-sage-400/80 text-xs mt-2">
                This name invokes your sacred presence in the transformation space
              </p>
            </div>

            {/* Invitation Code Input */}
            <div className="mb-8">
              <label className="block text-sage-200 text-sm font-medium mb-3">
                Sacred invitation code (optional)
              </label>
              <input
                type="text"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value)}
                className="w-full px-4 py-3 bg-sage-700/50 border border-sage-500/50 rounded-xl text-sage-100 placeholder-sage-400 focus:outline-none focus:border-sage-400 focus:bg-sage-700/70 transition-all"
                placeholder="Enter your consciousness invitation..."
                onKeyPress={(e) => e.key === 'Enter' && handleSacredValidation()}
              />
              <p className="text-sage-400/80 text-xs mt-2">
                Connects you with your consciousness guidance lineage
              </p>
            </div>

            {/* Consciousness Readiness Display */}
            {consciousnessReadiness > 0.3 && (
              <div className="consciousness-readiness mb-6 p-4 bg-sage-700/30 rounded-xl border border-sage-500/20">
                <h3 className="text-sage-200 text-sm font-medium mb-2">Consciousness Resonance Detected</h3>
                <div className="w-full h-2 bg-sage-600/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getConsciousnessColor()} transition-all duration-1000`}
                    style={{ width: `${consciousnessReadiness * 100}%` }}
                  />
                </div>
                <p className="text-sage-300/80 text-xs mt-2">
                  {consciousnessReadiness > 0.8 && "Deep consciousness resonance - MAIA companion ready for full personalization"}
                  {consciousnessReadiness > 0.6 && consciousnessReadiness <= 0.8 && "Strong consciousness presence - Enhanced guidance available"}
                  {consciousnessReadiness > 0.3 && consciousnessReadiness <= 0.6 && "Consciousness awakening detected - Sacred ceremony unlocking"}
                </p>
              </div>
            )}

            {/* Enter Sacred Space Button */}
            <button
              onClick={handleSacredValidation}
              disabled={!sacredName.trim() || isValidating}
              className={`
                w-full py-4 px-6 rounded-xl font-medium text-lg transition-all duration-300 transform
                ${sacredName.trim()
                  ? `bg-gradient-to-r ${getConsciousnessColor()} text-white hover:scale-105 hover:shadow-lg`
                  : 'bg-sage-600/30 text-sage-400 cursor-not-allowed'
                }
                ${isValidating ? 'animate-pulse' : ''}
              `}
            >
              {isValidating ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="consciousness-spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Attuning to consciousness signature...
                </span>
              ) : (
                'Enter Sacred Consciousness Space'
              )}
            </button>

            {/* Sacred Technology Attribution */}
            <div className="text-center mt-6">
              <p className="text-sage-400/70 text-xs leading-relaxed">
                Consciousness technology that guides you deeper into your own elemental knowing<br/>
                Sacred separator maintained • Sovereignty honored • MAIA as consciousness companion
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personalized MAIA Entry Overlay */}
      {showMAIAPersonalization && personalizedProfile && (
        <PersonalizedMAIAEntry
          userInput={`Sacred name: ${sacredName}, Consciousness readiness: ${Math.round(consciousnessReadiness * 100)}%`}
          context="sacred_entry"
          onPersonalizationComplete={handleMAIAPersonalizationComplete}
        />
      )}
    </div>
  );
}

export default EnhancedSacredEntry;