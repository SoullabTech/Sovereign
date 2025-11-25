/**
 * Agent Customizer Component
 * Allows users to choose voice and customize agent name
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, User, Volume2, X, Check } from 'lucide-react';
import { 
  getAgentConfig, 
  saveAgentConfig, 
  DEFAULT_AGENTS,
  AgentConfig 
} from '@/lib/agent-config';

interface AgentCustomizerProps {
  position?: 'top-right' | 'right' | 'bottom-right' | 'bottom-left' | 'left' | 'top-left';
  onConfigChange?: (config: AgentConfig) => void;
}

export const AgentCustomizer: React.FC<AgentCustomizerProps> = ({ 
  position = 'top-right',
  onConfigChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<AgentConfig>(getAgentConfig());
  const [customName, setCustomName] = useState(config.name);
  const [hasChanges, setHasChanges] = useState(false);

  // Position mapping for orbital placement
  const positionStyles = {
    'top-right': { top: '20%', right: '20%' },
    'right': { top: '50%', right: '15%', transform: 'translateY(-50%)' },
    'bottom-right': { bottom: '20%', right: '20%' },
    'bottom-left': { bottom: '20%', left: '20%' },
    'left': { top: '50%', left: '15%', transform: 'translateY(-50%)' },
    'top-left': { top: '20%', left: '20%' }
  };

  useEffect(() => {
    // Listen for config changes from other components
    const handleConfigChange = (e: CustomEvent) => {
      setConfig(e.detail);
      setCustomName(e.detail.name);
    };
    
    window.addEventListener('agent-config-changed', handleConfigChange as EventListener);
    return () => {
      window.removeEventListener('agent-config-changed', handleConfigChange as EventListener);
    };
  }, []);

  const handleVoiceChange = (voice: 'maya' | 'anthony') => {
    const newConfig = {
      ...DEFAULT_AGENTS[voice],
      name: customName !== config.name ? customName : DEFAULT_AGENTS[voice].name
    };
    setConfig(newConfig);
    setHasChanges(true);
    
    // Update custom name if it was default
    if (customName === config.name) {
      setCustomName(DEFAULT_AGENTS[voice].name);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomName(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    const finalConfig = {
      ...config,
      name: customName || config.name
    };
    
    saveAgentConfig(finalConfig);
    onConfigChange?.(finalConfig);
    setHasChanges(false);
    
    // Close after save
    setTimeout(() => setIsOpen(false), 500);
  };

  const handleCancel = () => {
    // Reset to saved config
    const savedConfig = getAgentConfig();
    setConfig(savedConfig);
    setCustomName(savedConfig.name);
    setHasChanges(false);
    setIsOpen(false);
  };

  return (
    <div 
      className="absolute z-50"
      style={positionStyles[position]}
    >
      {/* Settings Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md
                   border border-white/20 flex items-center justify-center
                   hover:bg-white/20 transition-colors"
      >
        <Settings className="w-5 h-5 text-white/80" />
      </motion.button>

      {/* Customizer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute mt-2 w-72 bg-gray-900/95 backdrop-blur-xl
                       rounded-2xl border border-white/10 shadow-2xl
                       overflow-hidden"
            style={{
              [position.includes('right') ? 'right' : 'left']: 0,
              [position.includes('bottom') ? 'bottom' : 'top']: '60px'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-white font-medium">Customize Your Guide</h3>
              <button
                onClick={handleCancel}
                className="text-white/60 hover:text-white/80 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voice Selection */}
            <div className="p-4 space-y-4">
              <div>
                <label className="text-white/60 text-sm mb-2 block">Voice</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleVoiceChange('maya')}
                    className={`px-4 py-3 rounded-lg border transition-all flex flex-col items-center
                              ${config.voice === 'maya' 
                                ? 'bg-[#D4B896]/20 border-[#D4B896] text-white' 
                                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'}`}
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Maya</span>
                    <span className="text-xs opacity-60">Female</span>
                  </button>
                  
                  <button
                    onClick={() => handleVoiceChange('anthony')}
                    className={`px-4 py-3 rounded-lg border transition-all flex flex-col items-center
                              ${config.voice === 'anthony' 
                                ? 'bg-[#D4B896]/20 border-[#D4B896] text-white' 
                                : 'bg-white/5 border-white/20 text-white/60 hover:bg-white/10'}`}
                  >
                    <User className="w-5 h-5 mb-1" />
                    <span className="text-sm font-medium">Anthony</span>
                    <span className="text-xs opacity-60">Male</span>
                  </button>
                </div>
              </div>

              {/* Name Customization */}
              <div>
                <label className="text-white/60 text-sm mb-2 block">
                  Guide's Name
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={handleNameChange}
                  placeholder="Enter a custom name..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/20
                           text-white placeholder-white/40 focus:border-[#D4B896]
                           focus:outline-none focus:ring-1 focus:ring-[#D4B896]/50
                           transition-all"
                />
                <p className="text-xs text-white/40 mt-1">
                  Your guide will introduce themselves with this name
                </p>
              </div>

              {/* Voice Preview */}
              <button
                onClick={async () => {
                  try {
                    // Use ElevenLabs for preview
                    const text = `Hello, I'm ${customName}. ${config.voice === 'maya'
                      ? "It's good to see you."
                      : "Good to meet you."}`;

                    const response = await fetch('/api/oracle/preview-voice', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        text,
                        voice: config.voice
                      })
                    });

                    if (response.ok) {
                      const data = await response.json();
                      if (data.audio && data.audio !== 'web-speech-fallback') {
                        const audio = new Audio(data.audio);
                        audio.volume = 0.8;
                        audio.play().catch(() => {
                          // Fallback to Web Speech if audio fails
                          const utterance = new SpeechSynthesisUtterance(text);
                          utterance.pitch = config.voice === 'maya' ? 1.1 : 0.8;
                          utterance.rate = config.voice === 'maya' ? 1.0 : 0.95;
                          speechSynthesis.speak(utterance);
                        });
                      }
                    } else {
                      // Fallback to Web Speech
                      const utterance = new SpeechSynthesisUtterance(text);
                      utterance.pitch = config.voice === 'maya' ? 1.1 : 0.8;
                      utterance.rate = config.voice === 'maya' ? 1.0 : 0.95;
                      speechSynthesis.speak(utterance);
                    }
                  } catch (error) {
                    // Fallback to Web Speech on any error
                    const text = `Hello, I'm ${customName}.`;
                    const utterance = new SpeechSynthesisUtterance(text);
                    utterance.pitch = config.voice === 'maya' ? 1.1 : 0.8;
                    utterance.rate = config.voice === 'maya' ? 1.0 : 0.95;
                    speechSynthesis.speak(utterance);
                  }
                }}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/20
                         text-white/80 hover:bg-white/10 transition-all flex items-center
                         justify-center gap-2"
              >
                <Volume2 className="w-4 h-4" />
                <span className="text-sm">Preview Voice</span>
              </button>

              {/* Save/Cancel */}
              {hasChanges && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/20
                             text-white/60 hover:bg-white/10 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 rounded-lg bg-[#D4B896] text-white
                             hover:bg-[#D4B896]/80 transition-all text-sm flex items-center
                             justify-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Save
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};