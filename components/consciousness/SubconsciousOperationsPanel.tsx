'use client';

import React, { useState, useEffect, useRef } from 'react';

/**
 * SUBCONSCIOUS OPERATIONS PANEL (Lower Domain)
 * Jung's Shadow, Personal & Collective Unconscious, Autonomous Complexes
 * McGilchrist's embodied/implicit knowing, Herrmann's limbic processing
 *
 * Split into:
 * - Right (Master): Collective unconscious, archetypes, somatic wisdom, implicit knowing
 * - Left (Emissary): Personal unconscious, repressed content, automatic patterns, conditioned responses
 */

interface SubconsciousMetrics {
  // Jungian Shadow Domain (Personal Unconscious - Left)
  shadow: {
    repression_density: number; // How much is being pushed down
    projection_activity: number; // Shadow material being projected
    integration_progress: number; // Shadow work completion
    complex_activation: number[]; // Active autonomous complexes
    defense_mechanisms: {
      denial: number;
      rationalization: number;
      displacement: number;
      sublimation: number;
    };
  };

  // Collective Unconscious (Right - Master Domain)
  collective: {
    archetypal_resonance: {
      self: number;
      shadow: number;
      anima_animus: number;
      wise_old: number;
      great_mother: number;
      hero: number;
      trickster: number;
    };
    mythic_activation: number; // Connection to universal patterns
    synchronicity_field: number; // Meaningful coincidence detection
    numinous_presence: number; // Sacred/transpersonal contact
  };

  // Somatic/Embodied Intelligence (Right - Herrmann C Quadrant)
  somatic: {
    gut_wisdom: number; // Enteric nervous system intelligence
    heart_coherence: number; // Heart-brain coherence
    body_memories: number; // Stored somatic experiences
    felt_sense: number; // Gendlin's felt sense activation
    embodied_knowing: number; // Non-verbal wisdom
    trauma_activation: number; // Triggered body memories
  };

  // Automatic Processing (Left - Herrmann B Quadrant)
  automatic: {
    habit_strength: number; // Conditioned pattern intensity
    procedural_memory: number; // Learned automatic behaviors
    implicit_bias: number; // Unconscious preferences
    emotional_conditioning: number; // Limbic imprints
    safety_protocols: number; // Survival mechanisms active
  };

  // Integration Metrics
  integration: {
    shadow_work_depth: number; // Jung's individuation progress
    unconscious_conscious_bridge: number; // Vertical integration
    somatic_cognitive_coherence: number; // Body-mind unity
    implicit_explicit_alignment: number; // Hidden vs known alignment
  };
}

interface DreamSymbol {
  symbol: string;
  archetype: string;
  intensity: number;
  position: { x: number; y: number };
}

