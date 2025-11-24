"use client"

import * as React from "react"
import { motion } from "framer-motion"

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  className?: string
  color?: 'purple' | 'orange' | 'green' | 'blue' | 'pink'
  animated?: boolean
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className = "", value = 0, max = 100, color = 'purple', animated = true, ...props }, ref) => {
    const percentage = Math.min(Math.max(value, 0), max) / max * 100

    const colorClasses = {
      purple: "bg-gradient-to-r from-amber-500 to-amber-600",
      orange: "bg-gradient-to-r from-orange-500 to-orange-600", 
      green: "bg-gradient-to-r from-green-500 to-green-600",
      blue: "bg-gradient-to-r from-blue-500 to-blue-600",
      pink: "bg-gradient-to-r from-pink-500 to-pink-600"
    }

    return (
      <div
        ref={ref}
        className={`relative h-2 w-full overflow-hidden rounded-full bg-background/50 ${className}`}
        {...props}
      >
        {animated ? (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`h-full w-full flex-1 transition-all ${colorClasses[color]}`}
          />
        ) : (
          <div
            className={`h-full transition-all ${colorClasses[color]}`}
            style={{ width: `${percentage}%` }}
          />
        )}
      </div>
    )
  }
)
Progress.displayName = "Progress"

// Archetype-specific progress
export interface ArchetypeProgressProps extends ProgressProps {
  archetype: 'sage' | 'seeker' | 'healer' | 'creator' | 'rebel' | 'ruler'
  level: number
}

const ArchetypeProgress = React.forwardRef<HTMLDivElement, ArchetypeProgressProps>(
  ({ archetype, level, ...props }, ref) => {
    const archetypeColors = {
      sage: 'blue',
      seeker: 'purple',
      healer: 'green',
      creator: 'orange', 
      rebel: 'pink',
      ruler: 'blue'
    } as const
    
    return (
      <Progress
        ref={ref}
        value={level}
        max={100}
        color={archetypeColors[archetype]}
        {...props}
      />
    )
  }
)
ArchetypeProgress.displayName = "ArchetypeProgress"

export { Progress, ArchetypeProgress }