'use client';

/**
 * SpiralDashboard: Main dashboard for viewing spiral patterns
 *
 * Displays 4 blocks:
 * 1. Active Threads (current storylines)
 * 2. Current Cycle (spiral position)
 * 3. Recurring Motifs (top beads)
 * 4. Effective Stabilizers (practices that help)
 */

import { useState, useEffect } from 'react';
import { BeadChips } from './BeadChips';

interface Thread {
  id: string;
  title: string;
  domain: string | null;
  status: string;
  currentPhase: string | null;
  currentMilestone: string | null;
  elementalSignature: Record<string, number>;
  lastUpdated: string;
  eventCount: number;
}

interface CurrentCycle {
  position: {
    element: string;
    facet: string | null;
    depth: string;
    enteredAt: string;
  } | null;
  activeCycle: {
    name: string;
    sequence: string[];
    progress: number;
  } | null;
  predictions: Array<{
    beadCode: string;
    probability: number;
  }>;
  loopWarning: boolean;
}

interface Motif {
  code: string;
  label: string;
  element: string;
  facet: string | null;
  activationCount: number;
  lastActivated: string;
  confidence: number;
}

interface Stabilizer {
  practice: string;
  elements: string[];
  effectiveness: number;
  usage_count: number;
}

interface DashboardData {
  activeThreads: Thread[];
  currentCycle: CurrentCycle;
  recurringMotifs: Motif[];
  stabilizers: Stabilizer[];
  profileConfidence: number;
}

interface SpiralDashboardProps {
  userId: string;
  compact?: boolean;
  onThreadSelect?: (threadId: string) => void;
}

const ELEMENT_COLORS: Record<string, string> = {
  fire: 'text-orange-400',
  water: 'text-blue-400',
  earth: 'text-amber-500',
  air: 'text-cyan-400',
  aether: 'text-purple-400'
};

const ELEMENT_BG: Record<string, string> = {
  fire: 'bg-orange-500/20',
  water: 'bg-blue-500/20',
  earth: 'bg-amber-600/20',
  air: 'bg-cyan-400/20',
  aether: 'bg-purple-500/20'
};

const MILESTONE_LABELS: Record<string, string> = {
  rupture: 'Rupture',
  revelation: 'Revelation',
  decision: 'Decision',
  descent: 'Descent',
  reconciliation: 'Reconciliation',
  embodiment: 'Embodiment',
  completion: 'Completion'
};

