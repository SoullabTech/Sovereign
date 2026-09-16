'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { SOURCE_HREF, SOURCE_INTAKE_HREF } from '../studioMap';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import type { CurrentManuscript } from '../useCurrentManuscript';
import type { LivingWork } from '../useLivingWorks';
import { useStudioSources } from '../useStudioSources';

/**
 * The Materials drawer — what feeds this work.
 *
 * A material is a BELONGING, not a thing. SOURCE-INTAKE-01 extends the first
 * manuscript-only slice to reviewed outside material while keeping the same
 * law: upload does not make something part of a Work; the writer's "bring it"
 * gesture does. A source remains a source after crossing and never silently
 * becomes manuscript text.
 */
interface MaterialsDrawerProps {
  work: LivingWork | null;
  manuscript: CurrentManuscript | null;
  manuscripts: CurrentManuscript[];
  onChanged: () => void;
}

export default function MaterialsDrawer({ work, manuscript, manuscripts, onChanged }: MaterialsDrawerProps) {
  const { sources } = useStudioSources();
  const [bringing, setBringing] = useState<string | null>(null);
  const [sentence, setSentence] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const keyFor = (type: string, id: string) => `${type}:${id}`;
  const titleOf = (materialType: string, id: string) => {
    if (materialType === 'manuscript') return manuscripts.find((m) => m.id === id)?.title ?? 'an unnamed manuscript';
    if (materialType === 'source_upload') return sources.find((s) => s.id === id)?.originalName ?? 'source material';
    return 'source material';
  };
  const homeOf = (materialType: string) => materialType === 'manuscript' ? 'an import' : 'source material';

  const bring = async (materialType: 'manuscript' | 'source_upload', materialId: string) => {
    if (!work) return;
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType, materialId, sentence }),
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

  const broughtManuscripts = new Set((work?.materials ?? []).filter((m) => m.materialType === 'manuscript').map((m) => m.materialId));
  const broughtSources = new Set((work?.materials ?? []).filter((m) => m.materialType === 'source_upload').map((m) => m.materialId));
  const bringableManuscripts = manuscripts.filter((m) => m.id !== manuscript?.id && !broughtManuscripts.has(m.id));
  const bringableSources = sources.filter((s) => s.transcriptionStatus === 'reviewed' && !broughtSources.has(s.id));
  const hasBringable = bringableManuscripts.length > 0 || bringableSources.length > 0;

  const BringEditor = ({ type, id, name }: { type: 'manuscript' | 'source_upload'; id: string; name: string }) => (
    <div className="border px-3.5 py-3" style={{ borderColor: PRESS.ruleSoft }}>
      <p className="text-[13px] mb-2" style={{ fontFamily: SERIF }}>{name}</p>
      <textarea
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        placeholder="What does this feed? In your words — or leave it unwritten."
        rows={2}
        className="press-field w-full bg-transparent border rounded-sm p-2 text-[12.5px] leading-relaxed outline-none placeholder:opacity-40 mb-2"
        style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
      />
      <div className="flex gap-3">
        <button disabled={busy} onClick={() => void bring(type, id)} className="text-[12px] underline underline-offset-4 opacity-70 hover:opacity-100" style={{ color: PRESS.accent }}>
          bring it to this work
        </button>
        <button onClick={() => { setBringing(null); setSentence(''); }} className="text-[12px] opacity-40 hover:opacity-70">not now</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {manuscript && manuscript.sectionCount > 0 && (
        <div className="border px-4 py-3" style={{ borderColor: PRESS.ruleSoft }}>
          <p className="text-[14px]" style={{ fontFamily: SERIF }}>Your Source</p>
          <p className="text-[12px] opacity-50 mt-1 mb-2">What you brought in, unchanged.</p>
          <Link href={`${SOURCE_HREF}&m=${encodeURIComponent(manuscript.id)}`} className="text-[12.5px] underline underline-offset-4 opacity-60 hover:opacity-90">Read the Source</Link>
        </div>
      )}

      {work && work.materials.length > 0 && (
        <ul className="space-y-3">
          {work.materials.map((m) => (
            <li key={`${m.materialType}:${m.materialId}`} className="border px-4 py-3" style={{ borderColor: PRESS.ruleSoft }}>
              {m.sentence ? (
                <p className="text-[13.5px] leading-relaxed mb-1" style={{ fontFamily: SERIF }}>{m.sentence}</p>
              ) : (
                <p className="text-[12px] opacity-40 mb-1">brought without a note</p>
              )}
              <p className="text-[12.5px] opacity-60">
                {titleOf(m.materialType, m.materialId)}
                <span className="opacity-70"> · {homeOf(m.materialType)} · brought {formatWhen(m.declaredAt)}</span>
              </p>
              <button disabled={busy} onClick={() => void unbelong(m.materialType, m.materialId)} className="mt-1.5 text-[11px] opacity-35 hover:opacity-70 underline underline-offset-4">no longer feeds this work</button>
            </li>
          ))}
        </ul>
      )}

      {work ? (
        hasBringable ? (
          <div>
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h3 className="text-[10.5px] tracking-[0.15em] uppercase opacity-35">Bring something of yours in</h3>
              <Link href={SOURCE_INTAKE_HREF} className="text-[11px] opacity-45 hover:opacity-75 underline underline-offset-4">bring new source material</Link>
            </div>
            <ul className="space-y-2">
              {bringableManuscripts.map((m) => {
                const key = keyFor('manuscript', m.id);
                return <li key={key}>{bringing === key ? <BringEditor type="manuscript" id={m.id} name={m.title ?? 'an unnamed manuscript'} /> : <button disabled={busy} onClick={() => setBringing(key)} className="text-[13px] opacity-55 hover:opacity-90 underline underline-offset-4">{m.title ?? 'an unnamed manuscript'}</button>}</li>;
              })}
              {bringableSources.map((s) => {
                const key = keyFor('source_upload', s.id);
                return <li key={key}>{bringing === key ? <BringEditor type="source_upload" id={s.id} name={s.originalName} /> : <button disabled={busy} onClick={() => setBringing(key)} className="text-[13px] opacity-55 hover:opacity-90 underline underline-offset-4">{s.originalName}<span className="ml-2 text-[11px] opacity-50">source</span></button>}</li>;
              })}
            </ul>
          </div>
        ) : (
          <p className="text-[13px] leading-relaxed opacity-60">
            {work.materials.length === 0 && (!manuscript || manuscript.sectionCount === 0) ? 'Nothing feeds this work yet. ' : ''}
            <Link href={SOURCE_INTAKE_HREF} className="underline underline-offset-4">Bring notes or source material in</Link>{' '}when the work asks for it.
          </p>
        )
      ) : (
        <p className="text-[13px] leading-relaxed opacity-60">Materials belong to a work. Declare one at the <Link href="/writers-studio" className="underline underline-offset-4">Studio Home</Link> and this drawer comes alive.</p>
      )}

      {failed && <p className="text-[12px] opacity-60">{failed}</p>}
    </div>
  );
}
