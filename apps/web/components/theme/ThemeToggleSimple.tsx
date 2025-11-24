'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { motion } from 'framer-motion'

type Theme = 'light' | 'dark' | 'system'

export default function ThemeToggleSimple() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setCurrentTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      // Detect system preference
      const systemPreference = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      applyTheme('system', systemPreference)
    }
  }, [])

  const applyTheme = (theme: Theme, systemPreference?: 'light' | 'dark') => {
    let effectiveTheme = theme
    
    if (theme === 'system') {
      effectiveTheme = systemPreference || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    }
    
    // Apply to document
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(effectiveTheme === 'dark' ? 'dark' : 'light')
    document.documentElement.setAttribute('data-theme', effectiveTheme)
  }

  const handleThemeChange = async (newTheme: Theme) => {
    const previousTheme = currentTheme
    
    // Apply theme locally
    setCurrentTheme(newTheme)
    applyTheme(newTheme)
    localStorage.setItem('theme', newTheme)

    // Log to Supabase
    try {
      const sessionId = sessionStorage.getItem('session_id') || 
        `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId)
      }

      await supabase.from('event_logs').insert({
        event_name: 'theme_changed',
        session_id: sessionId,
        payload: { 
          previous: previousTheme,
          new: newTheme,
          timestamp: new Date().toISOString()
        }
      })
      
    } catch (err) {
      console.warn('Theme event logging failed', err)
    }
  }

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThemeChange('light')}
        className={`p-1.5 rounded transition-colors ${
          currentTheme === 'light' 
            ? 'bg-yellow-200 dark:bg-yellow-800' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Light theme"
      >
        ☀️
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThemeChange('dark')}
        className={`p-1.5 rounded transition-colors ${
          currentTheme === 'dark' 
            ? 'bg-indigo-200 dark:bg-indigo-800' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="Dark theme"
      >
        🌙
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => handleThemeChange('system')}
        className={`p-1.5 rounded transition-colors ${
          currentTheme === 'system' 
            ? 'bg-gray-300 dark:bg-gray-600' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        aria-label="System theme"
      >
        💻
      </motion.button>
    </div>
  )
}

/**
 * Ultra-minimal single button version that cycles through themes
 */
export function ThemeToggleCycle() {
  const [currentTheme, setCurrentTheme] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme) {
      setCurrentTheme(savedTheme)
    }
  }, [])

  const cycleTheme = async () => {
    const themes: Theme[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(currentTheme)
    const newTheme = themes[(currentIndex + 1) % themes.length]
    const previousTheme = currentTheme
    
    // Apply locally
    setCurrentTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Apply to document
    if (newTheme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', isDark)
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
    
    // Log event
    try {
      await supabase.from('event_logs').insert({
        event_name: 'theme_changed',
        payload: { 
          previous: previousTheme,
          new: newTheme,
          source: 'cycle_button'
        }
      })
    } catch (err) {
      console.warn('Failed to log theme change', err)
    }
  }

  if (!mounted) return null

  const icon = currentTheme === 'light' ? '☀️' : 
               currentTheme === 'dark' ? '🌙' : '💻'

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label={`Current theme: ${currentTheme}. Click to change.`}
    >
      {icon}
    </motion.button>
  )
}