export function SpiralDashboard({
  userId,
  compact = false,
  onThreadSelect
}: SpiralDashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const response = await fetch(`/api/spiral/dashboard?userId=${encodeURIComponent(userId)}`);
        const result = await response.json();

        if (result.success && result.data) {
          setData(result.data);
        } else {
          setError(result.error || 'Failed to load dashboard');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('[SpiralDashboard] Load error:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [userId]);

  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} animate-pulse`}>
        <div className="h-4 bg-white/10 rounded w-1/3 mb-4" />
        <div className="h-20 bg-white/5 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`${compact ? 'p-3' : 'p-6'} text-white/50 text-sm`}>
        {error || 'No spiral data available yet'}
      </div>
    );
  }

  if (compact) {
    return <CompactDashboard data={data} onThreadSelect={onThreadSelect} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-light text-white/90">Spiral Dashboard</h2>
        <div className="text-xs text-white/40">
          Profile confidence: {Math.round(data.profileConfidence * 100)}%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block 1: Active Threads */}
        <ActiveThreadsBlock
          threads={data.activeThreads}
          onThreadSelect={onThreadSelect}
        />

        {/* Block 2: Current Cycle */}
        <CurrentCycleBlock cycle={data.currentCycle} />

        {/* Block 3: Recurring Motifs */}
        <RecurringMotifsBlock motifs={data.recurringMotifs} />

        {/* Block 4: Effective Stabilizers */}
        <StabilizersBlock stabilizers={data.stabilizers} />
      </div>
    </div>
  );
}

function CompactDashboard({
  data,
  onThreadSelect
}: {
  data: DashboardData;
  onThreadSelect?: (threadId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-white/10">
      {/* Collapsed header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-white/70">Spiral</span>

          {/* Current position indicator */}
          {data.currentCycle.position && (
            <span className={`text-xs px-2 py-0.5 rounded ${ELEMENT_BG[data.currentCycle.position.element]}`}>
              {data.currentCycle.position.facet || data.currentCycle.position.element}
            </span>
          )}

          {/* Loop warning */}
          {data.currentCycle.loopWarning && (
            <span className="text-xs text-yellow-400">Loop detected</span>
          )}
        </div>

        <span className="text-white/30">{expanded ? '\u25B2' : '\u25BC'}</span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-3 pt-0 space-y-4">
          {/* Active threads (compact) */}
          {data.activeThreads.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-white/40">Active threads</div>
              <div className="flex flex-wrap gap-1.5">
                {data.activeThreads.slice(0, 5).map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => onThreadSelect?.(thread.id)}
                    className="px-2 py-1 rounded text-xs bg-white/5 hover:bg-white/10 text-white/70 transition-colors"
                  >
                    {thread.title}
                    {thread.currentPhase && (
                      <span className="ml-1 text-white/40">{thread.currentPhase}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Top motifs (compact) */}
          {data.recurringMotifs.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-white/40">Recurring patterns</div>
              <BeadChips
                beads={data.recurringMotifs.slice(0, 5).map(m => ({
                  code: m.code,
                  label: m.label,
                  element: m.element as any,
                  facet: m.facet,
                  intensity: m.activationCount / 20, // Normalize
                  confidence: m.confidence,
                  isNew: false
                }))}
                showConfirmation={false}
                compact={true}
              />
            </div>
          )}

          {/* Predictions */}
          {data.currentCycle.predictions.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs text-white/40">MAIA predicts next</div>
              <div className="flex gap-2">
                {data.currentCycle.predictions.slice(0, 3).map((p, i) => (
                  <span
                    key={i}
                    className="text-xs text-white/50"
                  >
                    {p.beadCode} ({Math.round(p.probability * 100)}%)
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveThreadsBlock({
  threads,
  onThreadSelect
}: {
  threads: Thread[];
  onThreadSelect?: (threadId: string) => void;
}) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-3">Active Threads</h3>

      {threads.length === 0 ? (
        <div className="text-sm text-white/40 italic">No active threads yet</div>
      ) : (
        <div className="space-y-2">
          {threads.map((thread) => (
            <button
              key={thread.id}
              onClick={() => onThreadSelect?.(thread.id)}
              className="w-full text-left p-3 rounded-lg bg-black/20 hover:bg-black/30
                         border border-white/5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white/90 truncate">
                    {thread.title}
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                    {thread.domain && <span>{thread.domain}</span>}
                    {thread.currentPhase && (
                      <span className="text-white/50">{thread.currentPhase}</span>
                    )}
                    {thread.currentMilestone && (
                      <span className="text-amber-400/70">
                        {MILESTONE_LABELS[thread.currentMilestone]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Elemental signature */}
                <div className="flex gap-0.5 h-8">
                  {Object.entries(thread.elementalSignature)
                    .filter(([_, v]) => v > 0.1)
                    .sort(([_, a], [__, b]) => b - a)
                    .slice(0, 3)
                    .map(([element, value]) => (
                      <div
                        key={element}
                        className={`w-1.5 rounded-full ${ELEMENT_BG[element]}`}
                        style={{ height: `${Math.max(20, value * 100)}%` }}
                        title={`${element}: ${Math.round(value * 100)}%`}
                      />
                    ))
                  }
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CurrentCycleBlock({ cycle }: { cycle: CurrentCycle }) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-3">Current Cycle</h3>

      {!cycle.position && !cycle.activeCycle ? (
        <div className="text-sm text-white/40 italic">
          No cycle detected yet. Keep journaling to build patterns.
        </div>
      ) : (
        <div className="space-y-4">
          {/* Current position */}
          {cycle.position && (
            <div className="flex items-center gap-3">
              <div className={`
                px-4 py-2 rounded-lg text-center
                ${ELEMENT_BG[cycle.position.element]}
              `}>
                <div className={`text-2xl font-light ${ELEMENT_COLORS[cycle.position.element]}`}>
                  {cycle.position.facet || cycle.position.element}
                </div>
                <div className="text-xs text-white/40 mt-0.5">
                  {cycle.position.depth} depth
                </div>
              </div>

              {/* Loop warning */}
              {cycle.loopWarning && (
                <div className="flex-1 p-2 rounded bg-yellow-500/10 border border-yellow-500/30">
                  <div className="text-xs text-yellow-400">
                    Loop pattern detected
                  </div>
                  <div className="text-xs text-yellow-400/70 mt-0.5">
                    Consider a shift in approach
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active cycle progress */}
          {cycle.activeCycle && (
            <div>
              <div className="text-xs text-white/40 mb-1.5">
                Active cycle: {cycle.activeCycle.name}
              </div>
              <div className="flex gap-1">
                {cycle.activeCycle.sequence.map((step, i) => {
                  const isCompleted = i < cycle.activeCycle!.progress * cycle.activeCycle!.sequence.length;
                  const isCurrent = Math.floor(cycle.activeCycle!.progress * cycle.activeCycle!.sequence.length) === i;

                  return (
                    <div
                      key={i}
                      className={`
                        flex-1 h-2 rounded-full transition-all
                        ${isCompleted ? 'bg-white/40' : 'bg-white/10'}
                        ${isCurrent ? 'ring-2 ring-white/30' : ''}
                      `}
                      title={step}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-white/30 mt-1">
                {cycle.activeCycle.sequence.map((step, i) => (
                  <span key={i}>{step}</span>
                ))}
              </div>
            </div>
          )}

          {/* Predictions */}
          {cycle.predictions.length > 0 && (
            <div>
              <div className="text-xs text-white/40 mb-1.5">MAIA predicts next:</div>
              <div className="flex gap-2">
                {cycle.predictions.map((p, i) => (
                  <div
                    key={i}
                    className="px-2 py-1 rounded bg-white/5 text-xs text-white/60"
                    style={{ opacity: 0.5 + p.probability * 0.5 }}
                  >
                    {p.beadCode}
                    <span className="text-white/30 ml-1">
                      {Math.round(p.probability * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RecurringMotifsBlock({ motifs }: { motifs: Motif[] }) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-3">Recurring Motifs</h3>

      {motifs.length === 0 ? (
        <div className="text-sm text-white/40 italic">
          No patterns detected yet
        </div>
      ) : (
        <div className="space-y-2">
          {motifs.map((motif, i) => (
            <div
              key={motif.code}
              className="flex items-center gap-3 p-2 rounded-lg bg-black/10"
            >
              <span className="text-xs text-white/30 w-4">{i + 1}</span>

              <div className={`
                px-2 py-0.5 rounded text-xs
                ${ELEMENT_BG[motif.element]} ${ELEMENT_COLORS[motif.element]}
              `}>
                {motif.facet || motif.element}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">{motif.label}</div>
              </div>

              <div className="text-xs text-white/40">
                {motif.activationCount}x
              </div>

              {/* Confidence indicator */}
              <div className="w-12 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${motif.confidence * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StabilizersBlock({ stabilizers }: { stabilizers: Stabilizer[] }) {
  return (
    <div className="p-4 rounded-xl bg-black/20 border border-white/10">
      <h3 className="text-sm font-medium text-white/60 mb-3">Effective Stabilizers</h3>

      {stabilizers.length === 0 ? (
        <div className="text-sm text-white/40 italic">
          No stabilizers tracked yet. MAIA will learn what helps you integrate.
        </div>
      ) : (
        <div className="space-y-2">
          {stabilizers.map((stabilizer, i) => (
            <div
              key={stabilizer.practice}
              className="flex items-center gap-3 p-2 rounded-lg bg-black/10"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm text-white/80 truncate">
                  {stabilizer.practice}
                </div>
                {stabilizer.elements.length > 0 && (
                  <div className="flex gap-1 mt-1">
                    {stabilizer.elements.map((el) => (
                      <span
                        key={el}
                        className={`text-xs ${ELEMENT_COLORS[el]}`}
                      >
                        {el}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm text-green-400/80">
                  {Math.round(stabilizer.effectiveness * 100)}%
                </div>
                <div className="text-xs text-white/30">
                  {stabilizer.usage_count} uses
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SpiralDashboard;
