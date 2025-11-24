'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { soullabColors } from '@/lib/theme/soullabColors'

interface ThemeToggleProps {
  currentTheme?: 'light' | 'dark' | 'system'
  onChange?: (theme: 'light' | 'dark' | 'system') => void
  compact?: boolean
}

export default function ThemeToggle({ 
  currentTheme = 'system', 
  onChange,
  compact = false 
}: ThemeToggleProps) {
  
  const themes = [
    { 
      value: 'light' as const, 
      label: 'Light', 
      icon: Sun,
      description: 'Bright and clear'
    },
    { 
      value: 'dark' as const, 
      label: 'Dark', 
      icon: Moon,
      description: 'Soft and focused'
    },
    { 
      value: 'system' as const, 
      label: 'System', 
      icon: Monitor,
      description: 'Match device'
    }
  ]

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    const previousTheme = currentTheme
    onChange?.(theme)
    
    // Track theme change analytics
    try {
      await fetch('/api/analytics/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'theme_changed',
          from: previousTheme,
          to: theme,
          timestamp: new Date().toISOString(),
          sessionId: localStorage.getItem('session-id') || 'anonymous',
        })
      })
    } catch (error) {
      console.error('[Theme Analytics] Failed to track:', error)
    }
    
    // Apply theme immediately to DOM
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
      
      // Listen for system theme changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.toggle('dark', e.matches)
      }
      mediaQuery.addEventListener('change', handleChange)
      
      // Store cleanup function
      ;(window as any).__themeCleanup = () => {
        mediaQuery.removeEventListener('change', handleChange)
      }
    } else {
      // Clean up system listener if it exists
      if ((window as any).__themeCleanup) {
        (window as any).__themeCleanup()
        delete (window as any).__themeCleanup
      }
      
      root.classList.toggle('dark', theme === 'dark')
    }
    
    // Persist to localStorage
    localStorage.setItem('soullab-theme', theme)
  }

  if (compact) {
    // Compact toggle for header/nav
    return (
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        {themes.map((theme) => {
          const Icon = theme.icon
          const isActive = currentTheme === theme.value
          
          return (
            <motion.button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={`
                p-2 rounded-md transition-all
                ${isActive 
                  ? 'bg-white dark:bg-gray-700 shadow-sm' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                }
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={theme.label}
            >
              <Icon 
                size={16} 
                className={`
                  transition-colors
                  ${isActive 
                    ? 'text-amber-600 dark:text-amber-400' 
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `}
              />
            </motion.button>
          )
        })}
      </div>
    )
  }

  // Full toggle for settings panel
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3">
        {themes.map((theme) => {
          const Icon = theme.icon
          const isActive = currentTheme === theme.value
          
          return (
            <motion.button
              key={theme.value}
              onClick={() => handleThemeChange(theme.value)}
              className={`
                relative p-4 rounded-xl border-2 transition-all
                ${isActive 
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="theme-indicator"
                  className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <span className="text-white text-xs">✓</span>
                </motion.div>
              )}
              
              <div className="flex flex-col items-center gap-2">
                <Icon 
                  size={24} 
                  className={`
                    transition-colors
                    ${isActive 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-gray-600 dark:text-gray-400'
                    }
                  `}
                />
                <span className={`
                  text-sm font-medium
                  ${isActive 
                    ? 'text-amber-700 dark:text-amber-300' 
                    : 'text-gray-700 dark:text-gray-300'
                  }
                `}>
                  {theme.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {theme.description}
                </span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Visual preview */}
      <motion.div 
        className="mt-4 p-4 rounded-lg border"
        style={{ 
          borderColor: soullabColors.opacity.gray10,
          background: currentTheme === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
            : currentTheme === 'light'
            ? 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #1a1a1a 100%)'
        }}
        animate={{
          background: currentTheme === 'dark' 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)' 
            : currentTheme === 'light'
            ? 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)'
            : 'linear-gradient(135deg, #f5f5f5 0%, #1a1a1a 100%)'
        }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <div className={`
            w-3 h-3 rounded-full
            ${currentTheme === 'dark' ? 'bg-gray-600' : 
              currentTheme === 'light' ? 'bg-gray-300' : 
              'bg-gradient-to-r from-gray-300 to-gray-600'}
          `} />
          <div className={`
            h-2 rounded-full flex-1
            ${currentTheme === 'dark' ? 'bg-gray-700' : 
              currentTheme === 'light' ? 'bg-gray-200' : 
              'bg-gradient-to-r from-gray-200 to-gray-700'}
          `} />
        </div>
        <div className="mt-3 space-y-2">
          <div className={`
            h-2 w-3/4 rounded
            ${currentTheme === 'dark' ? 'bg-gray-700' : 
              currentTheme === 'light' ? 'bg-gray-200' : 
              'bg-gradient-to-r from-gray-200 to-gray-700'}
          `} />
          <div className={`
            h-2 w-1/2 rounded
            ${currentTheme === 'dark' ? 'bg-gray-700' : 
              currentTheme === 'light' ? 'bg-gray-200' : 
              'bg-gradient-to-r from-gray-200 to-gray-700'}
          `} />
        </div>
      </motion.div>
    </div>
  )
}