'use client';

/**
 * Elemental Balance Display - Shows user's current astrological elemental signature
 * Integrates with MAIA's astrological intelligence system
 */

import { motion } from 'framer-motion';
import { Flame, Droplet, Sprout, Wind } from 'lucide-react';

interface ElementalBalance {
  fire: number;
  water: number;
  earth: number;
  air: number;
}

interface ElementalBalanceDisplayProps {
  balance: ElementalBalance;
  className?: string;
}

const elementConfig = {
  fire: {
    icon: Flame,
    color: '#C85450',
    glowColor: 'rgba(200, 84, 80, 0.3)',
    label: 'Fire',
    quality: 'Inspiration & Action',
  },
  water: {
    icon: Droplet,
    color: '#6B9BD1',
    glowColor: 'rgba(107, 155, 209, 0.3)',
    label: 'Water',
    quality: 'Emotion & Intuition',
  },
  earth: {
    icon: Sprout,
    color: '#7A9A65',
    glowColor: 'rgba(122, 154, 101, 0.3)',
    label: 'Earth',
    quality: 'Grounding & Manifestation',
  },
  air: {
    icon: Wind,
    color: '#D4B896',
    glowColor: 'rgba(212, 184, 150, 0.3)',
    label: 'Air',
    quality: 'Clarity & Communication',
  },
};

export function ElementalBalanceDisplay({ balance, className = '' }: ElementalBalanceDisplayProps) {
  // Find dominant element
  const dominant = Object.entries(balance).reduce((a, b) =>
    b[1] > a[1] ? b : a
  )[0] as keyof ElementalBalance;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Title */}
      <div className="text-center">
        <h3 className="text-amber-400 text-sm font-medium mb-1">
          Your Elemental Signature
        </h3>
        <p className="text-stone-400 text-xs">
          Current astrological balance
        </p>
      </div>

      {/* Elemental bars */}
      <div className="space-y-4">
        {(Object.keys(elementConfig) as Array<keyof typeof elementConfig>).map((element) => {
          const config = elementConfig[element];
          const Icon = config.icon;
          const percentage = Math.round(balance[element] * 100);
          const isDominant = element === dominant;

          return (
            <div key={element} className="space-y-2">
              {/* Element label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon
                    className="w-4 h-4"
                    style={{ color: config.color }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: config.color }}
                  >
                    {config.label}
                  </span>
                  {isDominant && (
                    <span className="text-[10px] text-stone-500 italic">
                      dominant
                    </span>
                  )}
                </div>
                <span className="text-xs text-stone-400">
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="relative h-2 bg-black/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${config.color}, ${config.glowColor})`,
                    boxShadow: isDominant ? `0 0 10px ${config.glowColor}` : 'none',
                  }}
                />
              </div>

              {/* Quality description */}
              {isDominant && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[10px] text-stone-500 italic pl-6"
                >
                  {config.quality}
                </motion.p>
              )}
            </div>
          );
        })}
      </div>

      {/* Dominant element wisdom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 rounded-lg bg-black/20 border border-amber-900/10"
      >
        <p className="text-xs text-stone-400 leading-relaxed">
          <span style={{ color: elementConfig[dominant].color }} className="font-medium">
            {elementConfig[dominant].label}
          </span>
          {' '}energy is strong now, inviting {getElementalPractice(dominant)}.
        </p>
      </motion.div>
    </div>
  );
}

function getElementalPractice(element: keyof ElementalBalance): string {
  const practices: Record<keyof ElementalBalance, string> = {
    fire: 'you to channel creative fire through inspired action',
    water: 'you to dive deep into emotional wisdom and intuitive knowing',
    earth: 'you to ground your visions in practical, embodied steps',
    air: 'you to clarify your mental landscape through communication',
  };
  return practices[element];
}
