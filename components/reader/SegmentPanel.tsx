'use client'

import { useRef, useEffect } from 'react'
import { AudioSegment, ReadingMoment } from './types'
import { Bookmark, MessageCircle } from 'lucide-react'

interface SegmentPanelProps {
  segments: AudioSegment[]
  currentSegmentIndex: number
  moments: ReadingMoment[]
  onSegmentClick: (segment: AudioSegment) => void
  onSegmentSelect: (segment: AudioSegment) => void
}

export function SegmentPanel({
  segments,
  currentSegmentIndex,
  moments,
  onSegmentClick,
  onSegmentSelect
}: SegmentPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to active segment
  useEffect(() => {
    if (activeRef.current && containerRef.current) {
      const container = containerRef.current
      const element = activeRef.current
      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      // Only scroll if element is outside visible area
      if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentSegmentIndex])

  const getMomentsForSegment = (segmentId: string) => {
    return moments.filter(m => m.segmentId === segmentId)
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-6 py-8 space-y-4"
    >
      {segments.map((segment, idx) => {
        const isActive = idx === currentSegmentIndex
        const segmentMoments = getMomentsForSegment(segment.id)
        const hasHighlight = segmentMoments.some(m => m.type === 'highlight')
        const hasNote = segmentMoments.some(m => m.type === 'note' || m.type === 'insight')

        return (
          <div
            key={segment.id}
            ref={isActive ? activeRef : null}
            onClick={() => onSegmentClick(segment)}
            onDoubleClick={() => onSegmentSelect(segment)}
            className={`
              relative p-4 rounded-lg cursor-pointer transition-all duration-300
              ${isActive
                ? 'bg-amber-900/30 border-l-4 border-amber-500 scale-[1.02]'
                : 'hover:bg-stone-800/50 border-l-4 border-transparent'
              }
              ${hasHighlight ? 'bg-amber-900/20' : ''}
            `}
          >
            {/* Moment indicators */}
            {(hasHighlight || hasNote) && (
              <div className="absolute top-2 right-2 flex gap-1">
                {hasHighlight && (
                  <Bookmark className="w-4 h-4 text-amber-500" fill="currentColor" />
                )}
                {hasNote && (
                  <MessageCircle className="w-4 h-4 text-blue-400" fill="currentColor" />
                )}
              </div>
            )}

            <p className={`
              text-lg leading-relaxed transition-colors
              ${isActive ? 'text-amber-100' : 'text-stone-300'}
              ${segment.type === 'heading' ? 'font-semibold text-xl' : ''}
              ${segment.type === 'quote' ? 'italic border-l-2 border-stone-600 pl-4' : ''}
            `}>
              {segment.text}
            </p>
          </div>
        )
      })}
    </div>
  )
}
