'use client';

/**
 * Personal Portal — the member daily threshold (Track A prototype).
 *
 * Design: docs/specs/PERSONAL_PORTAL_CASE_STUDY_EVALUATION_2026-06-14.md
 * North Star: helps people return to themselves, remember what matters, and live
 *             from conscious relationship with their lives. A place of attending —
 *             NOT a productivity dashboard. Success = "more present than 10 min ago."
 *
 * This is a real, usable surface. Living wires existing tools (reveal, not rebuild);
 * Memory + Wisdom carry real local data; the Evening Portal is fully built. Persistence
 * is prototype-local (lib/portal/portalStore.ts is the seam to the sovereign substrate).
 */

import { useEffect, useState, type ReactNode } from 'react';
import EveningPortal from '@/components/portal/EveningPortal';
import {
  getMarked,
  getWisdom,
  getAnchor,
  setAnchor,
  type MarkedItem,
  type WisdomItem,
} from '@/lib/portal/portalStore';

function partOfDay(): 'morning' | 'afternoon' | 'evening' {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

export default function ThresholdPage() {
  const [eveningOpen, setEveningOpen] = useState(false);
  const [phase, setPhase] = useState<'morning' | 'afternoon' | 'evening'>('afternoon');

  useEffect(() => setPhase(partOfDay()), []);

  if (eveningOpen) {
    return (
      <main className="min-h-screen bg-[#0a0a0f]">
        <EveningPortal onClose={() => setEveningOpen(false)} />
      </main>
    );
  }

  const greeting =
    phase === 'morning' ? 'Good morning.' : phase === 'evening' ? 'The day is settling.' : 'A pause in the day.';

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-neutral-200">
      <div className="mx-auto w-full max-w-2xl px-5 py-12">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Your threshold</p>
          <h1 className="mt-3 text-3xl font-light text-neutral-100">{greeting}</h1>
        </header>

        {/* Morning orientation — the Daily Anchor. Direction, not retention. */}
        <MorningAnchor phase={phase} />

        {/* Evening Portal entry — emphasized after the day turns. */}
        <button
          onClick={() => setEveningOpen(true)}
          className={`mt-6 flex w-full items-center justify-between rounded-3xl border px-6 py-5 text-left transition ${
            phase === 'evening'
              ? 'border-amber-500/40 bg-amber-500/5 hover:border-amber-400/60'
              : 'border-neutral-800 bg-neutral-900/30 hover:border-neutral-600'
          }`}
        >
          <span>
            <span className="block text-lg font-light text-neutral-100">Evening Portal</span>
            <span className="mt-1 block text-sm text-neutral-400">
              Close the day — honor, witness, release, remember.
            </span>
          </span>
          <span className="text-neutral-500">→</span>
        </button>

        {/* The four Fields */}
        <h2 className="mb-4 mt-12 text-xs uppercase tracking-[0.3em] text-neutral-500">Your fields</h2>
        <div className="space-y-4">
          <LivingField />
          <MemoryField />
          <WisdomField />
          <RelationshipField />
        </div>

        <p className="mt-12 text-center text-[12px] leading-relaxed text-neutral-600">
          Prototype. Kept on this device only — not yet wired to your sovereign record.
        </p>
      </div>
    </main>
  );
}

// ── Morning anchor ────────────────────────────────────────────────────────────

function MorningAnchor({ phase }: { phase: string }) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const a = getAnchor();
    if (a?.text) setSaved(a.text);
  }, []);

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/30 px-6 py-5">
      <p className="text-lg font-light text-neutral-100">What is alive today?</p>
      {saved ? (
        <div className="mt-3">
          <p className="text-[15px] leading-relaxed text-neutral-300">{saved}</p>
          <button onClick={() => setSaved(null)} className="mt-2 text-[13px] text-neutral-500 hover:text-neutral-300">
            name something else
          </button>
        </div>
      ) : (
        <div className="mt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && text.trim()) {
                setAnchor(text);
                setSaved(text.trim());
                setText('');
              }
            }}
            placeholder={phase === 'evening' ? 'What stayed with you today…' : 'One thing that matters today…'}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-4 py-3 text-[15px] text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
          />
          <p className="mt-2 text-[12px] text-neutral-500">Orientation, not a task. Press enter to set it.</p>
        </div>
      )}
    </section>
  );
}

