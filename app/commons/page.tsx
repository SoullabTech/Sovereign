'use client';

/**
 * COMMUNITY COMMONS - MEANING TRACE DIGEST
 *
 * AIN's first collective intelligence display.
 * Shows aggregated patterns of "what helps when"
 * without revealing private content.
 *
 * This is learning by application made visible:
 * the system learns from how wisdom lands,
 * not from what people say.
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Sparkles, Users, Clock, RefreshCw } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';

// ==================== TYPES ====================

interface SystemStyleStats {
  system: string;
  style: string;
  total: number;
  helpfulYes: number;
  helpfulNo: number;
  helpfulRate: number;
  copiedCount: number;
}

interface ContextTagStats {
  tag: string;
  total: number;
  helpfulYes: number;
  helpfulRate: number;
  topSystem: string | null;
  topStyle: string | null;
}

interface CalibratorCorrelation {
  directness: string | null;
  authority: string | null;
  time: string | null;
  community: string | null;
  total: number;
  helpfulRate: number;
}

interface MeaningTraceDigest {
  generatedAt: string;
  period: {
    start: string;
    end: string;
    days: number;
  };
  summary: {
    totalTranslations: number;
    totalWithOutcome: number;
    overallHelpfulRate: number;
  };
  topHelpfulCombos: SystemStyleStats[];
  contextInsights: ContextTagStats[];
  calibratorPatterns: CalibratorCorrelation[];
}

// ==================== HELPERS ====================

const SYSTEM_ICONS: Record<string, string> = {
  astrology: '⭐',
  alchemy: '🜃',
  psychology: '🧠',
  spiral: '🌀',
  somatic: '🫀',
  mythology: '⚡',
  energy: '💫',
  archetypal: '🗿',
};

const TAG_ICONS: Record<string, string> = {
  overwhelmed: '🌊',
  searching: '🔍',
  grieving: '🍂',
  initiating: '🌱',
  conflicted: '⚖️',
  integrating: '🔗',
  creating: '✨',
  resting: '🌙',
};

function formatPercent(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ==================== COMPONENT ====================

export default function CommunityCommonsPage() {
  const router = useRouter();
  const [digest, setDigest] = useState<MeaningTraceDigest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchDigest = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch(`/api/ain/digest?days=${days}`);
      if (!res.ok) {
        throw new Error('Failed to load digest');
      }
      const data = await res.json();
      setDigest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, [days]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e]">
      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/labtools')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4B896]/10
                     border border-[#D4B896]/20 text-[#D4B896] hover:bg-[#D4B896]/20 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            <select
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value, 10))}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
            </select>
            <button
              onClick={fetchDigest}
              disabled={loading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-white/60 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#D4B896] to-[#B8935A] rounded-lg
                          flex items-center justify-center text-2xl">
              🌐
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-[#D4B896] tracking-wide">Community Commons</h1>
              <p className="text-[#D4B896]/60 text-sm">Collective wisdom patterns</p>
            </div>
          </div>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            What's helping people integrate wisdom this {days === 7 ? 'week' : 'month'}?
            These patterns emerge from how translations land — not from private stories.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <motion.div
              className="w-8 h-8 border-2 border-[#D4B896] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Content */}
        {!loading && !error && digest && (
          <div className="space-y-8">

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="text-2xl font-bold text-[#D4B896]">{digest.summary.totalTranslations}</div>
                <div className="text-xs text-white/50 mt-1">Translations</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="text-2xl font-bold text-[#D4B896]">{digest.summary.totalWithOutcome}</div>
                <div className="text-xs text-white/50 mt-1">With Feedback</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <div className="text-2xl font-bold text-emerald-400">
                  {formatPercent(digest.summary.overallHelpfulRate)}
                </div>
                <div className="text-xs text-white/50 mt-1">Helpful Rate</div>
              </div>
            </div>

            {/* Top Helpful Combinations */}
            {digest.topHelpfulCombos.length > 0 && (
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Most Helpful Doorways
                </h2>
                <div className="space-y-3">
                  {digest.topHelpfulCombos.slice(0, 5).map((combo, i) => (
                    <div
                      key={`${combo.system}-${combo.style}`}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{SYSTEM_ICONS[combo.system] || '🔮'}</span>
                        <div>
                          <div className="text-white font-medium capitalize">
                            {combo.system} · {combo.style}
                          </div>
                          <div className="text-xs text-white/40">
                            {combo.total} translations · {combo.copiedCount} copied
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${combo.helpfulRate >= 0.7 ? 'text-emerald-400' : 'text-white/70'}`}>
                          {formatPercent(combo.helpfulRate)}
                        </div>
                        <div className="text-xs text-white/40">helpful</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Context Insights */}
            {digest.contextInsights.length > 0 && (
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  What Helps When…
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {digest.contextInsights.map((insight) => (
                    <div
                      key={insight.tag}
                      className="p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{TAG_ICONS[insight.tag] || '📌'}</span>
                        <span className="text-white font-medium capitalize">{insight.tag}</span>
                        <span className={`ml-auto text-sm font-bold ${insight.helpfulRate >= 0.7 ? 'text-emerald-400' : 'text-white/60'}`}>
                          {formatPercent(insight.helpfulRate)}
                        </span>
                      </div>
                      {insight.topSystem && insight.topStyle && (
                        <div className="text-xs text-white/50">
                          Best: <span className="text-[#D4B896]">{insight.topSystem} · {insight.topStyle}</span>
                        </div>
                      )}
                      <div className="text-xs text-white/30 mt-1">
                        {insight.total} translations
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Calibrator Patterns */}
            {digest.calibratorPatterns.length > 0 && (
              <div className="bg-white/5 border border-[#D4B896]/20 rounded-xl p-6">
                <h2 className="text-lg font-medium text-[#D4B896] mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Delivery Patterns That Work
                </h2>
                <div className="space-y-2">
                  {digest.calibratorPatterns.slice(0, 5).map((pattern, i) => {
                    const parts = [
                      pattern.directness,
                      pattern.authority,
                      pattern.time,
                      pattern.community,
                    ].filter(Boolean);
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {parts.map((part, j) => (
                            <span
                              key={j}
                              className="px-2 py-0.5 bg-[#D4B896]/20 text-[#D4B896] text-xs rounded capitalize"
                            >
                              {part}
                            </span>
                          ))}
                        </div>
                        <div className="text-right">
                          <span className={`font-bold ${pattern.helpfulRate >= 0.7 ? 'text-emerald-400' : 'text-white/60'}`}>
                            {formatPercent(pattern.helpfulRate)}
                          </span>
                          <span className="text-xs text-white/40 ml-2">({pattern.total})</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty State */}
            {digest.summary.totalTranslations === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🌱</div>
                <h3 className="text-lg text-white/70 mb-2">The Commons is Growing</h3>
                <p className="text-white/40 text-sm max-w-md mx-auto">
                  As members translate insights and share what helps,
                  patterns will emerge here. Every translation teaches
                  the system how wisdom lands.
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-4 border-t border-white/10">
              <p className="text-xs text-white/30">
                Generated {formatDate(digest.generatedAt)} · {digest.period.days} day window
              </p>
              <p className="text-xs text-white/20 mt-1">
                Patterns of reception, not private stories
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
