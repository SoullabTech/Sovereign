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
 * Walk-corrected 2026-07-12/13 (Kelly, founder walks): v1 failed atmosphere
 * (sage artifact), v2 failed richness (wireframe minimalism), v3 failed
 * ARCHITECTURE — "you say it is a building with rooms but it looks like
 * words around a field." So the map now DRAWS the building: chambers,
 * corridors, a lit center — an actual floor plan in the environment's own
 * language (holoflower center, radial depth, amber doors). Open rooms are
 * lit and enterable; taking-shape rooms are dashed scaffolding, attached
 * but unlit. The word-index below the drawing is secondary, for clarity
 * and accessibility — the building is the map.
 *
 * Doctrine line, load-bearing: the practitioner sees the STRUCTURE of
 * holding, never what's held. This component fetches no member data on
 * either clearance — the boundary is structural, not disciplinary.
 *
 * PRESENCE TIERS (sitting-gated — do not render tiers 2–3 here):
 *   1. Structure only — rooms + open/closed. Ships with this component.
 *   2. Anonymous aliveness — NOT rendered pending a ruling.
 *   3. Presence (who holds a position row) — NOT rendered pending a ruling.
 *
 * WIRING: null route renders as scaffolding — opening a door is a one-line
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
  carriesContext?: boolean;
  primary?: boolean; // arc ruling 2026-07-12: Session room = every arc's
  // center of gravity. Per-arc foregrounding deliberately NOT built
  // (waits on doors-as-arc-context + round-2 §G).
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
const ACCENT = { member: '#ffe27a', practitioner: '#f59e0b' } as const;

/**
 * The building itself — an SVG floor plan. The session room is the lit
 * center chamber (holoflower heart); Your field is the lit chamber off the
 * east corridor; five taking-shape chambers stand as dashed scaffolding.
 * The arrival arch at the south edge marks where the member came in —
 * it is a mark, not a link (the impostor-door ruling).
 */
