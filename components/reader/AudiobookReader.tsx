'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Chapter, AudioSegment, ReadingMoment, RitualMode, ReaderState } from './types'
import { RitualModeSelector } from './RitualModeSelector'
import { AudioControls } from './AudioControls'
import { SegmentPanel } from './SegmentPanel'
import { ReflectionDrawer } from './ReflectionDrawer'

interface AudiobookReaderProps {
  chapter: Chapter
  memberId: string
}

export function AudiobookReader({ chapter, memberId }: AudiobookReaderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [moments, setMoments] = useState<ReadingMoment[]>([])

  const [state, setState] = useState<ReaderState>({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    currentSegmentIndex: 0,
    ritualMode: 'earth',
    selectedSegment: null
  })

  // Reset state when chapter changes
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentSegmentIndex: 0,
      selectedSegment: null
    }))
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [chapter.id])

  // Find current segment based on playback time
  const findCurrentSegment = useCallback((timeMs: number): number => {
    for (let i = 0; i < chapter.segments.length; i++) {
      const seg = chapter.segments[i]
      if (timeMs >= seg.startMs && timeMs < seg.endMs) {
        return i
      }
    }
    return state.currentSegmentIndex
  }, [chapter.segments, state.currentSegmentIndex])

  // Audio time update handler
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const timeMs = audio.currentTime * 1000
      setState(prev => ({
        ...prev,
        currentTime: timeMs,
        currentSegmentIndex: findCurrentSegment(timeMs)
      }))
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false }))
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [findCurrentSegment])

  // Load moments
  useEffect(() => {
    const loadMoments = async () => {
      try {
        const res = await fetch(`/api/reader/moments?chapterId=${chapter.id}`, {
          headers: { 'x-member-id': memberId }
        })
        const data = await res.json()
        setMoments(data.moments || [])
      } catch (err) {
        console.error('Failed to load moments:', err)
      }
    }
    loadMoments()
  }, [chapter.id, memberId])

  const handlePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (state.isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setState(prev => ({ ...prev, isPlaying: !prev.isPlaying }))
  }

  const handleSeek = (timeMs: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = timeMs / 1000
    setState(prev => ({
      ...prev,
      currentTime: timeMs,
      currentSegmentIndex: findCurrentSegment(timeMs)
    }))
  }

  const handleRateChange = (rate: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = rate
    setState(prev => ({ ...prev, playbackRate: rate }))
  }

  const handleSegmentClick = (segment: AudioSegment) => {
    handleSeek(segment.startMs)
  }

  const handleSegmentSelect = (segment: AudioSegment) => {
    setState(prev => ({ ...prev, selectedSegment: segment }))
  }

  const handleMomentSaved = async () => {
    // Reload moments
    try {
      const res = await fetch(`/api/reader/moments?chapterId=${chapter.id}`, {
        headers: { 'x-member-id': memberId }
      })
      const data = await res.json()
      setMoments(data.moments || [])
    } catch (err) {
      console.error('Failed to reload moments:', err)
    }
  }

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <div>
          <h1 className="text-xl font-semibold text-amber-100">{chapter.title}</h1>
          <p className="text-sm text-stone-400">Elemental Alchemy</p>
        </div>
        <RitualModeSelector
          mode={state.ritualMode}
          onChange={(mode) => setState(prev => ({ ...prev, ritualMode: mode }))}
        />
      </header>

      {/* Main content - scrollable text */}
      <main className="flex-1 min-h-0 overflow-hidden">
        <SegmentPanel
          segments={chapter.segments}
          currentSegmentIndex={state.currentSegmentIndex}
          moments={moments}
          onSegmentClick={handleSegmentClick}
          onSegmentSelect={handleSegmentSelect}
        />
      </main>

      {/* Audio controls */}
      <footer className="px-6 py-4 border-t border-stone-800">
        <AudioControls
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={chapter.durationMs}
          playbackRate={state.playbackRate}
          onPlayPause={handlePlayPause}
          onSeek={handleSeek}
          onRateChange={handleRateChange}
          onSkipBack={() => handleSeek(Math.max(0, state.currentTime - 10000))}
          onSkipForward={() => handleSeek(Math.min(chapter.durationMs, state.currentTime + 30000))}
        />
      </footer>

      {/* Hidden audio element */}
      <audio ref={audioRef} src={chapter.audioUrl} preload="auto" />

      {/* Reflection drawer */}
      <ReflectionDrawer
        segment={state.selectedSegment}
        ritualMode={state.ritualMode}
        memberId={memberId}
        onClose={() => setState(prev => ({ ...prev, selectedSegment: null }))}
        onMomentSaved={handleMomentSaved}
      />
    </div>
  )
}
