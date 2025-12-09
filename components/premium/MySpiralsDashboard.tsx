/**
 * 🌀 MY SPIRALS DASHBOARD
 *
 * The main interface for users to see and navigate their constellation
 * consciousness architecture - multiple living spirals across life domains,
 * each in its own phase of the 12-phase Spiralogic process.
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Droplets,
  Mountain,
  Wind,
  CircleDot,
  Eye,
  Heart,
  Briefcase,
  Home,
  Palette,
  DollarSign,
  Users,
  Sparkles,
  BarChart3
} from 'lucide-react';

// Import our Spiralogic types and spiral service types from previous conversation
type Element = "Fire" | "Water" | "Earth" | "Air" | "Aether";
type Phase = 1 | 2 | 3;
type SpiralogicPhase =
  | 'fire-emergence' | 'fire-deepening' | 'fire-mastery'
  | 'water-emergence' | 'water-deepening' | 'water-mastery'
  | 'earth-emergence' | 'earth-deepening' | 'earth-mastery'
  | 'air-emergence' | 'air-deepening' | 'air-mastery';

type LifeDomain =
  | 'relationship' | 'vocation' | 'health' | 'creativity'
  | 'spirituality' | 'family' | 'community' | 'money';

interface SpiralProcess {
  id: string;
  userId: string;
  domain: LifeDomain;
  currentElement: Element;
  currentPhase: Phase;
  spiralogicPhase: SpiralogicPhase;
  activated: boolean;
  startedAt: string;
  lastActivity: string;

  // Contextual state
  domainContext: string;
  currentChallenge: string;
  emergingWisdom: string;

  // Phase progression
  phaseProgress: number; // 0-100
  daysInCurrentPhase: number;
  completedPhases: SpiralogicPhase[];

  // Elemental balance within this spiral
  elementalFocus: {
    fire: number;    // 0-100 current activation
    water: number;
    earth: number;
    air: number;
  };

  // Harmonic development
  harmonicCoherence: number; // 0-100 how integrated this spiral is
  retuningTo: string; // Current natural wisdom being reclaimed
}

interface MySpiralsDashboardProps {
  userId: string;
  onSpiralSelect: (spiral: SpiralProcess) => void;
  onCreateSpiral: (domain: LifeDomain) => void;
}

// Domain configuration with icons and colors
const DOMAIN_CONFIG = {
  relationship: {
    icon: Heart,
    color: 'rose',
    label: 'Relationship',
    description: 'Intimacy, partnership, connection'
  },
  vocation: {
    icon: Briefcase,
    color: 'amber',
    label: 'Vocation',
    description: 'Career, calling, work'
  },
  health: {
    icon: CircleDot,
    color: 'emerald',
    label: 'Health',
    description: 'Body wisdom, vitality, healing'
  },
  creativity: {
    icon: Palette,
    color: 'purple',
    label: 'Creativity',
    description: 'Art, expression, innovation'
  },
  spirituality: {
    icon: Sparkles,
    color: 'indigo',
    label: 'Spirituality',
    description: 'Sacred, transcendent, meaning'
  },
  family: {
    icon: Home,
    color: 'blue',
    label: 'Family',
    description: 'Lineage, parenting, roots'
  },
  community: {
    icon: Users,
    color: 'teal',
    label: 'Community',
    description: 'Service, belonging, contribution'
  },
  money: {
    icon: DollarSign,
    color: 'green',
    label: 'Money',
    description: 'Resources, abundance, flow'
  }
};

// Element configuration
const ELEMENT_CONFIG = {
  Fire: {
    icon: Flame,
    color: 'red',
    phases: ['Spark', 'Flame', 'Forge']
  },
  Water: {
    icon: Droplets,
    color: 'blue',
    phases: ['Spring', 'River', 'Ocean']
  },
  Earth: {
    icon: Mountain,
    color: 'green',
    phases: ['Seed', 'Root', 'Harvest']
  },
  Air: {
    icon: Wind,
    color: 'gray',
    phases: ['Breath', 'Voice', 'Wisdom']
  },
  Aether: {
    icon: Eye,
    color: 'violet',
    phases: ['Integration', 'Synthesis', 'Transcendence']
  }
};

export function MySpiralsDashboard({ userId, onSpiralSelect, onCreateSpiral }: MySpiralsDashboardProps) {
  const [activeSpirals, setActiveSpirals] = useState<SpiralProcess[]>([]);
  const [selectedSpiral, setSelectedSpiral] = useState<SpiralProcess | null>(null);
  const [viewMode, setViewMode] = useState<'constellation' | 'phases' | 'harmony'>('constellation');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActiveSpirals();
  }, [userId]);

  const loadActiveSpirals = async () => {
    try {
      // This would call our SpiralService
      const response = await fetch(`/api/consciousness/spirals?userId=${userId}`);
      const data = await response.json();
      setActiveSpirals(data.spirals || []);
    } catch (error) {
      console.error('Failed to load spirals:', error);
      // For now, let's show mock data to demonstrate the UI
      setActiveSpirals(getMockSpirals());
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const getMockSpirals = (): SpiralProcess[] => [
    {
      id: 'spiral_relationship_001',
      userId,
      domain: 'relationship',
      currentElement: 'Water',
      currentPhase: 2,
      spiralogicPhase: 'water-deepening',
      activated: true,
      startedAt: '2024-11-15T10:00:00Z',
      lastActivity: '2024-12-07T14:30:00Z',
      domainContext: 'Deepening emotional intimacy',
      currentChallenge: 'Learning to trust intuitive knowing in relationship',
      emergingWisdom: 'Rivers find the path of least resistance',
      phaseProgress: 65,
      daysInCurrentPhase: 18,
      completedPhases: ['fire-emergence', 'fire-deepening', 'water-emergence'],
      elementalFocus: { fire: 40, water: 85, earth: 30, air: 25 },
      harmonicCoherence: 55,
      retuningTo: 'The body as the instrument of knowing'
    },
    {
      id: 'spiral_vocation_002',
      userId,
      domain: 'vocation',
      currentElement: 'Fire',
      currentPhase: 3,
      spiralogicPhase: 'fire-mastery',
      activated: true,
      startedAt: '2024-10-01T09:00:00Z',
      lastActivity: '2024-12-08T11:20:00Z',
      domainContext: 'Stepping into visionary leadership role',
      currentChallenge: 'Balancing creative destruction with wisdom',
      emergingWisdom: 'Volcanoes create new land through destruction',
      phaseProgress: 80,
      daysInCurrentPhase: 25,
      completedPhases: ['fire-emergence', 'fire-deepening'],
      elementalFocus: { fire: 90, water: 45, earth: 60, air: 70 },
      harmonicCoherence: 66,
      retuningTo: 'The knowing that all creation requires letting go'
    },
    {
      id: 'spiral_health_003',
      userId,
      domain: 'health',
      currentElement: 'Earth',
      currentPhase: 1,
      spiralogicPhase: 'earth-emergence',
      activated: true,
      startedAt: '2024-12-01T08:00:00Z',
      lastActivity: '2024-12-08T16:45:00Z',
      domainContext: 'Rebuilding relationship with body',
      currentChallenge: 'Grounding healing vision in daily practice',
      emergingWisdom: 'Seeds need darkness to germinate',
      phaseProgress: 25,
      daysInCurrentPhase: 7,
      completedPhases: ['fire-emergence', 'water-emergence', 'water-deepening'],
      elementalFocus: { fire: 30, water: 70, earth: 60, air: 20 },
      harmonicCoherence: 45,
      retuningTo: 'The necessity of gestation periods'
    }
  ];

  const calculateOverallHarmony = () => {
    if (activeSpirals.length === 0) return 0;
    const total = activeSpirals.reduce((sum, spiral) => sum + spiral.harmonicCoherence, 0);
    return Math.round(total / activeSpirals.length);
  };

  const getElementIcon = (element: Element) => {
    const ElementIcon = ELEMENT_CONFIG[element].icon;
    return ElementIcon;
  };

  const getDomainIcon = (domain: LifeDomain) => {
    const DomainIcon = DOMAIN_CONFIG[domain].icon;
    return DomainIcon;
  };

  const renderConstellationView = () => (
    <div className="space-y-6">
      {/* Constellation Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Your Spiral Constellation</h3>
            <p className="text-gray-600 mt-1">
              {activeSpirals.length} active spirals • {calculateOverallHarmony()}% harmonic coherence
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-600">Constellation View</span>
          </div>
        </div>
      </div>

      {/* Active Spirals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeSpirals.map((spiral) => (
          <SpiralCard
            key={spiral.id}
            spiral={spiral}
            onClick={() => {
              setSelectedSpiral(spiral);
              onSpiralSelect(spiral);
            }}
          />
        ))}
      </div>

      {/* New Spiral Creation */}
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-gray-300 transition-colors cursor-pointer"
           onClick={() => setViewMode('phases')}>
        <div className="flex flex-col items-center space-y-3">
          <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-gray-400" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Activate New Spiral</h4>
            <p className="text-sm text-gray-500">Begin transformation in a new life domain</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPhasesView = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">12-Phase Spiralogic Process</h3>

      {/* Elemental Phases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(ELEMENT_CONFIG).slice(0, 4).map(([element, config]) => (
          <ElementPhasesCard
            key={element}
            element={element as Element}
            config={config}
            activeSpirals={activeSpirals}
          />
        ))}
      </div>
    </div>
  );

  const renderHarmonyView = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Harmonic Development</h3>

      {/* Overall Harmony Meter */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Overall Harmonic Coherence</h4>
          <span className="text-2xl font-bold text-indigo-600">{calculateOverallHarmony()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${calculateOverallHarmony()}%` }}
          />
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Integration of will, intuition, sensibility, and thought across all active spirals
        </p>
      </div>

      {/* Elemental Balance */}
      <ElementalBalanceChart spirals={activeSpirals} />
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Spirals</h1>
          <p className="text-gray-600 mt-2">
            Your constellation consciousness architecture across life domains
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'constellation', label: 'Constellation', icon: Eye },
            { key: 'phases', label: 'Phases', icon: BarChart3 },
            { key: 'harmony', label: 'Harmony', icon: CircleDot }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setViewMode(key as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {viewMode === 'constellation' && renderConstellationView()}
      {viewMode === 'phases' && renderPhasesView()}
      {viewMode === 'harmony' && renderHarmonyView()}
    </div>
  );
}

// Individual Spiral Card Component
interface SpiralCardProps {
  spiral: SpiralProcess;
  onClick: () => void;
}

function SpiralCard({ spiral, onClick }: SpiralCardProps) {
  const domainConfig = DOMAIN_CONFIG[spiral.domain];
  const elementConfig = ELEMENT_CONFIG[spiral.currentElement];
  const DomainIcon = domainConfig.icon;
  const ElementIcon = elementConfig.icon;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`h-10 w-10 bg-${domainConfig.color}-100 rounded-lg flex items-center justify-center`}>
            <DomainIcon className={`h-6 w-6 text-${domainConfig.color}-600`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{domainConfig.label}</h4>
            <p className="text-sm text-gray-500">{spiral.domainContext}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <ElementIcon className={`h-5 w-5 text-${elementConfig.color}-600`} />
          <span className="text-sm font-medium text-gray-600">
            {elementConfig.phases[spiral.currentPhase - 1]}
          </span>
        </div>
      </div>

      {/* Current State */}
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Phase Progress</span>
            <span className="text-gray-900 font-medium">{spiral.phaseProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`bg-${elementConfig.color}-600 h-2 rounded-full transition-all duration-300`}
              style={{ width: `${spiral.phaseProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700 font-medium mb-1">Current Wisdom</p>
          <p className="text-xs text-gray-600 italic">"{spiral.emergingWisdom}"</p>
        </div>

        {/* Harmonic Coherence */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Harmonic Coherence</span>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {Object.entries(spiral.elementalFocus).map(([element, value]) => {
                const config = ELEMENT_CONFIG[element as Element];
                const Icon = config.icon;
                return (
                  <Icon
                    key={element}
                    className={`h-3 w-3 text-${config.color}-600 opacity-${Math.round(value / 20)}`}
                  />
                );
              })}
            </div>
            <span className="text-sm font-medium text-gray-900">{spiral.harmonicCoherence}%</span>
          </div>
        </div>
      </div>

      {/* Days in Phase */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Day {spiral.daysInCurrentPhase} in {spiral.spiralogicPhase}</span>
          <span>{spiral.completedPhases.length} phases completed</span>
        </div>
      </div>
    </div>
  );
}

// Element Phases Card for Phases View
interface ElementPhasesCardProps {
  element: Element;
  config: any;
  activeSpirals: SpiralProcess[];
}

function ElementPhasesCard({ element, config, activeSpirals }: ElementPhasesCardProps) {
  const ElementIcon = config.icon;
  const spiralsInElement = activeSpirals.filter(s => s.currentElement === element);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <ElementIcon className={`h-8 w-8 text-${config.color}-600`} />
        <div>
          <h4 className="font-semibold text-gray-900">{element}</h4>
          <p className="text-sm text-gray-500">{spiralsInElement.length} active spirals</p>
        </div>
      </div>

      <div className="space-y-3">
        {config.phases.map((phaseName: string, index: number) => {
          const phaseNumber = index + 1;
          const spiralsInPhase = spiralsInElement.filter(s => s.currentPhase === phaseNumber);

          return (
            <div key={phaseNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">{phaseName}</span>
                <div className="text-xs text-gray-500">Phase {phaseNumber}</div>
              </div>
              {spiralsInPhase.length > 0 && (
                <div className="flex space-x-1">
                  {spiralsInPhase.map(spiral => {
                    const DomainIcon = DOMAIN_CONFIG[spiral.domain].icon;
                    return (
                      <DomainIcon
                        key={spiral.id}
                        className={`h-4 w-4 text-${DOMAIN_CONFIG[spiral.domain].color}-600`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Elemental Balance Chart for Harmony View
interface ElementalBalanceChartProps {
  spirals: SpiralProcess[];
}

function ElementalBalanceChart({ spirals }: ElementalBalanceChartProps) {
  const elementalAverages = {
    fire: spirals.length ? Math.round(spirals.reduce((sum, s) => sum + s.elementalFocus.fire, 0) / spirals.length) : 0,
    water: spirals.length ? Math.round(spirals.reduce((sum, s) => sum + s.elementalFocus.water, 0) / spirals.length) : 0,
    earth: spirals.length ? Math.round(spirals.reduce((sum, s) => sum + s.elementalFocus.earth, 0) / spirals.length) : 0,
    air: spirals.length ? Math.round(spirals.reduce((sum, s) => sum + s.elementalFocus.air, 0) / spirals.length) : 0
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h4 className="font-medium text-gray-900 mb-4">Elemental Balance Across All Spirals</h4>

      <div className="space-y-4">
        {Object.entries(elementalAverages).map(([element, average]) => {
          const config = ELEMENT_CONFIG[element as Element];
          const Icon = config.icon;

          return (
            <div key={element} className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 w-24">
                <Icon className={`h-5 w-5 text-${config.color}-600`} />
                <span className="text-sm font-medium text-gray-700 capitalize">{element}</span>
              </div>
              <div className="flex-1">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`bg-${config.color}-600 h-3 rounded-full transition-all duration-300`}
                    style={{ width: `${average}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-12">{average}%</span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          Ideally, all elements work in harmony. Notice which elements might need more attention
          or which ones are overdeveloped across your spiritual constellation.
        </p>
      </div>
    </div>
  );
}

export default MySpiralsDashboard;