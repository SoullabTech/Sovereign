'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks, type LivingWork } from '@/app/writers-studio/useLivingWorks';

type Props = {
  ideaId: string;
};

const workName = (work: LivingWork) => work.title?.trim() || 'Unnamed Work';

export default function IdeaWorkBridge({ ideaId }: Props) {
  const { phase, works, reload } = useLivingWorks();
  const [open, setOpen] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [sentence, setSentence] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const belonging = useMemo(
    () => works.flatMap((work) => {
      const material = work.materials.find(
        (candidate) => candidate.materialType === 'idea' && candidate.materialId === ideaId,
      );
      return material ? [{ work, material }] : [];
    }),
    [works, ideaId],
  );

  const candidates = useMemo(
    () => works.filter((work) =>
      !work.materials.some(
        (material) => material.materialType === 'idea' && material.materialId === ideaId,
      )),
    [works, ideaId],
  );

  const selected = candidates.find((work) => work.id === selectedWorkId) ?? null;

  const bring = async (work: LivingWork) => {
    if (busyKey) return;
    setBusyKey(work.id);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialType: 'idea',
          materialId: ideaId,
          sentence,
        }),
      });
      if (!res.ok) {
        setMessage('That relationship could not be saved just now. The Idea has not changed.');
        return;
      }
      await reload();
      setSelectedWorkId(null);
      setSentence('');
      setOpen(false);
      setMessage(`This Idea now feeds ${workName(work)}. The Idea itself is unchanged.`);
    } catch {
      setMessage('That relationship could not be saved just now. The Idea has not changed.');
    } finally {
      setBusyKey(null);
    }
  };

  const remove = async (work: LivingWork) => {
    if (busyKey) return;
    setBusyKey(work.id);
    setMessage(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType: 'idea', materialId: ideaId }),
      });
      if (!res.ok) {
        setMessage('That relationship could not be removed just now. The Idea has not changed.');
        return;
      }
      await reload();
      setMessage(`This Idea no longer feeds ${workName(work)}. The Idea itself is still here.`);
    } catch {
      setMessage('That relationship could not be removed just now. The Idea has not changed.');
    } finally {
      setBusyKey(null);
    }
  };

  if (phase === 'loading' || phase === 'unauthorized') return null;

  if (phase === 'error') {
    return (
      <section className="mb-7 rounded-xl border border-stone-800/70 bg-stone-900/20 p-4">
        <p className="text-xs text-stone-500">
          Your Works could not be reached just now. This Idea is unchanged.
        </p>
      </section>
    );
  }

  return (
    <section
      className="mb-7 rounded-xl border border-amber-500/15 bg-amber-500/[0.025] p-4"
      data-idea-work-bridge
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-amber-300/55 font-medium">
            In relation to your Work
          </p>
          <h2
            className="mt-1 text-[17px] text-stone-200 font-light"
            style={{ fontFamily: 'Spectral, Georgia, serif' }}
          >
            Let this idea feed a Work
          </h2>
          <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-stone-500">
            The Idea stays here. Nothing is copied into your manuscript. This only records that you say the Idea feeds a Work.
          </p>
        </div>
        {candidates.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setOpen((value) => !value);
              setSelectedWorkId(null);
              setSentence('');
              setMessage(null);
            }}
            className="flex-none text-xs text-amber-300/70 hover:text-amber-200 transition-colors"
          >
            {open ? 'Close' : 'Bring to a Work'}
          </button>
        ) : null}
      </div>

      {belonging.length > 0 ? (
        <div className="mt-4 space-y-2">
          {belonging.map(({ work, material }) => (
            <div
              key={work.id}
              className="rounded-lg border border-stone-800/70 bg-stone-950/20 px-3.5 py-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-stone-200" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                    Feeds {workName(work)}
                  </p>
                  {material.sentence ? (
                    <p className="mt-1 text-xs leading-relaxed text-stone-400">
                      “{material.sentence}”
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] text-stone-600">brought without a note</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={busyKey === work.id}
                  onClick={() => void remove(work)}
                  className="flex-none text-[11px] text-stone-600 hover:text-stone-400 disabled:opacity-40 transition-colors"
                >
                  no longer feeds this Work
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {works.length === 0 ? (
        <p className="mt-4 text-xs leading-relaxed text-stone-500">
          You have not declared a Work yet.{' '}
          <Link href="/writers-studio" className="text-amber-300/65 hover:text-amber-200 underline underline-offset-4">
            Begin a Work in Writer’s Studio
          </Link>
          {' '}when this idea asks for one.
        </p>
      ) : null}

      {open && candidates.length > 0 ? (
        <div className="mt-4 border-t border-stone-800/70 pt-4" data-idea-work-chooser>
          {!selected ? (
            <>
              <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-stone-600">
                Which Work does this feed?
              </p>
              <div className="space-y-2">
                {candidates.map((work) => (
                  <button
                    key={work.id}
                    type="button"
                    onClick={() => {
                      setSelectedWorkId(work.id);
                      setSentence('');
                    }}
                    className="block w-full rounded-lg border border-stone-800/70 px-3.5 py-3 text-left hover:border-amber-500/25 hover:bg-amber-500/[0.025] transition-colors"
                  >
                    <span className="block text-sm text-stone-200" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                      {workName(work)}
                    </span>
                    {work.purpose ? (
                      <span className="mt-1 block text-[11px] leading-relaxed text-stone-600">
                        {work.purpose}
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-stone-800/70 bg-stone-950/20 p-3.5">
              <p className="text-sm text-stone-200" style={{ fontFamily: 'Spectral, Georgia, serif' }}>
                Bring this idea to {workName(selected)}
              </p>
              <textarea
                value={sentence}
                onChange={(event) => setSentence(event.target.value)}
                rows={2}
                maxLength={2000}
                placeholder="What does this feed? In your words — or leave it unwritten."
                className="mt-2 w-full resize-none rounded-lg border border-stone-800 bg-transparent p-2.5 text-xs leading-relaxed text-stone-300 outline-none placeholder:text-stone-700 focus:border-amber-500/30"
              />
              <div className="mt-2.5 flex items-center gap-4">
                <button
                  type="button"
                  disabled={busyKey === selected.id}
                  onClick={() => void bring(selected)}
                  className="text-xs text-amber-300/80 hover:text-amber-200 disabled:opacity-40 transition-colors"
                >
                  Bring it to this Work
                </button>
                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => {
                    setSelectedWorkId(null);
                    setSentence('');
                  }}
                  className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                >
                  choose another
                </button>
                <button
                  type="button"
                  disabled={Boolean(busyKey)}
                  onClick={() => {
                    setOpen(false);
                    setSelectedWorkId(null);
                    setSentence('');
                  }}
                  className="text-xs text-stone-600 hover:text-stone-400 transition-colors"
                >
                  not now
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}

      {message ? (
        <p className="mt-3 text-[11px] leading-relaxed text-stone-500" role="status">{message}</p>
      ) : null}
    </section>
  );
}
