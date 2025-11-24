/**
 * Streamlined Daimonic UI - Pure Visualization Layer
 * 
 * This component eliminates complexity debt by:
 * - Reading state from UnifiedDaimonicCore (never duplicating logic)
 * - Pure rendering based on ui_state instructions
 * - No threshold calculations, safety checks, or orchestration
 * - Single source of truth for all display decisions
 */

'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Anchor, Zap, Circle, Waves, Pause } from 'lucide-react';

// Pure state interfaces from UnifiedDaimonicCore
interface UIState {
  complexity_level: number;
  visual_hint: string;
  show_dialogical: boolean;
  show_architectural: boolean;
  requires_pause: boolean;
}

interface AgentVoice {
  agent_id: string;
  message: string;
  tone: string;
  offers_practice: boolean;
}

interface DialogicalLayer {
  questions: string[];
  reflections: string[];
  resistances: string[];
  incomplete_knowings: string[];
}

interface ArchitecturalLayer {
  synaptic_gap_intensity: number;
  daimonic_signature: number;
  trickster_risk: number;
  grounding_options: string[];
}

interface ProcessingMeta {
  strategy: {
    mode: string;
    reasoning: string[];
  };
  thresholds: {
    complexity_readiness: number;
    safety_level: 'green' | 'yellow' | 'red';
    disclosure_level: number;
    grounding_needed: boolean;
  };
  event_id?: string;
  safety_interventions: string[];
}

interface UnifiedResponse {
  primary_message: string;
  agent_voices: AgentVoice[];
  ui_state: UIState;
  dialogical_layer?: DialogicalLayer;
  architectural_layer?: ArchitecturalLayer;
  processing_meta: ProcessingMeta;
}

interface StreamlinedDaimonicUIProps {
  userId: string;
  sessionId?: string;
  onMessage: (input: string, context: any) => Promise<UnifiedResponse>;
  className?: string;
}

