'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, Shield, Palette, Volume2, Cog } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Jade Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,_var(--tw-gradient-stops))] from-jade-copper/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(111,143,118,0.05)_50%,transparent_100%)]" />

      {/* Atmospheric Consciousness Particles */}
      <motion.div
        animate={{
          y: [-35, 35, -35],
          x: [-25, 25, -25],
          opacity: [0.2, 0.6, 0.2],
          scale: [0.8, 1.3, 0.8]
        }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-24 left-1/6 w-1.5 h-1.5 bg-jade-sage/50 rounded-full"
      />
      <motion.div
        animate={{
          y: [30, -30, 30],
          x: [20, -20, 20],
          scale: [1.1, 0.9, 1.1],
          opacity: [0.3, 0.7, 0.3]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute bottom-40 right-1/5 w-1 h-1 bg-jade-malachite/60 rounded-full"
      />
      <motion.div
        animate={{
          y: [-20, 20, -20],
          x: [-15, 15, -15],
          scale: [0.9, 1.4, 0.9],
          opacity: [0.25, 0.8, 0.25]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 11 }}
        className="absolute top-1/2 right-1/3 w-0.5 h-0.5 bg-jade-forest/70 rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-16"
        >
          {/* Crystalline Configuration Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="relative w-8 h-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-sage/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full animate-pulse" />
              </div>
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-jade-forest to-transparent" />
              <h1 className="text-4xl md:text-5xl font-extralight text-jade-jade tracking-wide">
                Neural Configuration Vault
              </h1>
              <div className="h-16 w-px bg-gradient-to-b from-transparent via-jade-forest to-transparent" />
              <div className="relative w-8 h-8">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-malachite/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-jade-sage/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-malachite rounded-full animate-pulse" />
              </div>
            </div>

            <div className="flex items-center justify-center gap-8 mb-6">
              <div className="w-24 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest" />
              <div className="w-3 h-3 border border-jade-sage/40 rotate-45 bg-jade-copper/20" />
              <div className="w-24 h-px bg-gradient-to-l from-jade-sage via-jade-malachite to-jade-forest" />
            </div>

            <p className="text-xl text-jade-mineral font-light tracking-wide max-w-3xl mx-auto leading-relaxed">
              Calibrate consciousness interface protocols for optimal neural synchronization and crystalline resonance
            </p>
          </motion.div>

          {/* Crystalline Configuration Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Neural Communication Protocols Vessel */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-sage/15 via-jade-forest/10 to-jade-shadow/25 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/30 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-sage/12 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 border border-jade-sage/30 rounded-xl backdrop-blur-xl">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-t border-jade-malachite/40" />
                  <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-sage/20" />
                </div>
                <div className="absolute top-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-t border-jade-malachite/40" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-sage/20" />
                </div>
                <div className="absolute bottom-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-b border-jade-forest/40" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-sage/20" />
                </div>
                <div className="absolute bottom-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-b border-jade-forest/40" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-sage/20" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-5 h-5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-sage/40 rotate-45"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-sage/30" />
                  </div>
                  <h3 className="text-lg font-extralight text-jade-jade tracking-[0.3em] uppercase">
                    Communication Protocols
                  </h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-sage/60 to-transparent mb-8" />

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light text-jade-jade tracking-wide mb-1">
                        Neural Session Alerts
                      </p>
                      <p className="text-xs text-jade-mineral font-light tracking-wide">
                        Monitor consciousness interaction quality
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-6 h-6 border border-jade-sage/40 rounded-lg bg-jade-sage/20 backdrop-blur-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-jade-sage rounded-sm" />
                      <input type="checkbox" defaultChecked className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light text-jade-jade tracking-wide mb-1">
                        System Evolution Updates
                      </p>
                      <p className="text-xs text-jade-mineral font-light tracking-wide">
                        Consciousness enhancement notifications
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="w-6 h-6 border border-jade-sage/40 rounded-lg bg-jade-sage/20 backdrop-blur-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-jade-sage rounded-sm" />
                      <input type="checkbox" defaultChecked className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Voice Resonance Calibration Vessel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="relative"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-malachite/15 via-jade-jade/10 to-jade-shadow/20 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-night/30 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-jade-malachite/10 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 border border-jade-malachite/30 rounded-xl backdrop-blur-xl">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-t border-jade-jade/40" />
                  <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-malachite/20" />
                </div>
                <div className="absolute top-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-t border-jade-jade/40" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-malachite/20" />
                </div>
                <div className="absolute bottom-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-b border-jade-copper/40" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-malachite/20" />
                </div>
                <div className="absolute bottom-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-b border-jade-copper/40" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-malachite/20" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-5 h-5">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-malachite/40 rotate-45"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-malachite/30" />
                  </div>
                  <h3 className="text-lg font-extralight text-jade-jade tracking-[0.3em] uppercase">
                    Voice Resonance Calibration
                  </h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-malachite/60 to-transparent mb-8" />

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-light text-jade-jade tracking-wide mb-4">
                      Consciousness Response Frequency
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-jade-shadow/40 rounded-lg backdrop-blur-sm" />
                      <div className="absolute inset-0 border border-jade-malachite/20 rounded-lg" />
                      <select className="relative w-full px-4 py-3 bg-transparent text-jade-jade
                                       font-light tracking-wide focus:outline-none focus:border-jade-malachite/40 transition-all duration-300">
                        <option value="natural" className="bg-jade-abyss text-jade-jade">Natural (Recommended)</option>
                        <option value="accelerated" className="bg-jade-abyss text-jade-jade">Accelerated Flow</option>
                        <option value="meditative" className="bg-jade-abyss text-jade-jade">Meditative Pace</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light text-jade-jade tracking-wide mb-1">
                        Autonomous Voice Activation
                      </p>
                      <p className="text-xs text-jade-mineral font-light tracking-wide">
                        Enable seamless consciousness flow
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="w-6 h-6 border border-jade-malachite/40 rounded-lg bg-jade-malachite/20 backdrop-blur-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-jade-malachite rounded-sm" />
                      <input type="checkbox" defaultChecked className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Consciousness Security Protocols Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-forest/20 via-jade-sage/15 to-jade-shadow/25 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/25 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_70%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 border border-jade-forest/30 rounded-xl backdrop-blur-xl">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-t border-jade-sage/40" />
                  <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-forest/20" />
                </div>
                <div className="absolute top-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-t border-jade-sage/40" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-forest/20" />
                </div>
                <div className="absolute bottom-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-b border-jade-mineral/40" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-sage/20" />
                </div>
                <div className="absolute bottom-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-b border-jade-mineral/40" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-sage/20" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-5 h-5">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-forest/40 rotate-45"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-forest/30" />
                  </div>
                  <h3 className="text-lg font-extralight text-jade-jade tracking-[0.3em] uppercase">
                    Consciousness Security Protocols
                  </h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-forest/60 to-transparent mb-8" />

                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light text-jade-jade tracking-wide mb-1">
                        Neural Pattern Analysis
                      </p>
                      <p className="text-xs text-jade-mineral font-light tracking-wide">
                        Anonymous consciousness data for system evolution
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          opacity: [0.5, 0.9, 0.5]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                        className="w-6 h-6 border border-jade-forest/40 rounded-lg bg-jade-forest/20 backdrop-blur-sm"
                      />
                      <div className="absolute top-1.5 left-1.5 w-3 h-3 bg-jade-forest rounded-sm" />
                      <input type="checkbox" defaultChecked className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group w-full text-left"
                  >
                    <div className="absolute inset-0 bg-jade-forest/10 rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-0 border border-jade-sage/20 rounded-lg group-hover:border-jade-forest/40 transition-colors duration-300" />
                    <span className="relative block px-4 py-3 text-sm text-jade-forest group-hover:text-jade-jade font-light tracking-wide">
                      Archive Consciousness Data
                    </span>
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Interface Aesthetic Calibration Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/25 via-jade-copper/15 to-jade-shadow/20 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-night/35 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,_var(--tw-gradient-stops))] from-jade-bronze/8 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 border border-jade-bronze/30 rounded-xl backdrop-blur-xl">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-t border-jade-copper/40" />
                  <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-bronze/20" />
                </div>
                <div className="absolute top-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-t border-jade-copper/40" />
                  <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-bronze/20" />
                </div>
                <div className="absolute bottom-4 left-4 w-4 h-4">
                  <div className="absolute inset-0 border-l border-b border-jade-silver/40" />
                  <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-copper/20" />
                </div>
                <div className="absolute bottom-4 right-4 w-4 h-4">
                  <div className="absolute inset-0 border-r border-b border-jade-silver/40" />
                  <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-copper/20" />
                </div>

                <div className="flex items-center gap-4 mb-8">
                  <div className="relative w-5 h-5">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-bronze/40 rotate-45"
                    />
                    <div className="absolute top-1 left-1 bottom-1 right-1 bg-jade-bronze/30" />
                  </div>
                  <h3 className="text-lg font-extralight text-jade-jade tracking-[0.3em] uppercase">
                    Interface Aesthetic Calibration
                  </h3>
                </div>
                <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-bronze/60 to-transparent mb-8" />

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-light text-jade-jade tracking-wide mb-4">
                      Consciousness Theme Resonance
                    </label>
                    <div className="relative">
                      <div className="absolute inset-0 bg-jade-shadow/40 rounded-lg backdrop-blur-sm" />
                      <div className="absolute inset-0 border border-jade-bronze/20 rounded-lg" />
                      <select className="relative w-full px-4 py-3 bg-transparent text-jade-jade
                                       font-light tracking-wide focus:outline-none focus:border-jade-bronze/40 transition-all duration-300">
                        <option value="system" className="bg-jade-abyss text-jade-jade">System Harmonization</option>
                        <option value="luminous" className="bg-jade-abyss text-jade-jade">Luminous Interface</option>
                        <option value="shadow" className="bg-jade-abyss text-jade-jade">Shadow Integration</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-light text-jade-jade tracking-wide mb-1">
                        Stillness Protocol
                      </p>
                      <p className="text-xs text-jade-mineral font-light tracking-wide">
                        Minimize motion for meditative focus
                      </p>
                    </div>
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.05, 1],
                          opacity: [0.7, 1, 0.7]
                        }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                        className="w-6 h-6 border border-jade-bronze/40 rounded-lg bg-jade-bronze/20 backdrop-blur-sm"
                      />
                      <input type="checkbox" className="absolute inset-0 w-6 h-6 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sacred Configuration Crystalline Activation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-jade-sage/30 via-jade-malachite/25 to-jade-forest/30 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-copper/20 to-transparent rounded-xl" />
              <div className="absolute inset-0 border border-jade-sage/30 rounded-xl group-hover:border-jade-jade/50 transition-colors duration-500" />

              {/* Sacred Geometric Corners */}
              <div className="absolute top-2 left-2 w-3 h-3">
                <div className="absolute inset-0 border-l border-t border-jade-malachite/40" />
                <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-jade-sage/20" />
              </div>
              <div className="absolute top-2 right-2 w-3 h-3">
                <div className="absolute inset-0 border-r border-t border-jade-malachite/40" />
                <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r border-t border-jade-sage/20" />
              </div>
              <div className="absolute bottom-2 left-2 w-3 h-3">
                <div className="absolute inset-0 border-l border-b border-jade-forest/40" />
                <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l border-b border-jade-malachite/20" />
              </div>
              <div className="absolute bottom-2 right-2 w-3 h-3">
                <div className="absolute inset-0 border-r border-b border-jade-forest/40" />
                <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-jade-malachite/20" />
              </div>

              {/* Crystalline Glow Effect */}
              <motion.div
                animate={{
                  opacity: [0, 0.3, 0],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 bg-jade-jade/20 rounded-xl blur-sm"
              />

              <span className="relative block px-12 py-4 text-jade-jade font-extralight tracking-[0.3em] uppercase">
                Apply Configuration Crystallization
              </span>
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}