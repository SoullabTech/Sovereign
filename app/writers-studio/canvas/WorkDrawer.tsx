'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import type { LivingWork } from '../useLivingWorks';

/**
 * The Work drawer — the anchor of the Study Wall (Work Continuity Layer,
 * first slice; design: WORK_DRAWER_DESIGN_2026-08-05.md, founder-accepted).
 *
 * Not where the system describes the work: where the creator encounters
 * their relationship with the work. Everything rendered is member-authored;
 * every register is honestly absent when empty. No counts, no inference,
 * no properties.
 *
 * First-slice registers: Identity (name + becoming, tended HERE) and Shape
 * (the declare-expression gesture — "this manuscript is a form of this
 * Work", the first writer living_work_expressions has ever had). Origins
 * renders origin-shaped belongings only when they exist; History and
 * Relationships stay where the design put them (History drawer; held).
 */

interface WorkDrawerProps {
  /** The member's declared works (already read once by the page). */
  works: LivingWork[];
  /** The work united with the table, if the member's declaration united them. */
  unitedWork: LivingWork | null;
  /** The manuscript on the table, if any. */
  manuscript: { id: string; title: string | null } | null;
  manuscriptLabel: string;
  /** Declarations changed — the page re-reads the one shared works read. */
  onChanged: () => void;
}

