// @ts-nocheck
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Loader2, RotateCcw } from 'lucide-react'

interface ProfileContext {
  animal: string
  element: string
  yinYang: string
  cyclePosition: number
  archetype: string
  compatibility: string[]
  holisticHighlights?: string
}

interface DaYunPeriodSummary {
  element: string
  stem: string
  branch: string
  ageRange: string
  lifeTheme: string
  description: string
  opportunities: string[]
  challenges: string[]
  healthGuidance: string[]
  natalHarmony?: string
  spiritFocus?: string
}

interface DaYunContext {
  currentPeriod: DaYunPeriodSummary
  previousPeriod?: { element: string; lifeTheme: string; ageRange: string }
  nextPeriod?: { element: string; lifeTheme: string; ageRange: string }
  currentAge: number
  periodProgress: number
  fourPillars?: string
}

interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  mode: 'profile' | 'da-yun'
  profileContext?: ProfileContext
  daYunContext?: DaYunContext
}

export default function ChineseAstrologyDiscussion({ mode, profileContext, daYunContext }: Props) {
  const [state, setState] = useState<'idle' | 'loading' | 'generated' | 'followUpLoading'>('idle')
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [followUp, setFollowUp] = useState('')
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (scrollRef.current && conversation.length > 0) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [conversation])

  const hasContext = mode === 'profile' ? !!profileContext : !!daYunContext

  const callAPI = async (question?: string, history?: ConversationMessage[]) => {
    const res = await fetch('/api/astrology/chinese/discuss', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mode,
        question,
        conversationHistory: history,
        profileContext: mode === 'profile' ? profileContext : undefined,
        daYunContext: mode === 'da-yun' ? daYunContext : undefined
      })
    })

    const data = await res.json()
    if (!data.ok) throw new Error(data.error || 'Failed to get response')
    return data.insight as string
  }

  const generateInitialReading = async () => {
    setState('loading')
    setError(null)
    setConversation([])

    try {
      const insight = await callAPI()
      setConversation([{ role: 'assistant', content: insight }])
      setState('generated')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setState('idle')
    }
  }

  const sendFollowUp = async () => {
    const q = followUp.trim()
    if (!q) return

    const updatedConvo = [...conversation, { role: 'user' as const, content: q }]
    setConversation(updatedConvo)
    setFollowUp('')
    setState('followUpLoading')
    setError(null)

    try {
      const insight = await callAPI(q, updatedConvo)
      setConversation(prev => [...prev, { role: 'assistant', content: insight }])
      setState('generated')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setState('generated')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendFollowUp()
    }
  }

  if (!hasContext) return null

  const subtitle = mode === 'profile'
    ? 'MAIA can reflect on your animal-element combination and what it reveals about how you move through life.'
    : 'MAIA can reflect on your current cycle, transitions, and what this period may be asking of you.'

  const placeholderText = mode === 'profile'
    ? 'Ask about your element, compatibility, holistic profile, or what feels most alive...'
    : 'Ask about this cycle, a transition, or what feels most active now...'

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-orange-500/30 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-xl font-bold text-orange-200">Discuss with MAIA</h3>
        </div>
        <p className="text-orange-200/50 text-sm">{subtitle}</p>
      </div>

      {/* Content */}
      <div className="px-6 pb-6 space-y-4">
        {/* Idle state — generate button */}
        {state === 'idle' && !error && (
          <button
            onClick={generateInitialReading}
            className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500
                     text-white px-6 py-4 rounded-xl font-semibold transition-all duration-300
                     flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            Generate Initial Reading
          </button>
        )}

        {/* Loading initial */}
        {state === 'loading' && (
          <div className="flex items-center justify-center gap-3 py-8">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
            <span className="text-orange-200/60">MAIA is reflecting on your {mode === 'profile' ? 'profile' : 'cycle'}...</span>
          </div>
        )}

        {/* Error with retry */}
        {error && (
          <div className="space-y-3">
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
            <button
              onClick={generateInitialReading}
              className="flex items-center gap-2 text-orange-200/60 hover:text-orange-200 text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try again
            </button>
          </div>
        )}

        {/* Conversation thread */}
        {conversation.length > 0 && (
          <div className="space-y-4" ref={scrollRef}>
            {conversation.map((msg, i) => (
              <div key={i}>
                {msg.role === 'assistant' ? (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                    <p className="text-orange-100 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {msg.content}
                    </p>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl px-4 py-3 max-w-[85%]">
                      <p className="text-orange-200 text-sm">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Follow-up loading */}
            {state === 'followUpLoading' && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span className="text-orange-200/50 text-sm">MAIA is reflecting...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Follow-up input */}
        {(state === 'generated' || state === 'followUpLoading') && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2"
            >
              <textarea
                value={followUp}
                onChange={(e) => setFollowUp(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                rows={2}
                disabled={state === 'followUpLoading'}
                className="flex-1 bg-black/40 border border-orange-500/30 rounded-xl px-4 py-3
                         text-orange-200 placeholder-orange-200/30 resize-none text-sm
                         focus:outline-none focus:border-amber-500/50
                         disabled:opacity-50"
              />
              <button
                onClick={sendFollowUp}
                disabled={!followUp.trim() || state === 'followUpLoading'}
                className="self-end p-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600
                         text-white disabled:opacity-30 disabled:cursor-not-allowed
                         hover:from-red-500 hover:to-orange-500 transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
