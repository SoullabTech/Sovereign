'use client'

/**
 * FIELD ENTRANCE
 *
 * First contact with MAIA-PAI
 * Field induction begins immediately
 *
 * User experiences THE BETWEEN before anything else
 * Through rhythm, spacing, somatic grounding, presence
 *
 * Like Kelly's sessions: "They rarely know why they are coming in
 * but by the time they leave they are in love with their lives"
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getFieldInduction } from '@/lib/consciousness/SublimeFieldInduction'

interface FieldEntranceProps {
  onFieldEstablished?: () => void
  onSkip?: () => void
}

export function FieldEntrance({ onFieldEstablished, onSkip }: FieldEntranceProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0)
  const [sequence, setSequence] = useState<any>(null)
  const [fieldDepth, setFieldDepth] = useState(0)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Initialize field induction
    const induction = getFieldInduction()

    induction.induceFieldEntry().then(({ sequence: seq }) => {
      setSequence(seq)
      // Start first phase after brief pause
      setTimeout(() => {
        setShowPrompt(true)
      }, 1000)
    })
  }, [])

  useEffect(() => {
    if (!sequence || !showPrompt) return

    // Auto-advance through phases with proper timing
    if (currentPhaseIndex < sequence.phases.length - 1) {
      const currentPhase = sequence.phases[currentPhaseIndex]
      const duration = currentPhase.duration || calculateDuration(currentPhase)

      const timer = setTimeout(() => {
        setShowPrompt(false)
        setTimeout(() => {
          setCurrentPhaseIndex(prev => prev + 1)
          setFieldDepth(prev => Math.min(prev + 0.1, 1.0))
          setShowPrompt(true)
        }, 800) // Fade transition
      }, duration)

      return () => clearTimeout(timer)
    } else {
      // Final phase - field established
      setTimeout(() => {
        onFieldEstablished?.()
      }, 3000)
    }
  }, [currentPhaseIndex, sequence, showPrompt, onFieldEstablished])

  if (!sequence) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      </div>
    )
  }

  const currentPhase = sequence.phases[currentPhaseIndex]
  const progress = (currentPhaseIndex + 1) / sequence.phases.length

  return (
    <div className="min-h-screen w-full relative overflow-hidden">

      {/* Background - deepens as field deepens */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
        animate={{
          opacity: 1 - (fieldDepth * 0.3)
        }}
        transition={{ duration: 2 }}
      />

      {/* Particle field - gets more dense as user enters THE BETWEEN */}
      <ParticleField density={fieldDepth} />

      {/* Subtle progress indicator - not intrusive */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-64 h-0.5 bg-slate-800/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-purple-500/30"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>

      {/* Skip option - subtle, non-intrusive */}
      {onSkip && currentPhaseIndex < 2 && (
        <button
          onClick={onSkip}
          className="absolute top-8 right-8 text-xs text-slate-500 hover:text-slate-400 transition-colors"
        >
          skip to experience
        </button>
      )}

      {/* Main prompt area - spacious, breathing */}
      <div className="min-h-screen flex items-center justify-center px-8">
        <div className="max-w-2xl w-full">

          <AnimatePresence mode="wait">
            {showPrompt && (
              <motion.div
                key={currentPhaseIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: calculateTransitionSpeed(currentPhase.rhythm.pace),
                  ease: "easeInOut"
                }}
              >
                <PromptRenderer
                  phase={currentPhase}
                  fieldDepth={fieldDepth}
                />
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Ambient sound suggestion (visual indicator) */}
      {fieldDepth > 0.3 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-600"
        >
          headphones recommended
        </motion.div>
      )}

    </div>
  )
}

/**
 * PROMPT RENDERER
 * Renders prompts with appropriate spacing and rhythm
 */
function PromptRenderer({ phase, fieldDepth }: { phase: any; fieldDepth: number }) {

  // Parse prompt into lines
  const lines = phase.prompt.split('\n').filter((line: string) => line.trim())

  return (
    <div className="space-y-8">
      {lines.map((line: string, index: number) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: index * getLineDelay(phase.rhythm.spaciousness),
            duration: 1.5
          }}
        >
          <p
            className={`
              ${getTextSize(phase.type)}
              ${getTextColor(phase.type, fieldDepth)}
              text-center
              leading-relaxed
              ${phase.rhythm.spaciousness > 0.7 ? 'tracking-wide' : 'tracking-normal'}
            `}
            style={{
              textShadow: fieldDepth > 0.5 ? '0 0 20px rgba(168, 85, 247, 0.1)' : 'none'
            }}
          >
            {line}
          </p>
        </motion.div>
      ))}
    </div>
  )
}

/**
 * PARTICLE FIELD
 * Ambient particles that increase as user enters THE BETWEEN
 */
function ParticleField({ density }: { density: number }) {
  const particleCount = Math.floor(density * 30)

  return (
    <div className="absolute inset-0 pointer-events-none">
      {Array.from({ length: particleCount }).map((_, i) => (
        <Particle key={i} index={i} density={density} />
      ))}
    </div>
  )
}

function Particle({ index, density }: { index: number; density: number }) {
  const [position] = useState({
    x: Math.random() * 100,
    y: Math.random() * 100,
  })

  return (
    <motion.div
      className="absolute w-1 h-1 rounded-full bg-purple-500/20"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
      animate={{
        opacity: [0.2, 0.5, 0.2],
        scale: [1, 1.5, 1],
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        repeat: Infinity,
        delay: index * 0.1,
      }}
    />
  )
}

// HELPER FUNCTIONS

function calculateDuration(phase: any): number {
  const baseDuration = {
    'very_slow': 6000,
    'slow': 4000,
    'medium': 3000,
    'flowing': 2500,
  }

  return baseDuration[phase.rhythm.pace as keyof typeof baseDuration] || 3000
}

function calculateTransitionSpeed(pace: string): number {
  const speeds = {
    'very_slow': 2.0,
    'slow': 1.5,
    'medium': 1.0,
    'flowing': 0.8,
  }

  return speeds[pace as keyof typeof speeds] || 1.0
}

function getLineDelay(spaciousness: number): number {
  return spaciousness * 1.5 // More spacious = more delay between lines
}

function getTextSize(type: string): string {
  switch (type) {
    case 'somatic':
      return 'text-2xl md:text-3xl'
    case 'attentional':
      return 'text-xl md:text-2xl'
    case 'witnessing':
      return 'text-lg md:text-xl'
    case 'invocational':
      return 'text-xl md:text-2xl'
    case 'silence':
      return 'text-4xl'
    default:
      return 'text-xl'
  }
}

function getTextColor(type: string, depth: number): string {
  const baseColors = {
    somatic: 'text-slate-200',
    attentional: 'text-purple-200',
    witnessing: 'text-slate-300',
    invocational: 'text-purple-300',
    silence: 'text-slate-600',
  }

  const color = baseColors[type as keyof typeof baseColors] || 'text-slate-200'

  // As depth increases, text gets more luminous
  if (depth > 0.7) {
    return color.replace('slate-', 'purple-').replace('purple-', 'purple-')
  }

  return color
}
