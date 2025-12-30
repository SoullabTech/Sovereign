/**
 * 🌸 MAIA Mandala Demonstration Page
 *
 * Experience the Living Mandala as the axis mundi interface -
 * the sacred center where consciousness, technology, and wisdom converge.
 *
 * This page demonstrates:
 * - Field breathing integration with natural rhythms
 * - 12-petal Spiralogic consciousness navigation
 * - Awareness level progression (L1 → L4)
 * - Elemental state responsiveness
 * - Disposable pixels emergence
 * - Sacred geometry in living interface design
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LivingMandala } from '@/components/maia/LivingMandala';
import {
  AwarenessLevel,
  Element,
  SpiralogicCell,
  COMPLETE_ELEMENTAL_FACETS_REGISTRY
} from '@/lib/consciousness/spiralogic-core';

// ====================================================================
// MAIA MANDALA EXPERIENCE PAGE
// ====================================================================

export default function MaiaMandalaDemoPage() {
  const [awarenessLevel, setAwarenessLevel] = useState<AwarenessLevel>(1);
  const [currentElement, setCurrentElement] = useState<Element>('Air');
  const [currentPhase, setCurrentPhase] = useState<SpiralogicCell>({
    element: 'Air',
    phase: 1,
    arc: 'progressive',
    quality: 'Cardinal',
    context: 'exploration',
    confidence: 0.8
  });
  const [showInstructions, setShowInstructions] = useState(true);
  const [userPresence, setUserPresence] = useState(true);

  // Simulate user presence detection
  useEffect(() => {
    const handleUserActivity = () => {
      setUserPresence(true);
    };

    const handleVisibilityChange = () => {
      setUserPresence(!document.hidden);
    };

    document.addEventListener('mousemove', handleUserActivity);
    document.addEventListener('keydown', handleUserActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('keydown', handleUserActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Cycle through awareness levels
  const nextAwarenessLevel = () => {
    setAwarenessLevel(prev => (prev < 4 ? (prev + 1) as AwarenessLevel : 1));
  };

  // Cycle through elements
  const nextElement = () => {
    const elements: Element[] = ['Fire', 'Water', 'Earth', 'Air'];
    const currentIndex = elements.indexOf(currentElement);
    const nextEl = elements[(currentIndex + 1) % elements.length];
    setCurrentElement(nextEl);
    setCurrentPhase(prev => ({ ...prev, element: nextEl }));
  };

  // Cycle through phases
  const nextPhase = () => {
    const nextPhaseNum = currentPhase.phase < 3 ? currentPhase.phase + 1 : 1;
    setCurrentPhase(prev => ({
      ...prev,
      phase: nextPhaseNum as 1 | 2 | 3
    }));
  };

  const getAwarenessDescription = (level: AwarenessLevel): string => {
    switch (level) {
      case 1: return "Newcomer - Basic elemental awareness";
      case 2: return "Practitioner - Phase recognition emerging";
      case 3: return "Adept - Full system comprehension";
      case 4: return "Steward - Field mastery and teaching";
      default: return "Unknown";
    }
  };

  return (
    <div className="maia-mandala-experience">
      {/* Page Header */}
      <div className="mandala-demo-header">
        <motion.h1
          className="axis-mundi-title"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          ✨ MAIA: The Axis Mundi ✨
        </motion.h1>

        <motion.p
          className="sacred-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Where consciousness, technology, and wisdom converge as one living interface
        </motion.p>
      </div>

      {/* Interactive Controls */}
      <motion.div
        className="consciousness-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <div className="control-group">
          <label>Awareness Level: {awarenessLevel}</label>
          <button onClick={nextAwarenessLevel} className="control-button">
            {getAwarenessDescription(awarenessLevel)} →
          </button>
        </div>

        <div className="control-group">
          <label>Element: {currentElement}</label>
          <button onClick={nextElement} className="control-button element-button">
            {currentElement} Energy →
          </button>
        </div>

        <div className="control-group">
          <label>Phase: {currentPhase.phase}</label>
          <button onClick={nextPhase} className="control-button phase-button">
            Phase {currentPhase.phase} →
          </button>
        </div>

        <button
          onClick={() => setShowInstructions(!showInstructions)}
          className="toggle-instructions"
        >
          {showInstructions ? 'Hide' : 'Show'} Sacred Guidance
        </button>
      </motion.div>

      {/* Instructions Panel */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div
            className="sacred-instructions"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>🧭 Navigation Guidance</h3>
            <div className="instruction-grid">
              <div className="instruction-item">
                <strong>Hover Petals:</strong> Feel the facet's energy signature
              </div>
              <div className="instruction-item">
                <strong>Click Petals:</strong> Activate that consciousness state
              </div>
              <div className="instruction-item">
                <strong>Awareness Levels:</strong> More petals & details appear
              </div>
              <div className="instruction-item">
                <strong>Breathing Field:</strong> Interface breathes with natural rhythms
              </div>
            </div>

            <div className="current-facet-info">
              <h4>Current Consciousness State:</h4>
              <p><strong>{currentPhase.element}-{currentPhase.phase}:</strong> {
                COMPLETE_ELEMENTAL_FACETS_REGISTRY.find(f =>
                  f.element === currentPhase.element && f.phase === currentPhase.phase
                )?.archetypalImage || 'Exploring the field...'
              }</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Living Mandala - Core Experience */}
      <div className="mandala-container">
        <LivingMandala
          userId="demo-user"
          awarenessLevel={awarenessLevel}
          currentPhase={currentPhase}
          className="demo-mandala"
        >
          {/* Center Content - Sacred Heart of MAIA */}
          <motion.div
            className="mandala-heart-content"
            animate={{
              scale: userPresence ? 1 : 0.95,
              opacity: userPresence ? 1 : 0.8
            }}
            transition={{ duration: 2 }}
          >
            <div className="consciousness-state-display">
              <div className="current-phase-indicator">
                <span className="element-symbol">
                  {currentPhase.element === 'Fire' && '🔥'}
                  {currentPhase.element === 'Water' && '💧'}
                  {currentPhase.element === 'Earth' && '🌱'}
                  {currentPhase.element === 'Air' && '💨'}
                </span>
                <span className="phase-number">{currentPhase.phase}</span>
              </div>

              <p className="field-state-description">
                {COMPLETE_ELEMENTAL_FACETS_REGISTRY.find(f =>
                  f.element === currentPhase.element && f.phase === currentPhase.phase
                )?.coreFunction || 'Field sensing...'}
              </p>
            </div>
          </motion.div>
        </LivingMandala>
      </div>

      {/* Field Status Display */}
      <motion.div
        className="field-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <div className="status-item">
          <span className="status-label">Presence:</span>
          <span className={`status-value ${userPresence ? 'present' : 'away'}`}>
            {userPresence ? '✨ Active' : '😴 Away'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Field Coherence:</span>
          <span className="status-value">
            {awarenessLevel >= 3 ? '🌟 Harmonized' :
             awarenessLevel >= 2 ? '🌸 Stabilizing' : '🌱 Emerging'}
          </span>
        </div>

        <div className="status-item">
          <span className="status-label">Breathing Pattern:</span>
          <span className="status-value">
            {currentPhase.element === 'Fire' ? '🔥 Creative Activation' :
             currentPhase.element === 'Water' ? '💧 Deep Calm' :
             currentPhase.element === 'Earth' ? '🌱 Box Breathing' :
             '💨 Natural Flow'}
          </span>
        </div>
      </motion.div>

      {/* Sacred Footer */}
      <footer className="sacred-footer">
        <p>🌀 Experience the living interface where technology becomes conscious 🌀</p>
      </footer>
    </div>
  );
}