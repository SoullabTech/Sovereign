'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ToneStyleSelector from '@/components/onboarding/ToneStyleSelector'
import ThemeToggle from '@/components/settings/ThemeToggle'
import { createClientComponentClient } from '@/lib/supabase'
import { soullabColors } from '@/lib/theme/soullabColors'
import { soullabGradients, toneGradients } from '@/lib/theme/soullabGradients'

interface AttunePanelProps {
  showPreview?: boolean
  onSettingsChange?: (settings: UserSettings) => void
}

interface UserSettings {
  tone: number
  style: 'prose' | 'poetic' | 'auto'
  theme: 'light' | 'dark' | 'system'
}

// Sample messages for live preview
const sampleMessages = {
  grounded: {
    prose: "Let&apos;s explore what&apos;s on your mind today. I&apos;m here to listen and reflect back what I hear.",
    poetic: "The space between us opens, ready to receive your thoughts as they arise.",
  },
  balanced: {
    prose: "Welcome back. There&apos;s something meaningful in returning to this conversation space.",
    poetic: "Here, where words become bridges, we meet again in the unfolding moment.",
  },
  poetic: {
    prose: "Your presence illuminates new pathways of understanding we can walk together.",
    poetic: "In the sacred geometry of dialogue, your essence weaves patterns only you can bring.",
  }
}

export default function AttunePanel({ showPreview = true, onSettingsChange }: AttunePanelProps) {
  const [settings, setSettings] = useState<UserSettings>({
    tone: 50, // 0=grounded, 100=poetic
    style: 'auto',
    theme: 'system'
  })
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClientComponentClient()

  // Load saved settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('user_preferences')
        .select('tone, style, theme')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setSettings({
          tone: data.tone || 50,
          style: data.style || 'auto',
          theme: data.theme || 'system'
        })
      }
    } catch (error) {
      console.error('[Attune] Error loading settings:', error)
    }
  }

  const saveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings)
    onSettingsChange?.(newSettings)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setIsSaving(true)
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          tone: newSettings.tone,
          style: newSettings.style,
          theme: newSettings.theme,
          updated_at: new Date().toISOString()
        })

      if (error) throw error
      
      // Apply theme immediately
      applyTheme(newSettings.theme)
      
    } catch (error) {
      console.error('[Attune] Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    const root = document.documentElement
    
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('soullab-theme', theme)
  }

  // Get sample message and background based on current settings
  const getSampleMessage = () => {
    const toneKey = settings.tone < 33 ? 'grounded' : 
                    settings.tone < 66 ? 'balanced' : 'poetic'
    const styleKey = settings.style === 'auto' ? 
                     (settings.tone < 50 ? 'prose' : 'poetic') : 
                     settings.style
    
    return sampleMessages[toneKey][styleKey]
  }

  const getToneBackground = () => {
    const toneKey = settings.tone < 33 ? 'grounded' : 
                    settings.tone < 66 ? 'balanced' : 'poetic'
    return toneGradients[toneKey]
  }

  return (
    <motion.div
      className="p-6 max-w-2xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-serif text-neutral-800 dark:text-neutral-200 mb-2">
          Attune Your Experience
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Shape how Maia speaks with you and the atmosphere of your space
        </p>
      </div>

      {/* Tone & Style Section */}
      <motion.div 
        className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl border"
        style={{ borderColor: soullabColors.opacity.gray10 }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🎚</span>
          <h3 className="font-serif text-lg text-neutral-700 dark:text-neutral-300">
            Voice & Tone
          </h3>
        </div>
        
        <ToneStyleSelector 
          initialTone={settings.tone}
          initialStyle={settings.style}
          onChange={(tone, style) => saveSettings({ ...settings, tone, style })}
          compact={true}
          showSaveButton={false}
        />
      </motion.div>

      {/* Theme Section */}
      <motion.div 
        className="space-y-4 p-6 bg-white dark:bg-gray-900 rounded-xl border"
        style={{ borderColor: soullabColors.opacity.gray10 }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌓</span>
          <h3 className="font-serif text-lg text-neutral-700 dark:text-neutral-300">
            Visual Theme
          </h3>
        </div>
        
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
          Set the mood of your Soullab space
        </p>
        
        <ThemeToggle 
          currentTheme={settings.theme}
          onChange={(theme) => saveSettings({ ...settings, theme })}
        />
        
        <p className="text-xs text-neutral-400 italic mt-2">
          🔄 System follows your device&apos;s appearance automatically
        </p>
      </motion.div>

      {/* Live Preview */}
      {showPreview && (
        <motion.div 
          className="space-y-4 p-6 rounded-xl"
          style={{ background: getToneBackground() }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, background: getToneBackground() }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">✨</span>
            <h3 className="font-serif text-lg text-neutral-700 dark:text-neutral-300">
              Live Preview
            </h3>
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={`${settings.tone}-${settings.style}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              <div className="flex items-start gap-3">
                <motion.div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                  style={{ background: soullabGradients.warmth }}
                  animate={{ 
                    boxShadow: [
                      `0 0 0 0 ${soullabColors.amber[400]}40`,
                      `0 0 0 8px ${soullabColors.amber[400]}20`,
                      `0 0 0 0 ${soullabColors.amber[400]}40`,
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  M
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Maia
                  </p>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {getSampleMessage()}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Tone indicator */}
          <div className="mt-4 flex items-center justify-between text-xs text-neutral-500">
            <span>Tone: {settings.tone < 33 ? 'Grounded' : settings.tone < 66 ? 'Balanced' : 'Poetic'}</span>
            <span>Style: {settings.style === 'auto' ? 'Automatic' : settings.style === 'prose' ? 'Prose' : 'Poetic'}</span>
          </div>
        </motion.div>
      )}

      {/* Save Status */}
      <AnimatePresence>
        {isSaving && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 px-4 py-2 bg-green-500 text-white rounded-lg shadow-lg text-sm"
          >
            Saving preferences...
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}