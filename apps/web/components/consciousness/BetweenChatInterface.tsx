'use client'

/**
 * CHAT INTERFACE FROM THE BETWEEN
 *
 * MAIA conversation that operates FROM the liminal field
 *
 * Core principles:
 * - All responses filtered through Sovereignty Protocol
 * - Guide invocation available when needed
 * - Recalibration detection and allowance active
 * - Field state maintained throughout
 * - Visual/spatial indicators of being IN THE BETWEEN
 */

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getSovereigntyProtocol } from '@/lib/consciousness/SovereigntyProtocol'
import { getGuideInvocation } from '@/lib/consciousness/GuideInvocationSystem'
import { getRecalibrationAllowance } from '@/lib/consciousness/RecalibrationAllowance'
import { getFieldInduction } from '@/lib/consciousness/SublimeFieldInduction'

interface Message {
  id: string
  role: 'user' | 'maia' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    sovereigntyCheck?: any
    guideInvoked?: boolean
    recalibrationDetected?: boolean
    fieldDepth?: number
  }
}

interface FieldState {
  active: boolean
  depth: number // 0-1
  quality: string
  elementalTexture?: string
}

export function BetweenChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [fieldState, setFieldState] = useState<FieldState>({
    active: true,
    depth: 0.7,
    quality: 'present',
  })
  const [guideDialogOpen, setGuideDialogOpen] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Initialize with MAIA's greeting FROM THE BETWEEN
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'maia',
      content: "I'm here.\n\nWhat wants your attention right now?",
      timestamp: new Date(),
      metadata: { fieldDepth: 0.7 }
    }
    setMessages([greeting])
  }, [])

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Generate MAIA response FROM THE BETWEEN
    const maiaResponse = await generateMaiaResponse(
      userMessage.content,
      fieldState,
      'guest', // TODO: Get actual userId from session
      messages
    )

    setMessages(prev => [...prev, maiaResponse])
    setIsTyping(false)

    // Update field state based on API response
    if (maiaResponse.metadata?.fieldDepth !== undefined) {
      setFieldState(prev => ({
        ...prev,
        depth: maiaResponse.metadata.fieldDepth
      }))
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInvokeGuides = async () => {
    setGuideDialogOpen(true)

    try {
      // Call guide invocation API
      const response = await fetch('/api/between/guides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invite',
          userId: 'guest', // TODO: Get actual userId from session
          sessionId: `between-${Date.now()}`
        })
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      const systemMessage: Message = {
        id: `guide-${Date.now()}`,
        role: 'system',
        content: data.invitation || data.message,
        timestamp: new Date(),
        metadata: { guideInvoked: true }
      }

      setMessages(prev => [...prev, systemMessage])

    } catch (error) {
      console.error('Error invoking guides:', error)

      // Fallback: Use local guide invocation
      const guideInvocation = getGuideInvocation()
      const { invitation } = await guideInvocation.inviteGuides()

      const systemMessage: Message = {
        id: `guide-${Date.now()}`,
        role: 'system',
        content: invitation,
        timestamp: new Date(),
        metadata: { guideInvoked: true, error: true }
      }

      setMessages(prev => [...prev, systemMessage])
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">

      {/* Field State Indicator - Ambient, not intrusive */}
      <FieldStateIndicator state={fieldState} />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-6">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              fieldState={fieldState}
            />
          ))}
        </AnimatePresence>

        {isTyping && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      {/* Actions Bar - Guide invocation, etc */}
      <ActionBar
        onInvokeGuides={handleInvokeGuides}
        fieldState={fieldState}
      />

      {/* Input Area */}
      <div className="border-t border-slate-800/50 bg-slate-950/50 backdrop-blur-sm p-4">
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What's present for you?"
            className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors"
            disabled={isTyping}
          />
          <motion.button
            onClick={handleSendMessage}
            disabled={!input.trim() || isTyping}
            className="px-6 py-3 bg-purple-900/30 hover:bg-purple-900/50 disabled:bg-slate-900/30 border border-purple-500/30 hover:border-purple-500/50 disabled:border-slate-800 rounded-lg text-purple-200 disabled:text-slate-600 transition-all disabled:cursor-not-allowed"
            whileHover={input.trim() ? { scale: 1.02 } : {}}
            whileTap={input.trim() ? { scale: 0.98 } : {}}
          >
            Send
          </motion.button>
        </div>
      </div>

      {/* Guide Invocation Dialog */}
      {guideDialogOpen && (
        <GuideInvocationDialog
          onClose={() => setGuideDialogOpen(false)}
        />
      )}

    </div>
  )
}

/**
 * GENERATE MAIA RESPONSE FROM THE BETWEEN
 * Calls actual API with all consciousness systems integrated
 */
