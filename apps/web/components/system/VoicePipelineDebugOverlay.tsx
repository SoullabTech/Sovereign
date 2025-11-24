'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Activity, Mic, Cpu, Volume2, Target, Zap } from 'lucide-react';

interface PipelineStep {
  name: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  timestamp?: string;
  data?: any;
  duration?: number;
}

interface ProsodyInfo {
  detectedElement: string;
  balancingElement: string;
  therapeuticIntent: string;
  confidenceScore: number;
  voiceMetrics: {
    pitch: number;
    tempo: number;
    emotionalValence: number;
    stressLevel: number;
  };
  jungianFlow: {
    mirror: { element: string; duration: number; intensity: number };
    balance: { element: string; approach: string; confidence: number };
  };
  sessionMemory: {
    preferredElements: string[];
    responsiveness: number;
    conversationTurns: number;
  };
}

interface VoicePipelineState {
  transcript?: string;
  aiResponse?: string;
  shapedResponse?: string;
  audioUrl?: string;
  steps: PipelineStep[];
  lastError?: string;
  prosodyInfo?: ProsodyInfo;
}

export function VoicePipelineDebugOverlay() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [pipelineState, setPipelineState] = useState<VoicePipelineState>({
    steps: []
  });
  const [showMockData, setShowMockData] = useState(process.env.NODE_ENV === 'development');

  // Mock prosody data for development testing
  const generateMockProsodyInfo = (): ProsodyInfo => {
    const elements = ['fire', 'water', 'earth', 'air', 'aether'];
    const detectedElement = elements[Math.floor(Math.random() * elements.length)];
    const balancingElements = {
      fire: 'water',
      water: 'fire', 
      earth: 'air',
      air: 'earth',
      aether: 'earth'
    };
    
    return {
      detectedElement,
      balancingElement: balancingElements[detectedElement as keyof typeof balancingElements],
      therapeuticIntent: detectedElement === 'fire' ? 'cooling_stress' : 
                      detectedElement === 'water' ? 'gentle_activation' :
                      detectedElement === 'air' ? 'grounding_scattered' : 
                      detectedElement === 'earth' ? 'lifting_perspective' : 
                      'embodying_transcendent',
      confidenceScore: 0.7 + Math.random() * 0.3,
      voiceMetrics: {
        pitch: Math.random() * 6 - 3, // -3 to +3
        tempo: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
        emotionalValence: Math.random() * 2 - 1, // -1 to +1
        stressLevel: Math.random()
      },
      jungianFlow: {
        mirror: {
          element: detectedElement,
          duration: 2 + Math.random() * 3, // 2-5 seconds
          intensity: 0.6 + Math.random() * 0.4
        },
        balance: {
          element: balancingElements[detectedElement as keyof typeof balancingElements],
          approach: detectedElement === 'fire' ? 'cooling_flow' : 
                   detectedElement === 'water' ? 'gentle_activation' :
                   'anchoring_stability',
          confidence: 0.8 + Math.random() * 0.2
        }
      },
      sessionMemory: {
        preferredElements: [detectedElement, 'earth'],
        responsiveness: 0.7 + Math.random() * 0.3,
        conversationTurns: Math.floor(Math.random() * 10) + 1
      }
    };
  };

  useEffect(() => {
    // Initialize with mock prosody data for development testing
    if (showMockData && process.env.NODE_ENV === 'development') {
      setPipelineState(prev => ({ 
        ...prev, 
        prosodyInfo: generateMockProsodyInfo() 
      }));
    }
  }, [showMockData]);

  useEffect(() => {
    // Listen for console logs and extract pipeline data
    const originalLog = console.log;
    console.log = function(...args: any[]) {
      originalLog.apply(console, args);
      
      const message = args[0];
      if (typeof message === 'string') {
        // Parse pipeline logs
        if (message.startsWith('[VoiceRecorder]')) {
          updatePipelineStep('Voice Recording', 'completed', args);
          
          if (message.includes('Final transcript:')) {
            setPipelineState(prev => ({ ...prev, transcript: args[1] }));
          }
          if (message.includes('Backend response:')) {
            setPipelineState(prev => ({ ...prev, aiResponse: JSON.stringify(args[1]) }));
          }
        }
        
        if (message.startsWith('[Pipeline]')) {
          if (message.includes('Received transcript')) {
            updatePipelineStep('Pipeline Received', 'active', args);
          }
          if (message.includes('Draft response generated')) {
            updatePipelineStep('AI Drafting', 'completed', args);
          }
          if (message.includes('Shaped response')) {
            updatePipelineStep('Prosody Shaping', 'completed', args);
            setPipelineState(prev => ({ ...prev, shapedResponse: args[1] }));
          }
          if (message.includes('TTS completed')) {
            updatePipelineStep('TTS Generation', 'completed', args);
            setPipelineState(prev => ({ ...prev, audioUrl: args[1]?.audioUrl }));
          }
        }
        
        if (message.startsWith('[SesameCI]')) {
          updatePipelineStep('Sesame CI Shaping', 'active', args);
          if (message.includes('Shaping successful')) {
            updatePipelineStep('Sesame CI Shaping', 'completed', args);
          }
        }
        
        if (message.startsWith('[SesameTTS]')) {
          updatePipelineStep('Sesame TTS', 'active', args);
          if (message.includes('TTS success')) {
            updatePipelineStep('Sesame TTS', 'completed', args);
          }
        }
        
        // Enhanced Prosody Detection
        if (message.includes('[PROSODY]') || message.includes('[MultiModal]') || message.includes('[MAYA_RITUAL]')) {
          updatePipelineStep('Prosody Analysis', 'active', args);
          
          if (message.includes('Element detected:') || message.includes('detected →')) {
            // Generate mock prosody info for development testing
            if (showMockData) {
              setPipelineState(prev => ({ 
                ...prev, 
                prosodyInfo: generateMockProsodyInfo()
              }));
            }
            updatePipelineStep('Prosody Analysis', 'completed', args);
          }
        }
        
        // Jungian Flow Detection  
        if (message.includes('[RITUAL]') || message.includes('Mirror:') || message.includes('Balance:')) {
          updatePipelineStep('Jungian Balancing', 'active', args);
          if (message.includes('Balance:')) {
            updatePipelineStep('Jungian Balancing', 'completed', args);
          }
        }
      }
    };

    return () => {
      console.log = originalLog;
    };
  }, []);

  const updatePipelineStep = (name: string, status: PipelineStep['status'], data?: any) => {
    setPipelineState(prev => {
      const existingStepIndex = prev.steps.findIndex(s => s.name === name);
      const step: PipelineStep = {
        name,
        status,
        timestamp: new Date().toISOString(),
        data: data?.[1],
        duration: existingStepIndex >= 0 && prev.steps[existingStepIndex].timestamp
          ? Date.now() - new Date(prev.steps[existingStepIndex].timestamp).getTime()
          : undefined
      };

      if (existingStepIndex >= 0) {
        const newSteps = [...prev.steps];
        newSteps[existingStepIndex] = step;
        return { ...prev, steps: newSteps };
      } else {
        return { ...prev, steps: [...prev.steps, step] };
      }
    });
  };

  const getStatusIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-500">○</span>;
      case 'active':
        return <span className="text-yellow-400 animate-pulse">●</span>;
      case 'completed':
        return <span className="text-green-400">✓</span>;
      case 'error':
        return <span className="text-red-400">✗</span>;
      default:
        return <span className="text-gray-500">○</span>;
    }
  };

  const getStepIcon = (name: string) => {
    if (name.includes('Voice')) return <Mic className="w-3 h-3" />;
    if (name.includes('AI') || name.includes('Pipeline')) return <Cpu className="w-3 h-3" />;
    if (name.includes('TTS')) return <Volume2 className="w-3 h-3" />;
    if (name.includes('Prosody')) return <Target className="w-3 h-3" />;
    if (name.includes('Jungian')) return <Zap className="w-3 h-3" />;
    return <Activity className="w-3 h-3" />;
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'fire': return 'text-red-400';
      case 'water': return 'text-blue-400';
      case 'earth': return 'text-yellow-600';
      case 'air': return 'text-cyan-400';
      case 'aether': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  const getElementEmoji = (element: string) => {
    switch (element) {
      case 'fire': return '🔥';
      case 'water': return '🌊';
      case 'earth': return '🌍';
      case 'air': return '🌬️';
      case 'aether': return '✨';
      default: return '○';
    }
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-black/90 backdrop-blur-sm border border-gray-800 rounded-lg shadow-2xl">
        {/* Header */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between text-green-400 hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="text-sm font-mono">Voice Pipeline Debug</span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 py-3 space-y-3 text-xs font-mono max-h-96 overflow-y-auto">
            {/* Pipeline Steps */}
            <div className="space-y-1">
              <div className="text-gray-500 uppercase text-xs">Pipeline Steps</div>
              {pipelineState.steps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-gray-300">
                  {getStatusIcon(step.status)}
                  {getStepIcon(step.name)}
                  <span className="flex-1">{step.name}</span>
                  {step.duration && (
                    <span className="text-gray-500">{step.duration}ms</span>
                  )}
                </div>
              ))}
            </div>

            {/* Current Data */}
            {pipelineState.transcript && (
              <div className="border-t border-gray-800 pt-2">
                <div className="text-gray-500 uppercase text-xs mb-1">Transcript</div>
                <div className="text-gray-300 break-words">
                  {pipelineState.transcript.substring(0, 100)}...
                </div>
              </div>
            )}

            {pipelineState.shapedResponse && (
              <div className="border-t border-gray-800 pt-2">
                <div className="text-gray-500 uppercase text-xs mb-1">Shaped Response</div>
                <div className="text-gray-300 break-words">
                  {pipelineState.shapedResponse.substring(0, 100)}...
                </div>
              </div>
            )}

            {pipelineState.audioUrl && (
              <div className="border-t border-gray-800 pt-2">
                <div className="text-gray-500 uppercase text-xs mb-1">Audio Status</div>
                <div className="text-green-400">
                  {pipelineState.audioUrl === 'Generated' ? '✓ Generated' : '✗ Failed'}
                </div>
              </div>
            )}

            {/* Prosody Intelligence */}
            {pipelineState.prosodyInfo && (
              <div className="border-t border-gray-800 pt-2">
                <div className="text-amber-400 uppercase text-xs mb-2 flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  Prosody Intelligence
                  <span className="text-gray-500 ml-auto">
                    {Math.round(pipelineState.prosodyInfo.confidenceScore * 100)}%
                  </span>
                </div>
                
                {/* Element Flow */}
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center gap-1">
                    <span className={getElementColor(pipelineState.prosodyInfo.detectedElement)}>
                      {getElementEmoji(pipelineState.prosodyInfo.detectedElement)} {pipelineState.prosodyInfo.detectedElement}
                    </span>
                  </div>
                  <span className="text-gray-500">→</span>
                  <div className="flex items-center gap-1">
                    <span className={getElementColor(pipelineState.prosodyInfo.balancingElement)}>
                      {getElementEmoji(pipelineState.prosodyInfo.balancingElement)} {pipelineState.prosodyInfo.balancingElement}
                    </span>
                  </div>
                </div>
                
                {/* Therapeutic Intent */}
                <div className="text-xs mb-2">
                  <span className="text-gray-500">Intent:</span>{' '}
                  <span className="text-green-400">{pipelineState.prosodyInfo.therapeuticIntent}</span>
                </div>
                
                {/* Voice Metrics */}
                <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                  <div>
                    <span className="text-gray-500">Pitch:</span>{' '}
                    <span className={pipelineState.prosodyInfo.voiceMetrics.pitch > 0 ? 'text-yellow-400' : 'text-blue-400'}>
                      {pipelineState.prosodyInfo.voiceMetrics.pitch.toFixed(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Tempo:</span>{' '}
                    <span className={pipelineState.prosodyInfo.voiceMetrics.tempo > 1 ? 'text-red-400' : 'text-cyan-400'}>
                      {pipelineState.prosodyInfo.voiceMetrics.tempo.toFixed(1)}x
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Valence:</span>{' '}
                    <span className={pipelineState.prosodyInfo.voiceMetrics.emotionalValence > 0 ? 'text-green-400' : 'text-orange-400'}>
                      {pipelineState.prosodyInfo.voiceMetrics.emotionalValence.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Stress:</span>{' '}
                    <span className={pipelineState.prosodyInfo.voiceMetrics.stressLevel > 0.5 ? 'text-red-400' : 'text-green-400'}>
                      {Math.round(pipelineState.prosodyInfo.voiceMetrics.stressLevel * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* Jungian Flow */}
                <div className="text-xs border-t border-gray-700 pt-1">
                  <div className="text-gray-500 uppercase text-xs mb-1">Jungian Arc</div>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400">Mirror:</span>
                    <span className={getElementColor(pipelineState.prosodyInfo.jungianFlow.mirror.element)}>
                      {pipelineState.prosodyInfo.jungianFlow.mirror.duration.toFixed(1)}s
                    </span>
                    <span className="text-gray-500">→</span>
                    <span className="text-yellow-400">Balance:</span>
                    <span className={getElementColor(pipelineState.prosodyInfo.jungianFlow.balance.element)}>
                      {Math.round(pipelineState.prosodyInfo.jungianFlow.balance.confidence * 100)}%
                    </span>
                  </div>
                </div>
                
                {/* Session Memory */}
                <div className="text-xs border-t border-gray-700 pt-1 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Memory:</span>
                    <span className="text-cyan-400">
                      Turn #{pipelineState.prosodyInfo.sessionMemory.conversationTurns} | 
                      {Math.round(pipelineState.prosodyInfo.sessionMemory.responsiveness * 100)}% responsive
                    </span>
                  </div>
                  <div className="flex gap-1 mt-1">
                    {pipelineState.prosodyInfo.sessionMemory.preferredElements.map((elem, idx) => (
                      <span key={idx} className={`${getElementColor(elem)} text-xs`}>
                        {getElementEmoji(elem)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {pipelineState.lastError && (
              <div className="border-t border-gray-800 pt-2">
                <div className="text-red-400 uppercase text-xs mb-1">Error</div>
                <div className="text-red-300 break-words text-xs">
                  {pipelineState.lastError}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="border-t border-gray-800 pt-2 space-y-1">
              {showMockData && (
                <button
                  onClick={() => setPipelineState(prev => ({ 
                    ...prev, 
                    prosodyInfo: generateMockProsodyInfo() 
                  }))}
                  className="w-full py-1 text-center text-amber-400 hover:text-amber-300 transition-colors text-xs"
                >
                  🎭 Generate Mock Prosody
                </button>
              )}
              
              <button
                onClick={() => setPipelineState({ steps: [] })}
                className="w-full py-1 text-center text-gray-500 hover:text-gray-300 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}