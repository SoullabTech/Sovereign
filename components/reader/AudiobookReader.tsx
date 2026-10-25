'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Chapter, AudioSegment, ReadingMoment, ReaderState } from './types'
import { RitualModeSelector } from './RitualModeSelector'
import { AudioControls } from './AudioControls'
import { SegmentPanel } from './SegmentPanel'
import { ReflectionDrawer } from './ReflectionDrawer'
import { useVerifiedAudioMemberKey } from '@/components/listening/VerifiedAudioMemberContext'
import {
  acquireAudioOutput,
  type AudioOutputLease,
} from '@/lib/listening/audioOutputLock'
import {
  SOULLAB_AUDIO_FOCUS_EVENT,
  SOULLAB_AUDIO_TAB_CHANNEL,
  SOULLAB_SESSION_END_EVENT,
  audioFocusSource,
} from '@/lib/listening/audioFocus'
import { isMaiaSpeechActive } from '@/lib/listening/maiaSpeechFocus'
import {
  shouldPauseReaderForFocus,
  shouldPauseReaderForTabMessage,
} from '@/lib/listening/readerNarrationAuthority'

interface AudiobookReaderProps {
  chapter: Chapter
}

export function AudiobookReader({ chapter }: AudiobookReaderProps) {
  const memberKey = useVerifiedAudioMemberKey()
  const audioRef = useRef<HTMLAudioElement>(null)
  const outputLease = useRef<AudioOutputLease | null>(null)
  const playbackEpoch = useRef(0)
  const momentsEpoch = useRef(0)
  const memberRef = useRef<string | null>(memberKey)
  const pauseReason = useRef<string | null>(null)
  const [moments, setMoments] = useState<ReadingMoment[]>([])
  const [statusMessage, setStatusMessage] = useState(
    memberKey ? 'Ready to listen.' : 'Verifying your member session…',
  )

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
    playbackEpoch.current += 1
    pauseReason.current = message
    audioRef.current?.pause()
    releaseOutput()
    setState(prev => ({ ...prev, isPlaying: false }))
    setStatusMessage(message)
  }, [releaseOutput])

  const stopNarration = useCallback((message = 'Narration stopped.') => {
    playbackEpoch.current += 1
    pauseReason.current = message
    const audio = audioRef.current
    audio?.pause()
    if (audio) audio.currentTime = 0
    releaseOutput()
    setState(prev => ({
      ...prev,
      isPlaying: false,
      currentTime: 0,
      currentSegmentIndex: 0,
    }))
    setStatusMessage(message)
  }, [releaseOutput])

  const findCurrentSegment = useCallback((timeMs: number): number => {
    for (let i = 0; i < chapter.segments.length; i++) {
      const seg = chapter.segments[i]
      if (timeMs >= seg.startMs && timeMs < seg.endMs) return i
    }
    return 0
  }, [chapter.segments])

  const loadMoments = useCallback(async () => {
    const memberAtRequest = memberRef.current
    if (!memberAtRequest) {
      momentsEpoch.current += 1
      setMoments([])
      return
    }
    const generation = ++momentsEpoch.current
    try {
      const res = await fetch(`/api/reader/moments?chapterId=${encodeURIComponent(chapter.id)}`, {
        method: 'GET',
        cache: 'no-store',
        credentials: 'include',
        headers: { Accept: 'application/json' },
      })
      if (!res.ok) throw new Error(`Reader moments request refused (${res.status}).`)
      const data: { moments?: ReadingMoment[] } = await res.json()
      if (generation !== momentsEpoch.current || memberRef.current !== memberAtRequest) return
      setMoments(Array.isArray(data.moments) ? data.moments : [])
    } catch (error) {
      if (generation !== momentsEpoch.current || memberRef.current !== memberAtRequest) return
      console.error('Failed to load reading moments:', error)
      setMoments([])
    }
  }, [chapter.id])

  const startNarration = useCallback(async (): Promise<boolean> => {
    const audio = audioRef.current
    const memberAtStart = memberRef.current
    if (!audio || !memberAtStart) {
      setStatusMessage('A verified member session is required before narration can play.')
      return false
    }
    if (isMaiaSpeechActive()) {
      setStatusMessage('MAIA is speaking. Finish or stop MAIA before starting narration.')
      return false
    }

    releaseOutput()
    const generation = ++playbackEpoch.current
    const lease = await acquireAudioOutput('reader-narration')
    if (!lease || generation !== playbackEpoch.current ||
        memberRef.current !== memberAtStart || isMaiaSpeechActive()) {
      lease?.release()
      if (generation === playbackEpoch.current) {
        setStatusMessage(isMaiaSpeechActive()
          ? 'MAIA is speaking. Narration did not start.'
          : 'Another protected audio experience is active, or audio coordination is unavailable.')
      }
      return false
    }

    outputLease.current = lease
    try {
      await audio.play()
      if (generation !== playbackEpoch.current ||
          memberRef.current !== memberAtStart || isMaiaSpeechActive()) {
        pauseReason.current = 'Narration stopped because its member or audio authority changed.'
        audio.pause()
        releaseOutput()
        return false
      }
      setState(prev => ({ ...prev, isPlaying: true }))
      setStatusMessage('Narration playing.')
      return true
    } catch {
      releaseOutput()
      setState(prev => ({ ...prev, isPlaying: false }))
      setStatusMessage('This chapter audio could not be started by the browser.')
      return false
    }
  }, [releaseOutput])

  useEffect(() => {
    const previousMember = memberRef.current
    memberRef.current = memberKey
    if (previousMember !== memberKey) {
      momentsEpoch.current += 1
      setMoments([])
      setState(prev => ({ ...prev, selectedSegment: null }))
      if (previousMember) {
        stopNarration('Narration stopped because the verified member session changed.')
      } else {
        setStatusMessage(memberKey
          ? 'Ready to listen.'
          : 'A verified member session is required before narration can play.')
      }
    }
  }, [memberKey, stopNarration])

  useEffect(() => {
    stopNarration(memberRef.current ? 'Ready to listen.' : 'Waiting for a verified member session.')
    setState(prev => ({ ...prev, selectedSegment: null }))
  }, [chapter.id, stopNarration])

  useEffect(() => {
    void loadMoments()
    return () => { momentsEpoch.current += 1 }
  }, [loadMoments, memberKey])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      const timeMs = audio.currentTime * 1000
      setState(prev => ({
        ...prev,
        currentTime: timeMs,
        currentSegmentIndex: findCurrentSegment(timeMs),
      }))
    }
    const handlePlay = () => {
      if (!outputLease.current || !memberRef.current || isMaiaSpeechActive()) {
        pauseReason.current = 'Narration was refused because audio authority is no longer current.'
        audio.pause()
        releaseOutput()
        return
      }
      setState(prev => ({ ...prev, isPlaying: true }))
    }
    const handlePause = () => {
      releaseOutput()
      setState(prev => ({ ...prev, isPlaying: false }))
      const reason = pauseReason.current
      pauseReason.current = null
      if (reason) setStatusMessage(reason)
    }
    const handleEnded = () => {
      playbackEpoch.current += 1
      releaseOutput()
      setState(prev => ({ ...prev, isPlaying: false, currentTime: chapter.durationMs }))
      setStatusMessage('Chapter narration complete.')
    }
    const handleError = () => {
      playbackEpoch.current += 1
      releaseOutput()
      setState(prev => ({ ...prev, isPlaying: false }))
      setStatusMessage('The chapter audio could not be decoded or played.')
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [chapter.durationMs, findCurrentSegment, releaseOutput])

  useEffect(() => {
    let channel: BroadcastChannel | null = null
    if (typeof BroadcastChannel === 'function') {
      try {
        channel = new BroadcastChannel(SOULLAB_AUDIO_TAB_CHANNEL)
        channel.onmessage = event => {
          if (shouldPauseReaderForTabMessage(event.data)) {
            pauseNarration('Narration paused for another protected audio experience.')
          }
        }
      } catch {
        channel = null
      }
    }

    const onFocus = (event: Event) => {
      if (shouldPauseReaderForFocus(audioFocusSource(event))) {
        pauseNarration('Narration paused for another protected audio experience.')
      }
    }
    const onSessionEnd = () => {
      stopNarration('Narration stopped because the member session ended.')
      setMoments([])
    }

    window.addEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus)
    window.addEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd)
    return () => {
      window.removeEventListener(SOULLAB_AUDIO_FOCUS_EVENT, onFocus)
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, onSessionEnd)
      channel?.close()
      playbackEpoch.current += 1
      audioRef.current?.pause()
      releaseOutput()
    }
  }, [pauseNarration, releaseOutput, stopNarration])

  const handlePlayPause = () => {
    if (state.isPlaying) pauseNarration()
    else void startNarration()
  }

  const handleSeek = (timeMs: number) => {
    const audio = audioRef.current
    if (!audio) return
    const bounded = Math.max(0, Math.min(chapter.durationMs, timeMs))
    audio.currentTime = bounded / 1000
    setState(prev => ({
      ...prev,
      currentTime: bounded,
      currentSegmentIndex: findCurrentSegment(bounded),
    }))
  }

  const handleRateChange = (rate: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = rate
    setState(prev => ({ ...prev, playbackRate: rate }))
  }

  const handleSegmentSelect = (segment: AudioSegment) => {
    if (!memberRef.current) {
      setStatusMessage('A verified member session is required to save a reading moment.')
      return
    }
    setState(prev => ({ ...prev, selectedSegment: segment }))
  }

  return (
    <div
      className="h-full flex flex-col bg-stone-950 text-stone-100"
      data-reader-narration="true"
      data-reader-member={memberKey ? 'verified' : 'unverified'}
      data-reader-playback={state.isPlaying ? 'playing' : 'paused'}
    >
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

      <main className="flex-1 min-h-0 overflow-hidden">
        <SegmentPanel
          segments={chapter.segments}
          currentSegmentIndex={state.currentSegmentIndex}
          moments={moments}
          onSegmentClick={(segment) => handleSeek(segment.startMs)}
          onSegmentSelect={handleSegmentSelect}
        />
      </main>

      <footer className="px-6 py-4 border-t border-stone-800">
        <AudioControls
          isPlaying={state.isPlaying}
          currentTime={state.currentTime}
          duration={chapter.durationMs}
          playbackRate={state.playbackRate}
          disabled={!memberKey}
          statusMessage={statusMessage}
          onPlayPause={handlePlayPause}
          onStop={() => stopNarration()}
          onSeek={handleSeek}
          onRateChange={handleRateChange}
          onSkipBack={() => handleSeek(state.currentTime - 10000)}
          onSkipForward={() => handleSeek(state.currentTime + 30000)}
        />
      </footer>

      <audio
        ref={audioRef}
        src={chapter.audioUrl}
        preload="metadata"
        data-reader-audio="true"
      />

      <ReflectionDrawer
        segment={memberKey ? state.selectedSegment : null}
        ritualMode={state.ritualMode}
        onClose={() => setState(prev => ({ ...prev, selectedSegment: null }))}
        onMomentSaved={() => void loadMoments()}
      />
    </div>
  )
}
