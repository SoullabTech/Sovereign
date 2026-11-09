'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { AudiobookReader } from '@/components/reader/AudiobookReader'
import { useVerifiedReaderSession } from '@/components/reader/useVerifiedReaderSession'
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
    const response = await fetch(`/audiobook/elemental-alchemy/${chapterSlug}/manifest.json`, {
      cache: 'no-store',
    })
    if (!response.ok) return null
    const manifest: ManifestData = await response.json()

    return {
      id: manifest.id,
      slug: chapterSlug,
      title: manifest.title,
      audioUrl: `/audiobook/elemental-alchemy/${chapterSlug}/${manifest.audioFile}`,
      durationMs: manifest.durationMs,
      segments: manifest.segments.map((segment, index): AudioSegment => ({
        id: `${manifest.id}-${index}`,
        index,
        text: segment.text,
        startMs: segment.startMs,
        endMs: segment.endMs,
        type: (segment.type as 'paragraph' | 'heading' | 'quote') || 'paragraph'
      }))
    }
  } catch (error) {
    console.error('Failed to load chapter:', error)
    return null
  }
}

export default function ElementalAlchemyReaderPage() {
  const session = useVerifiedReaderSession()
  const [chapterSlug, setChapterSlug] = useState('preface')
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session.memberKey) {
      setChapter(null)
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      setLoading(true)
      const nextChapter = await loadChapter(chapterSlug)
      if (cancelled) return
      setChapter(nextChapter)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [chapterSlug, session.memberKey])

  const chapterLabel = CHAPTERS.find((candidate) => candidate.slug === chapterSlug)?.label ?? chapterSlug

  if (!session.memberKey && session.status === 'checking') {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Verifying your private reading session…</p>
        </div>
      </div>
    )
  }

  if (!session.memberKey) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold text-amber-100 mb-4">Reading session ended</h1>
          <p className="text-stone-500 mb-6">
            Sign in again before opening narration or your private reading moments.
          </p>
          <Link
            href="/signin?returnTo=/maia/community/elemental-alchemy/reader"
            className="inline-flex rounded-lg bg-amber-600 px-5 py-3 text-white hover:bg-amber-500"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-stone-500">Loading {chapterLabel}...</p>
        </div>
      </div>
    )
  }

  if (!chapter) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-950">
        <div className="text-center max-w-md px-6">
          <h1 className="text-2xl font-semibold text-amber-100 mb-4">Coming Soon</h1>
          <p className="text-stone-500">This chapter is being prepared. Check back soon.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-stone-950">
      <div className="flex items-center justify-between px-6 py-3 bg-stone-900/50 border-b border-stone-800">
        <p className="text-xs text-stone-500">Elemental Alchemy · Read-Along</p>
        <div className="relative">
          <select
            value={chapterSlug}
            onChange={(event) => setChapterSlug(event.target.value)}
            className="appearance-none bg-stone-800 border border-stone-700 text-stone-200 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            {CHAPTERS.map((candidate) => (
              <option key={candidate.slug} value={candidate.slug}>{candidate.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <AudiobookReader
          key={`${session.memberKey}:${chapter.id}`}
          chapter={chapter}
          memberKey={session.memberKey}
        />
      </div>
    </div>
  )
}
