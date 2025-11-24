/**
 * Daimonic Response UI - Progressive Disclosure Interface
 * 
 * Handles the layered presentation of daimonic agent responses.
 * Key principle: Complexity is earned through engagement, not delivered upfront.
 * The UI EMBODIES the synaptic gap rather than explaining it.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Pause, Zap, Circle, Waves } from 'lucide-react';
import { DaimonicAgentResponse } from '../backend/src/core/types/DaimonicResponse';

interface DaimonicResponseUIProps {
  response: DaimonicAgentResponse;
  userComplexityReadiness: number; // 0-1, determines what's shown
  onInteractionDeepened: () => void;
  onGroundingRequested: () => void;
  onResistanceExpressed: (resistance: string) => void;
}

export const DaimonicResponseUI: React.FC<DaimonicResponseUIProps> = ({
  response,
  userComplexityReadiness,
  onInteractionDeepened,
  onGroundingRequested,
  onResistanceExpressed
}) => {
  const [currentLayer, setCurrentLayer] = useState<'surface' | 'depth' | 'system'>('surface');
  const [showSynapticGap, setShowSynapticGap] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(response.system.requires_pause);
  
  const responseRef = useRef<HTMLDivElement>(null);

  // Handle processing pause if required
  useEffect(() => {
    if (response.system.requires_pause) {
      setIsProcessing(true);
      const pauseTime = response.architectural.synaptic_gap.intensity * 2000 + 1000; // 1-3 seconds
      
      setTimeout(() => {
        setIsProcessing(false);
      }, pauseTime);
    }
  }, [response.system.requires_pause, response.architectural.synaptic_gap.intensity]);

  // Determine what UI elements to show based on complexity readiness
  const shouldShowComplexElements = userComplexityReadiness > 0.5;
  const shouldShowArchitectural = userComplexityReadiness > 0.7;
  const shouldShowSynapticIndicators = userComplexityReadiness > 0.6;

  // Handle depth interaction
  const handleDepthInteraction = () => {
    setInteractionCount(prev => prev + 1);
    setCurrentLayer('depth');
    onInteractionDeepened();
    
    // Reveal synaptic gap after multiple interactions
    if (interactionCount > 2 && shouldShowSynapticIndicators) {
      setShowSynapticGap(true);
    }
  };

  // Get visual state based on synaptic gap
  const getVisualState = () => {
    const gap = response.architectural.synaptic_gap;
    
    switch (gap.quality) {
      case 'creative':
        return {
          bgGradient: 'from-amber-50 to-indigo-50',
          borderColor: 'border-amber-200',
          glowColor: 'shadow-amber-100',
          animation: 'pulse'
        };
      case 'emerging':
        return {
          bgGradient: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200',
          glowColor: 'shadow-green-100',
          animation: 'breathe'
        };
      case 'dissolving':
        return {
          bgGradient: 'from-yellow-50 to-orange-50',
          borderColor: 'border-yellow-300',
          glowColor: 'shadow-yellow-100',
          animation: 'steady'
        };
      case 'stuck':
        return {
          bgGradient: 'from-red-50 to-pink-50',
          borderColor: 'border-red-200',
          glowColor: 'shadow-red-100',
          animation: 'tense'
        };
      default:
        return {
          bgGradient: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200',
          glowColor: 'shadow-gray-100',
          animation: 'neutral'
        };
    }
  };

  const visualState = getVisualState();

  // Render processing state
  if (isProcessing) {
    return (
      <div className="flex items-center justify-center p-8 space-x-3">
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse delay-150"></div>
        <span className="text-sm text-gray-600 ml-4">Processing...</span>
      </div>
    );
  }

  return (
    <motion.div
      ref={responseRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        relative rounded-lg border transition-all duration-500
         ${visualState.bgGradient}
        ${visualState.borderColor} ${visualState.glowColor}
        ${visualState.animation === 'pulse' ? 'animate-pulse' : ''}
      `}
    >
      {/* Synaptic Gap Visualization */}
      {showSynapticGap && shouldShowSynapticIndicators && (
        <SynapticGapIndicator gap={response.architectural.synaptic_gap} />
      )}

      {/* Main Response Layer */}
      <div className="p-6">
        {/* Surface Layer - Always visible */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <PhenomenologicalResponse 
            content={response.phenomenological}
            tone={response.phenomenological.tone}
            onDeepen={handleDepthInteraction}
          />
        </motion.div>

        {/* Depth Layer - Progressive disclosure */}
        <AnimatePresence>
          {currentLayer === 'depth' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <DialogicalLayer 
                content={response.dialogical}
                onResistanceExpressed={onResistanceExpressed}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* System Layer - Only for experienced users */}
        {shouldShowArchitectural && currentLayer === 'depth' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 p-4 bg-gray-50 rounded border-l-4 border-amber-300"
          >
            <ArchitecturalInsights 
              architectural={response.architectural}
              system={response.system}
            />
          </motion.div>
        )}
      </div>

      {/* Grounding Escape Hatch - Always available */}
      {response.architectural.synaptic_gap.needsIntervention && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-2 right-2"
        >
          <button
            onClick={onGroundingRequested}
            className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            title="Ground this interaction"
          >
            🌱 Ground
          </button>
        </motion.div>
      )}

      {/* Interaction Hints */}
      {response.system.expects_resistance && (
        <InteractionHints 
          currentLayer={currentLayer}
          complexityReadiness={userComplexityReadiness}
          onLayerChange={setCurrentLayer}
        />
      )}
    </motion.div>
  );
};

