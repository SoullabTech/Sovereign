'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadLastTab, saveLastTab } from './returningState';
import { apiFetch } from '@/lib/http/apiBase';
import { CANVAS_HREF } from '../../writers-studio/studioMap';
import WorkingDraftEditor from './WorkingDraftEditor';

/**
 * Mirrors MAX_FILE_BYTES in app/api/sovereign/manuscripts/ingest/route.ts.
 * Checked here so an oversized file is named as oversized before it is sent,
 * rather than failing mid-flight with a message about the upload itself.
 * The route-side check remains authoritative — this is a courtesy, not a gate.
 */
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
 * Aesthetic: Soullab Press canonical palette (espresso ground, warm cream
 * text, deep-amber accent — see PRESS below), quiet serif, wide margins, slow.
 * A literary environment, not a dashboard.
 */

const SERIF = 'Iowan Old Style, Palatino Linotype, Palatino, Georgia, serif';

// Soullab Press canonical palette (matches the public Press landing):
// espresso ground, warm cream text, deep-amber accent (#C9A227 from ogCard).
const PRESS = {
  bg: 'linear-gradient(135deg,#1A1513 0%,#241C18 60%,#1A1513 100%)',
  text: '#F3EDE4',
  accent: '#C9A227',
  ink: '#1A1513',
} as const;