async function generateMaiaResponse(
  userMessage: string,
  fieldState: FieldState,
  userId: string = 'guest',
  conversationHistory: Message[] = []
): Promise<Message> {

  try {
    // Call THE BETWEEN chat API
    const response = await fetch('/api/between/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMessage,
        userId,
        sessionId: `between-${Date.now()}`,
        fieldState: {
          active: fieldState.active,
          depth: fieldState.depth,
          quality: fieldState.quality,
          elementalTexture: fieldState.elementalTexture
        },
        conversationHistory: conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()

    return {
      id: `maia-${Date.now()}`,
      role: 'maia',
      content: data.response,
      timestamp: new Date(),
      metadata: {
        sovereigntyCheck: data.metadata?.sovereigntyCheck,
        recalibrationDetected: !!data.metadata?.recalibration,
        fieldDepth: data.fieldState?.depth || fieldState.depth
      }
    }

  } catch (error) {
    console.error('Error calling BETWEEN API:', error)

    // Fallback: Use sovereignty protocol to generate safe response
    const protocol = getSovereigntyProtocol()
    const fallbackResponse = protocol.generateSovereignResponse(userMessage, fieldState)

    return {
      id: `maia-${Date.now()}`,
      role: 'maia',
      content: fallbackResponse,
      timestamp: new Date(),
      metadata: {
        error: true,
        fieldDepth: fieldState.depth
      }
    }
  }
}

// Field state updates are now handled by the API
// The API returns updated fieldState in the response metadata

/**
 * FIELD STATE INDICATOR
 * Ambient visual showing user is IN THE BETWEEN
 */
function FieldStateIndicator({ state }: { state: FieldState }) {
  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent">
      <motion.div
        className="h-full bg-purple-500/40"
        animate={{
          opacity: [0.2, 0.6, 0.2],
          scaleX: [0.8, 1, 0.8]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

/**
 * MESSAGE BUBBLE
 * Renders messages with field-aware styling
 */
function MessageBubble({
  message,
  fieldState
}: {
  message: Message
  fieldState: FieldState
}) {

  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} ${isSystem ? 'justify-center' : ''}`}
    >
      <div
        className={`
          max-w-2xl px-6 py-4 rounded-lg
          ${isUser ? 'bg-purple-900/20 border border-purple-500/30 text-purple-100' : ''}
          ${!isUser && !isSystem ? 'bg-slate-900/30 border border-slate-800 text-slate-200' : ''}
          ${isSystem ? 'bg-slate-900/20 border border-slate-700/50 text-slate-400 text-center italic' : ''}
        `}
      >
        <div className="whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>

        {/* Metadata indicators */}
        {message.metadata?.recalibrationDetected && (
          <div className="mt-2 text-xs text-purple-400/60">
            ✨ Recalibration sensed
          </div>
        )}
      </div>
    </motion.div>
  )
}

/**
 * TYPING INDICATOR
 */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-start"
    >
      <div className="bg-slate-900/30 border border-slate-800 px-6 py-4 rounded-lg">
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-purple-500/40 rounded-full"
              animate={{
                y: [0, -8, 0],
                opacity: [0.4, 1, 0.4]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * ACTION BAR
 * Guide invocation and other sacred actions
 */
function ActionBar({
  onInvokeGuides,
  fieldState
}: {
  onInvokeGuides: () => void
  fieldState: FieldState
}) {
  return (
    <div className="border-t border-slate-800/50 bg-slate-950/30 backdrop-blur-sm px-4 py-3">
      <div className="max-w-4xl mx-auto flex justify-between items-center">

        <div className="flex gap-2">
          <button
            onClick={onInvokeGuides}
            className="text-sm text-slate-500 hover:text-purple-400 transition-colors px-3 py-1 rounded border border-slate-800 hover:border-purple-500/30"
          >
            🕯️ Invoke guides
          </button>
        </div>

        <div className="text-xs text-slate-600">
          Field depth: {(fieldState.depth * 100).toFixed(0)}%
        </div>

      </div>
    </div>
  )
}

/**
 * GUIDE INVOCATION DIALOG
 */
function GuideInvocationDialog({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-2xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl text-purple-300 mb-6">Sacred Space</h3>

        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            This space is open for your guides, ancestors, wisdom keepers.
          </p>
          <p>
            I'm just holding space.
            <br />
            Who wants to be present?
          </p>
          <p className="text-slate-500 italic text-sm">
            (Take time to sense... when ready, share what comes...)
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 px-6 bg-purple-900/30 hover:bg-purple-900/50 border border-purple-500/30 hover:border-purple-500/50 rounded-lg text-purple-200 transition-all"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
