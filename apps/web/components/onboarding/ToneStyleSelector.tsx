'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, Shuffle } from 'lucide-react';
import { soullabColors } from '@/lib/theme/soullabColors';

interface ToneStyleSelectorProps {
  onFinish?: (prefs: { tone: number; style: 'prose' | 'poetic' | 'auto' }) => void;
  onChange?: (tone: number, style: 'prose' | 'poetic' | 'auto') => void;
  initialTone?: number;
  initialStyle?: 'prose' | 'poetic' | 'auto';
  showSaveButton?: boolean;
  compact?: boolean;
}

export default function ToneStyleSelector({ 
  onFinish, 
  onChange,
  initialTone = 50,
  initialStyle = 'auto',
  showSaveButton = true,
  compact = false
}: ToneStyleSelectorProps) {
  const [tone, setTone] = useState(initialTone / 100); // Convert from 0-100 to 0-1
  const [style, setStyle] = useState<'prose' | 'poetic' | 'auto'>(initialStyle);

  const handleSave = () => {
    onFinish({ tone, style });
  };

  // Ceremonial ripple effect when switching modes
  const triggerRipple = (element: HTMLElement) => {
    const ripple = document.createElement('div');
    ripple.className = 'ceremonial-ripple';
    element.appendChild(ripple);
    
    setTimeout(() => {
      if (element.contains(ripple)) {
        element.removeChild(ripple);
      }
    }, 1200);
  };

  const handleStyleChange = (newStyle: 'prose' | 'poetic' | 'auto', event: React.MouseEvent) => {
    setStyle(newStyle);
    triggerRipple(event.currentTarget as HTMLElement);
    onChange?.(tone * 100, newStyle); // Convert back to 0-100 scale
  };

  const handleToneChange = (newTone: number) => {
    setTone(newTone);
    onChange?.(newTone * 100, style); // Convert back to 0-100 scale
  };

  const styles = [
    { 
      id: 'prose' as const, 
      name: 'Prose', 
      desc: 'Clear, conversational dialogue',
      icon: BookOpen, 
      color: 'from-neutral-600 to-neutral-700' 
    },
    { 
      id: 'poetic' as const, 
      name: 'Poetic', 
      desc: 'Flowing, metaphorical expression',
      icon: Sparkles, 
      color: 'from-amber-600 to-pink-600' 
    },
    { 
      id: 'auto' as const, 
      name: 'Auto', 
      desc: 'Adapts to your energy and context',
      icon: Shuffle, 
      color: 'from-amber-500 to-orange-600' 
    }
  ];

  // Compact version for AttunePanel
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Tone Slider */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Tone
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={tone}
              onChange={(e) => handleToneChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #777777 0%, ${soullabColors.yellow} 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              <span>Grounded</span>
              <span>Balanced</span>
              <span>Poetic</span>
            </div>
          </div>
        </div>

        {/* Style Buttons */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {styles.map(({ id, icon: Icon, name }) => (
              <button
                key={id}
                onClick={(e) => handleStyleChange(id, e)}
                className={`
                  relative px-3 py-2 rounded-lg font-medium text-sm transition-all
                  ${style === id 
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-2 border-amber-400' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-2 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-1">
                  <Icon className="w-4 h-4" />
                  <span>{name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Full version for onboarding
  return (
    <>
      <style jsx>{`
        .ceremonial-ripple {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, rgba(255, 215, 0, 0.2) 0%, transparent 70%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: ripple-expand 1.2s ease-out forwards;
          pointer-events: none;
          z-index: 10;
        }
        
        @keyframes ripple-expand {
          0% {
            width: 0;
            height: 0;
            opacity: 1;
          }
          100% {
            width: 200px;
            height: 200px;
            opacity: 0;
          }
        }
        
        .tone-slider {
          width: 100%;
          height: 6px;
          background: linear-gradient(to right, #404040, #FFD700);
          border-radius: 3px;
          appearance: none;
          outline: none;
          cursor: pointer;
        }
        
        .tone-slider::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
          background: #FFD700;
          border-radius: 50%;
          appearance: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          transition: all 0.2s ease;
        }
        
        .tone-slider::-webkit-slider-thumb:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
        }
        
        .tone-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: #FFD700;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
        }
      `}</style>
      
      <div className="onboarding-style bg-neutral-50 min-h-screen flex flex-col items-center justify-center px-8 py-20">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-neutral-800 mb-4" style={{ fontFamily: 'Blair, serif' }}>
            Choose your voice
          </h2>
          <p className="text-lg text-neutral-600" style={{ fontFamily: 'Lato, sans-serif' }}>
            Adjust how Maya speaks with you. Find what feels right.
          </p>
        </motion.div>

        {/* Style Controls Container */}
        <motion.div 
          className="bg-white rounded-3xl border border-neutral-200 p-10 shadow-sm max-w-xl w-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {/* Tone Slider */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-neutral-700 mb-6 text-center" style={{ fontFamily: 'Lato, sans-serif' }}>
              Tone
            </label>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={tone}
                onChange={(e) => handleToneChange(parseFloat(e.target.value))}
                className="tone-slider"
              />
              <div className="flex justify-between text-sm text-neutral-500 mt-3" style={{ fontFamily: 'Lato, sans-serif' }}>
                <span>Grounded</span>
                <span>Poetic</span>
              </div>
            </div>
          </div>

          {/* Style Toggle Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            {styles.map(({ id, icon: Icon, name, color }) => (
              <motion.button
                key={id}
                onClick={(e) => handleStyleChange(id, e)}
                className={`
                  relative overflow-hidden px-6 py-3 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2
                  ${style === id 
                    ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }
                `}
                style={{ fontFamily: 'Lato, sans-serif' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (id === 'prose' ? 0 : id === 'poetic' ? 0.1 : 0.2), duration: 0.4 }}
              >
                <Icon className="w-4 h-4" />
                <span>{name}</span>
              </motion.button>
            ))}
          </div>

          {/* Style Description */}
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <p className="text-sm text-neutral-600" style={{ fontFamily: 'Lato, sans-serif' }}>
              {styles.find(s => s.id === style)?.desc}
            </p>
          </motion.div>

          {/* Helper Text */}
          <motion.p 
            className="text-xs text-neutral-500 text-center"
            style={{ fontFamily: 'Lato, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            You can change this anytime in Attune
          </motion.p>
        </motion.div>

        {/* Save & Begin Button - only show if showSaveButton is true */}
        {showSaveButton && onFinish && (
          <motion.button
            onClick={handleSave}
            className="mt-12 px-8 py-4 bg-gradient-to-r from-neutral-700 to-neutral-800 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ fontFamily: 'Lato, sans-serif' }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            Save & Begin
          </motion.button>
        )}
      </div>
    </>
  );
}