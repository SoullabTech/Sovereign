'use client';

/**
 * Sacred House Wheel - Soul-Centric Field Instrument
 *
 * A living cross-section of consciousness in motion.
 * Houses are FIXED stations (not spinning gears) - stable consciousness states.
 * Motion = field currents, not mechanical rotation.
 *
 * Soul-Centric Design Principles:
 * - Nothing orbits the center; all movement passes THROUGH it
 * - Rotation = mechanistic time | Flow = living process | Stillness = witness consciousness
 * - The wheel doesn't move FOR you; it thinks WITH you
 *
 * Neuroscience Integration:
 * 🔥 FIRE (Right PFC) - Vision & Projection: Experience → Expression → Expansion
 * 💧 WATER (Right Hemisphere) - Deep Introspection: Heart → Healing → Holiness
 * 🌍 EARTH (Left Hemisphere) - Grounded Creativity: Mission → Means → Medicine
 * 💨 AIR (Left PFC) - Communication: Connection → Community → Consciousness
 * ✨ AETHER (Center) - The Unmoved Witness (absolute stillness)
 *
 * Field Dynamics:
 * - Outer rim: Subtle elemental current (Fire→Water→Earth→Air gradient sweep)
 * - Inner field: Slow logarithmic spiral pulse (12-15s breathing cycle)
 * - House resonance: Element-specific tempos on hover
 * - Aspects: Field currents converging through Aether center (not around it)
 * - All motion: Easing like breath (sine-in-out), meditative, seamless loops
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { getSpiralogicHouseData } from '@/lib/astrology/spiralogicHouseMapping';
import { getZodiacArchetype, generateArchetypalDescription } from '@/lib/astrology/archetypeLibrary';
import { getPlanetaryArchetype } from '@/lib/astrology/spiralogicMapping';
import { synthesizeAspect, AspectType } from '@/lib/astrology/aspectSynthesis';
import { AlchemicalSymbol } from './AlchemicalSymbols';
import { Mission, MissionLayerSettings } from '@/lib/story/types';
import { MissionDot, MissionPopup } from './MissionDot';
import {
  detectAllPatterns,
  type AspectPattern,
  type Aspect as PatternAspect,
  type Planet as PatternPlanet,
} from '@/lib/astrology/aspectPatternDetector';
import HouseDeepDiveSheet from './HouseDeepDiveSheet';

interface Planet {
  name: string;
  sign: string;
  house: number;
  degree: number;
}

interface Aspect {
  planet1: string;
  planet2: string;
  type: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition';
  orb: number;
}

// Transit planet position for current sky layer
interface Transit {
  planet: string;
  sign: string;
  degree: number;
  longitude: number;
  house?: number; // Transit's house in natal chart
}

// Transit-to-natal aspect
interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  aspectType: 'conjunction' | 'sextile' | 'square' | 'trine' | 'opposition' | 'quincunx';
  orb: number;
  applying: boolean; // Is aspect getting tighter?
}

interface SacredHouseWheelProps {
  planets?: Planet[];
  aspects?: Aspect[];
  isDayMode?: boolean;
  showAspects?: boolean;
  className?: string;
  // CHART LAYOUT - Traditional western vs Spiralogic elemental
  layoutMode?: 'traditional' | 'spiralogic';
  // MISSION TRACKING - Pulsing dots for creative manifestations
  missions?: Mission[];
  missionLayerSettings?: MissionLayerSettings;
  // CURRENT TRANSITS - Live planetary positions
  transits?: Transit[];
  transitAspects?: TransitAspect[];
}

// Spiralogic Spiral Order - House 1 at 12 o'clock (top of wheel)
// Clockwise from 12:00: Fire → Water → Earth → Air
// Elemental quadrants: Fire (12-3), Water (3-6), Earth (6-9), Air (9-12)
const spiralogicOrder = [
  1,   // Position 0 (12:00) - Fire 1 - Identity/Self (Experience)
  5,   // Position 1 (1:00) - Fire 2 - Creativity/Joy (Expression)
  9,   // Position 2 (2:00) - Fire 3 - Philosophy/Expansion
  4,   // Position 3 (3:00) - Water 1 - Home/Roots (Heart)
  8,   // Position 4 (4:00) - Water 2 - Transformation/Intimacy (Healing)
  12,  // Position 5 (5:00) - Water 3 - Spirituality/Dissolution (Holiness)
  10,  // Position 6 (6:00) - Earth 1 - Career/Legacy (Mission)
  2,   // Position 7 (7:00) - Earth 2 - Resources/Values (Means)
  6,   // Position 8 (8:00) - Earth 3 - Service/Health (Medicine)
  7,   // Position 9 (9:00) - Air 1 - Relationships/Other (Connection)
  11,  // Position 10 (10:00) - Air 2 - Community/Vision (Community)
  3,   // Position 11 (11:00) - Air 3 - Communication/Learning (Consciousness)
];

// Traditional Western Chart Order - Counterclockwise from Ascendant (8 o'clock)
// Rotated counter-clockwise by 1 house so H1/Ascendant spans 8:00-9:00 sector
// Position index maps clockwise from 12 o'clock, houses go counterclockwise
const traditionalOrder = [
  9,   // Position 0 (12:00)
  8,   // Position 1 (1:00)
  7,   // Position 2 (2:00)
  6,   // Position 3 (3:00)
  5,   // Position 4 (4:00)
  4,   // Position 5 (5:00)
  3,   // Position 6 (6:00)
  2,   // Position 7 (7:00)
  1,   // Position 8 (8:00) - ASC / Ascendant (Experience)
  12,  // Position 9 (9:00)
  11,  // Position 10 (10:00)
  10,  // Position 11 (11:00) - MC / Midheaven
];

// House-element mapping (Spiralogic system)
const houseElements = {
  1: 'fire',    // Identity
  2: 'earth',   // Resources
  3: 'air',     // Communication
  4: 'water',   // Home
  5: 'fire',    // Creativity
  6: 'earth',   // Service
  7: 'air',     // Partnership
  8: 'water',   // Transformation
  9: 'fire',    // Expansion
  10: 'earth',  // Career
  11: 'air',    // Community
  12: 'water',  // Transcendence
};

// Alchemical Education: Deep dive into each house's alchemical process
const alchemicalEducation = {
  1: {
    operation: 'Calcinatio (Fire 1)',
    process: 'Vector: Intelligence → Experience',
    description: 'The alchemical fire of self-awareness. Burning away false identities to reveal your essential nature. The first spark of consciousness recognizing itself.',
    practices: ['Mirror work: "Who am I beyond my stories?"', 'Physical movement to embody presence', 'Courage practices: facing fear directly'],
    keywords: ['Identity', 'Initiation', 'Raw Experience', 'Self-Awareness'],
  },
  5: {
    operation: 'Calcinatio (Fire 2)',
    process: 'Circle: Intention → Expression',
    description: 'Sustained creative fire. The joy of making something from nothing. Your unique gifts burning bright in sustained expression.',
    practices: ['Daily creative practice (art, music, writing)', 'Play without purpose', 'Sharing your authentic joy'],
    keywords: ['Creativity', 'Joy', 'Self-Expression', 'Artistry'],
  },
  9: {
    operation: 'Calcinatio (Fire 3)',
    process: 'Spiral: Goal → Expansion',
    description: 'Philosophical fire reaching toward ultimate meaning. The quest for truth beyond cultural conditioning. Visionary wisdom burning through limitation.',
    practices: ['Study wisdom traditions', 'Travel (physical or mental)', 'Teaching what you know'],
    keywords: ['Philosophy', 'Meaning', 'Vision', 'Higher Learning'],
  },
  4: {
    operation: 'Solutio (Water 1)',
    process: 'Vector: Intelligence → Heart',
    description: 'Dissolution into emotional roots. The waters of home and family washing through your foundation. Feeling the ancestral currents.',
    practices: ['Ancestral healing work', 'Create sacred space at home', 'Emotional archaeology'],
    keywords: ['Home', 'Roots', 'Foundation', 'Emotional Safety'],
  },
  8: {
    operation: 'Solutio (Water 2)',
    process: 'Circle: Intention → Healing',
    description: 'Deep transformation through dissolution. Death and rebirth cycles. Shadow integration. Merging boundaries in intimacy and shared resources.',
    practices: ['Shadow work journaling', 'Tantric practices', 'Energy healing', 'Facing death consciously'],
    keywords: ['Transformation', 'Death/Rebirth', 'Shadow', 'Intimacy', 'Power'],
  },
  12: {
    operation: 'Solutio (Water 3)',
    process: 'Spiral: Goal → Holiness',
    description: 'Total dissolution into oneness. Spiritual surrender. The mystic waters where ego boundaries disappear into universal consciousness.',
    practices: ['Meditation retreats', 'Solitude practices', 'Dream work', 'Compassionate service'],
    keywords: ['Transcendence', 'Spirituality', 'Dissolution', 'Unity'],
  },
  10: {
    operation: 'Coagulatio (Earth 1)',
    process: 'Vector: Intelligence → Mission',
    description: 'Crystallizing purpose into public form. Your mission made manifest. Building legacy through disciplined structure.',
    practices: ['Define your life\'s work', 'Build sustainable systems', 'Lead with integrity'],
    keywords: ['Career', 'Mission', 'Legacy', 'Public Identity'],
  },
  2: {
    operation: 'Coagulatio (Earth 2)',
    process: 'Circle: Intention → Means',
    description: 'Grounding resources and values. What you build, keep, and value. Material stability through sustained effort.',
    practices: ['Financial planning', 'Define your values', 'Cultivate gratitude'],
    keywords: ['Resources', 'Values', 'Stability', 'Self-Worth'],
  },
  6: {
    operation: 'Coagulatio (Earth 3)',
    process: 'Spiral: Goal → Medicine',
    description: 'Refining daily practice into healing. Service through perfected craft. Your medicine made through disciplined devotion.',
    practices: ['Daily ritual/routine', 'Health optimization', 'Skillful service'],
    keywords: ['Service', 'Health', 'Daily Practice', 'Refinement'],
  },
  7: {
    operation: 'Sublimatio (Air 1)',
    process: 'Vector: Intelligence → Connection',
    description: 'Rising through relationship. The other as mirror. Elevating consciousness through partnership and encounter.',
    practices: ['Conscious relationship', 'Mirror work with partners', 'Seek balance'],
    keywords: ['Partnership', 'Balance', 'Projection', 'The Other'],
  },
  11: {
    operation: 'Sublimatio (Air 2)',
    process: 'Circle: Intention → Community',
    description: 'Collective elevation. Your role in the greater web. Future visions made real through group consciousness.',
    practices: ['Join intentional community', 'Network with vision', 'Future planning'],
    keywords: ['Community', 'Friendship', 'Collective', 'Future Vision'],
  },
  3: {
    operation: 'Sublimatio (Air 3)',
    process: 'Spiral: Goal → Consciousness',
    description: 'Pure thought ascending. Communication perfected. Mind recognizing its own patterns and transcending them.',
    practices: ['Write daily', 'Study systems thinking', 'Teach what you learn'],
    keywords: ['Communication', 'Learning', 'Mind', 'Connection'],
  },
} as const;

// Neuroscience Integration: Brain-Consciousness-Element Mapping
const houseStates = {
  // FIRE - Right Prefrontal Cortex (Vision & Projection)
  1: { symbol: '🔥', phase: 'Experience', brain: 'Right PFC' },      // Aries - Identity
  5: { symbol: '🔥', phase: 'Expression', brain: 'Right PFC' },      // Leo - Creativity
  9: { symbol: '🔥', phase: 'Expansion', brain: 'Right PFC' },       // Sagittarius - Philosophy

  // WATER - Right Hemisphere (Deep Introspection)
  4: { symbol: '💧', phase: 'Heart', brain: 'Right Hemisphere' },    // Cancer - Home
  8: { symbol: '💧', phase: 'Healing', brain: 'Right Hemisphere' },  // Scorpio - Transformation
  12: { symbol: '💧', phase: 'Holiness', brain: 'Right Hemisphere' }, // Pisces - Transcendence

  // EARTH - Left Hemisphere (Grounded Creativity)
  10: { symbol: '🌍', phase: 'Mission', brain: 'Left Hemisphere' },  // Capricorn - Career
  2: { symbol: '🌍', phase: 'Means', brain: 'Left Hemisphere' },     // Taurus - Resources
  6: { symbol: '🌍', phase: 'Medicine', brain: 'Left Hemisphere' },  // Virgo - Service

  // AIR - Left Prefrontal Cortex (Communication)
  7: { symbol: '💨', phase: 'Connection', brain: 'Left PFC' },       // Libra - Partnership
  11: { symbol: '💨', phase: 'Community', brain: 'Left PFC' },       // Aquarius - Vision
  3: { symbol: '💨', phase: 'Consciousness', brain: 'Left PFC' },    // Gemini - Communication
};

// Elemental colors
const elementalColors = {
  fire: { day: '#C85450', night: '#F5A362', glow: 'rgba(200, 84, 80, 0.4)' },      // Red/Orange
  water: { day: '#6B9BD1', night: '#8BADD6', glow: 'rgba(107, 155, 209, 0.4)' },   // Blue
  earth: { day: '#7A9A65', night: '#A8C69F', glow: 'rgba(122, 154, 101, 0.4)' },   // Green
  air: { day: '#E4C247', night: '#F5D565', glow: 'rgba(228, 194, 71, 0.4)' },      // Yellow
};

// Aspect geometry (angles in degrees)
const aspectAngles = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

// Aspect colors for sacred geometry
const aspectColors = {
  conjunction: '#F59E0B',  // Amber - union
  sextile: '#10B981',      // Green - harmony
  square: '#EF4444',       // Red - tension
  trine: '#3B82F6',        // Blue - flow
  opposition: '#8B5CF6',   // Purple - polarity
};

export function SacredHouseWheel({
  planets = [],
  aspects = [],
  isDayMode = true,
  showAspects = false,
  className = '',
  layoutMode = 'spiralogic',
  missions = [],
  missionLayerSettings = {
    showEmerging: true,
    showActive: true,
    showCompleted: true,
    showUrgent: true,
    showArchetypal: true,
    showTransits: false,
  },
  transits = [],
  transitAspects = [],
}: SacredHouseWheelProps) {
  // Select house order based on layout mode
  const houseOrder = layoutMode === 'traditional' ? traditionalOrder : spiralogicOrder;
  const [hoveredHouse, setHoveredHouse] = useState<number | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);
  const [clickedPlanet, setClickedPlanet] = useState<Planet | null>(null);
  const [clickedHouse, setClickedHouse] = useState<number | null>(null);
  const [deepDiveHouse, setDeepDiveHouse] = useState<number | null>(null);
  const [clickedMission, setClickedMission] = useState<Mission | null>(null);
  const [hoveredTransit, setHoveredTransit] = useState<Transit | null>(null);
  const [clickedTransit, setClickedTransit] = useState<Transit | null>(null);
  const [revealedAspects, setRevealedAspects] = useState(false);
  const [showSacredGeometry, setShowSacredGeometry] = useState(true); // Fremen alchemist mode
  const [showNodalAxisPanel, setShowNodalAxisPanel] = useState(false); // Destiny Path insight
  const [showPatternsPanel, setShowPatternsPanel] = useState(false); // Aspect Patterns insight
  const [selectedPattern, setSelectedPattern] = useState<AspectPattern | null>(null);

  // Detect aspect patterns from natal chart
  const detectedPatterns = (() => {
    if (!planets || planets.length === 0 || !aspects || aspects.length === 0) return [];

    // Convert to pattern detector types (add longitude if not present)
    const patternPlanets: PatternPlanet[] = planets.map(p => ({
      name: p.name,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
      longitude: p.degree + (spiralogicOrder.indexOf(p.house) * 30), // Approximate longitude
    }));

    // Add quincunx support if not in aspects (pattern detector needs it)
    const patternAspects: PatternAspect[] = aspects.map(a => ({
      planet1: a.planet1,
      planet2: a.planet2,
      type: a.type as PatternAspect['type'],
      orb: a.orb,
    }));

    return detectAllPatterns(patternAspects, patternPlanets);
  })();

  // Wheel is fixed - no rotation (consciousness states are stable)

  // Calculate position on wheel for a given house (1-12)
  // Uses selected layout order for positioning
  const getHousePosition = (house: number) => {
    // Find position in house order
    const spiralIndex = houseOrder.indexOf(house);
    // Start at top (12 o'clock) and go clockwise
    const angle = (spiralIndex * 30 - 90) * (Math.PI / 180);
    const radius = 140;
    return {
      x: 200 + radius * Math.cos(angle),
      y: 200 + radius * Math.sin(angle),
    };
  };

  // Calculate planet positions with collision detection and spacing
  // Uses Spiralogic spiral order for positioning with anti-overlap intelligence
  const getPlanetPositions = (planetsArray: Planet[]) => {
    if (!planetsArray || planetsArray.length === 0) return {};

    const minAngularSeparation = 8; // Increased to 8 degrees for better visual separation
    const positions: { [key: string]: { x: number; y: number; adjustedAngle: number } } = {};
    const sortedPlanets = [...planetsArray].sort((a, b) => {
      // Sort by house first, then by degree within house
      const aSpiral = houseOrder.indexOf(a.house);
      const bSpiral = houseOrder.indexOf(b.house);
      if (aSpiral !== bSpiral) return aSpiral - bSpiral;
      return (a.degree % 30) - (b.degree % 30);
    });

    const occupiedAngles: number[] = [];

    sortedPlanets.forEach((planet) => {
      // Find house position in selected layout order
      const spiralIndex = houseOrder.indexOf(planet.house);
      const houseStartAngle = spiralIndex * 30;
      const idealAngle = (houseStartAngle + (planet.degree % 30)) - 90;

      // Check for collisions with already placed planets
      let adjustedAngle = idealAngle;
      let attempts = 0;
      const maxAttempts = 50; // Increased attempts for better placement

      while (attempts < maxAttempts) {
        const collision = occupiedAngles.some(occupiedAngle => {
          const angleDiff = Math.abs(adjustedAngle - occupiedAngle);
          const normalizedDiff = Math.min(angleDiff, 360 - angleDiff);
          return normalizedDiff < minAngularSeparation;
        });

        if (!collision) {
          break;
        }

        // If collision detected, try adjusting the angle
        // Use smaller increments for smoother adjustment
        const increment = minAngularSeparation / 2;
        const offset = Math.ceil(attempts / 2) * increment * (attempts % 2 === 0 ? 1 : -1);
        adjustedAngle = idealAngle + offset;

        // Normalize angle to 0-360 range
        while (adjustedAngle < 0) adjustedAngle += 360;
        while (adjustedAngle >= 360) adjustedAngle -= 360;

        // If we've exhausted house boundaries, allow cross-house placement with reduced range
        if (attempts > 30) {
          // Allow placement anywhere within adjacent houses if necessary
          const maxSearchRange = 60; // Can search 60 degrees around ideal position
          const searchAngle = (idealAngle + (attempts - 30) * increment * (attempts % 2 === 0 ? 1 : -1)) % 360;
          if (searchAngle >= 0 && searchAngle < 360) {
            adjustedAngle = searchAngle;
          }
        }

        attempts++;
      }

      occupiedAngles.push(adjustedAngle);

      const angle = adjustedAngle * (Math.PI / 180);
      const radius = 120;

      positions[planet.name] = {
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        adjustedAngle
      };
    });

    return positions;
  };

  // Legacy function for backward compatibility - now uses the new collision detection
  const getPlanetPosition = (planet: Planet) => {
    const positions = getPlanetPositions(planets || []);
    return positions[planet.name] || {
      x: 200,
      y: 200,
      adjustedAngle: 0
    };
  };

  // Calculate all planet positions with collision detection for optimal performance
  const planetPositions = getPlanetPositions(planets);

  // Calculate transit positions on outer ring (radius 145)
  // Uses direct ecliptic longitude (not spiralogic house order)
  const getTransitPositions = (transitsArray: Transit[]) => {
    const positions: { [key: string]: { x: number; y: number; angle: number } } = {};
    const occupiedAngles: number[] = [];
    const transitRadius = 145; // Outer ring beyond natal planets (120)

    transitsArray.forEach((transit) => {
      // Convert ecliptic longitude to wheel angle
      // 0° Aries = top of wheel, proceeding counterclockwise
      let angle = (transit.longitude - 90); // Adjust so 0° is at top
      angle = ((angle % 360) + 360) % 360; // Normalize to 0-360

      // Simple collision detection for transits
      let finalAngle = angle;
      const minSpacing = 12;
      for (const occupied of occupiedAngles) {
        const diff = Math.abs(finalAngle - occupied);
        if (diff < minSpacing || diff > (360 - minSpacing)) {
          finalAngle = (finalAngle + minSpacing) % 360;
        }
      }
      occupiedAngles.push(finalAngle);

      const angleRad = finalAngle * (Math.PI / 180);
      positions[transit.planet] = {
        x: 200 + transitRadius * Math.cos(angleRad),
        y: 200 + transitRadius * Math.sin(angleRad),
        angle: finalAngle,
      };
    });

    return positions;
  };

  const transitPositions = getTransitPositions(transits);

  // FIELD DYNAMICS 4: Draw aspect as field current through Aether center
  // All currents converge on the unmoved witness (nothing orbits, everything passes through)
  const drawAspectLine = (planet1: Planet, planet2: Planet, aspect: Aspect) => {
    const pos1 = planetPositions[planet1.name] || { x: 200, y: 200 };
    const pos2 = planetPositions[planet2.name] || { x: 200, y: 200 };
    const center = { x: 200, y: 200 }; // Aether node

    // Create Bezier path through center
    const controlX = center.x + (Math.random() - 0.5) * 10; // Slight variation
    const controlY = center.y + (Math.random() - 0.5) * 10;

    const pathData = `M ${pos1.x},${pos1.y} Q ${controlX},${controlY} ${center.x},${center.y} T ${pos2.x},${pos2.y}`;

    return (
      <motion.path
        key={`${planet1.name}-${planet2.name}`}
        d={pathData}
        fill="none"
        stroke={aspectColors[aspect.type]}
        strokeWidth={aspect.orb < 2 ? 2 : 1}
        strokeOpacity={aspect.orb < 2 ? 0.6 : 0.3}
        strokeDasharray={aspect.type === 'square' ? '4,4' : aspect.type === 'opposition' ? '8,4' : '0'}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      />
    );
  };

  return (
    <div className={`relative ${className}`} style={{ minHeight: '1280px' }}>
      {/* Central holoflower overlay - Sacred geometry */}
      <img
        src="/holoflower.svg"
        alt="Holoflower"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '400px',
          height: '400px',
          opacity: 0.15,
          pointerEvents: 'none',
          mixBlendMode: 'lighten',
          zIndex: 5
        }}
      />

      <svg
        width="1280"
        height="1280"
        viewBox="-80 -80 560 560"
        className="w-full h-full"
        style={{ pointerEvents: 'auto' }}
        onMouseEnter={() => setRevealedAspects(true)}
        onMouseLeave={() => setRevealedAspects(false)}
      >
        {/* Outer wheel circle */}
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke={isDayMode ? '#e7e5e4' : '#292524'}
          strokeWidth="1"
          opacity="0.3"
        />

        {/* Inner wheel circle */}
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke={isDayMode ? '#e7e5e4' : '#292524'}
          strokeWidth="1"
          opacity="0.2"
        />

        {/* FIELD DYNAMICS 1: Outer Rim Elemental Current */}
        {/* Subtle aurora-like gradient sweep showing Fire→Water→Earth→Air flow */}
        <defs>
          <linearGradient id="elementalCurrent" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={elementalColors.fire.night} stopOpacity="0.08" />
            <stop offset="25%" stopColor={elementalColors.water.night} stopOpacity="0.08" />
            <stop offset="50%" stopColor={elementalColors.earth.night} stopOpacity="0.08" />
            <stop offset="75%" stopColor={elementalColors.air.night} stopOpacity="0.08" />
            <stop offset="100%" stopColor={elementalColors.fire.night} stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <motion.circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="url(#elementalCurrent)"
          strokeWidth="2"
          strokeDasharray="10 5"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: -1000 }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear',
          }}
          opacity="0.25"
        />

        {/* FIELD DYNAMICS 2: Spiral Swirling from Aether Center */}
        {/* Golden ratio logarithmic spiral emanating from center */}
        <motion.path
          d={(() => {
            // Generate logarithmic spiral path (golden ratio)
            const points: string[] = [];
            const a = 1; // Starting radius
            const b = 0.306; // Growth rate (golden ratio spiral)
            const center = { x: 200, y: 200 };

            for (let theta = 0; theta < 6 * Math.PI; theta += 0.15) {
              const r = a * Math.exp(b * theta);
              const x = center.x + r * Math.cos(theta);
              const y = center.y + r * Math.sin(theta);
              points.push(theta === 0 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#9B8FAA' : '#8B5CF6'}
          strokeWidth="0.8"
          opacity="0.15"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Secondary counter-rotating spiral */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const a = 1;
            const b = 0.306;
            const center = { x: 200, y: 200 };

            for (let theta = 0; theta < 6 * Math.PI; theta += 0.15) {
              const r = a * Math.exp(b * theta);
              // Negative theta for counter-rotation
              const x = center.x + r * Math.cos(-theta);
              const y = center.y + r * Math.sin(-theta);
              points.push(theta === 0 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#C85450' : '#F5A362'}
          strokeWidth="1"
          opacity="0.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.3, 0]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />

        {/* SPIRAL COLLECTION - Multiple Sacred Spirals */}

        {/* Fibonacci Spiral (Natural Growth Pattern) */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const center = { x: 200, y: 200 };
            const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
            let currentAngle = 0;

            for (let i = 0; i < fib.length; i++) {
              const radius = fib[i] * 1.2;
              const startAngle = currentAngle * (Math.PI / 180);
              const endAngle = (currentAngle + 90) * (Math.PI / 180);

              // Draw quarter circle arc
              const startX = center.x + radius * Math.cos(startAngle);
              const startY = center.y + radius * Math.sin(startAngle);
              const endX = center.x + radius * Math.cos(endAngle);
              const endY = center.y + radius * Math.sin(endAngle);

              if (i === 0) {
                points.push(`M ${startX},${startY}`);
              }
              points.push(`A ${radius},${radius} 0 0 1 ${endX},${endY}`);

              currentAngle += 90;
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#7A9A65' : '#A8C69F'}
          strokeWidth="1.2"
          opacity="0.15"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.25, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 4,
          }}
        />

        {/* Archimedean Spiral (Uniform Expansion) */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const center = { x: 200, y: 200 };
            const a = 0.5; // Starting distance from center
            const b = 3; // Growth rate per revolution

            for (let theta = 0; theta < 8 * Math.PI; theta += 0.12) {
              const r = a + b * theta;
              const x = center.x + r * Math.cos(theta);
              const y = center.y + r * Math.sin(theta);
              points.push(theta === 0 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#6B9BD1' : '#8BADD6'}
          strokeWidth="0.8"
          opacity="0.12"
          strokeLinecap="round"
          strokeDasharray="3,3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.2, 0]
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: 'linear',
            delay: 6,
          }}
        />

        {/* Hyperbolic Spiral (Infinite Approach - inward) */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const center = { x: 200, y: 200 };
            const a = 50; // Starting radius

            for (let theta = 0.5; theta < 10 * Math.PI; theta += 0.15) {
              const r = a / theta; // Inverse relationship
              const x = center.x + r * Math.cos(theta);
              const y = center.y + r * Math.sin(theta);
              points.push(theta === 0.5 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#D4B896' : '#E8D4BF'}
          strokeWidth="0.6"
          opacity="0.1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.18, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 8,
          }}
        />

        {/* Fermat's Spiral (Parabolic - sunflower pattern foundation) */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const center = { x: 200, y: 200 };
            const a = 8; // Growth constant

            for (let theta = 0; theta < 6 * Math.PI; theta += 0.1) {
              const r = a * Math.sqrt(theta);
              const x = center.x + r * Math.cos(theta);
              const y = center.y + r * Math.sin(theta);
              points.push(theta === 0 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.7"
          opacity="0.08"
          strokeLinecap="round"
          strokeDasharray="2,4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.15, 0]
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 10,
          }}
        />

        {/* Lituus Spiral (1/sqrt - rapid inward approach) */}
        <motion.path
          d={(() => {
            const points: string[] = [];
            const center = { x: 200, y: 200 };
            const a = 80; // Scaling constant

            for (let theta = 0.5; theta < 8 * Math.PI; theta += 0.12) {
              const r = a / Math.sqrt(theta);
              const x = center.x + r * Math.cos(theta);
              const y = center.y + r * Math.sin(theta);
              points.push(theta === 0.5 ? `M ${x},${y}` : `L ${x},${y}`);
            }

            return points.join(' ');
          })()}
          fill="none"
          stroke={isDayMode ? '#9B8FAA' : '#C8A8E0'}
          strokeWidth="0.5"
          opacity="0.1"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 0],
            opacity: [0, 0.16, 0]
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 12,
          }}
        />

        {/* SACRED GEOMETRY LAYER - Fremen Alchemist's Cosmology */}
        {showSacredGeometry && (
          <g opacity="0.7">
            {/* TORUS FUNNEL - Consciousness Vortex (Elemental Alchemy book cover inspired) */}
            <g>
              {/* Top funnel (golden/fire - descending) - ENHANCED for book cover glow */}
              <defs>
                <radialGradient id="topFunnelGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#F5A362" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#C8A572" stopOpacity="0.2" />
                </radialGradient>
                <radialGradient id="bottomFunnelGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
                  <stop offset="50%" stopColor="#6B9BD1" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8BADD6" stopOpacity="0.2" />
                </radialGradient>
                {/* Outer glow for cosmic dragonfly effect */}
                <radialGradient id="torusGlowGradient" cx="50%" cy="50%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.1" />
                  <stop offset="40%" stopColor="#F5A362" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#8B5CF6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6B9BD1" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Outer luminous glow - cosmic dragonfly aura */}
              <motion.circle
                cx="200"
                cy="200"
                r="160"
                fill="url(#torusGlowGradient)"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{
                  scale: [0.9, 1.1, 0.9],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '200px 200px' }}
              />

              {/* Radial grid lines emanating from center - top funnel */}
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15) * (Math.PI / 180);
                const innerRadius = 0;
                const outerRadius = 70;
                const x1 = 200 + innerRadius * Math.cos(angle);
                const y1 = 200 + innerRadius * Math.sin(angle);
                const x2 = 200 + outerRadius * Math.cos(angle);
                const y2 = 200 + outerRadius * Math.sin(angle);

                return (
                  <motion.line
                    key={`radial-top-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#F5A362"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: [0, 1, 0],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.1,
                    }}
                  />
                );
              })}

              {/* Radial grid lines emanating from center - bottom funnel */}
              {[...Array(24)].map((_, i) => {
                const angle = (i * 15) * (Math.PI / 180);
                const innerRadius = 0;
                const outerRadius = 70;
                const x1 = 200 + innerRadius * Math.cos(angle);
                const y1 = 200 + innerRadius * Math.sin(angle);
                const x2 = 200 + outerRadius * Math.cos(angle);
                const y2 = 200 + outerRadius * Math.sin(angle);

                return (
                  <motion.line
                    key={`radial-bottom-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#8B5CF6"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{
                      pathLength: [0, 1, 0],
                      opacity: [0, 0.8, 0]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.12,
                    }}
                  />
                );
              })}

              {/* Concentric circles showing torus rings - ENHANCED */}
              {[15, 25, 35, 50, 65].map((radius, i) => (
                <motion.circle
                  key={`torus-ring-${i}`}
                  cx="200"
                  cy="200"
                  r={radius}
                  fill="none"
                  stroke={i < 3 ? "#F5A362" : "#8B5CF6"}
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                  strokeDasharray="2,3"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{
                    scale: [0.9, 1.1, 0.9],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 6 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.5,
                  }}
                  style={{ transformOrigin: '200px 200px' }}
                />
              ))}

              {/* Top funnel ellipse (perspective view) - ENHANCED glow */}
              <motion.ellipse
                cx="200"
                cy="200"
                rx="70"
                ry="25"
                fill="url(#topFunnelGradient)"
                stroke="#F5A362"
                strokeWidth="1.2"
                strokeOpacity="0.5"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.05, 0.8],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ transformOrigin: '200px 200px', filter: 'blur(1px)' }}
              />

              {/* Bottom funnel ellipse (perspective view) - ENHANCED glow */}
              <motion.ellipse
                cx="200"
                cy="200"
                rx="70"
                ry="25"
                fill="url(#bottomFunnelGradient)"
                stroke="#8B5CF6"
                strokeWidth="1.2"
                strokeOpacity="0.45"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: [0.8, 1.08, 0.8],
                  opacity: [0.35, 0.65, 0.35]
                }}
                transition={{
                  duration: 9,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1,
                }}
                style={{ transformOrigin: '200px 200px', filter: 'blur(1px)' }}
              />

              {/* Center portal (the throat of the torus) - ENHANCED golden glow */}
              <motion.circle
                cx="200"
                cy="200"
                r="12"
                fill="#D4AF37"
                fillOpacity="0.2"
                stroke="#D4AF37"
                strokeWidth="2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{ filter: 'blur(0.5px)' }}
              />
              {/* Inner bright core */}
              <motion.circle
                cx="200"
                cy="200"
                r="4"
                fill="#D4AF37"
                animate={{
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </g>

            {/* DODECAHEDRON - The Soul's Geometry (5th element, Aether) */}
            {/* 2D projection of dodecahedron embracing the holoflower */}
            <g>
              {/* Outer pentagon */}
              <motion.polygon
                points={[...Array(5)].map((_, i) => {
                  const angle = (i * 72 - 90) * (Math.PI / 180);
                  const x = 200 + 45 * Math.cos(angle);
                  const y = 200 + 45 * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.5 }}
                transition={{ duration: 2, ease: 'easeOut' }}
                style={{ transformOrigin: '200px 200px' }}
              />

              {/* Inner pentagon (rotated) */}
              <motion.polygon
                points={[...Array(5)].map((_, i) => {
                  const angle = (i * 72 - 90 + 36) * (Math.PI / 180); // 36° rotation
                  const x = 200 + 30 * Math.cos(angle);
                  const y = 200 + 30 * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1.2"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                transition={{ duration: 2, delay: 0.2, ease: 'easeOut' }}
                style={{ transformOrigin: '200px 200px' }}
              />

              {/* Connecting lines showing 3D depth */}
              {[...Array(5)].map((_, i) => {
                const angle1 = (i * 72 - 90) * (Math.PI / 180);
                const angle2 = (i * 72 - 90 + 36) * (Math.PI / 180);
                const x1 = 200 + 45 * Math.cos(angle1);
                const y1 = 200 + 45 * Math.sin(angle1);
                const x2 = 200 + 30 * Math.cos(angle2);
                const y2 = 200 + 30 * Math.sin(angle2);
                return (
                  <motion.line
                    key={`dodeca-${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#D4AF37"
                    strokeWidth="0.8"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    transition={{ duration: 1.5, delay: 0.4 + i * 0.1 }}
                  />
                );
              })}

              {/* Center star (pentagram showing quintessence) */}
              <motion.path
                d={(() => {
                  const points = [...Array(5)].map((_, i) => {
                    const angle = (i * 144 - 90) * (Math.PI / 180); // 144° for pentagram
                    const x = 200 + 20 * Math.cos(angle);
                    const y = 200 + 20 * Math.sin(angle);
                    return `${x},${y}`;
                  });
                  return `M ${points[0]} L ${points[1]} L ${points[2]} L ${points[3]} L ${points[4]} Z`;
                })()}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.1, 1],
                  opacity: [0, 0.6, 0.45]
                }}
                transition={{ duration: 2, delay: 0.8 }}
                style={{ transformOrigin: '200px 200px' }}
              />
            </g>

            {/* Seed of Life - 7 circles at center (source pattern) */}
            <circle cx="200" cy="200" r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
            {[...Array(6)].map((_, i) => {
              const angle = (i * 60) * (Math.PI / 180);
              const x = 200 + 15 * Math.cos(angle);
              const y = 200 + 15 * Math.sin(angle);
              return (
                <circle key={`seed-${i}`} cx={x} cy={y} r="15" fill="none" stroke="#D4AF37" strokeWidth="0.5" />
              );
            })}

            {/* Nested Polygons - Harmonic Divisions */}
            {/* Dodecagon (12) - outer */}
            <motion.polygon
              points={[...Array(12)].map((_, i) => {
                const angle = (i * 30 - 90) * (Math.PI / 180);
                const x = 200 + 155 * Math.cos(angle);
                const y = 200 + 155 * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray="4,4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 2 }}
            />

            {/* Hexagon (6) - mid */}
            <motion.polygon
              points={[...Array(6)].map((_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180);
                const x = 200 + 130 * Math.cos(angle);
                const y = 200 + 130 * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray="3,3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.25 }}
              transition={{ duration: 2, delay: 0.3 }}
            />

            {/* Square (4) - inner */}
            <motion.polygon
              points={[...Array(4)].map((_, i) => {
                const angle = (i * 90 - 45) * (Math.PI / 180);
                const x = 200 + 90 * Math.cos(angle);
                const y = 200 + 90 * Math.sin(angle);
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1"
              strokeDasharray="2,2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ duration: 2, delay: 0.6 }}
            />

            {/* Upward Triangle (3) - core */}
            <motion.polygon
              points="200,140 230,180 170,180"
              fill="none"
              stroke="#D4AF37"
              strokeWidth="1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              transition={{ duration: 2, delay: 0.9 }}
            />

            {/* Metatron's Cube - Connecting all 12 house centers */}
            {houseOrder.map((house1, i) => {
              const pos1 = getHousePosition(house1);
              return houseOrder.slice(i + 1).map((house2, j) => {
                const pos2 = getHousePosition(house2);
                return (
                  <line
                    key={`metatron-${house1}-${house2}`}
                    x1={pos1.x}
                    y1={pos1.y}
                    x2={pos2.x}
                    y2={pos2.y}
                    stroke="#D4AF37"
                    strokeWidth="0.3"
                    opacity="0.15"
                  />
                );
              });
            })}

            {/* Elemental Trigrams - Perfect triangles connecting same-element houses */}
            {/* Fire Triangle (Houses 1, 5, 9) */}
            <motion.polygon
              points={[1, 5, 9].map(h => {
                const pos = getHousePosition(h);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke={elementalColors.fire.night}
              strokeWidth="1.5"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, delay: 1 }}
            />

            {/* Water Triangle (Houses 4, 8, 12) */}
            <motion.polygon
              points={[4, 8, 12].map(h => {
                const pos = getHousePosition(h);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke={elementalColors.water.night}
              strokeWidth="1.5"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, delay: 1.3 }}
            />

            {/* Earth Triangle (Houses 10, 2, 6) - LEFT HEMISPHERE WITH LINE */}
            <motion.polygon
              points={[10, 2, 6].map(h => {
                const pos = getHousePosition(h);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke={elementalColors.earth.night}
              strokeWidth="1.5"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, delay: 1.6 }}
            />
            {/* Horizontal line through Earth triangle (left hemisphere marker) */}
            <motion.line
              x1={(() => {
                const pos2 = getHousePosition(2);
                const pos6 = getHousePosition(6);
                return (pos2.x + pos6.x) / 2;
              })()}
              y1={(() => {
                const pos2 = getHousePosition(2);
                const pos6 = getHousePosition(6);
                return (pos2.y + pos6.y) / 2;
              })()}
              x2={getHousePosition(10).x}
              y2={getHousePosition(10).y}
              stroke={elementalColors.earth.night}
              strokeWidth="2"
              strokeDasharray=""
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, delay: 2 }}
            />

            {/* Air Triangle (Houses 7, 11, 3) - LEFT HEMISPHERE WITH LINE */}
            <motion.polygon
              points={[7, 11, 3].map(h => {
                const pos = getHousePosition(h);
                return `${pos.x},${pos.y}`;
              }).join(' ')}
              fill="none"
              stroke={elementalColors.air.night}
              strokeWidth="1.5"
              strokeDasharray="5,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.4 }}
              transition={{ duration: 3, delay: 1.9 }}
            />
            {/* Horizontal line through Air triangle (left hemisphere marker) */}
            <motion.line
              x1={(() => {
                const pos7 = getHousePosition(7);
                const pos11 = getHousePosition(11);
                return (pos7.x + pos11.x) / 2;
              })()}
              y1={(() => {
                const pos7 = getHousePosition(7);
                const pos11 = getHousePosition(11);
                return (pos7.y + pos11.y) / 2;
              })()}
              x2={getHousePosition(3).x}
              y2={getHousePosition(3).y}
              stroke={elementalColors.air.night}
              strokeWidth="2"
              strokeDasharray=""
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 2, delay: 2.3 }}
            />
          </g>
        )}

        {/* 12 House segments - Layout-dependent order, clockwise from top */}
        <g>
          {houseOrder.map((house, i) => {
            const element = houseElements[house as keyof typeof houseElements] as keyof typeof elementalColors;
            const elementColor = elementalColors[element];
            const color = isDayMode ? elementColor.day : elementColor.night;
            // Position i determines visual placement (0-11), house number stays as label
            const startAngle = (i * 30 - 90) * (Math.PI / 180);
            const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180);

            // Arc path for house segment
            const innerRadius = 100;
            const outerRadius = 160;
            const largeArcFlag = 0;

            const x1 = 200 + innerRadius * Math.cos(startAngle);
            const y1 = 200 + innerRadius * Math.sin(startAngle);
            const x2 = 200 + outerRadius * Math.cos(startAngle);
            const y2 = 200 + outerRadius * Math.sin(startAngle);
            const x3 = 200 + outerRadius * Math.cos(endAngle);
            const y3 = 200 + outerRadius * Math.sin(endAngle);
            const x4 = 200 + innerRadius * Math.cos(endAngle);
            const y4 = 200 + innerRadius * Math.sin(endAngle);

            const pathData = `
              M ${x1} ${y1}
              L ${x2} ${y2}
              A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
              L ${x4} ${y4}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}
              Z
            `;

            // Wider hover zone path - extends as far as possible toward starfield edges
            // Stops before covering outer labels like "EXPERIENCE", "EXPANSION", etc.
            const hoverInnerRadius = 60;
            const hoverOuterRadius = 235; // Extended from 160 to nearly reach frame edges
            const hx1 = 200 + hoverInnerRadius * Math.cos(startAngle);
            const hy1 = 200 + hoverInnerRadius * Math.sin(startAngle);
            const hx2 = 200 + hoverOuterRadius * Math.cos(startAngle);
            const hy2 = 200 + hoverOuterRadius * Math.sin(startAngle);
            const hx3 = 200 + hoverOuterRadius * Math.cos(endAngle);
            const hy3 = 200 + hoverOuterRadius * Math.sin(endAngle);
            const hx4 = 200 + hoverInnerRadius * Math.cos(endAngle);
            const hy4 = 200 + hoverInnerRadius * Math.sin(endAngle);

            const hoverPathData = `
              M ${hx1} ${hy1}
              L ${hx2} ${hy2}
              A ${hoverOuterRadius} ${hoverOuterRadius} 0 ${largeArcFlag} 1 ${hx3} ${hy3}
              L ${hx4} ${hy4}
              A ${hoverInnerRadius} ${hoverInnerRadius} 0 ${largeArcFlag} 0 ${hx1} ${hy1}
              Z
            `;

            return (
              <g key={house}>
                {/* House segment - visual only */}
                <path
                  d={pathData}
                  fill={color}
                  fillOpacity={hoveredHouse === house ? 0.6 : 0.35}
                  stroke={color}
                  strokeWidth="2"
                  strokeOpacity={hoveredHouse === house ? 0.9 : 0.5}
                  className="pointer-events-none transition-all duration-500"
                  style={{
                    filter: hoveredHouse === house
                      ? `drop-shadow(0 0 8px ${elementColor.glow})`
                      : 'none',
                  }}
                />

                {/* Wider invisible hover zone - extends further into house for easier interaction */}
                <path
                  d={hoverPathData}
                  fill="transparent"
                  onMouseEnter={() => setHoveredHouse(house)}
                  onMouseLeave={() => setHoveredHouse(null)}
                  onClick={() => setClickedHouse(clickedHouse === house ? null : house)}
                  className="cursor-pointer"
                />

                {/* Alchemical elemental symbol at inner radius */}
                <foreignObject
                  x={200 + 85 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180)) - 12}
                  y={200 + 85 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180)) - 12}
                  width="24"
                  height="24"
                  className="pointer-events-none"
                >
                  <AlchemicalSymbol
                    element={element}
                    size={24}
                    color="#D4AF37"
                    opacity={hoveredHouse === house ? 1.0 : 0.7}
                  />
                </foreignObject>

                {/* Consciousness phase/state */}
                <text
                  x={200 + 185 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                  y={200 + 185 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fillOpacity={hoveredHouse === house ? 1.0 : 0.8}
                  fontSize="9"
                  fontWeight="600"
                  fontFamily="system-ui"
                  className="transition-all duration-500 pointer-events-none uppercase tracking-wide"
                >
                  {houseStates[house as keyof typeof houseStates].phase}
                </text>

                {/* House number at lower radius (smaller) */}
                <text
                  x={200 + 110 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                  y={200 + 110 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={color}
                  fillOpacity={hoveredHouse === house ? 0.9 : 0.6}
                  fontSize="10"
                  fontWeight="400"
                  fontFamily="serif"
                  className="transition-all duration-500 pointer-events-none"
                >
                  {house}
                </text>

                {/* FIELD DYNAMICS 3: House Resonance Cues (Element-Specific Tempos) */}
                {hoveredHouse === house && (
                  <>
                    {/* Fire: Fast flicker (kinetic) */}
                    {element === 'fire' && (
                      <motion.circle
                        cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                        cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                        r="25"
                        fill={color}
                        fillOpacity="0.15"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{
                          scale: [0.8, 1.3, 0.8],
                          opacity: [0, 0.3, 0]
                        }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}

                    {/* Water: Slow undulation (wave) */}
                    {element === 'water' && (
                      <>
                        <motion.circle
                          cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                          cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                          r="25"
                          fill={color}
                          fillOpacity="0.08"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{
                            scale: [0.9, 1.5, 0.9],
                            opacity: [0, 0.25, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                        <motion.circle
                          cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                          cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                          r="20"
                          fill={color}
                          fillOpacity="0.1"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: [0.8, 1.3, 0.8],
                            opacity: [0, 0.2, 0]
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.8
                          }}
                        />
                      </>
                    )}

                    {/* Earth: Grounded glow (steady) */}
                    {element === 'earth' && (
                      <motion.circle
                        cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                        cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                        r="22"
                        fill={color}
                        fillOpacity="0.12"
                        initial={{ scale: 1, opacity: 0.1 }}
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.25, 0.1]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      />
                    )}

                    {/* Air: Interference pattern (oscillation) */}
                    {element === 'air' && (
                      <>
                        <motion.circle
                          cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                          cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                          r="20"
                          fill={color}
                          fillOpacity="0.1"
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{
                            scale: [0.9, 1.2, 0.9],
                            opacity: [0, 0.2, 0]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                        />
                        <motion.circle
                          cx={200 + 130 * Math.cos((i * 30 + 15 - 90) * (Math.PI / 180))}
                          cy={200 + 130 * Math.sin((i * 30 + 15 - 90) * (Math.PI / 180))}
                          r="25"
                          fill={color}
                          fillOpacity="0.08"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{
                            scale: [0.8, 1.3, 0.8],
                            opacity: [0, 0.15, 0]
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: 0.6
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>

        {/* Aspect lines - sacred geometry revealed on hover or when showAspects is true */}
        {(showAspects || revealedAspects) && aspects.length > 0 && (
          <g opacity="0.6">
            {aspects.map((aspect) => {
              const planet1 = planets.find(p => p.name === aspect.planet1);
              const planet2 = planets.find(p => p.name === aspect.planet2);
              if (planet1 && planet2) {
                return drawAspectLine(planet1, planet2, aspect);
              }
              return null;
            })}
          </g>
        )}

        {/* ASPECT PATTERNS - Sacred Geometry Configurations */}
        {detectedPatterns.length > 0 && (showAspects || revealedAspects) && (
          <g className="aspect-patterns-layer">
            {detectedPatterns.slice(0, 3).map((pattern, idx) => {
              // Get positions for pattern planets
              const patternPositions = pattern.planets
                .map(name => planetPositions[name])
                .filter(Boolean);

              if (patternPositions.length < 3) return null;

              // Pattern-specific colors
              const patternColors: Record<string, string> = {
                'grand-trine': isDayMode ? '#10B981' : '#34D399', // Green - flow
                't-square': isDayMode ? '#EF4444' : '#F87171', // Red - tension
                'grand-cross': isDayMode ? '#DC2626' : '#EF4444', // Deep red - challenge
                'yod': isDayMode ? '#8B5CF6' : '#A78BFA', // Purple - fate
                'stellium': isDayMode ? '#F59E0B' : '#FBBF24', // Amber - concentration
                'mystic-rectangle': isDayMode ? '#3B82F6' : '#60A5FA', // Blue - harmony
              };

              const color = patternColors[pattern.type] || (isDayMode ? '#6B7280' : '#9CA3AF');

              // Draw pattern shape
              const points = patternPositions.map(p => `${p.x},${p.y}`).join(' ');

              return (
                <g
                  key={`pattern-${idx}`}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPattern(pattern);
                    setShowPatternsPanel(true);
                  }}
                >
                  {/* Pattern fill */}
                  <motion.polygon
                    points={points}
                    fill={color}
                    fillOpacity={0.05 + (pattern.strength * 0.1)}
                    stroke={color}
                    strokeWidth="1"
                    strokeOpacity={0.3}
                    strokeDasharray={pattern.type === 'yod' ? '4,2' : undefined}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0.3, 0.5, 0.3],
                      fillOpacity: [0.05, 0.15, 0.05],
                    }}
                    transition={{
                      duration: 3 + idx,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />

                  {/* Pattern center indicator */}
                  {(() => {
                    const centerX = patternPositions.reduce((sum, p) => sum + p.x, 0) / patternPositions.length;
                    const centerY = patternPositions.reduce((sum, p) => sum + p.y, 0) / patternPositions.length;
                    return (
                      <motion.circle
                        cx={centerX}
                        cy={centerY}
                        r="4"
                        fill={color}
                        fillOpacity="0.6"
                        animate={{
                          r: [4, 6, 4],
                          fillOpacity: [0.6, 0.9, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                      />
                    );
                  })()}
                </g>
              );
            })}
          </g>
        )}

        {/* Patterns indicator badge (shows count when aspects revealed) */}
        {detectedPatterns.length > 0 && (showAspects || revealedAspects) && (
          <g
            className="cursor-pointer"
            onClick={() => setShowPatternsPanel(true)}
            style={{ pointerEvents: 'auto' }}
          >
            <motion.circle
              cx="360"
              cy="40"
              r="16"
              fill={isDayMode ? '#FBBF24' : '#F59E0B'}
              fillOpacity="0.9"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
            />
            <text
              x="360"
              y="44"
              textAnchor="middle"
              fontSize="11"
              fontWeight="bold"
              fill={isDayMode ? '#000' : '#000'}
            >
              {detectedPatterns.length}
            </text>
            <text
              x="360"
              y="60"
              textAnchor="middle"
              fontSize="8"
              fill={isDayMode ? '#78716C' : '#A8A29E'}
            >
              Patterns
            </text>
          </g>
        )}

        {/* NODAL AXIS - Destiny Path Layer (soul's evolutionary trajectory) */}
        {(() => {
          const northNode = planets.find(p => p.name === 'North Node');
          const southNode = planets.find(p => p.name === 'South Node');
          if (!northNode || !southNode) return null;

          const nnPos = planetPositions['North Node'] || { x: 200, y: 200 };
          const snPos = planetPositions['South Node'] || { x: 200, y: 200 };
          const center = { x: 200, y: 200 };

          // Nodal axis colors
          const northColor = isDayMode ? '#D97706' : '#F59E0B'; // Gold/amber (future)
          const southColor = isDayMode ? '#6B7280' : '#9CA3AF'; // Silver/gray (past)

          // Calculate axis angle for gradient
          const angle = Math.atan2(nnPos.y - snPos.y, nnPos.x - snPos.x) * 180 / Math.PI;
          const gradientId = `nodal-axis-gradient-${isDayMode ? 'day' : 'night'}`;

          return (
            <g
              className="nodal-axis-layer cursor-pointer"
              onClick={() => setShowNodalAxisPanel(true)}
              style={{ pointerEvents: 'auto' }}
            >
              {/* Gradient definition */}
              <defs>
                <linearGradient id={gradientId} gradientTransform={`rotate(${angle}, 0.5, 0.5)`}>
                  <stop offset="0%" stopColor={southColor} stopOpacity="0.6" />
                  <stop offset="40%" stopColor={southColor} stopOpacity="0.2" />
                  <stop offset="60%" stopColor={northColor} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={northColor} stopOpacity="0.6" />
                </linearGradient>
                {/* Animated pulse filter */}
                <filter id="nodal-glow">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer glow line */}
              <motion.line
                x1={snPos.x}
                y1={snPos.y}
                x2={nnPos.x}
                y2={nnPos.y}
                stroke={`url(#${gradientId})`}
                strokeWidth="6"
                strokeOpacity="0.15"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{
                  pathLength: 1,
                  opacity: [0.1, 0.2, 0.1]
                }}
                transition={{
                  pathLength: { duration: 1.5, ease: 'easeOut' },
                  opacity: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                }}
              />

              {/* Core axis line */}
              <motion.line
                x1={snPos.x}
                y1={snPos.y}
                x2={nnPos.x}
                y2={nnPos.y}
                stroke={`url(#${gradientId})`}
                strokeWidth="1.5"
                strokeOpacity="0.5"
                strokeLinecap="round"
                strokeDasharray="8,4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                filter="url(#nodal-glow)"
              />

              {/* Direction indicator (small arrow toward North Node) */}
              {(() => {
                // Calculate midpoint slightly toward North Node
                const midX = center.x + (nnPos.x - center.x) * 0.3;
                const midY = center.y + (nnPos.y - center.y) * 0.3;
                const arrowAngle = Math.atan2(nnPos.y - snPos.y, nnPos.x - snPos.x);
                const arrowSize = 6;

                return (
                  <motion.polygon
                    points={`
                      ${midX + Math.cos(arrowAngle) * arrowSize},${midY + Math.sin(arrowAngle) * arrowSize}
                      ${midX + Math.cos(arrowAngle + 2.5) * arrowSize * 0.6},${midY + Math.sin(arrowAngle + 2.5) * arrowSize * 0.6}
                      ${midX + Math.cos(arrowAngle - 2.5) * arrowSize * 0.6},${midY + Math.sin(arrowAngle - 2.5) * arrowSize * 0.6}
                    `}
                    fill={northColor}
                    fillOpacity="0.6"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: [0.4, 0.7, 0.4],
                      scale: [0.9, 1.1, 0.9]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: 1.5
                    }}
                  />
                );
              })()}

              {/* Center crossing marker (Aether point) */}
              <motion.circle
                cx={center.x}
                cy={center.y}
                r="3"
                fill="none"
                stroke={isDayMode ? '#9B8FAA' : '#818CF8'}
                strokeWidth="1"
                strokeOpacity="0.4"
                initial={{ scale: 0 }}
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 2
                }}
              />
            </g>
          );
        })()}

        {/* Planets as constellation points - static (not rotating) */}
        {planets.map((planet) => {
          const pos = planetPositions[planet.name] || { x: 200, y: 200 };
          const element = houseElements[planet.house as keyof typeof houseElements] as keyof typeof elementalColors;
          const color = elementalColors[element][isDayMode ? 'day' : 'night'];
          const isHovered = hoveredPlanet?.name === planet.name;

          return (
            <g
              key={planet.name}
              onMouseEnter={() => setHoveredPlanet(planet)}
              onMouseLeave={() => setHoveredPlanet(null)}
              onClick={(e) => {
                e.stopPropagation();
                setClickedPlanet(clickedPlanet?.name === planet.name ? null : planet);
              }}
              className="cursor-pointer"
              style={{ pointerEvents: 'auto' }}
            >
              {/* Invisible larger click/hover target - increased size for better touch targets */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={20}
                fill="rgba(0,0,0,0.001)"
                className="cursor-pointer"
                style={{ pointerEvents: 'auto' }}
              />
              {/* Planet glow */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 12 : 8}
                fill={color}
                fillOpacity={isHovered ? 0.5 : 0.3}
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? [1, 1.2, 1] : [0.8, 1, 0.8] }}
                transition={{ duration: isHovered ? 1 : 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${color})` : 'none',
                }}
                className="pointer-events-none"
              />
              {/* Planet symbol background */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r={isHovered ? 12 : 10}
                fill="rgba(0,0,0,0.8)"
                stroke={color}
                strokeWidth={isHovered ? 2 : 1.5}
                strokeOpacity={isHovered ? 0.9 : 0.7}
                initial={{ scale: 0.8 }}
                animate={{ scale: isHovered ? 1.1 : 1 }}
                transition={{ duration: 0.2 }}
                className="pointer-events-none"
              />

              {/* Planet symbol */}
              <motion.text
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-sm font-bold pointer-events-none select-none"
                fill={color}
                fontSize={isHovered ? "16" : "14"}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  opacity: isHovered ? 1 : 0.9
                }}
                transition={{ duration: 0.2 }}
                style={{
                  filter: isHovered ? `drop-shadow(0 0 4px ${color})` : 'none',
                  fontFamily: 'serif'
                }}
              >
                {planet.name === 'Sun' && '☉'}
                {planet.name === 'Moon' && '☽'}
                {planet.name === 'Mercury' && '☿'}
                {planet.name === 'Venus' && '♀'}
                {planet.name === 'Mars' && '♂'}
                {planet.name === 'Jupiter' && '♃'}
                {planet.name === 'Saturn' && '♄'}
                {planet.name === 'Uranus' && '♅'}
                {planet.name === 'Neptune' && '♆'}
                {planet.name === 'Pluto' && '♇'}
                {planet.name === 'Chiron' && '⚷'}
                {planet.name === 'North Node' && '☊'}
                {planet.name === 'South Node' && '☋'}
                {/* Asteroids - Feminine Archetypes */}
                {planet.name === 'Lilith' && '⚸'}
                {planet.name === 'Ceres' && '⚳'}
                {planet.name === 'Pallas' && '⚴'}
                {planet.name === 'Juno' && '⚵'}
                {planet.name === 'Vesta' && '⚶'}
              </motion.text>
            </g>
          );
        })}

        {/* CURRENT TRANSITS LAYER - Live planetary positions */}
        {missionLayerSettings.showTransits && transits.length > 0 && (
          <g className="transit-layer">
            {/* Outer transit ring boundary - dashed to differentiate */}
            <circle
              cx="200"
              cy="200"
              r="155"
              fill="none"
              stroke={isDayMode ? '#a8a29e' : '#57534e'}
              strokeWidth="0.5"
              strokeOpacity="0.2"
              strokeDasharray="4,8"
            />

            {/* Transit planets on outer ring */}
            {transits.map((transit) => {
              const pos = transitPositions[transit.planet];
              if (!pos) return null;

              const isHovered = hoveredTransit?.planet === transit.planet;
              const isClicked = clickedTransit?.planet === transit.planet;
              const element = ['Fire', 'Earth', 'Air', 'Water'][
                ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
                  .indexOf(transit.sign) % 4
              ] as 'fire' | 'earth' | 'air' | 'water';
              const elementalColorMap = isDayMode ? elementalColors[element]?.day : elementalColors[element]?.night;
              const color = elementalColorMap || (isDayMode ? '#78716c' : '#a8a29e');

              // Check if this transit is aspecting a natal planet
              const activeAspect = transitAspects.find(a => a.transitPlanet === transit.planet);
              const isAspecting = !!activeAspect;

              return (
                <g
                  key={`transit-${transit.planet}`}
                  onMouseEnter={() => setHoveredTransit(transit)}
                  onMouseLeave={() => setHoveredTransit(null)}
                  onClick={() => setClickedTransit(isClicked ? null : transit)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Transit aspect line to natal planet */}
                  {isAspecting && activeAspect && planetPositions[activeAspect.natalPlanet] && (
                    <motion.line
                      x1={pos.x}
                      y1={pos.y}
                      x2={planetPositions[activeAspect.natalPlanet].x}
                      y2={planetPositions[activeAspect.natalPlanet].y}
                      stroke={aspectColors[activeAspect.aspectType as keyof typeof aspectColors] || '#8B5CF6'}
                      strokeWidth={activeAspect.orb < 2 ? 1.5 : 1}
                      strokeOpacity={isHovered ? 0.6 : 0.25}
                      strokeDasharray="3,3"
                      initial={{ pathLength: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: isHovered ? [0.4, 0.8, 0.4] : 0.25
                      }}
                      transition={{
                        pathLength: { duration: 0.5 },
                        opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
                      }}
                    />
                  )}

                  {/* Transit planet glow (outer) - pulsing when aspecting */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered ? 10 : 7}
                    fill={color}
                    fillOpacity={isHovered ? 0.35 : 0.15}
                    initial={{ scale: 0.8 }}
                    animate={{
                      scale: isAspecting ? [0.9, 1.1, 0.9] : (isHovered ? 1.1 : 1),
                      opacity: isAspecting ? [0.15, 0.35, 0.15] : (isHovered ? 0.35 : 0.15)
                    }}
                    transition={{
                      duration: isAspecting ? 2 : (isHovered ? 0.3 : 3),
                      repeat: isAspecting ? Infinity : 0,
                      ease: 'easeInOut'
                    }}
                    style={{
                      filter: isHovered || isAspecting ? `drop-shadow(0 0 6px ${color})` : 'none',
                    }}
                    className="pointer-events-none"
                  />

                  {/* Transit planet circle - dashed border to differentiate from natal */}
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered ? 9 : 7}
                    fill="transparent"
                    stroke={color}
                    strokeWidth={isHovered ? 1.5 : 1}
                    strokeOpacity={isHovered ? 0.8 : 0.5}
                    strokeDasharray="2,2"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.2 }}
                    className="pointer-events-auto"
                  />

                  {/* Transit planet symbol */}
                  <motion.text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-xs pointer-events-none select-none"
                    fill={color}
                    fontSize={isHovered ? '12' : '10'}
                    fillOpacity={isHovered ? 0.95 : 0.7}
                    initial={{ scale: 0.8 }}
                    animate={{ scale: isHovered ? 1.1 : 1 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      filter: isHovered ? `drop-shadow(0 0 3px ${color})` : 'none',
                      fontFamily: 'serif'
                    }}
                  >
                    {transit.planet === 'Sun' && '☉'}
                    {transit.planet === 'Moon' && '☽'}
                    {transit.planet === 'Mercury' && '☿'}
                    {transit.planet === 'Venus' && '♀'}
                    {transit.planet === 'Mars' && '♂'}
                    {transit.planet === 'Jupiter' && '♃'}
                    {transit.planet === 'Saturn' && '♄'}
                    {transit.planet === 'Uranus' && '♅'}
                    {transit.planet === 'Neptune' && '♆'}
                    {transit.planet === 'Pluto' && '♇'}
                    {transit.planet === 'Chiron' && '⚷'}
                    {transit.planet === 'North Node' && '☊'}
                    {/* Asteroids - if included in transit data */}
                    {transit.planet === 'Lilith' && '⚸'}
                    {transit.planet === 'Ceres' && '⚳'}
                    {transit.planet === 'Pallas' && '⚴'}
                    {transit.planet === 'Juno' && '⚵'}
                    {transit.planet === 'Vesta' && '⚶'}
                  </motion.text>
                </g>
              );
            })}
          </g>
        )}

        {/* Horizon line (Ascendant-Descendant) */}
        <line
          x1="40"
          y1="200"
          x2="360"
          y2="200"
          stroke={isDayMode ? '#a8a29e' : '#57534e'}
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="4,4"
        />

        {/* Meridian line (MC-IC) */}
        <line
          x1="200"
          y1="40"
          x2="200"
          y2="360"
          stroke={isDayMode ? '#a8a29e' : '#57534e'}
          strokeWidth="1"
          strokeOpacity="0.3"
          strokeDasharray="4,4"
        />

        {/* MISSION DOTS LAYER - Pulsing indicators for creative manifestations */}
        {missions.length > 0 && missions.map((mission) => {
          // Filter by mission layer settings
          const shouldShow =
            (mission.status === 'emerging' && missionLayerSettings.showEmerging) ||
            (mission.status === 'active' && missionLayerSettings.showActive) ||
            (mission.status === 'completed' && missionLayerSettings.showCompleted) ||
            (mission.status === 'urgent' && missionLayerSettings.showUrgent);

          if (!shouldShow) return null;

          // Calculate position for this mission's house
          const housePos = getHousePosition(mission.house);

          return (
            <MissionDot
              key={mission.id}
              mission={mission}
              x={housePos.x}
              y={housePos.y}
              size={3}
              onClick={() => setClickedMission(mission)}
            />
          );
        })}
      </svg>

      {/* Legend - appears on aspect reveal */}
      {(showAspects || revealedAspects) && aspects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-xs text-center space-y-1"
        >
          <p className={`${isDayMode ? 'text-stone-600' : 'text-stone-400'} font-serif italic`}>
            Sacred geometry revealed
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            {Object.entries(aspectColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1">
                <div
                  className="w-3 h-0.5"
                  style={{ background: color }}
                />
                <span className={isDayMode ? 'text-stone-600' : 'text-stone-400'}>
                  {type}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* House Insight Overlay - Smart quadrant positioning */}
      <AnimatePresence>
        {hoveredHouse !== null && (() => {
          // Calculate smart positioning based on quadrant to avoid covering dots
          const housePos = getHousePosition(hoveredHouse);
          const centerX = 200;
          const centerY = 200;

          // Determine which quadrant the hovered house is in
          const isRight = housePos.x > centerX;
          const isBottom = housePos.y > centerY;

          // Position popup in opposite quadrant
          const transformX = isRight ? '-100%' : '0%';
          const transformY = isBottom ? '-100%' : '0%';
          const leftPos = isRight ? '20%' : '80%';
          const topPos = isBottom ? '20%' : '80%';

          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute mx-auto max-w-2xl z-50"
              style={{
                pointerEvents: 'none',
                left: leftPos,
                top: topPos,
                transform: `translate(${transformX}, ${transformY})`
              }}
            >
            <div
              className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden ${
                isDayMode
                  ? 'bg-white/95 border-stone-200/60'
                  : 'bg-black/85 border-stone-700/60'
              }`}
              style={{
                boxShadow: isDayMode
                  ? '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)'
                  : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
              }}
            >
              {(() => {
                const element = houseElements[hoveredHouse as keyof typeof houseElements] as keyof typeof elementalColors;
                const elementColor = elementalColors[element];
                const color = isDayMode ? elementColor.day : elementColor.night;
                const spiralogicData = getSpiralogicHouseData(hoveredHouse);
                const planetsInHouse = planets.filter(p => p.house === hoveredHouse);
                const houseState = houseStates[hoveredHouse as keyof typeof houseStates];

                return (
                  <>
                    {/* Header with gradient */}
                    <div
                      className="px-6 py-4 border-b"
                      style={{
                        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                              boxShadow: `0 0 20px ${elementColor.glow}`,
                            }}
                          >
                            {houseState.symbol}
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${isDayMode ? 'text-stone-900' : 'text-stone-200'}`}>
                              House {hoveredHouse} · {houseState.phase}
                            </h3>
                            <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-300'}`}>
                              {element.toUpperCase()} · {spiralogicData?.stageLabel}
                            </p>
                          </div>
                        </div>
                        <div className={`text-xs uppercase tracking-wider font-medium ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                          {houseState.brain}
                        </div>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="p-6 grid grid-cols-2 gap-6">
                      {/* Left Column - Spiralogic Framework */}
                      <div className="space-y-4">
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Spiralogic Process
                          </h4>
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                              <span className="text-xs opacity-60">Element</span>
                              <div className="flex-1 border-b border-dotted opacity-20"></div>
                              <span className="text-sm font-medium" style={{ color }}>{element.toUpperCase()}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                              {/* "Stage" = the ruled display vocabulary (Finding 6);
                                  "phase" is reserved for the grammar's numeric 1/2/3 */}
                              <span className="text-xs opacity-60">Stage</span>
                              <div className="flex-1 border-b border-dotted opacity-20"></div>
                              <span className="text-sm font-medium">{spiralogicData?.stage.toUpperCase()}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                              <span className="text-xs opacity-60">Facet</span>
                              <div className="flex-1 border-b border-dotted opacity-20"></div>
                              <span className="text-sm font-medium">{spiralogicData?.facet}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Consciousness State
                          </h4>
                          <p className={`text-sm leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                            {spiralogicData?.lesson}
                          </p>
                        </div>
                      </div>

                      {/* Right Column - Planets & Activation */}
                      <div className="space-y-4">
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Neural Activation
                          </h4>
                          {planetsInHouse.length > 0 ? (
                            <div className="space-y-2">
                              {planetsInHouse.map((planet, idx) => (
                                <div
                                  key={idx}
                                  className={`px-3 py-2 rounded-lg ${isDayMode ? 'bg-stone-100/60' : 'bg-stone-800/40'}`}
                                >
                                  <div className={`text-sm font-medium ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                                    {planet.name} in {planet.sign}
                                  </div>
                                  <div className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                    {planet.degree.toFixed(1)}°
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className={`text-sm italic ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              No planets currently activating this pathway
                            </p>
                          )}
                        </div>

                        {planetsInHouse.length > 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              Integration Pathway
                            </h4>
                            <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                              {planetsInHouse.length === 1
                                ? `Single planetary activation - focused development through ${planetsInHouse[0].name} energy`
                                : `Stellium activation - ${planetsInHouse.length} archetypal forces converging in complex dialog`}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer - Process Flow Indicator */}
                    <div
                      className={`px-6 py-3 border-t text-center ${isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'}`}
                      style={{
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        <span className="opacity-60">Elemental Flow:</span>{' '}
                        <span className="font-medium">
                          {element === 'fire' && 'Experience → Expression → Expansion'}
                          {element === 'water' && 'Heart → Healing → Holiness'}
                          {element === 'earth' && 'Mission → Means → Medicine'}
                          {element === 'air' && 'Connection → Community → Consciousness'}
                        </span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
          );
        })()}

        {/* Planetary Insight Overlay - Shows planet/sign/archetype/aspects (click only) */}
        {clickedPlanet !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60"
            onClick={() => setClickedPlanet(null)}
          >
            <div
              className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden max-w-2xl w-full ${
                isDayMode
                  ? 'bg-white/95 border-stone-200/60'
                  : 'bg-black/95 border-stone-700/60'
              }`}
              style={{
                boxShadow: isDayMode
                  ? '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)'
                  : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const activePlanet = clickedPlanet;
                if (!activePlanet) return null;
                const element = houseElements[activePlanet.house as keyof typeof houseElements] as keyof typeof elementalColors;
                const elementColor = elementalColors[element];
                const color = isDayMode ? elementColor.day : elementColor.night;
                const spiralogicData = getSpiralogicHouseData(activePlanet.house);
                const planetArchetype = getPlanetaryArchetype(activePlanet.name);
                const zodiacArchetype = getZodiacArchetype(activePlanet.sign);
                const planetAspects = aspects.filter(
                  a => a.planet1 === activePlanet.name || a.planet2 === activePlanet.name
                );

                return (
                  <>
                    {/* Header with gradient */}
                    <div
                      className="px-6 py-4 border-b"
                      style={{
                        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{
                              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                              boxShadow: `0 0 20px ${elementColor.glow}`,
                            }}
                          >
                            {activePlanet.name === 'Sun' && '☉'}
                            {activePlanet.name === 'Moon' && '☽'}
                            {activePlanet.name === 'Mercury' && '☿'}
                            {activePlanet.name === 'Venus' && '♀'}
                            {activePlanet.name === 'Mars' && '♂'}
                            {activePlanet.name === 'Jupiter' && '♃'}
                            {activePlanet.name === 'Saturn' && '♄'}
                            {activePlanet.name === 'Uranus' && '♅'}
                            {activePlanet.name === 'Neptune' && '♆'}
                            {activePlanet.name === 'Pluto' && '♇'}
                            {activePlanet.name === 'Chiron' && '⚷'}
                            {activePlanet.name === 'North Node' && '☊'}
                            {activePlanet.name === 'South Node' && '☋'}
                            {/* Asteroids - Feminine Archetypes */}
                            {activePlanet.name === 'Lilith' && '⚸'}
                            {activePlanet.name === 'Ceres' && '⚳'}
                            {activePlanet.name === 'Pallas' && '⚴'}
                            {activePlanet.name === 'Juno' && '⚵'}
                            {activePlanet.name === 'Vesta' && '⚶'}
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${isDayMode ? 'text-stone-900' : 'text-stone-200'}`}>
                              {activePlanet.name} in {activePlanet.sign}
                            </h3>
                            <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-300'}`}>
                              {activePlanet.degree.toFixed(1)}° · House {activePlanet.house}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                            style={{ background: `${color}25`, color }}
                          >
                            {element}
                          </span>
                          {zodiacArchetype?.modality && (
                            <span className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wide ${
                              isDayMode ? 'bg-stone-200 text-stone-600' : 'bg-white/10 text-white/70'
                            }`}>
                              {zodiacArchetype.modality}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Content Grid */}
                    <div className="p-6 grid grid-cols-2 gap-6">
                      {/* Left Column - Planetary Archetype */}
                      <div className="space-y-4">
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Planetary Archetype
                          </h4>
                          <p className={`text-sm font-medium mb-2 ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                            {planetArchetype?.archetype || 'The Guide'}
                          </p>
                          <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                            {planetArchetype?.description || 'Inner wisdom and guidance'}
                          </p>
                        </div>

                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Sign Expression — {zodiacArchetype?.facetName || activePlanet.sign}
                          </h4>
                          {/* Jungian Archetypes */}
                          {zodiacArchetype?.archetypes?.jungian && zodiacArchetype.archetypes.jungian.length > 0 && (
                            <p className={`text-xs leading-relaxed mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                              <span className="opacity-70">Archetypes:</span>{' '}
                              <span className="font-medium">{zodiacArchetype.archetypes.jungian.slice(0, 2).join(', ')}</span>
                            </p>
                          )}
                          {/* Mythological Figures */}
                          {zodiacArchetype?.archetypes?.mythological && zodiacArchetype.archetypes.mythological.length > 0 && (
                            <p className={`text-xs leading-relaxed mb-1 ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                              <span className="opacity-70">Mythology:</span>{' '}
                              <span className="italic">{zodiacArchetype.archetypes.mythological.slice(0, 2).join(', ')}</span>
                            </p>
                          )}
                          {/* Cultural Heroes */}
                          {zodiacArchetype?.archetypes?.cultural && zodiacArchetype.archetypes.cultural.length > 0 && (
                            <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                              <span className="opacity-70">Heroes:</span>{' '}
                              {zodiacArchetype.archetypes.cultural.slice(0, 2).join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Personalized Synthesis */}
                        {generateArchetypalDescription(activePlanet.name, activePlanet.sign, activePlanet.house) && (
                          <div className={`mt-3 p-3 rounded-lg ${isDayMode ? 'bg-amber-50/50' : 'bg-amber-900/20'}`}>
                            <p className={`text-xs italic leading-relaxed ${isDayMode ? 'text-amber-800' : 'text-amber-200/80'}`}>
                              {generateArchetypalDescription(activePlanet.name, activePlanet.sign, activePlanet.house)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Column - House Placement & Aspects */}
                      <div className="space-y-4">
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            House Activation
                          </h4>
                          <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                            {spiralogicData?.facet}
                          </p>
                          <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                            {spiralogicData?.lesson}
                          </p>
                        </div>

                        {planetAspects.length > 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              Aspects ({planetAspects.length})
                            </h4>
                            <div className="space-y-2">
                              {planetAspects.slice(0, 3).map((aspect, idx) => {
                                const otherPlanet = aspect.planet1 === activePlanet.name ? aspect.planet2 : aspect.planet1;
                                // Get archetypal interpretation for this aspect
                                const aspectSynthesis = synthesizeAspect(
                                  activePlanet.name,
                                  otherPlanet,
                                  aspect.type as AspectType
                                );
                                return (
                                  <div
                                    key={idx}
                                    className={`px-2 py-2 rounded ${isDayMode ? 'bg-stone-100/60' : 'bg-stone-800/40'}`}
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-xs font-medium ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                                        {aspect.type}
                                      </span>
                                      <span className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                        with {otherPlanet} ({aspect.orb.toFixed(1)}°)
                                      </span>
                                    </div>
                                    {/* Aspect interpretation from synthesizeAspect */}
                                    {aspectSynthesis && (
                                      <p className={`text-xs italic leading-relaxed mt-1 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                        {aspectSynthesis.coreQuestion}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                              {planetAspects.length > 3 && (
                                <p className={`text-xs italic ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                                  +{planetAspects.length - 3} more aspects
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {planetAspects.length === 0 && (
                          <div>
                            <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              Aspects
                            </h4>
                            <p className={`text-xs italic ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                              No major aspects detected
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer - Deeper Exploration */}
                    <div
                      className={`px-6 py-3 border-t text-center ${isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'}`}
                      style={{
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        <span className="opacity-80">✨ Ask MAIA about current transits to this placement</span>
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Transit Planet Insight Popup */}
        {clickedTransit !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60"
            onClick={() => setClickedTransit(null)}
          >
            <div
              className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden max-w-md w-full ${
                isDayMode
                  ? 'bg-white/95 border-stone-200/60'
                  : 'bg-black/95 border-indigo-700/60'
              }`}
              style={{
                boxShadow: isDayMode
                  ? '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)'
                  : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(99, 102, 241, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const transit = clickedTransit;
                if (!transit) return null;

                // Get relevant transit aspects for this planet
                const relevantAspects = transitAspects.filter(a => a.transitPlanet === transit.planet);

                // Planet symbol mapping
                const symbols: { [key: string]: string } = {
                  Sun: '☉', Moon: '☽', Mercury: '☿', Venus: '♀', Mars: '♂',
                  Jupiter: '♃', Saturn: '♄', Uranus: '♅', Neptune: '♆', Pluto: '♇',
                };

                return (
                  <>
                    {/* Header */}
                    <div
                      className="px-6 py-4 border-b"
                      style={{
                        background: isDayMode
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.02))'
                          : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.05))',
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-dashed"
                          style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(99, 102, 241, 0.1))',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            color: isDayMode ? '#4F46E5' : '#818CF8',
                          }}
                        >
                          {symbols[transit.planet] || transit.planet[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-lg font-semibold ${isDayMode ? 'text-stone-900' : 'text-stone-200'}`}>
                              {transit.planet} Transit
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/20 text-indigo-300">
                              LIVE
                            </span>
                          </div>
                          <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                            {transit.degree.toFixed(1)}° {transit.sign}
                            {transit.house && ` · House ${transit.house}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="px-6 py-4 space-y-4">
                      {/* Transit-to-Natal Aspects */}
                      {relevantAspects.length > 0 && (
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Active Natal Aspects
                          </h4>
                          <div className="space-y-2">
                            {relevantAspects.slice(0, 4).map((aspect, idx) => (
                              <div
                                key={idx}
                                className={`p-2 rounded-lg border ${isDayMode ? 'bg-stone-50 border-stone-200' : 'bg-stone-800/50 border-stone-700/50'}`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className={`text-sm font-medium ${isDayMode ? 'text-stone-800' : 'text-stone-200'}`}>
                                    {aspect.aspectType.charAt(0).toUpperCase() + aspect.aspectType.slice(1)} natal {aspect.natalPlanet}
                                  </span>
                                  <span className={`text-xs ${aspect.applying ? 'text-green-400' : 'text-amber-400'}`}>
                                    {aspect.applying ? '→ applying' : '← separating'} ({aspect.orb.toFixed(1)}°)
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {relevantAspects.length === 0 && (
                        <div>
                          <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                            Natal Aspects
                          </h4>
                          <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                            No major aspects to your natal planets at this time.
                          </p>
                        </div>
                      )}

                      {/* General transit meaning */}
                      <div>
                        <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                          Current Weather
                        </h4>
                        <p className={`text-sm italic ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                          {transit.planet === 'Moon' && 'The Moon moves quickly through emotional tides — its influence is brief but potent.'}
                          {transit.planet === 'Sun' && 'Solar energy illuminates where attention flows — consciousness seeks expression.'}
                          {transit.planet === 'Mercury' && 'Mercury brings mental activity and communication — thoughts seek articulation.'}
                          {transit.planet === 'Venus' && 'Venus draws in beauty and connection — the heart seeks harmony.'}
                          {transit.planet === 'Mars' && 'Mars energizes action and desire — the will seeks direction.'}
                          {transit.planet === 'Jupiter' && 'Jupiter expands horizons and meaning — growth seeks opportunity.'}
                          {transit.planet === 'Saturn' && 'Saturn structures and tests — discipline meets responsibility.'}
                          {transit.planet === 'Uranus' && 'Uranus disrupts and liberates — awakening seeks authenticity.'}
                          {transit.planet === 'Neptune' && 'Neptune dissolves and inspires — the soul seeks transcendence.'}
                          {transit.planet === 'Pluto' && 'Pluto transforms and empowers — depth seeks truth.'}
                        </p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div
                      className={`px-6 py-3 border-t text-center ${isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'}`}
                      style={{
                        borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <p className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                        ✨ Ask MAIA for deeper transit insights
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}

        {/* Alchemical Education Popup - Click to learn about the house's alchemical process */}
        {clickedHouse !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ pointerEvents: 'auto' }}
            onClick={() => setClickedHouse(null)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Educational Modal */}
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative max-w-2xl w-full rounded-3xl shadow-2xl overflow-hidden ${
                isDayMode
                  ? 'bg-white/95 border border-stone-200'
                  : 'bg-black/90 border border-stone-700/50'
              }`}
              style={{
                boxShadow: isDayMode
                  ? '0 25px 80px rgba(0,0,0,0.15)'
                  : '0 25px 80px rgba(0,0,0,0.7), 0 0 60px rgba(139, 92, 246, 0.2)',
              }}
            >
              {(() => {
                const element = houseElements[clickedHouse as keyof typeof houseElements] as keyof typeof elementalColors;
                const elementColor = elementalColors[element];
                const color = isDayMode ? elementColor.day : elementColor.night;
                const education = alchemicalEducation[clickedHouse as keyof typeof alchemicalEducation];
                const houseState = houseStates[clickedHouse as keyof typeof houseStates];

                return (
                  <>
                    {/* Header */}
                    <div
                      className="p-8"
                      style={{
                        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
                        borderBottom: `1px solid ${isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)'}`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                            style={{
                              background: `linear-gradient(135deg, ${color}30, ${color}10)`,
                              boxShadow: `0 0 30px ${elementColor.glow}`,
                            }}
                          >
                            {houseState.symbol}
                          </div>
                          <div>
                            <h2 className={`text-2xl font-serif font-semibold ${isDayMode ? 'text-stone-900' : 'text-amber-100'}`}>
                              House {clickedHouse} · {houseState.phase}
                            </h2>
                            <p className={`text-sm ${isDayMode ? 'text-stone-600' : 'text-amber-200'} mt-1`}>
                              {education.operation}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setClickedHouse(null)}
                          className={`text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isDayMode
                              ? 'hover:bg-stone-100 text-stone-600'
                              : 'hover:bg-stone-800/50 text-stone-400'
                          }`}
                        >
                          ×
                        </button>
                      </div>

                      <div className={`text-sm font-medium ${isDayMode ? 'text-stone-700' : 'text-amber-200'}`}>
                        {education.process}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                      {/* Alchemical Description */}
                      <div>
                        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
                          The Alchemical Process
                        </h3>
                        <p className={`text-base leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-amber-50'}`}>
                          {education.description}
                        </p>
                      </div>

                      {/* Keywords */}
                      <div>
                        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
                          Keywords
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {education.keywords.map((keyword, idx) => (
                            <span
                              key={idx}
                              className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                isDayMode
                                  ? 'bg-stone-100 text-stone-700'
                                  : 'bg-stone-800/60 text-amber-100'
                              }`}
                              style={{
                                boxShadow: `0 0 10px ${elementColor.glow}`,
                              }}
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Practices */}
                      <div>
                        <h3 className={`text-xs uppercase tracking-wider font-semibold mb-3 ${isDayMode ? 'text-stone-500' : 'text-amber-400/80'}`}>
                          Integration Practices
                        </h3>
                        <ul className={`space-y-2 ${isDayMode ? 'text-stone-700' : 'text-amber-50'}`}>
                          {education.practices.map((practice, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span style={{ color }}>•</span>
                              <span className="text-sm">{practice}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer with Deep Dive button */}
                    <div
                      className={`px-8 py-4 flex items-center justify-between ${
                        isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'
                      }`}
                      style={{
                        borderTop: `1px solid ${isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
                      }}
                    >
                      <p className={`text-xs italic ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        Click outside to close
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeepDiveHouse(clickedHouse);
                          setClickedHouse(null);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                          isDayMode
                            ? 'bg-stone-800 text-white hover:bg-stone-700'
                            : 'bg-amber-100 text-stone-900 hover:bg-amber-200'
                        }`}
                      >
                        Deep Dive →
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

        {/* Nodal Axis Destiny Path Panel - Soul's evolutionary trajectory */}
        {showNodalAxisPanel && (() => {
          const northNode = planets.find(p => p.name === 'North Node');
          const southNode = planets.find(p => p.name === 'South Node');
          if (!northNode || !southNode) return null;

          const nnElement = houseElements[northNode.house as keyof typeof houseElements] as keyof typeof elementalColors;
          const snElement = houseElements[southNode.house as keyof typeof houseElements] as keyof typeof elementalColors;
          const nnColor = isDayMode ? elementalColors[nnElement].day : elementalColors[nnElement].night;
          const snColor = isDayMode ? elementalColors[snElement].day : elementalColors[snElement].night;
          const nnHouseData = getSpiralogicHouseData(northNode.house);
          const snHouseData = getSpiralogicHouseData(southNode.house);

          // House meanings for destiny interpretation
          const houseMeanings: Record<number, { destiny: string; gifts: string }> = {
            1: { destiny: 'developing authentic identity and self-expression', gifts: 'strong partnership skills and consideration for others' },
            2: { destiny: 'building material security and self-worth', gifts: 'psychological depth and ability to transform through crisis' },
            3: { destiny: 'communication, learning, and connecting with community', gifts: 'philosophical wisdom and understanding of bigger picture' },
            4: { destiny: 'creating emotional foundation and family roots', gifts: 'career achievement and public recognition' },
            5: { destiny: 'creative self-expression, joy, and following your heart', gifts: 'humanitarian vision and community thinking' },
            6: { destiny: 'service, health practices, and daily devotion', gifts: 'spiritual connection and transcendence' },
            7: { destiny: 'partnership, collaboration, and relating to others', gifts: 'strong sense of self and independent initiative' },
            8: { destiny: 'deep transformation, shared resources, and psychological depth', gifts: 'material stability and practical values' },
            9: { destiny: 'expanding horizons, philosophy, and higher meaning', gifts: 'intellectual versatility and local connections' },
            10: { destiny: 'public contribution, career, and legacy', gifts: 'emotional intelligence and family bonds' },
            11: { destiny: 'community leadership, vision, and collective impact', gifts: 'creative talent and personal magnetism' },
            12: { destiny: 'spiritual surrender, transcendence, and universal compassion', gifts: 'practical skills and attention to detail' },
          };

          const nnMeaning = houseMeanings[northNode.house] || { destiny: 'evolutionary growth', gifts: 'past mastery' };
          const snMeaning = houseMeanings[southNode.house] || { destiny: 'evolutionary growth', gifts: 'past mastery' };

          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60"
              onClick={() => setShowNodalAxisPanel(false)}
            >
              <div
                className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden max-w-2xl w-full ${
                  isDayMode
                    ? 'bg-white/95 border-stone-200/60'
                    : 'bg-black/95 border-stone-700/60'
                }`}
                style={{
                  boxShadow: isDayMode
                    ? '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)'
                    : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(245, 158, 11, 0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header with gradient showing axis */}
                <div
                  className="px-6 py-4 border-b"
                  style={{
                    background: `linear-gradient(90deg, ${snColor}15 0%, transparent 50%, ${nnColor}15 100%)`,
                    borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{
                            background: `linear-gradient(135deg, ${snColor}30, transparent)`,
                            color: snColor,
                          }}
                        >
                          ☋
                        </div>
                        <div className={`text-lg ${isDayMode ? 'text-stone-400' : 'text-stone-500'}`}>→</div>
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                          style={{
                            background: `linear-gradient(135deg, ${nnColor}30, ${nnColor}10)`,
                            boxShadow: `0 0 20px ${nnColor}40`,
                            color: nnColor,
                          }}
                        >
                          ☊
                        </div>
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${isDayMode ? 'text-stone-900' : 'text-stone-200'}`}>
                          Destiny Path
                        </h3>
                        <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                          Soul&apos;s Evolutionary Trajectory
                        </p>
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide"
                      style={{ background: `${nnColor}25`, color: nnColor }}
                    >
                      Nodal Axis
                    </span>
                  </div>
                </div>

                {/* Content Grid */}
                <div className="p-6 grid grid-cols-2 gap-6">
                  {/* Left Column - South Node (Past) */}
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${isDayMode ? 'bg-stone-100' : 'bg-stone-800/50'}`}
                      style={{ borderLeft: `3px solid ${snColor}` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg" style={{ color: snColor }}>☋</span>
                        <h4 className={`text-sm uppercase tracking-wider font-semibold ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                          South Node · Past Mastery
                        </h4>
                      </div>
                      <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                        {southNode.sign} · House {southNode.house}
                      </p>
                      <p className={`text-xs mb-2 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        {southNode.degree.toFixed(1)}° · {snHouseData?.facet || 'Unknown Facet'}
                      </p>
                      <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                        <strong>Gifts you bring:</strong> {snMeaning.gifts}
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        Comfort Zone to Transcend
                      </h4>
                      <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                        The South Node represents skills and patterns you&apos;ve already mastered — perhaps over many lifetimes.
                        While these come naturally, over-reliance keeps you from growing.
                      </p>
                    </div>
                  </div>

                  {/* Right Column - North Node (Future) */}
                  <div className="space-y-4">
                    <div
                      className={`p-4 rounded-xl ${isDayMode ? 'bg-amber-50' : 'bg-amber-900/20'}`}
                      style={{ borderLeft: `3px solid ${nnColor}` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg" style={{ color: nnColor }}>☊</span>
                        <h4 className={`text-sm uppercase tracking-wider font-semibold ${isDayMode ? 'text-amber-700' : 'text-amber-400'}`}>
                          North Node · Soul Purpose
                        </h4>
                      </div>
                      <p className={`text-sm font-medium mb-1 ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                        {northNode.sign} · House {northNode.house}
                      </p>
                      <p className={`text-xs mb-2 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        {northNode.degree.toFixed(1)}° · {nnHouseData?.facet || 'Unknown Facet'}
                      </p>
                      <p className={`text-xs leading-relaxed ${isDayMode ? 'text-amber-800' : 'text-amber-200'}`}>
                        <strong>Your evolutionary edge:</strong> {nnMeaning.destiny}
                      </p>
                    </div>

                    <div>
                      <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                        Growth Direction
                      </h4>
                      <p className={`text-xs leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                        The North Node points toward unfamiliar territory — qualities and experiences
                        that feel uncomfortable but lead to fulfillment. Lean into this edge.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Synthesis */}
                <div
                  className={`mx-6 mb-4 p-4 rounded-xl ${isDayMode ? 'bg-gradient-to-r from-stone-50 to-amber-50' : 'bg-gradient-to-r from-stone-800/30 to-amber-900/20'}`}
                >
                  <h4 className={`text-xs uppercase tracking-wider font-semibold mb-2 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                    ✨ Your Destiny Path Synthesis
                  </h4>
                  <p className={`text-sm italic leading-relaxed ${isDayMode ? 'text-stone-800' : 'text-stone-200'}`}>
                    You&apos;re moving from {southNode.sign} energy (House {southNode.house}: {snMeaning.gifts.split(' ').slice(0, 3).join(' ')}...)
                    toward {northNode.sign} expression (House {northNode.house}: {nnMeaning.destiny.split(' ').slice(0, 3).join(' ')}...).
                    Use your natural gifts as a foundation, but keep reaching toward the North Node&apos;s call.
                  </p>
                </div>

                {/* Footer */}
                <div
                  className={`px-6 py-3 border-t text-center ${isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'}`}
                  style={{
                    borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <p className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                    ☊ Ask MAIA about your nodal axis for deeper destiny insights
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* Aspect Patterns Panel - Sacred Geometry Configurations */}
        {showPatternsPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center z-[100] p-4 bg-black/60"
            onClick={() => {
              setShowPatternsPanel(false);
              setSelectedPattern(null);
            }}
          >
            <div
              className={`backdrop-blur-xl rounded-2xl border shadow-2xl overflow-hidden max-w-2xl w-full max-h-[80vh] overflow-y-auto ${
                isDayMode
                  ? 'bg-white/95 border-stone-200/60'
                  : 'bg-black/95 border-stone-700/60'
              }`}
              style={{
                boxShadow: isDayMode
                  ? '0 20px 60px rgba(0,0,0,0.1), 0 0 1px rgba(0,0,0,0.1)'
                  : '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.15)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div
                className={`px-6 py-4 border-b ${isDayMode ? 'bg-gradient-to-r from-violet-50 to-amber-50' : 'bg-gradient-to-r from-violet-900/20 to-amber-900/20'}`}
                style={{
                  borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                      style={{
                        background: isDayMode ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.2)',
                        color: isDayMode ? '#8B5CF6' : '#A78BFA',
                      }}
                    >
                      ⬡
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${isDayMode ? 'text-stone-900' : 'text-stone-200'}`}>
                        Aspect Patterns
                      </h3>
                      <p className={`text-xs ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                        Sacred Geometry in Your Chart
                      </p>
                    </div>
                  </div>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: isDayMode ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.25)',
                      color: isDayMode ? '#7C3AED' : '#A78BFA',
                    }}
                  >
                    {detectedPatterns.length} Found
                  </span>
                </div>
              </div>

              {/* Patterns List */}
              <div className="p-4 space-y-3">
                {detectedPatterns.length === 0 ? (
                  <div className={`text-center py-8 ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                    <p className="text-sm">No major aspect patterns detected in your chart.</p>
                    <p className="text-xs mt-2">This is rare — most charts have at least one configuration.</p>
                  </div>
                ) : (
                  detectedPatterns.map((pattern, idx) => {
                    const isSelected = selectedPattern?.type === pattern.type &&
                      JSON.stringify(selectedPattern?.planets) === JSON.stringify(pattern.planets);

                    // Pattern icons and colors
                    const patternMeta: Record<string, { icon: string; color: string; meaning: string }> = {
                      'grand-trine': {
                        icon: '△',
                        color: '#10B981',
                        meaning: 'Natural talents and flowing gifts',
                      },
                      't-square': {
                        icon: '⊤',
                        color: '#EF4444',
                        meaning: 'Dynamic tension driving growth',
                      },
                      'grand-cross': {
                        icon: '✚',
                        color: '#DC2626',
                        meaning: 'Crucible of transformation',
                      },
                      'yod': {
                        icon: '☉',
                        color: '#8B5CF6',
                        meaning: 'Finger of fate pointing to destiny',
                      },
                      'stellium': {
                        icon: '⚝',
                        color: '#F59E0B',
                        meaning: 'Concentrated energy and focus',
                      },
                      'mystic-rectangle': {
                        icon: '▭',
                        color: '#3B82F6',
                        meaning: 'Harmonious integration of opposites',
                      },
                    };

                    const meta = patternMeta[pattern.type] || { icon: '◇', color: '#6B7280', meaning: 'Complex configuration' };
                    const strengthPercent = Math.round(pattern.strength * 100);

                    return (
                      <div
                        key={`pattern-card-${idx}`}
                        className={`rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? isDayMode ? 'bg-violet-50 border-violet-200' : 'bg-violet-900/20 border-violet-700'
                            : isDayMode ? 'bg-stone-50 border-stone-200 hover:bg-stone-100' : 'bg-stone-800/30 border-stone-700 hover:bg-stone-800/50'
                        }`}
                        onClick={() => setSelectedPattern(isSelected ? null : pattern)}
                      >
                        <div className="p-4">
                          {/* Pattern Header */}
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-lg font-bold"
                                style={{
                                  background: `${meta.color}15`,
                                  color: meta.color,
                                }}
                              >
                                {meta.icon}
                              </div>
                              <div>
                                <h4 className={`text-sm font-semibold capitalize ${isDayMode ? 'text-stone-900' : 'text-stone-100'}`}>
                                  {pattern.type.replace('-', ' ')}
                                </h4>
                                <p className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-400'}`}>
                                  {pattern.planets.join(' · ')}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-medium ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                Strength
                              </div>
                              <div
                                className="text-sm font-bold"
                                style={{ color: meta.color }}
                              >
                                {strengthPercent}%
                              </div>
                            </div>
                          </div>

                          {/* Element/Modality Badge */}
                          {(pattern.element || pattern.modality || pattern.sign) && (
                            <div className="flex gap-2 mb-2">
                              {pattern.element && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs capitalize ${isDayMode ? 'bg-stone-200' : 'bg-stone-700'}`}
                                >
                                  {pattern.element}
                                </span>
                              )}
                              {pattern.modality && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs capitalize ${isDayMode ? 'bg-stone-200' : 'bg-stone-700'}`}
                                >
                                  {pattern.modality}
                                </span>
                              )}
                              {pattern.sign && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${isDayMode ? 'bg-amber-100 text-amber-800' : 'bg-amber-900/30 text-amber-300'}`}
                                >
                                  {pattern.sign}
                                </span>
                              )}
                              {pattern.focalPlanet && (
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${isDayMode ? 'bg-red-100 text-red-800' : 'bg-red-900/30 text-red-300'}`}
                                >
                                  Focal: {pattern.focalPlanet}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Interpretation (expanded when selected) */}
                          {isSelected && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className={`mt-3 pt-3 border-t ${isDayMode ? 'border-stone-200' : 'border-stone-600'}`}
                            >
                              <p className={`text-xs font-medium mb-1 ${isDayMode ? 'text-stone-600' : 'text-stone-400'}`}>
                                {meta.meaning}
                              </p>
                              <p className={`text-sm leading-relaxed ${isDayMode ? 'text-stone-700' : 'text-stone-300'}`}>
                                {pattern.interpretation}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div
                className={`px-6 py-3 border-t text-center ${isDayMode ? 'bg-stone-50/50' : 'bg-stone-900/30'}`}
                style={{
                  borderColor: isDayMode ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
                }}
              >
                <p className={`text-xs ${isDayMode ? 'text-stone-500' : 'text-stone-500'}`}>
                  ⬡ Ask MAIA about your aspect patterns for deeper configuration insights
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission Popup - Shows mission details */}
      <AnimatePresence>
        {clickedMission && (
          <MissionPopup
            mission={clickedMission}
            onClose={() => setClickedMission(null)}
          />
        )}
      </AnimatePresence>

      {/* House Deep Dive Sheet - Comprehensive house exploration */}
      <HouseDeepDiveSheet
        house={deepDiveHouse || 1}
        isOpen={deepDiveHouse !== null}
        onClose={() => setDeepDiveHouse(null)}
        planetsInHouse={planets?.filter(p => p.house === deepDiveHouse) || []}
        rulerPlanet={(() => {
          if (!deepDiveHouse || !planets) return undefined;
          const HOUSE_RULERS: Record<number, string> = {
            1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon',
            5: 'Sun', 6: 'Mercury', 7: 'Venus', 8: 'Pluto',
            9: 'Jupiter', 10: 'Saturn', 11: 'Uranus', 12: 'Neptune',
          };
          const rulerName = HOUSE_RULERS[deepDiveHouse];
          const ruler = planets.find(p => p.name === rulerName);
          return ruler ? { name: ruler.name, sign: ruler.sign, house: ruler.house } : undefined;
        })()}
        isDayMode={isDayMode}
      />
    </div>
  );
}
