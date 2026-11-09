'use client'

import { Loader2, Pause, Play, SkipBack, SkipForward, Square } from 'lucide-react'

interface AudioControlsProps {
  isPlaying: boolean
  isPreparing?: boolean
  currentTime: number
  duration: number
  playbackRate: number
  onPlayPause: () => void | Promise<void>
  onStop: () => void
  onSeek: (time: number) => void
  onRateChange: (rate: number) => void
  onSkipBack: () => void
  onSkipForward: () => void
}

export function AudioControls({
  isPlaying,
  isPreparing = false,
  currentTime,
  duration,
  playbackRate,
  onPlayPause,
  onStop,
  onSeek,
  onRateChange,
  onSkipBack,
  onSkipForward
}: AudioControlsProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex flex-col gap-2 p-4 bg-stone-900/80 backdrop-blur rounded-xl">
      <div
        className="relative h-2 bg-stone-700 rounded-full cursor-pointer group"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect()
          const percent = (event.clientX - rect.left) / rect.width
          onSeek(percent * duration)
        }}
      >
        <div
          className="absolute h-full bg-amber-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full -top-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `calc(${progress}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-xs text-stone-400">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onSkipBack}
          className="p-2 hover:bg-stone-800 rounded-full transition-colors"
          title="Back 10s"
          aria-label="Back 10 seconds"
        >
          <SkipBack className="w-5 h-5 text-stone-300" />
        </button>

        <button
          type="button"
          onClick={() => void onPlayPause()}
          disabled={isPreparing}
          className="p-4 bg-amber-600 hover:bg-amber-500 rounded-full transition-colors disabled:opacity-50"
          aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
        >
          {isPreparing ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-6 h-6 text-white" />
          ) : (
            <Play className="w-6 h-6 text-white ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={onStop}
          className="p-2 hover:bg-stone-800 rounded-full transition-colors"
          title="Stop narration"
          aria-label="Stop narration"
        >
          <Square className="w-5 h-5 text-stone-300" />
        </button>

        <button
          type="button"
          onClick={onSkipForward}
          className="p-2 hover:bg-stone-800 rounded-full transition-colors"
          title="Forward 30s"
          aria-label="Forward 30 seconds"
        >
          <SkipForward className="w-5 h-5 text-stone-300" />
        </button>

        <select
          value={playbackRate}
          onChange={(event) => onRateChange(parseFloat(event.target.value))}
          className="ml-4 px-2 py-1 bg-stone-800 text-stone-300 text-sm rounded border border-stone-700"
          aria-label="Narration speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  )
}
