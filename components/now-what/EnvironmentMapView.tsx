'use client';

/**
 * Now What? — Environment map, shared view.
 *
 * Two clearances over the SAME structure:
 *   viewer="member"        → /now-what/map. The member's map of the rooms.
 *   viewer="practitioner"  → /studio/environment. The practitioner's map of
 *                            his own architecture: which rooms exist, which
 *                            are open, what each does for his clients.
 *
 * Walk-corrected 2026-07-12 (Kelly, first founder walk): the original
 * artifact-derived design failed inside the member's path — sage/serif
 * atmosphere read as a different product than the navy field, "The door"
 * linked a signed-in member OUT to the public landing, and the name
 * flipped ("What Now?" vs the room's "Now What?"). Now: navy field
 * atmosphere, room-register naming, no exit to marketing, concrete lines.
 *
 * Doctrine line, load-bearing: the practitioner sees the STRUCTURE of
 * holding, never what's held. This component fetches no member data on
 * either clearance — the boundary is structural, not disciplinary.
 *
 * PRESENCE TIERS (sitting-gated — do not render tiers 2–3 here):
 *   1. Structure only — rooms + open/closed. Ships with this component.
 *   2. Anonymous aliveness — telemetry-adjacent; the catalog spec's posture
 *      (declined confirmation writes nothing) suggests the constitution is
 *      allergic to ambient presence-tracking. NOT rendered pending a ruling.
 *   3. Presence — who holds a position row. Unruled: arrival-not-roster
 *      governs enrollment; Client Sovereignty covers content, not presence.
 *      NOT rendered pending a ruling.
 *
 * WIRING: null route renders "not yet open" — opening a door is a one-line
 * change; no route is ever guessed.
 *
 * GATE NOTE (do not remove until the sitting rules): MEMBER trust copy
 * ships only with the store-boundary guard, as one act (counsel Addendum
 * §D). Placeholder marked TRUST_COPY. The practitioner clearance line is
 * NOT that copy: it states what this page shows, true by construction.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type RoomDef = {
  key: string;
  name: string;
  line: string;
  route: string | null; // null = not yet open; never guessed
  carriesContext?: boolean; // append ?fieldContext= when present
  primary?: boolean; // arc ruling 2026-07-12: Session room carries primary
  // weight — every arc's center of gravity today. Per-arc foregrounding is
  // deliberately NOT built (waits on doors-as-arc-context + round-2 §G).
};

// RESERVED SLOT (ruling 2026-07-12): "The door" card was dropped as an impostor —
// it wired a signed-in member out to the public landing. The outward face of the
// building is not a room in it. Its position is reserved for REAL program doors
// (arrive / return / depart) when the catalog builds (Gate 1) — the door a member
// arrived through IS their arc context. Do not re-add a card that routes to
// /now-what/welcome; if shareability matters later, it's a footer link, not a door.
const OPEN_ROOMS: RoomDef[] = [
  {
    key: 'room',
    name: 'Session room',
    line: 'Sit with MAIA. Bring the actual thing — work with it until a next real step appears.',
    route: '/now-what/room',
    carriesContext: true,
    primary: true,
  },
  {
    key: 'field',
    name: 'Your field',
    line: 'Everything you chose to keep — threads, practices, offerings — in your own words.',
    route: '/now-what/field',
    carriesContext: true,
  },
];

const COMING_ROOMS: RoomDef[] = [
  { key: 'position', name: 'Where you are', line: 'If you came in through a program, this shows where you stand in it.', route: null },
  { key: 'next', name: 'What may be next', line: 'Held open, not prescribed.', route: null },
  { key: 'questions', name: "Questions you're living", line: 'The ones you named, kept warm.', route: null },
  { key: 'themes', name: 'Themes', line: 'Patterns you pull, never pushed.', route: null },
  { key: 'reflections', name: 'Reflections', line: "MAIA's mirror, only when you ask.", route: null },
];

type Viewer = 'member' | 'practitioner';

// Member: the field's own navy atmosphere (matches room + field pages).
// Practitioner: the Studio's dark shell with amber accents.
const ACCENT = { member: '#ffe27a', practitioner: '#f59e0b' } as const;

function DoorCard({ room, viewer, fieldContext }: { room: RoomDef; viewer: Viewer; fieldContext?: string }) {
  const open = Boolean(room.route);
  const accent = ACCENT[viewer];
  const href =
    room.route && room.carriesContext && fieldContext
      ? `${room.route}?fieldContext=${encodeURIComponent(fieldContext)}`
      : room.route ?? undefined;

  const cardClass = open
    ? `block rounded-md border bg-white/[0.03] transition-colors hover:bg-white/[0.05] ${
        room.primary
          ? 'border-slate-400 hover:border-slate-300 p-8 sm:col-span-2'
          : 'border-slate-600 hover:border-slate-400 p-6'
      }`
    : // "Taking shape" opacity is a CLAIM-DISCIPLINE dial, not a style one
      // (ruling frame 2026-07-12): these are the page's only forward-looking
      // claims. Too loud = promising rooms ahead of their builds; too faint =
      // underclaiming a genuinely growing environment ("abandoned" where the
      // truth is "forming"). Test: a first-time member notices them ONCE —
      // "this place is still growing" — then not again until one opens.
      'rounded-md border border-dashed border-slate-700 p-6';

  const inner = (
    <>
      <p className={`font-light mb-2 ${room.primary ? 'text-lg' : 'text-base'} ${open ? 'text-slate-100' : 'text-slate-400'}`}>
        {room.name}
      </p>
      <p className={`text-sm font-light leading-relaxed ${open ? 'text-slate-400' : 'text-slate-500'}`}>
        {room.line}
      </p>
      <p className="mt-4 text-xs font-light tracking-wide">
        {open ? (
          <span style={{ color: accent }}>
            {viewer === 'practitioner' ? 'open — walk it' : 'enter →'}
          </span>
        ) : (
          <span className="text-slate-600">taking shape</span>
        )}
      </p>
    </>
  );

  if (open && href) {
    return (
      <a href={href} className={cardClass}>
        {inner}
      </a>
    );
  }
  return <div className={cardClass}>{inner}</div>;
}

function EnvironmentMapInner({ viewer }: { viewer: Viewer }) {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const isPractitioner = viewer === 'practitioner';
  const accent = ACCENT[viewer];

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em]" style={{ color: accent }}>
          {isPractitioner ? 'Now What? — your environment' : 'Now What?'}
        </p>
        <h1 className="text-slate-100 text-xl font-light">
          {isPractitioner ? 'The environment you hold.' : 'The rooms here, and what each one is for.'}
        </h1>
        {isPractitioner ? (
          // Clearance statement, not trust copy: describes what THIS page
          // shows, true by construction (no member data fetched, either view).
          <p className="text-slate-500 text-sm font-light leading-relaxed max-w-prose">
            This map shows structure — rooms, doors, what is open. It shows
            nothing of what any member has placed inside them.
          </p>
        ) : (
          <p className="text-slate-500 text-sm font-light leading-relaxed max-w-prose">
            Start in the session room. What you choose to keep gathers in your
            field. More rooms open as they are ready.
          </p>
        )}
        {/* TRUST_COPY — sitting-gated; ships with the store-boundary guard as one act. */}
      </header>

      <section aria-label="Rooms open now" className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-slate-400">Open now</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {OPEN_ROOMS.map((r) => (
            <DoorCard key={r.key} room={r} viewer={viewer} fieldContext={fieldContext} />
          ))}
        </div>
      </section>

      <section aria-label="Rooms taking shape" className="space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-slate-600">Taking shape</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {COMING_ROOMS.map((r) => (
            <DoorCard key={r.key} room={r} viewer={viewer} fieldContext={fieldContext} />
          ))}
        </div>
      </section>

      <footer className="pt-6 border-t border-slate-800">
        <p className="text-slate-600 text-sm font-light italic">
          {isPractitioner
            ? 'Rooms open as they are ready. The structure is yours; what happens inside it is theirs.'
            : 'Nothing here rushes you.'}
        </p>
      </footer>
    </div>
  );
}

export default function EnvironmentMapView({ viewer }: { viewer: Viewer }) {
  const shell =
    viewer === 'practitioner'
      ? 'min-h-full text-slate-200' // studio layout provides the dark shell
      : 'min-h-screen bg-[#062a42] text-slate-200';

  return (
    <div className={shell}>
      <Suspense fallback={null}>
        <EnvironmentMapInner viewer={viewer} />
      </Suspense>
    </div>
  );
}
