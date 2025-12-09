/**
 * Three Worlds Navigation Interface
 *
 * Sacred cosmological navigation system based on universal shamanic worldview
 * Implements the axis mundi and three-world cosmology for consciousness exploration
 *
 * Upper World: Sky Realm, transcendence, gods, solar consciousness
 * Middle World: Ordinary reality, human affairs, community
 * Lower World: Underworld, shadow, ancestors, death/rebirth
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';
import { AlchemicalMetal, MercuryAspect } from '../types';
import { CorrespondenceThinkingEngine } from '../CorrespondenceThinkingEngine';

export type WorldRealm = 'upper' | 'middle' | 'lower';
export type NavigationMode = 'contemplative' | 'active' | 'emergency';

export interface WorldCharacteristics {
  realm: WorldRealm;
  name: string;
  description: string;
  elements: string[];
  colors: string[];
  energies: string[];
  challenges: string[];
  gifts: string[];
  inhabitants: string[];
  symbols: string[];
  alchemicalCorrespondence: AlchemicalMetal[];
  mercuryAspects: MercuryAspect[];
}

export interface WorldState {
  currentWorld: WorldRealm;
  energy: number; // 0-1
  stability: number; // 0-1
  accessibility: number; // 0-1
  dangers: string[];
  opportunities: string[];
}

export interface NavigationEvent {
  type: 'enter' | 'exit' | 'traverse' | 'blocked';
  fromWorld: WorldRealm | null;
  toWorld: WorldRealm;
  timestamp: Date;
  guidance: string;
  warnings: string[];
}

// World Configurations
const WORLD_CHARACTERISTICS: Record<WorldRealm, WorldCharacteristics> = {
  upper: {
    realm: 'upper',
    name: 'Sky Realm',
    description: 'Realm of gods, transcendence, and solar consciousness',
    elements: ['Air', 'Fire', 'Light', 'Spirit'],
    colors: ['#FFD700', '#87CEEB', '#FFFACD', '#FF6347'],
    energies: ['Inspiration', 'Transcendence', 'Wisdom', 'Unity'],
    challenges: ['Ego inflation', 'Spiritual bypassing', 'Disconnection from earth'],
    gifts: ['Divine wisdom', 'Cosmic perspective', 'Healing power', 'Prophecy'],
    inhabitants: ['Gods', 'Angels', 'Ascended masters', 'Solar eagles', 'Phoenix'],
    symbols: ['☀️', '🦅', '⭐', '👑', '🔥', '🌤️'],
    alchemicalCorrespondence: ['silver', 'gold'],
    mercuryAspects: ['hermes-psychopomp', 'hermes-alchemist']
  },

  middle: {
    realm: 'middle',
    name: 'Middle World',
    description: 'Ordinary reality, human affairs, and community',
    elements: ['Earth', 'Water', 'Air', 'Plants'],
    colors: ['#8B4513', '#228B22', '#4169E1', '#20B2AA'],
    energies: ['Action', 'Relationship', 'Creativity', 'Service'],
    challenges: ['Materialism', 'Conflict', 'Distraction', 'Superficiality'],
    gifts: ['Community', 'Manifestation', 'Relationships', 'Practical wisdom'],
    inhabitants: ['Humans', 'Animals', 'Nature spirits', 'Ancestors in physical form'],
    symbols: ['🌍', '🏠', '👥', '🌲', '🐺', '🦌'],
    alchemicalCorrespondence: ['bronze', 'iron', 'mercury'],
    mercuryAspects: ['hermes-messenger', 'hermes-guide', 'hermes-teacher']
  },

  lower: {
    realm: 'lower',
    name: 'Underworld',
    description: 'Shadow realm, ancestors, death/rebirth, and deep mysteries',
    elements: ['Earth', 'Water', 'Shadow', 'Bone'],
    colors: ['#000000', '#8B0000', '#2F4F4F', '#800080'],
    energies: ['Transformation', 'Death/Rebirth', 'Shadow work', 'Ancient wisdom'],
    challenges: ['Being consumed', 'Losing way back', 'Confronting deepest fears'],
    gifts: ['Shadow integration', 'Ancestral wisdom', 'Soul retrieval', 'Authentic power'],
    inhabitants: ['Ancestors', 'Chthonic deities', 'Shadow beings', 'Serpents', 'Underground animals'],
    symbols: ['🕳️', '💀', '🐍', '🌑', '⚰️', '🗿'],
    alchemicalCorrespondence: ['lead', 'tin'],
    mercuryAspects: ['hermes-healer', 'hermes-trickster']
  }
};

// World Tree Component
const WorldTree: React.FC<{
  currentWorld: WorldRealm;
  onWorldSelect: (world: WorldRealm) => void;
  energy: number;
}> = ({ currentWorld, onWorldSelect, energy }) => {

  const treeRef = useRef<HTMLDivElement>(null);

  // Animate tree based on current world
  const treeVariants = {
    upper: {
      background: 'linear-gradient(to bottom, #FFD700 0%, #87CEEB 50%, #228B22 100%)',
      scale: 1.1,
      filter: 'brightness(1.2)'
    },
    middle: {
      background: 'linear-gradient(to bottom, #87CEEB 0%, #228B22 50%, #8B4513 100%)',
      scale: 1.0,
      filter: 'brightness(1.0)'
    },
    lower: {
      background: 'linear-gradient(to bottom, #228B22 0%, #8B4513 50%, #000000 100%)',
      scale: 0.9,
      filter: 'brightness(0.7)'
    }
  };

  return (
    <motion.div
      ref={treeRef}
      className="world-tree"
      style={{
        width: '80px',
        height: '400px',
        position: 'relative',
        margin: '0 auto'
      }}
      variants={treeVariants}
      animate={currentWorld}
      transition={{ duration: 2.0 }}
    >
      {/* Crown - Upper World */}
      <motion.div
        className="tree-crown"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '80px',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.1 }}
        animate={{
          opacity: currentWorld === 'upper' ? 1 : 0.7,
          scale: currentWorld === 'upper' ? 1.2 : 1
        }}
        onClick={() => onWorldSelect('upper')}
      >
        <div style={{ fontSize: '48px', textAlign: 'center' }}>☀️</div>
        <div style={{ fontSize: '12px', textAlign: 'center', color: '#FFD700' }}>
          Sky Realm
        </div>
      </motion.div>

      {/* Trunk - Axis Mundi */}
      <motion.div
        className="tree-trunk"
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '20px',
          height: '240px',
          backgroundColor: '#8B4513',
          borderRadius: '10px'
        }}
        animate={{
          backgroundColor: currentWorld === 'middle' ? '#228B22' : '#8B4513',
          width: currentWorld === 'middle' ? '25px' : '20px'
        }}
      >
        {/* Energy flow animation */}
        <motion.div
          style={{
            width: '100%',
            height: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '5px'
          }}
          animate={{
            y: [0, 230, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </motion.div>

      {/* Middle World Marker */}
      <motion.div
        className="middle-world-marker"
        style={{
          position: 'absolute',
          top: '200px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '40px',
          height: '40px',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.1 }}
        animate={{
          opacity: currentWorld === 'middle' ? 1 : 0.7,
          scale: currentWorld === 'middle' ? 1.3 : 1
        }}
        onClick={() => onWorldSelect('middle')}
      >
        <div style={{ fontSize: '32px', textAlign: 'center' }}>🌍</div>
      </motion.div>

      {/* Roots - Lower World */}
      <motion.div
        className="tree-roots"
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '80px',
          cursor: 'pointer'
        }}
        whileHover={{ scale: 1.1 }}
        animate={{
          opacity: currentWorld === 'lower' ? 1 : 0.7,
          scale: currentWorld === 'lower' ? 1.2 : 1
        }}
        onClick={() => onWorldSelect('lower')}
      >
        <div style={{ fontSize: '12px', textAlign: 'center', color: '#800080' }}>
          Underworld
        </div>
        <div style={{ fontSize: '48px', textAlign: 'center' }}>🕳️</div>
      </motion.div>
    </motion.div>
  );
};