interface ManuscriptSummary {
  id: string;
  title: string | null;
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

type Tab = 'manuscript' | 'draft' | 'keeps' | 'collections' | 'emerging' | 'export' | 'book';

const TABS: Tab[] = ['manuscript', 'draft', 'keeps', 'collections', 'emerging', 'export', 'book'];

/**
 * This room is Layer 3 — a working surface reached FROM the Author Studio
 * (Layer 2, /press/studio). Studio Home enters it by named surface, so
 * "Continue Writing" must land in the Working Draft rather than on whatever
 * tab happens to be first.
 *
 * An unrecognised or absent ?tab falls back to the manuscript view — a bad
 * link never strands the member.
 *
 * MUST use useSearchParams, not window.location.search. A walk on 2026-07-30
 * caught the difference: during an App Router client-side navigation the new
 * page renders BEFORE the URL is committed to `window.location`, so reading
 * the window at first render still sees the PREVIOUS route and every
 * "Continue Writing" silently landed on the Manuscript tab — the exact defect
 * this deep link exists to fix. useSearchParams reflects the destination
 * during the transition. The cost is the Suspense boundary at the bottom of
 * this file, which is why it is there.
 */
function toTab(wanted: string | null): Tab {
  return TABS.includes(wanted as Tab) ? (wanted as Tab) : 'manuscript';
}

function sectionLabel(heading: string | null, position: number): string {
  return heading ?? `Section ${position + 1}`;
}

function PressManuscriptRoom() {
  const searchParams = useSearchParams();
  const requestedTab = searchParams?.get('tab') ?? null;
  /* Which manuscript to open, by identity rather than by position.
     Absent on every existing entry point, so those keep their behaviour. */
  const requestedManuscript = searchParams?.get('m') ?? null;
  /**
   * Studio Home offers "Import Manuscript" whether or not a book already
   * exists — a second book is not a regression. But the landing/upload view
   * below is reached only when `active` is null, so once the member HAS a
   * manuscript that link silently delivered them into the existing Room
   * instead of the import form. A post-#825 seam walk caught it; the first
   * walk had only ever imported from an empty Studio, so the condition was
   * never exercised. `?import=1` states the intent explicitly.
   *
   * Held as state, not read live: after a successful save the intent is spent
   * and must clear, otherwise the URL would pin the member on the import form
   * forever.
   */
  const [importing, setImporting] = useState(() => searchParams?.get('import') === '1');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  // W-2: load failure and "no manuscripts" are different facts about the world.
  const [listError, setListError] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [keeps, setKeeps] = useState<Keep[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tab, setTab] = useState<Tab>(() => {
    // A deep link (?tab=) is the intended destination and always wins.
    if (requestedTab && TABS.includes(requestedTab as Tab)) return requestedTab as Tab;
    // R1.1 Returning — with no deep link, return to the pane last left open.
    const last = loadLastTab();
    if (last && TABS.includes(last as Tab)) return last as Tab;
    return toTab(requestedTab); // 'manuscript' — the safe default
  });

  // R1.1 Returning — remember the pane, so a return with no deep link lands
  // where the writer was. Deep links win in the initializer above and are
  // unaffected.
  useEffect(() => {
    saveLastTab(tab);
  }, [tab]);

  const [draftTitle, setDraftTitle] = useState('');
  const [draftText, setDraftText] = useState('');
  const [preview, setPreview] = useState<PreviewSection[] | null>(null);
  /**
   * Which preview section is open for cutting, if any. The 2026-08-05 persona
   * walk found the confirm stage one-directional: a member could edit or merge
   * the detected cuts but could not ADD one the detector missed — a manuscript
   * whose chapter headings went unrecognized collapsed irreversibly to one
   * section. Cuts are structure and structure is authorship, so the member can
   * redraw them here, in both directions.
   */
  const [splitOpen, setSplitOpen] = useState<number | null>(null);

  /**
   * Cut section i at line lineIdx: the clicked line becomes the new section's
   * heading (the member's own characters — nothing is invented), everything
   * after it becomes the new body. Refused when the cut would orphan words:
   * an empty heading, an empty remainder above, or an empty body below would
   * each be dropped by the save route, and a confirm step must never discard
   * what the member pasted.
   */
  const splitSectionAt = (i: number, lineIdx: number) => {
    setPreview((p) => {
      if (!p || !p[i]) return p;
      const lines = p[i].body.split('\n');
      const headingLine = lines[lineIdx]?.trim() ?? '';
      const before = lines.slice(0, lineIdx).join('\n');
      const after = lines.slice(lineIdx + 1).join('\n');
      if (!headingLine || before.trim().length === 0 || after.trim().length === 0) return p;
      const next = [...p];
      next.splice(i, 1, { ...p[i], body: before }, { position: 0, heading: headingLine, body: after });
      return next.map((x, j) => ({ ...x, position: j }));
    });
    setSplitOpen(null);
  };
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [ingesting, setIngesting] = useState(false);
  /* WS-01 — the identity of the arrival taken into custody at ingest. Held so
     the save act can bind the manuscript to what actually arrived. Null for a
     paste, which has no artifact and must never be given one. */
  const [sourceArrivalId, setSourceArrivalId] = useState<string | null>(null);

  const [sectionCursor, setSectionCursor] = useState(0);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [cardIdx, setCardIdx] = useState(0);
  const [extracting, setExtracting] = useState(false);
  const [recogNote, setRecogNote] = useState<string | null>(null);
  const [keepError, setKeepError] = useState(false);

  const [newCollectionName, setNewCollectionName] = useState('');
  const [openCollection, setOpenCollection] = useState<string | null>(null);

  /* Explicit insertion — a passage on its way from Keeps into the Working
     Draft. Held here rather than in the editor because the two live on
     different tabs of this Room; this is the only state that crosses.

     The counter makes each request distinct, so bringing the same passage in
     twice is two acts rather than a silently ignored repeat. Cleared as soon
     as the editor reports back, success or failure — a request that failed
     must not sit around waiting to re-fire on the next render. */
  const [pendingInsert, setPendingInsert] = useState<{ id: number; text: string } | null>(null);
  const insertSeq = useRef(0);
  const bringIn = useCallback((text: string) => {
    insertSeq.current += 1;
    setPendingInsert({ id: insertSeq.current, text });
    setTab('draft'); // the work is where the writing is, so go there
  }, []);

  const [rendering, setRendering] = useState<'pdf' | 'epub' | null>(null);
  const [renderError, setRenderError] = useState(false);

  /**
   * W-2 — a failed load must never look like an empty shelf.
   *
   * This previously swallowed the error and fell through to the landing/upload
   * screen, which is indistinguishable from "you have no manuscripts". A writer
   * whose network blipped would see the upload page and reasonably conclude
   * their book was gone. Nothing on screen said otherwise.
   *
   * Five outcomes are now distinct: loading · unauthorized · load-failed ·
   * genuinely empty · loaded.
   */
  const loadList = useCallback(async () => {
    setListError(false);
    try {
      const res = await apiFetch('/api/sovereign/manuscripts', { method: 'GET' });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const list: ManuscriptSummary[] = data.manuscripts ?? [];
      /* `?m=<id>` names WHICH manuscript to open, instead of inferring it from
         position. Start writing uses it so a member who just made a blank page
         lands in that page rather than in "whatever is newest" — the two happen
         to coincide today and will stop coinciding the moment a member has
         several projects.

         Honored only if the id is in the member's own list. The list itself is
         member-scoped server-side, so this cannot name another member's work;
         the check simply means an unknown or stale id falls back to the
         existing behaviour instead of opening nothing. */
      const requested = list.some((m) => m.id === requestedManuscript)
        ? requestedManuscript
        : null;
      setActive((cur) => cur ?? requested ?? (list.length > 0 ? list[0].id : null));
    } catch {
      // Never fall through to the upload screen — that asserts an emptiness we
      // have not established. We do not know what the writer has; say so.
      setListError(true);
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
    setSaveError(false);
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
        body: JSON.stringify({
          title: draftTitle,
          sections: preview,
          /* One of these binds the manuscript to its source. A file-backed
             import claims the arrival already in custody; a paste records the
             exact text the member is confirming, right now, at this act. */
          ...(sourceArrivalId
            ? { sourceArrivalId }
            : { confirmedText: draftText }),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPreview(null);
      setDraftText('');
      setSourceArrivalId(null);
      setDraftTitle('');
      setImporting(false); // intent spent — do not pin the member on the form
      // Import is a threshold, not a destination — and since the Writer
      // Canvas exists, the room the member lands in is the Canvas, by
      // identity, with the new draft on the table. The 2026-08-05 persona
      // walk found imports still ending in this room's seven-tab workbench:
      // the environment existed, but its main entry path predated it.
      window.location.href = `${CANVAS_HREF}?m=${encodeURIComponent(data.id)}`;
    } catch {
      // Preview is preserved so the member can retry the save.
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const onFile = async (f: File) => {
    setWarnings([]);
    // Named before sending. An oversized file cannot succeed by any path, and
    // the member is told the actual size rather than being left to guess.
    if (f.size > MAX_UPLOAD_BYTES) {
      setWarnings([
        `This file is ${formatSize(f.size)}. The upload limit is ${formatSize(MAX_UPLOAD_BYTES)}. ` +
          `Compress or split the file, then try again.`,
      ]);
      return;
    }
    /* WS-01 — every uploaded file takes the same path, including .txt and .md.
     *
     * They used to be read in the browser, so their bytes never reached the
     * server and no artifact could be kept. That was an implementation
     * accident, not an ontological difference: a .md a writer uploads is still
     * an artifact, even though decoding it is trivial. Routing them through
     * ingest puts those bytes into custody like any other file.
     *
     * Nothing about this is visible to the member — same control, same result
     * in the field, same title. Only the transport changed. */
    // Extracted server-side, then shown to the member to review before anything
    // is saved. The author's words, unchanged.
    setIngesting(true);
    try {
      const form = new FormData();
      form.append('file', f);
      const res = await apiFetch('/api/sovereign/manuscripts/ingest', { method: 'POST', body: form });
      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setWarnings([data.error || 'We could not read that file. Try a .docx, .pdf, .txt, or .md.']);
        return;
      }
      setDraftText(data.text || '');
      setSourceArrivalId(typeof data.sourceArrivalId === 'string' ? data.sourceArrivalId : null);
      setWarnings(Array.isArray(data.warnings) ? data.warnings : []);
      if (!draftTitle.trim() && data.title) setDraftTitle(data.title);
    } catch {
      setWarnings(['We could not read that file. Please try again.']);
    } finally {
      setIngesting(false);
    }
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
    setKeepError(false);
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
    setKeepError(false);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${active}/keeps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId: currentCard.sectionId, text: currentCard.text }),
      });
      if (!res.ok) {
        // A failed keep must not read as a successful pass — hold the card for retry.
        setKeepError(true);
        return;
      }
      if (active) await loadDetail(active);
      advance();
    } catch {
      setKeepError(true);
    }
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

  // ---- Your Book: render the whole manuscript into a PDF / EPUB ----------
  const renderBook = async (format: 'pdf' | 'epub') => {
    if (!active) return;
    setRenderError(false);
    setRendering(format);
    try {
      const res = await apiFetch(`/api/sovereign/manuscripts/${active}/render`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format }),
      });
      if (!res.ok) {
        setRenderError(true);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'manuscript'}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setRenderError(true);
    } finally {
      setRendering(null);
    }
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
  const paper = { background: PRESS.bg, color: PRESS.text, fontFamily: SERIF } as const;

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
          <img
            src="/holoflower-studio-transparent.png"
            alt="Soullab"
            className="w-12 h-12 mx-auto mb-5 opacity-90"
          />
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

  /* W-2 — load failure with NOTHING already loaded.
     This MUST be checked before the landing/upload branch below: falling
     through to it would assert an emptiness we have not established. The copy
     deliberately makes no claim about what the writer has or has not got —
     only that we could not read it.

     Guarded on `!active` on purpose: if a manuscript is already open, a failed
     REFRESH must not replace the writer's Room with an error screen. That would
     destroy visible work context to report a transient network fault. In that
     case the Room stays, and the failure appears as a banner (below). */
  if (listError && !active) {
    return (
      <div style={paper} className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <img
            src="/holoflower-studio-transparent.png"
            alt="Soullab"
            className="w-12 h-12 mx-auto mb-5 opacity-90"
          />
          <p className="text-[13px] tracking-[0.25em] uppercase opacity-50 mb-3">Soullab Press</p>
          <p className="text-[15px] leading-relaxed opacity-70 mb-6">
            We couldn&rsquo;t load your manuscripts just now. Nothing has been lost — this is a
            problem reaching them, not a problem with them.
          </p>
          <button
            onClick={() => {
              setLoading(true);
              void loadList();
            }}
            className="px-6 py-2.5 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide min-h-[44px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ---- Landing / upload --------------------------------------------------
  // Reached when the list genuinely loaded (loadedOnce) and is empty, during
  // the confirm-cuts preview, or when the member asked to import another book
  // from Studio Home (?import=1). Never as a consequence of failure.
  if (!active || preview || importing) {
    return (
      <div style={paper} className="min-h-screen">
        <main className="max-w-2xl mx-auto px-6 py-16">
          {/* Import is a threshold inside the Studio, not a product of its own.
              The way back up must always be visible — before this link existed,
              arriving here from the House was a one-way trip into an upload
              form with no Studio around it. */}
          <a
            href="/press/studio"
            className="inline-block text-[12px] tracking-[0.15em] uppercase opacity-45 hover:opacity-80 mb-10"
          >
            ← Author Studio
          </a>
          <h1 className="text-3xl leading-snug mb-4">Import a manuscript</h1>
          <p className="text-[15px] leading-relaxed opacity-70 mb-3">
            Bring in a book you have already written. Paste it, or choose a file.
          </p>
          {/* State the consequence BEFORE the file dialog, not after. */}
          <p className="text-[14px] leading-relaxed opacity-50 mb-12 max-w-md">
            What you bring in is kept as your Source and is never altered. A Working Draft is made
            alongside it — that is the copy you write in. When this is done you will land in the
            Writer Canvas, with your draft on the table.
          </p>

          {!preview ? (
            <div className="space-y-6">
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Title of your manuscript"
                className="press-field w-full bg-transparent border-b border-[#4A4238] py-2 text-lg outline-none placeholder:opacity-40"
                style={{ fontFamily: SERIF }}
              />
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder="Paste your manuscript here…"
                rows={12}
                className="press-field w-full bg-black/20 border border-[#4A4238] rounded-sm p-4 text-[14px] leading-relaxed outline-none placeholder:opacity-40"
                style={{ fontFamily: SERIF }}
              />
              <div className="flex items-center gap-6">
                <label className="text-[13px] underline underline-offset-4 opacity-60 cursor-pointer">
                  {ingesting ? 'reading your file…' : 'or choose a .docx / .pdf / .txt / .md file'}
                  <input
                    type="file"
                    accept=".txt,.md,.markdown,.docx,.pdf"
                    className="hidden"
                    disabled={ingesting}
                    onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                  />
                </label>
                <button
                  onClick={requestPreview}
                  disabled={saving || ingesting || !draftTitle.trim() || !draftText.trim()}
                  className="ml-auto px-6 py-2.5 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
                >
                  {/* Names the threshold being crossed, not the file transfer. */}
                  {saving ? '…' : 'Import into Author Studio'}
                </button>
              </div>
              {warnings.length > 0 && (
                <div className="space-y-2">
                  {warnings.map((w, i) => (
                    <p key={i} className="text-[13px] leading-relaxed opacity-70">
                      {w}
                    </p>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <p className="text-[14px] opacity-70 mb-2">
                {preview.length} section{preview.length === 1 ? '' : 's'} detected — from your
                document&rsquo;s own headings. Confirm the cuts before saving: edit any heading,
                merge a section into the one above it, or cut a section where a heading was missed.
              </p>
              <p className="text-[12px] opacity-50 mb-8">Saved as your words, as you wrote them.</p>
              <div className="space-y-3 mb-10">
                {preview.map((s, i) => (
                  <div key={i} className="border-b border-[#3a322b] pb-2">
                    <div className="flex items-center gap-3">
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
                        className="press-field flex-1 bg-transparent outline-none text-[15px] placeholder:opacity-30"
                        style={{ fontFamily: SERIF }}
                      />
                      <span className="text-[12px] opacity-40">{pageEstimate(s.body.length)} pp</span>
                      <button
                        onClick={() => setSplitOpen((cur) => (cur === i ? null : i))}
                        aria-expanded={splitOpen === i}
                        className="text-[12px] opacity-40 hover:opacity-70"
                      >
                        {splitOpen === i ? 'close' : 'cut'}
                      </button>
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
                    {/* The member redraws a missed cut: click the line where a
                        new section begins — that line becomes its heading, in
                        their own characters. Lines whose cut would orphan text
                        above or below are shown but not offered. */}
                    {splitOpen === i && (
                      <div className="mt-3 ml-11 max-h-64 overflow-y-auto border-l border-[#3a322b] pl-4">
                        <p className="text-[12px] opacity-50 mb-2">
                          Choose the line where a new section begins. That line becomes its heading.
                        </p>
                        {s.body.split('\n').map((line, li, all) => {
                          const t = line.trim();
                          if (!t) return null;
                          const cuttable =
                            all.slice(0, li).join('').trim().length > 0 &&
                            all.slice(li + 1).join('').trim().length > 0;
                          return (
                            <button
                              key={li}
                              disabled={!cuttable}
                              onClick={() => splitSectionAt(i, li)}
                              className="block w-full text-left text-[13px] leading-relaxed py-0.5 truncate disabled:cursor-default disabled:opacity-30 opacity-60 hover:opacity-100 hover:text-[#C9A227]"
                              style={{ fontFamily: SERIF }}
                            >
                              {t}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {saveError && (
                <p className="text-[13px] opacity-70 mb-4">Could not save. Please try again.</p>
              )}
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
                  className="ml-auto px-6 py-2.5 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
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
      {/* W-2: a failed refresh while the Room is open reports itself as a
          banner and leaves the writer's work in place. Replacing the Room with
          an error screen would discard visible context over a transient fault. */}
      {listError && (
        <div
          role="status"
          aria-live="polite"
          className="bg-[#3a2a24] border-b border-[#5a4238] px-6 py-3 text-[13px] text-center"
        >
          We couldn&rsquo;t refresh your manuscript list just now. What you see here is still yours
          and unchanged.{' '}
          <button
            onClick={() => void loadList()}
            className="underline underline-offset-4 min-h-[44px] px-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
          >
            Try again
          </button>
        </div>
      )}
      <header className="border-b border-[#4A4238]">
        <div className="max-w-3xl mx-auto px-6 pt-10 pb-0">
          {/* This room is Layer 3. The Studio (Layer 2) is one step up and must
              always be one click away — a working surface is somewhere you are,
              not somewhere you are stuck. The tab row below stays exactly as it
              was: naming those tabs is a local decision one layer down, and is
              deliberately NOT settled by the Studio shell. */}
          <a
            href="/press/studio"
            className="inline-flex items-center gap-2.5 mb-1 opacity-50 hover:opacity-85 transition-opacity"
          >
            <img src="/holoflower-studio-transparent.png" alt="" aria-hidden="true" className="w-6 h-6" />
            <span className="text-[12px] tracking-[0.25em] uppercase">← Author Studio</span>
          </a>
          <h1 className="text-2xl mb-6">{title}</h1>
          <nav className="flex flex-wrap gap-x-8 gap-y-2 text-[12px] tracking-[0.15em] uppercase">
            {(
              [
                ['manuscript', 'Manuscript'],
                ['draft', 'Working Draft'],
                ['keeps', 'Keeps'],
                ['collections', 'Collections'],
                ['emerging', 'Emerging Books'],
                ['export', 'Export'],
                ['book', 'Your Book'],
              ] as [Tab, string][]
            ).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-3 border-b-2 transition-colors ${
                  tab === t
                    ? 'border-[#C9A227] opacity-100'
                    : 'border-transparent opacity-40 hover:opacity-70'
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14">
        {tab === 'manuscript' && (
          <div>
            <p className="text-[14px] opacity-60 mb-10">
              {pageEstimate(totalChars)} pages · {sections.length} section
              {sections.length === 1 ? '' : 's'} · {keeps.length} kept
            </p>
            <div className="space-y-4 mb-14">
              {sections.map((s) => (
                <div key={s.id} className="flex items-baseline gap-4 border-b border-[#3a322b] pb-3">
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
              className="px-8 py-3 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide"
            >
              Begin Exploration
            </button>
          </div>
        )}

        {tab === 'draft' && (
          <WorkingDraftEditor
            key={active}
            manuscriptId={active}
            pendingInsert={pendingInsert}
            onInsertDone={() => setPendingInsert(null)}
          />
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
                    className="px-10 py-3 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide"
                  >
                    Keep
                  </button>
                  <button
                    onClick={advance}
                    className="px-10 py-3 border border-[#4A4238] text-[14px] tracking-wide opacity-70"
                  >
                    Pass
                  </button>
                </div>
                {keepError && (
                  <p className="text-center text-[13px] opacity-70 mt-6">
                    Could not keep this line.
                  </p>
                )}
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
                            className="bg-transparent border border-[#4A4238] rounded-sm px-1 py-0.5"
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
                        {/* Explicit insertion. The member's verb is "Bring in";
                            the practice act is Integrate; the engineering
                            capability is explicit insertion. Three layers, kept
                            separate — the member only ever meets the first.

                            This is the whole of the gesture on this side: hand
                            the passage down and move to the Working Draft. No
                            placement is decided here, nothing is consumed, and
                            the Keep stays exactly where it is. */}
                        <button
                          onClick={() => bringIn(k.verbatimText)}
                          className="underline underline-offset-4 opacity-80 hover:opacity-100 min-h-[44px] px-2 -mx-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A227]"
                        >
                          Bring in
                        </button>
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
                className="press-field flex-1 bg-transparent border-b border-[#4A4238] py-2 text-lg outline-none"
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
                  <div key={c.id} className="border-b border-[#3a322b] pb-6">
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
              className="px-8 py-3 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
            >
              Download as Markdown
            </button>
          </div>
        )}

        {tab === 'book' && (
          <div>
            <p className="text-[14px] opacity-70 mb-3 leading-relaxed">
              Your manuscript, set as a book — the whole of it, in your own words,
              nothing added. Make a copy you can hold or share.
            </p>
            <p className="text-[12px] opacity-50 mb-8">
              {pageEstimate(totalChars)} pages · {sections.length} section
              {sections.length === 1 ? '' : 's'}. Set in a clean book design; this can take a
              moment to prepare.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => renderBook('pdf')}
                disabled={rendering !== null || sections.length === 0}
                className="px-8 py-3 bg-[#C9A227] text-[#1A1513] text-[14px] tracking-wide disabled:opacity-30"
              >
                {rendering === 'pdf' ? 'setting your book…' : 'Download PDF'}
              </button>
              <button
                onClick={() => renderBook('epub')}
                disabled={rendering !== null || sections.length === 0}
                className="px-8 py-3 border border-[#4A4238] text-[14px] tracking-wide opacity-80 disabled:opacity-30"
              >
                {rendering === 'epub' ? 'setting your book…' : 'Download EPUB'}
              </button>
            </div>
            {renderError && (
              <p className="text-[13px] opacity-70 mt-6">
                Could not make your book just now. Please try again in a moment.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * useSearchParams requires a Suspense boundary (see toTab above — the deep
 * link from Author Studio Home depends on it). The fallback is deliberately
 * blank: the room paints its own "opening…" state a beat later, and a second
 * spinner ahead of it would only add flicker to a room meant to feel slow.
 */
export default function PressManuscriptRoomPage() {
  return (
    <Suspense fallback={null}>
      <PressManuscriptRoom />
    </Suspense>
  );
}
