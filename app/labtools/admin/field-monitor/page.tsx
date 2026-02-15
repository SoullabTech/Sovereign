'use client';

/**
 * Field Monitor — per-turn observability dashboard.
 *
 * Shows unified telemetry: AIN shape, Opus axioms, memory layers,
 * voice/relational state, frameworks, and Field Integrity score.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  RefreshCw,
  Activity,
  Eye,
  AlertTriangle,
  Zap,
  Brain,
  Shield,
  ChevronDown,
  ChevronUp,
  Filter,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface FieldMonitorTurn {
  id: number;
  created_at: string;
  request_id: string;
  member_id: string | null;
  session_id: string | null;
  element: string | null;
  phase: number | null;
  motion: string | null;
  intensity: number | null;
  frameworks_active: string[];
  framework_count: number;
  ain_pass: boolean | null;
  ain_score: number | null;
  ain_mirror: boolean | null;
  ain_bridge: boolean | null;
  ain_permission: boolean | null;
  ain_next_step: boolean | null;
  ain_menu_mode: boolean | null;
  opus_is_gold: boolean | null;
  opus_passed: number | null;
  opus_warnings: number | null;
  opus_violations: number | null;
  opus_rupture: boolean | null;
  socratic_decision: string | null;
  socratic_is_gold: boolean | null;
  socratic_rupture_count: number | null;
  socratic_regenerated: boolean | null;
  mem_session: boolean;
  mem_episodic: boolean;
  mem_somatic: boolean;
  mem_morphic: boolean;
  mem_semantic: boolean;
  mem_coherence: boolean;
  mem_evolution: boolean;
  mem_anamnesis: boolean;
  voice_element: string | null;
  voice_archetype: string | null;
  voice_hysteresis: string | null;
  relational_stance: string | null;
  relational_hold_level: string | null;
  field_safe: boolean | null;
  cognitive_altitude: number | null;
  dissociation_detected: boolean;
  breakthrough_detected: boolean;
  breakthrough_type: string | null;
  duration_ms: number | null;
  provider: string | null;
  model: string | null;
  used_fallback: boolean;
}

interface FieldMonitorSummary {
  totalTurns: number;
  ainPassRate: number;
  menuModeRate: number;
  opusGoldRate: number;
  opusRuptureRate: number;
  avgDurationMs: number;
  memoryLayerHits: Record<string, number>;
  memoryDepthScore: number;
  frameworkDistribution: Record<string, number>;
  elementDistribution: Record<string, number>;
  breakthroughCount: number;
  dissociationCount: number;
  socraticRegenCount: number;
  fieldIntegrity: number;
}

type TimeRange = '1h' | '6h' | '24h' | '7d';

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'bg-red-500/20 text-red-300 border-red-500/30',
  water: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  earth: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  air: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  aether: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function integrityColor(score: number): string {
  if (score >= 0.75) return 'text-emerald-400';
  if (score >= 0.50) return 'text-amber-400';
  return 'text-red-400';
}

function integrityBorderColor(score: number): string {
  if (score >= 0.75) return 'border-emerald-500/30';
  if (score >= 0.50) return 'border-amber-500/30';
  return 'border-red-500/30';
}

function pct(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function sinceForRange(range: TimeRange): string {
  const d = new Date();
  switch (range) {
    case '1h': d.setHours(d.getHours() - 1); break;
    case '6h': d.setHours(d.getHours() - 6); break;
    case '24h': d.setHours(d.getHours() - 24); break;
    case '7d': d.setDate(d.getDate() - 7); break;
  }
  return d.toISOString();
}

// ═══════════════════════════════════════════════════════════════
// Memory Dots Component
// ═══════════════════════════════════════════════════════════════

const MEMORY_LAYERS = ['session', 'episodic', 'somatic', 'morphic', 'semantic', 'coherence', 'evolution', 'anamnesis'] as const;
const MEMORY_LABELS: Record<string, string> = {
  session: 'Ses',
  episodic: 'Epi',
  somatic: 'Som',
  morphic: 'Mor',
  semantic: 'Sem',
  coherence: 'Coh',
  evolution: 'Evo',
  anamnesis: 'Ana',
};

function MemoryDots({ turn }: { turn: FieldMonitorTurn }) {
  return (
    <div className="flex gap-0.5">
      {MEMORY_LAYERS.map((layer) => {
        const key = `mem_${layer}` as keyof FieldMonitorTurn;
        const active = turn[key] === true;
        return (
          <div
            key={layer}
            title={`${layer}: ${active ? 'active' : 'inactive'}`}
            className={`w-2 h-2 rounded-full ${active ? 'bg-amber-400' : 'bg-stone-700'}`}
          />
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Issue Flags Component
// ═══════════════════════════════════════════════════════════════

function IssueFlags({ turn }: { turn: FieldMonitorTurn }) {
  const flags: { icon: string; label: string; color: string }[] = [];
  if (turn.ain_menu_mode) flags.push({ icon: '🍔', label: 'Menu Mode', color: 'text-amber-400' });
  if (turn.opus_rupture) flags.push({ icon: '💥', label: 'Rupture', color: 'text-red-400' });
  if (turn.socratic_regenerated) flags.push({ icon: '🔄', label: 'Regenerated', color: 'text-sky-400' });
  if (turn.breakthrough_detected) flags.push({ icon: '⚡', label: turn.breakthrough_type || 'Breakthrough', color: 'text-emerald-400' });
  if (turn.dissociation_detected) flags.push({ icon: '⚠️', label: 'Dissociation', color: 'text-red-400' });

  if (flags.length === 0) return <span className="text-stone-600">-</span>;

  return (
    <div className="flex gap-1">
      {flags.map((f, i) => (
        <span key={i} title={f.label} className={`text-xs ${f.color}`}>
          {f.icon}
        </span>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Turn Detail Panel
// ═══════════════════════════════════════════════════════════════

function TurnDetail({ turn }: { turn: FieldMonitorTurn }) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="px-4 py-3 bg-stone-900/60 border-t border-stone-700/40 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {/* Spiralogic */}
        <div>
          <div className="text-stone-500 mb-1">Spiralogic</div>
          <div className="text-stone-300">
            {turn.element}/{turn.phase} {turn.motion && `(${turn.motion})`}
          </div>
          {turn.intensity != null && (
            <div className="text-stone-400">Intensity: {turn.intensity.toFixed(2)}</div>
          )}
        </div>

        {/* AIN Shape */}
        <div>
          <div className="text-stone-500 mb-1">AIN Shape</div>
          <div className="text-stone-300">
            Score: {turn.ain_score ?? '-'}/4 {turn.ain_pass ? '✓' : '✗'}
          </div>
          <div className="text-stone-400 flex gap-1 flex-wrap mt-0.5">
            {turn.ain_mirror && <span className="bg-stone-800 px-1 rounded">Mirror</span>}
            {turn.ain_bridge && <span className="bg-stone-800 px-1 rounded">Bridge</span>}
            {turn.ain_permission && <span className="bg-stone-800 px-1 rounded">Permission</span>}
            {turn.ain_next_step && <span className="bg-stone-800 px-1 rounded">NextStep</span>}
          </div>
        </div>

        {/* Opus */}
        <div>
          <div className="text-stone-500 mb-1">Opus Axioms</div>
          <div className="text-stone-300">
            {turn.opus_is_gold ? '🥇 Gold' : `P:${turn.opus_passed} W:${turn.opus_warnings} V:${turn.opus_violations}`}
          </div>
          {turn.opus_rupture && <div className="text-red-400 mt-0.5">RUPTURE</div>}
        </div>

        {/* Socratic */}
        <div>
          <div className="text-stone-500 mb-1">Socratic</div>
          <div className="text-stone-300">
            {turn.socratic_decision || '-'} {turn.socratic_is_gold ? '🥇' : ''}
          </div>
          {turn.socratic_regenerated && (
            <div className="text-sky-400 mt-0.5">Regenerated (ruptures: {turn.socratic_rupture_count})</div>
          )}
        </div>

        {/* Memory */}
        <div>
          <div className="text-stone-500 mb-1">Memory Layers</div>
          <div className="flex gap-1 flex-wrap">
            {MEMORY_LAYERS.map((layer) => {
              const key = `mem_${layer}` as keyof FieldMonitorTurn;
              const active = turn[key] === true;
              return active ? (
                <span key={layer} className="bg-amber-500/20 text-amber-300 px-1 rounded text-xs">
                  {MEMORY_LABELS[layer]}
                </span>
              ) : null;
            })}
          </div>
        </div>

        {/* Voice */}
        <div>
          <div className="text-stone-500 mb-1">Voice</div>
          <div className="text-stone-300">
            {turn.voice_element || '-'} / {turn.voice_archetype || '-'}
          </div>
          <div className="text-stone-400">
            Hysteresis: {turn.voice_hysteresis || '-'}
          </div>
        </div>

        {/* Relational */}
        <div>
          <div className="text-stone-500 mb-1">Relational</div>
          <div className="text-stone-300">
            {turn.relational_stance || '-'}
          </div>
          <div className="text-stone-400">
            Hold: {turn.relational_hold_level || '-'}
          </div>
        </div>

        {/* Performance */}
        <div>
          <div className="text-stone-500 mb-1">Performance</div>
          <div className="text-stone-300">
            {turn.duration_ms ? `${(turn.duration_ms / 1000).toFixed(1)}s` : '-'}
          </div>
          <div className="text-stone-400">
            {turn.provider || '-'} {turn.used_fallback ? '(fallback)' : ''}
          </div>
        </div>

        {/* Frameworks */}
        <div className="col-span-2">
          <div className="text-stone-500 mb-1">Frameworks</div>
          <div className="flex gap-1 flex-wrap">
            {turn.frameworks_active?.length > 0 ? turn.frameworks_active.map((fw) => (
              <span key={fw} className="bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded text-xs">
                {fw}
              </span>
            )) : <span className="text-stone-600">none</span>}
          </div>
        </div>

        {/* Safety */}
        <div className="col-span-2">
          <div className="text-stone-500 mb-1">Safety</div>
          <div className="text-stone-300">
            Field: {turn.field_safe === true ? '✓ Safe' : turn.field_safe === false ? '✗ Blocked' : '-'}
            {turn.cognitive_altitude != null && ` | Altitude: ${turn.cognitive_altitude.toFixed(2)}`}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════

