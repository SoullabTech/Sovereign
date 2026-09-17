'use client';

interface EmptyRelationalFieldProps {
  onAddPerson: () => void;
  onAddInner: () => void;
  onStartFromMind: () => void;
}

export default function EmptyRelationalField({ onAddPerson, onAddInner, onStartFromMind }: EmptyRelationalFieldProps) {
  return (
    <div className="mx-auto max-w-2xl py-8 md:py-12">
      <div className="space-y-3">
        <button
          onClick={onStartFromMind}
          className="group w-full rounded-2xl border border-jade-sage/18 bg-jade-forest/[0.06] px-6 py-6 text-left transition-all hover:border-jade-sage/30 hover:bg-jade-forest/[0.11]"
        >
          <div className="text-base font-light text-jade-jade">Start with what is on your mind</div>
          <div className="mt-1.5 text-sm font-light leading-relaxed text-jade-mineral/70">
            Something is present. Name it, and the field can form around it.
          </div>
        </button>

        <button
          onClick={onAddPerson}
          className="group w-full rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.04] px-6 py-6 text-left transition-all hover:border-jade-sage/25 hover:bg-jade-forest/[0.09]"
        >
          <div className="text-base font-light text-jade-jade">Bring someone into view</div>
          <div className="mt-1.5 text-sm font-light leading-relaxed text-jade-mineral/65">
            Someone in your life whose presence, absence, closeness, distance, or change matters now.
          </div>
        </button>

        <button
          onClick={onAddInner}
          className="group w-full rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.04] px-6 py-6 text-left transition-all hover:border-jade-sage/25 hover:bg-jade-forest/[0.09]"
        >
          <div className="text-base font-light text-jade-jade">Meet an inner figure</div>
          <div className="mt-1.5 text-sm font-light leading-relaxed text-jade-mineral/65">
            An archetype, inner part, or voice within. Name what you find yourself in relationship to.
          </div>
        </button>
      </div>

      <div className="mx-auto mt-16 h-px w-20 bg-gradient-to-r from-transparent via-jade-sage/25 to-transparent" />
      <p className="mx-auto mt-6 max-w-md text-center text-xs font-light italic leading-relaxed text-jade-mineral/55">
        A relationship is not only between two people. It is the third thing that forms when two lives meet.
      </p>
    </div>
  );
}
