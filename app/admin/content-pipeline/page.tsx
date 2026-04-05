'use client'

import { useState, useCallback } from 'react'
import { apiFetch } from '@/lib/http/apiBase'

type PostType = 'short' | 'long' | 'poetic' | 'audio_script'

interface PipelineResult {
  extracted: {
    summary: string
    passages: string[]
    quotes: string[]
  }
  transformed: {
    shortPosts: string[]
    longPosts: string[]
    poeticPosts: string[]
    audioScripts: string[]
  }
}

const POST_TYPE_LABELS: Record<string, string> = {
  shortPosts: 'Short',
  longPosts: 'Long',
  poeticPosts: 'Poetic',
  audioScripts: 'Audio Script',
}

const POST_TYPE_MAP: Record<string, PostType> = {
  shortPosts: 'short',
  longPosts: 'long',
  poeticPosts: 'poetic',
  audioScripts: 'audio_script',
}

export default function ContentPipelinePage() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [element, setElement] = useState<string>('')
  const [result, setResult] = useState<PipelineResult | null>(null)
  const [running, setRunning] = useState(false)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [error, setError] = useState<string | null>(null)

  const runPipeline = useCallback(async () => {
    if (!title.trim() || !body.trim()) return
    setRunning(true)
    setError(null)
    setResult(null)
    setSaved(new Set())

    try {
      const res = await apiFetch('/api/content/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          body: body.trim(),
          element: element || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Pipeline failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Pipeline failed')
    } finally {
      setRunning(false)
    }
  }, [title, body, element])

  const savePost = useCallback(async (postType: PostType, text: string, key: string) => {
    setSaving(key)
    try {
      const res = await apiFetch('/api/content/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceTitle: title.trim(),
          sourceElement: element || null,
          postType,
          text,
        }),
      })

      if (res.ok) {
        setSaved(prev => new Set(prev).add(key))
      }
    } catch {
      // Silent fail — user sees the button didn't change
    } finally {
      setSaving(null)
    }
  }, [title, element])

  return (
    <div className="min-h-screen bg-maia-navy-950 text-maia-ink-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-2xl font-light tracking-wide text-maia-ink-100">
            Content Pipeline
          </h1>
          <p className="text-maia-ink-60 text-sm mt-1">
            Manuscript extraction and transformation. One chapter at a time.
          </p>
        </header>

        {/* Input */}
        <div className="space-y-4 bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs text-maia-ink-60 mb-1">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Chapter title..."
                className="w-full bg-maia-navy-850 border border-maia-navy-700 rounded px-3 py-2 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:outline-none focus:border-maia-navy-600"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs text-maia-ink-60 mb-1">Element</label>
              <select
                value={element}
                onChange={(e) => setElement(e.target.value)}
                className="w-full bg-maia-navy-850 border border-maia-navy-700 rounded px-3 py-2 text-sm text-maia-ink-100 focus:outline-none focus:border-maia-navy-600"
              >
                <option value="">None</option>
                <option value="fire">Fire</option>
                <option value="water">Water</option>
                <option value="earth">Earth</option>
                <option value="air">Air</option>
                <option value="aether">Aether</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-maia-ink-60 mb-1">Manuscript text</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Paste chapter here..."
              rows={12}
              className="w-full bg-maia-navy-850 border border-maia-navy-700 rounded px-3 py-2 text-sm text-maia-ink-100 placeholder:text-maia-ink-40 focus:outline-none focus:border-maia-navy-600 resize-y"
            />
          </div>

          <button
            onClick={runPipeline}
            disabled={running || !title.trim() || !body.trim()}
            className="px-5 py-2 text-sm rounded bg-maia-gold text-maia-navy-950 font-medium hover:bg-maia-gold-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {running ? 'Extracting...' : 'Run Pipeline'}
          </button>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Extracted summary */}
            <section className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6">
              <h2 className="text-sm font-medium text-maia-ink-60 uppercase tracking-wider mb-3">Summary</h2>
              <p className="text-maia-ink-80 text-sm leading-relaxed">{result.extracted.summary}</p>
            </section>

            {/* Extracted quotes */}
            <section className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6">
              <h2 className="text-sm font-medium text-maia-ink-60 uppercase tracking-wider mb-3">
                Quotes ({result.extracted.quotes.length})
              </h2>
              <div className="space-y-3">
                {result.extracted.quotes.map((q, i) => (
                  <blockquote key={i} className="text-maia-ink-80 text-sm italic border-l-2 border-maia-spice-500 pl-4">
                    {q}
                  </blockquote>
                ))}
              </div>
            </section>

            {/* Extracted passages */}
            <section className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6">
              <h2 className="text-sm font-medium text-maia-ink-60 uppercase tracking-wider mb-3">
                Passages ({result.extracted.passages.length})
              </h2>
              <div className="space-y-4">
                {result.extracted.passages.map((p, i) => (
                  <div key={i} className="text-maia-ink-80 text-sm leading-relaxed border-b border-maia-navy-700 pb-3 last:border-0">
                    {p}
                  </div>
                ))}
              </div>
            </section>

            {/* Transformed content — one item at a time */}
            {Object.entries(result.transformed).map(([category, posts]) => (
              <section key={category} className="bg-maia-navy-900 border border-maia-navy-700 rounded-lg p-6">
                <h2 className="text-sm font-medium text-maia-ink-60 uppercase tracking-wider mb-4">
                  {POST_TYPE_LABELS[category]} ({(posts as string[]).length})
                </h2>
                <div className="space-y-4">
                  {(posts as string[]).map((text, i) => {
                    const key = `${category}-${i}`
                    const isSaved = saved.has(key)
                    const isSaving = saving === key

                    return (
                      <div
                        key={i}
                        className="bg-maia-navy-850 border border-maia-navy-700 rounded p-4 space-y-3"
                      >
                        <p className="text-maia-ink-80 text-sm leading-relaxed whitespace-pre-wrap">
                          {text}
                        </p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => savePost(POST_TYPE_MAP[category], text, key)}
                            disabled={isSaved || isSaving}
                            className={`text-xs px-3 py-1 rounded transition-colors ${
                              isSaved
                                ? 'bg-maia-navy-700 text-maia-ink-60 cursor-default'
                                : 'bg-maia-navy-800 text-maia-ink-80 hover:bg-maia-navy-700 hover:text-maia-ink-100'
                            }`}
                          >
                            {isSaved ? 'Saved as draft' : isSaving ? 'Saving...' : 'Save as draft'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
