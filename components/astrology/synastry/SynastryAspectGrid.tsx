// components/astrology/synastry/SynastryAspectGrid.tsx

'use client';

import { useState } from 'react';

type Aspect = {
  aBody: string;
  bBody: string;
  aspect: string;
  orbDeg: number;
  strength: number;
  polarity?: 'harmony' | 'friction' | 'neutral';
  label?: string;
  interpretation?: string;
};

function getAspectIcon(aspect: string): string {
  switch (aspect.toLowerCase()) {
    case 'conjunction': return '☌';
    case 'opposition': return '☍';
    case 'trine': return '△';
    case 'square': return '□';
    case 'sextile': return '⚹';
    default: return '○';
  }
}

function getAspectColor(aspect: string): string {
  switch (aspect.toLowerCase()) {
    case 'conjunction': return 'text-dune-spice-orange';
    case 'opposition': return 'text-red-400';
    case 'trine': return 'text-dune-atreides-green';
    case 'square': return 'text-red-400';
    case 'sextile': return 'text-dune-fremen-azure';
    default: return 'text-dune-spice-sand';
  }
}

export default function SynastryAspectGrid({ aspects }: { aspects: Aspect[] }) {
  const [selected, setSelected] = useState<Aspect | null>(null);

  return (
    <div className="rounded-2xl border border-dune-spice-sand/20 bg-black/40 backdrop-blur-md overflow-hidden">
      <div className="border-b border-dune-spice-sand/10 px-5 py-3 text-sm text-dune-spice-sand/70">
        Aspects ({aspects.length})
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Table section */}
        <div className="lg:col-span-7">
          <div className="max-h-[520px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-black/80 text-dune-spice-sand/70 border-b border-dune-spice-sand/10">
                <tr>
                  <th className="px-4 py-3 font-medium">A</th>
                  <th className="px-4 py-3 font-medium">Aspect</th>
                  <th className="px-4 py-3 font-medium">B</th>
                  <th className="px-4 py-3 font-medium text-right">Orb</th>
                  <th className="px-4 py-3 font-medium text-right">Strength</th>
                </tr>
              </thead>
              <tbody>
                {aspects.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-dune-spice-sand/50">
                      No aspects match your filters.
                    </td>
                  </tr>
                ) : (
                  aspects.map((a, i) => {
                    const isActive = selected === a;
                    return (
                      <tr
                        key={`${a.aBody}-${a.aspect}-${a.bBody}-${i}`}
                        className={`cursor-pointer border-t border-dune-spice-sand/5 hover:bg-dune-spice-sand/5 transition-colors ${
                          isActive ? 'bg-dune-spice-orange/10' : ''
                        }`}
                        onClick={() => setSelected(a)}
                      >
                        <td className="px-4 py-3 font-medium text-dune-dune-amber">{a.aBody}</td>
                        <td className="px-4 py-3">
                          <span className={`${getAspectColor(a.aspect)} text-lg mr-2`}>
                            {getAspectIcon(a.aspect)}
                          </span>
                          <span className="text-dune-spice-sand/80 capitalize">{a.aspect}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-dune-dune-amber">{a.bBody}</td>
                        <td className="px-4 py-3 tabular-nums text-right text-dune-spice-sand/70">
                          {Number(a.orbDeg ?? 0).toFixed(2)}°
                        </td>
                        <td className="px-4 py-3 tabular-nums text-right text-dune-spice-sand/70">
                          {Number(a.strength ?? 0).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-5 border-t border-dune-spice-sand/10 lg:border-t-0 lg:border-l">
          <div className="p-5">
            <div className="text-sm text-dune-spice-sand/60 mb-3">Selected Aspect</div>
            {!selected ? (
              <div className="text-sm text-dune-spice-sand/50 italic">
                Click an aspect row to inspect it.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xl font-semibold text-dune-dune-amber">
                  <span className={`${getAspectColor(selected.aspect)} text-2xl mr-2`}>
                    {getAspectIcon(selected.aspect)}
                  </span>
                  {selected.aBody} {selected.aspect} {selected.bBody}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-black/30 border border-dune-spice-sand/10 p-3">
                    <div className="text-xs text-dune-spice-sand/50 mb-1">Orb</div>
                    <div className="text-lg font-semibold tabular-nums text-dune-spice-orange">
                      {Number(selected.orbDeg ?? 0).toFixed(2)}°
                    </div>
                  </div>
                  <div className="rounded-xl bg-black/30 border border-dune-spice-sand/10 p-3">
                    <div className="text-xs text-dune-spice-sand/50 mb-1">Strength</div>
                    <div className="text-lg font-semibold tabular-nums text-dune-fremen-azure">
                      {Number(selected.strength ?? 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {selected.polarity && (
                  <div className="rounded-xl bg-black/30 border border-dune-spice-sand/10 p-3">
                    <div className="text-xs text-dune-spice-sand/50 mb-1">Polarity</div>
                    <div className={`font-medium capitalize ${
                      selected.polarity === 'harmony' ? 'text-dune-atreides-green' :
                      selected.polarity === 'friction' ? 'text-red-400' :
                      'text-dune-spice-sand'
                    }`}>
                      {selected.polarity}
                    </div>
                  </div>
                )}

                {selected.label && (
                  <div className="rounded-xl bg-black/30 border border-dune-bene-gesserit-gold/30 p-4">
                    <div className="text-sm font-medium text-dune-bene-gesserit-gold">
                      {selected.label}
                    </div>
                  </div>
                )}

                {selected.interpretation && (
                  <div className="text-sm leading-relaxed text-dune-spice-sand/80">
                    {selected.interpretation}
                  </div>
                )}

                <div className="pt-2 text-xs text-dune-spice-sand/40 italic">
                  (Later) Connect this to dual-wheel chart highlight.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
