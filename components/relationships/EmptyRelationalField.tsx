'use client';

interface EmptyRelationalFieldProps {
  onAddPerson: () => void;
  onAddInner: () => void;
  onStartFromMind: () => void;
}

export default function EmptyRelationalField({ onAddPerson, onAddInner, onStartFromMind }: EmptyRelationalFieldProps) {
  return (
    <div className="max-w-xl mx-auto py-20 text-center">
      <h2 className="text-2xl font-extralight text-jade-jade tracking-wide mb-4">
        Your Relational Field
      </h2>
      <p className="text-jade-mineral font-light leading-relaxed mb-12">
        This is where the living patterns of your relationships — outer and inner — become visible.
      </p>

      <div className="space-y-4 mb-16">
        <button
          onClick={onStartFromMind}
          className="w-full max-w-sm mx-auto block px-6 py-4 rounded-lg border border-jade-sage/40 bg-jade-forest/25 hover:bg-jade-forest/35 transition-colors text-left"
        >
          <div className="text-jade-jade font-light mb-1">Start with what is on your mind</div>
          <div className="text-xs text-jade-mineral">Something is present. Name it, and the field will form around it.</div>
        </button>

        <button
          onClick={onAddPerson}
          className="w-full max-w-sm mx-auto block px-6 py-4 rounded-lg border border-jade-sage/30 bg-jade-forest/20 hover:bg-jade-forest/30 transition-colors text-left"
        >
          <div className="text-jade-jade font-light mb-1">Add a person</div>
          <div className="text-xs text-jade-mineral">Someone in your life. Begin mapping the field between you.</div>
        </button>

        <button
          onClick={onAddInner}
          className="w-full max-w-sm mx-auto block px-6 py-4 rounded-lg border border-jade-sage/30 bg-jade-forest/20 hover:bg-jade-forest/30 transition-colors text-left"
        >
          <div className="text-jade-jade font-light mb-1">Meet an inner figure</div>
          <div className="text-xs text-jade-mineral">An archetype, inner part, or voice within. Name what you are in relation to.</div>
        </button>

        {/* Deliberately NOT an affordance — there is nothing here to press. It
            was styled exactly like the three buttons above it (same border,
            same panel, same shape, merely dimmed) and so read as a disabled
            option, which made the page look partly broken. It is a plain
            sentence now: something that happens on its own, described rather
            than offered. */}
        <p className="max-w-sm mx-auto text-xs text-jade-mineral/70 font-light leading-relaxed pt-2">
          Or simply talk with MAIA. Relational threads surface on their own — you
          don&apos;t have to set anything up first.
        </p>
      </div>

      <div className="w-16 h-px bg-gradient-to-r from-transparent via-jade-sage/30 to-transparent mx-auto mb-6" />
      <p className="text-xs text-jade-mineral/60 font-light italic max-w-xs mx-auto">
        A relationship is not only between two people. It is the third thing that forms when two lives meet.
      </p>
    </div>
  );
}
