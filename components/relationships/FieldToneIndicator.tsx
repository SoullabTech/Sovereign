'use client';

// Matches CANONICAL_TONES from lib/consciousness/relationalCheckin.ts
const TONE_COLORS: Record<string, string> = {
  open: 'bg-[#718c72]/60',
  contracted: 'bg-[#e4eadf]/60',
  unclear: 'bg-jade-mineral/30',
  tense: 'bg-red-400/40',
  warm: 'bg-amber-400/60',
  distant: 'bg-jade-mineral/40',
  fragile: 'bg-amber-300/40',
  active: 'bg-[#83a88f]/60',
  quiet: 'bg-[#cdd8c4]/40',
  unresolved: 'bg-[#d5b28c]/40',
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
      <span className="text-xs text-[#716d64] capitalize">{tone.replace(/_/g, ' ')}</span>
    </span>
  );
}
