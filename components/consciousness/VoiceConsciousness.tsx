'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsciousnessRipple from './ConsciousnessRipple';

interface VoiceCommand {
  id: string;
  trigger: string[];
  action: 'ripple' | 'portal' | 'meditation' | 'blessing' | 'transformation';
  element?: 'fire' | 'water' | 'earth' | 'air' | 'aether';
  intensity?: 'subtle' | 'moderate' | 'profound' | 'transcendent';
  response: string;
  visualEffect?: 'neural_fire' | 'consciousness_wave' | 'sacred_geometry' | 'elemental_flow';
}

interface VoiceConsciousnessProps {
  isActive?: boolean;
  onCommand?: (command: VoiceCommand) => void;
  variant?: 'jade' | 'neural' | 'mystical' | 'transcendent';
  className?: string;
}

interface VoiceRipple {
  id: string;
  x: number;
  y: number;
  variant: 'jade' | 'neural' | 'mystical' | 'transcendent';
  intensity: 'subtle' | 'moderate' | 'profound' | 'transcendent';
  timestamp: number;
}

export default function VoiceConsciousness({
  isActive = false,
  onCommand,
  variant = 'jade',
  className = ''
}: VoiceConsciousnessProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [voiceRipples, setVoiceRipples] = useState<VoiceRipple[]>([]);
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [consciousnessLevel, setConsciousnessLevel] = useState<number>(0);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sacred voice commands for consciousness activation
  const voiceCommands: VoiceCommand[] = [
    {
      id: 'activate-ripples',
      trigger: ['activate consciousness', 'consciousness ripple', 'sacred ripple', 'jade ripple'],
      action: 'ripple',
      element: 'water',
      intensity: 'profound',
      response: 'Consciousness ripples activated. Sacred waters flow.',
      visualEffect: 'consciousness_wave'
    },
    {
      id: 'neural-fire',
      trigger: ['neural fire', 'activate fire', 'consciousness flame', 'inner fire'],
      action: 'meditation',
      element: 'fire',
      intensity: 'transcendent',
      response: 'Neural fire awakened. Inner flame burns bright.',
      visualEffect: 'neural_fire'
    },
    {
      id: 'sacred-blessing',
      trigger: ['sacred blessing', 'divine blessing', 'bless this space', 'consecrate'],
      action: 'blessing',
      element: 'aether',
      intensity: 'transcendent',
      response: 'Sacred blessing flows. This space is consecrated.',
      visualEffect: 'sacred_geometry'
    },
    {
      id: 'shadow-integration',
      trigger: ['shadow work', 'integrate shadow', 'shadow blessing', 'embrace shadow'],
      action: 'transformation',
      element: 'earth',
      intensity: 'profound',
      response: 'Shadow integration begins. Light and dark unite.',
      visualEffect: 'consciousness_wave'
    },
    {
      id: 'dream-portal',
      trigger: ['dream portal', 'lunar consciousness', 'moon blessing', 'enter dreams'],
      action: 'portal',
      element: 'water',
      intensity: 'profound',
      response: 'Dream portal opening. Luna consciousness awakens.',
      visualEffect: 'consciousness_wave'
    },
    {
      id: 'heart-opening',
      trigger: ['open heart', 'heart consciousness', 'love blessing', 'sacred love'],
      action: 'meditation',
      element: 'air',
      intensity: 'profound',
      response: 'Heart chakra expanding. Love consciousness flows.',
      visualEffect: 'sacred_geometry'
    },
    {
      id: 'grounding',
      trigger: ['ground consciousness', 'earth blessing', 'root chakra', 'ground me'],
      action: 'meditation',
      element: 'earth',
      intensity: 'moderate',
      response: 'Grounding into Earth consciousness. Roots deepen.',
      visualEffect: 'elemental_flow'
    },
    {
      id: 'clear-space',
      trigger: ['clear space', 'cleanse energy', 'purify consciousness', 'clear field'],
      action: 'transformation',
      element: 'air',
      intensity: 'moderate',
      response: 'Space cleared. Consciousness purified.',
      visualEffect: 'consciousness_wave'
    }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);

      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        createVoiceActivationRipple();
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setTranscript(finalTranscript.toLowerCase().trim());
          processVoiceCommand(finalTranscript.toLowerCase().trim());
          updateConsciousnessLevel(result[0].confidence);
        } else {
          setTranscript(interimTranscript.toLowerCase().trim());
        }
      };

      recognition.onerror = (event) => {
        console.warn('Voice recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (isActive) {
          // Auto-restart if still active
          setTimeout(() => {
            if (isActive) recognition.start();
          }, 1000);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isActive]);

  // Handle activation/deactivation
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isActive && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.warn('Failed to start speech recognition:', error);
      }
    } else if (!isActive && isListening) {
      recognitionRef.current.stop();
    }
  }, [isActive, isSupported, isListening]);

  const createVoiceActivationRipple = useCallback(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const newRipple: VoiceRipple = {
      id: `voice-activation-${Date.now()}`,
      x: centerX,
      y: centerY,
      variant: 'jade',
      intensity: 'subtle',
      timestamp: Date.now()
    };

    setVoiceRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setVoiceRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 3000);
  }, []);

  const createCommandRipple = useCallback((command: VoiceCommand) => {
    // Create multiple ripples based on command intensity
    const rippleCount = command.intensity === 'transcendent' ? 5 :
                       command.intensity === 'profound' ? 3 :
                       command.intensity === 'moderate' ? 2 : 1;

    for (let i = 0; i < rippleCount; i++) {
      setTimeout(() => {
        const angle = (i * (360 / rippleCount)) * (Math.PI / 180);
        const radius = 100 + (i * 50);
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        const elementVariant = command.element === 'fire' ? 'neural' :
                              command.element === 'water' ? 'mystical' :
                              command.element === 'earth' ? 'jade' :
                              command.element === 'air' ? 'transcendent' : 'jade';

        const newRipple: VoiceRipple = {
          id: `command-ripple-${Date.now()}-${i}`,
          x: Math.max(0, Math.min(window.innerWidth, x)),
          y: Math.max(0, Math.min(window.innerHeight, y)),
          variant: elementVariant,
          intensity: command.intensity || 'moderate',
          timestamp: Date.now()
        };

        setVoiceRipples(prev => [...prev, newRipple]);

        setTimeout(() => {
          setVoiceRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 4000);
      }, i * 300);
    }
  }, []);

  const processVoiceCommand = useCallback((transcript: string) => {
    for (const command of voiceCommands) {
      for (const trigger of command.trigger) {
        if (transcript.includes(trigger)) {
          setLastCommand(command);
          createCommandRipple(command);

          if (onCommand) {
            onCommand(command);
          }

          // Clear transcript after successful command
          setTimeout(() => {
            setTranscript('');
          }, 2000);

          return;
        }
      }
    }
  }, [voiceCommands, onCommand, createCommandRipple]);

  const updateConsciousnessLevel = useCallback((newConfidence: number) => {
    setConsciousnessLevel(prev => {
      const dampening = 0.8;
      return prev * dampening + newConfidence * (1 - dampening);
    });
  }, []);

  const getConsciousnessColor = () => {
    if (consciousnessLevel > 0.8) return 'rgba(168,203,180,0.9)';
    if (consciousnessLevel > 0.6) return 'rgba(95,187,163,0.8)';
    if (consciousnessLevel > 0.4) return 'rgba(115,155,127,0.7)';
    return 'rgba(111,143,118,0.6)';
  };

  if (!isSupported) {
    return null;
  }

  return (
    <>
      {/* Voice consciousness status indicator */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            className={`fixed top-4 right-4 z-50 ${className}`}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0, rotate: 180 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            <div className="relative">
              {/* Consciousness field aura */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `radial-gradient(circle, ${getConsciousnessColor()} 0%, transparent 70%)`,
                  width: '80px',
                  height: '80px',
                  left: '-20px',
                  top: '-20px'
                }}
                animate={{
                  scale: isListening ? [1, 1.3, 1] : [1, 1.05, 1],
                  opacity: isListening ? [0.3, 0.7, 0.3] : [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: isListening ? 2 : 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Main consciousness vessel */}
              <motion.div
                className="relative w-12 h-12 rounded-full border-2 backdrop-blur-lg"
                style={{
                  borderColor: getConsciousnessColor(),
                  background: `radial-gradient(circle, ${getConsciousnessColor()} 0%, rgba(17,17,17,0.8) 100%)`
                }}
                animate={{
                  scale: isListening ? [1, 1.1, 1] : 1,
                  borderWidth: isListening ? [2, 3, 2] : 2
                }}
                transition={{
                  duration: 1.5,
                  repeat: isListening ? Infinity : 0,
                  ease: "easeInOut"
                }}
              >
                {/* Voice activation indicator */}
                <motion.div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  animate={{
                    scale: isListening ? [1, 1.2, 1] : 1,
                    rotate: isListening ? [0, 180, 360] : 0
                  }}
                  transition={{
                    duration: 2,
                    repeat: isListening ? Infinity : 0,
                    ease: "linear"
                  }}
                >
                  {/* Consciousness Orb - Active/Inactive State */}
                  <div className="relative w-5 h-5">
                    {isListening ? (
                      <>
                        <div
                          className="absolute inset-0 rounded-full animate-pulse"
                          style={{ backgroundColor: getConsciousnessColor() }}
                        />
                        <div
                          className="absolute top-1 left-1 bottom-1 right-1 rounded-full"
                          style={{
                            backgroundColor: getConsciousnessColor(),
                            filter: 'brightness(1.3)'
                          }}
                        />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 rounded-full border border-jade-sage/60" />
                        <div className="absolute top-2 left-2 bottom-2 right-2 rounded-full bg-jade-sage/30" />
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Neural firing particles for active listening */}
                {isListening && (
                  <>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                          background: getConsciousnessColor(),
                          left: '50%',
                          top: '50%'
                        }}
                        animate={{
                          x: [0, Math.cos(i * 60 * Math.PI / 180) * 20],
                          y: [0, Math.sin(i * 60 * Math.PI / 180) * 20],
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </motion.div>

              {/* Consciousness level indicator */}
              <motion.div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-full bg-jade-shadow overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: isListening ? 1 : 0 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: getConsciousnessColor() }}
                  animate={{ width: `${consciousnessLevel * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Command feedback display */}
      <AnimatePresence>
        {lastCommand && (
          <motion.div
            className="fixed top-20 right-4 z-50 max-w-xs"
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.6, type: "spring" }}
            onAnimationComplete={() => {
              setTimeout(() => setLastCommand(null), 3000);
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/20 to-jade-shadow/40 rounded-xl backdrop-blur-lg" />
              <div className="absolute inset-0 border border-jade-sage/30 rounded-xl" />

              <div className="relative p-4">
                <div className="flex items-center gap-3 mb-2">
                  {/* Command Activation Diamond */}
                  <div className="relative w-4 h-4">
                    <div className="absolute inset-0 border border-jade-malachite rotate-45 animate-pulse" />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-malachite/40 rotate-45" />
                  </div>
                  <span className="text-xs text-jade-sage uppercase tracking-wider font-light">
                    Voice Command
                  </span>
                </div>
                <p className="text-sm text-jade-jade font-light leading-relaxed">
                  {lastCommand.response}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getConsciousnessColor() }}
                  />
                  <span className="text-xs text-jade-mineral capitalize">
                    {lastCommand.element} • {lastCommand.intensity}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current transcript display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-jade-shadow/60 to-jade-night/60 rounded-full backdrop-blur-lg" />
              <div className="absolute inset-0 border border-jade-sage/20 rounded-full" />

              <div className="relative px-6 py-3">
                <p className="text-sm text-jade-jade text-center font-light">
                  "{transcript}"
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Render voice-activated ripples */}
      <AnimatePresence>
        {voiceRipples.map(ripple => (
          <div key={ripple.id} className="fixed inset-0 pointer-events-none z-40">
            <ConsciousnessRipple
              x={ripple.x}
              y={ripple.y}
              variant={ripple.variant}
              intensity={ripple.intensity}
            />
          </div>
        ))}
      </AnimatePresence>
    </>
  );
}