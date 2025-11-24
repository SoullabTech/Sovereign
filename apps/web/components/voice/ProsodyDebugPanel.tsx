/**
 * Prosody Debug Panel
 * Shows real-time adaptive prosody analysis and balancing
 */

import React, { useEffect, useState } from 'react';

interface ToneAnalysis {
  dominantElement: string;
  energyLevel: string;
  needsBalancing: boolean;
  suggestedBalance: string;
  emotionalQualities: string[];
  tempo: string;
}

interface ProsodyResponse {
  mirrorPhase: {
    element: string;
    duration: string;
  };
  balancePhase: {
    element: string;
    transition: string;
  };
  voiceParameters: {
    speed: number;
    pitch: number;
    emphasis: number;
    warmth: number;
  };
}

interface ProsodyDebugPanelProps {
  userInput?: string;
  isVisible?: boolean;
  className?: string;
}

export const ProsodyDebugPanel: React.FC<ProsodyDebugPanelProps> = ({
  userInput,
  isVisible = true,
  className = ''
}) => {
  const [toneAnalysis, setToneAnalysis] = useState<ToneAnalysis | null>(null);
  const [prosodyResponse, setProsodyResponse] = useState<ProsodyResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [therapeuticGuidance, setTherapeuticGuidance] = useState<string>('');

  useEffect(() => {
    if (userInput && userInput.length > 10) {
      analyzeTone(userInput);
    }
  }, [userInput]);

  const analyzeTone = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/prosody/analyze-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      
      const data = await response.json();
      if (data.success) {
        setToneAnalysis(data.analysis);
        
        // Generate prosody response
        const prosodyRes = await fetch('/api/prosody/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userInput: text,
            aiResponse: "Sample response for prosody testing"
          })
        });
        
        const prosodyData = await prosodyRes.json();
        if (prosodyData.success) {
          setProsodyResponse(prosodyData.prosodyResponse);
          setTherapeuticGuidance(prosodyData.therapeuticGuidance);
        }
      }
    } catch (error) {
      console.error('[PROSODY] Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isVisible) return null;

  const getElementEmoji = (element: string) => {
    const emojis: Record<string, string> = {
      fire: '🔥',
      water: '💧',
      earth: '🌍',
      air: '💨',
      aether: '✨'
    };
    return emojis[element] || '🌟';
  };

  const getEnergyColor = (energy: string) => {
    if (energy.includes('very_high') || energy.includes('high')) return 'text-red-400';
    if (energy.includes('medium')) return 'text-yellow-400';
    if (energy.includes('low') || energy.includes('very_low')) return 'text-blue-400';
    return 'text-gray-400';
  };

  const getTransitionStyle = (transition: string) => {
    switch (transition) {
      case 'gentle': return 'text-green-400';
      case 'moderate': return 'text-yellow-400';
      case 'decisive': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`
      bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 
      border border-gray-700 text-sm font-mono
      ${className}
    `}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          Adaptive Prosody Engine
        </h3>
        {isAnalyzing && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        )}
      </div>

      {toneAnalysis ? (
        <div className="space-y-3">
          {/* User Tone Analysis */}
          <div className="bg-gray-800/50 rounded p-2">
            <div className="text-xs text-gray-500 mb-1">User Energy</div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{getElementEmoji(toneAnalysis.dominantElement)}</span>
              <span className="text-white">{toneAnalysis.dominantElement}</span>
              <span className={`ml-auto ${getEnergyColor(toneAnalysis.energyLevel)}`}>
                {toneAnalysis.energyLevel.replace(/_/g, ' ')}
              </span>
            </div>
            {toneAnalysis.emotionalQualities.length > 0 && (
              <div className="mt-1 text-xs text-gray-400">
                {toneAnalysis.emotionalQualities.join(', ')}
              </div>
            )}
          </div>

          {/* Prosody Response */}
          {prosodyResponse && (
            <>
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">Response Pattern</div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mirror:</span>
                    <div className="flex items-center gap-1">
                      <span>{getElementEmoji(prosodyResponse.mirrorPhase.element)}</span>
                      <span className="text-white">{prosodyResponse.mirrorPhase.element}</span>
                      <span className="text-xs text-gray-500">({prosodyResponse.mirrorPhase.duration})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Balance:</span>
                    <div className="flex items-center gap-1">
                      <span>{getElementEmoji(prosodyResponse.balancePhase.element)}</span>
                      <span className="text-white">{prosodyResponse.balancePhase.element}</span>
                      <span className={`text-xs ${getTransitionStyle(prosodyResponse.balancePhase.transition)}`}>
                        ({prosodyResponse.balancePhase.transition})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Voice Parameters */}
              <div className="bg-gray-800/50 rounded p-2">
                <div className="text-xs text-gray-500 mb-1">Voice Shaping</div>
                <div className="grid grid-cols-2 gap-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span className="text-white">{prosodyResponse.voiceParameters.speed.toFixed(2)}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pitch:</span>
                    <span className="text-white">
                      {prosodyResponse.voiceParameters.pitch > 0 ? '+' : ''}{prosodyResponse.voiceParameters.pitch}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Emphasis:</span>
                    <span className="text-white">{(prosodyResponse.voiceParameters.emphasis * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Warmth:</span>
                    <span className="text-white">{(prosodyResponse.voiceParameters.warmth * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Therapeutic Guidance */}
              {therapeuticGuidance && (
                <div className="bg-gradient-to-r from-amber-900/20 to-blue-900/20 rounded p-2 border border-amber-700/30">
                  <div className="text-xs text-amber-400 mb-1">Therapeutic Arc</div>
                  <div className="text-xs text-gray-300 italic">
                    {therapeuticGuidance}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Flow Visualization */}
          <div className="flex items-center justify-center gap-2 py-2">
            <span className="text-lg" title="User">
              {toneAnalysis && getElementEmoji(toneAnalysis.dominantElement)}
            </span>
            <span className="text-gray-500">→</span>
            <span className="text-lg" title="Mirror">
              {prosodyResponse && getElementEmoji(prosodyResponse.mirrorPhase.element)}
            </span>
            <span className="text-gray-500">→</span>
            <span className="text-lg" title="Balance">
              {prosodyResponse && getElementEmoji(prosodyResponse.balancePhase.element)}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-gray-500 text-xs text-center py-4">
          Waiting for user input...
        </div>
      )}
    </div>
  );
};

export default ProsodyDebugPanel;