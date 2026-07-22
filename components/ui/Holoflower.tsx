// @ts-nocheck
'use client';

import { motion } from 'framer-motion';

interface HoloflowerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
  animate?: boolean;
  glowIntensity?: 'low' | 'medium' | 'high';
  variant?: 'single' | 'spectrum' | 'responsive';
  theme?: 'light' | 'dark'; // for light or dark backgrounds
  className?: string;
  customColor?: string; // for dynamic color changes based on mode
  crisp?: boolean; // crisp mode — drops the white halo/contrast glow; keeps a soft depth shadow (for the sign-in surface)
}

const sizeMap = {
  sm: { container: 'w-12 h-12', image: 'w-8 h-8', glow: 'w-10 h-10', blur: '10px' },
  md: { container: 'w-16 h-16', image: 'w-12 h-12', glow: 'w-14 h-14', blur: '12px' },
  lg: { container: 'w-24 h-24', image: 'w-16 h-16', glow: 'w-20 h-20', blur: '15px' },
  xl: { container: 'w-32 h-32', image: 'w-24 h-24', glow: 'w-28 h-28', blur: '20px' },
  xxl: { container: 'w-64 h-64', image: 'w-48 h-48', glow: 'w-56 h-56', blur: '30px' }
};

const glowMap = {
  low: { opacity: [0.15, 0.2, 0.15] },
  medium: { opacity: [0.2, 0.25, 0.2] },
  high: { opacity: [0.25, 0.3, 0.25] }
};

// Color mapping for different modes
const colorMap = {
  counsel: 'rgba(20, 184, 166, 0.5)', // teal-500 with transparency
  scribe: 'rgba(59, 130, 246, 0.6)',   // blue-500 with transparency
  default: 'rgba(251, 191, 36, 0.4)'   // amber-400 default
};

export function Holoflower({
  size = 'md',
  animate = true,
  glowIntensity = 'medium',
  variant = 'single',
  theme = 'dark',
  className = '',
  customColor,
  crisp = false
}: HoloflowerProps) {
  const sizes = sizeMap[size];
  const glow = glowMap[glowIntensity];
  const svgPath = variant === 'spectrum' ? '/holoflower-studio-transparent.png' : '/holoflower.svg';

  // Determine the color to use - custom color takes precedence
  const glowColor = customColor || colorMap.default;

  // Drop shadow color based on theme
  const dropShadow = theme === 'light'
    ? 'drop-shadow(0 0 10px rgba(90, 122, 111, 0.35)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.06))'
    : 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.7))';
  // crisp mode: keep the multicolor dots sharp — no white halo, just a soft depth shadow.
  const imgFilter = crisp ? 'drop-shadow(0 2px 10px rgba(0, 0, 0, 0.5))' : dropShadow;

  return (
    <div className={`${sizes.container} relative flex items-center justify-center ${className}`} style={{ background: 'transparent', boxShadow: 'none', border: 'none', outline: 'none', overflow: 'visible' }}>

      {/* Subtle light glow for contrast — omitted in crisp mode (it hazes the multicolor holoflower) */}
      {!crisp && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              filter: `blur(${parseInt(sizes.blur)}px)`,
            }}
          />
        </div>
      )}

      {/* Radiant glow - enhanced */}
      {animate ? (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{
            scale: [1, 1.2, 1],
            opacity: glow.opacity
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor.replace(/,\s*[\d.]+\)/, ', 0.15)')} 30%, ${glowColor.replace(/,\s*[\d.]+\)/, ', 0.1)')} 60%, ${glowColor.replace(/,\s*[\d.]+\)/, ', 0.05)')} 80%, transparent 95%)`,
              filter: `blur(${sizes.blur})`,
            }}
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`${sizes.glow} rounded-full`}
            style={{
              background: `radial-gradient(circle, ${glow.color} 0%, rgba(212, 184, 150, 0.15) 30%, rgba(212, 184, 150, 0.1) 60%, rgba(212, 184, 150, 0.05) 80%, transparent 95%)`,
              filter: `blur(${sizes.blur})`,
              opacity: glow.opacity[1]
            }}
          />
        </div>
      )}

      {/* Holoflower SVG - clean rendering */}
      {animate ? (
        <motion.div
          className="relative z-10"
          animate={{
            scale: [1, 1.03, 1],
            rotate: [0, 2, 0, -2, 0]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain`}
            style={{
              filter: imgFilter,
            }}
          />
        </motion.div>
      ) : (
        <div className="relative z-10">
          <img
            src={svgPath}
            alt="Soullab"
            className={`${sizes.image} object-contain`}
            style={{
              filter: imgFilter,
            }}
          />
        </div>
      )}
    </div>
  );
}