// frontend: app/maia/library/page.tsx
'use client';

/**
 * Ask Jeeves — Library Intelligence Interface
 *
 * A calm, scholarly research tool. Not a chatbot.
 * Jeeves synthesizes wisdom from the library to support MAIA.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Search,
  Loader2,
  Copy,
  Check,
  AlertCircle,
  Database,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
} from 'lucide-react';
import {
  getLibraryStats,
  askJeeves,
  formatTokenCount,
  formatTime,
  type LibraryStatsResponse,
  type JeevesResponse,
} from '@/lib/library/client';

// ═══════════════════════════════════════════════════════════════════════════
// STATS STRIP COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface StatsStripProps {
  stats: LibraryStatsResponse | null;
  loading: boolean;
}

function StatsStrip({ stats, loading }: StatsStripProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-[#0F1D32]/60 border border-[#1E3A5F]/50">
        <Loader2 className="w-4 h-4 text-[#B8860B] animate-spin" />
        <span className="text-[12px] text-[#A0AAB8]">Loading library...</span>
      </div>
    );
  }

  if (!stats?.success) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#2A1A1A]/60 border border-[#8B4513]/30">
        <AlertCircle className="w-4 h-4 text-[#CD853F]" />
        <span className="text-[12px] text-[#CD853F]">Library unavailable</span>
      </div>
    );
  }

  const { sources, chunks, total_tokens } = stats.stats;
  const jeevesAvailable = stats.jeeves.available;

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 py-3 rounded-xl bg-[#0F1D32]/60 border border-[#1E3A5F]/50">
      <div className="flex items-center gap-2">
        <Database className="w-3.5 h-3.5 text-[#B8860B]/70" />
        <span className="text-[12px] text-[#A0AAB8]">
          <span className="text-[#E5E9F0] font-medium">{sources.toLocaleString()}</span> sources
        </span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-[#B8860B]/70" />
        <span className="text-[12px] text-[#A0AAB8]">
          <span className="text-[#E5E9F0] font-medium">{chunks.toLocaleString()}</span> passages
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#B8860B]/70" />
        <span className="text-[12px] text-[#A0AAB8]">
          <span className="text-[#E5E9F0] font-medium">{formatTokenCount(total_tokens)}</span> tokens
        </span>
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <div className={`w-2 h-2 rounded-full ${jeevesAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <span className="text-[11px] text-[#A0AAB8]">
          Jeeves {jeevesAvailable ? 'ready' : 'limited'}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SYNTHESIS RESULT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface SynthesisResultProps {
  result: JeevesResponse;
}

function SynthesisResult({ result }: SynthesisResultProps) {
  const [copied, setCopied] = useState(false);
  const [sourcesExpanded, setSourcesExpanded] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(result.synthesis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [result.synthesis]);

  // Parse markdown-like formatting
  const renderSynthesis = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={i} className="text-[14px] font-medium text-[#E5E9F0] mt-5 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {line.replace('### ', '').replace(/\*\*/g, '')}
          </h4>
        );
        return;
      }
      if (line.startsWith('## ')) {
        elements.push(
          <h3 key={i} className="text-[15px] font-medium text-[#E5E9F0] mt-6 mb-3 border-b border-[#1E3A5F]/50 pb-2" style={{ fontFamily: 'Georgia, serif' }}>
            {line.replace('## ', '').replace(/\*\*/g, '')}
          </h3>
        );
        return;
      }
      if (line.startsWith('# ')) {
        elements.push(
          <h2 key={i} className="text-[16px] font-medium text-[#E5E9F0] mt-6 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            {line.replace('# ', '').replace(/\*\*/g, '')}
          </h2>
        );
        return;
      }

      // Horizontal rules
      if (line.trim() === '---') {
        elements.push(<hr key={i} className="border-[#1E3A5F]/50 my-4" />);
        return;
      }

      // List items
      if (line.startsWith('- **') || line.startsWith('* **')) {
        const content = line.replace(/^[-*]\s*/, '');
        elements.push(
          <li key={i} className="text-[13px] text-[#A0AAB8] ml-4 mb-1.5 leading-relaxed">
            {renderBoldText(content)}
          </li>
        );
        return;
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="text-[13px] text-[#A0AAB8] ml-4 mb-1 leading-relaxed">
            {renderBoldText(line.replace(/^[-*]\s*/, ''))}
          </li>
        );
        return;
      }

      // Empty lines
      if (line.trim() === '') {
        elements.push(<div key={i} className="h-2" />);
        return;
      }

      // Regular paragraphs
      elements.push(
        <p key={i} className="text-[13px] text-[#A0AAB8] leading-relaxed mb-2">
          {renderBoldText(line)}
        </p>
      );
    });

    return elements;
  };

  // Render bold text within a line
  const renderBoldText = (text: string) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="text-[#E5E9F0] font-medium">{part}</strong>
      ) : (
        <span key={j}>{part}</span>
      )
    );
  };

  return (
    <div className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#1E3A5F]/50 bg-[#0A1628]/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] border border-[#2A4A70] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[#B8860B]" />
          </div>
          <div>
            <span className="text-[13px] font-medium text-[#E5E9F0]">Research Synthesis</span>
            <div className="flex items-center gap-3 text-[11px] text-[#A0AAB8]/70">
              <span>{result.sources_consulted} sources</span>
              <span className="text-[#B8860B]/50">•</span>
              <span>{formatTime(result.processing_time_ms)}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] border border-[#1E3A5F] bg-[#0F1D32] text-[#A0AAB8] hover:text-[#E5E9F0] hover:border-[#B8860B]/30 transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>

      {/* Synthesis Content */}
      <div className="px-5 py-4 max-h-[60vh] overflow-y-auto">
        <div className="prose prose-sm prose-invert">
          {renderSynthesis(result.synthesis)}
        </div>
      </div>

      {/* Sources Footer */}
      {result.provenance && result.provenance.length > 0 && (
        <div className="border-t border-[#1E3A5F]/50">
          <button
            onClick={() => setSourcesExpanded(!sourcesExpanded)}
            className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-[#1E3A5F]/20 transition-colors"
          >
            <span className="text-[12px] font-medium text-[#A0AAB8]">
              Sources Consulted ({result.provenance.length})
            </span>
            {sourcesExpanded ? (
              <ChevronUp className="w-4 h-4 text-[#B8860B]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#B8860B]" />
            )}
          </button>
          {sourcesExpanded && (
            <div className="px-5 pb-4 space-y-2">
              {result.provenance.map((source, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-[12px] text-[#A0AAB8]/80"
                >
                  <span className="text-[#B8860B]/60 mt-0.5">{idx + 1}.</span>
                  <span className="leading-relaxed">{source}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export default function LibraryPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // State
  const [stats, setStats] = useState<LibraryStatsResponse | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [maxSources, setMaxSources] = useState(6);
  const [mode, setMode] = useState<'quick' | 'deep'>('deep');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<JeevesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load stats on mount
  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getLibraryStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await askJeeves(query.trim(), maxSources, mode);

      if (!response.success) {
        setError(response.detail || response.error || 'Request failed');
        return;
      }

      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const jeevesAvailable = stats?.jeeves?.available ?? false;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      {/* Ambient Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F1D32] via-[#0A1628] to-[#060D18]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[#1E4A7A]/15 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] bg-[#B8860B]/8 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0F1D32]/95 backdrop-blur-sm border-b border-[#B8860B]/20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/maia')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-[#E5E9F0] hover:bg-[#1E3A5F]/40 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#B8860B]" />
            Back to MAIA
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 relative">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1E3A5F] to-[#162640] border border-[#B8860B]/30 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-[#B8860B]" />
          </div>
          <h1 className="text-2xl font-light mb-2 text-[#E5E9F0] tracking-wide" style={{ fontFamily: 'Georgia, serif' }}>
            Ask Jeeves
          </h1>
          <p className="text-[14px] text-[#A0AAB8] max-w-md mx-auto">
            Backstage synthesis across your library. Research, not conversation.
          </p>
        </div>

        {/* Stats Strip */}
        <div className="mb-8">
          <StatsStrip stats={stats} loading={statsLoading} />
        </div>

        {/* Query Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="border border-[#1E3A5F] rounded-xl bg-gradient-to-br from-[#0F1D32] to-[#162640] overflow-hidden">
            {/* Textarea */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={handleTextareaChange}
                placeholder="What would you like Jeeves to research?"
                className="w-full bg-transparent text-[14px] text-[#E5E9F0] placeholder-[#A0AAB8]/50 resize-none focus:outline-none min-h-[80px]"
                rows={3}
                disabled={loading}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-t border-[#1E3A5F]/50 bg-[#0A1628]/30">
              <div className="flex items-center gap-4">
                {/* Mode Toggle */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#A0AAB8]">Depth:</span>
                  <div className="flex rounded-lg border border-[#1E3A5F] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMode('quick')}
                      className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        mode === 'quick'
                          ? 'bg-[#1E3A5F] text-[#E5E9F0]'
                          : 'bg-transparent text-[#A0AAB8] hover:text-[#E5E9F0]'
                      }`}
                    >
                      Quick
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('deep')}
                      disabled={!jeevesAvailable}
                      className={`px-3 py-1.5 text-[11px] font-medium transition-colors ${
                        mode === 'deep'
                          ? 'bg-[#B8860B] text-[#0A1628]'
                          : 'bg-transparent text-[#A0AAB8] hover:text-[#E5E9F0]'
                      } ${!jeevesAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Deep
                    </button>
                  </div>
                </div>

                {/* Sources Slider */}
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#A0AAB8]">Sources:</span>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={maxSources}
                    onChange={(e) => setMaxSources(parseInt(e.target.value))}
                    className="w-20 h-1 bg-[#1E3A5F] rounded-lg appearance-none cursor-pointer accent-[#B8860B]"
                    disabled={loading}
                  />
                  <span className="text-[11px] text-[#E5E9F0] font-medium w-4">{maxSources}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!query.trim() || loading}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-[13px] font-medium bg-[#B8860B] text-[#0A1628] hover:bg-[#CD853F] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#B8860B]/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Researching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Ask Jeeves
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-[#1E3A5F]/50 border border-[#B8860B]/30 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-[#B8860B] animate-spin" />
            </div>
            <p className="text-[14px] text-[#A0AAB8] mb-2">Jeeves is consulting the library...</p>
            <p className="text-[12px] text-[#A0AAB8]/60">
              Searching {maxSources} sources with {mode === 'deep' ? 'deep synthesis' : 'quick analysis'}
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-[#2A1A1A]/60 border border-[#8B4513]/30 mb-8">
            <AlertCircle className="w-5 h-5 text-[#CD853F] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] text-[#CD853F] font-medium mb-1">Research unavailable</p>
              <p className="text-[12px] text-[#A0AAB8]/80">{error}</p>
            </div>
          </div>
        )}

        {/* Result */}
        {result && result.success && !loading && (
          <SynthesisResult result={result} />
        )}

        {/* Empty State - Only show when no result and not loading */}
        {!result && !loading && !error && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1E3A5F]/30 border border-[#1E3A5F] flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-[#A0AAB8]/40" />
            </div>
            <p className="text-[14px] text-[#A0AAB8]/60 mb-2">
              Your library awaits
            </p>
            <p className="text-[12px] text-[#A0AAB8]/40 max-w-sm mx-auto">
              Ask about shadow work, elemental psychology, Jungian concepts, or any topic in your wisdom collection.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-[11px] text-[#A0AAB8]/40">
            Jeeves prepares research for MAIA. He never speaks to members directly.
          </p>
        </div>
      </main>
    </div>
  );
}
