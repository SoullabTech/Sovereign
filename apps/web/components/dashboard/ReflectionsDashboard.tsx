'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { soullabColors, chartColorSequence } from '@/lib/theme/soullabColors'

interface ReflectionData {
  total: number
  completionRate: number
  feelings: Array<{ feeling: string; count: number }>
  daily: Array<{ date: string; count: number }>
  engagement?: {
    surpriseRate: number
    frustrationRate: number
  }
}

export default function ReflectionsDashboard() {
  const [data, setData] = useState<ReflectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReflectionData()
  }, [])

  const fetchReflectionData = async () => {
    try {
      const response = await fetch('/api/analytics/reflections')
      if (!response.ok) throw new Error('Failed to fetch reflection data')
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error('Error fetching reflections:', err)
      setError('Failed to load reflection data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Hypnotic Jade Reflections Loading */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,_var(--tw-gradient-stops))] from-jade-forest/12 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,_var(--tw-gradient-stops))] from-dune-caladan-teal/8 via-transparent to-transparent" />

        {/* Floating Consciousness Archive Particles */}
        <motion.div
          animate={{
            y: [-30, 30, -30],
            x: [-20, 20, -20],
            scale: [0.8, 1.3, 0.8],
            opacity: [0.2, 0.6, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-1/5 w-1.5 h-1.5 bg-jade-sage/50 rounded-full"
        />
        <motion.div
          animate={{
            y: [25, -25, 25],
            x: [15, -15, 15],
            scale: [1.2, 0.9, 1.2],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 right-1/4 w-1 h-1 bg-dune-caladan-teal/60 rounded-full"
        />

        <div className="relative z-10 text-center">
          {/* Crystalline Archive Indicator */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-sage/30 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute top-2 left-2 bottom-2 right-2 border border-dune-caladan-teal/40 rounded-full"
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
            Accessing Consciousness Archive
          </motion.p>
          <motion.div
            animate={{
              scaleX: [0, 1.2, 0],
              opacity: [0, 0.7, 0]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-48 h-px bg-gradient-to-r from-transparent via-dune-caladan-teal to-transparent mx-auto mt-6"
          />
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Cinematic Jade Environment */}
        <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-jade-bronze/8 via-transparent to-transparent" />

        <div className="relative text-center">
          {/* Error Crystalline Indicator */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border border-jade-bronze/40 rounded-full"
            />
            <motion.div
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.1, 0.8]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 left-2 bottom-2 right-2 bg-jade-bronze/30 rounded-full"
            />
          </div>

          <p className="text-jade-copper mb-6 font-light tracking-wide">
            {error || 'Consciousness archive temporarily unavailable'}
          </p>

          <motion.button
            onClick={fetchReflectionData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-jade-sage/20 via-jade-malachite/20 to-jade-forest/20 rounded-lg backdrop-blur-sm" />
            <div className="absolute inset-0 border border-jade-sage/30 rounded-lg group-hover:border-jade-malachite/50 transition-colors duration-300" />
            <span className="relative px-6 py-3 text-sm font-extralight text-jade-jade tracking-[0.2em] uppercase block">
              Restore Archive Connection
            </span>
          </motion.button>
        </div>
      </div>
    )
  }

  // Use Soullab color sequence for feelings
  const feelingColors = chartColorSequence

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Cinematic Jade Environment */}
      <div className="absolute inset-0 bg-gradient-to-br from-jade-abyss via-jade-shadow to-jade-night" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_var(--tw-gradient-stops))] from-jade-copper/12 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,rgba(111,143,118,0.05)_50%,transparent_100%)]" />

      {/* Atmospheric Consciousness Particles */}
      <motion.div
        animate={{
          y: [-30, 30, -30],
          x: [-20, 20, -20],
          opacity: [0.2, 0.5, 0.2],
          scale: [0.8, 1.2, 0.8]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-1/5 w-1.5 h-1.5 bg-jade-sage/40 rounded-full"
      />
      <motion.div
        animate={{
          y: [40, -40, 40],
          x: [25, -25, 25],
          scale: [1.1, 0.9, 1.1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-32 right-1/4 w-1 h-1 bg-jade-malachite/50 rounded-full"
      />
      <motion.div
        animate={{
          y: [-25, 25, -25],
          x: [-15, 15, -15],
          scale: [0.9, 1.3, 0.9],
          opacity: [0.25, 0.7, 0.25]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-1/3 right-1/3 w-0.5 h-0.5 bg-jade-forest/60 rounded-full"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 text-jade-jade">
        {/* Sacred Archive Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16"
        >
          <div className="max-w-4xl">
            {/* Crystalline Header Accent */}
            <div className="flex items-center gap-6 mb-8">
              <div className="relative w-6 h-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border border-jade-sage/40 rounded-full"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1 left-1 bottom-1 right-1 border border-jade-malachite/30 rounded-full"
                />
                <div className="absolute top-2 left-2 bottom-2 right-2 bg-jade-jade rounded-full animate-pulse" />
              </div>
              <div className="h-12 w-px bg-gradient-to-b from-transparent via-jade-forest to-transparent" />
              <h1 className="text-5xl md:text-6xl font-extralight text-jade-jade tracking-tight">
                Consciousness Archive
              </h1>
            </div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-16 h-px bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest" />
              <div className="w-2 h-2 border border-jade-sage/40 rotate-45 bg-jade-copper/20" />
              <div className="w-16 h-px bg-gradient-to-l from-jade-sage via-jade-malachite to-jade-forest" />
            </div>

            <p className="text-xl font-light text-jade-mineral max-w-2xl leading-relaxed">
              Sacred repository of consciousness patterns and emotional resonance crystallization
            </p>
          </div>
        </motion.div>

        {/* Crystalline Consciousness Vessels Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-3 h-3 border border-jade-sage/40 rotate-45 bg-jade-copper/20" />
              <h3 className="text-xl font-extralight text-jade-jade mb-0 tracking-[0.3em] uppercase">
                Crystalline Consciousness Vessels
              </h3>
              <div className="w-3 h-3 border border-jade-malachite/40 rotate-45 bg-jade-forest/20" />
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-jade-sage to-jade-malachite" />
              <div className="w-1 h-1 bg-jade-jade rounded-full animate-pulse" />
              <div className="w-16 h-px bg-gradient-to-l from-transparent via-jade-sage to-jade-malachite" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sacred Reflections Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative group"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/20 via-jade-copper/10 to-jade-shadow/30 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/20 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-jade-sage/15 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 text-center border border-jade-sage/30 rounded-xl backdrop-blur-xl group-hover:border-jade-malachite/50 transition-all duration-700">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-t border-jade-malachite/40" />
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-jade-sage/20" />
                </div>
                <div className="absolute top-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-t border-jade-malachite/40" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r border-t border-jade-sage/20" />
                </div>
                <div className="absolute bottom-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-b border-jade-forest/40" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l border-b border-jade-bronze/20" />
                </div>
                <div className="absolute bottom-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-b border-jade-forest/40" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-jade-bronze/20" />
                </div>

                {/* Crystalline Value Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
                  className="mb-4"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-sage/30 rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.7, 1, 0.7]
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-2 left-2 bottom-2 right-2 bg-jade-sage/20 rounded-full backdrop-blur-sm border border-jade-malachite/40"
                    />
                    <div className="absolute top-4 left-4 bottom-4 right-4 bg-jade-jade/80 rounded-full flex items-center justify-center">
                      <span className="text-lg font-extralight text-jade-abyss">
                        {data.total.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-sage to-transparent mx-auto mb-3" />
                <p className="text-xs font-extralight text-jade-mineral uppercase tracking-[0.25em]">Sacred Reflections</p>
              </div>
            </motion.div>

            {/* Integration Rate Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="relative group"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/25 via-jade-bronze/15 to-jade-shadow/25 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-night/30 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,_var(--tw-gradient-stops))] from-jade-malachite/12 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 text-center border border-jade-malachite/30 rounded-xl backdrop-blur-xl group-hover:border-jade-jade/50 transition-all duration-700">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-t border-jade-jade/40" />
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-jade-malachite/20" />
                </div>
                <div className="absolute top-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-t border-jade-jade/40" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r border-t border-jade-malachite/20" />
                </div>
                <div className="absolute bottom-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-b border-jade-copper/40" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l border-b border-jade-bronze/20" />
                </div>
                <div className="absolute bottom-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-b border-jade-copper/40" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-jade-bronze/20" />
                </div>

                {/* Crystalline Value Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                  className="mb-4"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-malachite/30 rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.15, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute top-2 left-2 bottom-2 right-2 bg-jade-malachite/20 rounded-full backdrop-blur-sm border border-jade-jade/40"
                    />
                    <div className="absolute top-4 left-4 bottom-4 right-4 bg-jade-malachite/90 rounded-full flex items-center justify-center">
                      <span className="text-sm font-extralight text-jade-abyss">
                        {(data.completionRate * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-malachite to-transparent mx-auto mb-3" />
                <p className="text-xs font-extralight text-jade-mineral uppercase tracking-[0.25em]">Integration Rate</p>
              </div>
            </motion.div>

            {/* Wonder Emergence Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative group"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-forest/20 via-jade-sage/15 to-jade-shadow/20 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/25 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,_var(--tw-gradient-stops))] from-jade-forest/10 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 text-center border border-jade-forest/30 rounded-xl backdrop-blur-xl group-hover:border-jade-sage/50 transition-all duration-700">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-t border-jade-sage/40" />
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-jade-forest/20" />
                </div>
                <div className="absolute top-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-t border-jade-sage/40" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r border-t border-jade-forest/20" />
                </div>
                <div className="absolute bottom-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-b border-jade-mineral/40" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l border-b border-jade-sage/20" />
                </div>
                <div className="absolute bottom-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-b border-jade-mineral/40" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-jade-sage/20" />
                </div>

                {/* Crystalline Value Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring", stiffness: 100 }}
                  className="mb-4"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-forest/30 rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.9, 0.5]
                      }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                      className="absolute top-2 left-2 bottom-2 right-2 bg-jade-forest/20 rounded-full backdrop-blur-sm border border-jade-sage/40"
                    />
                    <div className="absolute top-4 left-4 bottom-4 right-4 bg-jade-forest/85 rounded-full flex items-center justify-center">
                      <span className="text-sm font-extralight text-jade-mineral">
                        {((data.engagement?.surpriseRate || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-forest to-transparent mx-auto mb-3" />
                <p className="text-xs font-extralight text-jade-mineral uppercase tracking-[0.25em]">Wonder Emergence</p>
              </div>
            </motion.div>

            {/* Shadow Integration Vessel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="relative group"
            >
              {/* Multi-layered Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-jade-bronze/30 via-jade-copper/20 to-jade-dusk/25 rounded-xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-jade-night/35 to-transparent rounded-xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_var(--tw-gradient-stops))] from-jade-bronze/8 via-transparent to-transparent rounded-xl" />

              <div className="relative p-8 text-center border border-jade-bronze/30 rounded-xl backdrop-blur-xl group-hover:border-jade-copper/50 transition-all duration-700">
                {/* Sacred Geometric Corners */}
                <div className="absolute top-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-t border-jade-copper/40" />
                  <div className="absolute top-0.5 left-0.5 w-2 h-2 border-l border-t border-jade-bronze/20" />
                </div>
                <div className="absolute top-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-t border-jade-copper/40" />
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 border-r border-t border-jade-bronze/20" />
                </div>
                <div className="absolute bottom-3 left-3 w-3 h-3">
                  <div className="absolute inset-0 border-l border-b border-jade-silver/40" />
                  <div className="absolute bottom-0.5 left-0.5 w-2 h-2 border-l border-b border-jade-copper/20" />
                </div>
                <div className="absolute bottom-3 right-3 w-3 h-3">
                  <div className="absolute inset-0 border-r border-b border-jade-silver/40" />
                  <div className="absolute bottom-0.5 right-0.5 w-2 h-2 border-r border-b border-jade-copper/20" />
                </div>

                {/* Crystalline Value Display */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
                  className="mb-4"
                >
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <motion.div
                      animate={{ rotate: -360 }}
                      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 border border-jade-bronze/30 rounded-full"
                    />
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
                      className="absolute top-2 left-2 bottom-2 right-2 bg-jade-bronze/20 rounded-full backdrop-blur-sm border border-jade-copper/40"
                    />
                    <div className="absolute top-4 left-4 bottom-4 right-4 bg-jade-bronze/80 rounded-full flex items-center justify-center">
                      <span className="text-sm font-extralight text-jade-shadow">
                        {((data.engagement?.frustrationRate || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-bronze to-transparent mx-auto mb-3" />
                <p className="text-xs font-extralight text-jade-mineral uppercase tracking-[0.25em]">Shadow Integration</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Emotional Consciousness Spectrum Vessel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="relative"
          >
            {/* Multi-layered Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-jade-sage/15 via-jade-forest/10 to-jade-shadow/20 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-jade-dusk/30 to-transparent rounded-xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,_var(--tw-gradient-stops))] from-jade-malachite/8 via-transparent to-transparent rounded-xl" />

            <div className="relative p-8 border border-jade-sage/30 rounded-xl backdrop-blur-xl">
              {/* Sacred Geometric Corners */}
              <div className="absolute top-3 left-3 w-4 h-4">
                <div className="absolute inset-0 border-l border-t border-jade-malachite/40" />
                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-sage/20" />
              </div>
              <div className="absolute top-3 right-3 w-4 h-4">
                <div className="absolute inset-0 border-r border-t border-jade-malachite/40" />
                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-sage/20" />
              </div>
              <div className="absolute bottom-3 left-3 w-4 h-4">
                <div className="absolute inset-0 border-l border-b border-jade-forest/40" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-malachite/20" />
              </div>
              <div className="absolute bottom-3 right-3 w-4 h-4">
                <div className="absolute inset-0 border-r border-b border-jade-forest/40" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-malachite/20" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 border border-jade-sage/40 rotate-45 bg-jade-forest/20" />
                <h2 className="text-lg font-extralight text-jade-jade mb-0 tracking-[0.3em] uppercase">
                  Emotional Consciousness Spectrum
                </h2>
              </div>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-sage/60 to-transparent mb-8" />

              <div className="space-y-5">
                {data.feelings.slice(0, 5).map((item, index) => (
                  <div key={item.feeling} className="flex items-center gap-6">
                    <div className="relative w-3 h-3">
                      <div className="absolute inset-0 border border-jade-malachite/40 rotate-45" />
                      <div className="absolute top-0.5 left-0.5 bottom-0.5 right-0.5 bg-jade-sage/60 rounded-full" />
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                      <span className="text-jade-jade capitalize font-light tracking-wide">{item.feeling}</span>
                      <div className="flex items-center gap-4">
                        <div className="relative w-36 bg-jade-shadow/40 rounded-full h-2 border border-jade-forest/20">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.count / data.total) * 100}%` }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-jade-sage via-jade-malachite to-jade-forest"
                          />
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                            className="absolute inset-0 bg-jade-jade/30 rounded-full blur-sm"
                          />
                        </div>
                        <span className="text-sm text-jade-mineral w-8 text-right font-extralight">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Secondary Emotional Frequencies */}
              <div className="mt-8 flex flex-wrap gap-3">
                {data.feelings.slice(5, 10).map((item, index) => (
                  <motion.span
                    key={item.feeling}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
                    className="relative px-4 py-2 rounded-lg text-xs capitalize font-light tracking-wide"
                  >
                    <div className="absolute inset-0 bg-jade-forest/20 rounded-lg backdrop-blur-sm" />
                    <div className="absolute inset-0 border border-jade-sage/20 rounded-lg" />
                    <span className="relative text-jade-sage">
                      {item.feeling} ({item.count})
                    </span>
                  </motion.span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Temporal Consciousness Flow Vessel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
            className="relative"
          >
            {/* Multi-layered Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-jade-malachite/15 via-jade-jade/10 to-jade-shadow/20 rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-jade-night/30 to-transparent rounded-xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,_var(--tw-gradient-stops))] from-jade-forest/8 via-transparent to-transparent rounded-xl" />

            <div className="relative p-8 border border-jade-malachite/30 rounded-xl backdrop-blur-xl">
              {/* Sacred Geometric Corners */}
              <div className="absolute top-3 left-3 w-4 h-4">
                <div className="absolute inset-0 border-l border-t border-jade-jade/40" />
                <div className="absolute top-1 left-1 w-2 h-2 border-l border-t border-jade-malachite/20" />
              </div>
              <div className="absolute top-3 right-3 w-4 h-4">
                <div className="absolute inset-0 border-r border-t border-jade-jade/40" />
                <div className="absolute top-1 right-1 w-2 h-2 border-r border-t border-jade-malachite/20" />
              </div>
              <div className="absolute bottom-3 left-3 w-4 h-4">
                <div className="absolute inset-0 border-l border-b border-jade-copper/40" />
                <div className="absolute bottom-1 left-1 w-2 h-2 border-l border-b border-jade-jade/20" />
              </div>
              <div className="absolute bottom-3 right-3 w-4 h-4">
                <div className="absolute inset-0 border-r border-b border-jade-copper/40" />
                <div className="absolute bottom-1 right-1 w-2 h-2 border-r border-b border-jade-jade/20" />
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-3 h-3 border border-jade-malachite/40 rotate-45 bg-jade-copper/20" />
                <h2 className="text-lg font-extralight text-jade-jade mb-0 tracking-[0.3em] uppercase">
                  Temporal Consciousness Flow
                </h2>
              </div>
              <div className="w-20 h-px bg-gradient-to-r from-transparent via-jade-malachite/60 to-transparent mb-8" />

              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data.daily}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(111,143,118,0.2)" strokeWidth={1} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="rgba(168,203,180,0.7)"
                    fontSize={11}
                    fontWeight="300"
                  />
                  <YAxis
                    stroke="rgba(168,203,180,0.7)"
                    fontSize={11}
                    fontWeight="300"
                  />
                  <Tooltip
                    labelFormatter={formatDate}
                    contentStyle={{
                      backgroundColor: 'rgba(13,31,23,0.9)',
                      border: '1px solid rgba(111,143,118,0.3)',
                      borderRadius: '12px',
                      backdropFilter: 'blur(12px)',
                      color: 'rgba(168,203,180,0.9)',
                      fontWeight: '300',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="rgba(115,155,127,0.8)"
                    strokeWidth={3}
                    dot={{ fill: 'rgba(111,143,118,0.9)', r: 5, strokeWidth: 2, stroke: 'rgba(168,203,180,0.6)' }}
                    activeDot={{
                      r: 7,
                      fill: 'rgba(168,203,180,0.9)',
                      stroke: 'rgba(111,143,118,0.6)',
                      strokeWidth: 3
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Consciousness Engagement Distribution Vessel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="relative mt-12"
        >
          {/* Multi-layered Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-jade-copper/20 via-jade-bronze/15 to-jade-shadow/25 rounded-xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-jade-night/30 to-transparent rounded-xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_var(--tw-gradient-stops))] from-jade-sage/8 via-transparent to-transparent rounded-xl" />

          <div className="relative p-8 border border-jade-bronze/30 rounded-xl backdrop-blur-xl">
            {/* Sacred Geometric Corners */}
            <div className="absolute top-4 left-4 w-5 h-5">
              <div className="absolute inset-0 border-l border-t border-jade-copper/40" />
              <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-jade-bronze/20" />
            </div>
            <div className="absolute top-4 right-4 w-5 h-5">
              <div className="absolute inset-0 border-r border-t border-jade-copper/40" />
              <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-jade-bronze/20" />
            </div>
            <div className="absolute bottom-4 left-4 w-5 h-5">
              <div className="absolute inset-0 border-l border-b border-jade-silver/40" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-jade-copper/20" />
            </div>
            <div className="absolute bottom-4 right-4 w-5 h-5">
              <div className="absolute inset-0 border-r border-b border-jade-silver/40" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-jade-copper/20" />
            </div>

            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-4 h-4 border border-jade-copper/40 rotate-45 bg-jade-bronze/20" />
              <h2 className="text-xl font-extralight text-jade-jade mb-0 tracking-[0.3em] uppercase">
                Consciousness Engagement Distribution
              </h2>
              <div className="w-4 h-4 border border-jade-silver/40 rotate-45 bg-jade-copper/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Pure Feeling Resonance */}
              <div className="text-center relative">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jade-sage/30 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-3 left-3 bottom-3 right-3 bg-jade-sage/20 rounded-full backdrop-blur-sm border border-jade-malachite/30"
                  />
                  <div className="absolute top-6 left-6 bottom-6 right-6 bg-jade-sage/80 rounded-full flex items-center justify-center">
                    <span className="text-lg font-extralight text-jade-abyss">
                      {Math.round((1 - (data.engagement?.surpriseRate || 0) - (data.engagement?.frustrationRate || 0)) * 100)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-sm text-jade-jade font-extralight tracking-[0.2em] uppercase mb-2">Pure Feeling Resonance</h3>
                <p className="text-xs text-jade-mineral font-light tracking-wide">Direct emotional crystallization</p>
              </div>

              {/* Wonder Discovery Matrix */}
              <div className="text-center relative">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jade-malachite/30 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.15, 1],
                      opacity: [0.5, 0.9, 0.5]
                    }}
                    transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-3 left-3 bottom-3 right-3 bg-jade-malachite/20 rounded-full backdrop-blur-sm border border-jade-jade/30"
                  />
                  <div className="absolute top-6 left-6 bottom-6 right-6 bg-jade-malachite/85 rounded-full flex items-center justify-center">
                    <span className="text-lg font-extralight text-jade-abyss">
                      {Math.round((data.engagement?.surpriseRate || 0) * 100)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-sm text-jade-jade font-extralight tracking-[0.2em] uppercase mb-2">Wonder Discovery Matrix</h3>
                <p className="text-xs text-jade-mineral font-light tracking-wide">Unexpected consciousness expansion</p>
              </div>

              {/* Shadow Integration Portal */}
              <div className="text-center relative">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 55, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-jade-bronze/30 rounded-full"
                  />
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [0.7, 1, 0.7]
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 4 }}
                    className="absolute top-3 left-3 bottom-3 right-3 bg-jade-bronze/20 rounded-full backdrop-blur-sm border border-jade-copper/30"
                  />
                  <div className="absolute top-6 left-6 bottom-6 right-6 bg-jade-bronze/80 rounded-full flex items-center justify-center">
                    <span className="text-lg font-extralight text-jade-shadow">
                      {Math.round((data.engagement?.frustrationRate || 0) * 100)}%
                    </span>
                  </div>
                </div>
                <h3 className="text-sm text-jade-jade font-extralight tracking-[0.2em] uppercase mb-2">Shadow Integration Portal</h3>
                <p className="text-xs text-jade-mineral font-light tracking-wide">Transformative challenge processing</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Crystalline Archive Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-12 text-center relative"
        >
          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="w-12 h-px bg-gradient-to-r from-transparent via-jade-sage/40 to-transparent" />
            <div className="w-2 h-2 border border-jade-malachite/40 rotate-45 bg-jade-forest/20" />
            <div className="w-12 h-px bg-gradient-to-l from-transparent via-jade-sage/40 to-transparent" />
          </div>

          <p className="text-sm text-jade-mineral font-light tracking-wide mb-4">
            Archive crystallization: {new Date().toLocaleString()}
          </p>

          <motion.button
            onClick={fetchReflectionData}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-jade-sage/20 via-jade-malachite/20 to-jade-forest/20 rounded-lg backdrop-blur-sm" />
            <div className="absolute inset-0 border border-jade-sage/30 rounded-lg group-hover:border-jade-malachite/50 transition-colors duration-300" />
            <span className="relative px-6 py-3 text-sm font-extralight text-jade-jade tracking-[0.2em] uppercase block">
              Refresh Consciousness Archive
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  )
}