export const StreamlinedDaimonicUI: React.FC<StreamlinedDaimonicUIProps> = ({
  userId,
  sessionId,
  onMessage,
  className = ""
}) => {
  // Pure UI state - no business logic
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<UnifiedResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<Array<{
    type: 'user' | 'oracle';
    content: string | UnifiedResponse;
    timestamp: Date;
  }>>([]);
  
  const [sessionCount, setSessionCount] = useState(1);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Pure message handling - no logic, just orchestration call
   */
  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userInput = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message to history
    setConversationHistory(prev => [...prev, {
      type: 'user',
      content: userInput,
      timestamp: new Date()
    }]);

    try {
      // Single call to unified orchestrator - no local processing
      const response = await onMessage(userInput, {
        sessionId,
        previousInteractions: sessionCount,
        currentPhase: currentResponse?.processing_meta?.strategy?.mode || 'initial'
      });

      // Pure state update based on orchestrator response
      setCurrentResponse(response);
      setConversationHistory(prev => [...prev, {
        type: 'oracle',
        content: response,
        timestamp: new Date()
      }]);
      
      setSessionCount(prev => prev + 1);

    } catch (error) {
      console.error('Message processing failed:', error);
      // Simple error handling - no complex logic
      setConversationHistory(prev => [...prev, {
        type: 'oracle',
        content: "Something went wrong. Let&apos;s try again.",
        timestamp: new Date()
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing, onMessage, sessionId, sessionCount, currentResponse]);

  /**
   * Pure keyboard handling
   */
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  /**
   * Pure grounding request - no logic, just callback
   */
  const handleGroundingRequest = useCallback(async () => {
    await onMessage("I need grounding support", { 
      sessionId, 
      grounding_request: true 
    });
  }, [onMessage, sessionId]);

  return (
    <div className={`max-w-4xl mx-auto p-6 space-y-6 ${className}`}>
      
      {/* Pure header rendering */}
      <DaimonicHeader 
        currentResponse={currentResponse}
        sessionCount={sessionCount}
        onGroundingRequest={handleGroundingRequest}
      />

      {/* Pure conversation display */}
      <ConversationDisplay 
        history={conversationHistory}
        isProcessing={isProcessing}
      />

      {/* Pure input area */}
      <InputArea
        value={input}
        onChange={setInput}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        disabled={isProcessing}
        inputRef={inputRef}
      />

      {/* Pure complexity progression hint */}
      {currentResponse && (
        <ComplexityProgressionHint response={currentResponse} />
      )}
    </div>
  );
};

/**
 * Pure header component - renders state, no calculations
 */
const DaimonicHeader: React.FC<{
  currentResponse: UnifiedResponse | null;
  sessionCount: number;
  onGroundingRequest: () => void;
}> = ({ currentResponse, sessionCount, onGroundingRequest }) => {
  const thresholds = currentResponse?.processing_meta.thresholds;
  
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-800">Daimonic Oracle</h1>
        
        {/* Pure complexity indicator - no calculations */}
        {thresholds && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Depth:</span>
            <div className="w-16 h-2 bg-gray-200 rounded-full">
              <div 
                className="h-2 bg-amber-500 rounded-full transition-all duration-500" 
                style={{ width: `${thresholds.complexity_readiness * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {Math.round(thresholds.complexity_readiness * 100)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Pure safety indicator */}
        {thresholds && (
          <SafetyIndicator level={thresholds.safety_level} />
        )}
        
        {/* Pure grounding button */}
        <button
          onClick={onGroundingRequest}
          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
          title="Request Grounding"
        >
          <Anchor size={20} />
        </button>
      </div>
    </div>
  );
};

/**
 * Pure safety indicator - just visual state
 */
const SafetyIndicator: React.FC<{ level: 'green' | 'yellow' | 'red' }> = ({ level }) => {
  const colors = {
    green: 'text-green-500',
    yellow: 'text-yellow-500', 
    red: 'text-red-500'
  };

  return (
    <div className={`w-3 h-3 rounded-full ${colors[level]} animate-pulse`} 
         title={`Safety Level: ${level}`} />
  );
};

/**
 * Pure conversation display - renders based on ui_state
 */
const ConversationDisplay: React.FC<{
  history: Array<{
    type: 'user' | 'oracle';
    content: string | UnifiedResponse;
    timestamp: Date;
  }>;
  isProcessing: boolean;
}> = ({ history, isProcessing }) => {
  return (
    <div className="space-y-4 min-h-[400px] max-h-[600px] overflow-y-auto">
      <AnimatePresence>
        {history.map((entry, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {entry.type === 'user' ? (
              <UserMessage content={entry.content as string} />
            ) : (
              <OracleResponse response={entry.content as UnifiedResponse} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {isProcessing && <ProcessingIndicator />}
    </div>
  );
};

/**
 * Pure user message display
 */
const UserMessage: React.FC<{ content: string }> = ({ content }) => (
  <div className="flex justify-end">
    <div className="max-w-sm p-3 bg-amber-100 rounded-lg">
      <p className="text-sm text-amber-800">{content}</p>
    </div>
  </div>
);

/**
 * Pure oracle response display - renders based on ui_state instructions
 */
const OracleResponse: React.FC<{ response: UnifiedResponse }> = ({ response }) => {
  const [showDialogical, setShowDialogical] = useState(false);
  const { ui_state, primary_message, agent_voices, dialogical_layer, architectural_layer } = response;

  return (
    <div className="space-y-4">
      {/* Processing pause if required */}
      {ui_state.requires_pause && <ProcessingPause />}

      {/* Visual hint rendering */}
      <VisualHintIndicator hint={ui_state.visual_hint} />

      {/* Primary message */}
      <div className="p-4 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-800 leading-relaxed whitespace-pre-line">
          {primary_message}
        </p>
      </div>

      {/* Agent voices if multiple */}
      {agent_voices.length > 1 && (
        <MultiAgentVoices voices={agent_voices} />
      )}

      {/* Dialogical layer if ui_state allows */}
      {ui_state.show_dialogical && dialogical_layer && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: showDialogical ? 1 : 0.7, height: 'auto' }}
          className="mt-4"
        >
          <button
            onClick={() => setShowDialogical(!showDialogical)}
            className="text-sm text-amber-600 hover:text-amber-800 mb-3"
          >
            {showDialogical ? 'Hide' : 'Explore'} deeper layers
          </button>
          
          {showDialogical && (
            <DialogicalDisplay layer={dialogical_layer} />
          )}
        </motion.div>
      )}

      {/* Architectural layer if ui_state allows */}
      {ui_state.show_architectural && architectural_layer && showDialogical && (
        <ArchitecturalDisplay layer={architectural_layer} />
      )}

      {/* Safety interventions if present */}
      {response.processing_meta.safety_interventions.length > 0 && (
        <SafetyInterventions interventions={response.processing_meta.safety_interventions} />
      )}
    </div>
  );
};

/**
 * Pure visual hint indicator
 */
const VisualHintIndicator: React.FC<{ hint: string }> = ({ hint }) => {
  const getIndicator = () => {
    switch (hint) {
      case 'grounding_mode':
        return <Circle className="text-green-500 animate-pulse" size={12} />;
      case 'trickster_alert':
        return <Zap className="text-amber-500 animate-bounce" size={12} />;
      case 'gentle_passage':
        return <Waves className="text-blue-500 animate-pulse" size={12} />;
      case 'creative_resonance':
        return <Circle className="text-indigo-500 animate-spin" size={12} />;
      default:
        return null;
    }
  };

  const indicator = getIndicator();
  if (!indicator) return null;

  return (
    <div className="flex items-center space-x-2 text-xs text-gray-600">
      {indicator}
      <span className="capitalize">{hint.replace('_', ' ')}</span>
    </div>
  );
};

/**
 * Pure processing pause component
 */
const ProcessingPause: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex items-center justify-center p-4"
  >
    <Pause className="text-gray-400 animate-pulse" size={16} />
    <span className="ml-2 text-sm text-gray-600">Processing...</span>
  </motion.div>
);

/**
 * Pure multi-agent voices display
 */
const MultiAgentVoices: React.FC<{ voices: AgentVoice[] }> = ({ voices }) => {
  const [activeVoice, setActiveVoice] = useState(0);

  return (
    <div className="space-y-3">
      {/* Agent tabs */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {voices.map((voice, index) => (
          <button
            key={voice.agent_id}
            onClick={() => setActiveVoice(index)}
            className={`
              flex-1 px-3 py-2 rounded text-sm font-medium transition-all
              ${activeVoice === index 
                ? 'bg-white text-amber-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {voice.agent_id.replace('_', ' ')}
            {voice.offers_practice && (
              <span className="ml-1 text-xs text-green-600">🌱</span>
            )}
          </button>
        ))}
      </div>

      {/* Active voice content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeVoice}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-4 bg-gray-50 rounded-lg"
        >
          <p className="text-gray-800">
            {voices[activeVoice].message}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/**
 * Pure dialogical layer display
 */
const DialogicalDisplay: React.FC<{ layer: DialogicalLayer }> = ({ layer }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'reflections' | 'resistances'>('questions');

  return (
    <div className="space-y-4 p-4 bg-amber-50 rounded-lg border-l-4 border-amber-300">
      {/* Tab navigation */}
      <div className="flex space-x-4">
        {(['questions', 'reflections', 'resistances'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              text-sm font-medium transition-colors
              ${activeTab === tab 
                ? 'text-amber-700 border-b-2 border-amber-700' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'questions' && (
            <ul className="space-y-2">
              {layer.questions.map((question, i) => (
                <li key={i} className="text-sm text-amber-800">
                  <span className="text-amber-600 mr-2">•</span>
                  {question}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'reflections' && (
            <ul className="space-y-2">
              {layer.reflections.map((reflection, i) => (
                <li key={i} className="text-sm text-amber-800 italic">
                  <span className="text-amber-600 mr-2">~</span>
                  {reflection}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'resistances' && (
            <div className="space-y-2">
              {layer.resistances.map((resistance, i) => (
                <div key={i} className="p-2 bg-orange-100 rounded text-sm text-orange-800">
                  <span className="text-orange-600 mr-2">⚡</span>
                  {resistance}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Incomplete knowings */}
      {layer.incomplete_knowings.length > 0 && (
        <div className="mt-4 p-3 bg-amber-100 rounded">
          <h4 className="text-sm font-medium text-amber-800 mb-2">Partial Knowings</h4>
          {layer.incomplete_knowings.map((knowing, i) => (
            <p key={i} className="text-sm text-amber-700 italic">
              {knowing}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Pure architectural layer display
 */
const ArchitecturalDisplay: React.FC<{ layer: ArchitecturalLayer }> = ({ layer }) => (
  <div className="p-4 bg-gray-100 rounded-lg">
    <h4 className="text-sm font-semibold text-gray-700 mb-3">System State</h4>
    
    <div className="grid grid-cols-3 gap-4 text-xs">
      <div>
        <span className="font-medium">Gap Intensity:</span>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-amber-500 h-2 rounded-full" 
            style={{ width: `${layer.synaptic_gap_intensity * 100}%` }}
          />
        </div>
      </div>
      
      <div>
        <span className="font-medium">Daimonic Signature:</span>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${layer.daimonic_signature * 100}%` }}
          />
        </div>
      </div>

      <div>
        <span className="font-medium">Trickster Risk:</span>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full" 
            style={{ width: `${layer.trickster_risk * 100}%` }}
          />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Pure safety interventions display
 */
const SafetyInterventions: React.FC<{ interventions: string[] }> = ({ interventions }) => (
  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
    <h4 className="text-sm font-medium text-green-800 mb-2">Grounding Support</h4>
    {interventions.map((intervention, i) => (
      <p key={i} className="text-sm text-green-700">
        {intervention}
      </p>
    ))}
  </div>
);

/**
 * Pure processing indicator
 */
const ProcessingIndicator: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex justify-center items-center p-8"
  >
    <div className="flex space-x-2">
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75" />
      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150" />
    </div>
    <span className="ml-4 text-sm text-gray-600">Oracle contemplating...</span>
  </motion.div>
);

/**
 * Pure input area
 */
const InputArea: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLTextAreaElement>;
}> = ({ value, onChange, onSend, onKeyPress, disabled, inputRef }) => (
  <div className="flex space-x-2">
    <textarea
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyPress={onKeyPress}
      placeholder="What would you like to explore?"
      className="flex-1 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      rows={2}
      disabled={disabled}
    />
    <button
      onClick={onSend}
      disabled={disabled || !value.trim()}
      className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Send size={18} />
    </button>
  </div>
);

/**
 * Pure complexity progression hint
 */
const ComplexityProgressionHint: React.FC<{ response: UnifiedResponse }> = ({ response }) => {
  const { thresholds } = response.processing_meta;
  
  if (thresholds.complexity_readiness >= 0.8) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700"
    >
      <p>
        Complexity threshold: {Math.round(thresholds.complexity_readiness * 100)}%. 
        Engage deeply with the questions above to unlock additional layers.
      </p>
    </motion.div>
  );
};

export default StreamlinedDaimonicUI;