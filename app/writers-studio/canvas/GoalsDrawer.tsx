'use client';

import { useState } from 'react';
import { PRESS, SERIF } from '../pressTheme';
import {
  declareGoal,
  progressFor,
  progressLabel,
  releaseGoal,
  setGoalStanding,
  type Measurable,
  type WriterGoal,
} from '@/lib/writersStudio/goalsClient';

/**
 * GOALS — what the writer is aiming at, in their own words.
 *
 *     The writer declares the goal.
 *     The system may measure progress against it.
 *     MAIA may not invent the goal.
 *
 * WHAT THIS SURFACE REFUSES TO DRAW, and why each absence is the product:
 *
 *   NO PROGRESS BARS. Reference 04 draws three gold ones and StudioLowerBand
 *   already records them as "the single most tempting thing in the reference to
 *   fake". A bar is a shape that says how full you are; the figure "2,140 /
 *   3,000 words" says what was counted. The first is a feeling about the
 *   writer, the second is arithmetic about the work.
 *
 *   NO PACE, NO PROJECTION, NO STREAK, NO "BEHIND" (FR-10). A by-when is shown
 *   as the date the writer named. Nothing here computes with it — there is no
 *   function in goalsClient.ts that takes a date and returns a judgement, so
 *   this component could not render one if it tried.
 *
 *   NO NUMBER ON AN INTENTION (FR-09). The type makes it unreachable: a
 *   WriterGoal of kind 'intention' has no `target` field to read.
 *
 *   NO EDITING OF TERMS. A goal's standing moves; its target does not. A writer
 *   who wants different terms releases this one and declares what they mean, so
 *   the record says what happened instead of showing a moved target as the
 *   original aim.
 */
