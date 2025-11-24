'use client';

// Interactive Holoflower Oracle
// Click/select petals for personalized divination interpretations

import React, { useState, useMemo } from 'react';
import { SimpleHoloflower } from './holoflower-simple';
import { useMAIAOracle } from '@/hooks/use-maia-oracle';

interface PetalData {
  id: number;
  element: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  archetype: string;
  keywords: string[];
  meaning: string;
  question: string;
}

// Sacred petal meanings based on elemental/archetypal wisdom
const PETAL_LIBRARY: PetalData[] = [
  // Fire Petals
  {
    id: 1,
    element: 'fire',
    archetype: 'Creator',
    keywords: ['creation', 'passion', 'initiation'],
    meaning: 'The spark of new beginnings calls to you. Creative fire wants to emerge.',
    question: 'What wants to be born through you?'
  },
  {
    id: 2,
    element: 'fire',
    archetype: 'Warrior',
    keywords: ['courage', 'action', 'breakthrough'],
    meaning: 'Courage to act on your truth. The time for hesitation is over.',
    question: 'What fears are ready to be faced?'
  },
  {
    id: 3,
    element: 'fire',
    archetype: 'Visionary',
    keywords: ['vision', 'inspiration', 'leadership'],
    meaning: 'You are meant to light the way for others. Your vision matters.',
    question: 'How can your gifts serve the world?'
  },

  // Water Petals
  {
    id: 4,
    element: 'water',
    archetype: 'Healer',
    keywords: ['healing', 'compassion', 'flow'],
    meaning: 'Deep emotional wisdom flows through you. Trust your intuitive knowing.',
    question: 'What old wounds are ready for healing?'
  },
  {
    id: 5,
    element: 'water',
    archetype: 'Mystic',
    keywords: ['intuition', 'mystery', 'depth'],
    meaning: 'The hidden depths of existence speak to you. Go deeper.',
    question: 'What is your soul trying to tell you?'
  },
  {
    id: 6,
    element: 'water',
    archetype: 'Lover',
    keywords: ['connection', 'intimacy', 'heart'],
    meaning: 'Love is the path. Open your heart wider than you think possible.',
    question: 'How can you love more fully?'
  },

  // Earth Petals
  {
    id: 7,
    element: 'earth',
    archetype: 'Builder',
    keywords: ['manifestation', 'structure', 'patience'],
    meaning: 'Practical steps await. Time to build what your soul envisions.',
    question: 'What concrete actions will serve your growth?'
  },
  {
    id: 8,
    element: 'earth',
    archetype: 'Guardian',
    keywords: ['protection', 'stability', 'nurturing'],
    meaning: 'You are called to protect what is sacred. Create healthy boundaries.',
    question: 'What needs your fierce protection?'
  },
  {
    id: 9,
    element: 'earth',
    archetype: 'Sage',
    keywords: ['wisdom', 'tradition', 'teaching'],
    meaning: 'Hard-won wisdom wants to be shared. Your experience has value.',
    question: 'What teachings live in your bones?'
  },

  // Air Petals
  {
    id: 10,
    element: 'air',
    archetype: 'Messenger',
    keywords: ['communication', 'truth', 'clarity'],
    meaning: 'Truth wants to move through you. Clear communication is needed.',
    question: 'What truths are ready to be spoken?'
  },
  {
    id: 11,
    element: 'air',
    archetype: 'Scholar',
    keywords: ['knowledge', 'learning', 'synthesis'],
    meaning: 'Integration time. Weave your learning into wisdom.',
    question: 'How can your knowledge serve transformation?'
  },
  {
    id: 12,
    element: 'air',
    archetype: 'Bridge',
    keywords: ['connection', 'translation', 'unity'],
    meaning: 'You are meant to connect disparate worlds. Build bridges.',
    question: 'What needs to be connected or unified?'
  },

  // Aether Petals
  {
    id: 13,
    element: 'aether',
    archetype: 'Alchemist',
    keywords: ['transformation', 'mastery', 'integration'],
    meaning: 'You are ready for profound transformation. Lead is becoming gold.',
    question: 'What is transforming within you?'
  },
  {
    id: 14,
    element: 'aether',
    archetype: 'Oracle',
    keywords: ['intuition', 'guidance', 'divination'],
    meaning: 'The future speaks through you. Trust your prophetic knowing.',
    question: 'What future is trying to emerge?'
  },
  {
    id: 15,
    element: 'aether',
    archetype: 'Unity',
    keywords: ['wholeness', 'completion', 'transcendence'],
    meaning: 'All paths lead to one. You are approaching completion of a cycle.',
    question: 'What is ready to be integrated?'
  }
];

