// frontend: components/admin/opus-pulse/OpusTimeline.tsx

'use client';

import { useEffect, useState } from 'react';

interface OpusTimelineItem {
  id: number;
  timestamp: string;
  facet?: string | null;
  element?: string | null;
  isGold: boolean;
  warnings: number;
  violations: number;
  ruptureDetected: boolean;
  userPreview: string;
  maiaPreview: string;
}

export default function OpusTimeline() {
  const [items, setItems] = useState<OpusTimelineItem[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/opus-pulse/turns');
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.items || []);
      } catch (e) {
        console.error('Failed to load Opus turns', e);
      }
    }

    load();
  }, []);

  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Recent Turns</h2>
        <span className="text-xs text-muted-foreground">Latest Opus evaluations</span>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto text-sm">
        {items.length === 0 && (
          <div className="text-xs text-muted-foreground">
            No Opus Axiom data yet. Talk to MAIA, then refresh.
          </div>
        )}

        {items.map((item) => (
          <div
            key={item.id}
            className="border rounded-lg p-2 hover:bg-muted/40 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {new Date(item.timestamp).toLocaleString()}
              </div>
              <div className="flex items-center gap-2 text-xs">
                {item.facet && (
                  <span className="px-2 py-0.5 rounded-full border">
                    {item.facet}
                  </span>
                )}
                {item.element && (
                  <span className="px-2 py-0.5 rounded-full border">
                    {item.element}
                  </span>
                )}
                <span
                  className={
                    item.ruptureDetected
                      ? 'text-red-500'
                      : item.warnings > 0
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                  }
                >
                  {item.ruptureDetected
                    ? 'Rupture risk'
                    : item.warnings > 0
                    ? 'Edge'
                    : 'Gold'}
                </span>
              </div>
            </div>

            <div className="mt-1">
              <div className="text-[11px] text-muted-foreground">
                User: {item.userPreview}
              </div>
              <div className="text-[11px]">
                MAIA: {item.maiaPreview}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
