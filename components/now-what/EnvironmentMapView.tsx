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
 * TRUST COPY (authorized 2026-07-13, Kelly ruling — completion slice): every
 * room now carries per-room trust copy, scoped to claims TRUE of this
 * environment's own store paths (member-gesture-only field-note writes).
 * The counsel §D coupling stands for the MAIN ORACLE route's copy — the
 * unguarded keep-filing found there is a separate act; nothing here claims
 * beyond this environment. Themes/Reflections remain HOLD + EXPLAIN: their
 * doors open onto honest explanations, never onto generated content.
 */

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

type RoomDef = {
  key: string;
  name: string;
  line: string;
  /**
   * Plain-language explanation for the word-index (founder direction
   * 2026-07-13: "we need to explain these better or they won't understand
   * them"). Member register, always visible — no tooltips, no hidden
   * handles. Each one answers: what is this room, and when would I use it?
   * Claim discipline applies: every sentence must be true of the code today.
   */
  explain: string;
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
    name: 'The Room',
    line: 'Think something through with MAIA — work with the actual thing until a next real step appears.',
    explain:
      'This is where the thinking happens. Bring something real — a decision, a question, a stuck place — and talk it through with MAIA until a next real step appears. At the end, you choose what to keep; nothing is saved without your say-so.',
    route: '/now-what/room',
    carriesContext: true,
    primary: true,
  },
  {
    key: 'question',
    name: 'My Question',
    line: 'The questions you chose to keep — named by you, kept warm.',
    explain:
      'Some questions aren’t ready to be answered — they need to not get lost. When you keep a question, it waits here in your exact words until you’re ready to continue thinking it through.',
    route: '/now-what/questions',
    carriesContext: true,
  },
  {
    key: 'work',
    name: 'My Work',
    line: 'What you chose to live, and the dimensions of a flourishing life where it gathers.',
    explain:
      'The practices you chose to live and the areas of life you are cultivating, gathered where you placed them. Nothing is assigned, measured, or recommended — this room holds what you put in it.',
    route: '/now-what/work',
    carriesContext: true,
  },
  {
    key: 'coaching',
    name: 'My Coaching',
    line: 'The human relationship this environment extends — conversations past and coming, and where you stand.',
    explain:
      'Your work with your coach: the next conversation, previous ones, what you chose to bring forward, and your place in any program — as you declared it. The date serves the relationship, never the reverse.',
    route: '/now-what/coaching',
    carriesContext: true,
  },
  {
    key: 'story',
    name: 'My Story',
    line: 'What you kept, in your own words, gathered over time.',
    explain:
      'Everything you chose to keep collects here — dated, in your own words, never interpreted or scored. Visit it to see what is becoming.',
    route: '/now-what/field',
    carriesContext: true,
  },
];

type Viewer = 'member' | 'practitioner';
const ACCENT = { member: '#c9a35e', practitioner: '#f59e0b' } as const;

