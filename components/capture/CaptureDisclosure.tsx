'use client'

// CaptureDisclosure — a member-facing disclosure of what the microphone is doing.
//
// This component deliberately does NOT accept a generic `active` boolean. Each state
// names a distinct system condition with its own truth condition, because collapsing
// them is the defect this component exists to repair:
//
//   activating  — initiation requested; the system is NOT yet listening or recording.
//                 TRUE FROM: the member's start gesture.
//                 TRUE UNTIL: onstart fires (→ listening), or error/denial (→ nothing).
//
//   listening   — speech recognition has ACTUALLY begun (recognition.onstart).
//                 Audio is being interpreted; it is not being recorded to a file.
//                 TRUE FROM: recognition.onstart.
//                 TRUE UNTIL: onend / onerror / stop / unmount.
//
//   recording   — a MediaRecorder has ACTUALLY entered its recording state.
//                 Audio is being captured.
//                 TRUE FROM: recorder.start() returning (state === 'recording').
//                 TRUE UNTIL: recorder.stop() — NOT until transcription or upload ends.
//
// Callers must bind each state to the event that makes its claim true, never to
// intent, permission availability, or input readiness. A disclosure bound to a
// proxy for the fact is false even when it is visually clear.
//
// Deliberately absent: any 'processing' / 'uploading' state. Material remaining in
// flight after capture ends is a different disclosure with a different truth
// condition, and is not authorized here. Recording disclosure must not be extended
// to cover it.

export type CaptureState = 'activating' | 'listening' | 'recording'

interface Props {
  state: CaptureState
  /** Optional trailing detail (e.g. a live transcript fragment). Never replaces the label. */
  children?: React.ReactNode
  className?: string
}

const COPY: Record<CaptureState, { label: string; announce: string }> = {
  activating: { label: 'Starting…', announce: 'Starting microphone' },
  listening: { label: 'Listening…', announce: 'Listening — speech is being transcribed' },
  recording: { label: 'Recording', announce: 'Recording — audio is being captured' },
}

export function CaptureDisclosure({ state, children, className }: Props) {
  const { label, announce } = COPY[state]

  return (
    <div
      role="status"
      aria-live="polite"
      data-capture-state={state}
      className={`capture-disclosure capture-disclosure--${state} ${className ?? ''}`}
    >
      {/* The glyph differs in SHAPE as well as colour, so the distinction survives
          monochrome rendering and colour-vision differences. Text is always present:
          meaning never depends on the mark or on motion alone. */}
      <span className="capture-disclosure__glyph" aria-hidden="true" />
      <span className="capture-disclosure__label">{label}</span>
      {/* Screen readers get an explicit sentence rather than the terse visual label. */}
      <span className="sr-only">{announce}</span>
      {children ? <span className="capture-disclosure__detail">{children}</span> : null}
    </div>
  )
}

export default CaptureDisclosure
