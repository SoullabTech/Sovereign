'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';

/**
 * Soullab Press — Manuscript Room.
 *
 * "A beautiful room for sitting with your own manuscript."
 *
 * NOT /book-studio (the founder editorial workspace) and not an AI editor —
 * this is the member-facing Press room for encountering an existing manuscript.
 *
 * CONSTITUTIONAL LINES, enforced by what this page shows and refuses to show:
 *   - Evidence only. No themes, no scores, no "resonant/important/insightful",
 *     no suggested collections, no AI indicators, no analytics, no badges.
 *   - Recognition is enacted, not inferred: a passage card offers exactly two
 *     gestures — Keep and Pass. Pass records nothing.
 *   - Collections: an empty field and a cursor. No templates, no examples,
 *     no placeholder names. Naming is already interpretation, so naming is hers.
 *   - Report when pulled, never notice when idle: collection facts (counts,
 *     section distribution) render only inside the tab the member opens.
 *   - Segmentation is member-confirmed before save; headings editable, cuts
 *     removable — chapter boundaries are structure, structure is authorship.
 *
 * Aesthetic: cream paper, quiet serif, wide margins, slow. Deliberately light-
 * only — a literary environment, not a dashboard.
 */

const SERIF = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';

interface ManuscriptSummary {
  id: string;
  title: string;
  createdAt: string;
  sectionCount: number;
  charCount: number;
  keepCount: number;
}
interface Section {
  id: string;
  position: number;
  heading: string | null;
  chars: number;
}
interface Keep {
  id: string;
  sectionId: string;
  verbatimText: string;
  createdAt: string;
  sectionHeading: string | null;
  sectionPosition: number;
}
interface Collection {
  id: string;
  name: string;
  createdAt: string;
  keepIds: string[];
}
interface Candidate {
  text: string;
  context: string;
  provenance: 'verbatim';
  sectionId: string;
  sectionPosition: number;
  sectionHeading: string | null;
}
interface PreviewSection {
  position: number;
  heading: string | null;
  body: string;
}

type Tab = 'manuscript' | 'keeps' | 'collections' | 'emerging' | 'export';

function sectionLabel(heading: string | null, position: number): string {
  return heading ?? `Section ${position + 1}`;
}

