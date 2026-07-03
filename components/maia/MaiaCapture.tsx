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

import { useRef, useState } from 'react'

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
  | { kind: 'error'; message: string }

export function MaiaCapture({ onCapture, disabled, className }: Props) {
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
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
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
  }

  async function transcribe(blob: Blob) {
    setStatus({ kind: 'transcribing' })
    try {
      const fd = new FormData()
      fd.append('file', blob, 'capture.webm')
      const res = await fetch('/api/voice/transcribe-simple', { method: 'POST', body: fd })
      const data = await res.json()
      const text: string = (data?.transcription ?? '').trim()
      if (!text) {
        setStatus({ kind: 'error', message: 'Nothing was transcribed. Try again.' })
        return
      }
      await onCapture(text, 'voice_note')
      setStatus({ kind: 'idle' })
    } catch {
      setStatus({ kind: 'error', message: 'Transcription failed. Try again.' })
    }
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
            className="px-3 py-1.5 rounded bg-red-900/40 hover:bg-red-900/60 text-red-200 text-xs border border-red-800 transition-colors flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Stop &amp; transcribe
          </button>
        ) : (
          <button
            onClick={startRecording}
            disabled={disabled || busy}
            className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 disabled:opacity-40 transition-colors"
          >
            Speak
          </button>
        )}

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || busy || status.kind === 'recording'}
          className="px-3 py-1.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs border border-stone-700 disabled:opacity-40 transition-colors"
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

      {status.kind === 'transcribing' && (
        <p className="text-stone-500 text-xs">Transcribing…</p>
      )}
      {status.kind === 'reading' && (
        <p className="text-stone-500 text-xs">Reading {status.name}…</p>
      )}
      {status.kind === 'error' && (
        <p className="text-amber-600/80 text-xs">{status.message}</p>
      )}
    </div>
  )
}