function BuildingMap({ viewer, fieldContext }: { viewer: Viewer; fieldContext?: string }) {
  const accent = ACCENT[viewer];
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const enterLabel = viewer === 'practitioner' ? 'open — walk it' : 'enter →';

  const scaffold = 'rgba(148,163,184,0.35)'; // slate-400 @ 35% — dashed chambers
  const scaffoldText = '#8fa0b8';
  const corridor = 'rgba(148,163,184,0.25)';

  return (
    <svg
      viewBox="0 0 700 585"
      className="w-full h-auto"
      role="img"
      aria-label="Map of the Now What? environment: the session room at the center, your field to the east, five rooms taking shape around them"
    >
      <defs>
        <radialGradient id="nwCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,226,122,0.14)" />
          <stop offset="60%" stopColor="rgba(255,226,122,0.05)" />
          <stop offset="100%" stopColor="rgba(255,226,122,0)" />
        </radialGradient>
        <filter id="nwSoft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ————— corridors (drawn first, under the chambers) ————— */}
      {/* center → your field (open: solid) */}
      <line x1="445" y1="255" x2="520" y2="255" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      {/* center → taking-shape chambers (dashed scaffolding) */}
      <line x1="255" y1="255" x2="180" y2="255" stroke={corridor} strokeWidth="1.5" strokeDasharray="4 5" />
      <line x1="298" y1="170" x2="222" y2="128" stroke={corridor} strokeWidth="1.5" strokeDasharray="4 5" />
      <line x1="402" y1="170" x2="478" y2="128" stroke={corridor} strokeWidth="1.5" strokeDasharray="4 5" />
      <line x1="298" y1="340" x2="222" y2="432" stroke={corridor} strokeWidth="1.5" strokeDasharray="4 5" />
      <line x1="402" y1="340" x2="478" y2="432" stroke={corridor} strokeWidth="1.5" strokeDasharray="4 5" />
      {/* arrival corridor from the south arch to the center */}
      <line x1="350" y1="500" x2="350" y2="350" stroke={corridor} strokeWidth="2" />

      {/* ————— arrival arch (a mark, not a link — impostor-door ruling) ————— */}
      <path d="M 322 540 A 28 28 0 0 1 378 540" fill="none" stroke={accent} strokeOpacity="0.55" strokeWidth="2" />
      <line x1="322" y1="540" x2="322" y2="524" stroke={accent} strokeOpacity="0.55" strokeWidth="2" />
      <line x1="378" y1="540" x2="378" y2="524" stroke={accent} strokeOpacity="0.55" strokeWidth="2" />
      <text x="350" y="565" textAnchor="middle" fontSize="11" fill={scaffoldText} fontWeight="300">
        you arrived through a door
      </text>

      {/* ————— center chamber: Session room (lit, primary) ————— */}
      <a href={`/now-what/room${ctx}`} className="nw-chamber">
        <circle cx="350" cy="255" r="107" fill="url(#nwCenterGlow)" />
        <circle
          cx="350" cy="255" r="95"
          fill="rgba(255,255,255,0.045)"
          stroke={accent} strokeOpacity="0.65" strokeWidth="1.8"
          filter="url(#nwSoft)"
        />
        <image href="/holoflower.svg" x="298" y="168" width="104" height="104" opacity="0.4" />
        <text x="350" y="292" textAnchor="middle" fontSize="17" fill="#f1f5f9" fontWeight="300">
          Session room
        </text>
        <text x="350" y="312" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="300">
          sit with MAIA
        </text>
        <text x="350" y="333" textAnchor="middle" fontSize="11" fill={accent} letterSpacing="1.5" style={{ textTransform: 'uppercase' }}>
          {enterLabel}
        </text>
      </a>

      {/* ————— east chamber: Your field (lit) ————— */}
      <a href={`/now-what/field${ctx}`} className="nw-chamber">
        <rect
          x="520" y="192" width="164" height="126" rx="14"
          fill="rgba(255,255,255,0.04)"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1.5"
        />
        <text x="602" y="240" textAnchor="middle" fontSize="15" fill="#f1f5f9" fontWeight="300">
          Your field
        </text>
        <text x="602" y="259" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="300">
          what you chose to keep
        </text>
        <text x="602" y="286" textAnchor="middle" fontSize="10.5" fill={accent} letterSpacing="1.5">
          {enterLabel}
        </text>
      </a>

      {/* ————— taking-shape chambers (dashed scaffolding, unlit, no links) ————— */}
      {/* Opacity here is a CLAIM-DISCIPLINE dial: forward-looking claims only.
          Notice-once test — visible as forming rooms, never as promises. */}
      <g>
        <rect x="16" y="192" width="164" height="126" rx="14" fill="rgba(255,255,255,0.015)" stroke={scaffold} strokeWidth="1.3" strokeDasharray="5 5" />
        <text x="98" y="245" textAnchor="middle" fontSize="14" fill="#cbd5e1" fontWeight="300">Where you are</text>
        <text x="98" y="264" textAnchor="middle" fontSize="10.5" fill={scaffoldText} fontWeight="300">your place in a program</text>
        <text x="98" y="288" textAnchor="middle" fontSize="9.5" fill={scaffoldText} letterSpacing="1.5">TAKING SHAPE</text>
      </g>
      <g>
        <rect x="95" y="30" width="176" height="98" rx="14" fill="rgba(255,255,255,0.015)" stroke={scaffold} strokeWidth="1.3" strokeDasharray="5 5" />
        <text x="183" y="72" textAnchor="middle" fontSize="14" fill="#cbd5e1" fontWeight="300">Questions you&apos;re living</text>
        <text x="183" y="91" textAnchor="middle" fontSize="10.5" fill={scaffoldText} fontWeight="300">the ones you named, kept warm</text>
        <text x="183" y="112" textAnchor="middle" fontSize="9.5" fill={scaffoldText} letterSpacing="1.5">TAKING SHAPE</text>
      </g>
      <g>
        <rect x="429" y="30" width="176" height="98" rx="14" fill="rgba(255,255,255,0.015)" stroke={scaffold} strokeWidth="1.3" strokeDasharray="5 5" />
        <text x="517" y="72" textAnchor="middle" fontSize="14" fill="#cbd5e1" fontWeight="300">What may be next</text>
        <text x="517" y="91" textAnchor="middle" fontSize="10.5" fill={scaffoldText} fontWeight="300">held open, not prescribed</text>
        <text x="517" y="112" textAnchor="middle" fontSize="9.5" fill={scaffoldText} letterSpacing="1.5">TAKING SHAPE</text>
      </g>
      <g>
        <rect x="95" y="432" width="176" height="98" rx="14" fill="rgba(255,255,255,0.015)" stroke={scaffold} strokeWidth="1.3" strokeDasharray="5 5" />
        <text x="183" y="474" textAnchor="middle" fontSize="14" fill="#cbd5e1" fontWeight="300">Themes</text>
        <text x="183" y="493" textAnchor="middle" fontSize="10.5" fill={scaffoldText} fontWeight="300">patterns you pull, never pushed</text>
        <text x="183" y="514" textAnchor="middle" fontSize="9.5" fill={scaffoldText} letterSpacing="1.5">TAKING SHAPE</text>
      </g>
      <g>
        <rect x="429" y="432" width="176" height="98" rx="14" fill="rgba(255,255,255,0.015)" stroke={scaffold} strokeWidth="1.3" strokeDasharray="5 5" />
        <text x="517" y="474" textAnchor="middle" fontSize="14" fill="#cbd5e1" fontWeight="300">Reflections</text>
        <text x="517" y="493" textAnchor="middle" fontSize="10.5" fill={scaffoldText} fontWeight="300">MAIA&apos;s mirror, only when you ask</text>
        <text x="517" y="514" textAnchor="middle" fontSize="9.5" fill={scaffoldText} letterSpacing="1.5">TAKING SHAPE</text>
      </g>
    </svg>
  );
}

