'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Lock,
  RefreshCw,
  AlertTriangle,
  Activity,
  Brain,
  Layers,
  Shield,
  Eye,
  Flame,
  Droplets,
  Mountain,
  Wind,
  Sparkles,
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface FieldMonitorTurn {
  id: number;
  created_at: string;
  member_id: string;
  session_id: string | null;
  route: string;
  element: string | null;
  phase: number | null;
  motion: string | null;
  frameworks_detected: Array<{ framework: string; confidence: number }>;
  primary_framework: string | null;
  framework_count: number;
  integration_score: number | null;
  ain_pass: boolean | null;
  ain_score: number | null;
  ain_mirror: boolean | null;
  ain_bridge: boolean | null;
  ain_permission: boolean | null;
  ain_next_step: boolean | null;
  memory_layers_hit: {
    episodic: boolean;
    somatic: boolean;
    morphic: boolean;
    semantic: boolean;
    session: boolean;
  };
  memory_layer_count: number;
  voice_mode: string | null;
  relational_stance: string | null;
  processing_path: string | null;
  diversity_score: number | null;
  mono_modal_alert: boolean;
  // Extended: Field Intelligence + PFI + Quality
  field_intelligence: any | null;
  wisdom_field: string | null;
  user_state: string | null;
  spiral_scale: string | null;
  quality_score: number | null;
  pfi_realm: string | null;
  pfi_coherence: number | null;
  pfi_field_work_safe: boolean | null;
  pfi_signals: any | null;
}

interface FieldMonitorSummary {
  totalTurns: number;
  frameworkDistribution: Record<string, number>;
  ainPassRate: number;
  avgDiversity: number;
  alertCount: number;
  memoryLayerCoverage: Record<string, number>;
  avgAinScore: number;
}

// ═══════════════════════════════════════════════════════════════
// Element Helpers
// ═══════════════════════════════════════════════════════════════

const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  fire: <Flame className="w-3.5 h-3.5 text-red-400" />,
  water: <Droplets className="w-3.5 h-3.5 text-blue-400" />,
  earth: <Mountain className="w-3.5 h-3.5 text-amber-400" />,
  air: <Wind className="w-3.5 h-3.5 text-cyan-400" />,
  aether: <Sparkles className="w-3.5 h-3.5 text-purple-400" />,
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'border-red-500/30 bg-red-500/10',
  water: 'border-blue-500/30 bg-blue-500/10',
  earth: 'border-amber-500/30 bg-amber-500/10',
  air: 'border-cyan-500/30 bg-cyan-500/10',
  aether: 'border-purple-500/30 bg-purple-500/10',
};

const FRAMEWORK_LABELS: Record<string, string> = {
  'somatic-experiencing': 'Somatic',
  'internal-family-systems': 'IFS',
  'jungian-depth': 'Jungian',
  'relational-psychoanalysis': 'Relational',
  'attachment-theory': 'Attachment',
  'polyvagal-theory': 'Polyvagal',
  'hakomi': 'Hakomi',
  'focusing': 'Focusing',
  'cbt': 'CBT',
  'dbt': 'DBT',
  'act': 'ACT',
  'gestalt': 'Gestalt',
  'existential': 'Existential',
  'narrative-therapy': 'Narrative',
  'archetypal-psychology': 'Archetypal',
};

// ═══════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════

