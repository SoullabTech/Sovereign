'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { diffLines, toHunks } from '@/lib/studio/diff';
import {
  formatWhen,
  loadDraft,
  pageEstimate,
  restoreRevision,
  newIdempotencyKey,
  type RevisionSummary,
} from '../../press/manuscript/workingDraftClient';

/**
 * Versions — keep, compare, restore.
 *
 * The engine has written revisions since R1 and nothing surfaced them beyond a
 * list of dates, which is the same as not having versions at all: a writer who
 * cannot see what a version contains will not restore one, and a writer who
 * will not restore one cannot experiment.
 *
 * Two rules hold everything here:
 *
 *   · RESTORING DESTROYS NOTHING. A restore writes a NEW revision carrying the
 *     restored text (the route's own guarantee), so the text being displaced
 *     is already an immutable revision and the restore is itself restorable.
 *     The panel says so, because a writer will not believe it otherwise.
 *
 *   · COMPARE BEFORE RESTORE. The compare view opens from the version, not
 *     from a separate screen, so "what would I be going back to" is answered
 *     in the place where the question is asked.
 */

interface Props {
  manuscriptId: string;
  revisions: RevisionSummary[] | null;
  /** A restore landed: the table must reload from the restored text. */
  onRestored: () => void;
}

/**
 * The panel reads the SAVED draft itself rather than being handed the text
 * from the table. Two reasons: it keeps the whole draft out of the room's
 * state on every keystroke, and it makes the comparison honestly about what is
 * saved — which is what a version would actually be restored over. The label
 * says "saved draft" for exactly that reason.
 */
