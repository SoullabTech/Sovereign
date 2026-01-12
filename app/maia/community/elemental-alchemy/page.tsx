'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  BookOpen,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Play,
  Bookmark,
  PenLine,
  Heart,
  Compass,
  Star,
  Circle,
  MessageCircle,
  Volume2,
  VolumeX,
  Pause
} from 'lucide-react'
import { AskMaiaSheet } from '@/components/elemental-alchemy/AskMaiaSheet'
import { BookChat } from '@/components/elemental-alchemy/BookChat'

// Track current audio for stopping
let currentAudio: HTMLAudioElement | null = null

// Clean text for speech synthesis
const cleanTextForSpeech = (text: string): string => {
  return text
    .replace(/\*[^*]+\*/g, '')      // Remove asterisks
    .replace(/\.{3,}/g, '...')       // Fix ellipsis
    .replace(/\([^)]+\)/g, '')       // Remove parentheticals
    .replace(/["]/g, '')             // Remove quotes
    .replace(/!\[\]\[image\d+\]/g, '') // Remove markdown image refs
    .replace(/\*\*\*/g, '')          // Remove horizontal rules
    .replace(/\n{3,}/g, '\n\n')      // Normalize line breaks
    .trim()
}

// Chunk text for TTS (OpenAI has 4096 char limit, use 3500 to be safe)
const MAX_TTS_CHUNK_SIZE = 3500

const chunkTextForTTS = (text: string): string[] => {
  const cleanText = cleanTextForSpeech(text)
  if (cleanText.length <= MAX_TTS_CHUNK_SIZE) {
    return [cleanText]
  }

  const chunks: string[] = []
  let remaining = cleanText

  while (remaining.length > 0) {
    if (remaining.length <= MAX_TTS_CHUNK_SIZE) {
      chunks.push(remaining)
      break
    }

    // Find a good break point (sentence end) within the limit
    let breakPoint = MAX_TTS_CHUNK_SIZE

    // Look for sentence boundaries: . ! ? followed by space or newline
    const searchArea = remaining.slice(0, MAX_TTS_CHUNK_SIZE)
    const sentenceEndRegex = /[.!?][\s\n]/g
    let lastSentenceEnd = -1
    let match

    while ((match = sentenceEndRegex.exec(searchArea)) !== null) {
      lastSentenceEnd = match.index + 1 // Include the punctuation
    }

    if (lastSentenceEnd > MAX_TTS_CHUNK_SIZE / 2) {
      // Found a good sentence break point
      breakPoint = lastSentenceEnd
    } else {
      // No good sentence break, try paragraph break
      const paragraphBreak = searchArea.lastIndexOf('\n\n')
      if (paragraphBreak > MAX_TTS_CHUNK_SIZE / 2) {
        breakPoint = paragraphBreak
      } else {
        // Last resort: break at a space
        const spaceBreak = searchArea.lastIndexOf(' ')
        if (spaceBreak > MAX_TTS_CHUNK_SIZE / 2) {
          breakPoint = spaceBreak
        }
      }
    }

    chunks.push(remaining.slice(0, breakPoint).trim())
    remaining = remaining.slice(breakPoint).trim()
  }

  return chunks
}

// Browser TTS fallback
const speakWithBrowserTTS = (text: string, element: string = 'earth'): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve()
      return
    }

    window.speechSynthesis.cancel()

    const cleanText = cleanTextForSpeech(text)
    if (!cleanText) {
      resolve()
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleanText)

    // Configure voice based on element
    utterance.rate = element === 'fire' ? 1.05 :
                    element === 'water' ? 0.92 :
                    element === 'earth' ? 0.88 :
                    element === 'air' ? 1.0 : 0.95

    utterance.pitch = element === 'water' ? 1.1 :
                     element === 'earth' ? 0.95 :
                     element === 'air' ? 1.05 : 1.0

    utterance.volume = 0.9

    // Try to select a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('karen') ||
      v.name.toLowerCase().includes('moira') ||
      v.name.toLowerCase().includes('tessa') ||
      v.name.toLowerCase().includes('allison') ||
      (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en'))

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()

    window.speechSynthesis.speak(utterance)
  })
}

