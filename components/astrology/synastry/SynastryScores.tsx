// components/astrology/synastry/SynastryScores.tsx

'use client';

function ScoreRow({ label, value, color }: { label: string; value: number; color: string }) {
  const v = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, v * 10)); // Normalize to percentage (0-10 scale → 0-100%)

  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm">
        <span className="text-dune-spice-sand/70 capitalize">{label}</span>
        <span className="tabular-nums text-dune-dune-amber">{v.toFixed(2)}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-dune-spice-sand/10">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const scoreColors: Record<string, string> = {
  attraction: 'bg-dune-spice-orange',
  harmony: 'bg-dune-atreides-green',
  friction: 'bg-red-400',
  growth: 'bg-dune-fremen-azure',
  passion: 'bg-dune-spice-glow',
  stability: 'bg-dune-bene-gesserit-gold',
  communication: 'bg-dune-navigator-purple',
};

export default function SynastryScores({ scores }: { scores: Record<string, number> }) {
  const scoreKeys = Object.keys(scores);

  return (
    <div className="rounded-2xl border border-dune-spice-orange/30 bg-black/40 backdrop-blur-md p-5">
      <h3 className="text-lg font-semibold text-dune-dune-amber mb-4">Compatibility Scores</h3>

      {scoreKeys.length === 0 ? (
        <div className="text-sm text-dune-spice-sand/50 italic">No scores computed.</div>
      ) : (
        <div className="space-y-4">
          {scoreKeys.map((key) => (
            <ScoreRow
              key={key}
              label={key}
              value={scores[key] ?? 0}
              color={scoreColors[key.toLowerCase()] ?? 'bg-dune-spice-sand/50'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
