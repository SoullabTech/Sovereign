// components/astrology/synastry/SynastryHighlights.tsx

'use client';

import { Sparkles } from 'lucide-react';

type Highlight = {
  aBody?: string;
  bBody?: string;
  aspect?: string;
  summary?: string;
  interpretation?: string;
  label?: string;
};

function getAspectIcon(aspect: string | undefined): string {
  if (!aspect) return '✦';
  switch (aspect.toLowerCase()) {
    case 'conjunction': return '☌';
    case 'opposition': return '☍';
    case 'trine': return '△';
    case 'square': return '□';
    case 'sextile': return '⚹';
    default: return '✦';
  }
}

export default function SynastryHighlights({ highlights }: { highlights: Record<string, unknown>[] }) {
  const items = highlights as Highlight[];

  return (
    <div className="rounded-2xl border border-dune-bene-gesserit-gold/30 bg-black/40 backdrop-blur-md p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-dune-bene-gesserit-gold" />
        <h3 className="text-lg font-semibold text-dune-dune-amber">Highlights</h3>
      </div>

      {(!items || items.length === 0) ? (
        <div className="text-sm text-dune-spice-sand/50 italic">No highlights returned.</div>
      ) : (
        <div className="space-y-3">
          {items.map((h, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-dune-spice-sand/10 bg-black/30 p-4 hover:border-dune-bene-gesserit-gold/30 transition-colors"
            >
              <div className="text-sm font-semibold text-dune-dune-amber mb-2">
                <span className="text-dune-bene-gesserit-gold mr-2">
                  {getAspectIcon(h.aspect)}
                </span>
                {h.aBody ? `${h.aBody} ` : ''}
                {h.aspect ? `${h.aspect} ` : ''}
                {h.bBody ?? ''}
                {!h.aBody && !h.aspect && !h.bBody && h.label ? h.label : ''}
              </div>

              {h.summary && (
                <p className="text-sm text-dune-spice-sand/80 leading-relaxed">
                  {h.summary}
                </p>
              )}

              {!h.summary && h.interpretation && (
                <p className="text-sm text-dune-spice-sand/80 leading-relaxed">
                  {h.interpretation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