// OpenAI TTS voices
const READING_VOICE = 'onyx'   // Deep, rich voice for book reading
const MAIA_VOICE = 'alloy'     // For MAIA responses when discussing sections

// Track if reading should stop
let shouldStopReading = false

// High-quality TTS using OpenAI via API (single chunk)
const speakChunk = async (text: string, element: string = 'earth'): Promise<boolean> => {
  if (!text || shouldStopReading) return false

  try {
    const response = await fetch('/api/voice/openai-tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: READING_VOICE,
        format: 'mp3',
        speed: 1.0
      })
    })

    if (!response.ok) {
      throw new Error('TTS API error')
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    currentAudio = audio

    return new Promise((resolve) => {
      audio.onended = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudio = null
        resolve(!shouldStopReading) // Return true to continue, false to stop
      }
      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl)
        currentAudio = null
        // Fall back to browser TTS on audio error
        speakWithBrowserTTS(text, element).then(() => resolve(!shouldStopReading))
      }
      audio.play().catch(() => {
        // Fall back to browser TTS if autoplay blocked
        speakWithBrowserTTS(text, element).then(() => resolve(!shouldStopReading))
      })
    })

  } catch (error) {
    console.log('OpenAI TTS unavailable, using browser TTS:', error)
    await speakWithBrowserTTS(text, element)
    return !shouldStopReading
  }
}

// Speak text with chunking for long content
const speakText = async (text: string, element: string = 'earth'): Promise<void> => {
  shouldStopReading = false
  const chunks = chunkTextForTTS(text)

  console.log(`🎤 TTS: Speaking ${chunks.length} chunk(s)`)

  for (let i = 0; i < chunks.length; i++) {
    if (shouldStopReading) {
      console.log('🛑 TTS: Reading stopped by user')
      break
    }

    console.log(`🎤 TTS: Playing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)`)
    const shouldContinue = await speakChunk(chunks[i], element)

    if (!shouldContinue) {
      break
    }
  }
}

