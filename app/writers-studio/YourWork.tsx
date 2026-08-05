'use client';

import { useState, type ReactNode } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from './pressTheme';
import type { LivingWork, LivingWorksPhase } from './useLivingWorks';

/**
 * The declaration gesture (Phase 2, Slice 2), now living under a re-founded
 * arrival (Slice 5).
 *
 * A member says a work exists. That is the whole act.
 *
 * SLICE 5 changed two things and nothing else. The read moved out to
 * useLivingWorks so that Studio Home and this section answer "is there a
 * work?" from one source rather than two. And when Home has already shown the
 * work's name as the page's headline, this section does not say it again:
 * `arrivalWorkId` marks that work, and only its quiet controls render.
 *
 * What Slice 5 did NOT change: the declaration act, withdrawal, naming, or any
 * copy about them. Attachment, multiple-work switching and expression
 * management remain unbuilt.
 *
 * THE UNNAMED STATE is the hard part, and the reason the schema allows it.
 * A work with no title renders as "Your work" — interface orientation, not
 * stored identity. Nothing is written to the database to produce that phrase.
 * Specifically absent, each one a way of quietly undoing the optional title:
 *   "Untitled" · "New Work" · "Incubating" · a generated label · a date ·
 *   a counter · the first manuscript's title · instructional copy standing in
 *   as a name.
 * The absence stays an absence.
 *
 * WITHDRAWAL removes the declaration. It is not deletion, completion, or
 * archiving, and the copy says what it does and does not touch. Confirmation
 * is inline and proportionate — a second click, not a modal.
 */

interface YourWorkProps {
  phase: LivingWorksPhase;
  works: LivingWork[];
  /** Re-read after any act that changes what is declared. */
  reload: () => Promise<void>;
  /**
   * The work whose name Studio Home has already rendered as the page
   * headline, if any. Its name is not repeated here — the controls belong to
   * the headline above them.
   */
  arrivalWorkId: string | null;
  /**
   * What Home wants shown inside each work's block, beneath its name and
   * controls (Work Home, Slice 6: the work's declared expressions). This
   * component keeps owning the declaration acts; what a work HOLDS is Home's
   * composition, threaded through so the work reads as one presence rather
   * than a name here and its contents somewhere else.
   */
  renderWorkBody?: (work: LivingWork) => ReactNode;
  /**
   * TRUE when the surrounding zone already names this space (Work Home's
   * centre says "The Work"); the internal "Your work" heading would label the
   * same thing twice.
   */
  hideHeading?: boolean;
}

