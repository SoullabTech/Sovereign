'use client';

/**
 * Evening Portal — the first buildable piece of the Personal Portal.
 *
 * Spec: docs/specs/EVENING_PORTAL_SPEC_2026-06-14.md
 * Governed by: Sanctuary Mode (CLAUDE.md), Negative Rights Principle,
 *              MAIA Attention/Sovereignty Invariants.
 *
 * Four gestures are PEERS, not a sequence — the portal makes the space; it decides
 * none of them. Framed by an Exhale (opening) and a Continuity echo (across time).
 *
 *   Honor / Witness → tier 2 (remembered, not marked)
 *   Release         → tier 1 (kept nowhere — text never leaves this component)
 *   Remember        → tier 3 (member-declared significance)
 *
 * The exit hands the person back to their evening, lighter — no streak, no hook.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  addMarked,
  addWitnessed,
  getContinuityEchoes,
  type MarkedItem,
} from '@/lib/portal/portalStore';

// Member-selectable label vocabulary for Remember. These are CATEGORIES the member
// chooses among (the spec endorses "member-selected"); they are NOT content the system
// nominates. The asymmetry guard: MAIA opens the gesture, never proposes what to remember.
const REMEMBER_LABELS = [
  'gratitude',
  'courage',
  'insight',
  'beauty',
  'synchronicity',
  'relationship',
  'creative spark',
] as const;

function timeAgo(at: number): string {
  const days = Math.floor((Date.now() - at) / 86_400_000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  return `${days} days ago`;
}

type Props = { onClose?: () => void };

export default function EveningPortal({ onClose }: Props) {
  // Continuity is read once on open — verbatim labels + dates, max 2, no counts.
  const echoes = useMemo<MarkedItem[]>(() => getContinuityEchoes(2), []);

  return (
    <div className="mx-auto w-full max-w-xl px-5 py-10 text-neutral-200">
      {/* ── Exhale (opening) ─────────────────────────────────────────────── */}
      <header className="mb-10 flex flex-col items-center text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Evening</p>
        {/* Breath pacer — slows the nervous system before anything is asked. Skippable; zero-input floor preserved. */}
        <div className="my-7 flex h-24 w-24 items-center justify-center" aria-hidden>
          <span
            className="block h-20 w-20 rounded-full bg-gradient-to-b from-amber-200/25 to-amber-500/5 ring-1 ring-amber-200/20"
            style={{ animation: 'portalBreathe 9s ease-in-out infinite' }}
          />
          <style>{`@keyframes portalBreathe{0%,100%{transform:scale(.6);opacity:.4}50%{transform:scale(1);opacity:.85}}`}</style>
        </div>
        <h1 className="text-2xl font-light leading-snug text-neutral-100">
          Take a breath. The day is ending.
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">
          What remains with you? Stay with one of these, or simply breathe and go.
        </p>
      </header>

      {/* ── Continuity echo (verbatim, only if prior marks exist) ─────────── */}
      {echoes.length > 0 && (
        <div className="mb-8 rounded-2xl border border-neutral-800 bg-neutral-900/40 px-5 py-4">
          <p className="text-[13px] leading-relaxed text-neutral-400">
            {echoes.map((e, i) => (
              <span key={e.id}>
                {i > 0 && <span className="text-neutral-600"> · </span>}
                <span className="text-neutral-500">{cap(timeAgo(e.at))} you marked </span>
                <span className="text-neutral-200">{e.label}</span>
                <span className="text-neutral-500">.</span>
              </span>
            ))}
          </p>
        </div>
      )}

      {/* ── The four gestures (peers) ────────────────────────────────────── */}
      <div className="space-y-4">
        <Honor />
        <Witness />
        <Release />
        <Remember />
      </div>

      {/* ── The exit is the product ──────────────────────────────────────── */}
      <footer className="mt-12 text-center">
        <button
          onClick={onClose}
          className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm text-neutral-300 transition hover:border-neutral-500 hover:text-neutral-100"
        >
          Close the day
        </button>
        <p className="mt-4 text-[13px] text-neutral-500">
          That&apos;s enough. The day is complete.
        </p>
      </footer>
    </div>
  );
}

// ── Shared gesture shell ──────────────────────────────────────────────────────

function Gesture({
  title,
  prompt,
  tone,
  children,
}: {
  title: string;
  prompt: string;
  tone?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/30">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <span>
          <span className="text-[17px] font-light text-neutral-100">{title}</span>
          {tone && <span className="ml-2 text-xs text-neutral-500">{tone}</span>}
        </span>
        <span className="text-neutral-600">{open ? '–' : '+'}</span>
      </button>
      {open && (
        <div className="border-t border-neutral-800 px-5 py-4">
          <p className="mb-3 text-[15px] leading-relaxed text-neutral-400">{prompt}</p>
          {children}
        </div>
      )}
    </section>
  );
}

