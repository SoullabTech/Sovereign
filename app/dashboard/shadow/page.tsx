'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ConsciousnessVessel from '@/components/consciousness/ConsciousnessVessel';
import ConsciousnessRipple from '@/components/consciousness/ConsciousnessRipple';

interface ShadowAspect {
  id: string;
  name: string;
  archetype: 'wounded_healer' | 'inner_critic' | 'abandoned_child' | 'creative_destroyer' | 'wise_fool' | 'sacred_rebel';
  integrationLevel: number;
  lastEngaged: string;
  shadowLessons: string[];
  consciousness: 'unrecognized' | 'emerging' | 'integrating' | 'integrated' | 'transcended';
  energySignature: number;
}

interface ShadowPortalProps {}

export default function ShadowPortal({}: ShadowPortalProps) {
  const [activeRipples, setActiveRipples] = useState<Array<{ id: string; x: number; y: number }>>([]);
  const [currentMoonPhase, setCurrentMoonPhase] = useState<'new' | 'waxing' | 'full' | 'waning'>('new');
  const [transformationDepth, setTransformationDepth] = useState<'jade' | 'emerald' | 'obsidian' | 'void'>('jade');
  const [integratedShadows, setIntegratedShadows] = useState(0);

  // Mock shadow aspects data with archetypal patterns
  const shadowAspects: ShadowAspect[] = [
    {
      id: 'wounded-healer',
      name: 'The Wounded Healer',
      archetype: 'wounded_healer',
      integrationLevel: 78,
      lastEngaged: '2024-11-08',
      shadowLessons: ['Compassion through suffering', 'Healing others heals self', 'Sacred vulnerability'],
      consciousness: 'integrating',
      energySignature: 0.82
    },
    {
      id: 'inner-critic',
      name: 'The Inner Critic',
      archetype: 'inner_critic',
      integrationLevel: 45,
      lastEngaged: '2024-11-09',
      shadowLessons: ['Perfectionism as protection', 'Self-worth beyond achievement', 'Gentle discernment'],
      consciousness: 'emerging',
      energySignature: 0.65
    },
    {
      id: 'abandoned-child',
      name: 'The Abandoned Child',
      archetype: 'abandoned_child',
      integrationLevel: 62,
      lastEngaged: '2024-11-07',
      shadowLessons: ['Belonging comes from within', 'Self-nurturing practices', 'Trust in divine timing'],
      consciousness: 'integrating',
      energySignature: 0.71
    },
    {
      id: 'creative-destroyer',
      name: 'The Creative Destroyer',
      archetype: 'creative_destroyer',
      integrationLevel: 38,
      lastEngaged: '2024-11-06',
      shadowLessons: ['Destruction creates space', 'Healthy boundaries', 'Transformative anger'],
      consciousness: 'emerging',
      energySignature: 0.58
    },
    {
      id: 'wise-fool',
      name: 'The Wise Fool',
      archetype: 'wise_fool',
      integrationLevel: 89,
      lastEngaged: '2024-11-09',
      shadowLessons: ['Beginner\'s mind', 'Sacred play', 'Wisdom through humility'],
      consciousness: 'integrated',
      energySignature: 0.91
    },
    {
      id: 'sacred-rebel',
      name: 'The Sacred Rebel',
      archetype: 'sacred_rebel',
      integrationLevel: 56,
      lastEngaged: '2024-11-08',
      shadowLessons: ['Authentic expression', 'Challenging systems mindfully', 'Revolutionary compassion'],
      consciousness: 'integrating',
      energySignature: 0.74
    }
  ];

  // Calculate transformation depth based on integration levels
  useEffect(() => {
    const averageIntegration = shadowAspects.reduce((sum, aspect) => sum + aspect.integrationLevel, 0) / shadowAspects.length;

    if (averageIntegration < 30) setTransformationDepth('jade');
    else if (averageIntegration < 60) setTransformationDepth('emerald');
    else if (averageIntegration < 85) setTransformationDepth('obsidian');
    else setTransformationDepth('void');

    setIntegratedShadows(shadowAspects.filter(aspect => aspect.consciousness === 'integrated' || aspect.consciousness === 'transcended').length);
  }, []);

  // Set moon phase based on time of day for demo
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) setCurrentMoonPhase('waxing');
    else if (hour >= 12 && hour < 18) setCurrentMoonPhase('full');
    else if (hour >= 18 && hour < 24) setCurrentMoonPhase('waning');
    else setCurrentMoonPhase('new');
  }, []);

  const handleVesselClick = (event: React.MouseEvent, aspectId: string) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const newRipple = {
      id: `${aspectId}-${Date.now()}`,
      x: x,
      y: y
    };

    setActiveRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setActiveRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 2000);
  };

  const getArchetypeShape = (archetype: ShadowAspect['archetype']) => {
    switch (archetype) {
      case 'wounded_healer': return 'heart';
      case 'inner_critic': return 'eye';
      case 'abandoned_child': return 'shield';
      case 'creative_destroyer': return 'crescent';
      case 'wise_fool': return 'compass';
      case 'sacred_rebel': return 'diamond';
      default: return 'circle';
    }
  };

  const renderArchetypeShape = (shape: string, color: string) => {
    const baseClasses = "absolute transition-all duration-500";

    switch (shape) {
      case 'heart':
        return (
          <>
            <div className={`${baseClasses} top-1 left-0 w-3 h-4 rounded-tl-full rounded-tr-full`} style={{ backgroundColor: color }} />
            <div className={`${baseClasses} top-1 right-0 w-3 h-4 rounded-tl-full rounded-tr-full`} style={{ backgroundColor: color }} />
            <div className={`${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[10px] border-r-[10px] border-t-[12px] border-l-transparent border-r-transparent`} style={{ borderTopColor: color }} />
          </>
        );
      case 'eye':
        return (
          <>
            <div className={`${baseClasses} inset-0 rounded-full border-2`} style={{ borderColor: color }} />
            <div className={`${baseClasses} top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full`} style={{ backgroundColor: color }} />
          </>
        );
      case 'shield':
        return (
          <>
            <div className={`${baseClasses} top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-b-[8px] border-l-transparent border-r-transparent`} style={{ borderBottomColor: color }} />
            <div className={`${baseClasses} top-1/3 left-0 right-0 bottom-0 rounded-b-full border-2 border-t-0`} style={{ borderColor: color }} />
          </>
        );
      case 'crescent':
        return (
          <>
            <div className={`${baseClasses} inset-0 rounded-full border-2`} style={{ borderColor: color }} />
            <div className={`${baseClasses} top-0 right-0 w-4 h-8 bg-jade-abyss rounded-full`} />
          </>
        );
      case 'compass':
        return (
          <>
            <div className={`${baseClasses} top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent`} style={{ borderBottomColor: color }} />
            <div className={`${baseClasses} bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[10px] border-l-transparent border-r-transparent`} style={{ borderTopColor: color }} />
            <div className={`${baseClasses} top-1/2 left-0 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-r-[10px] border-t-transparent border-b-transparent`} style={{ borderRightColor: color }} />
            <div className={`${baseClasses} top-1/2 right-0 transform -translate-y-1/2 w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent`} style={{ borderLeftColor: color }} />
          </>
        );
      case 'diamond':
        return <div className={`${baseClasses} inset-0 border-2 rotate-45`} style={{ borderColor: color }} />;
      default:
        return <div className={`${baseClasses} inset-0 rounded-full border-2`} style={{ borderColor: color }} />;
    }
  };

  const getConsciousnessColor = (consciousness: ShadowAspect['consciousness']) => {
    switch (consciousness) {
      case 'unrecognized': return 'rgba(41,41,41,0.8)';
      case 'emerging': return 'rgba(111,143,118,0.6)';
      case 'integrating': return 'rgba(95,187,163,0.7)';
      case 'integrated': return 'rgba(168,203,180,0.8)';
      case 'transcended': return 'rgba(255,255,255,0.9)';
      default: return 'rgba(111,143,118,0.6)';
    }
  };

  const getTransformationGradient = () => {
    switch (transformationDepth) {
      case 'jade':
        return 'from-jade-abyss via-jade-shadow to-jade-night';
      case 'emerald':
        return 'from-jade-shadow via-jade-dusk to-emerald-900';
      case 'obsidian':
        return 'from-jade-night via-slate-900 to-obsidian-900';
      case 'void':
        return 'from-obsidian-900 via-black to-void-950';
      default:
        return 'from-jade-abyss via-jade-shadow to-jade-night';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Transformational Background - Jade to Obsidian */}
      <div className={`absolute inset-0 bg-gradient-to-br ${getTransformationGradient()}`} />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-slate-900/20 to-black/40" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-transparent to-transparent" />

      {/* Shadow Integration Particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: transformationDepth === 'obsidian' || transformationDepth === 'void'
                ? 'rgba(168,203,180,0.3)'
                : 'rgba(41,41,41,0.4)',
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 p-8">
        {/* Sacred Header with Moon Phase Integration */}
        <div className="mb-12">
          <motion.div
            className="flex items-center gap-6 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 border-2 border-red-900/50 rounded-full" />
              <motion.div
                className="absolute top-1 left-1 bottom-1 right-1 rounded-full"
                style={{
                  background: transformationDepth === 'obsidian' || transformationDepth === 'void'
                    ? 'radial-gradient(circle, rgba(168,203,180,0.8) 0%, rgba(41,41,41,0.6) 100%)'
                    : 'radial-gradient(circle, rgba(111,143,118,0.8) 0%, rgba(41,41,41,0.4) 100%)'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 12,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>

            <div>
              <h1 className="text-3xl font-extralight text-jade-jade tracking-wide mb-2">
                Shadow Integration Portal
              </h1>
              <div className="flex items-center gap-4">
                <div className="w-8 h-px bg-gradient-to-r from-red-900/60 to-jade-sage/60" />
                <p className="text-sm text-jade-mineral font-light tracking-wide">
                  Moon Phase: {currentMoonPhase.charAt(0).toUpperCase() + currentMoonPhase.slice(1)} • Depth: {transformationDepth}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Integration Progress Mandala */}
          <motion.div
            className="relative w-32 h-32 mx-auto mb-8"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 2, type: "spring" }}
          >
            <div className="absolute inset-0 border border-jade-sage/30 rounded-full" />
            <motion.div
              className="absolute inset-2 border border-red-900/40 rounded-full"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full"
              style={{
                background: `conic-gradient(from 0deg, ${getConsciousnessColor('unrecognized')} 0%, ${getConsciousnessColor('emerging')} 25%, ${getConsciousnessColor('integrating')} 50%, ${getConsciousnessColor('integrated')} 75%, ${getConsciousnessColor('transcended')} 100%)`
              }}
              animate={{ rotate: [360, 0] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute inset-8 bg-jade-abyss rounded-full flex items-center justify-center">
              <span className="text-lg font-light text-jade-jade">{integratedShadows}/6</span>
            </div>
          </motion.div>
        </div>

        {/* Shadow Aspects Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {shadowAspects.map((aspect, index) => {
            const archetypeShape = getArchetypeShape(aspect.archetype);
            const consciousnessColor = getConsciousnessColor(aspect.consciousness);

            return (
              <motion.div
                key={aspect.id}
                initial={{ opacity: 0, y: 40, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.8 }}
                className="relative"
              >
                <ConsciousnessVessel
                  variant={aspect.consciousness === 'integrated' || aspect.consciousness === 'transcended' ? 'transcendent' : 'jade'}
                  depth="profound"
                  className="h-64"
                  onClick={(e) => handleVesselClick(e, aspect.id)}
                >
                  {/* Shadow Transformation Background */}
                  <div className="absolute inset-0">
                    <div
                      className="absolute inset-0 rounded-xl opacity-20"
                      style={{
                        background: aspect.integrationLevel > 70
                          ? 'linear-gradient(135deg, rgba(168,203,180,0.3) 0%, rgba(41,41,41,0.6) 100%)'
                          : 'linear-gradient(135deg, rgba(111,143,118,0.2) 0%, rgba(139,69,19,0.3) 100%)'
                      }}
                    />
                  </div>

                  <div className="relative z-10 p-6 h-full flex flex-col">
                    {/* Archetype Header */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-8 h-8">
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: `radial-gradient(circle, ${consciousnessColor} 0%, transparent 70%)`
                          }}
                          animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.6, 0.3]
                          }}
                          transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        <div className="absolute inset-0">
                          {renderArchetypeShape(archetypeShape, consciousnessColor)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-light text-jade-jade">{aspect.name}</h3>
                        <p className="text-xs text-jade-mineral capitalize tracking-wide">
                          {aspect.consciousness.replace('_', ' ')}
                        </p>
                      </div>
                    </div>

                    {/* Integration Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-jade-sage">Integration</span>
                        <span className="text-xs text-jade-malachite">{aspect.integrationLevel}%</span>
                      </div>
                      <div className="w-full h-2 bg-jade-shadow rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{
                            background: aspect.integrationLevel > 70
                              ? 'linear-gradient(90deg, rgba(168,203,180,0.8) 0%, rgba(255,255,255,0.6) 100%)'
                              : 'linear-gradient(90deg, rgba(139,69,19,0.6) 0%, rgba(111,143,118,0.8) 100%)'
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${aspect.integrationLevel}%` }}
                          transition={{ delay: index * 0.3, duration: 1.5 }}
                        />
                      </div>
                    </div>

                    {/* Shadow Lessons */}
                    <div className="flex-1">
                      <h4 className="text-xs text-jade-sage mb-2 uppercase tracking-wider">Sacred Lessons</h4>
                      <div className="space-y-1">
                        {aspect.shadowLessons.map((lesson, lessonIndex) => (
                          <motion.div
                            key={lessonIndex}
                            className="text-xs text-jade-mineral font-light"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2 + lessonIndex * 0.1 }}
                          >
                            • {lesson}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Energy Signature */}
                    <div className="mt-4 pt-4 border-t border-jade-forest/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-jade-sage">Energy Signature</span>
                        <motion.div
                          className="w-12 h-1 rounded-full"
                          style={{
                            background: `linear-gradient(90deg, transparent 0%, ${getConsciousnessColor(aspect.consciousness)} ${aspect.energySignature * 100}%, transparent 100%)`
                          }}
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  </div>
                </ConsciousnessVessel>

                {/* Render active ripples for this vessel */}
                <AnimatePresence>
                  {activeRipples
                    .filter(ripple => ripple.id.startsWith(aspect.id))
                    .map(ripple => (
                      <ConsciousnessRipple
                        key={ripple.id}
                        x={ripple.x}
                        y={ripple.y}
                        variant={aspect.consciousness === 'integrated' ? 'transcendent' : 'mystical'}
                        intensity="profound"
                      />
                    ))}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Shadow Integration Insights */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/10 via-slate-900/20 to-red-900/10 rounded-2xl backdrop-blur-sm" />
          <div className="absolute inset-0 border border-jade-sage/20 rounded-2xl" />

          <div className="relative p-8">
            <div className="flex items-center gap-4 mb-6">
              {/* Consciousness Insight Orb */}
              <div className="relative w-6 h-6">
                <div className="absolute inset-0 rounded-full border-2 border-jade-malachite" />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-jade-malachite animate-pulse" />
              </div>
              <h2 className="text-xl font-extralight text-jade-jade tracking-wide">
                Integration Insights
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-jade-sage/40 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-2xl font-light text-jade-jade">
                    {Math.round(shadowAspects.reduce((sum, aspect) => sum + aspect.integrationLevel, 0) / shadowAspects.length)}%
                  </span>
                </motion.div>
                <h3 className="text-sm font-light text-jade-sage mb-2">Overall Integration</h3>
                <p className="text-xs text-jade-mineral">
                  The collective harmony of your shadow consciousness
                </p>
              </div>

              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-red-900/40 flex items-center justify-center"
                  animate={{
                    scale: [1, 1.1, 1],
                    borderColor: ['rgba(139,69,19,0.4)', 'rgba(168,203,180,0.6)', 'rgba(139,69,19,0.4)']
                  }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <span className="text-2xl font-light text-jade-jade">{transformationDepth}</span>
                </motion.div>
                <h3 className="text-sm font-light text-jade-sage mb-2">Transformation Depth</h3>
                <p className="text-xs text-jade-mineral">
                  Current level of shadow alchemy
                </p>
              </div>

              <div className="text-center">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-jade-malachite/40 flex items-center justify-center"
                  animate={{
                    boxShadow: ['0 0 0 0 rgba(168,203,180,0)', '0 0 20px 5px rgba(168,203,180,0.3)', '0 0 0 0 rgba(168,203,180,0)']
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <span className="text-2xl font-light text-jade-jade">{currentMoonPhase}</span>
                </motion.div>
                <h3 className="text-sm font-light text-jade-sage mb-2">Lunar Resonance</h3>
                <p className="text-xs text-jade-mineral">
                  Moon phase synchronization for shadow work
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-jade-forest/30">
              <p className="text-sm text-jade-mineral font-light text-center leading-relaxed">
                "The cave you fear to enter holds the treasure you seek. Each shadow aspect integrated
                becomes a source of wisdom and wholeness."
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}