export default function WorkDrawer({
  works,
  unitedWork,
  manuscript,
  manuscriptLabel,
  onChanged,
}: WorkDrawerProps) {
  // The drawer shows the united work when the member's declaration made one;
  // otherwise their only work; otherwise the honest plural/empty states.
  const work = unitedWork ?? (works.length === 1 ? works[0] : null);

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [editingBecoming, setEditingBecoming] = useState(false);
  const [becomingDraft, setBecomingDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const patch = async (workId: string, body: Record<string, unknown>) => {
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        setFailed('Could not save that just now. Your words are still here.');
        return false;
      }
      onChanged();
      return true;
    } catch {
      setFailed('Could not save that just now. Your words are still here.');
      return false;
    } finally {
      setBusy(false);
    }
  };

  const declare = async (workId: string) => {
    if (!manuscript) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${workId}/expressions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expressionType: 'manuscript', expressionId: manuscript.id }),
      });
      if (!res.ok) {
        setFailed('Could not record that declaration just now.');
        return;
      }
      onChanged();
    } catch {
      setFailed('Could not record that declaration just now.');
    } finally {
      setBusy(false);
    }
  };

  const undeclare = async (workId: string) => {
    if (!manuscript) return;
    setBusy(true);
    setFailed(null);
    try {
      /* Trunk's route takes the identifiers as query params on DELETE. */
      const res = await apiFetch(
        `/api/sovereign/living-works/${workId}/expressions` +
          `?expressionType=manuscript&expressionId=${encodeURIComponent(manuscript.id)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        setFailed('Could not withdraw that just now.');
        return;
      }
      onChanged();
    } catch {
      setFailed('Could not withdraw that just now.');
    } finally {
      setBusy(false);
    }
  };

  if (!work && works.length === 0) {
    return (
      <p className="text-[13px] leading-relaxed opacity-60">
        No work is declared yet.{' '}
        <Link href="/writers-studio" className="underline underline-offset-4">
          The Studio Home
        </Link>{' '}
        is where a work begins.
      </p>
    );
  }

  // Several works, none united with the table: the drawer does not guess.
  // The Shape gesture below is how the member says which one this belongs to.
  if (!work) {
    return (
      <div>
        <p className="text-[13px] leading-relaxed opacity-60 mb-4">
          You have {works.length} works. Which one is this a form of? That is yours to say:
        </p>
        {manuscript && (
          <ShapeGesture
            works={works}
            manuscriptLabel={manuscriptLabel}
            busy={busy}
            onDeclare={declare}
          />
        )}
        {failed && <p className="text-[12px] opacity-60 mt-3">{failed}</p>}
      </div>
    );
  }

  const declaredHere =
    manuscript !== null &&
    work.expressions.some(
      (e) => e.expressionType === 'manuscript' && e.expressionId === manuscript.id
    );

  return (
    <div className="space-y-6">
      {/* ── Identity: "What is this?" — tended here, in the member's words. ── */}
      <section>
        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              placeholder="Its name, when you know it"
              autoFocus
              className="press-field flex-1 bg-transparent border-b py-1 text-[15px] outline-none placeholder:opacity-40"
              style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
            />
            <button
              disabled={busy}
              onClick={async () => {
                const ok = await patch(work.id, {
                  title: nameDraft.trim().length === 0 ? null : nameDraft,
                });
                if (ok) setEditingName(false);
              }}
              className="text-[12px] opacity-60 hover:opacity-90 underline underline-offset-4"
            >
              keep
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="text-[12px] opacity-40 hover:opacity-70"
            >
              leave it
            </button>
          </div>
        ) : (
          <div className="flex items-baseline gap-2.5">
            <p className="text-[15px]" style={{ fontFamily: SERIF, opacity: work.title ? 1 : 0.7 }}>
              {work.title ?? 'Your work'}
            </p>
            <button
              onClick={() => {
                setNameDraft(work.title ?? '');
                setEditingName(true);
              }}
              className="text-[11px] opacity-35 hover:opacity-70 underline underline-offset-4"
            >
              {work.title ? 'rename' : 'name it'}
            </button>
          </div>
        )}
        <p className="text-[11.5px] opacity-40 mt-1">declared {formatWhen(work.createdAt)}</p>
      </section>

      {/* ── Becoming: the member's one statement — why it exists and what it
          is becoming (purpose field, per the first-slice ruling). ── */}
      <section>
        <h3 className="text-[10.5px] tracking-[0.15em] uppercase opacity-35 mb-2">Becoming</h3>
        {editingBecoming ? (
          <div>
            <textarea
              value={becomingDraft}
              onChange={(e) => setBecomingDraft(e.target.value)}
              placeholder="In your words — what is this, and what is it becoming?"
              rows={3}
              autoFocus
              className="press-field w-full bg-transparent border rounded-sm p-2.5 text-[13.5px] leading-relaxed outline-none placeholder:opacity-40"
              style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
            />
            <div className="flex gap-3 mt-1.5">
              <button
                disabled={busy}
                onClick={async () => {
                  /* Trunk's shipped semantics (Work Home, Slice 6): null
                     un-states the becoming; a blank string is refused as
                     blank_purpose. Clearing therefore sends null. */
                  const ok = await patch(work.id, {
                    purpose: becomingDraft.trim().length === 0 ? null : becomingDraft,
                  });
                  if (ok) setEditingBecoming(false);
                }}
                className="text-[12px] opacity-60 hover:opacity-90 underline underline-offset-4"
              >
                keep
              </button>
              <button
                onClick={() => setEditingBecoming(false)}
                className="text-[12px] opacity-40 hover:opacity-70"
              >
                leave it
              </button>
            </div>
          </div>
        ) : work.purpose ? (
          <button
            onClick={() => {
              setBecomingDraft(work.purpose ?? '');
              setEditingBecoming(true);
            }}
            className="text-left text-[13.5px] leading-relaxed opacity-80 hover:opacity-100"
            style={{ fontFamily: SERIF }}
          >
            {work.purpose}
          </button>
        ) : (
          <button
            onClick={() => {
              setBecomingDraft('');
              setEditingBecoming(true);
            }}
            className="text-[13px] opacity-45 hover:opacity-75 underline underline-offset-4"
          >
            Say what this is becoming — when you know
          </button>
        )}
      </section>

      {/* ── Shape: "What form is it taking?" — the declaration gesture. ── */}
      <section>
        <h3 className="text-[10.5px] tracking-[0.15em] uppercase opacity-35 mb-2">Forms</h3>
        {work.expressions.length > 0 && (
          <ul className="space-y-1.5 mb-3">
            {work.expressions.map((e) => (
              <li key={`${e.expressionType}:${e.expressionId}`} className="text-[13px] opacity-75">
                ✓ {manuscript && e.expressionId === manuscript.id ? manuscriptLabel : 'a manuscript'}
                <span className="opacity-55"> — declared by you, {formatWhen(e.declaredAt)}</span>
                {manuscript && e.expressionId === manuscript.id && (
                  <button
                    disabled={busy}
                    onClick={() => void undeclare(work.id)}
                    className="ml-2 text-[11px] opacity-35 hover:opacity-70 underline underline-offset-4"
                  >
                    no longer a form of this work
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {manuscript && !declaredHere && (
          <ShapeGesture
            works={[work]}
            manuscriptLabel={manuscriptLabel}
            busy={busy}
            onDeclare={declare}
          />
        )}
        {work.expressions.length === 0 && !manuscript && (
          <p className="text-[12.5px] leading-relaxed opacity-45">
            This work has taken no declared form yet.
          </p>
        )}
      </section>

      {failed && <p className="text-[12px] opacity-60">{failed}</p>}
    </div>
  );
}

/**
 * The load-bearing gesture: "this is a form of this Work." A relationship
 * action, not an object action — and only ever the member's. With several
 * works it names which one; it never guesses.
 */
function ShapeGesture({
  works,
  manuscriptLabel,
  busy,
  onDeclare,
}: {
  works: LivingWork[];
  manuscriptLabel: string;
  busy: boolean;
  onDeclare: (workId: string) => Promise<void>;
}) {
  return (
    <div className="space-y-2">
      {works.map((w) => (
        <button
          key={w.id}
          disabled={busy}
          onClick={() => void onDeclare(w.id)}
          className="block w-full text-left border px-3.5 py-2.5 text-[13px] leading-snug opacity-75 hover:opacity-100 disabled:opacity-40"
          style={{ borderColor: PRESS.ruleSoft }}
        >
          <span style={{ color: PRESS.accent }}>{manuscriptLabel}</span> is a form of{' '}
          <span style={{ fontFamily: SERIF }}>{w.title ?? 'your unnamed work'}</span>
        </button>
      ))}
    </div>
  );
}
