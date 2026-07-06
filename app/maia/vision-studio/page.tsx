'use client';

/**
 * Vision Studio
 *
 * Two surfaces under one roof:
 *   tab=field   (default) — Spiralogic Interview: member develops their Living Field
 *   tab=practice          — Practice Field Editor: practitioner authors their accompaniment context
 *
 * Query params:
 *   tab          — 'field' | 'practice' (default: 'field')
 *   phase        — Spiralogic arc phase (tab=field only, default: fire_1)
 *   fieldContext — opaque context identifier (tab=field only)
 */

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { VisionStudioRoom } from '@/components/maia/vision-studio/VisionStudioRoom';
import { PracticeFieldEditor } from '@/components/maia/practice-field/PracticeFieldEditor';

function VisionStudioInner() {
  const params = useSearchParams();
  const router = useRouter();
  const tab = params?.get('tab') ?? 'vision';
  const phase = params?.get('phase') ?? 'fire_1';
  const fieldContext = params?.get('fieldContext') ?? undefined;
  // program=now-what renders the Now What? workshop loop: single-focus threshold,
  // no tab chrome — nothing competes with the room.
  const program = params?.get('program') ?? undefined;
  const singleFocus = program === 'now-what';

  function switchTab(t: string) {
    if (t === 'living-field') {
      router.push('/maia/living-field');
      return;
    }
    const p = new URLSearchParams(params?.toString() ?? '');
    p.set('tab', t);
    router.replace(`/maia/vision-studio?${p.toString()}`);
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 flex flex-col">
      {/* Tab bar — hidden in single-focus program mode */}
      {!singleFocus && (
        <div className="border-b border-stone-800 px-6 flex gap-6">
          <TabButton label="Living Field" active={false} onClick={() => switchTab('living-field')} />
          <TabButton label="Vision Studio" active={tab === 'vision'} onClick={() => switchTab('vision')} />
          <TabButton label="Practice Field" active={tab === 'practice'} onClick={() => switchTab('practice')} />
        </div>
      )}

      {tab === 'vision' && (
        <VisionStudioRoom phase={phase} fieldContext={fieldContext} program={program} />
      )}
      {tab === 'practice' && (
        <PracticeFieldEditor />
      )}
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`py-3 text-xs uppercase tracking-wider border-b-2 -mb-px transition-colors ${
        active
          ? 'text-stone-200 border-stone-400'
          : 'text-stone-600 border-transparent hover:text-stone-400'
      }`}
    >
      {label}
    </button>
  );
}

export default function VisionStudioPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-600 text-sm font-light">Opening the field…</p>
      </div>
    }>
      <VisionStudioInner />
    </Suspense>
  );
}