// ── Field shell ───────────────────────────────────────────────────────────────

function FieldCard({
  name,
  essence,
  children,
}: {
  name: string;
  essence: string;
  children?: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/30 px-6 py-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-light text-neutral-100">{name}</h3>
        <span className="text-[13px] text-neutral-500">{essence}</span>
      </div>
      {children && <div className="mt-4">{children}</div>}
    </section>
  );
}

// ── Living (reveal layer over existing tools) ────────────────────────────────

function LivingField() {
  // These exist today behind the workspace; the Portal is bringing them home.
  const tools: { label: string; href: string }[] = [
    { label: 'Calendar', href: '/studio/calendar' },
    { label: 'Tasks', href: '/studio/tasks' },
    { label: 'Focus Garden', href: '/studio/tasks' },
    { label: 'Capture', href: '/maia/keep-capture' },
  ];
  return (
    <FieldCard name="Living" essence="your day, held lightly">
      <div className="flex flex-wrap gap-2">
        {tools.map((t) => (
          <a
            key={t.label}
            href={t.href}
            className="rounded-full border border-neutral-700 px-4 py-1.5 text-[13px] text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
          >
            {t.label} →
          </a>
        ))}
      </div>
    </FieldCard>
  );
}

// ── Memory (real local marks from the Evening Portal's Remember) ──────────────

function MemoryField() {
  const [marks, setMarks] = useState<MarkedItem[]>([]);
  useEffect(() => setMarks(getMarked()), []);

  return (
    <FieldCard name="Memory" essence="what you've chosen to keep">
      {marks.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-neutral-500">
          Nothing marked yet. What you choose to remember in the Evening Portal arrives here.
        </p>
      ) : (
        <ul className="space-y-2">
          {marks.slice(0, 6).map((m) => (
            <li key={m.id} className="flex items-baseline justify-between gap-3">
              <span className="text-[15px] text-neutral-200">
                {m.label}
                {m.note && <span className="ml-2 text-[14px] text-neutral-500">— {m.note}</span>}
              </span>
              <span className="shrink-0 text-[12px] text-neutral-600">{new Date(m.at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
      <a href="/maia/keep-capture" className="mt-3 inline-block text-[13px] text-neutral-500 hover:text-neutral-300">
        Open your full record →
      </a>
    </FieldCard>
  );
}

// ── Wisdom (preview → /threshold/wisdom, the living canon) ───────────────────

function WisdomField() {
  const [items, setItems] = useState<WisdomItem[]>([]);
  useEffect(() => setItems(getWisdom()), []);

  return (
    <FieldCard name="Wisdom" essence="a canon of what moves you">
      {items.length === 0 ? (
        <p className="text-[14px] leading-relaxed text-neutral-500">
          A place for what moves you — quotes, teachings, songs, dreams, synchronicities, the
          moments that strike you. A living canon.
        </p>
      ) : (
        <ul className="space-y-2">
          {items.slice(0, 2).map((w) => (
            <li key={w.id} className="text-[15px] leading-relaxed text-neutral-300">
              “{w.text.length > 96 ? `${w.text.slice(0, 96)}…` : w.text}”
              <span className="ml-1 text-[12px] capitalize text-neutral-600">— {w.kind}</span>
            </li>
          ))}
        </ul>
      )}
      <a
        href="/threshold/wisdom"
        className="mt-3 inline-block text-[13px] text-neutral-400 transition hover:text-neutral-200"
      >
        {items.length === 0 ? 'Begin your canon →' : 'Tend your canon →'}
      </a>
    </FieldCard>
  );
}

// ── Relationship (minimal — same model as Evening Portal, pointed at a transcript) ──

function RelationshipField() {
  return (
    <FieldCard name="Relationship" essence="conversations worth revisiting">
      <p className="text-[14px] leading-relaxed text-neutral-500">
        Review a recorded conversation the way you close a day — what mattered, what you
        learned, what to carry forward. No layer about the other person.
      </p>
      <span className="mt-3 inline-block rounded-full border border-neutral-800 px-3 py-1 text-[12px] text-neutral-600">
        Coming with your solo sessions
      </span>
    </FieldCard>
  );
}
