'use client'

// MaiaCapture — the shared "modes of beginning" primitive.
//
// Bring material into any mirror by Speaking or Uploading, not only typing.
// - Speak:  records audio in-browser, transcribes via the sovereign whisper endpoint
//           (/api/voice/transcribe-simple — local maia-whisper, no cloud).
// - Upload: reads a document's text (.txt/.md client-side; .docx via pandoc endpoint)
//
// It does not decide where the material goes — it emits captured text via onCapture,
// and each surface (Living Field, Vision Studio, Practice Field) routes it to its own
// store. One capture primitive, many destinations.

import { useEffect, useRef, useState } from 'react'
import { CaptureDisclosure } from '@/components/capture/CaptureDisclosure'

export type CaptureSource = 'voice_note' | 'upload'

interface Props {
  onCapture: (text: string, source: CaptureSource) => void | Promise<void>
  /** Small contextual hint, e.g. the field/question name. */
  disabled?: boolean
  className?: string
}

type Status =
  | { kind: 'idle' }
  | { kind: 'recording' }
  | { kind: 'transcribing' }
  | { kind: 'reading'; name: string }
  | { kind: 'error'; message: string; retryable?: boolean }

export function MaiaCapture({ onCapture, disabled, className }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastAudioBlobRef = useRef<Blob | null>(null)
  // Held so unmount can stop capture even when onstop never runs. Without this the
  // microphone stays live after navigation with no disclosure anywhere on screen.
  const streamRef = useRef<MediaStream | null>(null)

  // Capture must not outlive the component. On unmount we stop the recorder and
  // every track directly, rather than relying on recorder.onstop — which does not
  // fire if the component is torn down first.
  useEffect(() => {
    return () => {
      try {
        const rec = mediaRecorderRef.current
        if (rec && rec.state !== 'inactive') rec.stop()
      } catch {}
      mediaRecorderRef.current = null
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop())
      } catch {}
      streamRef.current = null
    }
  }, [])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        streamRef.current = null
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        await transcribe(blob)
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setStatus({ kind: 'recording' })
    } catch {
      setStatus({ kind: 'error', message: 'Microphone unavailable. Check permissions.' })
    }
  }

  function stopRecording() {
    const rec = mediaRecorderRef.current
    mediaRecorderRef.current = null
    // MediaRecorder.stop() leaves the 'recording' state synchronously, so the
    // disclosure must end here — not in onstop, and not when transcription begins.
    // Previously the status stayed 'recording' through the whole async gap, so the
    // red indicator claimed capture was ongoing after it had already ended.
    try {
      if (rec && rec.state !== 'inactive') rec.stop()
    } catch {}
    // Transcription is a different condition with a different truth value. It gets
    // its own copy ('Transcribing…'), never the recording disclosure.
    setStatus({ kind: 'transcribing' })
  }

  async function transcribe(blob: Blob) {
    lastAudioBlobRef.current = blob
    setStatus({ kind: 'transcribing' })
    try {
      const fd = new FormData()
      fd.append('file', blob, 'capture.webm')
      const res = await fetch('/api/voice/transcribe-simple', { method: 'POST', body: fd })
      const data = await res.json()
      const text: string = (data?.transcription ?? '').trim()
      if (!text) {
        setStatus({ kind: 'error', message: 'Nothing was transcribed. Try again.', retryable: true })
        return
      }
      lastAudioBlobRef.current = null
      await onCapture(text, 'voice_note')
      setStatus({ kind: 'idle' })
    } catch {
      setStatus({ kind: 'error', message: 'Transcription failed. Try again.', retryable: true })
    }
  }

  async function retryTranscription() {
    const blob = lastAudioBlobRef.current
    if (!blob) return
    await transcribe(blob)
  }

  async function handleFile(file: File) {
    const name = file.name
    const lower = name.toLowerCase()
    setStatus({ kind: 'reading', name })
    try {
      let text = ''
      if (lower.endsWith('.txt') || lower.endsWith('.md') || file.type.startsWith('text/')) {
        text = await file.text()
      } else if (lower.endsWith('.docx')) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/book-studio/import-docx', { method: 'POST', body: fd })
        const data = await res.json()
        text = (data?.markdown ?? '').trim()
      } else {
        setStatus({
          kind: 'error',
          message: 'Supported now: .txt, .md, .docx. PDF support is coming.',
        })
        return
      }
      if (!text.trim()) {
        setStatus({ kind: 'error', message: 'No text found in that file.' })
        return
      }
      await onCapture(text.trim(), 'upload')
      setStatus({ kind: 'idle' })
    } catch {
      setStatus({ kind: 'error', message: 'Could not read that file.' })
    }
  }

  const busy = status.kind === 'transcribing' || status.kind === 'reading'

  return (
    <div className={`space-y-1.5 ${className ?? ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        {status.kind === 'recording' ? (
          <button
            onClick={stopRecording}
            className="px-4 py-2.5 rounded bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs border border-red-800 transition-colors"
          >
            Stop &amp; transcribe
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={disabled || busy}
            className="px-4 py-2.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 disabled:opacity-40 transition-colors"
          >
            Speak
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || busy || status.kind === 'recording'}
          className="px-4 py-2.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 disabled:opacity-40 transition-colors"
        >
          Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.docx,text/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFile(f)
            e.target.value = ''
          }}
        />
      </div>

      {/* Disclosure lives on its own line rather than inside the button label, so it
          is present and announced whether or not the control is in view. */}
      {status.kind === 'recording' && <CaptureDisclosure state="recording" />}
      {status.kind === 'transcribing' && (
        <p className="text-stone-500 text-xs">Transcribing…</p>
      )}
      {status.kind === 'reading' && (
        <p className="text-stone-500 text-xs">Reading {status.name}…</p>
      )}
      {status.kind === 'error' && (
        <div className="space-y-1">
          <p className="text-amber-600/80 text-xs">{status.message}</p>
          {status.retryable && lastAudioBlobRef.current && (
            <button
              onClick={retryTranscription}
              className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 text-xs border border-stone-700 transition-colors"
            >
              Retry transcription
            </button>
          )}
        </div>
      )}
    </div>
  )
}
