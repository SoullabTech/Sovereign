'use client';

// Matches CANONICAL_TONES from lib/consciousness/relationalCheckin.ts
const TONE_COLORS: Record<string, string> = {
  open: 'bg-stone-300/60',
  contracted: 'bg-stone-900/60',
  unclear: 'bg-stone-600/30',
  tense: 'bg-red-400/40',
  warm: 'bg-amber-400/60',
  distant: 'bg-stone-600/40',
  fragile: 'bg-amber-300/40',
  active: 'bg-amber-600/60',
  quiet: 'bg-stone-500/40',
  unresolved: 'bg-amber-700/40',
};

export default function FieldToneIndicator({
  tone,
  size = 'sm',
}: {
  tone: string | null | undefined;
  size?: 'sm' | 'md';
}) {
  if (!tone) return null;

  const colorClass = TONE_COLORS[tone.toLowerCase()] || TONE_COLORS.unclear;
  const sizeClass = size === 'md' ? 'w-3 h-3' : 'w-2 h-2';

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`${sizeClass} rounded-full ${colorClass}`} />
      <span className="text-xs text-stone-400 capitalize">{tone.replace(/_/g, ' ')}</span>
    </span>
  );
}