export default function PressManuscriptRoom() {
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [keeps, setKeeps] = useState<Keep[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tab, setTab] = useState<Tab>('manuscript');

  const [draftTitle, setDraftTitle] = useState('');
  const [draftText, setDraftText] = useState('');
  const [preview, setPreview] = useState<PreviewSection[] | null>(null);
  const [saving, setSaving] = useState(false);

  const [sectionCursor, setSectionCursor] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [recogNote, setRecogNote] = useState<string | null>(null);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [openCollection, setOpenCollection] = useState<string | null>(null);

  const loadList = useCallback(async () => {
    try {
      const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: ManuscriptSummary[] = data.manuscripts ?? [];
      setActive((cur) => cur ?? (list.length > 0 ? list[0].id : null));
    } catch {
      // Landing will show; upload still possible for a signed-in member.
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    const res = await apiFetch(`/api/sovereign/manuscripts/${id}`, { method: 'GET' });
    if (!res.ok) return;
    const data = await res.json();
    setTitle(data.manuscript?.title ?? '');
    setSections(data.sections ?? []);
    setKeeps(data.keeps ?? []);
    setCollections(data.collections ?? []);
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);
  useEffect(() => {
    if (active) loadDetail(active);
  }, [active, loadDetail]);

  // ---- Upload flow -------------------------------------------------------
  const requestPreview = async () => {
    if (!draftTitle.trim() || !draftText.trim()) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/sovereign/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle, text: draftText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreview(data.preview ?? null);
    } catch {
      setPreview(null);
    } finally {
      setSaving(false);
    }
  };

  const saveManuscript = async () => {
    if (!preview || preview.length === 0) return;
    setSaving(true);
    try {
      const res = await apiFetch('/api/sovereign/manuscripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: draftTitle, sections: preview }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreview(null);
      setDraftText('');
      setDraftTitle('');
      await loadList();
      setActive(data.id);
      setTab('manuscript');
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (f: File) => {
    const text = await f.text();
    setDraftText(text);
    if (!draftTitle.trim()) setDraftTitle(f.name.replace(/\.(txt|md|markdown)$/i, ''));
  };

  // ---- Recognition flow --------------------------------------------------
  const fetchCandidates = useCallback(
    async (pos: number) => {
      if (!active) return;
      setExtracting(true);
      setRecogNote(null);
      try {
        const res = await apiFetch(`/api/sovereign/manuscripts/${active}/candidates`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sectionPosition: pos }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setCandidates(data.candidates ?? []);
        setCardIdx(0);
        if ((data.candidates ?? []).length === 0) {
          setRecogNote('Nothing found in this section this time.');
        }
      } catch {
        setCandidates([]);
        setRecogNote('Could not read this section right now.');
      } finally {
        setExtracting(false);
      }
    },
    [active],
  );

  const currentCard = candidates[cardIdx] ?? null;

  const advance = () => {
    if (cardIdx + 1 < candidates.length) {
      setCardIdx(cardIdx + 1);
    } else if (sectionCursor + 1 < sections.length) {
      const next = sectionCursor + 1;
      setSectionCursor(next);
      fetchCandidates(next);
    } else {
      setCandidates([]);
      setRecogNote('You have walked the whole manuscript.');
    }
  };

  const keepCurrent = async () => {
    if (!active || !currentCard) return;
    const res = await apiFetch(`/api/sovereign/manuscripts/${active}/keeps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sectionId: currentCard.sectionId, text: currentCard.text }),
    });
    if (res.ok && active) await loadDetail(active);
    advance();
  };

  // ---- Collections flow --------------------------------------------------
  const createCollection = async () => {
    if (!active || !newCollectionName.trim()) return;
    const res = await apiFetch(`/api/sovereign/manuscripts/${active}/collections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCollectionName }),
    });
    if (res.ok) {
      setNewCollectionName('');
      await loadDetail(active);
    }
  };

  const placeKeep = async (keepId: string, collectionId: string, op: 'place' | 'remove') => {
    if (!active) return;
    const res = await apiFetch(`/api/sovereign/manuscripts/${active}/collections`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collectionId, keepId, op }),
    });
    if (res.ok) await loadDetail(active);
  };

  const unkeep = async (keepId: string) => {
    if (!active) return;
    const res = await apiFetch(
      `/api/sovereign/manuscripts/${active}/keeps?keepId=${encodeURIComponent(keepId)}`,
      { method: 'DELETE' },
    );
    if (res.ok) await loadDetail(active);
  };

  // ---- Export ------------------------------------------------------------
  const exportMarkdown = () => {
    const lines: string[] = [`# ${title}`, '', `_Lines you kept — your exact words._`, ''];
    for (const k of keeps) {
      lines.push(`> ${k.verbatimText.replace(/\n/g, '\n> ')}`);
      lines.push(`— ${sectionLabel(k.sectionHeading, k.sectionPosition)}`, '');
    }
    for (const c of collections) {
      const placed = keeps.filter((k) => c.keepIds.includes(k.id));
      if (placed.length === 0) continue;
      lines.push(`## ${c.name}`, '');
      for (const k of placed) {
        lines.push(`> ${k.verbatimText.replace(/\n/g, '\n> ')}`);
        lines.push(`— ${sectionLabel(k.sectionHeading, k.sectionPosition)}`, '');
      }
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title || 'keeps'}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const emerging = useMemo(() => {
    return collections.map((c) => {
      const items = keeps.filter((k) => c.keepIds.includes(k.id));
      const secs = Array.from(new Set(items.map((k) => k.sectionPosition))).sort((a, b) => a - b);
      return { collection: c, count: items.length, secs };
    });
  }, [collections, keeps]);

  const pageEstimate = (chars: number) => Math.max(1, Math.round(chars / 1800));

  // =======================================================================
  const paper = { background: '#faf7f1', color: '#2e2a24', fontFamily: SERIF } as const;

  if (loading) {
    return (
      <div style={paper} className="min-h-screen flex items-center justify-center">
        <span className="text-sm opacity-40">…</span>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div style={paper} className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Soullab Press</p>
          <p className="text-[15px] leading-relaxed opacity-70">
            The Manuscript Room holds your own words, so it opens only to you.{' '}
            <a href="/signin" className="underline underline-offset-4">
              Sign in
            </a>{' '}
            to enter.
          </p>
        </div>
      </div>
    );
  }

  // ---- Landing / upload --------------------------------------------------
  if (!active || preview) {
    return (
      <div style={paper} className="min-h-screen">
        <main className="max-w-xl mx-auto px-6 py-24">
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Soullab Press</p>
          <h1 className="text-3xl leading-snug mb-4">
            Discover the books already living within your work.
          </h1>
          <p className="text-[15px] leading-relaxed opacity-70 mb-12">
            A manuscript is not only something to finish. It may also be something that reveals
            itself.
          </p>

          {!preview ? (
            <div className="space-y-6">
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Title of your manuscript"
                className="w-full bg-transparent border-b border-[#d8d2c6] py-2 text-lg outline-none placeholder:opacity-40"
                style={{ fontFamily: SERIF }}
              />
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Paste your manuscript here…"
                rows={12}
                className="w-full bg-white/60 border border-[#e4ddd0] rounded-sm p-4 text-[14px] leading-relaxed outline-none placeholder:opacity-40"
                style={{ fontFamily: SERIF }}
              />
              <div className="flex items-center gap-6">
                <label className="text-[13px] underline underline-offset-4 opacity-60 cursor-pointer">
                  or choose a .txt / .md file
                  <input
                    type="file"
                    accept=".txt,.md,.markdown"
                    className="hidden"
                    onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                  />
                </label>
                <button
                  onClick={requestPreview}
                  disabled={saving || !draftTitle.trim() || !draftText.trim()}
                  className="ml-auto px-6 py-2.5 bg-[#2e2a24] text-[#faf7f1] text-[14px] tracking-wide disabled:opacity-30"
                >
                  {saving ? '…' : 'Upload Manuscript'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-[14px] opacity-70 mb-2">
                {preview.length} section{preview.length === 1 ? '' : 's'} detected — from your
                document&rsquo;s own headings. Confirm the cuts before saving: edit any heading, or
                merge a section into the one above it.
              </p>
              <p className="text-[12px] opacity-50 mb-8">Saved as your words, as you wrote them.</p>
              <div className="space-y-3 mb-10">
                {preview.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 border-b border-[#eee7da] pb-2">
                    <span className="text-[12px] opacity-40 w-8">{i + 1}</span>
                    <input
                      value={s.heading ?? ''}
                      placeholder="(untitled section)"
                      onChange={(e) =>
                        setPreview((p) =>
                          p
                            ? p.map((x, j) =>
                                j === i ? { ...x, heading: e.target.value || null } : x,
                              )
                            : p,
                        )
                      }
                      className="flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-30"
                      style={{ fontFamily: SERIF }}
                    />
                    <span className="text-[12px] opacity-40">{pageEstimate(s.body.length)} pp</span>
                    {i > 0 && (
                      <button
                        onClick={() =>
                          setPreview((p) => {
                            if (!p) return p;
                            const merged = [...p];
                            const cur = merged[i];
                            merged[i - 1] = {
                              ...merged[i - 1],
                              body:
                                merged[i - 1].body +
                                '\n\n' +
                                (cur.heading ? cur.heading + '\n' : '') +
                                cur.body,
                            };
                            merged.splice(i, 1);
                            return merged.map((x, j) => ({ ...x, position: j }));
                          })
                        }
                        className="text-[12px] opacity-40 hover:opacity-70"
                      >
                        merge ↑
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setPreview(null)}
                  className="text-[13px] underline underline-offset-4 opacity-60"
                >
                  back
                </button>
                <button
                  onClick={saveManuscript}
                  disabled={saving}
                  className="ml-auto px-6 py-2.5 bg-[#2e2a24] text-[#faf7f1] text-[14px] tracking-wide disabled:opacity-30"
                >
                  {saving ? '…' : 'Save manuscript'}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // ---- The Room ----------------------------------------------------------
  const totalChars = sections.reduce((a, s) => a + s.chars, 0);

  return (
    <div style={paper} className="min-h-screen">
      <header className="border-b border-[#e8e1d3]">
        <div className="max-w-2xl mx-auto px-6 pt-10 pb-0">
          <p className="text-[12px] tracking-[0.25em] uppercase opacity-50 mb-1">Soullab Press</p>
          <h1 className="text-2xl mb-6">{title}</h1>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[12px] tracking-[0.15em] uppercase">
            {(
              [
                ['manuscript', 'Manuscript'],
                ['keeps', 'Keeps'],
                ['collections', 'Collections'],
                ['emerging', 'Emerging Books'],
                ['export', 'Export'],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 border-b-2 transition-colors ${
                  tab === t
                    ? 'border-[#2e2a24] opacity-90'
                    : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-14">
        {tab === 'manuscript' && (
          <div>
            <p className="text-[14px] opacity-60 mb-10">
              {pageEstimate(totalChars)} pages · {sections.length} section
              {sections.length === 1 ? '' : 's'} · {keeps.length} kept
            </p>
            <div className="space-y-4 mb-14">
              {sections.map((s) => (
                <div key={s.id} className="flex items-baseline gap-4 border-b border-[#eee7da] pb-3">
                  <span className="text-[12px] opacity-40 w-8">{s.position + 1}</span>
                  <span className="text-[16px]">{sectionLabel(s.heading, s.position)}</span>
                  <span className="ml-auto text-[12px] opacity-40">{pageEstimate(s.chars)} pp</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                setTab('keeps');
                setSectionCursor(0);
                fetchCandidates(0);
              }}
              className="px-8 py-3 bg-[#2e2a24] text-[#faf7f1] text-[14px] tracking-wide"
            >
              Begin Exploration
            </button>
          </div>
        )}

        {tab === 'keeps' && (
          <div>
            {extracting ? (
              <p className="text-center text-[14px] opacity-40 py-24">reading…</p>
            ) : currentCard ? (
              <div className="py-10">
                <blockquote
                  className="text-[22px] leading-relaxed text-center px-4 mb-6 whitespace-pre-wrap"
                  style={{ fontFamily: SERIF }}
                >
                  &ldquo;{currentCard.text}&rdquo;
                </blockquote>
                <p className="text-center text-[12px] opacity-40 mb-12">
                  {sectionLabel(currentCard.sectionHeading, currentCard.sectionPosition)}
                </p>
                <div className="flex justify-center gap-6">
                  <button
                    onClick={keepCurrent}
                    className="px-10 py-3 bg-[#2e2a24] text-[#faf7f1] text-[14px] tracking-wide"
                  >
                    Keep
                  </button>
                  <button
                    onClick={advance}
                    className="px-10 py-3 border border-[#d8d2c6] text-[14px] tracking-wide opacity-70"
                  >
                    Pass
                  </button>
                </div>
                <p className="text-center text-[12px] opacity-30 mt-10">
                  {sectionCursor + 1} of {sections.length} sections
                </p>
              </div>
            ) : (
              <div className="mb-14">
                {recogNote && <p className="text-[13px] opacity-50 mb-4">{recogNote}</p>}
                <button
                  onClick={() => fetchCandidates(sectionCursor)}
                  className="text-[13px] underline underline-offset-4 opacity-60"
                >
                  Find lines that still feel alive
                </button>
              </div>
            )}

            {keeps.length > 0 && !currentCard && !extracting && (
              <div className="mt-6">
                <p className="text-[13px] opacity-50 mb-8">
                  Lines you kept — {keeps.length} passage{keeps.length === 1 ? '' : 's'}. Your exact
                  words, from the sections you kept them in.
                </p>
                <div className="space-y-10">
                  {keeps.map((k) => (
                    <div key={k.id}>
                      <p className="text-[16px] leading-relaxed whitespace-pre-wrap mb-2">
                        {k.verbatimText}
                      </p>
                      <div className="flex items-center gap-4 text-[12px] opacity-40">
                        <span>{sectionLabel(k.sectionHeading, k.sectionPosition)}</span>
                        {collections.length > 0 && (
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              if (e.target.value) placeKeep(k.id, e.target.value, 'place');
                              e.target.value = '';
                            }}
                            className="bg-transparent border border-[#e4ddd0] rounded-sm px-1 py-0.5"
                            aria-label="Place into collection"
                          >
                            <option value="">place into…</option>
                            {collections.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        )}
                        <button onClick={() => unkeep(k.id)} className="hover:opacity-80">
                          remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'collections' && (
          <div>
            <div className="flex gap-3 mb-12">
              <input
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && createCollection()}
                className="flex-1 bg-transparent border-b border-[#d8d2c6] py-2 text-lg outline-none"
                style={{ fontFamily: SERIF }}
                aria-label="New collection name"
              />
              <button
                onClick={createCollection}
                disabled={!newCollectionName.trim()}
                className="text-[13px] tracking-wide underline underline-offset-4 opacity-60 disabled:opacity-20"
              >
                Create Collection
              </button>
            </div>
            {collections.length === 0 ? (
              <p className="text-[13px] opacity-40 italic">
                No collections yet. A collection begins with a name only you can give it.
              </p>
            ) : (
              <div className="space-y-8">
                {collections.map((c) => (
                  <div key={c.id} className="border-b border-[#eee7da] pb-6">
                    <button
                      onClick={() => setOpenCollection(openCollection === c.id ? null : c.id)}
                      className="text-[18px]"
                      style={{ fontFamily: SERIF }}
                    >
                      {c.name}
                    </button>
                    <span className="ml-3 text-[12px] opacity-40">
                      {c.keepIds.length} passage{c.keepIds.length === 1 ? '' : 's'}
                    </span>
                    {openCollection === c.id && (
                      <div className="mt-6 space-y-6">
                        {keeps
                          .filter((k) => c.keepIds.includes(k.id))
                          .map((k) => (
                            <div key={k.id}>
                              <p className="text-[15px] leading-relaxed whitespace-pre-wrap mb-1">
                                {k.verbatimText}
                              </p>
                              <div className="flex gap-4 text-[12px] opacity-40">
                                <span>{sectionLabel(k.sectionHeading, k.sectionPosition)}</span>
                                <button onClick={() => placeKeep(k.id, c.id, 'remove')}>
                                  remove from collection
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'emerging' && (
          <div>
            {emerging.filter((e) => e.count > 0).length === 0 ? (
              <p className="text-[13px] opacity-40 italic">
                When you have placed kept passages into collections, what you have placed appears
                here.
              </p>
            ) : (
              <div className="space-y-14">
                {emerging
                  .filter((e) => e.count > 0)
                  .map(({ collection, count, secs }) => (
                    <div key={collection.id}>
                      <p className="text-[12px] tracking-[0.2em] uppercase opacity-50 mb-1">
                        Collection
                      </p>
                      <h2 className="text-2xl mb-4" style={{ fontFamily: SERIF }}>
                        {collection.name}
                      </h2>
                      <p className="text-[14px] opacity-70 mb-1">
                        {count} passage{count === 1 ? '' : 's'} placed.
                      </p>
                      <p className="text-[14px] opacity-70 mb-6">
                        Appears across {secs.length === 1 ? 'section' : 'sections'}{' '}
                        {secs.map((p) => p + 1).join(', ')}.
                      </p>
                      <p className="text-[15px] italic opacity-60">
                        What relationship, if any, do you notice?
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {tab === 'export' && (
          <div>
            <p className="text-[14px] opacity-70 mb-8 leading-relaxed">
              Download what you kept and what you placed — your exact words, with the section each
              line came from. Nothing is added.
            </p>
            <button
              onClick={exportMarkdown}
              disabled={keeps.length === 0}
              className="px-8 py-3 bg-[#2e2a24] text-[#faf7f1] text-[14px] tracking-wide disabled:opacity-30"
            >
              Download as Markdown
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
