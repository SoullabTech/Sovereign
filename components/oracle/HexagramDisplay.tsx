'use client';

/**
 * HexagramDisplay - Brushstroke-style I Ching hexagram visualization
 *
 * Renders hexagram lines with organic, ink-like strokes that draw themselves.
 * Yang lines are solid, Yin lines are broken. Changing lines pulse subtly.
 */

import { motion } from 'framer-motion';

interface HexagramLine {
  type: 'yang' | 'yin';
  changing?: boolean;
  value?: number; // 6-9 traditional values
}

interface HexagramDisplayProps {
  lines: HexagramLine[];
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  showChanging?: boolean;
  className?: string;
}

// Brushstroke path variations for organic feel
const YANG_PATHS = [
  'M 0,12 Q 20,10 50,12 T 100,12',
  'M 0,12 Q 25,14 50,11 T 100,12',
  'M 0,12 Q 30,9 60,13 T 100,12',
];

const YIN_LEFT_PATHS = [
  'M 0,12 Q 10,10 20,12 T 42,12',
  'M 0,12 Q 12,14 22,11 T 42,12',
  'M 0,12 Q 8,9 18,13 T 42,12',
];

const YIN_RIGHT_PATHS = [
  'M 58,12 Q 70,10 80,12 T 100,12',
  'M 58,12 Q 72,14 82,11 T 100,12',
  'M 58,12 Q 68,9 78,13 T 100,12',
];

// Get random path variation for organic feel
const getRandomPath = (paths: string[]) => {
  return paths[Math.floor(Math.random() * paths.length)];
};

const sizeConfig = {
  sm: { width: 80, height: 16, strokeWidth: 4, gap: 4 },
  md: { width: 120, height: 20, strokeWidth: 5, gap: 6 },
  lg: { width: 160, height: 24, strokeWidth: 6, gap: 8 },
};

