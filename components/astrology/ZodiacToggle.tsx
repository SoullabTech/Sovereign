'use client';

/**
 * ZodiacToggle Component
 *
 * Toggle between Tropical (Western), Sidereal (Vedic), and Chinese (BaZi) zodiac systems.
 * When Sidereal is selected, shows ayanamsa selector dropdown.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Orbit, Calendar, ChevronDown } from 'lucide-react';

export type ZodiacSystem = 'tropical' | 'sidereal' | 'chinese' | 'mayan';
export type AyanamsaType = 'lahiri' | 'true_chitra' | 'krishnamurti';

const AYANAMSA_OPTIONS: Array<{
  type: AyanamsaType;
  label: string;
  description: string;
}> = [
  {
    type: 'lahiri',
    label: 'Lahiri',
    description: 'Official Indian standard',
  },
  {
    type: 'true_chitra',
    label: 'True Chitra',
    description: 'Star-fixed (Spica at 0° Libra)',
  },
  {
    type: 'krishnamurti',
    label: 'KP',
    description: 'Krishnamurti Paddhati',
  },
];

interface ZodiacToggleProps {
  value: ZodiacSystem;
  onChange: (value: ZodiacSystem) => void;
  ayanamsa?: AyanamsaType;
  onAyanamsaChange?: (value: AyanamsaType) => void;
  compact?: boolean;
  className?: string;
}

export default function ZodiacToggle({
  value,
  onChange,
  ayanamsa = 'lahiri',
  onAyanamsaChange,
  compact = false,
  className = '',
}: ZodiacToggleProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const selectedAyanamsa = AYANAMSA_OPTIONS.find((opt) => opt.type === ayanamsa);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Tropical/Sidereal Toggle */}
      <div className="flex bg-stone-900/60 rounded-lg p-1 border border-stone-800/50">
        <button
          onClick={() => onChange('tropical')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${value === 'tropical'
              ? 'bg-amber-600/80 text-white shadow-lg shadow-amber-900/30'
              : 'text-amber-400/60 hover:text-amber-400/80'
            }
          `}
        >
          <Sun className="w-3.5 h-3.5" />
          {!compact && <span>Tropical</span>}
        </button>
        <button
          onClick={() => onChange('sidereal')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${value === 'sidereal'
              ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-900/30'
              : 'text-indigo-400/60 hover:text-indigo-400/80'
            }
          `}
        >
          <Moon className="w-3.5 h-3.5" />
          {!compact && <span>Sidereal</span>}
        </button>
        <button
          onClick={() => onChange('chinese')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${value === 'chinese'
              ? 'bg-rose-600/80 text-white shadow-lg shadow-rose-900/30'
              : 'text-rose-400/60 hover:text-rose-400/80'
            }
          `}
        >
          <Orbit className="w-3.5 h-3.5" />
          {!compact && <span>Chinese</span>}
        </button>
        <button
          onClick={() => onChange('mayan')}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
            transition-all duration-200
            ${value === 'mayan'
              ? 'bg-teal-600/80 text-white shadow-lg shadow-teal-900/30'
              : 'text-teal-400/60 hover:text-teal-400/80'
            }
          `}
        >
          <Calendar className="w-3.5 h-3.5" />
          {!compact && <span>Mayan</span>}
        </button>
      </div>

      {/* Ayanamsa Selector (only visible when sidereal is selected) */}
      <AnimatePresence>
        {value === 'sidereal' && onAyanamsaChange && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="relative"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
              className={`
                flex items-center gap-2 px-3 py-1.5
                bg-stone-900/60 border border-indigo-900/30 rounded-lg
                text-sm text-indigo-300 hover:text-indigo-200
                transition-all duration-200
              `}
            >
              <span>{selectedAyanamsa?.label || 'Lahiri'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown */}
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    absolute top-full mt-1 left-0 z-50
                    min-w-[200px] py-1
                    bg-stone-900/95 backdrop-blur-xl
                    border border-indigo-900/40 rounded-lg
                    shadow-xl shadow-black/30
                  `}
                >
                  {AYANAMSA_OPTIONS.map((option) => (
                    <button
                      key={option.type}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAyanamsaChange(option.type);
                        setIsDropdownOpen(false);
                      }}
                      className={`
                        w-full px-3 py-2 text-left
                        transition-colors duration-150
                        ${ayanamsa === option.type
                          ? 'bg-indigo-900/40 text-indigo-200'
                          : 'text-indigo-300/70 hover:bg-indigo-900/20 hover:text-indigo-200'
                        }
                      `}
                    >
                      <div className="text-sm font-medium">{option.label}</div>
                      <div className="text-xs text-indigo-400/50">{option.description}</div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Label hint */}
      {!compact && (
        <span className="text-xs text-stone-500">
          {value === 'tropical' ? 'Western' : value === 'sidereal' ? 'Vedic/Jyotish' : value === 'chinese' ? 'Chinese/BaZi' : 'Tzolk\'in/Mayan'}
        </span>
      )}
    </div>
  );
}
