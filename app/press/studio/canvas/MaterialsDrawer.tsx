'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { IMPORT_HREF, SOURCE_HREF } from '../studioMap';
import { formatWhen } from '../../manuscript/workingDraftClient';
import type { CurrentManuscript } from '../useCurrentManuscript';
import type { LivingWork } from '../useLivingWorks';

/**
 * The Materials drawer — what feeds this work (Work Continuity Layer, first
 * slice; design: WORK_MATERIALS_GATHERING_DESIGN_2026-08-05.md + walk M1–M7).
 *
 * A material is a BELONGING, not a thing: the member's sentence renders
 * first, the thing's name second, its home stated plainly. Bringing is the
 * member's gesture — THE CROSSING IS THE CONSENT EVENT — and un-belonging
 * removes the relationship, never the thing. First material type:
 * 'manuscript' (platform-native things first, walk M1).
 *
 * The manuscript's own Source keeps its v0.1 place here as provenance of
 * the draft — one true item in "what feeds this work", not the whole answer.
 */

interface MaterialsDrawerProps {
  /** The work this drawer is about (united, or the member's only work). */
  work: LivingWork | null;
  /** The manuscript on the table (its Source renders as provenance). */
  manuscript: CurrentManuscript | null;
  /** All the member's manuscripts — the things they can bring. */
  manuscripts: CurrentManuscript[];
  onChanged: () => void;
}

export default function MaterialsDrawer({
  work,
  manuscript,
  manuscripts,
  onChanged,
}: MaterialsDrawerProps) {
  const [bringing, setBringing] = useState<string | null>(null); // manuscript id being brought
  const [sentence, setSentence] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const titleOf = (id: string) =>
    manuscripts.find((m) => m.id === id)?.title ?? 'an unnamed manuscript';

  const bring = async (materialId: string) => {
    if (!work) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType: 'manuscript', materialId, sentence }),
      });
      if (!res.ok) {
        setFailed('Could not bring that in just now.');
        return;
      }
      setBringing(null);
      setSentence('');
      onChanged();
    } catch {
      setFailed('Could not bring that in just now.');
    } finally {
      setBusy(false);
    }
  };

  const unbelong = async (materialType: string, materialId: string) => {
    if (!work) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType, materialId }),
      });
      if (!res.ok) {
        setFailed('Could not remove that relationship just now.');
        return;
      }
      onChanged();
    } catch {
      setFailed('Could not remove that relationship just now.');
    } finally {
      setBusy(false);
    }
  };

  // Things the member could bring: their manuscripts, minus the one on the
  // table and minus what already belongs.
  const broughtIds = new Set(
    (work?.materials ?? []).filter((m) => m.materialType === 'manuscript').map((m) => m.materialId)
  );
  const bringable = manuscripts.filter(
    (m) => m.id !== manuscript?.id && !broughtIds.has(m.id)
  );

  return (
    <div className="space-y-6">
      {/* ── Provenance of the draft (v0.1, kept): one true item, not the answer. ── */}
      {manuscript && manuscript.sectionCount > 0 && (
        <div className="border px-4 py-3" style={{ borderColor: PRESS.ruleSoft }}>
          <p className="text-[14px]" style={{ fontFamily: SERIF }}>
            Your Source
          </p>
          <p className="text-[12px] opacity-50 mt-1 mb-2">What you brought in, unchanged.</p>
          <Link
            href={`${SOURCE_HREF}&m=${encodeURIComponent(manuscript.id)}`}
            className="text-[12.5px] underline underline-offset-4 opacity-60 hover:opacity-90"
          >
            Read the Source
          </Link>
        </div>
      )}

      {/* ── Belongings: sentence first, thing second, home stated. ── */}
      {work && work.materials.length > 0 && (
        <ul className="space-y-3">
          {work.materials.map((m) => (
            <li
              key={`${m.materialType}:${m.materialId}`}
              className="border px-4 py-3"
              style={{ borderColor: PRESS.ruleSoft }}
            >
              {m.sentence ? (
                <p className="text-[13.5px] leading-relaxed mb-1" style={{ fontFamily: SERIF }}>
                  {m.sentence}
                </p>
              ) : (
                /* An unwritten sentence is a correct state — shown as absence,
                   never as a field demanding to be filled. */
                <p className="text-[12px] opacity-40 mb-1">brought without a note</p>
              )}
              <p className="text-[12.5px] opacity-60">
                {titleOf(m.materialId)}
                <span className="opacity-70"> · an import · brought {formatWhen(m.declaredAt)}</span>
              </p>
              <button
                disabled={busy}
                onClick={() => void unbelong(m.materialType, m.materialId)}
                className="mt-1.5 text-[11px] opacity-35 hover:opacity-70 underline underline-offset-4"
              >
                no longer feeds this work
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── The gesture: bring this to this work. ── */}
      {work ? (
        bringable.length > 0 ? (
          <div>
            <h3 className="text-[10.5px] tracking-[0.15em] uppercase opacity-35 mb-2">
              Bring something of yours in
            </h3>
            <ul className="space-y-2">
              {bringable.map((m) => (
                <li key={m.id}>
                  {bringing === m.id ? (
                    <div className="border px-3.5 py-3" style={{ borderColor: PRESS.ruleSoft }}>
                      <p className="text-[13px] mb-2" style={{ fontFamily: SERIF }}>
                        {m.title ?? 'an unnamed manuscript'}
                      </p>
                      <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        placeholder="What does this feed? In your words — or leave it unwritten."
                        rows={2}
                        className="press-field w-full bg-transparent border rounded-sm p-2 text-[12.5px] leading-relaxed outline-none placeholder:opacity-40 mb-2"
                        style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
                      />
                      <div className="flex gap-3">
                        <button
                          disabled={busy}
                          onClick={() => void bring(m.id)}
                          className="text-[12px] underline underline-offset-4 opacity-70 hover:opacity-100"
                          style={{ color: PRESS.accent }}
                        >
                          bring it to this work
                        </button>
                        <button
                          onClick={() => {
                            setBringing(null);
                            setSentence('');
                          }}
                          className="text-[12px] opacity-40 hover:opacity-70"
                        >
                          not now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      disabled={busy}
                      onClick={() => setBringing(m.id)}
                      className="text-[13px] opacity-55 hover:opacity-90 underline underline-offset-4"
                    >
                      {m.title ?? 'an unnamed manuscript'}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : work.materials.length === 0 && (!manuscript || manuscript.sectionCount === 0) ? (
          <p className="text-[13px] leading-relaxed opacity-60">
            Nothing feeds this work yet.{' '}
            <Link href={IMPORT_HREF} className="underline underline-offset-4">
              Bring something in
            </Link>{' '}
            when the work asks for it.
          </p>
        ) : null
      ) : (
        <p className="text-[13px] leading-relaxed opacity-60">
          Materials belong to a work. Declare one at the{' '}
          <Link href="/press/studio" className="underline underline-offset-4">
            Studio Home
          </Link>{' '}
          and this drawer comes alive.
        </p>
      )}

      {failed && <p className="text-[12px] opacity-60">{failed}</p>}
    </div>
  );
}
