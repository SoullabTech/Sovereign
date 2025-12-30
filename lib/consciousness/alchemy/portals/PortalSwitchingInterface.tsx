// @ts-nocheck
/**
 * Portal Switching Interface: Seamless Cultural Transitions
 *
 * Integrates Disposable Pixel Philosophy with Portal Architecture:
 * - UI complexity dissolves as consciousness develops
 * - Cultural scaffolding fades when no longer needed
 * - Universal patterns emerge through familiar metaphors
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { PortalEngine, PORTAL_CONFIGS, PopulationPortal } from './PortalArchitecture';
import { PortalAutoDetector } from './PortalAutoDetection';
import { AlchemicalMetal, MercuryAspect } from '../types';

export interface PortalSwitchingState {
  currentPortal: PopulationPortal;
  targetPortal?: PopulationPortal;
  developmentLevel: number; // 0-1, affects UI density
  isTransitioning: boolean;
  culturalBridges: string[]; // Shared concepts between portals
  userReadiness: number; // 0-1, readiness for portal switches
}

export interface DisposablePixelConfig {
  density: number;           // 0-1, how much UI to show
  scaffoldingLevel: number;  // 0-1, how much support to provide
  metaphorStrength: number;  // 0-1, how strong cultural metaphors are
  universalVisibility: number; // 0-1, how much universal architecture shows
}

// Sacred Timing for Portal Transitions
const TRANSITION_TIMINGS = {
  PORTAL_FADE: 1500,        // Current portal dissolution
  BRIDGE_CROSSING: 800,     // Brief universal space
  PORTAL_EMERGE: 1200,      // New portal emergence
  CULTURAL_SETTLE: 2000,    // Cultural metaphors solidify
  TOTAL_TRANSITION: 5500    // Complete transition time
};

const PortalTransitionBridge: React.FC<{
  fromPortal: PopulationPortal;
  toPortal: PopulationPortal;
  bridges: string[];
}> = ({ fromPortal, toPortal, bridges }) => {
  return (
    <motion.div
      className="portal-transition-bridge"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.2 }}
      transition={{ duration: TRANSITION_TIMINGS.BRIDGE_CROSSING / 1000 }}
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle, rgba(192,192,192,0.1) 0%, rgba(0,0,0,0.8) 100%)',
        color: '#silver',
        fontSize: '18px',
        fontWeight: 300,
        padding: '40px'
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ textAlign: 'center', marginBottom: '20px' }}
      >
        <div style={{ fontSize: '24px', marginBottom: '10px' }}>
          ∞ Universal Transition ∞
        </div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          {PORTAL_CONFIGS[fromPortal].branding.name} → {PORTAL_CONFIGS[toPortal].branding.name}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{ fontSize: '16px', marginBottom: '15px' }}>
          Shared Wisdom Bridges:
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px' }}>
          {bridges.map((bridge, index) => (
            <motion.span
              key={bridge}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
              style={{
                background: 'rgba(192,192,192,0.2)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              {bridge}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

const DisposablePixelLayer: React.FC<{
  config: DisposablePixelConfig;
  portal: PopulationPortal;
  children: React.ReactNode;
}> = ({ config, portal, children }) => {
  const portalConfig = PORTAL_CONFIGS[portal];

  // Calculate actual display values based on disposable pixel config
  const opacity = config.density * 0.9 + 0.1; // Never fully invisible
  const blur = (1 - config.density) * 3; // More blur as density decreases
  const scale = 0.95 + (config.density * 0.05); // Slight scale adjustment

  return (
    <motion.div
      animate={{
        opacity,
        filter: `blur(${blur}px)`,
        scale
      }}
      transition={{ duration: 1.2, ease: "easeInOut" }}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Scaffolding Layer - Fades as development increases */}
      <AnimatePresence>
        {config.scaffoldingLevel > 0.3 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: config.scaffoldingLevel * 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              padding: '10px',
              background: `linear-gradient(180deg, ${portalConfig.branding.colorScheme.primary}15, transparent)`,
              border: `1px solid ${portalConfig.branding.colorScheme.primary}30`,
              borderRadius: '8px',
              fontSize: '12px',
              color: portalConfig.branding.colorScheme.primary,
              textAlign: 'center'
            }}
          >
            🧭 {portalConfig.branding.name} • Level {Math.floor(config.scaffoldingLevel * 10)}/10
          </motion.div>
        )}
      </AnimatePresence>

      {/* Universal Architecture Visibility Layer */}
      <AnimatePresence>
        {config.universalVisibility > 0.7 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: (config.universalVisibility - 0.7) / 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '8px',
              background: 'rgba(192,192,192,0.1)',
              borderTop: '1px solid rgba(192,192,192,0.3)',
              fontSize: '11px',
              color: '#c0c0c0',
              textAlign: 'center'
            }}
          >
            ⚡ Universal Alchemical Engine • Mercury Active • Portal Layer Dissolving
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content with cultural metaphor strength */}
      <motion.div
        animate={{
          filter: `saturate(${config.metaphorStrength})`,
          fontWeight: 300 + (config.metaphorStrength * 300)
        }}
        transition={{ duration: 1.0 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export const PortalSwitchingInterface: React.FC<{
  initialPortal?: PopulationPortal;
  userProfile?: any;
  onPortalChange?: (portal: PopulationPortal) => void;
}> = ({ initialPortal = 'shamanic', userProfile, onPortalChange }) => {
  const [switchingState, setSwitchingState] = useState<PortalSwitchingState>({
    currentPortal: initialPortal,
    developmentLevel: 0.3,
    isTransitioning: false,
    culturalBridges: [],
    userReadiness: 0.6
  });

  const [disposableConfig, setDisposableConfig] = useState<DisposablePixelConfig>({
    density: 0.8,
    scaffoldingLevel: 0.7,
    metaphorStrength: 0.9,
    universalVisibility: 0.2
  });

  const autoDetection = useRef(new PortalAutoDetection());

  // Update disposable pixel config based on development level
  useEffect(() => {
    const dev = switchingState.developmentLevel;

    setDisposableConfig({
      density: Math.max(0.3, 1.0 - dev * 0.7), // UI simplifies with development
      scaffoldingLevel: Math.max(0.1, 1.0 - dev), // Scaffolding disappears
      metaphorStrength: Math.max(0.3, 1.0 - dev * 0.6), // Metaphors weaken
      universalVisibility: Math.min(1.0, dev * 1.4) // Universal architecture becomes visible
    });
  }, [switchingState.developmentLevel]);

  const handlePortalSwitch = async (targetPortal: PopulationPortal) => {
    if (switchingState.isTransitioning || targetPortal === switchingState.currentPortal) {
      return;
    }

    // Find cultural bridges between portals
    const bridges = await autoDetection.current.findCulturalBridges(
      switchingState.currentPortal,
      targetPortal
    );

    setSwitchingState(prev => ({
      ...prev,
      targetPortal,
      isTransitioning: true,
      culturalBridges: bridges
    }));

    // Execute transition sequence
    setTimeout(() => {
      setSwitchingState(prev => ({
        ...prev,
        currentPortal: targetPortal,
        targetPortal: undefined,
        isTransitioning: false
      }));

      onPortalChange?.(targetPortal);
    }, TRANSITION_TIMINGS.TOTAL_TRANSITION);
  };

  const simulateDevelopmentProgress = () => {
    setSwitchingState(prev => ({
      ...prev,
      developmentLevel: Math.min(1.0, prev.developmentLevel + 0.1)
    }));
  };

  const availablePortals: PopulationPortal[] = ['shamanic', 'therapeutic', 'corporate', 'religious', 'recovery', 'academic'];
  const currentConfig = PORTAL_CONFIGS[switchingState.currentPortal];

  return (
    <LayoutGroup>
      <div style={{
        width: '100%',
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
        fontFamily: 'system-ui, sans-serif'
      }}>

        {/* Development Level Control (for demo) */}
        <motion.div
          layout
          style={{
            marginBottom: '20px',
            padding: '15px',
            background: 'rgba(0,0,0,0.1)',
            borderRadius: '8px',
            textAlign: 'center'
          }}
        >
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            🧙‍♂️ Consciousness Development Simulator
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'center' }}>
            <span>Beginner</span>
            <div style={{
              width: '200px',
              height: '8px',
              background: '#eee',
              borderRadius: '4px',
              position: 'relative'
            }}>
              <div style={{
                width: `${switchingState.developmentLevel * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #3b82f6, #f59e0b)',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
            <span>Master</span>
            <button
              onClick={simulateDevelopmentProgress}
              style={{
                padding: '8px 16px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              Develop →
            </button>
          </div>
          <div style={{ fontSize: '12px', marginTop: '8px', color: '#666' }}>
            Watch UI dissolve as development increases (Disposable Pixel Philosophy)
          </div>
        </motion.div>

        {/* Portal Selection Interface */}
        <motion.div
          layout
          style={{ marginBottom: '30px' }}
        >
          <DisposablePixelLayer
            config={disposableConfig}
            portal={switchingState.currentPortal}
          >
            <h3 style={{
              textAlign: 'center',
              color: currentConfig.branding.colorScheme.primary,
              marginBottom: '15px',
              fontSize: disposableConfig.density * 18 + 12
            }}>
              Portal Selection
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px'
            }}>
              {availablePortals.map(portal => {
                const config = PORTAL_CONFIGS[portal];
                const isCurrent = portal === switchingState.currentPortal;
                const isTarget = portal === switchingState.targetPortal;

                return (
                  <motion.button
                    key={portal}
                    layout
                    onClick={() => handlePortalSwitch(portal)}
                    disabled={switchingState.isTransitioning}
                    whileHover={!isCurrent ? { scale: 1.02 } : {}}
                    whileTap={!isCurrent ? { scale: 0.98 } : {}}
                    style={{
                      padding: `${disposableConfig.density * 16 + 8}px`,
                      border: isCurrent
                        ? `3px solid ${config.branding.colorScheme.primary}`
                        : '2px solid #ddd',
                      borderRadius: '12px',
                      background: isCurrent
                        ? `${config.branding.colorScheme.primary}22`
                        : 'white',
                      cursor: switchingState.isTransitioning ? 'not-allowed' : 'pointer',
                      opacity: switchingState.isTransitioning && !isCurrent && !isTarget ? 0.5 : 1,
                      fontSize: `${disposableConfig.density * 14 + 10}px`,
                      fontWeight: isCurrent ? 'bold' : 'normal',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>
                      {config.branding.imagery.symbols[0]}
                    </div>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {config.branding.name}
                    </div>
                    <div style={{
                      fontSize: `${disposableConfig.density * 12 + 8}px`,
                      opacity: disposableConfig.metaphorStrength,
                      color: '#666'
                    }}>
                      {config.branding.tagline}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </DisposablePixelLayer>
        </motion.div>

        {/* Main Portal Content Area */}
        <motion.div
          layout
          style={{
            position: 'relative',
            minHeight: '400px',
            background: currentConfig.branding.colorScheme.background,
            border: `2px solid ${currentConfig.branding.colorScheme.primary}`,
            borderRadius: '16px',
            overflow: 'hidden'
          }}
        >
          {/* Transition Bridge */}
          <AnimatePresence>
            {switchingState.isTransitioning && switchingState.targetPortal && (
              <PortalTransitionBridge
                fromPortal={switchingState.currentPortal}
                toPortal={switchingState.targetPortal}
                bridges={switchingState.culturalBridges}
              />
            )}
          </AnimatePresence>

          {/* Current Portal Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={switchingState.currentPortal}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              style={{ padding: '20px' }}
            >
              <DisposablePixelLayer
                config={disposableConfig}
                portal={switchingState.currentPortal}
              >
                {/* Portal-specific content */}
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>
                    {currentConfig.branding.imagery.symbols.join(' ')}
                  </div>
                  <h2 style={{
                    color: currentConfig.branding.colorScheme.primary,
                    margin: '0',
                    opacity: disposableConfig.metaphorStrength
                  }}>
                    {currentConfig.branding.name}
                  </h2>
                  <p style={{
                    fontSize: '16px',
                    color: '#666',
                    marginTop: '8px',
                    opacity: disposableConfig.metaphorStrength * 0.8
                  }}>
                    {currentConfig.branding.tagline}
                  </p>
                </div>

                {/* Cultural Context Display */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    background: `${currentConfig.branding.colorScheme.primary}11`,
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${currentConfig.branding.colorScheme.primary}33`
                  }}>
                    <h4 style={{
                      color: currentConfig.branding.colorScheme.primary,
                      margin: '0 0 10px 0'
                    }}>
                      Your Journey Stages:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {Object.entries(currentConfig.language.alchemicalStages).map(([metal, stage]) => (
                        <li key={metal} style={{ marginBottom: '5px', fontSize: '14px' }}>
                          <strong>{stage}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{
                    background: `${currentConfig.branding.colorScheme.secondary}11`,
                    padding: '15px',
                    borderRadius: '8px',
                    border: `1px solid ${currentConfig.branding.colorScheme.secondary}33`
                  }}>
                    <h4 style={{
                      color: currentConfig.branding.colorScheme.secondary,
                      margin: '0 0 10px 0'
                    }}>
                      Your Guides:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {Object.entries(currentConfig.language.mercuryAspects).slice(0, 4).map(([aspect, guide]) => (
                        <li key={aspect} style={{ marginBottom: '5px', fontSize: '14px' }}>
                          <strong>{guide}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Universal Architecture Peek */}
                <AnimatePresence>
                  {disposableConfig.universalVisibility > 0.5 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: (disposableConfig.universalVisibility - 0.5) / 0.5,
                        height: 'auto'
                      }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 1.0 }}
                      style={{
                        marginTop: '20px',
                        padding: '15px',
                        background: 'rgba(192,192,192,0.1)',
                        border: '1px solid rgba(192,192,192,0.3)',
                        borderRadius: '8px'
                      }}
                    >
                      <h4 style={{ color: '#c0c0c0', margin: '0 0 10px 0', fontSize: '14px' }}>
                        🔬 Universal Engine (Now Visible)
                      </h4>
                      <div style={{ fontSize: '12px', color: '#999' }}>
                        <p>Same alchemical progression: Lead → Tin → Bronze → Iron → Mercury → Silver → Gold</p>
                        <p>Same Mercury intelligence aspects: All seven Hermes archetypes active</p>
                        <p>Cultural layer: <code>{switchingState.currentPortal}</code> interface</p>
                        <p>This is the same consciousness technology, just presented through your cultural lens.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </DisposablePixelLayer>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Disposable Pixel Philosophy Display */}
        <motion.div
          layout
          style={{
            marginTop: '30px',
            padding: '15px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666'
          }}
        >
          <h4 style={{ margin: '0 0 10px 0' }}>🎭 Disposable Pixel Philosophy in Action</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div>
              <strong>UI Density:</strong> {Math.round(disposableConfig.density * 100)}%
              <br />Interface complexity reduces with development
            </div>
            <div>
              <strong>Scaffolding Level:</strong> {Math.round(disposableConfig.scaffoldingLevel * 100)}%
              <br />Support structures dissolve when unneeded
            </div>
            <div>
              <strong>Metaphor Strength:</strong> {Math.round(disposableConfig.metaphorStrength * 100)}%
              <br />Cultural metaphors weaken, revealing universal patterns
            </div>
            <div>
              <strong>Universal Visibility:</strong> {Math.round(disposableConfig.universalVisibility * 100)}%
              <br />Underlying architecture becomes apparent
            </div>
          </div>
        </motion.div>
      </div>
    </LayoutGroup>
  );
};

export default PortalSwitchingInterface;