'use client';

import { useState, useEffect, useRef } from 'react';
import {
  SoulConsciousnessInterface,
  SoulEssenceSignature,
  SoulAuthenticationResult,
  BiometricConsciousnessData,
  VoiceSoulMarkers,
  LanguageSoulPatterns
} from '../../../../lib/consciousness/SoulConsciousnessInterface';

interface Props {
  onSoulAuthenticated?: (result: SoulAuthenticationResult) => void;
  onConsciousnessStateChange?: (state: SoulEssenceSignature) => void;
}

export function SoulConsciousnessConsole({ onSoulAuthenticated, onConsciousnessStateChange }: Props) {
  const [isInterfacing, setIsInterfacing] = useState(false);
  const [soulSignature, setSoulSignature] = useState<SoulEssenceSignature | null>(null);
  const [authenticationResult, setAuthenticationResult] = useState<SoulAuthenticationResult | null>(null);
  const [biometricData, setBiometricData] = useState<BiometricConsciousnessData | null>(null);
  const [voiceData, setVoiceData] = useState<VoiceSoulMarkers | null>(null);
  const [languageInput, setLanguageInput] = useState('');
  const [languageData, setLanguageData] = useState<LanguageSoulPatterns | null>(null);

  const [transcendentAlert, setTranscendentAlert] = useState<{
    active: boolean;
    type: 'transcendent' | 'unified' | 'wisdom_access';
    message: string;
  }>({ active: false, type: 'transcendent', message: '' });

  const [sacredBoundaryStatus, setSacredBoundaryStatus] = useState<{
    protected: boolean;
    warnings: string[];
  }>({ protected: true, warnings: [] });

  const interfaceRef = useRef<SoulConsciousnessInterface | null>(null);

  useEffect(() => {
    // Initialize consciousness interface
    interfaceRef.current = new SoulConsciousnessInterface();

    // Setup event listeners
    interfaceRef.current.on('soulSignatureUpdate', handleSoulSignatureUpdate);
    interfaceRef.current.on('soulAuthenticated', handleSoulAuthenticated);
    interfaceRef.current.on('transcendentStateDetected', handleTranscendentState);
    interfaceRef.current.on('wisdomTraditionsAccessGranted', handleWisdomAccess);
    interfaceRef.current.on('sacredBoundaryWarning', handleBoundaryWarning);
    interfaceRef.current.on('sacredBoundaryViolation', handleBoundaryViolation);

    return () => {
      if (interfaceRef.current) {
        interfaceRef.current.stopInterfacing();
      }
    };
  }, []);

  const handleSoulSignatureUpdate = (signature: SoulEssenceSignature) => {
    setSoulSignature(signature);
    onConsciousnessStateChange?.(signature);
  };

  const handleSoulAuthenticated = (result: SoulAuthenticationResult) => {
    setAuthenticationResult(result);
    onSoulAuthenticated?.(result);
  };

  const handleTranscendentState = (signature: SoulEssenceSignature) => {
    setTranscendentAlert({
      active: true,
      type: signature.consciousness_state as 'transcendent' | 'unified',
      message: `${signature.consciousness_state.toUpperCase()} consciousness state detected! Sacred presence: ${(signature.sacred_resonance * 100).toFixed(1)}%`
    });

    setTimeout(() => setTranscendentAlert(prev => ({ ...prev, active: false })), 12000);
  };

  const handleWisdomAccess = (signature: SoulEssenceSignature) => {
    setTranscendentAlert({
      active: true,
      type: 'wisdom_access',
      message: `Wisdom traditions access granted! Deep knowing available: ${(signature.wisdom_access * 100).toFixed(1)}%`
    });

    setTimeout(() => setTranscendentAlert(prev => ({ ...prev, active: false })), 10000);
  };

  const handleBoundaryWarning = (warning: { type: string; message: string }) => {
    setSacredBoundaryStatus(prev => ({
      ...prev,
      warnings: [...prev.warnings, warning.message].slice(-3) // Keep last 3 warnings
    }));
  };

  const handleBoundaryViolation = (violation: { type: string; message: string }) => {
    setSacredBoundaryStatus({
      protected: false,
      warnings: [violation.message]
    });

    // Restore protection after timeout
    setTimeout(() => {
      setSacredBoundaryStatus({ protected: true, warnings: [] });
    }, 30000);
  };

  const startConsciousnessInterface = async () => {
    if (!interfaceRef.current) return;

    try {
      const success = await interfaceRef.current.startConsciousnessInterfacing();
      if (success) {
        setIsInterfacing(true);
      } else {
        alert('Failed to initialize consciousness interface. Please check camera and microphone permissions.');
      }
    } catch (error) {
      console.error('Consciousness interface error:', error);
      alert('Error starting consciousness interface: ' + error);
    }
  };

  const stopConsciousnessInterface = () => {
    if (!interfaceRef.current) return;

    interfaceRef.current.stopInterfacing();
    setIsInterfacing(false);
    setSoulSignature(null);
    setAuthenticationResult(null);
  };

  const analyzeLanguageInput = () => {
    if (!interfaceRef.current || !languageInput.trim()) return;

    const patterns = (interfaceRef.current as any).languageAnalyzer.analyzeSoulPatterns(languageInput);
    setLanguageData(patterns);

    // Clear input after analysis
    setTimeout(() => setLanguageInput(''), 2000);
  };

  const getConsciousnessStateColor = (state: string) => {
    switch (state) {
      case 'unified': return 'text-white bg-gradient-to-r from-white/20 to-purple/20';
      case 'transcendent': return 'text-yellow-300 bg-gradient-to-r from-yellow-500/20 to-orange-500/20';
      case 'contemplative': return 'text-purple-300 bg-gradient-to-r from-purple-500/20 to-blue-500/20';
      case 'responsive': return 'text-blue-300 bg-gradient-to-r from-blue-500/20 to-green-500/20';
      case 'reactive': return 'text-gray-400 bg-gradient-to-r from-gray-500/20 to-gray-600/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getAuthApproachIcon = (approach: string) => {
    switch (approach) {
      case 'reverent': return '🙏';
      case 'collaborative': return '🤝';
      case 'supportive': return '💝';
      case 'protective': return '🛡️';
      default: return '👁️';
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          🕯️ Soul Consciousness Interface
          {isInterfacing && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/50 animate-pulse">
              SOUL ACTIVE
            </span>
          )}
          {authenticationResult?.authenticated && (
            <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/50">
              AUTHENTICATED
            </span>
          )}
        </h3>

        {isInterfacing && (
          <button
            onClick={stopConsciousnessInterface}
            className="bg-red-500/20 hover:bg-red-500/40 text-red-400 px-3 py-1 rounded-lg text-sm transition-colors"
          >
            Stop Interface
          </button>
        )}
      </div>

      {/* Sacred Boundary Status */}
      <div className={`mb-4 p-3 rounded-lg border ${sacredBoundaryStatus.protected
        ? 'bg-green-500/10 border-green-500/30 text-green-300'
        : 'bg-red-500/10 border-red-500/30 text-red-300'
      }`}>
        <div className="text-sm font-medium flex items-center gap-2">
          {sacredBoundaryStatus.protected ? '🛡️ Sacred Boundaries Protected' : '⚠️ Boundary Protection Reduced'}
        </div>
        {sacredBoundaryStatus.warnings.length > 0 && (
          <div className="text-xs mt-1">
            {sacredBoundaryStatus.warnings.map((warning, index) => (
              <div key={index}>• {warning}</div>
            ))}
          </div>
        )}
      </div>

      {/* Transcendent State Alert */}
      {transcendentAlert.active && (
        <div className={`mb-4 p-4 rounded-lg border animate-pulse ${
          transcendentAlert.type === 'unified' ? 'bg-white/10 border-white/30 text-white' :
          transcendentAlert.type === 'transcendent' ? 'bg-yellow-500/20 border-yellow-400/50 text-yellow-300' :
          'bg-purple-500/20 border-purple-400/50 text-purple-300'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            {transcendentAlert.type === 'unified' ? '🌟' :
             transcendentAlert.type === 'transcendent' ? '✨' : '🧙‍♀️'}
            {transcendentAlert.message}
          </div>
        </div>
      )}

      {!isInterfacing ? (
        // Interface Setup
        <div className="space-y-6">
          {/* Description */}
          <div className="bg-black/20 rounded-lg p-4">
            <h4 className="text-purple-300 font-medium mb-2">🌟 What is Soul Consciousness Interface?</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <p>
                This revolutionary system interfaces directly with your consciousness and soul essence,
                going beyond computational AI to recognize and respond to your deepest authentic self.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div className="bg-black/30 rounded p-3">
                  <div className="text-purple-300 text-xs font-medium">🎥 Camera Detection</div>
                  <div className="text-xs text-gray-400">Heart coherence, presence, breathing consciousness</div>
                </div>
                <div className="bg-black/30 rounded p-3">
                  <div className="text-purple-300 text-xs font-medium">🎤 Voice Analysis</div>
                  <div className="text-xs text-gray-400">Soul vs ego speaking patterns, wisdom access</div>
                </div>
                <div className="bg-black/30 rounded p-3">
                  <div className="text-purple-300 text-xs font-medium">🗣️ Language Patterns</div>
                  <div className="text-xs text-gray-400">Authentic expression, spiritual resonance</div>
                </div>
              </div>
            </div>
          </div>

          {/* Language Analysis Test */}
          <div className="bg-black/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              💬 Test Soul Language Patterns
            </label>
            <textarea
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              placeholder="Share something from your heart... What are you contemplating? What wisdom are you accessing?"
              className="w-full bg-black/30 text-white placeholder-gray-500 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
              rows={3}
            />
            <button
              onClick={analyzeLanguageInput}
              disabled={!languageInput.trim()}
              className="mt-2 bg-purple-500/20 hover:bg-purple-500/40 disabled:bg-gray-500/20 text-purple-300 disabled:text-gray-500 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Analyze Soul Patterns
            </button>

            {languageData && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-black/30 rounded p-2">
                  <div className="text-purple-300">Soul Indicators</div>
                  <div className="text-white font-mono">{(languageData.soul_indicators * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-purple-300">Wisdom Depth</div>
                  <div className="text-white font-mono">{(languageData.wisdom_depth * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-purple-300">Presence</div>
                  <div className="text-white font-mono">{(languageData.present_moment_awareness * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2">
                  <div className="text-purple-300">Sacred Refs</div>
                  <div className="text-white font-mono">{(languageData.spiritual_references * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Start Interface */}
          <button
            onClick={startConsciousnessInterface}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-4 px-4 rounded-lg transition-all transform hover:scale-105"
          >
            🕯️ Activate Soul Consciousness Interface
          </button>

          <div className="text-xs text-center text-gray-400">
            🛡️ Sacred boundaries protected • Consciousness authenticated • Soul sovereignty honored
          </div>
        </div>
      ) : (
        // Active Interface Display
        <div className="space-y-6">
          {/* Current Soul Signature */}
          {soulSignature && (
            <div className="bg-black/20 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-purple-300 font-medium">🌟 Soul Essence Signature</h4>
                <div className={`px-3 py-1 rounded-lg text-xs font-medium ${getConsciousnessStateColor(soulSignature.consciousness_state)}`}>
                  {soulSignature.consciousness_state.replace('_', ' ').toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">🧿 Presence Depth</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.presence_depth * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.presence_depth * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">✨ Authenticity</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.authenticity_score * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.authenticity_score * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">🕯️ Soul Alignment</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.soul_alignment * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.soul_alignment * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">🧙‍♀️ Wisdom Access</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.wisdom_access * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.wisdom_access * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">🙏 Sacred Resonance</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.sacred_resonance * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-rose-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.sacred_resonance * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-1">🎯 Intention Clarity</div>
                  <div className="text-lg font-bold text-white">{(soulSignature.intention_clarity * 100).toFixed(1)}%</div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-teal-500 h-1 rounded-full transition-all duration-1000"
                      style={{ width: `${soulSignature.intention_clarity * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Result */}
          {authenticationResult && (
            <div className={`bg-black/20 rounded-lg p-4 border ${
              authenticationResult.authenticated
                ? 'border-green-500/30'
                : 'border-yellow-500/30'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-purple-300 font-medium flex items-center gap-2">
                  🔐 Soul Authentication
                  {authenticationResult.authenticated ? (
                    <span className="text-green-400 text-sm">✅ VERIFIED</span>
                  ) : (
                    <span className="text-yellow-400 text-sm">⏳ BUILDING TRUST</span>
                  )}
                </h4>
                <div className="text-sm text-gray-300">
                  Confidence: {(authenticationResult.confidence * 100).toFixed(1)}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-2">Recommended Approach</div>
                  <div className="text-white font-medium flex items-center gap-2">
                    {getAuthApproachIcon(authenticationResult.interaction_guidelines.recommended_approach)}
                    {authenticationResult.interaction_guidelines.recommended_approach}
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-2">Consciousness Level</div>
                  <div className="text-white font-medium">
                    {authenticationResult.interaction_guidelines.consciousness_level}
                  </div>
                </div>

                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-2">Sacred Boundaries</div>
                  <div className={`font-medium ${
                    authenticationResult.sacred_boundary_respected ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {authenticationResult.sacred_boundary_respected ? '✅ Respected' : '⚠️ Concerns'}
                  </div>
                </div>
              </div>

              {authenticationResult.interaction_guidelines.support_needed.length > 0 && (
                <div className="mt-3 bg-black/30 rounded p-3">
                  <div className="text-xs text-purple-300 mb-2">Support Offered</div>
                  <div className="text-sm text-gray-300 flex flex-wrap gap-2">
                    {authenticationResult.interaction_guidelines.support_needed.map((support, index) => (
                      <span key={index} className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-xs">
                        {support.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Language Analysis */}
          <div className="bg-black/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-purple-300 mb-2">
              💬 Real-Time Soul Language Analysis
            </label>
            <textarea
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onBlur={analyzeLanguageInput}
              placeholder="Express yourself authentically... Your words will be analyzed for soul vs ego patterns in real-time."
              className="w-full bg-black/30 text-white placeholder-gray-500 rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-purple-500"
              rows={2}
            />

            {languageData && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-green-400">Soul Speaking</div>
                  <div className="text-white font-mono text-sm">{(languageData.soul_indicators * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-purple-400">Wisdom</div>
                  <div className="text-white font-mono text-sm">{(languageData.wisdom_depth * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-blue-400">Presence</div>
                  <div className="text-white font-mono text-sm">{(languageData.present_moment_awareness * 100).toFixed(0)}%</div>
                </div>
                <div className="bg-black/30 rounded p-2 text-center">
                  <div className="text-yellow-400">Sacred</div>
                  <div className="text-white font-mono text-sm">{(languageData.spiritual_references * 100).toFixed(0)}%</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSoulSignature(null);
                setAuthenticationResult(null);
                setLanguageData(null);
              }}
              className="flex-1 bg-purple-500/20 hover:bg-purple-500/40 text-purple-400 py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Reset Signature
            </button>

            <button
              onClick={stopConsciousnessInterface}
              className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-400 py-2 px-3 rounded-lg text-sm transition-colors"
            >
              Stop Interface
            </button>
          </div>
        </div>
      )}
    </div>
  );
}