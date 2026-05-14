'use client';

const stages = [
  { label: 'Just arrived', sub: 'First encounter with the work' },
  { label: 'Sitting with it', sub: 'Reading, listening, absorbing' },
  { label: 'Testing it', sub: 'Bringing it into lived experience' },
  { label: 'Living it', sub: 'The work is reorganising something' },
  { label: 'Sharing it', sub: 'Contributing to others in the field' },
];

export function OrientationMirror() {
  return (
    <div className="rounded-2xl border border-maia-navy-700 bg-maia-navy-900 p-6">
      <p className="mb-4 text-sm text-maia-ink-60 italic">
        Where are you in this work?
      </p>
      <div className="flex flex-wrap gap-2">
        {stages.map((s) => (
          <div
            key={s.label}
            title={s.sub}
            className="rounded-full border border-maia-navy-600 px-3 py-1.5 text-sm text-maia-ink-60 cursor-default select-none"
          >
            {s.label}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-maia-ink-40">
        This is not tracked. It is a mirror, not a measure.
      </p>
    </div>
  );
}
