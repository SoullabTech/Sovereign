"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Crown, Loader2 } from "lucide-react"

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'default' | 'oracle' | 'simple'
  color?: 'purple' | 'orange' | 'green' | 'blue'
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className = "", size = 'md', variant = 'default', color = 'purple', ...props }, ref) => {
    const sizes = {
      sm: "w-4 h-4",
      md: "w-6 h-6", 
      lg: "w-8 h-8",
      xl: "w-12 h-12"
    }

    const colors = {
      purple: "text-amber-400",
      orange: "text-orange-400",
      green: "text-green-400",
      blue: "text-blue-400"
    }

    if (variant === 'oracle') {
      return (
        <div ref={ref} className={`flex items-center justify-center ${className}`} {...props}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`bg-gradient-to-br from-${color}-500 to-${color === 'purple' ? 'orange' : 'purple'}-500 rounded-full flex items-center justify-center ${sizes[size]}`}
          >
            <Crown className={`${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
          </motion.div>
        </div>
      )
    }

    if (variant === 'simple') {
      return (
        <div ref={ref} className={`flex items-center justify-center ${className}`} {...props}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className={`border-2 border-t-transparent rounded-full ${sizes[size]} border-${color}-400`}
          />
        </div>
      )
    }

    return (
      <div ref={ref} className={`flex items-center justify-center ${className}`} {...props}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className={`${sizes[size]} ${colors[color]}`} />
        </motion.div>
      </div>
    )
  }
)
Spinner.displayName = "Spinner"

export { Spinner }