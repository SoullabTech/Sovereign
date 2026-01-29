'use client';

/**
 * RuneStone - Elder Futhark rune rendered on weathered stone
 *
 * Each rune is an SVG path carved into a stone-textured background.
 * Supports merkstave (reversed) orientation.
 */

import { motion } from 'framer-motion';

// Elder Futhark rune SVG paths (centered at 50,50 in 100x100 viewbox)
const RUNE_PATHS: Record<string, string> = {
  // First Aett
  fehu: 'M30,20 L30,80 M30,30 L55,45 M30,50 L50,60',
  uruz: 'M30,80 L30,20 L55,35 L55,80',
  thurisaz: 'M35,20 L35,80 M35,35 L55,50 L35,65',
  ansuz: 'M30,80 L50,20 L70,80 M38,55 L62,55',
  raido: 'M30,20 L30,80 M30,20 L55,20 Q65,20 65,35 Q65,50 55,50 L30,50 M50,50 L65,80',
  kenaz: 'M35,20 L55,50 L35,80',
  gebo: 'M30,30 L70,70 M70,30 L30,70',
  wunjo: 'M35,20 L35,50 Q35,65 50,65 L65,65 M35,50 L35,80',

  // Second Aett
  hagalaz: 'M30,20 L30,80 M70,20 L70,80 M30,50 L70,50',
  nauthiz: 'M50,20 L50,80 M35,35 L65,65',
  isa: 'M50,20 L50,80',
  jera: 'M50,20 L30,40 L50,50 M50,80 L70,60 L50,50',
  eihwaz: 'M50,15 L50,85 M50,30 L35,45 M50,70 L65,55',
  perthro: 'M35,25 L35,75 L55,75 Q70,75 70,60 Q70,45 55,45 L35,45',
  algiz: 'M50,80 L50,35 M50,35 L30,20 M50,35 L70,20',
  sowilo: 'M35,25 L55,25 L35,50 L55,50 L35,75 L55,75',

  // Third Aett
  tiwaz: 'M50,20 L50,80 M30,20 L50,20 L70,20',
  berkana: 'M35,20 L35,80 M35,20 Q60,20 60,35 Q60,50 35,50 Q60,50 60,65 Q60,80 35,80',
  ehwaz: 'M30,20 L30,80 M30,50 L70,50 M70,20 L70,80',
  mannaz: 'M30,80 L30,20 L50,40 L70,20 L70,80',
  laguz: 'M35,80 L35,20 L60,45',
  ingwaz: 'M50,20 L70,50 L50,80 L30,50 Z',
  dagaz: 'M30,25 L30,75 M70,25 L70,75 M30,25 L70,75 M30,75 L70,25',
  othala: 'M50,20 L30,40 L30,60 L50,80 L70,60 L70,40 L50,20 M30,60 L50,50 L70,60',
};

// Map common rune name variations
const RUNE_NAME_MAP: Record<string, string> = {
  // Standard names
  fehu: 'fehu', uruz: 'uruz', thurisaz: 'thurisaz', ansuz: 'ansuz',
  raido: 'raido', raidho: 'raido', kenaz: 'kenaz', kaunaz: 'kenaz',
  gebo: 'gebo', wunjo: 'wunjo',
  hagalaz: 'hagalaz', nauthiz: 'nauthiz', naudiz: 'nauthiz',
  isa: 'isa', jera: 'jera', eihwaz: 'eihwaz', ihwaz: 'eihwaz',
  perthro: 'perthro', pertho: 'perthro', algiz: 'algiz',
  sowilo: 'sowilo', sowelu: 'sowilo',
  tiwaz: 'tiwaz', teiwaz: 'tiwaz', berkana: 'berkana', berkano: 'berkana',
  ehwaz: 'ehwaz', mannaz: 'mannaz', laguz: 'laguz',
  ingwaz: 'ingwaz', inguz: 'ingwaz', dagaz: 'dagaz',
  othala: 'othala', othila: 'othala',
  // Common alternate spellings
  kauna: 'kenaz', gebu: 'gebo', haglaz: 'hagalaz',
  isaz: 'isa', iwaz: 'eihwaz', perthu: 'perthro',
  inwaz: 'ingwaz',
};

interface RuneStoneProps {
  rune: string;
  merkstave?: boolean; // Reversed orientation
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  highlighted?: boolean;
  className?: string;
}

const sizeConfig = {
  sm: { width: 60, height: 72, fontSize: 10 },
  md: { width: 80, height: 96, fontSize: 12 },
  lg: { width: 120, height: 144, fontSize: 14 },
};

