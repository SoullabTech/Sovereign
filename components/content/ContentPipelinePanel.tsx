"use client";

import React, { useState } from 'react';
import { Loader2, FileText, Send, Check, ChevronDown, ChevronRight } from 'lucide-react';

type PostFormat = 'short' | 'long' | 'poetic' | 'audio_script';

interface ContentPost {
  id: string;
  format: PostFormat;
  content: string;
  status: string;
  source_title: string | null;
}

interface PipelineResponse {
  summary: string;
  passageCount: number;
  quoteCount: number;
  postsCreated: number;
  posts: ContentPost[];
  transformed: {
    shortPosts: string[];
    longPosts: string[];
    poeticPosts: string[];
    audioScripts: string[];
  };
}

const FORMAT_LABELS: Record<PostFormat, string> = {
  short: 'Short',
  long: 'Long',
  poetic: 'Poetic',
  audio_script: 'Audio Script',
};

function PostCard({
  post,
  onApprove,
}: {
  post: ContentPost;
  onApprove: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-stone-700/40 rounded-lg p-4 bg-stone-900/30">
      <div className="flex items-start justify-between gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-left flex-1 min-w-0"
        >
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-stone-500 shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-stone-500 shrink-0" />
          )}
          <span className="text-xs uppercase tracking-wider text-amber-600/70 shrink-0">
            {FORMAT_LABELS[post.format]}
          </span>
          <span className="text-stone-400 text-sm truncate">
            {post.content.slice(0, 80)}...
          </span>
        </button>

        <span className={`text-xs px-2 py-0.5 rounded shrink-0 ${
          post.status === 'approved'
            ? 'bg-emerald-900/40 text-emerald-400'
            : 'bg-stone-800 text-stone-500'
        }`}>
          {post.status}
        </span>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="text-stone-300 text-sm leading-relaxed whitespace-pre-wrap pl-6">
            {post.content}
          </div>

          {post.status === 'draft' && (
            <div className="pl-6">
              <button
                onClick={() => onApprove(post.id)}
                className="flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Approve
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ContentPipelinePanel() {
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [element, setElement] = useState<string>('');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<PipelineResponse | null>(null);
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [error, setError] = useState('');

  const adminSecret = typeof window !== 'undefined'
    ? localStorage.getItem('labtools_secret') || ''
    : '';

  const runPipeline = async () => {
    if (!input.trim()) return;
    setRunning(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/content/pipeline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({
          title: title || 'Untitled',
          body: input,
          element: element || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Pipeline failed');
      }

      const data: PipelineResponse = await res.json();
      setResult(data);
      setPosts(data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setRunning(false);
    }
  };

  const approvePost = async (id: string) => {
    try {
      const res = await fetch('/api/content/distribution', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': adminSecret,
        },
        body: JSON.stringify({ id, status: 'approved' }),
      });

      if (res.ok) {
        setPosts(prev =>
          prev.map(p => (p.id === id ? { ...p, status: 'approved' } : p))
        );
      }
    } catch {
      // silent — UI already shows current state
    }
  };

  const loadDrafts = async () => {
    try {
      const res = await fetch('/api/content/distribution?status=draft', {
        headers: { 'x-admin-secret': adminSecret },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Input section */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chapter title"
            className="flex-1 bg-stone-900/50 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-300 placeholder:text-stone-600 focus:outline-none focus:border-amber-700/50"
          />
          <select
            value={element}
            onChange={(e) => setElement(e.target.value)}
            className="bg-stone-900/50 border border-stone-700/40 rounded-lg px-3 py-2 text-sm text-stone-400 focus:outline-none focus:border-amber-700/50"
          >
            <option value="">Element (optional)</option>
            <option value="fire">Fire</option>
            <option value="water">Water</option>
            <option value="earth">Earth</option>
            <option value="air">Air</option>
            <option value="aether">Aether</option>
          </select>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste chapter text here..."
          rows={10}
          className="w-full bg-stone-900/50 border border-stone-700/40 rounded-lg px-4 py-3 text-sm text-stone-300 placeholder:text-stone-600 focus:outline-none focus:border-amber-700/50 resize-y leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-600">
            {input.length > 0 ? `${input.length.toLocaleString()} chars` : ''}
          </span>

          <div className="flex gap-2">
            <button
              onClick={loadDrafts}
              className="text-xs text-stone-500 hover:text-stone-400 transition-colors px-3 py-1.5"
            >
              Load existing drafts
            </button>

            <button
              onClick={runPipeline}
              disabled={running || !input.trim()}
              className="flex items-center gap-2 bg-amber-700/80 hover:bg-amber-700 disabled:bg-stone-800 disabled:text-stone-600 text-stone-100 text-sm px-4 py-2 rounded-lg transition-colors"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Run Pipeline
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg p-3">
          {error}
        </div>
      )}

      {/* Summary */}
      {result && (
        <div className="bg-stone-900/40 border border-stone-700/30 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-amber-500">
            <FileText className="w-4 h-4" />
            <span className="text-sm font-medium">Extraction Complete</span>
          </div>
          <p className="text-stone-400 text-sm leading-relaxed">{result.summary}</p>
          <div className="flex gap-4 text-xs text-stone-500">
            <span>{result.passageCount} passages</span>
            <span>{result.quoteCount} quotes</span>
            <span>{result.postsCreated} drafts saved</span>
          </div>
        </div>
      )}

      {/* Posts */}
      {posts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm text-stone-500 uppercase tracking-wider">
            Drafts ({posts.filter(p => p.status === 'draft').length} pending review)
          </h3>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onApprove={approvePost} />
          ))}
        </div>
      )}
    </div>
  );
}
