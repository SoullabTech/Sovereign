/**
 * Book Studio — "What in your Living Field is ready to become writing?"
 *
 * A READ-ONLY mirror surface. It shows the member their own material — kept,
 * marked, named — each fragment attributed to the member act that produced it.
 * It writes nothing and it authors nothing.
 *
 * Constitutional boundary (Refusal R06): this page reads member material ONLY
 * through `getWritableMaterial` (lib/bookStudio/mirrorSources.ts, the single
 * audited choke point). It never queries member tables directly and never
 * re-ranks by inferred relevance — the ordering it renders is the reader's own
 * member-act-time order (deciding what is "most ready" would be a MEANING
 * judgment MAIA must not make; see the reader's change-classification docblock).
 *
 * v0: founder-gated, matching the rest of Book Studio. Read before arrange —
 * dragging this material into a manuscript comes later via the Workbench Shelf.
 */

import { redirect } from 'next/navigation';
import { requireFounder } from '@/lib/founder/founderAuth';
import FounderGateScreen from '@/components/book-studio/FounderGateScreen';
import {
  getWritableMaterial,
  type MirrorSource,
} from '@/lib/bookStudio/mirrorSources';

export const dynamic = 'force-dynamic';

function formatWhen(when: Date | string): string {
  const d = when instanceof Date ? when : new Date(when);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function MaterialCard({ m }: { m: MirrorSource }) {
  const hasDistinctTitle = m.title && m.title.trim() && m.title.trim() !== m.text.trim();
  return (
    <li className="py-6 border-b border-amber-300/10">
      {/* Provenance attribution — the constitutional heart of this surface.
          Every fragment is named as the member's own act, never presented as
          MAIA's observation. */}
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-amber-300/80 text-[11px] tracking-[0.2em] uppercase">
          {m.memberActLabel}
        </span>
        <span className="text-amber-200/35 text-[11px] font-light">
          {formatWhen(m.memberActAt)}
        </span>
      </div>

      {hasDistinctTitle && (
        <h3 className="text-amber-100/90 text-lg font-light leading-snug mb-1">
          {m.title}
        </h3>
      )}

      <p className="text-amber-100/75 text-base font-light leading-relaxed whitespace-pre-wrap">
        {m.text}
      </p>
    </li>
  );
}

export default async function ReadyToWritePage() {
  const auth = await requireFounder();
  if (!auth.ok) {
    if (auth.status === 401) {
      redirect('/signin?next=/book-studio/ready-to-write');
    }
    return <FounderGateScreen />;
  }

  const material = await getWritableMaterial(auth.memberId);

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-amber-100/90 text-3xl md:text-4xl font-light tracking-wide leading-tight mb-3">
          What in your Living Field is ready to become writing?
        </h1>
        <p className="text-amber-200/55 text-base font-light italic leading-relaxed max-w-2xl">
          These are your own words — kept, marked, named. Nothing here was written
          for you, and nothing here is a conclusion about you. It is only what you
          have already set down, gathered in one place, ready when you are.
        </p>
      </header>

      {material.length === 0 ? (
        <div className="py-10">
          <p className="text-amber-200/45 text-base font-light italic leading-relaxed max-w-2xl">
            Nothing yet. When you keep a reflection, mark a breakthrough, or name a
            spiral, it will appear here — in your own words. This surface stays empty
            until you have set something down. It never fills itself.
          </p>
        </div>
      ) : (
        <>
          <div className="text-amber-200/40 text-[11px] tracking-[0.25em] uppercase mb-2">
            {material.length} {material.length === 1 ? 'thing' : 'things'} you have set down
          </div>
          <ul>
            {material.map((m) => (
              <MaterialCard key={`${m.origin.table}:${m.id}`} m={m} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
