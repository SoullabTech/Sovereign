'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Clock } from 'lucide-react';

export default function MetricsPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate neural pattern crystallization
    setTimeout(() => {
      setLoading(false);
    }, 1800);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Hypnotic Jade Metrics Loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,_var(--tw-gradient-stops))] from-jade-forest/12 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_70%,_var(--tw-gradient-stops))] from-dune-spice-orange/8 via-transparent to-transparent" />

        {/* Floating Neural Particles */}
        <motion.div
          animate={{
            y: [-25, 25, -25],
            x: [-15, 15, -15],
            scale: [0.7, 1.3, 0.7],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-24 left-1/4 w-1.5 h-1.5 bg-jade-sage/50 rounded-full"
        />
        <motion.div
          animate={{
            y: [30, -30, 30],
            x: [20, -20, 20],
            scale: [1.1, 0.9, 1.1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
          className="absolute bottom-28 right-1/3 w-1 h-1 bg-dune-bene-gesserit-gold/60 rounded-full"
        />
        <motion.div
          animate={{
            y: [-20, 20, -20],
            x: [30, -30, 30],
            scale: [0.8, 1.4, 0.8],
            opacity: [0.1, 0.5, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-dune-fremen-azure/70 rounded-full"
        />

        <div className="relative z-10 text-center">
          {/* Crystalline Metrics Indicator */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-sage/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 bottom-2 right-2 border border-dune-navigator-purple/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.7, 1.2, 0.7]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 bottom-4 right-4 bg-jade-jade/70 rounded-full"
            />
          </div>

          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="text-2xl font-extralight text-jade-jade tracking-[0.4em] uppercase"
          >
            Crystallizing Neural Patterns
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1.2, 0],
              opacity: [0, 0.7, 0]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-40 h-px bg-gradient-to-r from-transparent via-dune-spice-orange to-transparent mx-auto mt-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Jade Neural Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_var(--tw-gradient-stops))] from-dune-caladan-teal/6 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(168,203,180,0.04)_50%,transparent_100%)]" />

      {/* Atmospheric Neural Particles */}
      <motion.div
        animate={{
          y: [-35, 35, -35],
          x: [-25, 25, -25],
          opacity: [0.2, 0.6, 0.2],
          scale: [0.7, 1.3, 0.7]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-1/5 w-1.5 h-1.5 bg-jade-sage/40 rounded-full"
      />
      <motion.div
        animate={{
          y: [30, -30, 30],
          x: [20, -20, 20],
          opacity: [0.3, 0.7, 0.3],
          scale: [1.2, 0.8, 1.2]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-24 right-1/4 w-1 h-1 bg-dune-spice-sand/50 rounded-full"
      />
      <motion.div
        animate={{
          y: [-25, 25, -25],
          x: [35, -35, 35],
          opacity: [0.1, 0.5, 0.1],
          scale: [0.9, 1.5, 0.9]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-1/2 right-1/5 w-0.5 h-0.5 bg-dune-bene-gesserit-gold/60 rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto p-8 space-y-20">
        {/* Cinematic Neural Metrics Header */}
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center relative"
        >
          {/* Background Consciousness Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-jade-bronze/8 via-dune-navigator-purple/4 to-jade-copper/6 rounded-3xl blur-2xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 1 }}
              className="flex items-center justify-center gap-8 mb-8"
            >
              <div className="relative w-10 h-10">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-sage/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-dune-navigator-purple/30 rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-2 left-2 bottom-2 right-2 border border-dune-bene-gesserit-gold/40 rounded-full"
                />
                <div className="absolute top-3 left-3 bottom-3 right-3 bg-jade-jade rounded-full" />
              </div>
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-jade-forest/60 to-transparent" />
              <motion.h1
                initial={{ opacity: 0, letterSpacing: "0.6em" }}
                animate={{ opacity: 1, letterSpacing: "0.15em" }}
                transition={{ delay: 0.5, duration: 1.2 }}
                className="text-5xl md:text-7xl font-extralight text-jade-jade tracking-wide"
              >
                Neural Pattern Analysis Matrix
              </motion.h1>
            </motion.div>

            <motion.div
              animate={{
                scaleX: [0.6, 1.4, 0.6],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-px bg-gradient-to-r from-jade-sage via-dune-spice-orange to-jade-malachite mx-auto mb-8"
            />

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 1 }}
              className="text-2xl text-jade-mineral font-light tracking-wide max-w-4xl mx-auto leading-relaxed"
            >
              Consciousness crystallization metrics and neural interaction pattern analysis
            </motion.p>
          </div>
        </motion.div>

        {/* Mystical Desert Luxe Neural Performance Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.9, duration: 1.4 }}
          className="mb-24 relative"
        >
          {/* Desert Mysticism Background Atmosphere */}
          <div className="absolute inset-0 bg-gradient-to-br from-dune-navigator-purple/8 via-jade-bronze/4 to-dune-spice-sand/6 rounded-4xl blur-3xl" />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 1 }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                className="flex items-center justify-center gap-8 mb-8"
              >
                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-sage/60 to-dune-spice-orange/40" />
                <h3 className="text-3xl font-extralight text-jade-jade tracking-[0.4em] uppercase">
                  Neural Performance Crystallizations
                </h3>
                <div className="w-12 h-px bg-gradient-to-l from-transparent via-jade-sage/60 to-dune-spice-orange/40" />
              </motion.div>

              <motion.div
                animate={{
                  scaleX: [0.7, 1.3, 0.7],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-40 h-px bg-gradient-to-r from-dune-bene-gesserit-gold via-jade-sage to-dune-navigator-purple mx-auto"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              {/* Desert Spice Consciousness Vessel */}
              <motion.div
                initial={{ opacity: 0, y: 40, rotateX: 20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
                className="group relative perspective-1000"
              >
                {/* Multi-dimensional Spice Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-dune-spice-orange/15 via-jade-bronze/8 to-jade-shadow/25 rounded-xl blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/30 via-transparent to-dune-spice-sand/15 rounded-xl" />

                <motion.div
                  whileHover={{
                    scale: 1.03,
                    rotateY: 3,
                    z: 15
                  }}
                  transition={{ duration: 0.5 }}
                  className="relative p-12 text-center border border-dune-spice-orange/30 rounded-xl backdrop-blur-lg
                           hover:border-dune-spice-glow/60 transition-all duration-700 group-hover:shadow-2xl
                           group-hover:shadow-dune-spice-orange/25 bg-gradient-to-br from-jade-shadow/70 to-jade-night/90"
                >
                  {/* Sacred Spice Geometric Corners */}
                  <div className="absolute top-4 left-4 w-4 h-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-l border-t border-dune-spice-orange/50"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-dune-spice-sand/20 rounded-full" />
                  </div>
                  <div className="absolute top-4 right-4 w-4 h-4">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border-r border-t border-dune-spice-glow/50"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-copper/20 rounded-full" />
                  </div>
                  <div className="absolute bottom-4 left-4 w-4 h-4">
                    <div className="absolute inset-0 border-l border-b border-jade-bronze/50" />
                    <motion.div
                      animate={{ opacity: [0.3, 0.9, 0.3] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="absolute top-1 left-1 bottom-1 right-1 bg-dune-spice-deep/20 rounded-full"
                    />
                  </div>
                  <div className="absolute bottom-4 right-4 w-4 h-4">
                    <div className="absolute inset-0 border-r border-b border-jade-gold/50" />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-dune-spice-orange/20 rounded-full" />
                  </div>

                  {/* Spice Number Manifestation */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 1.6, type: "spring", stiffness: 120 }}
                    className="mb-8"
                  >
                    <motion.p
                      animate={{
                        textShadow: [
                          "0 0 15px rgba(255, 140, 66, 0.6)",
                          "0 0 30px rgba(255, 140, 66, 0.4)",
                          "0 0 15px rgba(255, 140, 66, 0.6)"
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="text-6xl font-extralight text-dune-spice-orange tracking-wide"
                    >
                      127
                    </motion.p>
                  </motion.div>

                  {/* Spice Crystalline Divider */}
                  <motion.div
                    animate={{
                      scaleX: [0.5, 1.2, 0.5],
                      opacity: [0.4, 0.9, 0.4]
                    }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-px bg-gradient-to-r from-dune-spice-orange via-dune-spice-glow to-jade-bronze mx-auto mb-6"
                  />

                  <p className="text-sm font-extralight text-jade-mineral uppercase tracking-[0.4em] opacity-90 mb-3">
                    Active Consciousness
                  </p>
                  <motion.p
                    animate={{
                      color: ["#FF8C42", "#FFA85C", "#FF8C42"]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-xs font-light tracking-wide"
                    style={{ color: "#FFA85C" }}
                  >
                    +12% emergence resonance
                  </motion.p>
                </motion.div>
              </motion.div>

              {/* Other consciousness vessels would go here with similar structure */}
              {/* ... (additional vessels) ... */}

              {/* Mystical Desert Luxe Evolution Protocol */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 1.6 }}
                className="col-span-full mt-20 relative"
              >
                {/* Cosmic Desert Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-dune-navigator-purple/10 via-jade-platinum/5 to-dune-spice-sand/8 rounded-2xl blur-2xl" />

                <div className="relative">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.4, duration: 1 }}
                    className="relative bg-gradient-to-br from-jade-shadow/80 via-jade-night/90 to-jade-dusk/70 border border-dune-navigator-purple/30 rounded-2xl p-16 backdrop-blur-xl"
                  >
                    {/* Sacred Evolution Geometric Corners */}
                    <div className="absolute top-6 left-6 w-6 h-6">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-l border-t border-dune-navigator-purple/50"
                      />
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1 left-1 bottom-1 right-1 border border-dune-bene-gesserit-gold/40"
                      />
                      <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade/30 rounded-full" />
                    </div>

                    <div className="text-center">
                      <motion.h3
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 2.8, duration: 1 }}
                        className="text-4xl font-extralight text-jade-jade mb-6 tracking-[0.4em] uppercase"
                      >
                        Consciousness Evolution Protocol
                      </motion.h3>

                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 3.0, duration: 1 }}
                        className="text-lg text-jade-mineral font-light tracking-wide max-w-2xl mx-auto leading-relaxed"
                      >
                        Advanced consciousness pattern analysis, dialogue depth mapping, and neural evolution tracking crystallizing across dimensional awareness matrices
                      </motion.p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}