export function RuneStone({
  rune,
  merkstave = false,
  size = 'md',
  animate = true,
  highlighted = false,
  className = '',
}: RuneStoneProps) {
  const config = sizeConfig[size];
  const normalizedRune = RUNE_NAME_MAP[rune.toLowerCase()] || rune.toLowerCase();
  const runePath = RUNE_PATHS[normalizedRune];

  // Generate unique stone texture seed from rune name
  const stoneSeed = normalizedRune.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: config.width, height: config.height }}
      initial={animate ? { opacity: 0, y: 20, rotateX: -30 } : {}}
      animate={animate ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <svg
        viewBox="0 0 100 120"
        className="w-full h-full drop-shadow-lg"
        style={{ filter: highlighted ? 'drop-shadow(0 0 8px rgba(20, 184, 166, 0.4))' : undefined }}
      >
        <defs>
          {/* Stone texture */}
          <filter id={`stoneTexture-${normalizedRune}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.08"
              numOctaves="4"
              seed={stoneSeed}
              result="noise"
            />
            <feDiffuseLighting
              in="noise"
              lightingColor="#9ca3af"
              surfaceScale="2"
              result="light"
            >
              <feDistantLight azimuth="225" elevation="60" />
            </feDiffuseLighting>
            <feComposite in="SourceGraphic" in2="light" operator="arithmetic" k1="1" k2="0.3" k3="0.3" k4="0" />
          </filter>

          {/* Speckling for weathered look */}
          <filter id={`speckle-${normalizedRune}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed={stoneSeed + 100} />
            <feColorMatrix type="matrix" values="0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0 0.7  0 0 0 0.15 0" />
            <feComposite in2="SourceGraphic" operator="in" />
          </filter>

          {/* Carving depth effect */}
          <filter id={`carving-${normalizedRune}`} x="-10%" y="-10%" width="120%" height="120%">
            <feOffset dx="1" dy="1" in="SourceAlpha" result="shadowOffset" />
            <feGaussianBlur in="shadowOffset" stdDeviation="0.5" result="shadowBlur" />
            <feFlood floodColor="#1a1a1a" floodOpacity="0.6" result="shadowColor" />
            <feComposite in="shadowColor" in2="shadowBlur" operator="in" result="shadow" />
            <feMerge>
              <feMergeNode in="shadow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Stone gradient */}
          <radialGradient id={`stoneGradient-${normalizedRune}`} cx="40%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#a8a29e" />
            <stop offset="50%" stopColor="#78716c" />
            <stop offset="100%" stopColor="#57534e" />
          </radialGradient>

          {/* Clip path for organic stone shape */}
          <clipPath id={`stoneShape-${normalizedRune}`}>
            <ellipse cx="50" cy="60" rx="42" ry="50" />
          </clipPath>
        </defs>

        {/* Stone body */}
        <g clipPath={`url(#stoneShape-${normalizedRune})`}>
          {/* Base stone color */}
          <ellipse
            cx="50"
            cy="60"
            rx="42"
            ry="50"
            fill={`url(#stoneGradient-${normalizedRune})`}
          />

          {/* Stone texture overlay */}
          <ellipse
            cx="50"
            cy="60"
            rx="42"
            ry="50"
            fill="#78716c"
            filter={`url(#stoneTexture-${normalizedRune})`}
            opacity="0.7"
          />

          {/* Speckles */}
          <ellipse
            cx="50"
            cy="60"
            rx="42"
            ry="50"
            fill="white"
            filter={`url(#speckle-${normalizedRune})`}
          />
        </g>

        {/* Stone outline */}
        <ellipse
          cx="50"
          cy="60"
          rx="42"
          ry="50"
          fill="none"
          stroke="#44403c"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Carved rune */}
        {runePath && (
          <g transform={merkstave ? 'translate(100, 120) rotate(180)' : ''}>
            <motion.path
              d={runePath}
              fill="none"
              stroke="#292524"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter={`url(#carving-${normalizedRune})`}
              initial={animate ? { pathLength: 0 } : {}}
              animate={animate ? { pathLength: 1 } : {}}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
            {/* Lighter inner line for depth illusion */}
            <motion.path
              d={runePath}
              fill="none"
              stroke="#78716c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0, opacity: 0 } : {}}
              animate={animate ? { pathLength: 1, opacity: 0.5 } : {}}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            />
          </g>
        )}

        {/* Merkstave indicator */}
        {merkstave && (
          <motion.circle
            cx="85"
            cy="105"
            r="6"
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          />
        )}
      </svg>

      {/* Rune name label */}
      <motion.div
        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
        initial={animate ? { opacity: 0 } : {}}
        animate={animate ? { opacity: 1 } : {}}
        transition={{ delay: 1.2 }}
      >
        <span
          className={`font-medium uppercase tracking-wider ${
            highlighted ? 'text-maia-sage-400' : 'text-maia-ink-40'
          }`}
          style={{ fontSize: config.fontSize }}
        >
          {rune}
          {merkstave && ' ᛭'}
        </span>
      </motion.div>
    </motion.div>
  );
}

/**
 * RuneCastDisplay - Multiple runes arranged for a spread
 */
interface RuneCastDisplayProps {
  runes: Array<{
    name: string;
    position: string;
    merkstave?: boolean;
  }>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RuneCastDisplay({ runes, size = 'md', className = '' }: RuneCastDisplayProps) {
  return (
    <div className={`flex flex-wrap justify-center gap-6 ${className}`}>
      {runes.map((rune, index) => (
        <motion.div
          key={`${rune.name}-${index}`}
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.3, duration: 0.6 }}
        >
          <RuneStone
            rune={rune.name}
            merkstave={rune.merkstave}
            size={size}
            animate={true}
            highlighted={index === 0}
          />
          <span className="mt-3 text-xs text-maia-ink-40 uppercase tracking-wide">
            {rune.position}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default RuneStone;