export function HexagramDisplay({
  lines,
  size = 'md',
  animate = true,
  showChanging = true,
  className = '',
}: HexagramDisplayProps) {
  const config = sizeConfig[size];
  const totalHeight = lines.length * (config.height + config.gap) - config.gap;

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        width={config.width}
        height={totalHeight}
        viewBox={`0 0 100 ${lines.length * 28 - 4}`}
        className="overflow-visible"
      >
        <defs>
          {/* Brush texture filter */}
          <filter id="brushTexture" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Glow effect for changing lines */}
          <filter id="changingGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Render lines from bottom to top (traditional I Ching order) */}
        {[...lines].reverse().map((line, index) => {
          const y = index * 28;
          const isChanging = showChanging && line.changing;
          const pathVariant = index % 3;

          return (
            <g key={index} transform={`translate(0, ${y})`}>
              {line.type === 'yang' ? (
                // Yang line - solid
                <motion.path
                  d={YANG_PATHS[pathVariant]}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={config.strokeWidth}
                  strokeLinecap="round"
                  filter={isChanging ? 'url(#changingGlow)' : 'url(#brushTexture)'}
                  className={isChanging ? 'text-maia-spice-400' : 'text-maia-spice-500'}
                  initial={animate ? { pathLength: 0, opacity: 0 } : {}}
                  animate={animate ? {
                    pathLength: 1,
                    opacity: isChanging ? [1, 0.7, 1] : 1,
                  } : {}}
                  transition={{
                    pathLength: {
                      duration: 0.8,
                      delay: (lines.length - 1 - index) * 0.15,
                      ease: 'easeOut'
                    },
                    opacity: isChanging ? {
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    } : {
                      duration: 0.3,
                      delay: (lines.length - 1 - index) * 0.15
                    }
                  }}
                />
              ) : (
                // Yin line - broken
                <>
                  <motion.path
                    d={YIN_LEFT_PATHS[pathVariant]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={config.strokeWidth}
                    strokeLinecap="round"
                    filter={isChanging ? 'url(#changingGlow)' : 'url(#brushTexture)'}
                    className={isChanging ? 'text-maia-spice-400' : 'text-maia-spice-500'}
                    initial={animate ? { pathLength: 0, opacity: 0 } : {}}
                    animate={animate ? {
                      pathLength: 1,
                      opacity: isChanging ? [1, 0.6, 1] : 1,
                    } : {}}
                    transition={{
                      pathLength: {
                        duration: 0.6,
                        delay: (lines.length - 1 - index) * 0.15,
                        ease: 'easeOut'
                      },
                      opacity: isChanging ? {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      } : {
                        duration: 0.3,
                        delay: (lines.length - 1 - index) * 0.15
                      }
                    }}
                  />
                  <motion.path
                    d={YIN_RIGHT_PATHS[pathVariant]}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={config.strokeWidth}
                    strokeLinecap="round"
                    filter={isChanging ? 'url(#changingGlow)' : 'url(#brushTexture)'}
                    className={isChanging ? 'text-maia-spice-400' : 'text-maia-spice-500'}
                    initial={animate ? { pathLength: 0, opacity: 0 } : {}}
                    animate={animate ? {
                      pathLength: 1,
                      opacity: isChanging ? [1, 0.6, 1] : 1,
                    } : {}}
                    transition={{
                      pathLength: {
                        duration: 0.6,
                        delay: (lines.length - 1 - index) * 0.15 + 0.1,
                        ease: 'easeOut'
                      },
                      opacity: isChanging ? {
                        duration: 2.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 0.3
                      } : {
                        duration: 0.3,
                        delay: (lines.length - 1 - index) * 0.15
                      }
                    }}
                  />
                </>
              )}

              {/* Changing line indicator - small dot */}
              {isChanging && (
                <motion.circle
                  cx="105"
                  cy="12"
                  r="3"
                  fill="currentColor"
                  className="text-maia-spice-400"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0.5, 1, 0.5],
                    scale: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (lines.length - 1 - index) * 0.15 + 0.5
                  }}
                />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * TrigramDisplay - Single trigram (3 lines)
 */
interface TrigramDisplayProps {
  lines: HexagramLine[];
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TrigramDisplay({ lines, size = 'sm', className = '' }: TrigramDisplayProps) {
  // Ensure we only show 3 lines for trigram
  const trigramLines = lines.slice(0, 3);
  return (
    <HexagramDisplay
      lines={trigramLines}
      size={size}
      animate={false}
      showChanging={false}
      className={className}
    />
  );
}

/**
 * BaguaRing - The 8 trigrams arranged in a circle
 */
interface BaguaRingProps {
  highlightTrigram?: number; // 0-7, which trigram to highlight
  size?: number;
  className?: string;
}

// The 8 trigrams in King Wen (Later Heaven) sequence
const TRIGRAMS = [
  { name: 'Qian', element: 'Heaven', lines: [{ type: 'yang' }, { type: 'yang' }, { type: 'yang' }] as HexagramLine[] },
  { name: 'Dui', element: 'Lake', lines: [{ type: 'yin' }, { type: 'yang' }, { type: 'yang' }] as HexagramLine[] },
  { name: 'Li', element: 'Fire', lines: [{ type: 'yang' }, { type: 'yin' }, { type: 'yang' }] as HexagramLine[] },
  { name: 'Zhen', element: 'Thunder', lines: [{ type: 'yin' }, { type: 'yin' }, { type: 'yang' }] as HexagramLine[] },
  { name: 'Xun', element: 'Wind', lines: [{ type: 'yang' }, { type: 'yang' }, { type: 'yin' }] as HexagramLine[] },
  { name: 'Kan', element: 'Water', lines: [{ type: 'yin' }, { type: 'yang' }, { type: 'yin' }] as HexagramLine[] },
  { name: 'Gen', element: 'Mountain', lines: [{ type: 'yang' }, { type: 'yin' }, { type: 'yin' }] as HexagramLine[] },
  { name: 'Kun', element: 'Earth', lines: [{ type: 'yin' }, { type: 'yin' }, { type: 'yin' }] as HexagramLine[] },
];

export function BaguaRing({ highlightTrigram, size = 200, className = '' }: BaguaRingProps) {
  const radius = size * 0.35;
  const centerX = size / 2;
  const centerY = size / 2;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Central yin-yang */}
      <motion.div
        className="absolute"
        style={{
          left: centerX - 20,
          top: centerY - 20,
          width: 40,
          height: 40,
        }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Yin-Yang symbol */}
          <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" className="text-maia-spice-500/30" />
          <path
            d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2"
            fill="currentColor"
            className="text-maia-spice-500/40"
          />
          <circle cx="50" cy="26" r="6" fill="currentColor" className="text-maia-navy-900" />
          <circle cx="50" cy="74" r="6" fill="currentColor" className="text-maia-spice-500/40" />
        </svg>
      </motion.div>

      {/* Trigrams around the circle */}
      {TRIGRAMS.map((trigram, index) => {
        const angle = (index * 45 - 90) * (Math.PI / 180); // Start from top, go clockwise
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        const isHighlighted = highlightTrigram === index;

        return (
          <motion.div
            key={trigram.name}
            className="absolute flex flex-col items-center"
            style={{
              left: x - 25,
              top: y - 25,
              width: 50,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isHighlighted ? 1 : 0.5,
              scale: isHighlighted ? 1.1 : 1,
            }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className={`transform ${isHighlighted ? '' : 'opacity-60'}`}>
              <TrigramDisplay lines={trigram.lines} size="sm" />
            </div>
            <span className={`text-xs mt-1 font-medium ${isHighlighted ? 'text-maia-spice-400' : 'text-maia-ink-40'}`}>
              {trigram.name}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default HexagramDisplay;
