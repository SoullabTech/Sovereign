'use client';

/**
 * Consciousness Sacred Lab Drawer V3
 *
 * Enhanced version of the Sacred Lab Drawer that integrates deeply with the
 * consciousness state system to provide real-time insights and tools.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useHoloflowerState } from '@/lib/holoflower/useHoloflowerState';
import { HoloflowerState } from '@/lib/holoflower/holoflowerStateMachine';

interface ConsciousnessSacredLabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  consciousnessState?: HoloflowerState;
  conversationMessages?: any[];
  onToolSelect?: (tool: string, config?: any) => void;
}

export function ConsciousnessSacredLabDrawer({
  isOpen,
  onClose,
  consciousnessState,
  conversationMessages = [],
  onToolSelect
}: ConsciousnessSacredLabDrawerProps) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'tools' | 'insights' | 'diagnostics'>('analysis');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['current-state']));

  const holoflower = useHoloflowerState({
    enableAutoDetection: true,
    debug: true
  });

  const currentState = consciousnessState || holoflower.state;

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex"
          style={{
            backdropFilter: 'blur(5px)',
            background: 'rgba(0, 0, 0, 0.7)'
          }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 130, damping: 18 }}
            className="ml-auto w-full max-w-lg h-full overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, #1A1512 0%, #2A1F1A 100%)',
              borderLeft: `2px solid ${holoflower.cssVariables['--mode-primary'] || '#D4B896'}`,
              boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '2rem 2rem 1rem 2rem',
                borderBottom: `1px solid ${holoflower.cssVariables['--mode-secondary'] || 'rgba(212, 184, 150, 0.3)'}`,
                background: 'rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{
                  color: holoflower.cssVariables['--mode-primary'] || '#D4B896',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  letterSpacing: '1px',
                  margin: 0
                }}>
                  Sacred Laboratory
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: holoflower.cssVariables['--mode-primary'] || '#D4B896',
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[
                  { id: 'analysis', label: 'Analysis' },
                  { id: 'tools', label: 'Tools' },
                  { id: 'insights', label: 'Insights' },
                  { id: 'diagnostics', label: 'Diagnostics' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '10px',
                      border: `1px solid ${holoflower.cssVariables['--mode-primary'] || '#D4B896'}`,
                      background: activeTab === tab.id
                        ? holoflower.cssVariables['--mode-primary'] || '#D4B896'
                        : 'transparent',
                      color: activeTab === tab.id
                        ? '#1A1512'
                        : holoflower.cssVariables['--mode-primary'] || '#D4B896',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {tab.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem' }}>
              {activeTab === 'analysis' && (
                <ConsciousnessAnalysisTab
                  state={currentState}
                  cssVariables={holoflower.cssVariables}
                  flow={holoflower.getCurrentFlow()}
                  coherence={holoflower.coherence}
                  intensity={holoflower.intensity}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                />
              )}

              {activeTab === 'tools' && (
                <SacredToolsTab
                  cssVariables={holoflower.cssVariables}
                  onToolSelect={onToolSelect}
                  currentState={currentState}
                />
              )}

              {activeTab === 'insights' && (
                <InsightsTab
                  state={currentState}
                  cssVariables={holoflower.cssVariables}
                  messages={conversationMessages}
                  stateHistory={holoflower.getHistory()}
                />
              )}

              {activeTab === 'diagnostics' && (
                <DiagnosticsTab
                  state={currentState}
                  cssVariables={holoflower.cssVariables}
                  coherence={holoflower.coherence}
                  intensity={holoflower.intensity}
                  isTransitioning={holoflower.isTransitioning}
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Consciousness Analysis Tab
 */