export default function GoalsDrawer({
  manuscriptId,
  goals,
  counts,
  sections,
  currentSectionId,
  onChanged,
}: {
  manuscriptId: string;
  goals: WriterGoal[] | null;
  counts: Measurable;
  sections: readonly { id: string; heading: string | null }[];
  currentSectionId?: string | null;
  onChanged: () => void;
}) {
  const [kind, setKind] = useState<'measurable' | 'intention'>('intention');
  const [statement, setStatement] = useState('');
  const [target, setTarget] = useState('');
  const [metric, setMetric] = useState<'words' | 'sections'>('words');
  const [anchorHere, setAnchorHere] = useState(false);
  const [byWhen, setByWhen] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const currentHeading = sections.find((s) => s.id === currentSectionId)?.heading ?? null;
  /* A section count is a whole-manuscript figure; the server refuses the
     combination, so the surface does not offer it. */
  const canAnchor = currentSectionId != null && !(kind === 'measurable' && metric === 'sections');

  const declare = async () => {
    if (statement.trim().length === 0 || busy) return;
    const n = Number(target);
    if (kind === 'measurable' && (!Number.isInteger(n) || n <= 0)) {
      setFailed('A measurable goal needs a whole number above zero.');
      return;
    }
    setBusy(true);
    setFailed(null);
    try {
      const sectionId = canAnchor && anchorHere ? currentSectionId ?? null : null;
      await declareGoal(
        manuscriptId,
        kind === 'measurable'
          ? { kind, statement, metric, target: n, sectionId, byWhen: byWhen || null }
          : { kind, statement, sectionId, byWhen: byWhen || null },
      );
      setStatement('');
      setTarget('');
      setByWhen('');
      onChanged();
    } catch {
      setFailed('Could not record that just now. Your words are still here.');
    } finally {
      setBusy(false);
    }
  };

  const move = async (id: string, standing: 'open' | 'met' | 'set_aside') => {
    setBusy(true);
    setFailed(null);
    try {
      await setGoalStanding(manuscriptId, id, standing);
      onChanged();
    } catch {
      setFailed('Could not change that just now.');
    } finally {
      setBusy(false);
    }
  };

  const release = async (id: string) => {
    setBusy(true);
    setFailed(null);
    try {
      await releaseGoal(manuscriptId, id);
      onChanged();
    } catch {
      setFailed('Could not release that just now.');
    } finally {
      setBusy(false);
    }
  };

  const open = (goals ?? []).filter((g) => g.standing === 'open');
  const closed = (goals ?? []).filter((g) => g.standing !== 'open');

  return (
    <div className="space-y-5" data-panel-role="goals">
      <section>
        <div className="flex gap-3 mb-2">
          {(['intention', 'measurable'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              data-goal-kind-choice={k}
              className="text-[11.5px] underline underline-offset-4"
              style={{ opacity: kind === k ? 0.85 : 0.35 }}
            >
              {k === 'intention' ? 'an intention' : 'something countable'}
            </button>
          ))}
        </div>
        <textarea
          value={statement}
          onChange={(e) => setStatement(e.target.value)}
          placeholder={
            kind === 'intention'
              ? 'What are you aiming at, in your words?'
              : 'What are you aiming at? (the number is only the part we can count)'
          }
          rows={2}
          className="w-full bg-transparent border px-3 py-2 text-[13.5px] leading-relaxed outline-none placeholder:opacity-35 resize-none"
          style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
        />

        {kind === 'measurable' && (
          <div className="flex items-center gap-2 mt-2">
            <input
              value={target}
              onChange={(e) => setTarget(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="3000"
              className="w-24 bg-transparent border-b py-1 text-[13px] outline-none"
              style={{ borderColor: PRESS.ruleSoft }}
            />
            <button
              type="button"
              onClick={() => setMetric((m) => (m === 'words' ? 'sections' : 'words'))}
              className="text-[11.5px] opacity-45 hover:opacity-75 underline underline-offset-4"
            >
              {metric}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-2 gap-3 flex-wrap">
          {canAnchor ? (
            <button
              type="button"
              onClick={() => setAnchorHere((v) => !v)}
              className="text-[11.5px] opacity-45 hover:opacity-75 underline underline-offset-4"
            >
              {anchorHere ? `in “${currentHeading ?? 'this section'}”` : 'across the manuscript'}
            </button>
          ) : (
            <span className="text-[11.5px] opacity-30">across the manuscript</span>
          )}
          {/* FR-10 — a date the writer names. Nothing computes with it. */}
          <input
            type="date"
            value={byWhen}
            onChange={(e) => setByWhen(e.target.value)}
            aria-label="by when, if you want one"
            className="bg-transparent border-b py-1 text-[11.5px] opacity-50 outline-none"
            style={{ borderColor: PRESS.ruleSoft }}
          />
          <button
            type="button"
            disabled={busy || statement.trim().length === 0}
            onClick={() => void declare()}
            className="text-[12px] opacity-60 hover:opacity-95 underline underline-offset-4 disabled:opacity-25"
          >
            declare it
          </button>
        </div>
      </section>

      {failed && <p className="text-[12px] opacity-60">{failed}</p>}

      {goals === null && <p className="text-[12.5px] opacity-40">reading your goals…</p>}

      {goals !== null && goals.length === 0 && (
        <p className="text-[12.5px] opacity-40 leading-relaxed">
          Nothing declared. A goal here is yours — nothing sets one for you, and
          nothing here will tell you whether you are keeping up.
        </p>
      )}

      {[
        { rows: open, label: null as string | null },
        { rows: closed, label: 'no longer open' },
      ].map(({ rows, label }) =>
        rows.length === 0 ? null : (
          <section key={label ?? 'open'}>
            {label && (
              <p className="text-[10.5px] tracking-[0.15em] uppercase opacity-30 mb-2">{label}</p>
            )}
            <ul className="space-y-2.5">
              {rows.map((g) => {
                const p = progressFor(g, counts);
                const figure = progressLabel(p);
                return (
                  <li
                    key={g.id}
                    className="border px-3 py-2.5"
                    style={{ borderColor: PRESS.ruleSoft, opacity: g.standing === 'open' ? 1 : 0.5 }}
                    data-goal-kind={g.kind}
                    data-goal-progress={p.kind}
                  >
                    <p className="text-[13.5px] leading-relaxed" style={{ fontFamily: SERIF }}>
                      {g.statement}
                    </p>
                    {figure && (
                      <p className="text-[12px] opacity-55 mt-1" data-goal-figure>
                        {figure}
                      </p>
                    )}
                    <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                      {g.anchorHeading && g.sectionId === null && (
                        <span className="text-[11px] opacity-35">
                          Previously in “{g.anchorHeading}”
                        </span>
                      )}
                      {g.sectionId && (
                        <span className="text-[11px] opacity-35">
                          in “{sections.find((s) => s.id === g.sectionId)?.heading ?? g.anchorHeading ?? 'a section'}”
                        </span>
                      )}
                      {/* The writer's date, shown as a date. Never a countdown. */}
                      {g.byWhen && <span className="text-[11px] opacity-30">by {g.byWhen}</span>}
                      <span className="flex-1" />
                      {g.standing === 'open' ? (
                        <>
                          <button
                            disabled={busy}
                            onClick={() => void move(g.id, 'met')}
                            className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                          >
                            met
                          </button>
                          <button
                            disabled={busy}
                            onClick={() => void move(g.id, 'set_aside')}
                            className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                          >
                            set aside
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={busy}
                          onClick={() => void move(g.id, 'open')}
                          className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                        >
                          reopen
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => void release(g.id)}
                        className="text-[11px] opacity-30 hover:opacity-70 underline underline-offset-4"
                      >
                        release
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ),
      )}
    </div>
  );
}
