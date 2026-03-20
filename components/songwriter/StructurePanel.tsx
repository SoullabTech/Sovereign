'use client';

interface StructurePanelProps {
  structure: string[];
  coreStatement: string;
}

export function StructurePanel({ structure, coreStatement }: StructurePanelProps) {
  return (
    <section>
      <h2
        className="text-sm font-light tracking-widest text-white/40 uppercase mb-4"
        style={{ fontFamily: 'Spectral, Georgia, serif' }}
      >
        Structure
      </h2>

      {/* Section sequence */}
      <div className="flex flex-wrap gap-2 mb-5">
        {structure.map((section, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className="px-3 py-1.5 bg-white/[0.03] border border-white/[0.07] rounded-full
                         text-white/60 text-xs"
              style={{ fontFamily: 'Spectral, Georgia, serif' }}
            >
              {section}
            </span>
            {i < structure.length - 1 && (
              <span className="text-white/15 text-xs">→</span>
            )}
          </span>
        ))}
      </div>

      {/* Core statement */}
      <div className="border-t border-white/[0.06] pt-4">
        <div
          className="text-xs uppercase tracking-widest text-amber-400/30 mb-2"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          What this song is saying
        </div>
        <p
          className="text-white/50 text-sm leading-relaxed italic"
          style={{ fontFamily: 'Spectral, Georgia, serif' }}
        >
          {coreStatement}
        </p>
      </div>
    </section>
  );
}
