"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface ConsciousnessEvolutionData {
  evolutionStage: 'initial' | 'developing' | 'mature' | 'transcendent' | 'collective';
  patternId: string;
  learningAcceleration: number;
  memoryConsolidation: number;
  transcendenceIndicator: number;
  gebserStructure: {
    primary: string;
    confidence: number;
    progression: string[];
  };
  elementalBalance: {
    fire: number;
    water: number;
    earth: number;
    air: number;
    aether: number;
  };
  autonomousAgents: {
    agentEmerged: boolean;
    primaryAgent?: string;
    emergenceType?: string;
    collaborationScore: number;
  };
  shadowWork: {
    shadowActivated: boolean;
    asymmetryScore: number;
    depthWorkReadiness: 'low' | 'moderate' | 'high';
    reflectionQuestions: string[];
  };
  collectiveIntelligence: {
    readiness: number;
    resonanceCompatibility: number;
    emergentContributions: string[];
    learningPotential: number;
  };
  lastUpdated: string;
}

interface EvolutionDashboardProps {
  data: ConsciousnessEvolutionData;
  realTimeUpdates?: boolean;
  showDetailedMetrics?: boolean;
}

// ============================================================================
// VISUALIZATION COMPONENTS
// ============================================================================

const EvolutionStageVisualizer: React.FC<{
  currentStage: string;
  progression: number;
}> = ({ currentStage, progression }) => {
  const stages = ['initial', 'developing', 'mature', 'transcendent', 'collective'];
  const stageEmojis: Record<string, string> = {
    initial: '🌱',
    developing: '🌿',
    mature: '🌳',
    transcendent: '✨',
    collective: '🌌'
  };

  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-sage-800">Evolution Stage</h3>
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => (
          <div key={stage} className="flex flex-col items-center space-y-2">
            <motion.div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center text-2xl
                ${index <= currentIndex
                  ? 'bg-gradient-to-br from-sage-400 to-teal-400 text-white'
                  : 'bg-sage-100 text-sage-400'
                }
              `}
              animate={{
                scale: index === currentIndex ? [1, 1.1, 1] : 1,
                opacity: index <= currentIndex ? 1 : 0.5
              }}
              transition={{
                duration: 2,
                repeat: index === currentIndex ? Infinity : 0,
                ease: "easeInOut"
              }}
            >
              {stageEmojis[stage]}
            </motion.div>
            <span className={`
              text-xs font-medium capitalize
              ${index <= currentIndex ? 'text-sage-700' : 'text-sage-400'}
            `}>
              {stage}
            </span>
            {index === currentIndex && (
              <div className="w-16 bg-sage-100 rounded-full h-1.5">
                <motion.div
                  className="h-1.5 bg-gradient-to-r from-sage-400 to-teal-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progression * 100}%` }}
                  transition={{ duration: 1.5 }}
                />
              </div>
            )}
            {index < stages.length - 1 && (
              <div className={`
                absolute top-6 left-16 w-8 h-0.5
                ${index < currentIndex ? 'bg-sage-400' : 'bg-sage-200'}
              `} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ElementalBalanceWheel: React.FC<{
  elementalBalance: ConsciousnessEvolutionData['elementalBalance']
}> = ({ elementalBalance }) => {
  const elements = [
    { name: 'Fire', value: elementalBalance.fire, color: '#f97316', emoji: '🔥' },
    { name: 'Water', value: elementalBalance.water, color: '#3b82f6', emoji: '🌊' },
    { name: 'Earth', value: elementalBalance.earth, color: '#22c55e', emoji: '🌍' },
    { name: 'Air', value: elementalBalance.air, color: '#a855f7', emoji: '🌪️' },
    { name: 'Aether', value: elementalBalance.aether, color: '#facc15', emoji: '✨' }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-sage-800">Elemental Balance</h3>
      <div className="relative w-40 h-40 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          {elements.map((element, index) => {
            const angle = (index * 360) / elements.length;
            const radius = 60;
            const intensity = element.value * radius;
            const x1 = 80;
            const y1 = 80;
            const x2 = 80 + Math.cos(angle * Math.PI / 180) * intensity;
            const y2 = 80 + Math.sin(angle * Math.PI / 180) * intensity;

            return (
              <motion.line
                key={element.name}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={element.color}
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ x2: x1, y2: y1 }}
                animate={{ x2, y2 }}
                transition={{ duration: 1.5, delay: index * 0.2 }}
              />
            );
          })}
          <circle cx="80" cy="80" r="3" fill="#374151" />
        </svg>

        {/* Element labels */}
        {elements.map((element, index) => {
          const angle = (index * 360) / elements.length;
          const labelRadius = 75;
          const x = 80 + Math.cos(angle * Math.PI / 180) * labelRadius;
          const y = 80 + Math.sin(angle * Math.PI / 180) * labelRadius;

          return (
            <div
              key={element.name}
              className="absolute text-xs font-medium text-sage-700 flex items-center space-x-1"
              style={{
                left: `${x - 20}px`,
                top: `${y - 10}px`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <span>{element.emoji}</span>
              <span>{(element.value * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const GebserStructureProgress: React.FC<{
  gebserData: ConsciousnessEvolutionData['gebserStructure']
}> = ({ gebserData }) => {
  const structures = ['ARCHAIC', 'MAGICAL', 'MYTHICAL', 'MENTAL', 'INTEGRAL'];
  const structureEmojis: Record<string, string> = {
    ARCHAIC: '🌍',
    MAGICAL: '🌊',
    MYTHICAL: '🔥',
    MENTAL: '💎',
    INTEGRAL: '✨'
  };

  const currentIndex = structures.indexOf(gebserData.primary);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-sage-800">Gebser Consciousness Structure</h3>
      <div className="space-y-3">
        {structures.map((structure, index) => (
          <div key={structure} className="flex items-center space-x-3">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm
              ${index === currentIndex ? 'bg-sage-500 text-white' : 'bg-sage-100 text-sage-500'}
            `}>
              {structureEmojis[structure]}
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between">
                <span className={`
                  text-sm font-medium
                  ${index === currentIndex ? 'text-sage-800' : 'text-sage-500'}
                `}>
                  {structure}
                </span>
                {index === currentIndex && (
                  <span className="text-xs text-sage-600">
                    {(gebserData.confidence * 100).toFixed(1)}% confidence
                  </span>
                )}
              </div>
              <div className="w-full bg-sage-100 rounded-full h-2">
                <motion.div
                  className={`
                    h-2 rounded-full
                    ${index === currentIndex
                      ? 'bg-gradient-to-r from-sage-400 to-teal-400'
                      : index < currentIndex
                        ? 'bg-sage-300'
                        : 'bg-sage-100'
                    }
                  `}
                  initial={{ width: '0%' }}
                  animate={{
                    width: index === currentIndex
                      ? `${gebserData.confidence * 100}%`
                      : index < currentIndex ? '100%' : '0%'
                  }}
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const MetricsGrid: React.FC<{ data: ConsciousnessEvolutionData }> = ({ data }) => {
  const metrics = [
    {
      label: 'Learning Acceleration',
      value: data.learningAcceleration,
      emoji: '🚀',
      color: 'from-orange-400 to-red-400'
    },
    {
      label: 'Memory Consolidation',
      value: data.memoryConsolidation,
      emoji: '🧠',
      color: 'from-blue-400 to-indigo-400'
    },
    {
      label: 'Transcendence Indicator',
      value: data.transcendenceIndicator,
      emoji: '🌟',
      color: 'from-yellow-400 to-orange-400'
    },
    {
      label: 'Collective Readiness',
      value: data.collectiveIntelligence.readiness,
      emoji: '🌌',
      color: 'from-purple-400 to-pink-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center text-lg
              bg-gradient-to-r ${metric.color}
            `}>
              {metric.emoji}
            </div>
            <div className="flex-1">
              <div className="text-xs text-sage-600 font-medium">{metric.label}</div>
              <div className="text-lg font-bold text-sage-800">
                {(metric.value * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

const ConsciousnessEvolutionDashboard: React.FC<EvolutionDashboardProps> = ({
  data,
  realTimeUpdates = false,
  showDetailedMetrics = true
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getEvolutionProgress = (stage: string): number => {
    const stages = ['initial', 'developing', 'mature', 'transcendent', 'collective'];
    const index = stages.indexOf(stage);
    return data.learningAcceleration; // Use learning acceleration as progression indicator
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <motion.div
        className="text-center space-y-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-3xl font-bold text-sage-800">
          🌀 Consciousness Evolution Dashboard
        </h1>
        <p className="text-sage-600">
          Real-time tracking of your consciousness development journey
        </p>
        {realTimeUpdates && (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-xs text-sage-500">Live updates active</span>
          </div>
        )}
      </motion.div>

      {/* Main Evolution Display */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <Card className="p-6">
          <EvolutionStageVisualizer
            currentStage={data.evolutionStage}
            progression={getEvolutionProgress(data.evolutionStage)}
          />
        </Card>
      </motion.div>

      {/* Detailed Metrics */}
      {showDetailedMetrics && (
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <Card className="p-6">
            <GebserStructureProgress gebserData={data.gebserStructure} />
          </Card>

          <Card className="p-6">
            <ElementalBalanceWheel elementalBalance={data.elementalBalance} />
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-medium text-sage-800">System Status</h3>
            <div className="space-y-3">
              {/* Agent Emergence */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-sage-600">Autonomous Agents</span>
                <div className="flex items-center space-x-2">
                  {data.autonomousAgents.agentEmerged ? (
                    <>
                      <motion.div
                        className="w-2 h-2 bg-green-500 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="text-xs text-sage-700">
                        {data.autonomousAgents.primaryAgent} Active
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-sage-300 rounded-full" />
                      <span className="text-xs text-sage-500">Dormant</span>
                    </>
                  )}
                </div>
              </div>

              {/* Shadow Work */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-sage-600">Shadow Integration</span>
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${data.shadowWork.shadowActivated ? 'bg-purple-500' : 'bg-sage-300'}
                  `} />
                  <span className="text-xs text-sage-700 capitalize">
                    {data.shadowWork.depthWorkReadiness}
                  </span>
                </div>
              </div>

              {/* Collective Intelligence */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-sage-600">Collective Ready</span>
                <div className="flex items-center space-x-2">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${data.collectiveIntelligence.readiness > 0.7 ? 'bg-blue-500' : 'bg-sage-300'}
                  `} />
                  <span className="text-xs text-sage-700">
                    {(data.collectiveIntelligence.readiness * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Quick Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <MetricsGrid data={data} />
      </motion.div>

      {/* Footer Info */}
      <motion.div
        className="text-center text-xs text-sage-500 space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
      >
        <p>Pattern ID: {data.patternId}</p>
        <p>Last updated: {new Date(data.lastUpdated).toLocaleString()}</p>
      </motion.div>
    </div>
  );
};

export default ConsciousnessEvolutionDashboard;