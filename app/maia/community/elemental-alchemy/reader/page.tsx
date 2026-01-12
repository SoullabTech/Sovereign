'use client'

import { useEffect, useState } from 'react'
import { AudiobookReader } from '@/components/reader/AudiobookReader'
import { Chapter, AudioSegment } from '@/components/reader/types'
import { Loader2, ChevronDown } from 'lucide-react'

type ChapterOption = { slug: string; label: string }

const CHAPTERS: ChapterOption[] = [
  { slug: 'preface', label: 'Preface' },
  { slug: 'introduction', label: 'Introduction' },
  { slug: 'ch01', label: 'Chapter 1: The Journey Begins' },
  { slug: 'ch02', label: 'Chapter 2: The Torus of Change' },
  { slug: 'ch03', label: 'Chapter 3: Understanding the Trinity' },
  { slug: 'ch04', label: 'Chapter 4: The Elements of Wholeness' },
  { slug: 'ch05', label: 'Chapter 5: Fire' },
  { slug: 'ch06', label: 'Chapter 6: Water' },
  { slug: 'ch07', label: 'Chapter 7: Earth' },
  { slug: 'ch08', label: 'Chapter 8: Air' },
  { slug: 'ch09', label: 'Chapter 9: Aether' },
  { slug: 'ch10', label: 'Chapter 10: Living the Spiralogic Process' },
]

interface ManifestSegment {
  text: string
  startMs: number
  endMs: number
  type?: string
}

interface ManifestData {
  id: string
  title: string
  audioFile: string
  durationMs: number
  segments: ManifestSegment[]
}

async function loadChapter(chapterSlug: string): Promise<Chapter | null> {
  try {
    const res = await fetch(`/audiobook/elemental-alchemy/${chapterSlug}/manifest.json`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const manifest: ManifestData = await res.json()

    // Map manifest to Chapter type
    return {
      id: manifest.id,
      slug: chapterSlug,
      title: manifest.title,
      audioUrl: `/audiobook/elemental-alchemy/${chapterSlug}/${manifest.audioFile}`,
      durationMs: manifest.durationMs,
      segments: manifest.segments.map((seg, idx): AudioSegment => ({
        id: `${manifest.id}-${idx}`,
        index: idx,
        text: seg.text,
        startMs: seg.startMs,
        endMs: seg.endMs,
        type: (seg.type as 'paragraph' | 'heading' | 'quote') || 'paragraph'
      }))
    }
  } catch (err) {
    console.error('Failed to load chapter:', err)
    return null
  }
}

export default function ElementalAlchemyReaderPage() {
  const [chapterSlug, setChapterSlug] = useState<string>('preface')
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberId, setMemberId] = useState<string>('')

  // Get member ID from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('beta_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        setMemberId(user.id || 'local-dev-user')
      } catch {
        setMemberId('local-dev-user')
      }
    } else {
      setMemberId('local-dev-user')
    }
  }, [])

  // Load chapter when slug changes
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      const c = await loadChapter(chapterSlug)
      if (cancelled) return
      setChapter(c)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [chapterSlug])

  const chapterLabel = CHAPTERS.find((c) => c.slug === chapterSlug)?.label ?? chapterSlug

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-400">Loading {chapterLabel}...</p>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold text-amber-100 mb-4">Coming Soon</h1>
          <p className="text-stone-400">
            This chapter is being prepared. Check back soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-stone-950">
      {/* Chapter selector header */}
      <div className="flex items-center justify-between px-6 py-3 bg-stone-900/50 border-b border-stone-800">
        <div>
          <p className="text-xs text-stone-500">Elemental Alchemy · Read-Along</p>
        </div>
        <div className="relative">
          <select
            value={chapterSlug}
            onChange={(e) => setChapterSlug(e.target.value)}
            className="appearance-none bg-stone-800 border border-stone-700 text-stone-200 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CHAPTERS.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        </div>
      </div>

      {/* Reader */}
      <div className="flex-1 overflow-hidden">
        <AudiobookReader
          key={chapter.id}
          chapter={chapter}
          memberId={memberId}
        />
      </div>
    </div>
  )
}