export default function FieldMonitorPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [turns, setTurns] = useState<FieldMonitorTurn[]>([]);
  const [summary, setSummary] = useState<FieldMonitorSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<FieldMonitorTurn | null>(null);
  const [alertsOnly, setAlertsOnly] = useState(false);

  // Check for existing session
  useEffect(() => {
    const token = sessionStorage.getItem('maia_admin_token');
    if (token) {
      setAuthenticated(true);
    }
  }, []);

  // Load data when authenticated
  useEffect(() => {
    if (authenticated) {
      loadData();
    }
  }, [authenticated, alertsOnly]);

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
        if (data.attemptsRemaining !== undefined) {
          setPasswordError(`${data.error}. ${data.attemptsRemaining} attempts remaining.`);
        }
      }
    } catch {
      setPasswordError('Connection error. Try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('maia_admin_token');
      const params = new URLSearchParams({ limit: '100' });
      if (alertsOnly) params.set('alerts_only', 'true');

      const res = await fetch(`/api/admin/field-monitor?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTurns(data.turns || []);
        setSummary(data.summary || null);
        if (data.turns?.length > 0 && !selectedTurn) {
          setSelectedTurn(data.turns[0]);
        }
      } else if (res.status === 401) {
        sessionStorage.removeItem('maia_admin_token');
        setAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to load field monitor data:', err);
    } finally {
      setLoading(false);
    }
  }, [alertsOnly]);

  // ─── Login Gate ───
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl font-medium text-white">Field Monitor</h1>
            <p className="text-sm text-white/40 mt-1">Admin access required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50"
              autoFocus
            />
            {passwordError && (
              <p className="text-red-400 text-sm">{passwordError}</p>
            )}
            <button
              type="submit"
              disabled={loginLoading || !password}
              className="w-full py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium disabled:opacity-50 transition-colors"
            >
              {loginLoading ? 'Authenticating...' : 'Enter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── Main Dashboard ───
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/labtools')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white/50" />
            </button>
            <div>
              <h1 className="text-lg font-medium flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-400" />
                Field Monitor
              </h1>
              <p className="text-xs text-white/40">
                Turn-level observability for MAIA&apos;s consciousness systems
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={alertsOnly}
                onChange={(e) => setAlertsOnly(e.target.checked)}
                className="rounded border-white/20"
              />
              Alerts only
            </label>
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-white/50 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="px-6 py-4 border-b border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            <StatCard
              label="Total Turns"
              value={summary.totalTurns}
              icon={<Activity className="w-4 h-4" />}
            />
            <StatCard
              label="AIN Pass Rate"
              value={`${(summary.ainPassRate * 100).toFixed(0)}%`}
              icon={<Shield className="w-4 h-4" />}
              color={summary.ainPassRate >= 0.7 ? 'text-green-400' : 'text-red-400'}
            />
            <StatCard
              label="Avg AIN Score"
              value={`${summary.avgAinScore.toFixed(1)}/4`}
              icon={<Shield className="w-4 h-4" />}
            />
            <StatCard
              label="Avg Diversity"
              value={summary.avgDiversity.toFixed(2)}
              icon={<Brain className="w-4 h-4" />}
              color={summary.avgDiversity >= 0.15 ? 'text-green-400' : 'text-amber-400'}
            />
            <StatCard
              label="Alerts"
              value={summary.alertCount}
              icon={<AlertTriangle className="w-4 h-4" />}
              color={summary.alertCount > 0 ? 'text-red-400' : 'text-green-400'}
            />
            <StatCard
              label="Frameworks"
              value={Object.keys(summary.frameworkDistribution).length}
              icon={<Layers className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* Framework Distribution Bar */}
      {summary && Object.keys(summary.frameworkDistribution).length > 0 && (
        <div className="px-6 py-3 border-b border-white/5">
          <div className="text-xs text-white/40 mb-2">Framework Distribution (7d)</div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(summary.frameworkDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([fw, count]) => (
                <span
                  key={fw}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/5 border border-white/10"
                >
                  <span className="text-white/70">{FRAMEWORK_LABELS[fw] || fw}</span>
                  <span className="text-amber-400 font-mono">{count}</span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* Memory Layer Coverage */}
      {summary && Object.keys(summary.memoryLayerCoverage).length > 0 && (
        <div className="px-6 py-3 border-b border-white/5">
          <div className="text-xs text-white/40 mb-2">Memory Layer Hits (7d)</div>
          <div className="flex gap-3">
            {Object.entries(summary.memoryLayerCoverage).map(([layer, count]) => (
              <div
                key={layer}
                className="flex items-center gap-1.5 text-xs"
              >
                <div className={`w-2 h-2 rounded-full ${Number(count) > 0 ? 'bg-green-400' : 'bg-white/10'}`} />
                <span className="text-white/50 capitalize">{layer}</span>
                <span className="text-white/30 font-mono">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content: Turn List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 min-h-[calc(100vh-300px)]">
        {/* Turn List */}
        <div className="lg:col-span-5 border-r border-white/5 overflow-y-auto max-h-[calc(100vh-300px)]">
          {turns.length === 0 ? (
            <div className="p-8 text-center text-white/30 text-sm">
              {loading ? 'Loading...' : 'No turns recorded yet. Have a conversation with MAIA to generate data.'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {turns.map((turn) => (
                <button
                  key={turn.id}
                  onClick={() => setSelectedTurn(turn)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                    selectedTurn?.id === turn.id ? 'bg-white/5 border-l-2 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {turn.element && (
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs border ${ELEMENT_COLORS[turn.element] || 'border-white/10 bg-white/5'}`}>
                          {ELEMENT_ICONS[turn.element]}
                          <span className="capitalize">{turn.element}</span>
                          {turn.phase && <span className="text-white/40">/{turn.phase}</span>}
                        </span>
                      )}
                      <span className="text-[10px] text-white/30 font-mono">{turn.route}</span>
                    </div>
                    <span className="text-[10px] text-white/30">
                      {new Date(turn.created_at).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    {turn.primary_framework && (
                      <span className="text-xs text-amber-400">
                        {FRAMEWORK_LABELS[turn.primary_framework] || turn.primary_framework}
                      </span>
                    )}
                    {turn.framework_count > 1 && (
                      <span className="text-[10px] text-white/30">
                        +{turn.framework_count - 1} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mt-1 text-[10px] text-white/40">
                    {turn.ain_score !== null && (
                      <span className={turn.ain_pass ? 'text-green-400' : 'text-red-400'}>
                        AIN {turn.ain_score}/4
                      </span>
                    )}
                    <span>Mem {turn.memory_layer_count}/5</span>
                    {turn.diversity_score !== null && (
                      <span>Div {Number(turn.diversity_score).toFixed(2)}</span>
                    )}
                    {turn.pfi_realm && (
                      <span className="text-amber-400/70">{turn.pfi_realm}</span>
                    )}
                    {turn.wisdom_field && (
                      <span className="text-purple-400/70">{turn.wisdom_field}</span>
                    )}
                    {turn.mono_modal_alert && (
                      <span className="text-red-400 font-medium flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> collapse
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Turn Detail */}
        <div className="lg:col-span-7 overflow-y-auto max-h-[calc(100vh-300px)] p-6">
          {!selectedTurn ? (
            <div className="flex items-center justify-center h-full text-white/30 text-sm">
              Select a turn to inspect
            </div>
          ) : (
            <div className="space-y-6">
              {/* Turn Header */}
              <div>
                <div className="text-xs text-white/40">
                  Turn #{selectedTurn.id} &middot;{' '}
                  {new Date(selectedTurn.created_at).toLocaleString()} &middot;{' '}
                  {selectedTurn.route} route
                </div>
                <div className="text-xs text-white/30 mt-1 font-mono">
                  member: {selectedTurn.member_id.slice(0, 12)}...
                  {selectedTurn.session_id && ` | session: ${selectedTurn.session_id.slice(0, 12)}...`}
                </div>
              </div>

              {/* AIN Shape */}
              <DetailSection title="AIN Response Shape" icon={<Shield className="w-4 h-4 text-amber-400" />}>
                {selectedTurn.ain_score !== null ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <span className={`text-2xl font-mono ${selectedTurn.ain_pass ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedTurn.ain_score}/4
                      </span>
                      <span className={`text-sm ${selectedTurn.ain_pass ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedTurn.ain_pass ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <ShapeBadge label="Mirror" active={selectedTurn.ain_mirror} />
                      <ShapeBadge label="Bridge" active={selectedTurn.ain_bridge} />
                      <ShapeBadge label="Permission" active={selectedTurn.ain_permission} />
                      <ShapeBadge label="Next Step" active={selectedTurn.ain_next_step} />
                    </div>
                  </div>
                ) : (
                  <span className="text-white/30 text-sm">Not evaluated</span>
                )}
              </DetailSection>

              {/* Therapeutic Frameworks */}
              <DetailSection title="Therapeutic Frameworks" icon={<Brain className="w-4 h-4 text-purple-400" />}>
                {selectedTurn.frameworks_detected?.length > 0 ? (
                  <div className="space-y-2">
                    {selectedTurn.frameworks_detected
                      .sort((a, b) => b.confidence - a.confidence)
                      .map((fw) => (
                        <div
                          key={fw.framework}
                          className="flex items-center justify-between"
                        >
                          <span className={`text-sm ${fw.framework === selectedTurn.primary_framework ? 'text-amber-400 font-medium' : 'text-white/70'}`}>
                            {FRAMEWORK_LABELS[fw.framework] || fw.framework}
                            {fw.framework === selectedTurn.primary_framework && (
                              <span className="ml-2 text-[10px] text-amber-400/60">PRIMARY</span>
                            )}
                          </span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500/50 rounded-full"
                                style={{ width: `${fw.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/40 font-mono w-10 text-right">
                              {(fw.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    {selectedTurn.integration_score !== null && (
                      <div className="pt-2 border-t border-white/5 text-xs text-white/40">
                        Integration score: {Number(selectedTurn.integration_score).toFixed(2)}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-white/30 text-sm">No frameworks detected</span>
                )}
              </DetailSection>

              {/* Memory Layers */}
              <DetailSection title="Memory Layers" icon={<Layers className="w-4 h-4 text-blue-400" />}>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedTurn.memory_layers_hit || {}).map(([layer, active]) => (
                    <span
                      key={layer}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                        active
                          ? 'border-green-500/30 bg-green-500/10 text-green-400'
                          : 'border-white/5 bg-white/5 text-white/20'
                      }`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-white/10'}`} />
                      <span className="capitalize">{layer}</span>
                    </span>
                  ))}
                </div>
                <div className="text-xs text-white/30 mt-2">
                  {selectedTurn.memory_layer_count}/5 layers active
                </div>
              </DetailSection>

              {/* Voice & Processing */}
              <DetailSection title="Voice & Processing" icon={<Activity className="w-4 h-4 text-cyan-400" />}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/40 text-xs">Voice Mode</span>
                    <div className="text-white/80 capitalize">{selectedTurn.voice_mode || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Relational Stance</span>
                    <div className="text-white/80 capitalize">{selectedTurn.relational_stance || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Processing Path</span>
                    <div className="text-white/80">{selectedTurn.processing_path || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Motion</span>
                    <div className="text-white/80 capitalize">{selectedTurn.motion || 'n/a'}</div>
                  </div>
                </div>
              </DetailSection>

              {/* Diversity */}
              <DetailSection title="Diversity & Alerts" icon={<AlertTriangle className="w-4 h-4 text-red-400" />}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Diversity Score</span>
                    <span className={`font-mono ${
                      Number(selectedTurn.diversity_score) >= 0.15 ? 'text-green-400' : 'text-amber-400'
                    }`}>
                      {selectedTurn.diversity_score !== null
                        ? Number(selectedTurn.diversity_score).toFixed(2)
                        : 'n/a'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/50">Mono-Modal Alert</span>
                    <span className={selectedTurn.mono_modal_alert ? 'text-red-400 font-medium' : 'text-green-400'}>
                      {selectedTurn.mono_modal_alert ? 'TRIGGERED' : 'Clear'}
                    </span>
                  </div>
                </div>
              </DetailSection>

              {/* Field Intelligence */}
              <DetailSection title="Field Intelligence" icon={<Sparkles className="w-4 h-4 text-purple-400" />}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-white/40 text-xs">User State</span>
                    <div className="text-white/80 capitalize">{selectedTurn.user_state || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Spiral Scale</span>
                    <div className="text-white/80 capitalize">{selectedTurn.spiral_scale || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Wisdom Field</span>
                    <div className="text-amber-400 capitalize">{selectedTurn.wisdom_field || 'n/a'}</div>
                  </div>
                  <div>
                    <span className="text-white/40 text-xs">Quality Score</span>
                    <div className={`font-mono ${
                      selectedTurn.quality_score !== null && Number(selectedTurn.quality_score) >= 0.6
                        ? 'text-green-400' : 'text-white/80'
                    }`}>
                      {selectedTurn.quality_score !== null
                        ? Number(selectedTurn.quality_score).toFixed(2)
                        : 'n/a'}
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* PFI Mind State */}
              <DetailSection title="PFI Mind State" icon={<Brain className="w-4 h-4 text-amber-400" />}>
                {selectedTurn.pfi_realm ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-white/40 text-xs">Realm</span>
                        <div className="text-amber-400 font-medium">{selectedTurn.pfi_realm}</div>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs">Coherence</span>
                        <div className={`font-mono ${
                          selectedTurn.pfi_coherence !== null && Number(selectedTurn.pfi_coherence) >= 0.6
                            ? 'text-green-400' : 'text-white/80'
                        }`}>
                          {selectedTurn.pfi_coherence !== null
                            ? Number(selectedTurn.pfi_coherence).toFixed(2)
                            : 'n/a'}
                        </div>
                      </div>
                      <div>
                        <span className="text-white/40 text-xs">Field Work Safe</span>
                        <div className={selectedTurn.pfi_field_work_safe ? 'text-green-400' : 'text-red-400'}>
                          {selectedTurn.pfi_field_work_safe ? 'Safe' : 'Not Safe'}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-white/30 text-sm">
                    PFI not active for this turn (check MAIA_PFI_MIND env flag)
                  </span>
                )}
              </DetailSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Sub-Components
// ═══════════════════════════════════════════════════════════════

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/5">
      <div className="flex items-center gap-1.5 text-white/40 text-[10px] mb-1">
        {icon}
        {label}
      </div>
      <div className={`text-lg font-mono ${color || 'text-white/80'}`}>{value}</div>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70 mb-3">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

function ShapeBadge({ label, active }: { label: string; active: boolean | null }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded text-xs border ${
        active
          ? 'border-green-500/30 bg-green-500/10 text-green-400'
          : 'border-white/5 bg-white/5 text-white/20'
      }`}
    >
      {active ? '\u2713' : '\u2717'} {label}
    </span>
  );
}
