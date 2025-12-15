// frontend: components/admin/opus-pulse/FacetElementGrid.tsx

'use client';

import { useEffect, useState } from 'react';

interface FacetCell {
  facet: string;
  element: string;
  total: number;
  gold: number;
  edge: number;
  rupture: number;
}

export default function FacetElementGrid() {
  const [cells, setCells] = useState<FacetCell[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/opus-pulse/facet-heatmap');
        if (!res.ok) return;
        const data = await res.json();
        setCells(data.cells || []);
      } catch (e) {
        console.error('Failed to load facet heatmap', e);
      }
    }

    load();
  }, []);

  return (
    <div className="rounded-xl border p-4 space-y-2">
      <h2 className="text-lg font-medium">Facet × Element</h2>
      <p className="text-xs text-muted-foreground">
        Gold / Edge / Rupture distribution across the Spiralogic map.
      </p>

      {cells.length === 0 ? (
        <div className="text-xs text-muted-foreground mt-4">
          No Opus data yet. Once MAIA has a few conversations, this will fill in.
        </div>
      ) : (
        <div className="mt-4 space-y-1 text-xs max-h-[260px] overflow-y-auto">
          {cells.map((c) => (
            <div key={`${c.facet}-${c.element}`} className="flex justify-between">
              <span>
                {c.facet} · {c.element}
              </span>
              <span>
                G:{c.gold} · E:{c.edge} · R:{c.rupture} · T:{c.total}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