const stopSpeaking = () => {
  // Signal chunked reading to stop
  shouldStopReading = true

  // Stop OpenAI audio
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  // Stop browser TTS
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// Book data structure (updated for full content)
interface Section {
  title: string
  content: string
}

interface Chapter {
  number: number
  title: string
  element?: string
  sections: Section[]
  fullContent: string
  // Legacy fields for backwards compatibility
  keyTeachings?: string[]
  content_excerpt?: string
}

interface BookData {
  title: string
  author: string
  content: {
    preface?: string
    introduction?: string
    chapters: Chapter[]
    appendix?: string
  }
}

// Element configuration
const ELEMENTS = {
  intro: {
    name: 'Foundation',
    icon: Compass,
    color: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    textColor: 'text-violet-400',
    description: 'The philosophical foundations of elemental wisdom'
  },
  fire: {
    name: 'Fire',
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    textColor: 'text-orange-400',
    description: 'Transformation, vision, passion, and spiritual energy'
  },
  water: {
    name: 'Water',
    icon: Droplets,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-400',
    description: 'Emotional depth, intuition, healing, and flow'
  },
  earth: {
    name: 'Earth',
    icon: Mountain,
    color: 'from-green-500 to-emerald-600',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-400',
    description: 'Stability, groundedness, manifestation, and discipline'
  },
  air: {
    name: 'Air',
    icon: Wind,
    color: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/30',
    textColor: 'text-sky-400',
    description: 'Communication, intellect, perspective, and connection'
  },
  aether: {
    name: 'Aether',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
    textColor: 'text-purple-400',
    description: 'Unity, transcendence, infinite potential, and integration'
  }
}

type ElementKey = keyof typeof ELEMENTS

export default function ElementalAlchemyBookPage() {
  const router = useRouter()
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedElement, setSelectedElement] = useState<ElementKey | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null)
  const [viewMode, setViewMode] = useState<'elements' | 'chapters' | 'reading' | 'section' | 'introduction' | 'preface'>('elements')
  const [readProgress, setReadProgress] = useState<Record<number, boolean>>({})
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)

  // Ask MAIA state
  const [askMaiaOpen, setAskMaiaOpen] = useState(false)
  const [selectedTeaching, setSelectedTeaching] = useState<string | null>(null)

  // Read aloud state
  const [isReading, setIsReading] = useState(false)

  // Mock user ID (replace with real auth)
  const userId = 'beta-user-1'

  useEffect(() => {
    loadBookData()
    loadProgress()
  }, [])

  const loadBookData = async () => {
    try {
      const res = await fetch('/api/community/elemental-alchemy')
      if (res.ok) {
        const data = await res.json()
        setBookData(data)
      }
    } catch (err) {
      console.error('Failed to load book:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadProgress = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('elemental-alchemy-progress')
      if (saved) {
        setReadProgress(JSON.parse(saved))
      }
    }
  }

  const markAsRead = (chapterNum: number) => {
    const newProgress = { ...readProgress, [chapterNum]: true }
    setReadProgress(newProgress)
    if (typeof window !== 'undefined') {
      localStorage.setItem('elemental-alchemy-progress', JSON.stringify(newProgress))
    }
  }

  const getChaptersByElement = (element: ElementKey): Chapter[] => {
    if (!bookData) return []
    return bookData.content.chapters.filter(ch =>
      (ch.element || 'intro') === element
    )
  }

  const getTotalProgress = () => {
    if (!bookData) return 0
    const total = bookData.content.chapters.length
    const read = Object.values(readProgress).filter(Boolean).length
    return Math.round((read / total) * 100)
  }

  const handleBack = () => {
    // Stop reading when navigating away
    if (isReading) {
      stopSpeaking()
      setIsReading(false)
    }

    if (viewMode === 'section') {
      setViewMode('reading')
      setSelectedSection(null)
    } else if (viewMode === 'reading') {
      setViewMode('chapters')
      setSelectedChapter(null)
    } else if (viewMode === 'chapters') {
      setViewMode('elements')
      setSelectedElement(null)
    } else if (viewMode === 'introduction') {
      setViewMode('elements')
    } else if (viewMode === 'preface') {
      setViewMode('elements')
    } else {
      router.push('/maia/community')
    }
  }

  // Read aloud handlers
  const handleReadAloud = async (text: string, element: string = 'earth') => {
    if (isReading) {
      stopSpeaking()
      setIsReading(false)
      return
    }

    setIsReading(true)
    try {
      await speakText(text, element)
    } finally {
      setIsReading(false)
    }
  }

  const handleStopReading = () => {
    stopSpeaking()
    setIsReading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Sparkles className="w-full h-full text-purple-400" />
          </motion.div>
          <p className="text-white/60">Loading sacred wisdom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-5xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5
                     border border-white/10 text-white/70 hover:bg-white/10 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {viewMode === 'elements' ? 'Community' : viewMode === 'introduction' ? 'Elements' : viewMode === 'preface' ? 'Elements' : viewMode === 'chapters' ? 'Elements' : 'Chapters'}
          </button>

          {/* Progress indicator */}
          <div className="flex items-center gap-3">
            <div className="text-sm text-white/50">
              {getTotalProgress()}% Complete
            </div>
            <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getTotalProgress()}%` }}
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Book Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-4 mb-4"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500
                          rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text
                           bg-gradient-to-r from-amber-400 via-orange-400 to-red-400">
                Elemental Alchemy
              </h1>
              <p className="text-white/60 text-sm">The Ancient Art of Living a Phenomenal Life</p>
              <p className="text-amber-400/60 text-xs mt-1">by Kelly Nezat</p>
            </div>
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {/* Element Selection View */}
          {viewMode === 'elements' && (
            <motion.div
              key="elements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Elemental Journey Map */}
              <div className="text-center mb-8">
                <p className="text-white/70 max-w-2xl mx-auto">
                  Explore the five elements and discover the ancient wisdom for transformation.
                  Each element offers unique teachings for your journey of becoming.
                </p>
              </div>

              {/* Element Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(Object.entries(ELEMENTS) as [ElementKey, typeof ELEMENTS.fire][]).map(([key, element], idx) => {
                  const Icon = element.icon
                  const chapters = getChaptersByElement(key)
                  const completedCount = chapters.filter(ch => readProgress[ch.number]).length

                  return (
                    <motion.button
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      onClick={() => {
                        setSelectedElement(key)
                        setViewMode('chapters')
                      }}
                      className={`relative p-6 rounded-2xl border ${element.borderColor} ${element.bgColor}
                               hover:scale-[1.02] transition-all duration-300 text-left group overflow-hidden`}
                    >
                      {/* Background gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${element.color} opacity-0
                                    group-hover:opacity-10 transition-opacity`} />

                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.color}
                                        flex items-center justify-center shadow-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-white/40">{chapters.length} chapters</div>
                            <div className={`text-xs ${element.textColor}`}>
                              {completedCount}/{chapters.length} read
                            </div>
                          </div>
                        </div>

                        <h3 className={`text-xl font-semibold ${element.textColor} mb-2`}>
                          {element.name}
                        </h3>
                        <p className="text-sm text-white/50 leading-relaxed">
                          {element.description}
                        </p>

                        <div className="mt-4 flex items-center gap-2 text-white/40 group-hover:text-white/60">
                          <span className="text-sm">Explore</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Preface & Introduction - Start Here */}
              <div className="mt-6 space-y-3">
                {bookData?.content?.preface && (
                  <button
                    onClick={() => setViewMode('preface')}
                    className="w-full p-5 rounded-xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10
                             border border-violet-500/30 hover:border-violet-500/50 transition-all
                             flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600
                                  flex items-center justify-center shadow-lg">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-lg font-medium text-violet-300">Read the Preface</div>
                      <div className="text-sm text-white/50">Kelly's personal story and call to adventure</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-violet-400/50 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )}

                {bookData?.content?.introduction && (
                  <button
                    onClick={() => setViewMode('introduction')}
                    className="w-full p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10
                             border border-amber-500/30 hover:border-amber-500/50 transition-all
                             flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                                  flex items-center justify-center shadow-lg">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="text-lg font-medium text-amber-300">Read the Introduction</div>
                      <div className="text-sm text-white/50">The philosophy of Elemental Alchemy</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400/50 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                  </button>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/maia/community/elemental-alchemy/assessment')}
                  className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10
                           border border-purple-500/20 hover:border-purple-500/40 transition-all
                           flex items-center gap-3"
                >
                  <Star className="w-5 h-5 text-purple-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-purple-300">Discover Your Element</div>
                    <div className="text-xs text-white/50">Take the elemental assessment</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/maia/community/elemental-alchemy/practices')}
                  className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10
                           border border-amber-500/20 hover:border-amber-500/40 transition-all
                           flex items-center gap-3"
                >
                  <Play className="w-5 h-5 text-amber-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-amber-300">Guided Practices</div>
                    <div className="text-xs text-white/50">Meditations & exercises</div>
                  </div>
                </button>

                <button
                  onClick={() => router.push('/maia/community/elemental-alchemy/journal')}
                  className="p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10
                           border border-green-500/20 hover:border-green-500/40 transition-all
                           flex items-center gap-3"
                >
                  <PenLine className="w-5 h-5 text-green-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium text-green-300">Elemental Journal</div>
                    <div className="text-xs text-white/50">Reflect on your journey</div>
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {/* Chapter List View */}
          {viewMode === 'chapters' && selectedElement && (
            <motion.div
              key="chapters"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {(() => {
                const element = ELEMENTS[selectedElement]
                const Icon = element.icon
                const chapters = getChaptersByElement(selectedElement)

                return (
                  <>
                    {/* Element Header */}
                    <div className={`p-6 rounded-2xl ${element.bgColor} border ${element.borderColor}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${element.color}
                                      flex items-center justify-center shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className={`text-2xl font-bold ${element.textColor}`}>
                            {element.name}
                          </h2>
                          <p className="text-white/60 text-sm">{element.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Chapter List */}
                    <div className="space-y-3">
                      {chapters.map((chapter, idx) => (
                        <motion.button
                          key={chapter.number}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            setSelectedChapter(chapter)
                            setViewMode('reading')
                          }}
                          className={`w-full p-5 rounded-xl bg-white/5 border border-white/10
                                   hover:bg-white/10 hover:border-${element.textColor.replace('text-', '')}/30
                                   transition-all text-left group`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-lg ${element.bgColor}
                                          flex items-center justify-center flex-shrink-0
                                          ${readProgress[chapter.number] ? 'ring-2 ring-green-500/50' : ''}`}>
                              {readProgress[chapter.number] ? (
                                <Circle className="w-5 h-5 text-green-400 fill-green-400" />
                              ) : (
                                <span className={`text-sm font-medium ${element.textColor}`}>
                                  {idx + 1}
                                </span>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="text-base font-medium text-white/90 mb-1
                                           group-hover:text-white transition-colors">
                                {chapter.title}
                              </h3>
                              <p className="text-sm text-white/50 line-clamp-2">
                                {chapter.sections?.slice(0, 3).map(s => s.title).join(' • ') ||
                                 chapter.keyTeachings?.slice(0, 3).filter(t => !t.startsWith('!')).join(' • ') ||
                                 'Explore this chapter'}
                              </p>
                            </div>

                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60
                                                   group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* Reading View */}
          {viewMode === 'reading' && selectedChapter && selectedElement && (
            <motion.div
              key="reading"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {(() => {
                const element = ELEMENTS[selectedElement]
                const Icon = element.icon

                return (
                  <>
                    {/* Chapter Header */}
                    <div className={`p-6 rounded-2xl ${element.bgColor} border ${element.borderColor}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.color}
                                      flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs ${element.textColor} mb-1`}>{element.name}</div>
                          <h2 className="text-xl font-bold text-white mb-2">
                            {selectedChapter.title}
                          </h2>
                        </div>
                        <button
                          onClick={() => markAsRead(selectedChapter.number)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all
                                   ${readProgress[selectedChapter.number]
                                     ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                     : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                                   }`}
                        >
                          {readProgress[selectedChapter.number] ? '✓ Read' : 'Mark as Read'}
                        </button>
                      </div>
                    </div>

                    {/* Chapter Sections */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4" />
                          Sections
                        </span>
                        <span className="text-xs text-white/40">Tap to read & discuss with MAIA</span>
                      </h3>
                      <div className="space-y-2">
                        {(selectedChapter.sections || []).map((section, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedSection(section)
                              setViewMode('section')
                            }}
                            className="w-full flex items-start gap-3 p-3 rounded-lg
                                     bg-white/5 hover:bg-white/10 transition-colors text-left group
                                     border border-white/5 hover:border-white/10"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${element.color}
                                          flex items-center justify-center flex-shrink-0`}>
                              <span className="text-white text-xs font-medium">{idx + 1}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/90 font-medium text-sm mb-1 group-hover:text-white">
                                {section.title}
                              </p>
                              <p className="text-white/50 text-xs line-clamp-2">
                                {section.content.slice(0, 120)}...
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-amber-400
                                                   flex-shrink-0 transition-colors" />
                          </button>
                        ))}
                        {(!selectedChapter.sections || selectedChapter.sections.length === 0) && (
                          <p className="text-white/40 text-sm text-center py-4">
                            Full sections coming soon
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Reflection Prompt */}
                    <div className={`p-6 rounded-xl ${element.bgColor} border ${element.borderColor}`}>
                      <h3 className={`text-sm font-medium ${element.textColor} mb-3 flex items-center gap-2`}>
                        <Heart className="w-4 h-4" />
                        Reflection
                      </h3>
                      <p className="text-white/70 text-sm italic mb-4">
                        "How does this teaching resonate with your current life experience?
                        What aspects of {element.name.toLowerCase()} are you being called to explore?"
                      </p>
                      <button
                        onClick={() => router.push(`/maia/community/elemental-alchemy/journal?element=${selectedElement}&chapter=${selectedChapter.number}`)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10
                                 text-white/80 hover:bg-white/20 transition-all text-sm"
                      >
                        <PenLine className="w-4 h-4" />
                        Write in Journal
                      </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={() => {
                          const chapters = getChaptersByElement(selectedElement)
                          const currentIdx = chapters.findIndex(ch => ch.number === selectedChapter.number)
                          if (currentIdx > 0) {
                            setSelectedChapter(chapters[currentIdx - 1])
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white/60
                                 hover:bg-white/10 transition-all text-sm"
                      >
                        ← Previous
                      </button>
                      <button
                        onClick={() => {
                          const chapters = getChaptersByElement(selectedElement)
                          const currentIdx = chapters.findIndex(ch => ch.number === selectedChapter.number)
                          if (currentIdx < chapters.length - 1) {
                            markAsRead(selectedChapter.number)
                            setSelectedChapter(chapters[currentIdx + 1])
                          }
                        }}
                        className={`px-4 py-2 rounded-lg bg-gradient-to-r ${element.color}
                                 text-white hover:opacity-90 transition-all text-sm`}
                      >
                        Next Chapter →
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* Section Reading View */}
          {viewMode === 'section' && selectedElement && selectedChapter && selectedSection && (
            <motion.div
              key="section"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {(() => {
                const element = ELEMENTS[selectedElement]
                const Icon = element.icon

                return (
                  <>
                    {/* Section Header */}
                    <div className={`p-6 rounded-2xl ${element.bgColor} border ${element.borderColor}`}>
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${element.color}
                                      flex items-center justify-center shadow-lg flex-shrink-0`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className={`text-xs ${element.textColor} mb-1`}>
                            {selectedChapter.title}
                          </div>
                          <h2 className="text-xl font-bold text-white">
                            {selectedSection.title}
                          </h2>
                        </div>
                      </div>
                    </div>

                    {/* Full Section Content */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      {/* Read Aloud Button */}
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => handleReadAloud(
                            `${selectedSection.title}. ${selectedSection.content}`,
                            selectedElement
                          )}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm
                                   ${isReading
                                     ? `bg-gradient-to-r ${element.color} text-white`
                                     : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                                   }`}
                        >
                          {isReading ? (
                            <>
                              <VolumeX className="w-4 h-4" />
                              Stop Reading
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              Read Aloud
                            </>
                          )}
                        </button>
                      </div>
                      <div className="prose prose-invert prose-lg max-w-none">
                        <p className="text-white/85 leading-relaxed whitespace-pre-line text-[16px]">
                          {selectedSection.content}
                        </p>
                      </div>
                    </div>

                    {/* Ask MAIA About This Section */}
                    <div className={`p-6 rounded-xl ${element.bgColor} border ${element.borderColor}`}>
                      <h3 className={`text-sm font-medium ${element.textColor} mb-3 flex items-center gap-2`}>
                        <Sparkles className="w-4 h-4" />
                        Explore This Teaching
                      </h3>
                      <p className="text-white/70 text-sm mb-4">
                        Want to understand this section more deeply? Ask MAIA for personalized insight.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setSelectedTeaching(selectedSection.title)
                            setAskMaiaOpen(true)
                          }}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                   bg-gradient-to-r ${element.color} text-white
                                   hover:opacity-90 transition-all text-sm font-medium`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          Ask MAIA
                        </button>
                        <button
                          onClick={() => router.push(`/maia/community/elemental-alchemy/journal?element=${selectedElement}&chapter=${selectedChapter.number}&prompt=${encodeURIComponent(selectedSection.title)}`)}
                          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                                   bg-white/10 text-white/80 hover:bg-white/20 transition-all text-sm"
                        >
                          <PenLine className="w-4 h-4" />
                          Journal
                        </button>
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                      <button
                        onClick={() => {
                          handleStopReading() // Stop reading when navigating
                          const sections = selectedChapter.sections || []
                          const currentIdx = sections.findIndex(s => s.title === selectedSection.title)
                          if (currentIdx > 0) {
                            setSelectedSection(sections[currentIdx - 1])
                          } else {
                            setViewMode('reading')
                            setSelectedSection(null)
                          }
                        }}
                        className="px-4 py-2 rounded-lg bg-white/5 text-white/60
                                 hover:bg-white/10 transition-all text-sm"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          handleStopReading() // Stop reading when navigating
                          const sections = selectedChapter.sections || []
                          const currentIdx = sections.findIndex(s => s.title === selectedSection.title)
                          if (currentIdx < sections.length - 1) {
                            setSelectedSection(sections[currentIdx + 1])
                          } else {
                            setViewMode('reading')
                            setSelectedSection(null)
                          }
                        }}
                        className={`px-4 py-2 rounded-lg bg-gradient-to-r ${element.color}
                                 text-white hover:opacity-90 transition-all text-sm`}
                      >
                        Next Section →
                      </button>
                    </div>
                  </>
                )
              })()}
            </motion.div>
          )}

          {/* Introduction View */}
          {viewMode === 'introduction' && bookData?.content?.introduction && (
            <motion.div
              key="introduction"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Introduction Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600
                                flex items-center justify-center shadow-lg flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-amber-300">Introduction</h2>
                    <p className="text-white/60 text-sm mt-1">
                      Begin your transformative journey through elemental alchemy
                    </p>
                  </div>
                </div>
              </div>

              {/* Introduction Content */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                {/* Read Aloud Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => handleReadAloud(bookData.content.introduction || '', 'intro')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm
                             ${isReading
                               ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                               : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                             }`}
                  >
                    {isReading ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        Stop Reading
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Read Aloud
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-white/85 leading-relaxed whitespace-pre-line text-[16px]">
                    {bookData.content.introduction
                      .replace(/!\[\]\[image\d+\]/g, '')
                      .replace(/\*\*\*/g, '')
                      .replace(/\n{3,}/g, '\n\n')}
                  </p>
                </div>
              </div>

              {/* Continue to Elements */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setViewMode('elements')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600
                           text-white hover:opacity-90 transition-all font-medium"
                >
                  Explore the Elements →
                </button>
              </div>
            </motion.div>
          )}

          {/* Preface View */}
          {viewMode === 'preface' && bookData?.content?.preface && (
            <motion.div
              key="preface"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Preface Header */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border border-violet-500/30">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600
                                flex items-center justify-center shadow-lg flex-shrink-0">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-violet-300">Preface</h2>
                    <p className="text-white/60 text-sm mt-1">
                      Kelly's personal story and the inspiration behind Elemental Alchemy
                    </p>
                  </div>
                </div>
              </div>

              {/* Preface Content */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                {/* Read Aloud Button */}
                <div className="flex justify-end mb-4">
                  <button
                    onClick={() => handleReadAloud(bookData.content.preface || '', 'intro')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm
                             ${isReading
                               ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                               : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                             }`}
                  >
                    {isReading ? (
                      <>
                        <VolumeX className="w-4 h-4" />
                        Stop Reading
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        Read Aloud
                      </>
                    )}
                  </button>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-white/85 leading-relaxed whitespace-pre-line text-[16px]">
                    {bookData.content.preface
                      .replace(/!\[\]\[image\d+\]/g, '')
                      .replace(/\*\*\*/g, '')
                      .replace(/\n{3,}/g, '\n\n')}
                  </p>
                </div>
              </div>

              {/* Continue to Introduction or Elements */}
              <div className="flex justify-center gap-4 pt-4">
                {bookData?.content?.introduction && (
                  <button
                    onClick={() => setViewMode('introduction')}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600
                             text-white hover:opacity-90 transition-all font-medium"
                  >
                    Read Introduction →
                  </button>
                )}
                <button
                  onClick={() => setViewMode('elements')}
                  className="px-6 py-3 rounded-xl bg-white/10 border border-white/20
                           text-white/80 hover:bg-white/20 transition-all font-medium"
                >
                  Explore Elements
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ask MAIA Sheet */}
        {selectedElement && selectedChapter && selectedTeaching && (
          <AskMaiaSheet
            isOpen={askMaiaOpen}
            onClose={() => {
              setAskMaiaOpen(false)
              setSelectedTeaching(null)
            }}
            teaching={selectedTeaching}
            element={selectedElement}
            chapterNum={selectedChapter.number}
            chapterTitle={selectedChapter.title}
            chapterContent={selectedSection?.content || selectedChapter.fullContent?.slice(0, 2000) || selectedChapter.content_excerpt}
            userId={userId}
            onSaveToJournal={(insight, teaching) => {
              // Navigate to journal with pre-filled content
              const params = new URLSearchParams({
                element: selectedElement,
                chapter: selectedChapter.number.toString(),
                prompt: teaching,
                reflection: `MAIA's insight:\n${insight}\n\nMy reflection:\n`
              })
              router.push(`/maia/community/elemental-alchemy/journal?${params.toString()}`)
            }}
          />
        )}

        {/* Book Chat - Floating conversation with MAIA */}
        {bookData && (
          <BookChat
            bookTitle={bookData.title}
            author={bookData.author}
            currentChapter={selectedChapter ? {
              number: selectedChapter.number,
              title: selectedChapter.title,
              element: selectedChapter.element
            } : undefined}
            userId={userId}
          />
        )}
      </div>
    </div>
  )
}
