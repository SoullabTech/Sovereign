/**
 * Disposable Pixel Matrix Demo: The "Holy Sh*t" Demo Moment
 *
 * Shows the same lead_crisis engine state expressed through:
 * 3 Portals × 3 Complexity Tiers = 9 Completely Different Experiences
 *
 * This demonstrates the revolutionary scalability of the portal architecture:
 * - Same universal consciousness engine
 * - Same semantic state (lead_crisis)
 * - 9 different cultural/developmental expressions through disposable pixels
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import {
  LeadCrisisEngineState,
  ComplexityTier,
  getLeadCrisisPixelConfig
} from '../LeadCrisisPixels';
import { PopulationPortal } from '../PortalArchitecture';
import { LeadCrisisPortalView } from './LeadCrisisPortalView';

// Sample engine state - same for all 9 expressions
const SAMPLE_ENGINE_STATE: LeadCrisisEngineState = {
  state: 'lead_crisis',
  safetyLevel: 'elevated',
  recommendedMode: 'guided',
  mercuryAspect: 'hermes-healer',
  spiralogicPhase: 'F1 → W1 transition',
  crisisScore: 0.75,
  protectiveFactors: ['social_support', 'self_awareness', 'previous_success'],
  urgentFlags: ['identity_dissolution', 'meaning_loss']
};

const DEMO_PORTALS: PopulationPortal[] = ['shamanic', 'therapeutic', 'corporate'];
const COMPLEXITY_TIERS: ComplexityTier[] = ['beginner', 'intermediate', 'advanced'];

interface MatrixCellProps {
  portal: PopulationPortal;
  tier: ComplexityTier;
  isHighlighted: boolean;
  onClick: () => void;
}

const MatrixCell: React.FC<MatrixCellProps> = ({ portal, tier, isHighlighted, onClick }) => {
  const { config } = getLeadCrisisPixelConfig(SAMPLE_ENGINE_STATE, portal, tier);

  if (!config) return null;

  const tierColors = {
    beginner: '#22c55e',
    intermediate: '#f59e0b',
    advanced: '#dc2626'
  };

  const tierEmojis = {
    beginner: '🌱',
    intermediate: '🔥',
    advanced: '💎'
  };

  const portalEmojis = {
    shamanic: '🌳',
    therapeutic: '🧠',
    corporate: '📊',
    religious: '✝️',
    recovery: '🔄',
    academic: '📚',
    creative: '🎨',
    parental: '👨‍👩‍👧‍👦',
    elder: '👵',
    youth: '🌱'
  };

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: isHighlighted
          ? `linear-gradient(135deg, ${config.colorTheme.primary}44, ${config.colorTheme.accent}33)`
          : `linear-gradient(135deg, ${config.colorTheme.primary}22, ${config.colorTheme.primary}11)`,
        border: isHighlighted
          ? `3px solid ${config.colorTheme.primary}`
          : `2px solid ${config.colorTheme.primary}66`,
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        textAlign: 'center',
        width: '100%',
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ fontSize: '24px' }}>
        {portalEmojis[portal]} {tierEmojis[tier]}
      </div>
      <div style={{
        fontWeight: 'bold',
        fontSize: '14px',
        color: config.colorTheme.primary
      }}>
        {config.headline}
      </div>
      <div style={{
        fontSize: '10px',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        {portal} • {tier}
      </div>
      <div style={{
        background: tierColors[tier],
        color: 'white',
        padding: '2px 6px',
        borderRadius: '10px',
        fontSize: '9px',
        fontWeight: 'bold',
        marginTop: '4px'
      }}>
        {tier}
      </div>
    </motion.button>
  );
};

const UniversalStateDisplay: React.FC<{ engineState: LeadCrisisEngineState }> = ({ engineState }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'linear-gradient(135deg, #c0c0c0 0%, #808080 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        textAlign: 'center',
        border: '2px solid rgba(192, 192, 192, 0.5)'
      }}
    >
      <h2 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
        ⚡ Universal Engine State (Same for All 9 Expressions)
      </h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px',
        fontSize: '14px'
      }}>
        <div>
          <strong>Semantic State:</strong><br />
          <code>{engineState.state}</code>
        </div>
        <div>
          <strong>Safety Level:</strong><br />
          <code>{engineState.safetyLevel}</code>
        </div>
        <div>
          <strong>Mercury Aspect:</strong><br />
          <code>{engineState.mercuryAspect}</code>
        </div>
        <div>
          <strong>Spiralogic Phase:</strong><br />
          <code>{engineState.spiralogicPhase}</code>
        </div>
        <div>
          <strong>Crisis Score:</strong><br />
          <code>{engineState.crisisScore}/1.0</code>
        </div>
        <div>
          <strong>Recommended Mode:</strong><br />
          <code>{engineState.recommendedMode}</code>
        </div>
      </div>
    </motion.div>
  );
};

export const DisposablePixelMatrixDemo: React.FC = () => {
  const [selectedPortal, setSelectedPortal] = useState<PopulationPortal>('shamanic');
  const [selectedTier, setSelectedTier] = useState<ComplexityTier>('intermediate');
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);

  // Auto-rotation through all 9 combinations
  useEffect(() => {
    if (!autoRotate) return;

    const combinations = DEMO_PORTALS.flatMap(portal =>
      COMPLEXITY_TIERS.map(tier => ({ portal, tier }))
    );

    const interval = setInterval(() => {
      const { portal, tier } = combinations[rotationIndex];
      setSelectedPortal(portal);
      setSelectedTier(tier);
      setRotationIndex((prev) => (prev + 1) % combinations.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRotate, rotationIndex]);

  const handleCellClick = (portal: PopulationPortal, tier: ComplexityTier) => {
    setSelectedPortal(portal);
    setSelectedTier(tier);
    setAutoRotate(false);
  };

  return (
    <LayoutGroup>
      <div style={{
        padding: '30px',
        maxWidth: '1400px',
        margin: '0 auto',
        fontFamily: 'system-ui, sans-serif'
      }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            🎭 Disposable Pixel Matrix Demo
          </h1>
          <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>
            <strong>Same Crisis State → 9 Different Cultural/Developmental Expressions</strong>
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              style={{
                padding: '8px 16px',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                background: autoRotate ? '#3b82f6' : 'white',
                color: autoRotate ? 'white' : '#3b82f6',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              {autoRotate ? '⏸️ Stop Auto-Rotation' : '▶️ Auto-Rotate All 9'}
            </button>
            <span style={{ fontSize: '14px', color: '#666' }}>
              Click any cell to see that specific expression
            </span>
          </div>
        </motion.div>

        {/* Universal Engine State */}
        <UniversalStateDisplay engineState={SAMPLE_ENGINE_STATE} />

        {/* Matrix Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: '40px' }}
        >
          <h3 style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
            fontSize: '20px'
          }}>
            🔄 Portal × Complexity Matrix (Click to Select)
          </h3>

          {/* Column Headers */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '120px repeat(3, 1fr)',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div></div>
            {COMPLEXITY_TIERS.map(tier => {
              const tierEmojis = { beginner: '🌱', intermediate: '🔥', advanced: '💎' };
              return (
                <div key={tier} style={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '6px'
                }}>
                  {tierEmojis[tier]} {tier}
                </div>
              );
            })}
          </div>

          {/* Matrix Rows */}
          {DEMO_PORTALS.map(portal => {
            const portalEmojis = { shamanic: '🌳', therapeutic: '🧠', corporate: '📊' };
            return (
              <div key={portal} style={{
                display: 'grid',
                gridTemplateColumns: '120px repeat(3, 1fr)',
                gap: '12px',
                marginBottom: '12px',
                alignItems: 'stretch'
              }}>
                {/* Row Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  padding: '8px',
                  background: 'rgba(0,0,0,0.05)',
                  borderRadius: '6px',
                  textAlign: 'center'
                }}>
                  {portalEmojis[portal]}<br />{portal}
                </div>

                {/* Matrix Cells */}
                {COMPLEXITY_TIERS.map(tier => (
                  <MatrixCell
                    key={`${portal}-${tier}`}
                    portal={portal}
                    tier={tier}
                    isHighlighted={portal === selectedPortal && tier === selectedTier}
                    onClick={() => handleCellClick(portal, tier)}
                  />
                ))}
              </div>
            );
          })}
        </motion.div>

        {/* Architecture Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '2px solid #22c55e',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '30px'
          }}
        >
          <h3 style={{ color: '#16a34a', margin: '0 0 15px 0' }}>
            🏗️ The Revolutionary Architecture
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            <div>
              <strong>Universal Engine (Never Changes):</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Same alchemical framework</li>
                <li>Same crisis detection</li>
                <li>Same Mercury intelligence</li>
                <li>Same safety protocols</li>
              </ul>
            </div>
            <div>
              <strong>Portal Layer (Cultural Context):</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Shamanic: Sacred initiation language</li>
                <li>Therapeutic: Clinical terminology</li>
                <li>Corporate: Leadership development</li>
              </ul>
            </div>
            <div>
              <strong>Disposable Pixels (Complexity):</strong>
              <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
                <li>Beginner: Simplified, supportive</li>
                <li>Intermediate: Standard complexity</li>
                <li>Advanced: Full technical depth</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Selected Expression Display */}
        <motion.div layout style={{ marginBottom: '30px' }}>
          <h3 style={{
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
            fontSize: '20px'
          }}>
            🎯 Current Expression: {selectedPortal} × {selectedTier}
          </h3>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${selectedPortal}-${selectedTier}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <LeadCrisisPortalView
                engineState={SAMPLE_ENGINE_STATE}
                portal={selectedPortal}
                complexityTier={selectedTier}
                onTierChange={setSelectedTier}
                onPrimaryAction={() => {
                  alert(`${selectedPortal} × ${selectedTier} action triggered!\nThis would launch the appropriate guided flow.`);
                }}
                onShowAdvanced={() => {
                  console.log(`Advanced panel opened for ${selectedPortal} × ${selectedTier}`);
                }}
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Business Impact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '2px solid #3b82f6',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <h3 style={{ color: '#1d4ed8', margin: '0 0 15px 0' }}>
            💰 Business Impact: 10x Market Expansion
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <strong>Development Cost:</strong><br />
              Build once → Deploy to 9+ markets<br />
              Same backend, different pixels
            </div>
            <div>
              <strong>Market Reach:</strong><br />
              Every cultural group gets familiar language<br />
              No one feels excluded or confused
            </div>
            <div>
              <strong>User Development:</strong><br />
              Complexity adapts to growth<br />
              Scaffolding dissolves when unneeded
            </div>
            <div>
              <strong>Scalable Innovation:</strong><br />
              Add new portals easily<br />
              Cross-portal insights and learning
            </div>
          </div>
        </motion.div>

        {/* The Demo's Power */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          style={{
            marginTop: '30px',
            textAlign: 'center',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '2px solid #a855f7',
            borderRadius: '12px',
            padding: '20px'
          }}
        >
          <h3 style={{ color: '#7c2d12', margin: '0 0 15px 0' }}>
            ⚡ The "Holy Sh*t" Demo Moment
          </h3>
          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
            "Watch this - same person, same crisis, but look how completely different the support appears when we change their cultural portal and development level..."
          </p>
          <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#7c2d12', marginTop: '15px' }}>
            [Clicks through matrix] → "Corporate executive becomes shamanic initiate becomes therapy client - same consciousness technology, infinite cultural expressions."
          </p>
        </motion.div>
      </div>
    </LayoutGroup>
  );
};

export default DisposablePixelMatrixDemo;