// Individual World Interface
const WorldInterface: React.FC<{
  world: WorldCharacteristics;
  isActive: boolean;
  energy: number;
}> = ({ world, isActive, energy }) => {

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          className="world-interface"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 1.5 }}
          style={{
            padding: '20px',
            borderRadius: '12px',
            background: `linear-gradient(135deg, ${world.colors.join(', ')})`,
            color: world.realm === 'lower' ? '#FFFFFF' : '#000000',
            margin: '20px 0'
          }}
        >
          <h2 style={{ margin: '0 0 10px 0' }}>
            {world.symbols.slice(0, 3).join(' ')} {world.name}
          </h2>

          <p style={{ marginBottom: '15px' }}>{world.description}</p>

          <div className="world-details" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>

            <div>
              <h4>Energies:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {world.energies.map((energy, i) => (
                  <li key={i}>{energy}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Inhabitants:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {world.inhabitants.map((inhabitant, i) => (
                  <li key={i}>{inhabitant}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Gifts:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {world.gifts.map((gift, i) => (
                  <li key={i} style={{ color: world.realm === 'lower' ? '#90EE90' : '#008000' }}>
                    {gift}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4>Challenges:</h4>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {world.challenges.map((challenge, i) => (
                  <li key={i} style={{ color: world.realm === 'lower' ? '#FFB6C1' : '#FF4500' }}>
                    {challenge}
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Energy visualization */}
          <div style={{ marginTop: '15px' }}>
            <h4>Current Energy: {Math.round(energy * 100)}%</h4>
            <div style={{
              width: '100%',
              height: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <motion.div
                style={{
                  height: '100%',
                  backgroundColor: world.realm === 'upper' ? '#FFD700' :
                                  world.realm === 'middle' ? '#228B22' : '#800080',
                  borderRadius: '5px'
                }}
                animate={{ width: `${energy * 100}%` }}
                transition={{ duration: 1.0 }}
              />
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Navigation Guidance Component
const NavigationGuidance: React.FC<{
  currentWorld: WorldRealm;
  targetWorld: WorldRealm | null;
  navigationAllowed: boolean;
}> = ({ currentWorld, targetWorld, navigationAllowed }) => {

  const getGuidanceMessage = () => {
    if (!targetWorld) return "Select a world to explore";

    if (!navigationAllowed) {
      return `Navigation to ${WORLD_CHARACTERISTICS[targetWorld].name} blocked. Strengthen current position first.`;
    }

    if (currentWorld === targetWorld) {
      return `You are centered in the ${WORLD_CHARACTERISTICS[currentWorld].name}. Explore its mysteries.`;
    }

    const guidance = {
      'upper': {
        'middle': "Descend with your celestial wisdom to serve the world",
        'lower': "Direct descent from Sky to Underworld - prepare for radical transformation"
      },
      'middle': {
        'upper': "Ascend through prayer, meditation, and spiritual practice",
        'lower': "Descend through dream work, shadow exploration, and facing fears"
      },
      'lower': {
        'middle': "Rise from the depths with your shadow integrated and ancestral wisdom",
        'upper': "Ascend from shadow to light - the great alchemical transformation"
      }
    };

    return guidance[currentWorld as keyof typeof guidance][targetWorld];
  };

  const getWarnings = () => {
    if (!targetWorld || !navigationAllowed) return [];

    const warnings: Record<string, string[]> = {
      'upper': [
        "Risk of spiritual bypassing",
        "May lose connection to earthly responsibilities",
        "Ego inflation possible with divine contact"
      ],
      'lower': [
        "Face your deepest fears",
        "May encounter ancestral trauma",
        "Risk of being consumed by shadow",
        "Ensure you have return guidance"
      ]
    };

    return warnings[targetWorld] || [];
  };

  return (
    <motion.div
      className="navigation-guidance"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        padding: '15px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: '#FFFFFF',
        borderRadius: '8px',
        margin: '10px 0'
      }}
    >
      <h4>Navigation Guidance:</h4>
      <p>{getGuidanceMessage()}</p>

      {getWarnings().length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <h5 style={{ color: '#FFD700' }}>⚠️ Warnings:</h5>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            {getWarnings().map((warning, i) => (
              <li key={i} style={{ color: '#FFB6C1' }}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
};

// Main Three Worlds Navigator Component
export const ThreeWorldsNavigator: React.FC = () => {
  const [currentWorld, setCurrentWorld] = useState<WorldRealm>('middle');
  const [targetWorld, setTargetWorld] = useState<WorldRealm | null>(null);
  const [worldEnergy, setWorldEnergy] = useState<Record<WorldRealm, number>>({
    upper: 0.6,
    middle: 0.8,
    lower: 0.4
  });
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('contemplative');
  const [navigationEvents, setNavigationEvents] = useState<NavigationEvent[]>([]);

  // Check if navigation is allowed based on energy and preparation
  const isNavigationAllowed = useMemo(() => {
    if (!targetWorld || currentWorld === targetWorld) return true;

    // Require minimum energy to navigate
    const currentEnergy = worldEnergy[currentWorld];
    const minEnergyRequired = {
      'contemplative': 0.3,
      'active': 0.5,
      'emergency': 0.1
    }[navigationMode];

    return currentEnergy >= minEnergyRequired;
  }, [currentWorld, targetWorld, worldEnergy, navigationMode]);

  // Handle world navigation
  const navigateToWorld = (world: WorldRealm) => {
    if (world === currentWorld) {
      setTargetWorld(null);
      return;
    }

    setTargetWorld(world);

    if (isNavigationAllowed) {
      // Execute navigation after delay (simulate journey time)
      setTimeout(() => {
        const event: NavigationEvent = {
          type: 'enter',
          fromWorld: currentWorld,
          toWorld: world,
          timestamp: new Date(),
          guidance: `Successfully entered ${WORLD_CHARACTERISTICS[world].name}`,
          warnings: []
        };

        setCurrentWorld(world);
        setTargetWorld(null);
        setNavigationEvents(prev => [...prev, event]);

        // Adjust energies after navigation
        setWorldEnergy(prev => ({
          ...prev,
          [currentWorld]: Math.max(prev[currentWorld] - 0.2, 0),
          [world]: Math.min(prev[world] + 0.1, 1)
        }));
      }, 2000);
    }
  };

  // Energy restoration function
  const restoreEnergy = (world: WorldRealm, amount: number) => {
    setWorldEnergy(prev => ({
      ...prev,
      [world]: Math.min(prev[world] + amount, 1)
    }));
  };

  return (
    <div className="three-worlds-navigator" style={{
      minHeight: '600px',
      padding: '20px',
      background: 'linear-gradient(to bottom, #001122 0%, #003366 50%, #000000 100%)'
    }}>

      <motion.h1
        style={{ textAlign: 'center', color: '#FFFFFF', marginBottom: '30px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        🌳 Three Worlds Navigator 🌳
      </motion.h1>

      {/* Navigation Mode Controls */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ color: '#FFFFFF', marginRight: '10px' }}>
          Navigation Mode:
        </label>
        {(['contemplative', 'active', 'emergency'] as NavigationMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setNavigationMode(mode)}
            style={{
              margin: '0 5px',
              padding: '5px 10px',
              backgroundColor: navigationMode === mode ? '#FFD700' : '#333',
              color: navigationMode === mode ? '#000' : '#FFF',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {mode}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>

        {/* World Tree */}
        <div style={{ flex: '0 0 120px' }}>
          <WorldTree
            currentWorld={currentWorld}
            onWorldSelect={navigateToWorld}
            energy={worldEnergy[currentWorld]}
          />
        </div>

        {/* Current World Interface */}
        <div style={{ flex: 1 }}>
          <WorldInterface
            world={WORLD_CHARACTERISTICS[currentWorld]}
            isActive={true}
            energy={worldEnergy[currentWorld]}
          />

          {/* Navigation Guidance */}
          <NavigationGuidance
            currentWorld={currentWorld}
            targetWorld={targetWorld}
            navigationAllowed={isNavigationAllowed}
          />

          {/* Energy Management */}
          <div style={{
            padding: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            marginTop: '15px'
          }}>
            <h4 style={{ color: '#FFFFFF', margin: '0 0 10px 0' }}>Energy Management:</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {(['upper', 'middle', 'lower'] as WorldRealm[]).map(world => (
                <div key={world} style={{ textAlign: 'center' }}>
                  <div style={{ color: '#FFFFFF', fontSize: '12px' }}>
                    {WORLD_CHARACTERISTICS[world].name}
                  </div>
                  <div style={{
                    margin: '5px 0',
                    color: worldEnergy[world] > 0.5 ? '#90EE90' :
                           worldEnergy[world] > 0.2 ? '#FFD700' : '#FF6347'
                  }}>
                    {Math.round(worldEnergy[world] * 100)}%
                  </div>
                  <button
                    onClick={() => restoreEnergy(world, 0.2)}
                    style={{
                      padding: '3px 8px',
                      fontSize: '10px',
                      backgroundColor: '#333',
                      color: '#FFF',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Restore
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Navigation Events */}
          {navigationEvents.length > 0 && (
            <div style={{
              marginTop: '15px',
              padding: '15px',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              borderRadius: '8px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              <h4 style={{ color: '#FFFFFF', margin: '0 0 10px 0' }}>Navigation Log:</h4>
              {navigationEvents.slice(-5).reverse().map((event, i) => (
                <div key={i} style={{
                  color: '#CCCCCC',
                  fontSize: '12px',
                  marginBottom: '5px',
                  borderLeft: '2px solid #FFD700',
                  paddingLeft: '8px'
                }}>
                  <strong>{event.timestamp.toLocaleTimeString()}</strong>: {event.guidance}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ThreeWorldsNavigator;