/**
 * Surface layer component - Clean, experiential presentation
 */
const PhenomenologicalResponse: React.FC<{
  content: DaimonicAgentResponse['phenomenological'];
  tone: string;
  onDeepen: () => void;
}> = ({ content, tone, onDeepen }) => {
  const getToneStyle = (tone: string) => {
    switch (tone) {
      case 'crystalline':
        return 'font-medium text-gray-900 leading-relaxed';
      case 'flowing':
        return 'font-normal text-gray-800 leading-loose';
      case 'dense':
        return 'font-medium text-gray-900 leading-tight';
      default:
        return 'font-normal text-gray-700 leading-normal';
    }
  };

  return (
    <div className="space-y-4">
      <p className={getToneStyle(tone)}>{content.primary}</p>
      
      {/* Subtle interaction invitation */}
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onDeepen}
        className="inline-flex items-center space-x-2 text-sm text-amber-600 hover:text-amber-800 cursor-pointer"
      >
        <span>Explore deeper</span>
        <ChevronDown size={14} />
      </motion.div>
    </div>
  );
};

/**
 * Dialogical layer - Questions, reflections, resistances
 */
const DialogicalLayer: React.FC<{
  content: DaimonicAgentResponse['dialogical'];
  onResistanceExpressed: (resistance: string) => void;
}> = ({ content, onResistanceExpressed }) => {
  const [activeTab, setActiveTab] = useState<'questions' | 'reflections' | 'resistances'>('questions');

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        {(['questions', 'reflections', 'resistances'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              pb-2 px-1 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab 
                ? 'border-amber-500 text-amber-700' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {activeTab === 'questions' && (
            <ul className="space-y-2">
              {content.questions.map((question, index) => (
                <li key={index} className="text-gray-700 text-sm">
                  <span className="text-amber-600 mr-2">•</span>
                  {question}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'reflections' && (
            <ul className="space-y-2">
              {content.reflections.map((reflection, index) => (
                <li key={index} className="text-gray-700 text-sm italic">
                  <span className="text-blue-500 mr-2">~</span>
                  {reflection}
                </li>
              ))}
            </ul>
          )}

          {activeTab === 'resistances' && (
            <div className="space-y-2">
              {content.resistances.map((resistance, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onResistanceExpressed(resistance)}
                  className="block w-full text-left p-2 rounded border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800 text-sm transition-colors"
                >
                  <span className="text-orange-600 mr-2">⚡</span>
                  {resistance}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Incomplete Knowings */}
      {content.incomplete_knowings.length > 0 && (
        <div className="mt-6 p-3 bg-amber-50 rounded border-l-4 border-amber-300">
          <h4 className="text-sm font-medium text-amber-800 mb-2">Partial Knowings</h4>
          <div className="space-y-1">
            {content.incomplete_knowings.map((knowing, index) => (
              <p key={index} className="text-sm text-amber-700 italic">
                {knowing}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Synaptic gap visualization component
 */
const SynapticGapIndicator: React.FC<{
  gap: DaimonicAgentResponse['architectural']['synaptic_gap'];
}> = ({ gap }) => {
  const getGapVisualization = () => {
    switch (gap.quality) {
      case 'creative':
        return <Zap className="text-amber-500 animate-pulse" size={16} />;
      case 'emerging':
        return <Circle className="text-green-500 animate-spin" size={16} />;
      case 'dissolving':
        return <Waves className="text-yellow-500 animate-bounce" size={16} />;
      case 'stuck':
        return <Pause className="text-red-500" size={16} />;
      default:
        return <Circle className="text-gray-400" size={16} />;
    }
  };

  return (
    <div className="absolute -top-2 -right-2 bg-white rounded-full p-2 shadow-lg border">
      {getGapVisualization()}
      <div className="absolute -bottom-6 right-0 text-xs text-gray-500 whitespace-nowrap">
        Gap: {Math.round(gap.intensity * 100)}%
      </div>
    </div>
  );
};

/**
 * Architectural insights for experienced users
 */
const ArchitecturalInsights: React.FC<{
  architectural: DaimonicAgentResponse['architectural'];
  system: DaimonicAgentResponse['system'];
}> = ({ architectural, system }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-gray-700">System State</h4>
      
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-medium">Daimonic Signature:</span>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-amber-500 h-2 rounded-full" 
              style={{ width: `${architectural.daimonic_signature * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <span className="font-medium">Liminal Intensity:</span>
          <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${architectural.liminal_intensity * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-3">
        {system.requires_pause && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
            Requires Pause
          </span>
        )}
        {system.expects_resistance && (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">
            Expects Resistance
          </span>
        )}
        {system.offers_practice && (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
            Practice Available
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Interaction hints for guiding user engagement
 */
const InteractionHints: React.FC<{
  currentLayer: 'surface' | 'depth' | 'system';
  complexityReadiness: number;
  onLayerChange: (layer: 'surface' | 'depth' | 'system') => void;
}> = ({ currentLayer, complexityReadiness, onLayerChange }) => {
  const getHints = () => {
    if (currentLayer === 'surface' && complexityReadiness > 0.4) {
      return ["Click 'Explore deeper' to see more layers"];
    }
    if (currentLayer === 'depth' && complexityReadiness > 0.7) {
      return ["System insights available for advanced users"];
    }
    return [];
  };

  const hints = getHints();
  
  if (hints.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700 border border-blue-200"
    >
      {hints.map((hint, index) => (
        <p key={index}>{hint}</p>
      ))}
    </motion.div>
  );
};

export default DaimonicResponseUI;