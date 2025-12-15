// frontend: components/admin/opus-pulse/GlobalOpusPulse.tsx

'use client';

import { useEffect, useState } from 'react';

interface GlobalPulseStats {
  goldPercent: number;
  warningPercent: number;
  rupturePercent: number;
  totalTurns: number;
}

export default function GlobalOpusPulse() {
  const [stats, setStats] = useState<GlobalPulseStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/opus-pulse/summary');
        if (!res.ok) return;
        const data = await res.json();

        setStats({
          goldPercent: data.percentages.goldPercent,
          warningPercent: data.percentages.edgePercent,
          rupturePercent: data.percentages.rupturePercent,
          totalTurns: data.counts.total,
        });
      } catch (e) {
        console.error('Failed to load Opus summary', e);
      }
    }

    load();
  }, []);

  return (
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Global Opus Pulse</h2>
        <span className="text-xs text-muted-foreground">Last 30 days</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="text-xs uppercase text-muted-foreground">Gold</div>
          <div className="text-2xl font-semibold">
            {stats ? `${Math.round(stats.goldPercent)}%` : '–'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase text-muted-foreground">Edge</div>
          <div className="text-2xl font-semibold">
            {stats ? `${Math.round(stats.warningPercent)}%` : '–'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-xs uppercase text-muted-foreground">Rupture Risk</div>
          <div className="text-2xl font-semibold">
            {stats ? `${Math.round(stats.rupturePercent)}%` : '–'}
          </div>
        </div>
      </div>
    </div>
  );
}
