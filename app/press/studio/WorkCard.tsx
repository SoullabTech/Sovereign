'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Feather, X } from 'lucide-react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from './pressTheme';
import { UNTITLED_EXPRESSION } from './shellIdentity';
import { WRITE_HREF } from './studioMap';
import { STAGES, type LivingWork } from './useLivingWorks';
import type { CurrentManuscript } from './useCurrentManuscript';

/**
 * One project, as a member sees it (Work Home, Slice 6d): title · intention ·
 * what it holds · where to continue. The Work model stays underneath; the
 * card speaks the member's language, not the schema's.
 *
 * WHAT THE CARD REFUSES TO SAY: a type ("book project") or a stage
 * ("developing") the member never declared. Both are on the
 * NEVER_AUTHORED_BY_THE_SYSTEM list; until a member-declared field exists,
 * the card shows the member's own intention words and when-facts, nothing
 * inferred. "last changed X" is a fact; "stalled" would be a verdict.
 */

interface WorkCardProps {
  work: LivingWork;
  manuscripts: CurrentManuscript[];
  reload: () => Promise<void>;
}

const byIdentity = (href: string, manuscriptId: string) =>
  `${href}&m=${encodeURIComponent(manuscriptId)}`;

const timeAgo = (iso: string): string => {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
};

