'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import { PRESS, SERIF } from '../pressTheme';
import { SOURCE_HREF } from '../studioMap';
import { canvasForManuscript } from '../canvasIdentity';
import { formatWhen } from '../../press/manuscript/workingDraftClient';
import { kindById, MATERIAL_KINDS, sizeLabel } from '@/lib/studio/materials/kinds';
import type { CurrentManuscript } from '../useCurrentManuscript';
import type { LivingWork } from '../useLivingWorks';

/**
 * Materials — what the writer has gathered, and how it feeds the Work.
 *
 * GATHER-02 turned this from a drawer that could relate one manuscript to
 * another into the room's gathering surface: documents, notes, transcripts,
 * recordings, images and links all come in here, and each stays visibly
 * ITSELF. A recording is a recording. A PDF is a PDF with a page count. The
 * Studio does not flatten everything into undifferentiated text.
 *
 * The spine, rendered as furniture rather than explained in a legend:
 *
 *     SOURCE     what actually arrived
 *        ↓
 *     MATERIAL   what you have gathered
 *        ↓
 *     WORK       what you are making
 *
 * BELONGING IS A MEMBER ACT. Bringing something into the Studio does not
 * attach it to a Work. MAIA may say what she notices; she never ticks a box
 * saying a thing belongs. The writer says it belongs, and says HOW — that
 * sentence is not metadata, it is their meaning, and it is asked for at the
 * moment of the crossing.
 */

interface StudioMaterial {
  id: string;
  kind: string;
  title: string;
  artifactSize: number | null;
  originalFilename: string | null;
  sourceUrl: string | null;
  extractionMethod: string | null;
  extractedChars: number | null;
  arrivedAt: string;
}

interface MaterialsDrawerProps {
  /** The work this drawer is about (united, or the member's only work). */
  work: LivingWork | null;
  /** The manuscript on the table (its Source renders as provenance). */
  manuscript: CurrentManuscript | null;
  /** All the member's manuscripts — earlier drafts they can bring. */
  manuscripts: CurrentManuscript[];
  onChanged: () => void;
}

/** Where a material's text came from, said plainly. Never inferred. */
function provenanceLine(m: StudioMaterial): string {
  const bits: string[] = [];
  const kind = kindById(m.kind);
  if (kind) bits.push(kind.label);
  if (m.originalFilename) bits.push(m.originalFilename);
  const size = sizeLabel(m.artifactSize);
  if (size) bits.push(size);
  if (m.sourceUrl) bits.push(m.sourceUrl.replace(/^https?:\/\/(www\.)?/, ''));
  if (m.extractionMethod === 'member_typed') bits.push('written here');
  else if (m.extractionMethod) bits.push(`${m.extractedChars?.toLocaleString()} characters read`);
  else if (kind && !kind.fileBacked) bits.push('no text');
  else bits.push('kept as itself, not read');
  return bits.join(' · ');
}

