'use client';

export interface RelationshipSummary {
  id: string;
  name: string;
  realm: 'outer' | 'inner' | 'transpersonal';
  bondType: string | null;
  note: string | null;
  fieldTone: string | null;
  activeSignals: string[] | null;
  lastCheckinAt: string | null;
  createdAt: string;
}

export default function RelationshipCard({
  relationship,
  onClick,
}: {
  relationship: RelationshipSummary;
  onClick: () => void;
}) {
  const realmLabel = {
    outer: null,
    inner: 'inner figure',
    transpersonal: 'larger field',
  }[relationship.realm];

  const descriptor = relationship.bondType
    ? relationship.bondType.replace(/_/g, ' ')
    : realmLabel;

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-2xl border border-jade-sage/12 bg-jade-forest/[0.05] px-5 py-5 transition-all duration-300 hover:border-jade-sage/25 hover:bg-jade-forest/[0.10]"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0 flex-1">
          <div className="text-lg font-light tracking-wide text-jade-jade transition-colors group-hover:text-jade-sage">
            {relationship.name}
          </div>
          {descriptor && (
            <div className="mt-1 text-xs capitalize tracking-wide text-jade-mineral/70">
              {descriptor}
            </div>
          )}
          {relationship.note && (
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-jade-mineral/75">
              {relationship.note}
            </p>
          )}
        </div>

        <span className="mt-1 text-jade-mineral/30 transition-all duration-300 group-hover:translate-x-1 group-hover:text-jade-sage/70">
          →
        </span>
      </div>
    </button>
  );
}
