'use client';

/**
 * Desktop Deep Dive MAIA Experience
 *
 * Leverages larger screen real estate for:
 * - Multi-panel consciousness exploration
 * - Advanced analytics and pattern recognition
 * - Deep research integration
 * - Complex visualization
 * - Extended session capabilities
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Eye, Heart, Compass, BookOpen, BarChart3,
  Network, Layers, Split, Maximize, Settings,
  Archive, Search, Filter, Calendar
} from 'lucide-react';

interface DeepDivePanel {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  size: 'quarter' | 'half' | 'full';
  position: { x: number; y: number };
  active: boolean;
}

interface DesktopDeepDiveProps {
  userId: string;
  userName: string;
  onLayoutChange?: (layout: DeepDivePanel[]) => void;
  className?: string;
}

export function DesktopDeepDive({ userId, userName, onLayoutChange, className = '' }: DesktopDeepDiveProps) {
  const [activeLayout, setActiveLayout] = useState<'research' | 'analysis' | 'exploration' | 'synthesis'>('exploration');
  const [panels, setPanels] = useState<DeepDivePanel[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [focusMode, setFocusMode] = useState(false);

  // Desktop-optimized panel configurations
  const layoutPresets = {
    exploration: [
      { id: 'main_conversation', title: 'MAIA Conversation', component: ConversationPanel, size: 'half' as const, position: { x: 0, y: 0 }, active: true },
      { id: 'consciousness_map', title: 'Consciousness Mapping', component: ConsciousnessMapPanel, size: 'quarter' as const, position: { x: 1, y: 0 }, active: true },
      { id: 'wisdom_patterns', title: 'Wisdom Patterns', component: WisdomPatternsPanel, size: 'quarter' as const, position: { x: 1, y: 1 }, active: true },
      { id: 'session_notes', title: 'Session Notes', component: SessionNotesPanel, size: 'quarter' as const, position: { x: 0, y: 1 }, active: true }
    ],

    research: [
      { id: 'research_conversation', title: 'Research Dialogue', component: ResearchConversationPanel, size: 'half' as const, position: { x: 0, y: 0 }, active: true },
      { id: 'knowledge_graph', title: 'Knowledge Graph', component: KnowledgeGraphPanel, size: 'quarter' as const, position: { x: 1, y: 0 }, active: true },
      { id: 'citations_sources', title: 'Sources & Citations', component: SourcesPanel, size: 'quarter' as const, position: { x: 0, y: 1 }, active: true },
      { id: 'synthesis_notes', title: 'Synthesis Notes', component: SynthesisNotesPanel, size: 'quarter' as const, position: { x: 1, y: 1 }, active: true }
    ],

    analysis: [
      { id: 'metrics_dashboard', title: 'Consciousness Metrics', component: MetricsDashboardPanel, size: 'half' as const, position: { x: 0, y: 0 }, active: true },
      { id: 'pattern_recognition', title: 'Pattern Recognition', component: PatternRecognitionPanel, size: 'quarter' as const, position: { x: 1, y: 0 }, active: true },
      { id: 'evolution_timeline', title: 'Evolution Timeline', component: EvolutionTimelinePanel, size: 'quarter' as const, position: { x: 0, y: 1 }, active: true },
      { id: 'insight_synthesis', title: 'Insight Synthesis', component: InsightSynthesisPanel, size: 'quarter' as const, position: { x: 1, y: 1 }, active: true }
    ],

    synthesis: [
      { id: 'wisdom_weaving', title: 'Wisdom Weaving', component: WisdomWeavingPanel, size: 'full' as const, position: { x: 0, y: 0 }, active: true }
    ]
  };

  // Initialize with exploration layout
  useEffect(() => {
    setPanels(layoutPresets[activeLayout]);
  }, [activeLayout]);

  // Desktop-specific features
  const desktopFeatures = [
    {
      id: 'multi_panel',
      name: 'Multi-Panel Interface',
      description: 'Work with multiple consciousness aspects simultaneously',
      icon: Split,
      active: !focusMode
    },
    {
      id: 'deep_analytics',
      name: 'Deep Analytics',
      description: 'Advanced pattern recognition and consciousness metrics',
      icon: BarChart3,
      active: true
    },
    {
      id: 'research_integration',
      name: 'Research Integration',
      description: 'Connect with consciousness research and literature',
      icon: BookOpen,
      active: activeLayout === 'research'
    },
    {
      id: 'extended_sessions',
      name: 'Extended Sessions',
      description: 'Deep, multi-hour consciousness exploration',
      icon: Calendar,
      active: true
    },
    {
      id: 'knowledge_mapping',
      name: 'Knowledge Mapping',
      description: 'Visual representation of insights and connections',
      icon: Network,
      active: true
    }
  ];

  const LayoutSwitcher = () => (
    <div className="flex gap-2 p-2 bg-black/20 rounded-lg">
      {Object.keys(layoutPresets).map((layout) => (
        <button
          key={layout}
          onClick={() => setActiveLayout(layout as any)}
          className={`px-4 py-2 rounded-lg text-sm font-light transition-all ${
            activeLayout === layout
              ? 'bg-amber-500/30 text-amber-200'
              : 'text-amber-400/60 hover:text-amber-300/80'
          }`}
        >
          {layout.charAt(0).toUpperCase() + layout.slice(1)}
        </button>
      ))}
    </div>
  );

  return (
    <div className={`desktop-deep-dive h-screen flex ${className}`}>
      {/* Sidebar - Advanced Controls */}
      <AnimatePresence>
        {sidebarExpanded && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 280 }}
            exit={{ width: 0 }}
            className="bg-black/20 border-r border-white/10 flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-light text-white">Deep Dive</h2>
                <button
                  onClick={() => setSidebarExpanded(false)}
                  className="p-1 text-amber-400/60 hover:text-amber-300"
                >
                  <Split className="w-4 h-4" />
                </button>
              </div>

              <LayoutSwitcher />
            </div>

            {/* Desktop Features */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
              <div>
                <h3 className="text-sm font-medium text-amber-300 mb-3">Desktop Features</h3>
                <div className="space-y-2">
                  {desktopFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-3 rounded-lg border transition-all ${
                        feature.active
                          ? 'border-amber-500/30 bg-amber-500/10'
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <feature.icon className={`w-4 h-4 ${
                          feature.active ? 'text-amber-400' : 'text-white/40'
                        }`} />
                        <span className={`text-sm font-medium ${
                          feature.active ? 'text-white' : 'text-white/60'
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                      <p className={`text-xs ${
                        feature.active ? 'text-white/70' : 'text-white/40'
                      }`}>
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-amber-300 mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-white/70 transition-colors">
                    Export Session Data
                  </button>
                  <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-white/70 transition-colors">
                    Save Current Layout
                  </button>
                  <button className="w-full p-2 bg-white/5 hover:bg-white/10 rounded-lg text-left text-sm text-white/70 transition-colors">
                    Connect Research Sources
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!sidebarExpanded && (
              <button
                onClick={() => setSidebarExpanded(true)}
                className="p-2 text-amber-400/60 hover:text-amber-300"
              >
                <Split className="w-4 h-4" />
              </button>
            )}

            <h1 className="text-xl font-light text-white">
              MAIA Desktop • {activeLayout.charAt(0).toUpperCase() + activeLayout.slice(1)} Mode
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                focusMode
                  ? 'bg-purple-500/30 text-purple-200'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              Focus Mode
            </button>

            <button className="p-2 text-amber-400/60 hover:text-amber-300">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Panel Grid */}
        <div className="flex-1 overflow-hidden">
          {focusMode ? (
            // Single panel focus mode
            <div className="h-full p-4">
              <PanelContainer panel={panels.find(p => p.active) || panels[0]} />
            </div>
          ) : (
            // Multi-panel grid
            <div className="h-full grid grid-cols-2 grid-rows-2 gap-4 p-4">
              {panels.filter(p => p.active).map((panel) => (
                <div
                  key={panel.id}
                  className={`${
                    panel.size === 'full'
                      ? 'col-span-2 row-span-2'
                      : panel.size === 'half' && panel.position.x === 0
                      ? 'col-span-2'
                      : ''
                  }`}
                >
                  <PanelContainer panel={panel} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Panel Container Component
function PanelContainer({ panel }: { panel: DeepDivePanel }) {
  const PanelComponent = panel.component;

  return (
    <motion.div
      layoutId={panel.id}
      className="h-full bg-white/5 rounded-xl border border-white/10 overflow-hidden"
    >
      <div className="h-full flex flex-col">
        {/* Panel Header */}
        <div className="flex-shrink-0 p-3 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-medium text-white text-sm">{panel.title}</h3>
          <div className="flex gap-1">
            <button className="p-1 text-white/40 hover:text-white/60">
              <Maximize className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 overflow-hidden">
          <PanelComponent />
        </div>
      </div>
    </motion.div>
  );
}

// Panel Components (placeholder implementations)
function ConversationPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Enhanced conversation interface with desktop features
    </div>
  );
}

function ConsciousnessMapPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Visual consciousness state mapping
    </div>
  );
}

function WisdomPatternsPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Pattern recognition and wisdom synthesis
    </div>
  );
}

function SessionNotesPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Collaborative session notes and insights
    </div>
  );
}

function ResearchConversationPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Research-focused conversation with citations
    </div>
  );
}

function KnowledgeGraphPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Interactive knowledge graph visualization
    </div>
  );
}

function SourcesPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Academic sources and citation management
    </div>
  );
}

function SynthesisNotesPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Research synthesis and note compilation
    </div>
  );
}

function MetricsDashboardPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Comprehensive consciousness metrics dashboard
    </div>
  );
}

function PatternRecognitionPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      AI-powered pattern recognition analysis
    </div>
  );
}

function EvolutionTimelinePanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Consciousness evolution timeline visualization
    </div>
  );
}

function InsightSynthesisPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Automated insight synthesis and integration
    </div>
  );
}

function WisdomWeavingPanel() {
  return (
    <div className="h-full p-4 flex items-center justify-center text-white/60">
      Full-screen wisdom weaving and integration interface
    </div>
  );
}