function EnvironmentMapInner({ viewer }: { viewer: Viewer }) {
  const params = useSearchParams();
  const fieldContext = params?.get('fieldContext') ?? undefined;
  const isPractitioner = viewer === 'practitioner';
  const accent = ACCENT[viewer];
  const ctx = fieldContext ? `?fieldContext=${encodeURIComponent(fieldContext)}` : '';
  const enterWord = isPractitioner ? 'open — walk it' : 'enter →';

  return (
    <div className="relative max-w-3xl mx-auto px-4 pb-16">
      {/* The environment's own weather */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(125,175,255,0.09),transparent_70%)]"
      />

      <header className="relative flex flex-col items-center text-center pt-10 pb-6 space-y-3">
        <p
          className="text-sm uppercase tracking-[0.45em]"
          style={{ color: accent, animation: 'nwFadeUp 0.55s ease both' }}
        >
          {isPractitioner ? 'Now What? — your environment' : 'Now What?'}
        </p>
        <h1
          className="text-slate-100 text-2xl font-extralight tracking-wide"
          style={{ animation: 'nwFadeUp 0.55s ease 80ms both' }}
        >
          {isPractitioner ? 'The environment you hold.' : 'This is the building. You are inside it.'}
        </h1>
        {isPractitioner ? (
          // Clearance statement, not trust copy: describes what THIS page
          // shows, true by construction (no member data fetched, either view).
          <p
            className="text-slate-400 text-sm font-light leading-relaxed max-w-md"
            style={{ animation: 'nwFadeUp 0.55s ease 160ms both' }}
          >
            This map shows structure — rooms, doors, what is open. It shows
            nothing of what any member has placed inside them.
          </p>
        ) : (
          <p
            className="text-slate-400 text-sm font-light leading-relaxed max-w-md"
            style={{ animation: 'nwFadeUp 0.55s ease 160ms both' }}
          >
            The lit rooms are open — walk in. The scaffolded ones are being
            built around you.
          </p>
        )}
        {/* TRUST_COPY — sitting-gated; ships with the store-boundary guard as one act. */}
      </header>

      {/* ————— THE BUILDING ————— */}
      <div className="relative" style={{ animation: 'nwFadeUp 0.7s ease 200ms both' }}>
        <BuildingMap viewer={viewer} fieldContext={fieldContext} />
      </div>

      {/* ————— the rooms, in words (secondary index) ————— */}
      <section aria-label="The rooms, in words" className="relative mt-10 space-y-2" style={{ animation: 'nwFadeUp 0.6s ease 320ms both' }}>
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-500 pb-2">The rooms, in words</h2>
        {OPEN_ROOMS.map((r) => (
          <a
            key={r.key}
            href={`${r.route}${r.carriesContext ? ctx : ''}`}
            className="group flex items-baseline gap-3 py-2 border-b border-slate-800/60 hover:border-slate-600 transition-colors"
          >
            <span className="text-slate-100 text-sm font-light whitespace-nowrap">{r.name}</span>
            <span className="text-slate-500 text-xs font-light flex-1 truncate">{r.line}</span>
            <span className="text-xs whitespace-nowrap" style={{ color: accent }}>{enterWord}</span>
          </a>
        ))}
        {COMING_ROOMS.map((r) => (
          <div key={r.key} className="flex items-baseline gap-3 py-2 border-b border-slate-800/40">
            <span className="text-slate-400 text-sm font-light whitespace-nowrap">{r.name}</span>
            <span className="text-slate-600 text-xs font-light flex-1 truncate">{r.line}</span>
            <span className="text-slate-600 text-[10px] uppercase tracking-widest whitespace-nowrap">taking shape</span>
          </div>
        ))}
      </section>

      <footer className="relative mt-10 pt-5 border-t border-slate-700/50">
        <p className="text-slate-500 text-sm font-light italic">
          {isPractitioner
            ? 'Rooms open as they are ready. The structure is yours; what happens inside it is theirs.'
            : 'Rooms open as they are ready. Nothing here rushes you.'}
        </p>
      </footer>

      <style>{`
        @keyframes nwFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
        .nw-chamber { cursor: pointer; }
        .nw-chamber:hover { filter: brightness(1.4); }
        .nw-chamber:hover text { fill-opacity: 1; }
      `}</style>
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
