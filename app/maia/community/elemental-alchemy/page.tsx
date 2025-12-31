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
  Circle
} from 'lucide-react'

// Book data structure
interface Chapter {
  number: number
  title: string
  element?: string
  keyTeachings: string[]
  content_excerpt: string
}

interface BookData {
  title: string
  author: string
  content: {
    chapters: Chapter[]
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
  const [viewMode, setViewMode] = useState<'elements' | 'chapters' | 'reading'>('elements')
  const [readProgress, setReadProgress] = useState<Record<number, boolean>>({})

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
    if (viewMode === 'reading') {
      setViewMode('chapters')
      setSelectedChapter(null)
    } else if (viewMode === 'chapters') {
      setViewMode('elements')
      setSelectedElement(null)
    } else {
      router.push('/maia/community')
    }
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
            {viewMode === 'elements' ? 'Community' : viewMode === 'chapters' ? 'Elements' : 'Chapters'}
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
                                {chapter.keyTeachings.slice(0, 3).filter(t => !t.startsWith('!')).join(' • ')}
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

                    {/* Key Teachings */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                        <Bookmark className="w-4 h-4" />
                        Key Teachings
                      </h3>
                      <div className="space-y-2">
                        {selectedChapter.keyTeachings
                          .filter(t => !t.startsWith('!') && t.length > 10)
                          .slice(0, 10)
                          .map((teaching, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${element.textColor.replace('text-', 'bg-')}
                                            mt-2 flex-shrink-0`} />
                              <p className="text-sm text-white/70 leading-relaxed">{teaching}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Content Excerpt */}
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h3 className="text-sm font-medium text-white/70 mb-4 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        From the Text
                      </h3>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <p className="text-white/70 leading-relaxed whitespace-pre-line">
                          {selectedChapter.content_excerpt}
                        </p>
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
        </AnimatePresence>
      </div>
    </div>
  )
}
