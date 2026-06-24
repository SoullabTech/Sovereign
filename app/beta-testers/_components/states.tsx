'use client';

/** Shared calm loading / empty states for the learning field's data sections. */

export function Loading() {
  return (
    <div className="py-16 text-center text-sm text-zinc-600">
      <span className="animate-pulse">Loading…</span>
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-zinc-500">
      {text}
    </div>
  );
}
