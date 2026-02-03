'use client'

import { useState } from 'react'
import { X, Bookmark, MessageCircle, PenLine, Sparkles, Send, Loader2 } from 'lucide-react'
import { AudioSegment, RitualMode } from './types'

interface ReflectionDrawerProps {
  segment: AudioSegment | null
  ritualMode: RitualMode
  memberId: string
  onClose: () => void
  onMomentSaved: () => void
}

export function ReflectionDrawer({
  segment,
  ritualMode,
  memberId,
  onClose,
  onMomentSaved
}: ReflectionDrawerProps) {
  const [activeTab, setActiveTab] = useState<'highlight' | 'ask' | 'journal'>('highlight')
  const [question, setQuestion] = useState('')
  const [journalNote, setJournalNote] = useState('')
  const [maiaResponse, setMaiaResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!segment) return null

  const handleSaveHighlight = async () => {
    setIsLoading(true)
    try {
      await fetch('/api/reader/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': memberId
        },
        body: JSON.stringify({
          segmentId: segment.id,
          momentType: 'highlight',
          ritualMode
        })
      })
      onMomentSaved()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const handleAskMaia = async () => {
    if (!question.trim()) return
    setIsLoading(true)
    setMaiaResponse('')

    try {
      const res = await fetch('/api/reader/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': memberId
        },
        body: JSON.stringify({
          segmentId: segment.id,
          question,
          ritualMode
        })
      })
      const data = await res.json()
      setMaiaResponse(data.response)
      onMomentSaved()
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveJournal = async () => {
    if (!journalNote.trim()) return
    setIsLoading(true)

    try {
      await fetch('/api/reader/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-member-id': memberId
        },
        body: JSON.stringify({
          segmentId: segment.id,
          momentType: 'note',
          content: journalNote,
          ritualMode
        })
      })
      setJournalNote('')
      onMomentSaved()
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { key: 'highlight', label: 'Save', icon: Bookmark },
    { key: 'ask', label: 'Ask MAIA', icon: Sparkles },
    { key: 'journal', label: 'Journal', icon: PenLine }
  ] as const

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-stone-900 border-t border-stone-700 rounded-t-2xl shadow-2xl animate-slide-up">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 pr-4">
            <p className="text-stone-400 text-sm mb-1">Selected passage:</p>
            <p className="text-amber-100 italic line-clamp-2">&ldquo;{segment.text}&rdquo;</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-full">
            <X className="w-5 h-5 text-stone-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
                ${activeTab === tab.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="min-h-[150px]">
          {activeTab === 'highlight' && (
            <div className="text-center py-8">
              <Bookmark className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <p className="text-stone-300 mb-4">Save this passage to your reading moments</p>
              <button
                onClick={handleSaveHighlight}
                disabled={isLoading}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Highlight'}
              </button>
            </div>
          )}

          {activeTab === 'ask' && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What would you like to explore about this passage?"
                  className="flex-1 px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleAskMaia()}
                />
                <button
                  onClick={handleAskMaia}
                  disabled={isLoading || !question.trim()}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
              </div>

              {maiaResponse && (
                <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-500 text-sm font-medium">MAIA</span>
                  </div>
                  <p className="text-stone-300 whitespace-pre-wrap">{maiaResponse}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="space-y-4">
              <textarea
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                placeholder="What thoughts, feelings, or insights arise from this passage?"
                className="w-full h-32 px-4 py-3 bg-stone-800 border border-stone-700 rounded-lg text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500 resize-none"
              />
              <button
                onClick={handleSaveJournal}
                disabled={isLoading || !journalNote.trim()}
                className="w-full px-4 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Journal Entry'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