export function InteractiveHoloflower() {
  const { askOracle, loading } = useMAIAOracle();
  const [selectedPetals, setSelectedPetals] = useState<number[]>([]);
  const [interpretation, setInterpretation] = useState<string>('');
  const [stage, setStage] = useState<'selection' | 'interpretation' | 'complete'>('selection');
  const [consciousnessLevel, setConsciousnessLevel] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [userId] = useState('interactive-seeker-' + Date.now());

  // Get available petals based on consciousness level
  const availablePetals = useMemo(() => {
    const maxPetals = consciousnessLevel <= 2 ? 8 : consciousnessLevel === 3 ? 10 : consciousnessLevel === 4 ? 12 : 15;
    return PETAL_LIBRARY.slice(0, maxPetals);
  }, [consciousnessLevel]);

  // Auto-detect consciousness level based on interactions
  const detectConsciousnessLevel = (petalSelections: number[]) => {
    const selectedPetalData = petalSelections.map(id =>
      availablePetals.find(petal => petal.id === id)
    ).filter(Boolean);

    // Analysis factors
    const hasAetherSelections = selectedPetalData.some(p => p?.element === 'aether');
    const hasMultipleElements = new Set(selectedPetalData.map(p => p?.element)).size > 2;
    const hasAdvancedArchetypes = selectedPetalData.some(p =>
      ['Alchemist', 'Oracle', 'Unity', 'Sage', 'Mystic'].includes(p?.archetype || '')
    );

    // Progressive unlocking based on sophistication of choices
    if (hasAetherSelections && hasAdvancedArchetypes) {
      return 5; // Teaching/Transmuting
    } else if (hasMultipleElements && selectedPetalData.length >= 2) {
      return 4; // Integrated/Fluent
    } else if (selectedPetalData.length >= 2 || hasAdvancedArchetypes) {
      return 3; // Learning frameworks
    } else if (selectedPetalData.length >= 1) {
      return 2; // Awakening/Curious
    }
    return 1; // New
  };

  const handlePetalSelection = (petalId: number) => {
    let newSelections: number[];

    if (selectedPetals.includes(petalId)) {
      newSelections = selectedPetals.filter(id => id !== petalId);
    } else if (selectedPetals.length < 3) {
      newSelections = [...selectedPetals, petalId];
    } else {
      return; // Max selections reached
    }

    setSelectedPetals(newSelections);

    // Auto-detect and update consciousness level
    const detectedLevel = detectConsciousnessLevel(newSelections);
    if (detectedLevel > consciousnessLevel) {
      setConsciousnessLevel(detectedLevel);
    }
  };

  const generateInterpretation = async () => {
    if (selectedPetals.length === 0) return;

    setStage('interpretation');

    const selectedPetalData = selectedPetals.map(id =>
      availablePetals.find(petal => petal.id === id)
    ).filter(Boolean);

    const elements = selectedPetalData.map(p => p?.element).join(', ');
    const archetypes = selectedPetalData.map(p => p?.archetype).join(', ');
    const keywords = selectedPetalData.flatMap(p => p?.keywords || []).join(', ');
    const meanings = selectedPetalData.map(p => p?.meaning).join(' ');

    const prompt = `The seeker has chosen these sacred petals in their holoflower divination:

Elements: ${elements}
Archetypes: ${archetypes}
Keywords: ${keywords}
Individual meanings: ${meanings}

Please provide a unified interpretation that weaves these selections into coherent guidance. Address:
1. The overall pattern/message their soul is revealing
2. The specific guidance these combined elements offer
3. A practical next step or question for reflection

Keep the tone wise but accessible, profound but not pretentious. This person is seeking genuine insight, not mystical performance.`;

    try {
      const response = await askOracle({
        userId: 'holoflower-seeker',
        message: prompt,
        context: {
          userNeed: 'divination_interpretation'
        }
      });

      if (response) {
        setInterpretation(response.response);
        setStage('complete');
      }
    } catch (error) {
      console.error('Interpretation error:', error);
      setInterpretation('The oracle is temporarily unavailable. Trust your own inner knowing about these selections.');
      setStage('complete');
    }
  };

  const reset = () => {
    setSelectedPetals([]);
    setInterpretation('');
    setStage('selection');
  };

  const getElementColor = (element: string) => {
    const colors = {
      fire: '#FF4500',
      water: '#0077BE',
      earth: '#8B4513',
      air: '#E6E6FA',
      aether: '#9400D3'
    };
    return colors[element as keyof typeof colors] || '#9400D3';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            🌸 Interactive Oracle
          </h1>
          <p className="text-xl text-purple-200 mb-6">
            Trust your intuition. Select the petals that call to you.
          </p>

          {/* Consciousness Level Display (Auto-detected) */}
          {consciousnessLevel > 1 && (
            <div className="mb-6 bg-purple-800 bg-opacity-50 rounded-lg p-4">
              <div className="text-purple-200 text-sm">MAIA has detected your consciousness level:</div>
              <div className="text-white font-bold text-lg">
                Level {consciousnessLevel} - {
                  consciousnessLevel === 2 ? 'Awakening/Curious' :
                  consciousnessLevel === 3 ? 'Learning frameworks' :
                  consciousnessLevel === 4 ? 'Integrated practice' :
                  'Teaching/Transmuting'
                }
              </div>
              <div className="text-purple-300 text-xs mt-1">
                Your available petals expand as consciousness develops
              </div>
            </div>
          )}
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Interactive Petal Selection */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Select Your Petals ({selectedPetals.length}/3)
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {availablePetals.map(petal => (
                <button
                  key={petal.id}
                  onClick={() => handlePetalSelection(petal.id)}
                  disabled={selectedPetals.length >= 3 && !selectedPetals.includes(petal.id)}
                  className={`p-4 rounded-xl text-white text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedPetals.includes(petal.id)
                      ? 'bg-opacity-80 ring-2 ring-white shadow-lg scale-105'
                      : 'bg-opacity-40 hover:bg-opacity-60'
                  } disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100`}
                  style={{
                    backgroundColor: getElementColor(petal.element),
                  }}
                >
                  <div className="font-bold mb-2">{petal.archetype}</div>
                  <div className="text-xs opacity-90">
                    {petal.keywords.join(' • ')}
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Petals Preview */}
            {selectedPetals.length > 0 && (
              <div className="bg-black bg-opacity-30 rounded-xl p-6">
                <h3 className="text-white font-bold mb-4">Your Selected Petals</h3>
                {selectedPetals.map(petalId => {
                  const petal = availablePetals.find(p => p.id === petalId);
                  if (!petal) return null;

                  return (
                    <div key={petalId} className="mb-3 p-3 rounded-lg" style={{
                      backgroundColor: getElementColor(petal.element) + '20',
                      border: `1px solid ${getElementColor(petal.element)}50`
                    }}>
                      <div className="text-white font-medium">{petal.archetype}</div>
                      <div className="text-purple-200 text-sm">{petal.meaning}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              {selectedPetals.length > 0 && stage === 'selection' && (
                <button
                  onClick={generateInterpretation}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Oracle weaving wisdom...' : 'Receive Interpretation'}
                </button>
              )}

              {stage === 'complete' && (
                <button
                  onClick={reset}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  New Reading
                </button>
              )}
            </div>
          </div>

          {/* Interpretation Display */}
          <div className="flex flex-col items-center space-y-6">
            {/* Holoflower Visualization */}
            <SimpleHoloflower
              stage={stage === 'selection' ? 'dormant' : stage === 'interpretation' ? 'processing' : 'complete'}
              consciousnessLevel={consciousnessLevel}
              elementalSignature={{
                fire: selectedPetals.filter(id => availablePetals.find(p => p.id === id)?.element === 'fire').length * 3,
                water: selectedPetals.filter(id => availablePetals.find(p => p.id === id)?.element === 'water').length * 3,
                earth: selectedPetals.filter(id => availablePetals.find(p => p.id === id)?.element === 'earth').length * 3,
                air: selectedPetals.filter(id => availablePetals.find(p => p.id === id)?.element === 'air').length * 3,
                aether: selectedPetals.filter(id => availablePetals.find(p => p.id === id)?.element === 'aether').length * 3
              }}
              cringeScore={0}
              size={300}
              className="drop-shadow-2xl"
            />

            {/* Oracle Interpretation */}
            {interpretation && (
              <div className="bg-black bg-opacity-40 backdrop-blur-md rounded-xl p-8 max-w-md">
                <h3 className="text-2xl font-bold text-white mb-6 text-center">
                  🌟 Oracle Speaks
                </h3>
                <div className="text-white leading-relaxed">
                  {interpretation}
                </div>
              </div>
            )}

            {stage === 'selection' && selectedPetals.length === 0 && (
              <div className="text-center text-purple-300 max-w-md">
                <p className="text-lg">Select 1-3 petals that resonate with your current situation or question.</p>
                <p className="mt-2 text-sm">Trust your first instinct. Your body knows.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}