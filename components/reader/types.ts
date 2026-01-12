export interface AudioSegment {
  id: string
  index: number
  text: string
  startMs: number
  endMs: number
  type: 'paragraph' | 'heading' | 'quote'
}

export interface Chapter {
  id: string
  slug: string
  title: string
  audioUrl: string
  durationMs: number
  segments: AudioSegment[]
}

export interface ReadingMoment {
  id: string
  segmentId: string
  type: 'highlight' | 'note' | 'question' | 'insight'
  content?: string
  ritualMode?: RitualMode
  createdAt: string
}

export type RitualMode = 'earth' | 'water' | 'fire' | 'air' | 'aether'

export interface ReaderState {
  isPlaying: boolean
  currentTime: number
  playbackRate: number
  currentSegmentIndex: number
  ritualMode: RitualMode
  selectedSegment: AudioSegment | null
}
