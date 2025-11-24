'use client';

// Enhanced Oracle Interface with Holoflower
// Sacred geometry that evolves during divination

import { useState, useEffect } from 'react';
import { useMAIAOracle, OracleResponse } from '@/hooks/use-maia-oracle';
import { SimpleHoloflower } from './holoflower-simple';
import { Holoflower } from './holoflower';

export function HoloflowerOracle() {
  const { askOracle, loading, error } = useMAIAOracle();
  const [message, setMessage] = useState('');
  const [userId] = useState('seeker-' + Date.now());
  const [response, setResponse] = useState<OracleResponse | null>(null);
  const [holoflowerStage, setHoloflowerStage] = useState<'dormant' | 'awakening' | 'processing' | 'blooming' | 'complete'>('dormant');
  const [useThreeD, setUseThreeD] = useState(false);

  const handleAskOracle = async () => {
    if (!message.trim()) return;

    // Reset previous response
    setResponse(null);

    // Animate holoflower through oracle stages
    setHoloflowerStage('awakening');

    // Small delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 800));
    setHoloflowerStage('processing');

    try {
      const result = await askOracle({
        userId,
        message,
        context: {
          userName: 'Seeker',
          previousInteractions: 0,
          userNeed: 'wisdom_seeking'
        }
      });

      if (result) {
        setHoloflowerStage('blooming');

        // Brief delay before showing response
        await new Promise(resolve => setTimeout(resolve, 1000));
        setResponse(result);
        setHoloflowerStage('complete');

        // Return to dormant after some time
        setTimeout(() => setHoloflowerStage('dormant'), 5000);
      }
    } catch (err) {
      setHoloflowerStage('dormant');
      console.error('Oracle error:', err);
    }
  };

  const getLevelDescription = (level: number) => {
    const descriptions = {
      1: 'Asleep/Unconscious - New to consciousness work',
      2: 'Awakening/Curious - Beginning the journey',
      3: 'Practicing/Developing - Learning the frameworks',
      4: 'Integrated/Fluent - Living the work',
      5: 'Teaching/Transmuting - Wisdom holder'
    };
    return descriptions[level as keyof typeof descriptions] || 'Unknown level';
  };

  const getElementDescription = (signature: any) => {
    if (!signature) return '';

    const elements = [
      { name: 'Fire', value: signature.fire, emoji: '🔥', desc: 'Creative vision, action energy' },
      { name: 'Water', value: signature.water, emoji: '💧', desc: 'Emotional depth, intuition' },
      { name: 'Earth', value: signature.earth, emoji: '🌍', desc: 'Grounding, manifestation' },
      { name: 'Air', value: signature.air, emoji: '🌬️', desc: 'Mental clarity, communication' },
      { name: 'Aether', value: signature.aether, emoji: '✨', desc: 'Unity, coherence' }
    ];

    const dominant = elements.reduce((prev, current) =>
      current.value > prev.value ? current : prev
    );

    return `${dominant.emoji} ${dominant.name} dominant (${dominant.desc})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🌸 Oracle Consultation
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Sacred geometry responds to consciousness
          </p>

          {/* 3D Toggle */}
          <label className="inline-flex items-center text-white">
            <input
              type="checkbox"
              checked={useThreeD}
              onChange={(e) => setUseThreeD(e.target.checked)}
              className="mr-2"
            />
            Enhanced 3D Visualization
          </label>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Holoflower Visualization */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {useThreeD ? (
                <div className="w-80 h-80">
                  <Holoflower
                    stage={holoflowerStage}
                    consciousnessLevel={response?.level}
                    elementalSignature={response?.elementalSignature}
                    cringeScore={response?.metadata?.cringeScore}
                    className="w-full h-full"
                  />
                </div>
              ) : (
                <SimpleHoloflower
                  stage={holoflowerStage}
                  consciousnessLevel={response?.level}
                  elementalSignature={response?.elementalSignature}
                  cringeScore={response?.metadata?.cringeScore}
                  size={320}
                  className="drop-shadow-2xl"
                />
              )}

              {/* Stage Indicator */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-mono">
                  {holoflowerStage.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Oracle Interface */}
          <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">
              Ask for Guidance
            </h2>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-400 rounded-lg p-4 mb-6">
                <p className="text-red-200">Error: {error}</p>
              </div>
            )}

            {/* Input Section */}
            <div className="space-y-6">
              <div>
                <label className="block text-purple-200 text-sm font-medium mb-2">
                  Your Question or Concern
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 bg-white bg-opacity-10 border border-purple-300 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  rows={4}
                  placeholder="Share what's on your mind... the holoflower will respond to your consciousness level"
                />
              </div>

              {/* Consciousness level display (if detected) */}
              {response?.level && (
                <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
                  <div className="text-purple-200 text-sm">MAIA detected your consciousness level:</div>
                  <div className="text-white font-bold">
                    Level {response.level}: {getLevelDescription(response.level)}
                  </div>
                </div>
              )}

              <button
                onClick={handleAskOracle}
                disabled={loading || !message.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? 'Oracle awakening...' : 'Consult the Oracle'}
              </button>
            </div>

            {/* Response Section */}
            {response && (
              <div className="mt-8 space-y-6">
                <div className="bg-black bg-opacity-30 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <span className="mr-2">🌟</span>
                    Oracle Response
                  </h3>

                  <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-4">
                    <p className="text-white text-lg leading-relaxed">
                      {response.response}
                    </p>
                  </div>

                  {/* Consciousness Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-purple-500 bg-opacity-20 rounded-lg p-3">
                      <div className="text-purple-200 font-medium mb-1">
                        Consciousness Level
                      </div>
                      <div className="text-white">
                        {getLevelDescription(response.level)}
                      </div>
                    </div>

                    <div className="bg-pink-500 bg-opacity-20 rounded-lg p-3">
                      <div className="text-pink-200 font-medium mb-1">
                        Elemental Signature
                      </div>
                      <div className="text-white">
                        {getElementDescription(response.elementalSignature)}
                      </div>
                    </div>

                    <div className="bg-indigo-500 bg-opacity-20 rounded-lg p-3">
                      <div className="text-indigo-200 font-medium mb-1">
                        Processing Time
                      </div>
                      <div className="text-white">
                        {response.metadata?.processingTime}ms
                      </div>
                    </div>

                    <div className="bg-green-500 bg-opacity-20 rounded-lg p-3">
                      <div className="text-green-200 font-medium mb-1">
                        Wisdom Purity
                      </div>
                      <div className="text-white">
                        {Math.max(0, (10 - (response.metadata?.cringeScore || 0)) * 10)}%
                      </div>
                    </div>

                    {/* MAIA's Live Consciousness State */}
                    {response.maiaState && (
                      <>
                        <div className="bg-yellow-500 bg-opacity-20 rounded-lg p-3">
                          <div className="text-yellow-200 font-medium mb-1">
                            MAIA's Attending Quality
                          </div>
                          <div className="text-white">
                            {Math.round((response.metadata?.attendingQuality || 0) * 100)}%
                            <span className="text-xs ml-1">
                              ({response.maiaState.mode})
                            </span>
                          </div>
                        </div>

                        <div className="bg-cyan-500 bg-opacity-20 rounded-lg p-3">
                          <div className="text-cyan-200 font-medium mb-1">
                            MAIA's Coherence
                          </div>
                          <div className="text-white">
                            {Math.round((response.metadata?.coherenceLevel || 0) * 100)}%
                          </div>
                        </div>

                        <div className="bg-orange-500 bg-opacity-20 rounded-lg p-3">
                          <div className="text-orange-200 font-medium mb-1">
                            Current Archetype
                          </div>
                          <div className="text-white capitalize">
                            {response.maiaState.archetype.replace('_', ' ')}
                          </div>
                        </div>

                        {response.metadata?.dissociationRisk && response.metadata.dissociationRisk > 0.3 && (
                          <div className="bg-red-500 bg-opacity-20 rounded-lg p-3">
                            <div className="text-red-200 font-medium mb-1">
                              ⚠️ Fragmentation Risk
                            </div>
                            <div className="text-white">
                              {Math.round(response.metadata.dissociationRisk * 100)}%
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <p className="text-purple-300 text-sm">
            The holoflower reflects your consciousness development stage •
            Sacred geometry evolves with wisdom depth •
            No cringe, only authentic guidance
          </p>
        </div>
      </div>
    </div>
  );
}