export default function MaterialsDrawer({
  work,
  manuscript,
  manuscripts,
  onChanged,
}: MaterialsDrawerProps) {
  const [materials, setMaterials] = useState<StudioMaterial[] | null>(null);
  const [bringing, setBringing] = useState<'file' | 'note' | 'link' | 'draft' | null>(null);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [sentence, setSentence] = useState('');
  const [declaring, setDeclaring] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/studio/materials', { method: 'GET' });
      if (!res.ok) return setMaterials([]);
      const data = await res.json();
      setMaterials(Array.isArray(data.materials) ? data.materials : []);
    } catch {
      setMaterials([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const bringFile = async (file: File) => {
    setBusy(true);
    setFailed(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await apiFetch('/api/sovereign/studio/materials', {
        method: 'POST',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFailed(typeof data.message === 'string' ? data.message : 'That could not come in.');
        return;
      }
      setBringing(null);
      await load();
    } catch {
      setFailed('That could not come in just now.');
    } finally {
      setBusy(false);
    }
  };

  const bringTyped = async (kind: 'note' | 'transcript' | 'link') => {
    setBusy(true);
    setFailed(null);
    try {
      const res = await apiFetch('/api/sovereign/studio/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'link' ? { kind, sourceUrl: url } : { kind, text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFailed(
          typeof data.message === 'string'
            ? data.message
            : typeof data.error === 'string'
              ? data.error
              : 'That could not come in.',
        );
        return;
      }
      setBringing(null);
      setText('');
      setUrl('');
      await load();
    } catch {
      setFailed('That could not come in just now.');
    } finally {
      setBusy(false);
    }
  };

  /** The crossing: the writer says it belongs, and says how. */
  const declare = async (materialType: string, materialId: string) => {
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
        setFailed('Could not bring that to this work just now.');
        return;
      }
      setDeclaring(null);
      setSentence('');
      onChanged();
    } catch {
      setFailed('Could not bring that to this work just now.');
    } finally {
      setBusy(false);
    }
  };

  const unbelong = async (materialType: string, materialId: string) => {
    if (!work) return;
    setBusy(true);
    try {
      await apiFetch(`/api/sovereign/living-works/${work.id}/materials`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialType, materialId }),
      });
      onChanged();
    } catch {
      setFailed('Could not remove that relationship just now.');
    } finally {
      setBusy(false);
    }
  };

  const declared = work?.materials ?? [];
  const declaredIds = new Set(declared.map((m) => `${m.materialType}:${m.materialId}`));

  const labelFor = (materialType: string, materialId: string): string => {
    if (materialType === 'studio_material') {
      return materials?.find((m) => m.id === materialId)?.title ?? 'a material';
    }
    return manuscripts.find((m) => m.id === materialId)?.title ?? 'an unnamed manuscript';
  };

  return (
    <div className="space-y-5">
      {/* ── The spine. Furniture, not a legend. ── */}
      <div className="text-[9.5px] tracking-[0.16em] uppercase opacity-25 leading-[1.9]">
        Source — what arrived
        <br />↓ Material — what you gathered
        <br />↓ Work — what you are making
      </div>

      {/* ── What already feeds this work, in the writer's own words. ── */}
      {declared.length > 0 && (
        <ul className="space-y-2.5">
          {declared.map((m) => (
            <li
              key={`${m.materialType}:${m.materialId}`}
              className="border px-3.5 py-2.5"
              style={{ borderColor: PRESS.ruleSoft }}
            >
              {m.sentence ? (
                <p className="text-[13px] leading-relaxed mb-1" style={{ fontFamily: SERIF }}>
                  {m.sentence}
                </p>
              ) : (
                /* An unwritten sentence is a correct state — shown as absence,
                   never as a field demanding to be filled. */
                <p className="text-[11.5px] opacity-40 mb-1">brought without a note</p>
              )}
              <p className="text-[12px] opacity-55">
                {labelFor(m.materialType, m.materialId)}
                <span className="opacity-70"> · brought {formatWhen(m.declaredAt)}</span>
              </p>
              <button
                disabled={busy}
                onClick={() => void unbelong(m.materialType, m.materialId)}
                className="mt-1 text-[10.5px] opacity-30 hover:opacity-70 underline underline-offset-4"
              >
                no longer feeds this work
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* ── Bring something in. Prominent, and plain about what happens. ── */}
      <div>
        <h3 className="text-[10px] tracking-[0.15em] uppercase opacity-35 mb-2">Bring something in</h3>
        {bringing === null ? (
          <div className="flex flex-wrap gap-x-3.5 gap-y-1.5">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={busy}
              className="text-[11.5px] underline underline-offset-4 opacity-60 hover:opacity-100 disabled:opacity-25"
            >
              a file
            </button>
            <button
              onClick={() => setBringing('note')}
              className="text-[11.5px] underline underline-offset-4 opacity-60 hover:opacity-100"
            >
              a note
            </button>
            <button
              onClick={() => setBringing('link')}
              className="text-[11.5px] underline underline-offset-4 opacity-60 hover:opacity-100"
            >
              a link
            </button>
            {manuscripts.length > 1 && (
              <button
                onClick={() => setBringing('draft')}
                className="text-[11.5px] underline underline-offset-4 opacity-60 hover:opacity-100"
              >
                an earlier draft
              </button>
            )}
          </div>
        ) : bringing === 'note' ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              autoFocus
              rows={4}
              placeholder="Write or paste it here."
              className="press-field w-full bg-transparent border rounded-sm p-2 text-[12.5px] leading-relaxed outline-none placeholder:opacity-40 mb-2"
              style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
            />
            <div className="flex gap-3">
              <button
                disabled={busy || !text.trim()}
                onClick={() => void bringTyped('note')}
                className="text-[11.5px] underline underline-offset-4 opacity-75 hover:opacity-100 disabled:opacity-25"
                style={{ color: PRESS.accent }}
              >
                bring it in
              </button>
              <button
                disabled={busy || !text.trim()}
                onClick={() => void bringTyped('transcript')}
                className="text-[11.5px] underline underline-offset-4 opacity-50 hover:opacity-90 disabled:opacity-20"
              >
                it&rsquo;s a transcript
              </button>
              <button onClick={() => setBringing(null)} className="text-[11.5px] opacity-40 hover:opacity-70">
                not now
              </button>
            </div>
          </div>
        ) : bringing === 'link' ? (
          <div>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              autoFocus
              placeholder="https://…"
              className="press-field w-full bg-transparent border-b pb-1 text-[12.5px] outline-none placeholder:opacity-40 mb-1.5"
              style={{ borderColor: PRESS.ruleSoft, color: PRESS.text }}
            />
            <p className="text-[10.5px] opacity-35 mb-2 leading-relaxed">
              The address is kept. The page is not fetched — nothing reaches out on your behalf.
            </p>
            <div className="flex gap-3">
              <button
                disabled={busy || !url.trim()}
                onClick={() => void bringTyped('link')}
                className="text-[11.5px] underline underline-offset-4 opacity-75 hover:opacity-100 disabled:opacity-25"
                style={{ color: PRESS.accent }}
              >
                keep it
              </button>
              <button onClick={() => setBringing(null)} className="text-[11.5px] opacity-40 hover:opacity-70">
                not now
              </button>
            </div>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {manuscripts
              .filter(
                (m) =>
                  m.id !== manuscript?.id && !declaredIds.has(`manuscript:${m.id}`),
              )
              .map((m) => (
                <li key={m.id}>
                  <button
                    disabled={busy || !work}
                    onClick={() => setDeclaring(`manuscript:${m.id}`)}
                    className="text-[12px] opacity-60 hover:opacity-95 underline underline-offset-4 disabled:opacity-25"
                  >
                    {m.title ?? 'an unnamed manuscript'}
                  </button>
                </li>
              ))}
            <li>
              <button onClick={() => setBringing(null)} className="text-[11.5px] opacity-40 hover:opacity-70">
                not now
              </button>
            </li>
          </ul>
        )}
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (f) void bringFile(f);
          }}
        />
        {busy && <p className="text-[11px] opacity-40 mt-1.5">bringing it in…</p>}
      </div>

      {/* ── Everything gathered, each thing still itself. ── */}
      {materials && materials.length > 0 && (
        <div>
          <h3 className="text-[10px] tracking-[0.15em] uppercase opacity-35 mb-2">
            Gathered {materials.length}
          </h3>
          <ul className="space-y-2">
            {materials.map((m) => {
              const key = `studio_material:${m.id}`;
              const already = declaredIds.has(key);
              return (
                <li key={m.id} className="border px-3.5 py-2.5" style={{ borderColor: PRESS.ruleSoft }}>
                  <p className="text-[12.5px] leading-snug" style={{ fontFamily: SERIF }}>
                    {m.title}
                  </p>
                  {/* Where it came from and what was read out of it. */}
                  <p className="text-[10.5px] opacity-40 mt-0.5 leading-relaxed">
                    {provenanceLine(m)} · {formatWhen(m.arrivedAt)}
                  </p>

                  {declaring === key ? (
                    <div className="mt-2">
                      <textarea
                        value={sentence}
                        onChange={(e) => setSentence(e.target.value)}
                        autoFocus
                        rows={2}
                        placeholder="How does it belong? In your words — or leave it unwritten."
                        className="press-field w-full bg-transparent border rounded-sm p-2 text-[12px] leading-relaxed outline-none placeholder:opacity-40 mb-1.5"
                        style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
                      />
                      <div className="flex gap-3">
                        <button
                          disabled={busy}
                          onClick={() => void declare('studio_material', m.id)}
                          className="text-[11px] underline underline-offset-4 opacity-75 hover:opacity-100"
                          style={{ color: PRESS.accent }}
                        >
                          it belongs to this work
                        </button>
                        <button
                          onClick={() => {
                            setDeclaring(null);
                            setSentence('');
                          }}
                          className="text-[11px] opacity-40 hover:opacity-70"
                        >
                          not now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                      {m.originalFilename && (
                        <a
                          href={`/api/sovereign/studio/materials/${m.id}/file`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10.5px] opacity-35 hover:opacity-85 underline underline-offset-4"
                        >
                          open the original
                        </a>
                      )}
                      {m.sourceUrl && (
                        <a
                          href={m.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-[10.5px] opacity-35 hover:opacity-85 underline underline-offset-4"
                        >
                          visit
                        </a>
                      )}
                      {work && !already && (
                        <button
                          onClick={() => setDeclaring(key)}
                          className="text-[10.5px] opacity-35 hover:opacity-85 underline underline-offset-4"
                        >
                          belongs to this work
                        </button>
                      )}
                      {already && (
                        <span className="text-[10.5px] opacity-45">feeds this work</span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── The manuscript's own Source: provenance of the draft itself. ── */}
      {manuscript && manuscript.sectionCount > 0 && (
        <div className="border-t pt-3" style={{ borderColor: PRESS.ruleSoft }}>
          <p className="text-[12px] opacity-55">
            The draft on the table came from your Source —{' '}
            <Link
              href={canvasForManuscript(SOURCE_HREF, manuscript.id)}
              className="underline underline-offset-4 opacity-80 hover:opacity-100"
            >
              read it unchanged
            </Link>
            .
          </p>
        </div>
      )}

      {declaring?.startsWith('manuscript:') && (
        <div className="border px-3.5 py-3" style={{ borderColor: PRESS.ruleSoft }}>
          <p className="text-[12.5px] mb-1.5" style={{ fontFamily: SERIF }}>
            {labelFor('manuscript', declaring.slice('manuscript:'.length))}
          </p>
          <textarea
            value={sentence}
            onChange={(e) => setSentence(e.target.value)}
            autoFocus
            rows={2}
            placeholder="How does it belong? In your words — or leave it unwritten."
            className="press-field w-full bg-transparent border rounded-sm p-2 text-[12px] leading-relaxed outline-none placeholder:opacity-40 mb-1.5"
            style={{ fontFamily: SERIF, borderColor: PRESS.ruleSoft }}
          />
          <div className="flex gap-3">
            <button
              disabled={busy}
              onClick={() => void declare('manuscript', declaring.slice('manuscript:'.length))}
              className="text-[11px] underline underline-offset-4 opacity-75 hover:opacity-100"
              style={{ color: PRESS.accent }}
            >
              it belongs to this work
            </button>
            <button
              onClick={() => {
                setDeclaring(null);
                setSentence('');
              }}
              className="text-[11px] opacity-40 hover:opacity-70"
            >
              not now
            </button>
          </div>
        </div>
      )}

      {!work && (
        <p className="text-[12px] leading-relaxed opacity-50">
          Materials can be gathered any time. Saying one <em>belongs</em> needs a Work — declare one
          in the Work panel and every gathered thing becomes offerable to it.
        </p>
      )}

      {materials !== null && materials.length === 0 && declared.length === 0 && (
        <p className="text-[12px] leading-relaxed opacity-45">
          Nothing gathered yet. Notes, transcripts, recordings, documents, images and links all live
          here, each still itself.
        </p>
      )}

      {failed && <p className="text-[11.5px] opacity-65 leading-relaxed">{failed}</p>}
    </div>
  );
}
