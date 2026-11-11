'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Chapter, AudioSegment, ReadingMoment, ReaderState } from './types'
import { RitualModeSelector } from './RitualModeSelector'
import { AudioControls } from './AudioControls'
import { SegmentPanel } from './SegmentPanel'
import { ReflectionDrawer } from './ReflectionDrawer'
import { verifiedSessionFetch } from '@/lib/http/verifiedSessionFetch'
import {
  acquireAudioOutput,
  AUDIO_OUTPUT_TAB_NONCE,
  SOULLAB_AUDIO_PREFLIGHT_VERSION,
} from '@/lib/listening/audioOutputLock'
import type { AudioOutputLease } from '@/lib/listening/audioOutputLock'
import {
  SOULLAB_AUDIO_FOCUS_EVENT,
  SOULLAB_AUDIO_TAB_CHANNEL,
  SOULLAB_SESSION_END_EVENT,
  audioFocusSource,
} from '@/lib/listening/audioFocus'

interface AudiobookReaderProps {
  chapter: Chapter
  /** Verified server-session key used only to retire private client state on switch. */
  memberKey: string
}

export function AudiobookReader({ chapter, memberKey }: AudiobookReaderProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const outputLease = useRef<AudioOutputLease | null>(null)
  const playGeneration = useRef(0)
  const focusChannel = useRef<BroadcastChannel | null>(null)
  const [moments, setMoments] = useState<ReadingMoment[]>([])
  const [isPreparing, setIsPreparing] = useState(false)
  const [narrationMessage, setNarrationMessage] = useState('Ready for member-started narration.')

  const [state, setState] = useState<ReaderState>({
    isPlaying: false,
    currentTime: 0,
    playbackRate: 1,
    currentSegmentIndex: 0,
    ritualMode: 'earth',
    selectedSegment: null
  })

  const releaseOutput = useCallback(() => {
    outputLease.current?.release()
    outputLease.current = null
  }, [])

  const pauseNarration = useCallback((message = 'Narration paused.') => {
    playGeneration.current += 1
    const audio = audioRef.current
    if (audio && !audio.paused) audio.pause()
    releaseOutput()
    setIsPreparing(false)
    setState(previous => ({ ...previous, isPlaying: false }))
    setNarrationMessage(message)
  }, [releaseOutput])

  const stopNarration = useCallback((message = 'Narration stopped.') => {
    playGeneration.current += 1
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    releaseOutput()
    setIsPreparing(false)
    setState(previous => ({
      ...previous,
      isPlaying: false,
      currentTime: 0,
      currentSegmentIndex: 0,
      selectedSegment: null,
    }))
    setNarrationMessage(message)
  }, [releaseOutput])

  // A chapter or verified-member transition must retire prior private playback.
  useEffect(() => {
    stopNarration('Ready for member-started narration.')
    setMoments([])
  }, [chapter.id, memberKey, stopNarration])

  const findCurrentSegment = useCallback((timeMs: number): number => {
    for (let index = 0; index < chapter.segments.length; index += 1) {
      const segment = chapter.segments[index]
      if (timeMs >= segment.startMs && timeMs < segment.endMs) return index
    }
    return state.currentSegmentIndex
  }, [chapter.segments, state.currentSegmentIndex])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const timeMs = audio.currentTime * 1000
      setState(previous => ({
        ...previous,
        currentTime: timeMs,
        currentSegmentIndex: findCurrentSegment(timeMs)
      }))
    }
    const handlePause = () => {
      releaseOutput()
      setState(previous => ({ ...previous, isPlaying: false }))
    }
    const handleEnded = () => {
      releaseOutput()
      setState(previous => ({ ...previous, isPlaying: false }))
      setNarrationMessage('Narration complete. Music stays paused until you choose it again.')
    }
    const handleError = () => {
      releaseOutput()
      setState(previous => ({ ...previous, isPlaying: false }))
      setNarrationMessage('Narration could not continue. No other audio was restarted.')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [findCurrentSegment, releaseOutput])

  // Reader participates in the same in-document and cross-tab output authority.
  useEffect(() => {
    if (typeof BroadcastChannel === 'function') {
      try {
        const channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL)
        focusChannel.current = channel
        channel.onmessage = event => {
          const message = event.data
          if (!message || typeof message !== 'object') return
          if (message.version !== SOULLAB_AUDIO_PREFLIGHT_VERSION) return
          if (message.tab === AUDIO_OUTPUT_TAB_NONCE) return
          if (message.type === 'maia-speech-preflight')
            pauseNarration('Paused for MAIA voice.')
          if (message.type === 'reader-narration-preflight')
            pauseNarration('Paused for narration in another Soullab tab.')
          // A music preflight never preempts active narration.
        }
      } catch {
        focusChannel.current = null
      }
    }

    const onFocus = (event: Event) => {
      const source = audioFocusSource(event)
      if (source === 'maia-voice') pauseNarration('Paused for MAIA voice.')
      if (source === 'writers-listen') pauseNarration('Paused for Writer narration.')
      if (source === 'external') pauseNarration('Paused for another protected audio experience.')
    }
    const onSessionEnd = () => stopNarration('Your session ended. Narration was stopped.')
    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus)
    window.addEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd)

    return () => {
      window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus)
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd)
      focusChannel.current?.close()
      focusChannel.current = null
      playGeneration.current += 1
      audioRef.current?.pause()
      releaseOutput()
    }
  }, [pauseNarration, releaseOutput, stopNarration])

  const loadMoments = useCallback(async () => {
    try {
      const response = await verifiedSessionFetch(`/api/reader/moments?chapterId=${encodeURIComponent(chapter.id)}`, {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })
      if (response.status === 401) {
        window.dispatchEvent(new Event(SOULLAB_SESSION_END_EVENT))
        return
      }
      if (!response.ok) throw new Error(`Reader moments returned ${response.status}`)
      const data = await response.json()
      setMoments(data.moments || [])
    } catch (error) {
      console.error('Failed to load reading moments:', error)
    }
  }, [chapter.id])

  useEffect(() => {
    void loadMoments()
  }, [loadMoments, memberKey])

  const handlePlayPause = async () => {
    const audio = audioRef.current
    if (!audio || isPreparing) return

    if (state.isPlaying && !audio.paused) {
      pauseNarration('Narration paused by you. Music will not restart automatically.')
      return
    }

    const generation = ++playGeneration.current
    setIsPreparing(true)
    setNarrationMessage('Preparing exclusive narration output…')
    const lease = await acquireAudioOutput('reader-narration')
    if (!lease || generation !== playGeneration.current) {
      lease?.release()
      if (generation === playGeneration.current) {
        setIsPreparing(false)
        setNarrationMessage('Narration could not acquire audio output. Stop the other experience and try again.')
      }
      return
    }

    outputLease.current = lease
    try {
      await audio.play()
      if (generation !== playGeneration.current || outputLease.current !== lease) {
        audio.pause()
        lease.release()
        return
      }
      setState(previous => ({ ...previous, isPlaying: true }))
      setNarrationMessage('Narration playing. Prior music remains paused until you choose to resume it.')
    } catch {
      audio.pause()
      if (outputLease.current === lease) releaseOutput()
      setState(previous => ({ ...previous, isPlaying: false }))
      setNarrationMessage('This recording could not start. No other audio was restarted.')
    } finally {
      if (generation === playGeneration.current) setIsPreparing(false)
    }
  }

  const handleSeek = (timeMs: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = timeMs / 1000
    setState(previous => ({
      ...previous,
      currentTime: timeMs,
      currentSegmentIndex: findCurrentSegment(timeMs)
    }))
  }

  const handleRateChange = (rate: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = rate
    setState(previous => ({ ...previous, playbackRate: rate }))
  }

  const handleSegmentClick = (segment: AudioSegment) => handleSeek(segment.startMs)
  const handleSegmentSelect = (segment: AudioSegment) =>
    setState(previous => ({ ...previous, selectedSegment: segment }))

  return (
    <div className="h-full flex flex-col bg-stone-950 text-stone-100">
      <header className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
        <div>
          <h1 className="text-xl font-semibold text-amber-100">{chapter.title}</h1>
          <p className="text-sm text-stone-400">Elemental Alchemy</p>
        </div>
        <RitualModeSelector
          mode={state.ritualMode}
          onChange={(mode) => setState(previous => ({ ...previous, ritualMode: mode }))}
        />
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">
        <SegmentPanel
          segments={chapter.segments}
          currentSegmentIndex={state.currentSegmentIndex}
          moments={moments}
          onSegmentClick={handleSegmentClick}
          onSegmentSelect={handleSegmentSelect}
        />
      </main>

      <footer className="px-6 py-4 border-t border-stone-800">
        <p
          className="mb-2 text-center text-xs text-stone-400"
          role="status"
          data-reader-audio-state={state.isPlaying ? 'playing' : isPreparing ? 'preparing' : 'idle'}
        >
          {narrationMessage}
        </p>
        <AudioControls
          isPlaying={state.isPlaying}
          isPreparing={isPreparing}
          currentTime={state.currentTime}
          duration={chapter.durationMs}
          playbackRate={state.playbackRate}
          onPlayPause={handlePlayPause}
          onStop={() => stopNarration('Narration stopped by you. Music will not restart automatically.')}
          onSeek={handleSeek}
          onRateChange={handleRateChange}
          onSkipBack={() => handleSeek(Math.max(0, state.currentTime - 10000))}
          onSkipForward={() => handleSeek(Math.min(chapter.durationMs, state.currentTime + 30000))}
        />
      </footer>

      <audio
        ref={audioRef}
        src={chapter.audioUrl}
        preload="metadata"
        data-reader-audio="true"
      />

      <ReflectionDrawer
        segment={state.selectedSegment}
        ritualMode={state.ritualMode}
        onClose={() => setState(previous => ({ ...previous, selectedSegment: null }))}
        onMomentSaved={() => void loadMoments()}
      />
    </div>
  )
}