const fieldCls =
  'w-full resize-none rounded-xl border border-neutral-700 bg-neutral-950/60 px-4 py-3 text-[15px] text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500';
const actionCls =
  'rounded-full bg-neutral-100 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-white disabled:opacity-40';

// ── Honor (tier 2) ────────────────────────────────────────────────────────────

function Honor() {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Gesture title="Honor" tone="what deserves gratitude" prompt="What mattered today? What deserves acknowledgment?">
      {done ? (
        <Ack>Held with the day.</Ack>
      ) : (
        <>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Something you're grateful for…"
            className={fieldCls}
          />
          <div className="mt-3 flex justify-end">
            <button
              disabled={!text.trim()}
              onClick={() => {
                addWitnessed('honor', text);
                setText('');
                setDone(true);
              }}
              className={actionCls}
            >
              Keep with the day
            </button>
          </div>
        </>
      )}
    </Gesture>
  );
}

// ── Witness (tier 2) ──────────────────────────────────────────────────────────

function Witness() {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Gesture title="Witness" tone="what happened to you" prompt="What happened to you today? What did you learn? What touched you?">
      {done ? (
        <Ack>Witnessed.</Ack>
      ) : (
        <>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What you'd want the day to remember…"
            className={fieldCls}
          />
          <div className="mt-3 flex justify-end">
            <button
              disabled={!text.trim()}
              onClick={() => {
                addWitnessed('witness', text);
                setText('');
                setDone(true);
              }}
              className={actionCls}
            >
              Keep with the day
            </button>
          </div>
        </>
      )}
    </Gesture>
  );
}

// ── Release (tier 1 — SANCTUARY-CLASS, persists nothing) ──────────────────────

function Release() {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  return (
    <Gesture
      title="Release"
      tone="set it down"
      prompt="What are you ready to set down? What no longer needs to be carried?"
    >
      {done ? (
        // Content-free acknowledgment. The refusal to read it is the feature.
        <Ack>That&apos;s set down now. It wasn&apos;t saved anywhere.</Ack>
      ) : (
        <>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Name it here. This stays in your browser and is discarded."
            className={fieldCls}
          />
          <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
            Not stored. Not analyzed. Not surfaced later. This text never leaves your device.
          </p>
          <div className="mt-3 flex justify-end">
            <button
              disabled={!text.trim()}
              onClick={() => {
                // Sanctuary boundary, structural: the text is dropped, never stored,
                // never transmitted. No store call exists for it by design.
                setText('');
                setDone(true);
              }}
              className={actionCls}
            >
              Set it down
            </button>
          </div>
        </>
      )}
    </Gesture>
  );
}

// ── Remember (tier 3 — member-declared significance) ──────────────────────────

function Remember() {
  const [label, setLabel] = useState('');
  const [own, setOwn] = useState('');
  const [note, setNote] = useState('');
  const [done, setDone] = useState(false);

  const chosen = own.trim() || label;

  return (
    <Gesture
      title="Remember"
      tone="carry this forward"
      // MAIA opens the gesture; it does not nominate the content.
      prompt="Is there anything from today you want remembered — kept in the living record of your life?"
    >
      {done ? (
        <Ack>Marked. It&apos;ll be here when you return.</Ack>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {REMEMBER_LABELS.map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLabel(l);
                  setOwn('');
                }}
                className={`rounded-full border px-3 py-1.5 text-[13px] transition ${
                  label === l && !own.trim()
                    ? 'border-neutral-300 bg-neutral-200 text-neutral-900'
                    : 'border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <input
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            placeholder="…or your own word"
            className="mt-3 w-full rounded-xl border border-neutral-700 bg-neutral-950/60 px-4 py-2.5 text-[15px] text-neutral-100 placeholder-neutral-600 outline-none focus:border-neutral-500"
          />
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A line in your own words, if you want one (optional)"
            className={`${fieldCls} mt-3`}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-neutral-500">
              {chosen ? `Mark this as “${chosen}.”` : 'Choose or write a word.'}
            </span>
            <button
              disabled={!chosen}
              onClick={() => {
                addMarked(chosen, note);
                setLabel('');
                setOwn('');
                setNote('');
                setDone(true);
              }}
              className={actionCls}
            >
              Mark it
            </button>
          </div>
        </>
      )}
    </Gesture>
  );
}

// ── small helpers ─────────────────────────────────────────────────────────────

function Ack({ children }: { children: ReactNode }) {
  return <p className="py-1 text-[15px] leading-relaxed text-neutral-300">{children}</p>;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