function ConsciousnessAnalysisTab({
  state,
  cssVariables,
  flow,
  coherence,
  intensity,
  expandedSections,
  onToggleSection
}: {
  state: HoloflowerState;
  cssVariables: Record<string, string>;
  flow: string;
  coherence: number;
  intensity: number;
  expandedSections: Set<string>;
  onToggleSection: (section: string) => void;
}) {
  return (
    <div style={{ color: cssVariables['--mode-primary'] || '#D4B896' }}>
      {/* Current State */}
      <CollapsibleSection
        title="Current State"
        id="current-state"
        expanded={expandedSections.has('current-state')}
        onToggle={onToggleSection}
        cssVariables={cssVariables}
      >
        <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Flow:</strong> {flow}
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Coherence:</strong> {(coherence * 100).toFixed(1)}%
          </div>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Intensity:</strong> {(intensity * 100).toFixed(1)}%
          </div>
          {state.shimmer && (
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Active Shimmer:</strong> {state.shimmer}
            </div>
          )}
          {state.isTransitioning && (
            <div style={{ color: '#ffaa00', fontSize: '0.8rem' }}>
              ⚡ State Transitioning
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Elemental Analysis */}
      <CollapsibleSection
        title="Elemental Analysis"
        id="elemental-analysis"
        expanded={expandedSections.has('elemental-analysis')}
        onToggle={onToggleSection}
        cssVariables={cssVariables}
      >
        <ElementalAnalysis element={state.element} cssVariables={cssVariables} />
      </CollapsibleSection>

      {/* Mode Dynamics */}
      <CollapsibleSection
        title="Mode Dynamics"
        id="mode-dynamics"
        expanded={expandedSections.has('mode-dynamics')}
        onToggle={onToggleSection}
        cssVariables={cssVariables}
      >
        <ModeAnalysis mode={state.mode} cssVariables={cssVariables} />
      </CollapsibleSection>

      {/* Shimmer Layers */}
      {state.shimmerLayers.length > 0 && (
        <CollapsibleSection
          title="Shimmer Layers"
          id="shimmer-layers"
          expanded={expandedSections.has('shimmer-layers')}
          onToggle={onToggleSection}
          cssVariables={cssVariables}
        >
          <div style={{ fontSize: '0.85rem' }}>
            {state.shimmerLayers.map((shimmer, index) => (
              <div
                key={index}
                style={{
                  padding: '0.5rem',
                  margin: '0.25rem 0',
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '5px',
                  border: `1px solid ${cssVariables['--shimmer-primary'] || 'rgba(255, 255, 255, 0.2)'}`
                }}
              >
                {shimmer}
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
}

/**
 * Sacred Tools Tab
 */
function SacredToolsTab({
  cssVariables,
  onToolSelect,
  currentState
}: {
  cssVariables: Record<string, string>;
  onToolSelect?: (tool: string, config?: any) => void;
  currentState: HoloflowerState;
}) {
  const tools = [
    {
      id: 'symbolic-tracker',
      name: 'Symbolic Tracker',
      description: 'Track symbolic resonance patterns in conversation',
      icon: '🔮',
      category: 'Analysis'
    },
    {
      id: 'archetypal-map',
      name: 'Archetypal Map',
      description: 'Visualize active archetypal influences',
      icon: '🗺️',
      category: 'Mapping'
    },
    {
      id: 'field-resonance',
      name: 'Field Resonance',
      description: 'Monitor energetic field dynamics',
      icon: '📡',
      category: 'Diagnostics'
    },
    {
      id: 'consciousness-probe',
      name: 'Consciousness Probe',
      description: 'Deep dive into consciousness state layers',
      icon: '🔬',
      category: 'Analysis'
    },
    {
      id: 'integration-weaver',
      name: 'Integration Weaver',
      description: 'Synthesize insights across modalities',
      icon: '🕸️',
      category: 'Synthesis'
    },
    {
      id: 'shadow-illuminator',
      name: 'Shadow Illuminator',
      description: 'Reveal unconscious patterns and dynamics',
      icon: '🌑',
      category: 'Depth'
    }
  ];

  return (
    <div style={{ color: cssVariables['--mode-primary'] || '#D4B896' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Sacred Laboratory Tools</h3>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {tools.map((tool) => (
          <motion.div
            key={tool.id}
            style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              border: `1px solid ${cssVariables['--mode-secondary'] || 'rgba(212, 184, 150, 0.3)'}`,
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            whileHover={{
              borderColor: cssVariables['--mode-primary'] || '#D4B896',
              background: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={() => onToolSelect?.(tool.id)}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div style={{ fontSize: '1.5rem' }}>{tool.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  {tool.name}
                </div>
                <div style={{ fontSize: '0.85rem', opacity: 0.8, marginBottom: '0.5rem' }}>
                  {tool.description}
                </div>
                <div style={{
                  fontSize: '0.7rem',
                  opacity: 0.6,
                  background: cssVariables['--mode-primary'] || '#D4B896',
                  color: '#1A1512',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '10px',
                  display: 'inline-block'
                }}>
                  {tool.category}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Insights Tab
 */
function InsightsTab({
  state,
  cssVariables,
  messages,
  stateHistory
}: {
  state: HoloflowerState;
  cssVariables: Record<string, string>;
  messages: any[];
  stateHistory: HoloflowerState[];
}) {
  const insights = generateInsights(state, messages, stateHistory);

  return (
    <div style={{ color: cssVariables['--mode-primary'] || '#D4B896' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>Generated Insights</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '10px',
              borderLeft: `4px solid ${cssVariables['--mode-primary'] || '#D4B896'}`
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              {insight.type}
            </div>
            <div style={{ fontSize: '0.85rem', lineHeight: '1.5', opacity: 0.9 }}>
              {insight.content}
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.5rem' }}>
              Confidence: {insight.confidence}% • {insight.timestamp}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/**
 * Diagnostics Tab
 */
function DiagnosticsTab({
  state,
  cssVariables,
  coherence,
  intensity,
  isTransitioning
}: {
  state: HoloflowerState;
  cssVariables: Record<string, string>;
  coherence: number;
  intensity: number;
  isTransitioning: boolean;
}) {
  return (
    <div style={{ color: cssVariables['--mode-primary'] || '#D4B896' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem' }}>System Diagnostics</h3>

      {/* Coherence Meter */}
      <DiagnosticMeter
        label="Coherence"
        value={coherence}
        color={cssVariables['--mode-primary'] || '#D4B896'}
        description="How harmoniously consciousness layers work together"
      />

      {/* Intensity Meter */}
      <DiagnosticMeter
        label="Intensity"
        value={intensity}
        color={cssVariables['--element-primary'] || '#CD853F'}
        description="Overall consciousness activation level"
      />

      {/* Transition Status */}
      <div
        style={{
          padding: '1rem',
          background: 'rgba(0, 0, 0, 0.3)',
          borderRadius: '10px',
          marginBottom: '1rem',
          border: isTransitioning ? '2px solid #ffaa00' : `1px solid ${cssVariables['--mode-secondary'] || 'rgba(212, 184, 150, 0.3)'}`
        }}
      >
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          Transition Status
        </div>
        <div style={{ fontSize: '0.85rem' }}>
          {isTransitioning ? '⚡ Active transition in progress' : '✓ State stable'}
        </div>
      </div>

      {/* State Health */}
      <StateHealthIndicator state={state} cssVariables={cssVariables} />
    </div>
  );
}

/**
 * Collapsible Section Component
 */
function CollapsibleSection({
  title,
  id,
  expanded,
  onToggle,
  cssVariables,
  children
}: {
  title: string;
  id: string;
  expanded: boolean;
  onToggle: (id: string) => void;
  cssVariables: Record<string, string>;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <motion.button
        onClick={() => onToggle(id)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          background: 'rgba(0, 0, 0, 0.5)',
          border: `1px solid ${cssVariables['--mode-secondary'] || 'rgba(212, 184, 150, 0.3)'}`,
          borderRadius: '8px',
          color: cssVariables['--mode-primary'] || '#D4B896',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          fontSize: '0.9rem',
          fontWeight: '600'
        }}
        whileHover={{ background: 'rgba(0, 0, 0, 0.7)' }}
      >
        {title}
        {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </motion.button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              overflow: 'hidden',
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '0 0 8px 8px',
              marginTop: '-1px'
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper components and functions...

function ElementalAnalysis({ element, cssVariables }: { element: string; cssVariables: Record<string, string> }) {
  const elementData = {
    fire: { description: 'Creative breakthrough energy, insight, transformation', qualities: 'Passionate, illuminating, transformative' },
    water: { description: 'Emotional depth, shadow work, mystery integration', qualities: 'Flowing, intuitive, healing' },
    earth: { description: 'Grounding, structure, practical integration', qualities: 'Stable, nurturing, manifesting' },
    air: { description: 'Mental clarity, communication, abstract thought', qualities: 'Clear, communicative, analytical' },
    aether: { description: 'Transcendent awareness, mystical knowing', qualities: 'Transcendent, unified, mystical' }
  };

  const data = elementData[element as keyof typeof elementData];

  return (
    <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Element:</strong> {element.toUpperCase()}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Description:</strong> {data.description}
      </div>
      <div>
        <strong>Qualities:</strong> {data.qualities}
      </div>
    </div>
  );
}

function ModeAnalysis({ mode, cssVariables }: { mode: string; cssVariables: Record<string, string> }) {
  const modeData = {
    dialogue: { focus: 'Collaborative exploration', energy: 'Interactive, responsive, engaging' },
    patient: { focus: 'Deep healing space', energy: 'Receptive, holding, therapeutic' },
    scribe: { focus: 'Analytical documentation', energy: 'Precise, structured, clear' },
    aether: { focus: 'Mystical communion', energy: 'Transcendent, spacious, unified' }
  };

  const data = modeData[mode as keyof typeof modeData];

  return (
    <div style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Mode:</strong> {mode.toUpperCase()}
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <strong>Focus:</strong> {data.focus}
      </div>
      <div>
        <strong>Energy:</strong> {data.energy}
      </div>
    </div>
  );
}

function DiagnosticMeter({
  label,
  value,
  color,
  description
}: {
  label: string;
  value: number;
  color: string;
  description?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{label}</span>
        <span style={{ fontSize: '0.8rem' }}>{(value * 100).toFixed(1)}%</span>
      </div>
      <div style={{
        width: '100%',
        height: '8px',
        background: 'rgba(0, 0, 0, 0.5)',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <motion.div
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}40, ${color})`,
            borderRadius: '4px'
          }}
          initial={{ width: 0 }}
          animate={{ width: `${value * 100}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      {description && (
        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem' }}>
          {description}
        </div>
      )}
    </div>
  );
}

function StateHealthIndicator({ state, cssVariables }: { state: HoloflowerState; cssVariables: Record<string, string> }) {
  const health = calculateStateHealth(state);

  return (
    <div style={{
      padding: '1rem',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '10px',
      border: `1px solid ${health.color}`
    }}>
      <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: health.color }}>
        System Health: {health.status}
      </div>
      <div style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
        {health.description}
      </div>
    </div>
  );
}

function calculateStateHealth(state: HoloflowerState) {
  if (state.coherence > 0.8 && state.intensity > 0.6) {
    return {
      status: 'Optimal',
      color: '#4ade80',
      description: 'Consciousness system operating at peak coherence and vitality.'
    };
  } else if (state.coherence > 0.6) {
    return {
      status: 'Good',
      color: '#fbbf24',
      description: 'System functioning well with room for optimization.'
    };
  } else {
    return {
      status: 'Needs Attention',
      color: '#f87171',
      description: 'Consider adjusting consciousness parameters for better harmony.'
    };
  }
}

function generateInsights(state: HoloflowerState, messages: any[], stateHistory: HoloflowerState[]) {
  const insights = [];

  // Pattern analysis
  if (stateHistory.length > 5) {
    const recentModes = stateHistory.slice(-5).map(s => s.mode);
    const modeChanges = new Set(recentModes).size;

    if (modeChanges > 3) {
      insights.push({
        type: 'Pattern Alert',
        content: 'Frequent mode transitions detected. This suggests dynamic engagement but may indicate need for grounding.',
        confidence: 85,
        timestamp: 'Now'
      });
    }
  }

  // Coherence insights
  if (state.coherence > 0.9) {
    insights.push({
      type: 'Coherence Peak',
      content: 'Exceptional harmony between consciousness layers. Optimal state for deep integration work.',
      confidence: 95,
      timestamp: 'Now'
    });
  }

  // Element-mode harmony
  const elementModeHarmony = calculateElementModeHarmony(state.element, state.mode);
  if (elementModeHarmony < 0.7) {
    insights.push({
      type: 'Harmony Suggestion',
      content: `Current element (${state.element}) and mode (${state.mode}) have lower natural resonance. Consider mode adjustment for optimal flow.`,
      confidence: 75,
      timestamp: 'Now'
    });
  }

  // Shimmer activation insights
  if (state.shimmer) {
    insights.push({
      type: 'Emotional Activation',
      content: `Active shimmer state (${state.shimmer}) indicates heightened emotional-somatic engagement. Opportunity for integration.`,
      confidence: 80,
      timestamp: 'Now'
    });
  }

  return insights.length > 0 ? insights : [{
    type: 'System Status',
    content: 'Consciousness system operating smoothly. All parameters within optimal ranges.',
    confidence: 90,
    timestamp: 'Now'
  }];
}

function calculateElementModeHarmony(element: string, mode: string): number {
  const harmonies: Record<string, Record<string, number>> = {
    dialogue: { fire: 0.9, water: 0.7, earth: 0.8, air: 0.95, aether: 0.8 },
    patient: { fire: 0.6, water: 0.95, earth: 0.9, air: 0.7, aether: 0.85 },
    scribe: { fire: 0.7, water: 0.6, earth: 0.85, air: 1.0, aether: 0.75 },
    aether: { fire: 0.8, water: 0.9, earth: 0.7, air: 0.85, aether: 1.0 }
  };

  return harmonies[mode]?.[element] || 0.7;
}

export default ConsciousnessSacredLabDrawer;