/**
 * The building itself — an SVG floor plan. The session room is the lit
 * center chamber (holoflower heart); Your field is the lit chamber off the
 * east corridor; four noun-room chambers surround it (five-room ontology,
 * 2026-08-05 — no scaffolded chambers remain; held capabilities are not
 * advertised in the member house, ruling D-E).
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
    /* pointer-events-auto is LOAD-BEARING: app/icon-fix.css sets
       `svg { pointer-events: none }` globally (a Safari icon patch), which
       silently killed every chamber door on this map — the building looked
       clickable (hover styles, cursor) but no click could land. Any
       interactive SVG in this codebase must opt back in exactly like this. */
    <svg
      viewBox="0 0 700 585"
      className="w-full h-auto pointer-events-auto"
      role="img"
      aria-label="Map of the Now What? environment: the session room at the center; your field, where you are, questions you're living, and what may be next open around it; themes and reflections still taking shape"
    >
      <defs>
        <radialGradient id="nwCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(201,163,94,0.14)" />
          <stop offset="60%" stopColor="rgba(201,163,94,0.05)" />
          <stop offset="100%" stopColor="rgba(201,163,94,0)" />
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
      {/* center → open chambers (solid) */}
      <line x1="445" y1="255" x2="520" y2="255" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="255" y1="255" x2="180" y2="255" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="298" y1="170" x2="222" y2="128" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
      <line x1="402" y1="170" x2="478" y2="128" stroke={accent} strokeOpacity="0.5" strokeWidth="2" />
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
          The Room
        </text>
        <text x="350" y="312" textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="300">
          think something through, with MAIA
        </text>
        <text x="350" y="333" textAnchor="middle" fontSize="11" fill={accent} letterSpacing="1.5" style={{ textTransform: 'uppercase' }}>
          {enterLabel}
        </text>
      </a>

      {/* ————— east chamber: My Story (lit) ————— */}
      <a href={`/now-what/field${ctx}`} className="nw-chamber">
        <rect
          x="520" y="192" width="164" height="126" rx="14"
          fill="rgba(255,255,255,0.04)"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1.5"
        />
        <text x="602" y="240" textAnchor="middle" fontSize="15" fill="#f1f5f9" fontWeight="300">
          My Story
        </text>
        <text x="602" y="259" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="300">
          what you kept, over time
        </text>
        <text x="602" y="286" textAnchor="middle" fontSize="10.5" fill={accent} letterSpacing="1.5">
          {enterLabel}
        </text>
      </a>

      {/* ————— west chamber: My Coaching (lit) ————— */}
      <a href={`/now-what/coaching${ctx}`} className="nw-chamber">
        <rect
          x="16" y="192" width="164" height="126" rx="14"
          fill="rgba(255,255,255,0.04)"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1.5"
        />
        <text x="98" y="240" textAnchor="middle" fontSize="15" fill="#f1f5f9" fontWeight="300">My Coaching</text>
        <text x="98" y="259" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="300">the human relationship</text>
        <text x="98" y="286" textAnchor="middle" fontSize="10.5" fill={accent} letterSpacing="1.5">{enterLabel}</text>
      </a>

      {/* ————— northwest chamber: My Question (lit) ————— */}
      <a href={`/now-what/questions${ctx}`} className="nw-chamber">
        <rect
          x="95" y="30" width="176" height="98" rx="14"
          fill="rgba(255,255,255,0.04)"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1.5"
        />
        <text x="183" y="66" textAnchor="middle" fontSize="14" fill="#f1f5f9" fontWeight="300">My Question</text>
        <text x="183" y="85" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="300">what you are wrestling with</text>
        <text x="183" y="110" textAnchor="middle" fontSize="10.5" fill={accent} letterSpacing="1.5">{enterLabel}</text>
      </a>

      {/* ————— northeast chamber: My Work (lit) ————— */}
      <a href={`/now-what/work${ctx}`} className="nw-chamber">
        <rect
          x="429" y="30" width="176" height="98" rx="14"
          fill="rgba(255,255,255,0.04)"
          stroke={accent} strokeOpacity="0.45" strokeWidth="1.5"
        />
        <text x="517" y="66" textAnchor="middle" fontSize="14" fill="#f1f5f9" fontWeight="300">My Work</text>
        <text x="517" y="85" textAnchor="middle" fontSize="10.5" fill="#94a3b8" fontWeight="300">what you are living and cultivating</text>
        <text x="517" y="110" textAnchor="middle" fontSize="10.5" fill={accent} letterSpacing="1.5">{enterLabel}</text>
      </a>
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_35%_at_50%_0%,rgba(196,164,110,0.09),transparent_70%)]"
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
            Five rooms, one house. The lit rooms are open — walk in.
          </p>
        )}
      </header>

      {/* ————— THE BUILDING ————— */}
      <div className="relative" style={{ animation: 'nwFadeUp 0.7s ease 200ms both' }}>
        <BuildingMap viewer={viewer} fieldContext={fieldContext} />
      </div>

      {/* ————— the rooms, in words (secondary index) ————— */}
      <section aria-label="The rooms, in words" className="relative mt-10 space-y-2" style={{ animation: 'nwFadeUp 0.6s ease 320ms both' }}>
        <h2 className="text-[11px] uppercase tracking-[0.3em] text-slate-500 pb-2">The rooms, in words</h2>
        {/* Each room explains itself in plain language (founder direction
            2026-07-13) — always visible, never a tooltip. The one-line
            register stays on the drawing; the index is where a first-time
            member learns what each room actually is. */}
        {OPEN_ROOMS.map((r) => (
          <a
            key={r.key}
            href={`${r.route}${r.carriesContext ? ctx : ''}`}
            className="group block py-3 border-b border-slate-800/60 hover:border-slate-600 transition-colors"
          >
            <span className="flex items-baseline gap-3">
              <span className="text-slate-100 text-sm font-light whitespace-nowrap">{r.name}</span>
              <span className="flex-1" />
              <span className="text-xs whitespace-nowrap" style={{ color: accent }}>{enterWord}</span>
            </span>
            <span className="block text-slate-500 text-xs font-light leading-relaxed mt-1.5 max-w-xl">
              {r.explain}
            </span>
          </a>
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
      : 'min-h-screen bg-[#1f1b16] text-slate-200';

  return (
    <div className={shell}>
      <Suspense fallback={null}>
        <EnvironmentMapInner viewer={viewer} />
      </Suspense>
    </div>
  );
}