const SubconsciousOperationsPanel: React.FC<{
  viewMode: 'shadow' | 'collective' | 'integrated';
  userId?: string;
}> = ({ viewMode = 'integrated', userId }) => {

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [metrics, setMetrics] = useState<SubconsciousMetrics>({
    shadow: {
      repression_density: 0.42,
      projection_activity: 0.38,
      integration_progress: 0.61,
      complex_activation: [0.3, 0.7, 0.2, 0.5, 0.1], // Multiple complexes
      defense_mechanisms: {
        denial: 0.25,
        rationalization: 0.45,
        displacement: 0.32,
        sublimation: 0.68
      }
    },
    collective: {
      archetypal_resonance: {
        self: 0.72,
        shadow: 0.45,
        anima_animus: 0.58,
        wise_old: 0.81,
        great_mother: 0.64,
        hero: 0.39,
        trickster: 0.27
      },
      mythic_activation: 0.55,
      synchronicity_field: 0.43,
      numinous_presence: 0.38
    },
    somatic: {
      gut_wisdom: 0.76,
      heart_coherence: 0.68,
      body_memories: 0.45,
      felt_sense: 0.71,
      embodied_knowing: 0.83,
      trauma_activation: 0.22
    },
    automatic: {
      habit_strength: 0.65,
      procedural_memory: 0.88,
      implicit_bias: 0.34,
      emotional_conditioning: 0.52,
      safety_protocols: 0.71
    },
    integration: {
      shadow_work_depth: 0.54,
      unconscious_conscious_bridge: 0.48,
      somatic_cognitive_coherence: 0.67,
      implicit_explicit_alignment: 0.59
    }
  });

  const [dreamSymbols, setDreamSymbols] = useState<DreamSymbol[]>([
    { symbol: '🌙', archetype: 'anima', intensity: 0.7, position: { x: 0.2, y: 0.3 } },
    { symbol: '🐍', archetype: 'shadow', intensity: 0.5, position: { x: 0.7, y: 0.6 } },
    { symbol: '👁️', archetype: 'self', intensity: 0.8, position: { x: 0.5, y: 0.5 } },
    { symbol: '🌳', archetype: 'wise_old', intensity: 0.6, position: { x: 0.3, y: 0.7 } },
    { symbol: '💫', archetype: 'trickster', intensity: 0.4, position: { x: 0.8, y: 0.2 } }
  ]);

  const [underworldLayers] = useState([
    { depth: 0.1, label: 'Preconscious', color: 'rgba(147, 51, 234, 0.2)' },
    { depth: 0.3, label: 'Personal Shadow', color: 'rgba(239, 68, 68, 0.3)' },
    { depth: 0.5, label: 'Cultural Shadow', color: 'rgba(251, 146, 60, 0.3)' },
    { depth: 0.7, label: 'Collective Patterns', color: 'rgba(59, 130, 246, 0.3)' },
    { depth: 0.9, label: 'Primordial Images', color: 'rgba(16, 185, 129, 0.3)' }
  ]);

  // Animate the unconscious depths
  useEffect(() => {
    const interval = setInterval(() => {
      // Oscillate metrics
      setMetrics(prev => ({
        ...prev,
        shadow: {
          ...prev.shadow,
          projection_activity: oscillate(prev.shadow.projection_activity, 0.03),
          complex_activation: prev.shadow.complex_activation.map(c =>
            oscillate(c, 0.05)
          )
        },
        collective: {
          ...prev.collective,
          synchronicity_field: oscillate(prev.collective.synchronicity_field, 0.04),
          numinous_presence: oscillate(prev.collective.numinous_presence, 0.02)
        },
        somatic: {
          ...prev.somatic,
          felt_sense: oscillate(prev.somatic.felt_sense, 0.02),
          heart_coherence: oscillate(prev.somatic.heart_coherence, 0.01)
        }
      }));

      // Move dream symbols
      setDreamSymbols(prev => prev.map(symbol => ({
        ...symbol,
        position: {
          x: symbol.position.x + (Math.random() - 0.5) * 0.01,
          y: symbol.position.y + (Math.random() - 0.5) * 0.01
        },
        intensity: oscillate(symbol.intensity, 0.05)
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Draw the unconscious depths visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear with deep background
    ctx.fillStyle = 'rgb(5, 5, 15)';
    ctx.fillRect(0, 0, width, height);

    // Draw depth layers
    underworldLayers.forEach(layer => {
      ctx.fillStyle = layer.color;
      ctx.fillRect(0, height * layer.depth, width, height * 0.2);
    });

    // Draw archetypal symbols floating in the depths
    dreamSymbols.forEach(symbol => {
      const x = symbol.position.x * width;
      const y = symbol.position.y * height;

      // Symbol glow
      const glowRadius = 20 * symbol.intensity;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
      gradient.addColorStop(0, `rgba(147, 51, 234, ${symbol.intensity * 0.5})`);
      gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(x - glowRadius, y - glowRadius, glowRadius * 2, glowRadius * 2);

      // Draw connecting lines between related symbols
      dreamSymbols.forEach(other => {
        if (other !== symbol) {
          const distance = Math.sqrt(
            Math.pow(symbol.position.x - other.position.x, 2) +
            Math.pow(symbol.position.y - other.position.y, 2)
          );
          if (distance < 0.3) {
            ctx.strokeStyle = `rgba(147, 51, 234, ${0.2 * (1 - distance / 0.3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(other.position.x * width, other.position.y * height);
            ctx.stroke();
          }
        }
      });
    });

    // Draw shadow projections (if in shadow view)
    if (viewMode === 'shadow' || viewMode === 'integrated') {
      const projectionIntensity = metrics.shadow.projection_activity;
      ctx.fillStyle = `rgba(239, 68, 68, ${projectionIntensity * 0.3})`;

      // Shadow tendrils reaching upward
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(width * (i + 1) / 6, height);
        ctx.quadraticCurveTo(
          width * (i + 1) / 6 + Math.sin(Date.now() / 1000 + i) * 20,
          height * 0.5,
          width * (i + 1) / 6 + Math.sin(Date.now() / 500 + i) * 40,
          height * (1 - projectionIntensity)
        );
        ctx.strokeStyle = `rgba(239, 68, 68, ${projectionIntensity * 0.4})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }

  }, [dreamSymbols, metrics, viewMode, underworldLayers]);

  const oscillate = (value: number, amplitude: number): number => {
    return Math.max(0, Math.min(1, value + (Math.random() - 0.5) * amplitude));
  };

  const getShadowView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-red-300">Shadow & Personal Unconscious (Left)</h3>

      {/* Defense Mechanisms */}
      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Defense Mechanisms</h4>
        <div className="space-y-2">
          <MetricBar label="Denial" value={metrics.shadow.defense_mechanisms.denial} color="red" />
          <MetricBar label="Rationalization" value={metrics.shadow.defense_mechanisms.rationalization} color="orange" />
          <MetricBar label="Displacement" value={metrics.shadow.defense_mechanisms.displacement} color="yellow" />
          <MetricBar label="Sublimation" value={metrics.shadow.defense_mechanisms.sublimation} color="green" />
        </div>
      </div>

      {/* Shadow Dynamics */}
      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Shadow Dynamics</h4>
        <div className="space-y-2">
          <MetricBar label="Repression Density" value={metrics.shadow.repression_density} color="red" icon="🔒" />
          <MetricBar label="Projection Activity" value={metrics.shadow.projection_activity} color="orange" icon="📽️" />
          <MetricBar label="Integration Progress" value={metrics.shadow.integration_progress} color="purple" icon="🔄" />
        </div>
      </div>

      {/* Active Complexes */}
      <div className="bg-slate-800/30 p-3 rounded">
        <div className="text-sm font-medium text-gray-400 mb-2">Autonomous Complexes</div>
        <div className="flex gap-2">
          {metrics.shadow.complex_activation.map((activation, i) => (
            <div key={i} className="flex-1">
              <div
                className="h-16 bg-gradient-to-t from-red-600 to-transparent rounded"
                style={{ opacity: activation }}
              />
              <div className="text-xs text-center mt-1 text-gray-500">C{i + 1}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const getCollectiveView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-amber-300">Collective Unconscious (Right)</h3>

      {/* Archetypal Resonances */}
      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Archetypal Activation</h4>
        <div className="grid grid-cols-2 gap-3">
          <ArchetypeCard name="Self" symbol="☉" value={metrics.collective.archetypal_resonance.self} />
          <ArchetypeCard name="Shadow" symbol="◐" value={metrics.collective.archetypal_resonance.shadow} />
          <ArchetypeCard name="Anima/us" symbol="☯" value={metrics.collective.archetypal_resonance.anima_animus} />
          <ArchetypeCard name="Wise Old" symbol="🧙" value={metrics.collective.archetypal_resonance.wise_old} />
          <ArchetypeCard name="Great Mother" symbol="🌍" value={metrics.collective.archetypal_resonance.great_mother} />
          <ArchetypeCard name="Hero" symbol="⚔️" value={metrics.collective.archetypal_resonance.hero} />
        </div>
      </div>

      {/* Somatic Intelligence */}
      <div className="bg-slate-800/50 backdrop-blur p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-400 mb-3">Embodied Wisdom</h4>
        <div className="space-y-2">
          <MetricBar label="Gut Wisdom" value={metrics.somatic.gut_wisdom} color="amber" icon="🧘" />
          <MetricBar label="Heart Coherence" value={metrics.somatic.heart_coherence} color="pink" icon="💗" />
          <MetricBar label="Felt Sense" value={metrics.somatic.felt_sense} color="green" />
          <MetricBar label="Embodied Knowing" value={metrics.somatic.embodied_knowing} color="teal" />
        </div>
      </div>

      {/* Transpersonal Fields */}
      <div className="bg-slate-800/30 p-3 rounded">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Synchronicity Field</span>
            <span className="text-amber-400">{(metrics.collective.synchronicity_field * 100).toFixed(0)}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Numinous Presence</span>
            <span className="text-amber-400">{(metrics.collective.numinous_presence * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  const getIntegratedView = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-amber-300">
        Integrated Unconscious Operations
      </h3>

      {/* Herrmann Quadrants Mapped */}
      <div className="grid grid-cols-2 gap-4">
        {/* Left Lower - Sequential/Procedural */}
        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900/30 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-blue-400 mb-2">Procedural (Herrmann B)</h4>
          <div className="space-y-1">
            <MiniMetric label="Habits" value={metrics.automatic.habit_strength} />
            <MiniMetric label="Conditioning" value={metrics.automatic.emotional_conditioning} />
            <MiniMetric label="Safety" value={metrics.automatic.safety_protocols} />
          </div>
        </div>

        {/* Right Lower - Interpersonal/Feeling */}
        <div className="bg-gradient-to-bl from-red-900/30 to-slate-900/30 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-red-400 mb-2">Feeling (Herrmann C)</h4>
          <div className="space-y-1">
            <MiniMetric label="Gut" value={metrics.somatic.gut_wisdom} />
            <MiniMetric label="Heart" value={metrics.somatic.heart_coherence} />
            <MiniMetric label="Body" value={metrics.somatic.embodied_knowing} />
          </div>
        </div>
      </div>

      {/* Jung's Individuation Progress */}
      <div className="bg-gradient-to-r from-amber-900/30 to-indigo-900/30 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-300 mb-3">Individuation Journey</h4>
        <div className="space-y-2">
          <IndividuationStage
            stage="Shadow Recognition"
            progress={metrics.shadow.integration_progress}
            active={metrics.shadow.projection_activity < 0.5}
          />
          <IndividuationStage
            stage="Anima/Animus Integration"
            progress={metrics.collective.archetypal_resonance.anima_animus}
            active={metrics.collective.archetypal_resonance.anima_animus > 0.5}
          />
          <IndividuationStage
            stage="Self Realization"
            progress={metrics.collective.archetypal_resonance.self}
            active={metrics.collective.archetypal_resonance.self > 0.7}
          />
        </div>
      </div>

      {/* Integration Metrics */}
      <div className="bg-slate-800/30 p-3 rounded">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Unconscious-Conscious Bridge</span>
            <div className="text-lg font-medium text-amber-400">
              {(metrics.integration.unconscious_conscious_bridge * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <span className="text-gray-500">Body-Mind Coherence</span>
            <div className="text-lg font-medium text-green-400">
              {(metrics.integration.somatic_cognitive_coherence * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-950 text-white p-6 rounded-b-lg border-t-2 border-red-900/30">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold bg-gradient-to-r from-red-400 to-amber-400 bg-clip-text text-transparent">
          Subconscious Operations
        </h2>
        <div className="text-xs text-gray-400">
          Unconscious Domain
        </div>
      </div>

      {/* Depth Visualization */}
      <div className="mb-6 relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={150}
          className="w-full rounded-lg"
        />
        <div className="absolute top-2 left-2 text-xs text-gray-300/70">
          Depth Layers
        </div>
        {/* Floating Symbols */}
        {dreamSymbols.map((symbol, i) => (
          <div
            key={i}
            className="absolute text-2xl transition-all duration-1000"
            style={{
              left: `${symbol.position.x * 100}%`,
              top: `${symbol.position.y * 100}%`,
              opacity: symbol.intensity,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {symbol.symbol}
          </div>
        ))}
      </div>

      {/* Content based on view mode */}
      {viewMode === 'shadow' && getShadowView()}
      {viewMode === 'collective' && getCollectiveView()}
      {viewMode === 'integrated' && getIntegratedView()}
    </div>
  );
};

// Helper Components
const MetricBar: React.FC<{
  label: string;
  value: number;
  color: string;
  icon?: string;
}> = ({ label, value, color, icon }) => (
  <div>
    <div className="flex justify-between text-sm mb-1">
      <span className="text-gray-400">{icon} {label}</span>
      <span className="text-gray-300">{(value * 100).toFixed(0)}%</span>
    </div>
    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
      <div
        className={`h-full bg-${color}-500 transition-all duration-500`}
        style={{ width: `${value * 100}%` }}
      />
    </div>
  </div>
);

const MiniMetric: React.FC<{
  label: string;
  value: number;
}> = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-xs text-gray-500">{label}</span>
    <div className="flex items-center gap-1">
      <div className="w-12 h-1 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-amber-500"
          style={{ width: `${value * 100}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{(value * 100).toFixed(0)}</span>
    </div>
  </div>
);

const ArchetypeCard: React.FC<{
  name: string;
  symbol: string;
  value: number;
}> = ({ name, symbol, value }) => (
  <div className="bg-slate-900/50 p-2 rounded flex items-center gap-2">
    <div className="text-2xl">{symbol}</div>
    <div className="flex-1">
      <div className="text-xs text-gray-400">{name}</div>
      <div className="h-1 bg-gray-700 rounded-full mt-1">
        <div
          className="h-full bg-amber-500 rounded-full"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
    <div className="text-xs text-gray-500">{(value * 100).toFixed(0)}</div>
  </div>
);

const IndividuationStage: React.FC<{
  stage: string;
  progress: number;
  active: boolean;
}> = ({ stage, progress, active }) => (
  <div className={`flex items-center gap-3 ${active ? '' : 'opacity-50'}`}>
    <div className={`w-2 h-2 rounded-full ${active ? 'bg-amber-400' : 'bg-gray-600'}`} />
    <div className="flex-1">
      <div className="text-xs text-gray-400">{stage}</div>
      <div className="h-1 bg-gray-700 rounded-full mt-1">
        <div
          className={`h-full rounded-full ${active ? 'bg-amber-500' : 'bg-gray-600'}`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  </div>
);

export default SubconsciousOperationsPanel;