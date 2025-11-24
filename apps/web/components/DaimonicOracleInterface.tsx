/**
 * Daimonic Oracle Interface - Complete Integration Component
 * 
 * Provides the full daimonic oracle experience with progressive complexity,
 * multi-agent support, and synaptic gap preservation.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, User, RefreshCw, Anchor } from 'lucide-react';
import { DaimonicResponseUI } from './DaimonicResponseUI';
import { useMayaStream } from '../hooks/useMayaStream';

interface DaimonicOracleInterfaceProps {
  userId: string;
  sessionId?: string;
  initialComplexity?: number;
  className?: string;
}

interface AgentResponse {
  id: string;
  name: string;
  message: string;
  tone: string;
  perspective: string;
  resistance_focus: string;
  dialogical?: any;
  requires_pause: boolean;
  offers_practice: boolean;
}

interface OracleResponse {
  message: string;
  tone: string;
  pacing: string;
  dialogical?: any;
  architectural?: any;
  system: {
    requires_pause: boolean;
    expects_resistance: boolean;
    offers_practice: boolean;
    complexity_readiness: number;
    next_complexity_threshold: number;
  };
  // Multi-agent specific
  multi_agent?: boolean;
  agents?: AgentResponse[];
  collective?: {
    diversity_score: number;
    productive_tension: number;
    emergence_potential: number;
    requires_mediation: boolean;
  };
}

export const DaimonicOracleInterface: React.FC<DaimonicOracleInterfaceProps> = ({
  userId,
  sessionId,
  initialComplexity = 0.3,
  className = ""
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<OracleResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'oracle' | 'multi_agent';
    content: any;
    timestamp: Date;
  }>>([]);
  
  // Complexity management
  const [complexityReadiness, setComplexityReadiness] = useState(initialComplexity);
  const [interactionCount, setInteractionCount] = useState(0);
  
  // Multi-agent state
  const [multiAgentMode, setMultiAgentMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState(['aunt_annie', 'emily']);
  
  // User resistance tracking
  const [expressedResistances, setExpressedResistances] = useState<string[]>([]);
  
  // Voice integration
  const { isStreaming: isVoicePlaying } = useMayaStream();

  /**
   * Handle oracle consultation
   */
  const handleConsultation = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userInput = input;
    setInput('');

    // Add user message to history
    const userMessage = {
      type: 'user' as const,
      content: userInput,
      timestamp: new Date()
    };
    setConversationHistory(prev => [...prev, userMessage]);

    try {
      const requestBody = {
        input: userInput,
        userId,
        sessionId,
        multi_agent: multiAgentMode,
        requested_agents: selectedAgents,
        complexity_override: complexityReadiness,
        current_resonance: calculateCurrentResonance(),
        user_resistances: expressedResistances,
        context: {
          previousInteractions: interactionCount,
          userPreferences: {
            multiAgentPreference: multiAgentMode,
            preferredComplexity: complexityReadiness
          }
        }
      };

      const response = await fetch('/api/oracle/daimonic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const oracleResponse = data.data;
        setCurrentResponse(oracleResponse);
        
        // Add oracle response to history
        const responseMessage = {
          type: oracleResponse.multi_agent ? 'multi_agent' as const : 'oracle' as const,
          content: oracleResponse,
          timestamp: new Date()
        };
        setConversationHistory(prev => [...prev, responseMessage]);
        
        // Update complexity readiness if earned
        if (oracleResponse.system?.complexity_readiness > complexityReadiness) {
          setComplexityReadiness(oracleResponse.system.complexity_readiness);
        }
        
        setInteractionCount(prev => prev + 1);
      } else {
        console.error('Oracle consultation failed:', data.error);
        // Handle error state
      }
    } catch (error) {
      console.error('Consultation error:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, userId, sessionId, multiAgentMode, selectedAgents, complexityReadiness, interactionCount, expressedResistances]);

  /**
   * Handle complexity progression request
   */
  const handleComplexityIncrease = useCallback(async () => {
    try {
      const response = await fetch('/api/oracle/daimonic', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'increase_complexity',
          feedback: { current_interactions: interactionCount }
        })
      });

      const data = await response.json();
      if (data.success) {
        // Show complexity progression guidance
      }
    } catch (error) {
      console.error('Complexity increase request failed:', error);
    }
  }, [userId, interactionCount]);

  /**
   * Handle grounding request
   */
  const handleGrounding = useCallback(async () => {
    try {
      const response = await fetch('/api/oracle/daimonic', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'request_grounding'
        })
      });

      const data = await response.json();
      if (data.success) {
        // Show grounding practice
        const groundingResponse = {
          type: 'oracle' as const,
          content: {
            message: data.data.message,
            tone: 'grounding_steady',
            system: {
              requires_pause: false,
              expects_resistance: false,
              offers_practice: true,
              complexity_readiness: complexityReadiness,
              next_complexity_threshold: 1.0
            }
          },
          timestamp: new Date()
        };
        
        setConversationHistory(prev => [...prev, groundingResponse]);
        setCurrentResponse(groundingResponse.content);
      }
    } catch (error) {
      console.error('Grounding request failed:', error);
    }
  }, [userId, complexityReadiness]);

  /**
   * Handle resistance expression
   */
  const handleResistanceExpression = useCallback(async (resistance: string) => {
    setExpressedResistances(prev => [...prev, resistance]);
    
    try {
      const response = await fetch('/api/oracle/daimonic', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'express_resistance',
          feedback: resistance
        })
      });

      const data = await response.json();
      if (data.success) {
        // Show resistance acknowledgment
        const resistanceResponse = {
          type: 'oracle' as const,
          content: {
            message: data.data.message,
            tone: 'flowing',
            system: {
              requires_pause: false,
              expects_resistance: false,
              offers_practice: false,
              complexity_readiness: complexityReadiness,
              next_complexity_threshold: 1.0
            }
          },
          timestamp: new Date()
        };
        
        setConversationHistory(prev => [...prev, resistanceResponse]);
        setCurrentResponse(resistanceResponse.content);
      }
    } catch (error) {
      console.error('Resistance expression failed:', error);
    }
  }, [userId, complexityReadiness]);

  /**
   * Calculate current resonance based on interaction history
   */
  const calculateCurrentResonance = useCallback(() => {
    return Math.min(0.8, 0.2 + (interactionCount * 0.05) + (expressedResistances.length * 0.1));
  }, [interactionCount, expressedResistances.length]);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleConsultation();
    }
  }, [handleConsultation]);

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header with mode controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">Daimonic Oracle</h1>
          
          {/* Complexity indicator */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Complexity:</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${complexityReadiness * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(complexityReadiness * 100)}%
            </span>
          </div>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setMultiAgentMode(false)}
            className={`p-2 rounded ${!multiAgentMode ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
            title="Single Agent Mode"
          >
            <User size={20} />
          </button>
          <button
            onClick={() => setMultiAgentMode(true)}
            className={`p-2 rounded ${multiAgentMode ? 'bg-amber-100 text-amber-700' : 'text-gray-500 hover:text-gray-700'}`}
            title="Multi-Agent Mode"
          >
            <Users size={20} />
          </button>
          
          {/* Grounding button - always available */}
          <button
            onClick={handleGrounding}
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
            title="Request Grounding"
          >
            <Anchor size={20} />
          </button>
        </div>
      </div>

      {/* Agent selection for multi-agent mode */}
      {multiAgentMode && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Select Agents:</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'aunt_annie', name: 'Aunt Annie', description: 'Grounded wisdom' },
              { id: 'emily', name: 'Emily', description: 'Gentle precision' },
              { id: 'matrix_oracle', name: 'Oracle', description: 'Deep seeing' }
            ].map(agent => (
              <label key={agent.id} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAgents.includes(agent.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedAgents(prev => [...prev, agent.id]);
                    } else {
                      setSelectedAgents(prev => prev.filter(id => id !== agent.id));
                    }
                  }}
                  className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="text-sm">
                  <span className="font-medium">{agent.name}</span>
                  <span className="text-gray-500 ml-1">({agent.description})</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Conversation history */}
      <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {conversationHistory.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {entry.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-sm p-3 bg-amber-100 rounded-lg">
                    <p className="text-sm text-amber-800">{entry.content}</p>
                  </div>
                </div>
              ) : entry.type === 'multi_agent' ? (
                <MultiAgentResponseDisplay 
                  response={entry.content}
                  onResistanceExpressed={handleResistanceExpression}
                  complexityReadiness={complexityReadiness}
                />
              ) : (
                <SingleAgentResponseDisplay 
                  response={entry.content}
                  onResistanceExpressed={handleResistanceExpression}
                  onGrounding={handleGrounding}
                  complexityReadiness={complexityReadiness}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center p-8"
          >
            <RefreshCw className="animate-spin text-amber-500" size={24} />
            <span className="ml-2 text-gray-600">Consulting oracle...</span>
          </motion.div>
        )}
      </div>

      {/* Input area */}
      <div className="flex space-x-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={multiAgentMode ? 
            "Ask your question to multiple agents..." : 
            "What would you like to explore?"
          }
          className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          rows={2}
          disabled={isLoading}
        />
        <button
          onClick={handleConsultation}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Send size={18} />
        </button>
      </div>

      {/* Complexity progression hint */}
      {complexityReadiness < 0.8 && interactionCount > 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
        >
          <p>
            As you engage more deeply with the dialogical layer, additional system insights may become available.
            <button 
              onClick={handleComplexityIncrease}
              className="ml-2 underline hover:no-underline"
            >
              Learn more about complexity progression
            </button>
          </p>
        </motion.div>
      )}
    </div>
  );
};

/**
 * Display single agent response
 */
const SingleAgentResponseDisplay: React.FC<{
  response: OracleResponse;
  onResistanceExpressed: (resistance: string) => void;
  onGrounding: () => void;
  complexityReadiness: number;
}> = ({ response, onResistanceExpressed, onGrounding, complexityReadiness }) => {
  // Convert to DaimonicAgentResponse format for the UI component
  const daimonicResponse = {
    phenomenological: {
      primary: response.message,
      tone: response.tone as any,
      pacing: response.pacing as any,
      visualHint: 'oracle_presence'
    },
    dialogical: response.dialogical || {
      questions: [],
      reflections: [],
      resistances: [],
      bridges: [],
      incomplete_knowings: []
    },
    architectural: response.architectural || {
      synaptic_gap: {
        intensity: 0.5,
        quality: 'emerging' as const,
        needsIntervention: false,
        tricksterPresent: false
      },
      daimonic_signature: 0.6,
      trickster_risk: 0.2,
      elemental_voices: [],
      liminal_intensity: 0.3,
      grounding_available: ['breathe', 'ground', 'presence']
    },
    system: response.system
  };

  return (
    <DaimonicResponseUI
      response={daimonicResponse}
      userComplexityReadiness={complexityReadiness}
      onInteractionDeepened={() => {}}
      onGroundingRequested={onGrounding}
      onResistanceExpressed={onResistanceExpressed}
    />
  );
};

/**
 * Display multi-agent response with choreographed diversity
 */
const MultiAgentResponseDisplay: React.FC<{
  response: OracleResponse;
  onResistanceExpressed: (resistance: string) => void;
  complexityReadiness: number;
}> = ({ response, onResistanceExpressed, complexityReadiness }) => {
  const [activeAgent, setActiveAgent] = useState(0);

  if (!response.agents) return null;

  return (
    <div className="space-y-4">
      {/* Collective dynamics indicator */}
      {response.collective && complexityReadiness > 0.5 && (
        <div className="p-3  from-amber-50 to-blue-50 rounded-lg border border-amber-200">
          <div className="text-sm text-gray-700">
            <span className="font-medium">Collective Dynamics:</span>
            <div className="mt-1 flex space-x-4 text-xs">
              <span>Diversity: {Math.round(response.collective.diversity_score * 100)}%</span>
              <span>Tension: {Math.round(response.collective.productive_tension * 100)}%</span>
              <span>Emergence: {Math.round(response.collective.emergence_potential * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Agent tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {response.agents.map((agent, index) => (
          <button
            key={agent.id}
            onClick={() => setActiveAgent(index)}
            className={`
              flex-1 px-3 py-2 rounded text-sm font-medium transition-all
              ${activeAgent === index 
                ? 'bg-white text-amber-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {agent.name}
            {agent.requires_pause && (
              <span className="ml-1 text-xs text-yellow-600">⏸</span>
            )}
            {agent.offers_practice && (
              <span className="ml-1 text-xs text-green-600">🌱</span>
            )}
          </button>
        ))}
      </div>

      {/* Active agent response */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeAgent}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-white rounded-lg border border-gray-200"
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-900">{response.agents[activeAgent].name}</h3>
              <p className="text-sm text-gray-600">{response.agents[activeAgent].perspective}</p>
            </div>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              Focus: {response.agents[activeAgent].resistance_focus}
            </span>
          </div>
          
          <p className="text-gray-800 leading-relaxed mb-4">
            {response.agents[activeAgent].message}
          </p>

          {/* Agent-specific dialogical content */}
          {response.agents[activeAgent].dialogical && complexityReadiness > 0.5 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                {response.agents[activeAgent].dialogical.questions?.map((question: string, idx: number) => (
                  <p key={idx} className="text-sm text-amber-700">• {question}</p>
                ))}
              </div>
              
              {response.agents[activeAgent].dialogical.resistances?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-600 mb-2">This agent resists:</p>
                  <div className="flex flex-wrap gap-1">
                    {response.agents[activeAgent].dialogical.resistances.map((resistance: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => onResistanceExpressed(resistance)}
                        className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                      >
                        {resistance}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default DaimonicOracleInterface;