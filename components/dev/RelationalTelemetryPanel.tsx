'use client';

import * as React from 'react';

type MoveOutcomeEvent = {
  tsOutcome: number;
  tsMove: number;
  moveIntent: string;
  responseType: 'SPOKEN' | 'SILENCE';
  activationAtMove: number;
  activationAtOutcome?: number;
  outcome?: 'SETTLED' | 'WARM_CONTINUE' | 'ESCALATED' | 'DISENGAGED' | 'UNKNOWN';
  latencyToOutcomeMs?: number;
};

function isTelemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('telemetry') === '1';
}

export function RelationalTelemetryPanel(props: {
  lastMoveOutcome: MoveOutcomeEvent | null;
  max?: number; // default 10
}) {
  const { lastMoveOutcome, max = 10 } = props;

  const [enabled, setEnabled] = React.useState(false);
  const [events, setEvents] = React.useState<MoveOutcomeEvent[]>([]);

  React.useEffect(() => {
    // Show in dev OR via query param toggle (?telemetry=1)
    const dev =
      process.env.NODE_ENV === 'development' ||
      (typeof window !== 'undefined' && window.location.hostname === 'localhost');

    setEnabled(dev || isTelemetryEnabled());
  }, []);

  React.useEffect(() => {
    if (!enabled) return;
    if (!lastMoveOutcome) return;

    setEvents(prev => {
      const next = [lastMoveOutcome, ...prev];
      if (next.length > max) next.length = max;
      return next;
    });
  }, [enabled, lastMoveOutcome, max]);

  if (!enabled) return null;

  return (
    <div
      className="fixed bottom-3 right-3 z-[9999] w-[420px] max-w-[calc(100vw-24px)] rounded-xl border border-white/10 bg-black/70 p-3 shadow-xl backdrop-blur"
      role="complementary"
      aria-label="Relational telemetry"
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-semibold text-white/90">Relational Telemetry</div>
        <div className="text-xs text-white/50">last {max}</div>
      </div>

      <div className="grid grid-cols-4 gap-2 border-b border-white/10 pb-2 text-[11px] font-medium text-white/60">
        <div>Intent</div>
        <div>Outcome</div>
        <div>Δ act</div>
        <div className="text-right">Latency</div>
      </div>

      <div className="mt-2 space-y-2">
        {events.length === 0 ? (
          <div className="text-xs text-white/50">No move_outcome events yet.</div>
        ) : (
          events.map((e, idx) => {
            const delta =
              e.activationAtOutcome !== undefined
                ? e.activationAtOutcome - e.activationAtMove
                : undefined;

            const latency = e.latencyToOutcomeMs;

            return (
              <div
                key={`${e.tsOutcome}-${idx}`}
                className="grid grid-cols-4 gap-2 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-white/80"
              >
                <div className="truncate" title={e.moveIntent}>
                  {e.moveIntent}
                </div>
                <div className="truncate" title={e.outcome ?? '—'}>
                  {e.outcome ?? '—'}
                </div>
                <div className="tabular-nums">
                  {delta === undefined ? '—' : (delta >= 0 ? '+' : '') + delta.toFixed(2)}
                </div>
                <div className="text-right tabular-nums">
                  {latency === undefined ? '—' : `${Math.round(latency)}ms`}
                </div>

                <div className="col-span-4 mt-1 flex items-center justify-between text-[10px] text-white/45">
                  <div>{e.responseType}</div>
                  <div className="tabular-nums">
                    aMove {e.activationAtMove.toFixed(2)}
                    {e.activationAtOutcome !== undefined ? ` → aOut ${e.activationAtOutcome.toFixed(2)}` : ''}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-2 text-[10px] text-white/35">
        Toggle: add <span className="font-mono">?telemetry=1</span>
      </div>
    </div>
  );
}