export default function VersionsPanel({ manuscriptId, revisions, onRestored }: Props) {
  const [comparing, setComparing] = useState<number | null>(null);
  const [olderText, setOlderText] = useState<string | null>(null);
  const [savedText, setSavedText] = useState<string | null>(null);
  const [baseRevisionId, setBaseRevisionId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  const compare = async (revisionNumber: number) => {
    if (comparing === revisionNumber) {
      setComparing(null);
      setOlderText(null);
      return;
    }
    setBusy(true);
    setFailed(null);
    setComparing(revisionNumber);
    setOlderText(null);
    try {
      const [res, current] = await Promise.all([
        apiFetch(`/api/sovereign/manuscripts/${manuscriptId}/draft/revisions/${revisionNumber}`, {
          method: 'GET',
        }),
        loadDraft(apiFetch, manuscriptId),
      ]);
      if (!res.ok || current.kind !== 'ok') {
        setFailed('That version could not be opened just now.');
        setComparing(null);
        return;
      }
      const data = await res.json();
      setSavedText(current.content);
      setBaseRevisionId(current.revisionId);
      setOlderText(typeof data.content === 'string' ? data.content : '');
    } catch {
      setFailed('That version could not be reached just now.');
      setComparing(null);
    } finally {
      setBusy(false);
    }
  };

  const restore = async (revisionNumber: number) => {
    setBusy(true);
    setFailed(null);
    try {
      // Read the guard fresh at the moment of restoring. A stale one taken
      // when the panel opened would either fail needlessly or, worse, restore
      // over writing done since.
      const current = await loadDraft(apiFetch, manuscriptId);
      if (current.kind !== 'ok') {
        setFailed('Nothing was restored — the draft could not be read just now.');
        return;
      }
      const res = await restoreRevision(apiFetch, manuscriptId, revisionNumber, {
        baseRevisionId: current.revisionId,
        idempotencyKey: newIdempotencyKey(),
      });
      if (res.kind === 'conflict') {
        setFailed(
          'The draft moved while this was open, so nothing was restored. Reopen the room and try again.',
        );
        return;
      }
      if (res.kind === 'error') {
        setFailed('Nothing was restored — that could not be reached just now.');
        return;
      }
      setConfirm(null);
      setComparing(null);
      setOlderText(null);
      onRestored();
    } finally {
      setBusy(false);
    }
  };

  if (revisions === null) return <p className="text-[13px] opacity-40">opening…</p>;

  return (
    <div>
      <p className="text-[12px] leading-relaxed opacity-45 mb-3">
        Autosave holds your latest words continuously. Versions you keep are set down here, and
        nothing is ever silently overwritten.
      </p>

      {revisions.length === 0 ? (
        <p className="text-[13px] opacity-55 leading-relaxed">
          No kept versions yet. “Keep a version” at the table sets one down.
        </p>
      ) : (
        <ul className="space-y-2">
          {revisions.map((r) => {
            const open = comparing === r.revisionNumber;
            const pages = pageEstimate(r.contentChars);
            return (
              <li
                key={r.revisionNumber}
                className="border px-3.5 py-2.5"
                style={{ borderColor: PRESS.ruleSoft }}
              >
                <p className="text-[12.5px]">
                  Version {r.revisionNumber}
                  {r.note ? ` — ${r.note}` : ''}
                </p>
                <p className="text-[11px] opacity-45 mt-0.5">
                  ~{pages} page{pages === 1 ? '' : 's'} · {formatWhen(r.createdAt)}
                </p>

                <div className="flex flex-wrap gap-x-3.5 gap-y-1 mt-1.5">
                  <button
                    onClick={() => void compare(r.revisionNumber)}
                    disabled={busy && !open}
                    className="text-[10.5px] tracking-[0.12em] uppercase opacity-40 hover:opacity-90 disabled:opacity-20"
                  >
                    {open ? 'close' : 'Compare'}
                  </button>
                  <button
                    onClick={() => setConfirm(r.revisionNumber)}
                    disabled={busy}
                    className="text-[10.5px] tracking-[0.12em] uppercase opacity-40 hover:opacity-90 disabled:opacity-20"
                  >
                    Restore
                  </button>
                </div>

                {confirm === r.revisionNumber && (
                  <div className="mt-2 border-l pl-3" style={{ borderColor: PRESS.rule }}>
                    <p className="text-[12px] leading-relaxed opacity-70 mb-1.5">
                      Put version {r.revisionNumber} back on the table? What is there now becomes a
                      version too — nothing is lost either way.
                    </p>
                    <div className="flex gap-3.5">
                      <button
                        onClick={() => void restore(r.revisionNumber)}
                        disabled={busy}
                        className="text-[11.5px] underline underline-offset-4 opacity-85 hover:opacity-100 disabled:opacity-30"
                        style={{ color: PRESS.accent }}
                      >
                        {busy ? 'restoring…' : 'restore it'}
                      </button>
                      <button
                        onClick={() => setConfirm(null)}
                        className="text-[11.5px] opacity-45 hover:opacity-80"
                      >
                        not now
                      </button>
                    </div>
                  </div>
                )}

                {open && <Comparison older={olderText} newer={savedText} />}
              </li>
            );
          })}
        </ul>
      )}

      {failed && <p className="text-[12px] opacity-65 mt-3 leading-relaxed">{failed}</p>}
    </div>
  );
}

/** What changed between a kept version and the words on the table now. */
function Comparison({ older, newer }: { older: string | null; newer: string | null }) {
  if (older === null || newer === null) {
    return <p className="text-[12px] opacity-40 mt-2">opening…</p>;
  }

  const diff = diffLines(older, newer);
  if (diff.tooLarge) {
    return (
      <p className="text-[12px] opacity-55 mt-2 leading-relaxed">
        These versions are too long to compare line by line here.
      </p>
    );
  }
  if (diff.added === 0 && diff.removed === 0) {
    return (
      <p className="text-[12px] opacity-55 mt-2">Identical to your saved draft.</p>
    );
  }

  const hunks = toHunks(diff.lines);
  return (
    <div className="mt-2">
      <p className="text-[11px] opacity-45 mb-1.5">
        Against your saved draft: {diff.added} line{diff.added === 1 ? '' : 's'} added ·{' '}
        {diff.removed} removed
      </p>
      <div
        className="max-h-64 overflow-y-auto border-l pl-3 space-y-0.5"
        style={{ borderColor: PRESS.rule }}
      >
        {hunks.map((h, i) =>
          h.kind === 'collapsed' ? (
            <p key={i} className="text-[10.5px] opacity-25 py-1">
              … {h.count} unchanged line{h.count === 1 ? '' : 's'}
            </p>
          ) : (
            h.lines.map((line, k) => (
              <p
                key={`${i}-${k}`}
                className="text-[12px] leading-[1.55] whitespace-pre-wrap"
                style={{
                  fontFamily: SERIF,
                  opacity: line.kind === 'same' ? 0.35 : 0.85,
                  color: line.kind === 'added' ? PRESS.accent : undefined,
                  textDecoration: line.kind === 'removed' ? 'line-through' : undefined,
                }}
              >
                {line.text || ' '}
              </p>
            ))
          ),
        )}
      </div>
    </div>
  );
}