export default function FieldMonitorPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [turns, setTurns] = useState<FieldMonitorTurn[]>([]);
  const [summary, setSummary] = useState<FieldMonitorSummary | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [issuesOnly, setIssuesOnly] = useState(false);
  const [expandedTurn, setExpandedTurn] = useState<number | null>(null);

  // Auth check
  useEffect(() => {
    const token = sessionStorage.getItem('maia_admin_token');
    if (token) setAuthenticated(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setPasswordError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('maia_admin_token', data.token);
        setAuthenticated(true);
      } else {
        setPasswordError(data.error || 'Authentication failed');
      }
    } catch {
      setPasswordError('Connection error.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '100',
        since: sinceForRange(timeRange),
        ...(issuesOnly ? { issues_only: 'true' } : {}),
      });
      const token = sessionStorage.getItem('maia_admin_token') || '';
      const res = await fetch(`/api/admin/field-monitor?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTurns(data.turns || []);
        setSummary(data.summary || null);
      }
    } catch (err) {
      console.warn('[field-monitor] Load failed:', err);
    } finally {
      setLoading(false);
    }
  }, [timeRange, issuesOnly]);

  useEffect(() => {
    if (authenticated) loadData();
  }, [authenticated, loadData]);

  // ─── Login Gate ──────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h1 className="text-xl font-semibold text-stone-100 mb-6 text-center">Field Monitor</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-500/50"
              autoFocus
            />
            {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-amber-600/80 hover:bg-amber-600 text-stone-100 rounded-xl font-semibold transition-colors disabled:opacity-50"
            >
              {loginLoading ? 'Authenticating...' : 'Enter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ─── Dashboard ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/labtools/admin')}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Activity size={20} className="text-amber-400" />
              Field Monitor
            </h1>
            <p className="text-xs text-stone-500 mt-0.5">Per-turn oracle pipeline observability</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range */}
          <div className="flex bg-stone-900 rounded-lg border border-stone-700/50 p-0.5">
            {(['1h', '6h', '24h', '7d'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  timeRange === r
                    ? 'bg-amber-600/80 text-stone-100'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Issues Only Toggle */}
          <button
            onClick={() => setIssuesOnly(!issuesOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              issuesOnly
                ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                : 'border-stone-700/50 bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            <Filter size={12} />
            Issues
          </button>

          {/* Refresh */}
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 hover:bg-stone-800 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Field Integrity + Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
          {/* Field Integrity — spans 2 on mobile, 1 on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`col-span-2 md:col-span-1 rounded-2xl border ${integrityBorderColor(summary.fieldIntegrity)} bg-stone-900/60 p-4 flex flex-col items-center justify-center`}
          >
            <div className="text-xs text-stone-500 mb-1">Field Integrity</div>
            <div className={`text-3xl font-bold tabular-nums ${integrityColor(summary.fieldIntegrity)}`}>
              {(summary.fieldIntegrity * 100).toFixed(0)}
            </div>
          </motion.div>

          {/* AIN Pass */}
          <SummaryCard label="AIN Pass" value={pct(summary.ainPassRate)} icon={<Eye size={14} />} />
          {/* Opus Gold */}
          <SummaryCard label="Opus Gold" value={pct(summary.opusGoldRate)} icon={<Shield size={14} />} />
          {/* Menu Mode */}
          <SummaryCard
            label="Menu Mode"
            value={pct(summary.menuModeRate)}
            icon={<AlertTriangle size={14} />}
            warning={summary.menuModeRate > 0.1}
          />
          {/* Avg Duration */}
          <SummaryCard
            label="Avg Duration"
            value={summary.avgDurationMs > 0 ? `${(summary.avgDurationMs / 1000).toFixed(1)}s` : '-'}
            icon={<Zap size={14} />}
          />
          {/* Memory Depth */}
          <SummaryCard
            label="Memory Depth"
            value={pct(summary.memoryDepthScore)}
            icon={<Brain size={14} />}
          />
        </div>
      )}

      {/* Stats Row */}
      {summary && (
        <div className="flex gap-4 mb-4 text-xs text-stone-500">
          <span>{summary.totalTurns} turns</span>
          {summary.breakthroughCount > 0 && <span className="text-emerald-500">{summary.breakthroughCount} breakthroughs</span>}
          {summary.socraticRegenCount > 0 && <span className="text-sky-400">{summary.socraticRegenCount} regenerations</span>}
          {summary.dissociationCount > 0 && <span className="text-red-400">{summary.dissociationCount} dissociations</span>}
        </div>
      )}

      {/* Turn Table */}
      <div className="rounded-2xl border border-stone-700/50 bg-stone-900/40 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[80px_100px_1fr_60px_80px_100px_80px_60px_60px] gap-2 px-4 py-2 text-xs text-stone-500 border-b border-stone-700/40 bg-stone-900/60">
          <div>Time</div>
          <div>Element</div>
          <div>Frameworks</div>
          <div>AIN</div>
          <div>Opus</div>
          <div>Memory</div>
          <div>Voice</div>
          <div>Duration</div>
          <div>Flags</div>
        </div>

        {/* Rows */}
        {loading && turns.length === 0 ? (
          <div className="px-4 py-8 text-center text-stone-500 text-sm">Loading...</div>
        ) : turns.length === 0 ? (
          <div className="px-4 py-8 text-center text-stone-500 text-sm">
            No turns in this time range{issuesOnly ? ' (with issues)' : ''}.
          </div>
        ) : (
          turns.map((turn) => (
            <div key={turn.id}>
              <div
                onClick={() => setExpandedTurn(expandedTurn === turn.id ? null : turn.id)}
                className="grid grid-cols-[80px_100px_1fr_60px_80px_100px_80px_60px_60px] gap-2 px-4 py-2 text-xs hover:bg-stone-800/40 cursor-pointer border-b border-stone-800/30 items-center"
              >
                {/* Time */}
                <div className="text-stone-400 tabular-nums">{timeAgo(turn.created_at)}</div>

                {/* Element/Phase */}
                <div>
                  {turn.element ? (
                    <span className={`px-1.5 py-0.5 rounded border text-xs ${ELEMENT_COLORS[turn.element] || 'bg-stone-800 text-stone-300 border-stone-700'}`}>
                      {turn.element}/{turn.phase}
                    </span>
                  ) : (
                    <span className="text-stone-600">-</span>
                  )}
                </div>

                {/* Frameworks */}
                <div className="flex gap-1 flex-wrap overflow-hidden">
                  {turn.frameworks_active?.slice(0, 3).map((fw) => (
                    <span key={fw} className="bg-stone-800/80 text-stone-400 px-1 rounded text-xs truncate max-w-[80px]">
                      {fw}
                    </span>
                  ))}
                  {(turn.frameworks_active?.length || 0) > 3 && (
                    <span className="text-stone-600">+{turn.frameworks_active.length - 3}</span>
                  )}
                </div>

                {/* AIN Score */}
                <div className={turn.ain_pass ? 'text-emerald-400' : turn.ain_pass === false ? 'text-red-400' : 'text-stone-600'}>
                  {turn.ain_score != null ? `${turn.ain_score}/4` : '-'}
                </div>

                {/* Opus */}
                <div>
                  {turn.opus_is_gold ? (
                    <span className="text-amber-300">Gold</span>
                  ) : turn.opus_rupture ? (
                    <span className="text-red-400">Rupture</span>
                  ) : turn.opus_passed != null ? (
                    <span className="text-stone-400">
                      {turn.opus_passed}p {turn.opus_warnings ? `${turn.opus_warnings}w` : ''}
                    </span>
                  ) : (
                    <span className="text-stone-600">-</span>
                  )}
                </div>

                {/* Memory Dots */}
                <div><MemoryDots turn={turn} /></div>

                {/* Voice */}
                <div className="text-stone-400 truncate">
                  {turn.voice_archetype || '-'}
                </div>

                {/* Duration */}
                <div className="text-stone-400 tabular-nums">
                  {turn.duration_ms ? `${(turn.duration_ms / 1000).toFixed(1)}s` : '-'}
                </div>

                {/* Flags */}
                <div><IssueFlags turn={turn} /></div>
              </div>

              {/* Expanded Detail */}
              <AnimatePresence>
                {expandedTurn === turn.id && <TurnDetail turn={turn} />}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Summary Card
// ═══════════════════════════════════════════════════════════════

function SummaryCard({
  label,
  value,
  icon,
  warning,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  warning?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-stone-900/60 p-3 ${
        warning ? 'border-amber-500/30' : 'border-stone-700/50'
      }`}
    >
      <div className="flex items-center gap-1.5 text-stone-500 text-xs mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-semibold tabular-nums ${warning ? 'text-amber-400' : 'text-stone-200'}`}>
        {value}
      </div>
    </motion.div>
  );
}
