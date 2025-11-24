'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { trackEvent } from '@/lib/analytics/eventTracking'

interface ExpandedReflectionPanelProps {
  sessionId: string
  messageCount: number
  triggerAfter?: number
  onClose?: () => void
  onSubmitSuccess?: () => void
}

export default function ExpandedReflectionPanel({
  sessionId,
  messageCount,
  triggerAfter = 5,
  onClose,
  onSubmitSuccess
}: ExpandedReflectionPanelProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [feeling, setFeeling] = useState('')
  const [surprise, setSurprise] = useState('')
  const [frustration, setFrustration] = useState('')
  
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (messageCount >= triggerAfter && !hasSubmitted) {
      setTimeout(() => setIsVisible(true), 1000)
    }
  }, [messageCount, triggerAfter, hasSubmitted])

  const handleSubmit = async () => {
    if (!feeling.trim()) return
    
    setIsSubmitting(true)
    
    try {
      // Dual writes in parallel for beta_feedback and event_logs
      const [feedbackResult, analyticsResult] = await Promise.all([
        // 1. Insert into beta_feedback (qualitative)
        supabase
          .from('beta_feedback')
          .insert({
            session_id: sessionId,
            feeling: feeling.trim(),
            surprise: surprise.trim() || null,
            frustration: frustration.trim() || null
          }),
        
        // 2. Insert into event_logs (quantitative analytics)
        supabase
          .from('event_logs')
          .insert({
            event_name: 'reflection_submitted',
            session_id: sessionId,
            payload: {
              feeling: feeling.trim(),
              hasSurprise: !!surprise.trim(),
              hasFrustration: !!frustration.trim()
            }
          })
      ])
      
      // Log for debugging
      console.log('[Reflection] Submit results:', {
        feedback: feedbackResult.error ? 'failed' : 'success',
        analytics: analyticsResult.error ? 'failed' : 'success',
        feeling: feeling.trim(),
        sessionId
      })
      
      if (feedbackResult.error) {
        console.error('[Reflection] Feedback write error:', feedbackResult.error)
      }
      if (analyticsResult.error) {
        console.error('[Reflection] Analytics write error:', analyticsResult.error)
      }
      
      // Animate to thank you state
      setHasSubmitted(true)
      
      // Track analytics event (legacy tracking)
      trackEvent('feedback_submitted', {
        session_id: sessionId,
        feeling: feeling.trim(),
        has_surprise: !!surprise.trim(),
        has_frustration: !!frustration.trim(),
        trigger_message_count: triggerAfter
      })
      
      // Fade out after 2 seconds
      setTimeout(() => {
        setIsVisible(false)
        onSubmitSuccess?.()
      }, 2000)
      
    } catch (error) {
      console.error('[Reflection] Error submitting feedback:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 md:bottom-8"
        >
          <div className="relative bg-gradient-to-br from-amber-50/95 via-indigo-50/95 to-amber-50/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-100/20 p-6">
            {/* Subtle aura background with blur */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/8 via-indigo-400/8 to-amber-400/8 rounded-2xl blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-indigo-600/5 rounded-2xl" />
            
            <div className="relative">
              {!hasSubmitted ? (
                <>
                  {/* Header */}
                  <h3 className="font-serif text-lg text-gray-800 mb-4">
                    Quick Reflection
                  </h3>
                  
                  {/* Feeling input */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1 font-sans">
                      One word or feeling
                    </label>
                    <input
                      type="text"
                      value={feeling}
                      onChange={(e) => setFeeling(e.target.value)}
                      placeholder="e.g. calm, curious, confused..."
                      className="w-full px-3 py-2 bg-white/70 border border-amber-100 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
                      maxLength={50}
                    />
                  </div>
                  
                  {/* Surprise textarea */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1 font-sans">
                      What surprised you?
                    </label>
                    <textarea
                      value={surprise}
                      onChange={(e) => setSurprise(e.target.value)}
                      placeholder="Optional..."
                      className="w-full px-3 py-2 bg-white/70 border border-amber-100 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                      rows={1}
                      onFocus={(e) => e.target.rows = 2}
                      onBlur={(e) => e.target.rows = 1}
                    />
                  </div>
                  
                  {/* Frustration textarea */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-1 font-sans">
                      What frustrated you?
                    </label>
                    <textarea
                      value={frustration}
                      onChange={(e) => setFrustration(e.target.value)}
                      placeholder="Optional..."
                      className="w-full px-3 py-2 bg-white/70 border border-amber-100 rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all resize-none"
                      rows={1}
                      onFocus={(e) => e.target.rows = 2}
                      onBlur={(e) => e.target.rows = 1}
                    />
                  </div>
                  
                  {/* Submit button */}
                  <motion.button
                    onClick={handleSubmit}
                    disabled={!feeling.trim() || isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-2.5 px-4 rounded-lg font-sans text-sm font-medium
                      transition-all duration-300
                      ${feeling.trim() && !isSubmitting
                        ? 'bg-gradient-to-r from-amber-500 to-indigo-500 text-white shadow-lg hover:shadow-xl'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                          />
                          Sharing...
                        </>
                      ) : (
                        <>
                          ✨ Share Reflection
                        </>
                      )}
                    </span>
                  </motion.button>
                  
                  {/* Skip button */}
                  <button
                    onClick={() => {
                      setIsVisible(false)
                      onClose?.()
                    }}
                    className="w-full mt-2 py-1 text-xs text-gray-400 hover:text-gray-600 transition-colors font-sans"
                  >
                    Skip for now
                  </button>
                </>
              ) : (
                /* Thank you state */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="text-3xl mb-2"
                  >
                    🌸
                  </motion.div>
                  <p className="font-serif text-lg text-gray-700">
                    Thank you for sharing
                  </p>
                  <p className="text-sm text-gray-500 mt-1 font-sans">
                    Your reflection helps us grow
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}