export default function YourWork({
  phase,
  works,
  reload,
  arrivalWorkId,
  renderWorkBody,
  hideHeading,
}: YourWorkProps) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  const [declaring, setDeclaring] = useState(false);
  const [draftName, setDraftName] = useState('');

  const [naming, setNaming] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState('');
  const [confirmingWithdraw, setConfirmingWithdraw] = useState<string | null>(null);

  const load = reload;

  const declare = async (title: string | null) => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch('/api/sovereign/living-works', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(title === null ? {} : { title }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setDeclaring(false);
      setDraftName('');
      await load();
    } catch {
      setFailure('Could not begin your work just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const rename = async (id: string, title: string) => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setNaming(null);
      setNameValue('');
      await load();
    } catch {
      setFailure('Could not save that name just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async (id: string) => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      setConfirmingWithdraw(null);
      await load();
    } catch {
      setFailure('Could not withdraw that just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  if (phase === 'loading' || phase === 'unauthorized') return null;

  const heading = (
    <h2 className="text-[13px] tracking-[0.2em] uppercase opacity-40 mb-4">Your work</h2>
  );

  if (phase === 'error') {
    return (
      <section className="mb-14">
        {heading}
        <p className="text-[14px] leading-relaxed opacity-55 max-w-md">
          We couldn&rsquo;t read this just now. Nothing has been lost — this is a problem reaching
          it, not a problem with it.{' '}
          <button onClick={() => void load()} className="underline underline-offset-4">
            Try again
          </button>
        </p>
      </section>
    );
  }

  return (
    <section className="mb-14">
      {/* When arrival is founded on the work, the page headline is the heading.
          Repeating "Your work" here would label the same thing twice. */}
      {!arrivalWorkId && !hideHeading && heading}

      {works.length === 0 && !declaring && (
        <>
          {/* Grounded in what declaring actually does: it creates a work, and
              the title is optional. Since Slice 6 a work CAN hold writing —
              but only writing the member places there afterwards, so this
              sentence still promises nothing the declaration itself does. */}
          <p className="text-[15px] leading-relaxed opacity-70 mb-6 max-w-md">
            A work can begin before you know what form it will take.
          </p>
          <button
            onClick={() => setDeclaring(true)}
            className="text-[14px] underline underline-offset-4 opacity-85 hover:opacity-100 min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: PRESS.accent }}
          >
            Begin a work
          </button>
        </>
      )}

      {declaring && (
        <div className="max-w-md">
          {/* The field is optional and says so. Naming is the member's act and
              their moment; the Studio asks once and does not insist. */}
          <label htmlFor="lw-name" className="block text-[14px] opacity-70 mb-3">
            What are you working on?
          </label>
          <input
            id="lw-name"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busy) void declare(draftName.trim() || null);
              if (e.key === 'Escape') setDeclaring(false);
            }}
            autoFocus
            className="press-field w-full bg-transparent border-b py-2 text-[18px] outline-none placeholder:opacity-30"
            style={{ borderColor: PRESS.rule, fontFamily: SERIF }}
            placeholder=""
          />
          <div className="flex flex-wrap items-center gap-5 mt-5">
            <button
              onClick={() => void declare(draftName.trim() || null)}
              disabled={busy}
              className="px-6 py-2.5 text-[14px] tracking-wide disabled:opacity-30"
              style={{ background: PRESS.accent, color: PRESS.ink }}
            >
              {busy ? '…' : 'Begin'}
            </button>
            <span className="text-[13px] opacity-45">
              You can leave the name blank and add it later.
            </span>
            <button
              onClick={() => {
                setDeclaring(false);
                setDraftName('');
              }}
              className="text-[13px] opacity-50 hover:opacity-80 ml-auto"
            >
              cancel
            </button>
          </div>
        </div>
      )}

      {works.map((w) => (
        <div key={w.id} className="mb-8">
          {/* An unnamed work is shown as the relationship, never as a name.
              "Your work" is orientation; nothing by that name is stored.
              Omitted when the arrival headline is already saying it. */}
          {w.id !== arrivalWorkId && (
            <p
              className="text-[22px] md:text-[24px] leading-snug mb-2"
              style={{ fontFamily: SERIF, opacity: w.title ? 1 : 0.75 }}
            >
              {w.title ?? 'Your work'}
            </p>
          )}

          {naming === w.id ? (
            <div className="max-w-md mt-3">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && nameValue.trim() && !busy) void rename(w.id, nameValue.trim());
                  if (e.key === 'Escape') setNaming(null);
                }}
                autoFocus
                aria-label="Name this work"
                className="press-field w-full bg-transparent border-b py-2 text-[18px] outline-none"
                style={{ borderColor: PRESS.rule, fontFamily: SERIF }}
              />
              <div className="flex items-center gap-5 mt-4">
                <button
                  onClick={() => void rename(w.id, nameValue.trim())}
                  disabled={busy || !nameValue.trim()}
                  className="px-5 py-2 text-[13px] tracking-wide disabled:opacity-30"
                  style={{ background: PRESS.accent, color: PRESS.ink }}
                >
                  Save
                </button>
                <button
                  onClick={() => setNaming(null)}
                  className="text-[13px] opacity-50 hover:opacity-80"
                >
                  cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-5 text-[13px]">
              <button
                onClick={() => {
                  setNaming(w.id);
                  setNameValue(w.title ?? '');
                  setConfirmingWithdraw(null);
                }}
                className="underline underline-offset-4 opacity-70 hover:opacity-100 min-h-[44px]"
              >
                {w.title ? 'Rename' : 'Name it'}
              </button>

              {confirmingWithdraw === w.id ? (
                /* Proportionate: a second click, in place, with the consequence
                   stated plainly. No modal, and no language that suggests the
                   work is being finished or deleted. */
                <span className="flex flex-wrap items-center gap-4">
                  <span className="opacity-70">
                    Withdraw this declaration? Nothing you have written is affected
                    {w.title ? ', though the name is not kept' : ''}.
                  </span>
                  <button
                    onClick={() => void withdraw(w.id)}
                    disabled={busy}
                    className="underline underline-offset-4 opacity-100 min-h-[44px] disabled:opacity-30"
                  >
                    {busy ? '…' : 'Withdraw'}
                  </button>
                  <button
                    onClick={() => setConfirmingWithdraw(null)}
                    className="opacity-50 hover:opacity-80"
                  >
                    cancel
                  </button>
                </span>
              ) : (
                <button
                  onClick={() => {
                    setConfirmingWithdraw(w.id);
                    setNaming(null);
                  }}
                  className="opacity-45 hover:opacity-80 min-h-[44px]"
                >
                  Withdraw
                </button>
              )}
            </div>
          )}

          {renderWorkBody?.(w)}
        </div>
      ))}

      {works.length > 0 && !declaring && (
        <button
          onClick={() => setDeclaring(true)}
          className="text-[13px] underline underline-offset-4 opacity-50 hover:opacity-85 min-h-[44px]"
        >
          Begin another work
        </button>
      )}

      {failure && (
        <p role="alert" className="text-[13px] mt-5 opacity-80">
          {failure}
        </p>
      )}
    </section>
  );
}
