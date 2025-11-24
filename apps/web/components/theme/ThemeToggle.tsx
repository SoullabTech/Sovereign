'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Monitor } from 'lucide-react'
import { saveUserTheme, getUserTheme, getLocalTheme, ThemePreference } from '@/lib/theme/userTheme'
import { useUser } from '@/lib/supabase'
import { createClientComponentClient } from '@/lib/supabase'

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)
  const user = useUser()

  // Initialize theme on mount
  useEffect(() => {
    setMounted(true)
    
    const loadTheme = async () => {
      if (user?.id) {
        // Authenticated user - fetch from Supabase
        const savedTheme = await getUserTheme(user.id)
        setTheme(savedTheme)
      } else {
        // Anonymous user - use localStorage
        const localTheme = getLocalTheme()
        setTheme(localTheme)
      }
    }
    
    loadTheme()
  }, [user, setTheme])

  const handleThemeChange = async (newTheme: ThemePreference) => {
    const previousTheme = theme
    setTheme(newTheme)
    setSaving(true)
    
    try {
      // Log theme change event
      const supabase = createClientComponentClient()
      const sessionId = sessionStorage.getItem('session_id') || 
                        `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      if (!sessionStorage.getItem('session_id')) {
        sessionStorage.setItem('session_id', sessionId)
      }
      
      await supabase.from('event_logs').insert({
        event_name: 'theme_changed',
        session_id: sessionId,
        user_id: user?.id || null,
        payload: {
          previous: previousTheme,
          new: newTheme,
          source: 'ThemeToggle',
          timestamp: new Date().toISOString()
        }
      })
      
      if (user?.id) {
        // Save to Supabase for authenticated users
        await saveUserTheme(user.id, newTheme)
      } else {
        // Save to localStorage for anonymous users
        localStorage.setItem('soullab-theme', newTheme)
      }
    } catch (error) {
      console.error('Failed to save theme preference:', error)
    } finally {
      setSaving(false)
    }
  }

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <div className="w-36 h-10 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
    )
  }

  const currentTheme = theme === 'system' ? systemTheme : theme

  return (
    <div className="relative">
      {/* Theme selector buttons */}
      <div className="flex items-center gap-1 p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Light mode */}
        <button
          onClick={() => handleThemeChange('light')}
          disabled={saving}
          className={`
            relative p-2 rounded-full transition-all
            ${theme === 'light' 
              ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Light mode"
        >
          <Sun className="w-4 h-4" />
          {theme === 'light' && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-yellow-200/30 dark:bg-yellow-800/30 rounded-full -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>

        {/* Dark mode */}
        <button
          onClick={() => handleThemeChange('dark')}
          disabled={saving}
          className={`
            relative p-2 rounded-full transition-all
            ${theme === 'dark' 
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="Dark mode"
        >
          <Moon className="w-4 h-4" />
          {theme === 'dark' && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-indigo-200/30 dark:bg-indigo-800/30 rounded-full -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>

        {/* System mode */}
        <button
          onClick={() => handleThemeChange('system')}
          disabled={saving}
          className={`
            relative p-2 rounded-full transition-all
            ${theme === 'system' 
              ? 'bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'}
            ${saving ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label="System default"
        >
          <Monitor className="w-4 h-4" />
          {theme === 'system' && (
            <motion.div
              layoutId="activeTheme"
              className="absolute inset-0 bg-gray-300/30 dark:bg-gray-700/30 rounded-full -z-10"
              transition={{ type: 'spring', duration: 0.5 }}
            />
          )}
        </button>
      </div>

      {/* Saving indicator */}
      <AnimatePresence>
        {saving && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap"
          >
            Saving preference...
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current theme indicator */}
      <div className="mt-2 text-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {theme === 'system' 
            ? `System (${currentTheme})` 
            : theme === 'light' 
            ? 'Light' 
            : 'Dark'}
        </span>
      </div>
    </div>
  )
}

/**
 * Minimal version for header/navbar
 */
export function ThemeToggleMinimal() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const user = useUser()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const cycleTheme = async () => {
    const themes: ThemePreference[] = ['light', 'dark', 'system']
    const currentIndex = themes.indexOf(theme as ThemePreference)
    const nextTheme = themes[(currentIndex + 1) % themes.length]
    const previousTheme = theme
    
    setTheme(nextTheme)
    
    // Log theme change event
    const supabase = createClientComponentClient()
    const sessionId = sessionStorage.getItem('session_id') || 
                      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId)
    }
    
    await supabase.from('event_logs').insert({
      event_name: 'theme_changed',
      session_id: sessionId,
      user_id: user?.id || null,
      payload: {
        previous: previousTheme,
        new: nextTheme,
        source: 'ThemeToggleMinimal',
        timestamp: new Date().toISOString()
      }
    })
    
    if (user?.id) {
      await saveUserTheme(user.id, nextTheme)
    } else {
      localStorage.setItem('soullab-theme', nextTheme)
    }
  }

  const Icon = theme === 'light' ? Sun : theme === 'dark' ? Moon : Monitor

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </button>
  )
}