export default function WorkCard({ work, manuscripts, reload }: WorkCardProps) {
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameValue, setNameValue] = useState('');
  const [confirmingWithdraw, setConfirmingWithdraw] = useState(false);
  const [editingIntent, setEditingIntent] = useState(false);
  const [intentValue, setIntentValue] = useState('');
  const [editingForm, setEditingForm] = useState(false);
  const [formValue, setFormValue] = useState('');

  const patch = async (body: Record<string, unknown>, after: () => void) => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(String(res.status));
      after();
      await reload();
    } catch {
      setFailure('Could not save that just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(String(res.status));
      await reload();
    } catch {
      setFailure('Could not withdraw that just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const removePiece = async (manuscriptId: string) => {
    setBusy(true);
    setFailure(null);
    try {
      const res = await apiFetch(
        `/api/sovereign/living-works/${work.id}/expressions?expressionType=manuscript&expressionId=${encodeURIComponent(manuscriptId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error(String(res.status));
      await reload();
    } catch {
      setFailure('Could not remove that just now. Nothing was changed.');
    } finally {
      setBusy(false);
    }
  };

  const placed = work.expressions
    .filter((e) => e.expressionType === 'manuscript')
    .map((e) => manuscripts.find((m) => m.id === e.expressionId))
    .filter((m): m is CurrentManuscript => Boolean(m));
  const latest = placed.length ? placed[placed.length - 1] : null;

  return (
    <div
      className="border p-6 flex flex-col"
      style={{ borderColor: PRESS.ruleSoft, background: 'rgba(0,0,0,0.15)' }}
    >
      {/* Identity row */}
      <div className="flex items-start gap-2.5 mb-1">
        <span style={{ color: PRESS.accent }} className="mt-1 shrink-0">
          <Feather size={16} strokeWidth={1.5} />
        </span>
        {renaming ? (
          <input
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && nameValue.trim() && !busy)
                void patch({ title: nameValue.trim() }, () => setRenaming(false));
              if (e.key === 'Escape') setRenaming(false);
            }}
            autoFocus
            aria-label="Name this project"
            className="press-field w-full bg-transparent border-b py-0.5 text-[17px] outline-none"
            style={{ borderColor: PRESS.rule, fontFamily: SERIF }}
          />
        ) : (
          <p
            className="text-[18px] leading-snug"
            style={{ fontFamily: SERIF, opacity: work.title ? 0.95 : 0.6 }}
          >
            {work.title ?? 'Untitled project'}
          </p>
        )}
      </div>

      {/* Form · Stage — the member's own words, shown only when stated.
          Stage is orientation ("where am I?"), never progress: the chips are
          claims the member makes and unmakes; the system never advances one. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2 text-[12px]">
        {editingForm ? (
          <input
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !busy)
                void patch({ form: formValue.trim() ? formValue.trim() : null }, () =>
                  setEditingForm(false)
                );
              if (e.key === 'Escape') setEditingForm(false);
            }}
            autoFocus
            aria-label="What form is this taking?"
            placeholder="Book · Blog · Course…"
            className="press-field bg-transparent border-b py-0.5 text-[12px] outline-none w-36 placeholder:opacity-30"
            style={{ borderColor: PRESS.rule }}
          />
        ) : (
          <button
            onClick={() => {
              setFormValue(work.form ?? '');
              setEditingForm(true);
            }}
            className={`underline underline-offset-4 ${work.form ? 'opacity-70' : 'opacity-35'} hover:opacity-90`}
            style={work.form ? { color: PRESS.accent } : undefined}
          >
            {work.form ?? 'form?'}
          </button>
        )}
        <span className="opacity-25">·</span>
        {STAGES.map((s) => (
          <button
            key={s}
            onClick={() => void patch({ stage: work.stage === s ? null : s }, () => undefined)}
            disabled={busy}
            title={work.stage === s ? 'Click to unclaim this stage' : `I am ${s}`}
            className={`capitalize min-h-[28px] ${
              work.stage === s
                ? 'opacity-100 underline underline-offset-4'
                : 'opacity-30 hover:opacity-70'
            } disabled:opacity-20`}
            style={work.stage === s ? { color: PRESS.accent } : undefined}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Intention — the member's own words, or the invitation to state them. */}
      {editingIntent ? (
        <div className="mt-1 mb-3">
          <textarea
            value={intentValue}
            onChange={(e) => setIntentValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setEditingIntent(false);
            }}
            autoFocus
            rows={2}
            aria-label="What is this project?"
            className="press-field w-full bg-transparent border-b py-1 text-[13px] leading-relaxed outline-none"
            style={{ borderColor: PRESS.rule, fontFamily: SERIF }}
          />
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() =>
                void patch({ purpose: intentValue.trim() ? intentValue.trim() : null }, () =>
                  setEditingIntent(false)
                )
              }
              disabled={busy}
              className="px-3 py-1 text-[12px] disabled:opacity-30"
              style={{ background: PRESS.accent, color: PRESS.ink }}
            >
              Save
            </button>
            <button
              onClick={() => setEditingIntent(false)}
              className="text-[12px] opacity-50 hover:opacity-80"
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setIntentValue(work.purpose ?? '');
            setEditingIntent(true);
          }}
          className={`text-left text-[13px] leading-relaxed mb-3 ${work.purpose ? 'opacity-65' : 'opacity-40 underline underline-offset-4'} hover:opacity-85`}
          style={{ fontFamily: SERIF }}
        >
          {work.purpose ?? 'What is this? — say it in your own words'}
        </button>
      )}

      {/* What it holds — each piece is one member declaration, removable. */}
      {placed.length > 0 && (
        <ul className="mb-4">
          {placed.map((m) => (
            <li key={m.id} className="flex items-center gap-2 text-[13px] mb-1.5">
              <Link
                href={byIdentity(WRITE_HREF, m.id)}
                className="underline underline-offset-4 opacity-70 hover:opacity-100"
                style={m.title ? undefined : { opacity: 0.5 }}
              >
                {m.title ?? UNTITLED_EXPRESSION}
              </Link>
              <button
                onClick={() => void removePiece(m.id)}
                disabled={busy}
                aria-label={`Remove ${m.title ?? 'this piece'} from this project`}
                title="Remove from this project (the writing is untouched)"
                className="opacity-30 hover:opacity-70 disabled:opacity-20"
              >
                <X size={13} strokeWidth={1.5} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Continue — into the latest piece, by identity. */}
      <div className="mt-auto">
        {latest ? (
          <Link
            href={byIdentity(WRITE_HREF, latest.id)}
            className="inline-block px-5 py-2.5 text-[13px] tracking-wide mb-3"
            style={{ background: PRESS.accent, color: PRESS.ink }}
          >
            Continue Developing
          </Link>
        ) : (
          <p className="text-[12px] opacity-40 mb-3">Nothing placed here yet.</p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-[12px]">
          <span className="opacity-35">
            {placed.length > 0 &&
              `${placed.length} piece${placed.length === 1 ? '' : 's'} gathered · `}
            last worked {timeAgo(work.updatedAt)}
          </span>
          <button
            onClick={() => {
              setNameValue(work.title ?? '');
              setRenaming(true);
              setConfirmingWithdraw(false);
            }}
            className="underline underline-offset-4 opacity-45 hover:opacity-80"
          >
            {work.title ? 'Rename' : 'Name it'}
          </button>
          {confirmingWithdraw ? (
            <span className="flex items-center gap-3">
              <span className="opacity-60">Withdraw? Your writing is untouched.</span>
              <button
                onClick={() => void withdraw()}
                disabled={busy}
                className="underline underline-offset-4 opacity-90 disabled:opacity-30"
              >
                Withdraw
              </button>
              <button
                onClick={() => setConfirmingWithdraw(false)}
                className="opacity-50 hover:opacity-80"
              >
                cancel
              </button>
            </span>
          ) : (
            <button
              onClick={() => {
                setConfirmingWithdraw(true);
                setRenaming(false);
              }}
              className="opacity-35 hover:opacity-70"
            >
              Withdraw
            </button>
          )}
        </div>

        {failure && (
          <p role="alert" className="text-[12px] mt-3 opacity-80">
            {failure}
          </p>
        )}
      </div>
    </div>
  );
}
