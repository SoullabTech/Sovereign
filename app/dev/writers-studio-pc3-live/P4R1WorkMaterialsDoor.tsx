'use client';

/**
 * The Materials door — a place to bring new material BESIDE an already-open
 * manuscript (MAIA-SOVEREIGN-ka3).
 *
 * Three acts, kept distinct:
 *   KEEP     — the material joins the Work (a belonging row; nothing is copied
 *              into any passage). Reuses the existing intake + declaration
 *              routes; this component invents no new store.
 *   EXPLORE  — only when the writer chooses, the material enters the current
 *              MAIA conversation as attributed material.
 *   PLACE    — only when the writer chooses, MAIA is asked where it might fit.
 *              She offers possibilities; the writer chooses; nothing is
 *              inserted. ⛔ No manuscript write path exists in this file.
 *
 * Adding material never touches the draft, the focus, or the conversation:
 * this component holds only its own state and renders beside them.
 */

import { useState } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/http/apiBase';
import type { LivingWork } from '@/app/writers-studio/useLivingWorks';

type Props = {
  work: LivingWork | null;
  /** Headings as stored. Offered to MAIA only on an explicit "where does it fit". */
  outline?: readonly string[];
  /** Routes prepared context into the surface's existing MAIA conversation. */
  onExplore?: (context: string, intent: MaterialIntent) => void;
  /** 'send' = the host sends it; 'prefill' = it only fills the composer for the writer to send. Drives what the door honestly says happened. */
  exploreMode?: 'send' | 'prefill';
  /** The host's hard limit on one question. Over-long context is refused here, never silently trimmed or destroyed by a failed send. */
  maxContextChars?: number;
  /** Called after a belonging is recorded so the host may reload its Work. */
  onChanged?: () => void;
};

type Kept = { id: string; title: string; text: string | null; sentence: string | null };
type ExistingSource = { id: string; originalName: string; transcriptionStatus: string };

export const MAX_MATERIAL_CONTEXT = 12_000;
export const MAX_OUTLINE_HEADINGS = 150;
const MAX_HEADING_CHARS = 120;

export type MaterialIntent = 'explore' | 'place';

export function safeFileName(title: string): string {
  const base = title.replace(/[\\/:*?"<>|\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
  return `${base || 'Note'}.txt`;
}

export function noteBody(text: string, reference: string): string {
  const ref = reference.trim();
  return ref ? `Reference: ${ref}\n\n${text.trim()}` : text.trim();
}

export function boundedOutline(outline: readonly string[] | undefined): string[] {
  return (outline ?? [])
    .map((h) => h.replace(/\s+/g, ' ').trim().slice(0, MAX_HEADING_CHARS))
    .filter(Boolean)
    .slice(0, MAX_OUTLINE_HEADINGS);
}

/** Pure: builds the context a writer's explicit choice sends. Never sends on its own. */
export function buildMaterialContext(input: {
  title: string;
  text: string;
  workTitle: string;
  sentence: string | null;
  intent: MaterialIntent;
  outline?: readonly string[];
}): { context: string | null; reason: string | null } {
  const text = input.text.trim();
  if (!text) return { context: null, reason: 'That material has no text to bring in. Nothing was sent to MAIA.' };
  if (text.length > MAX_MATERIAL_CONTEXT) {
    return {
      context: null,
      reason: 'This material is too long to bring into a conversation as one piece. MAIA does not choose excerpts from it for you. Nothing was sent.',
    };
  }
  const place = input.intent === 'place';
  const headings = place ? boundedOutline(input.outline) : [];
  return {
    context: [
      'MEMBER MATERIAL · NEW',
      `Title: ${input.title}`,
      `Belongs to the Work: ${input.workTitle}`,
      input.sentence ? `Why the member says this feeds the Work: ${input.sentence}` : null,
      '',
      text,
      '',
      'Boundary: This is member-provided material. It is not manuscript text and must not be copied into the manuscript unless the member explicitly chooses wording later.',
      place
        ? [
            '',
            'The member asked: where would this fit best in the Work, and how?',
            'Say which place seems strongest and why, then at most two alternatives. This is your reading for the member to weigh, not a decision.',
            'For each place, name the kind of move it would be: a new passage after a particular paragraph, a new subsection, a revision of existing text, a light echo of something already there, or no addition at all. Say plainly if no addition is the best answer. This Studio cannot yet create a new subsection by itself, so if that is the move, say so and say the member would add it by hand for now.',
            'Anchor each place to the member\u2019s own headings or exact manuscript wording you can actually see. If you cannot see the relevant text, say so instead of guessing, and say what you would need to see.',
            'Say what would make your reading wrong.',
            'Do not draft insertion wording and do not change the manuscript. The member decides, and the member writes their own words.',
            headings.length > 0
              ? `Headings as stored (they may include import artifacts and are not confirmed authored structure):\n${headings.map((h) => `- ${h}`).join('\n')}`
              : null,
          ].filter((line) => line !== null).join('\n')
        : 'The member chose to explore this with you. Begin by saying how, if at all, it seems to relate to what they are working on, and let them decide what to do next.',
    ].filter((line) => line !== null).join('\n'),
    reason: null,
  };
}

export default function P4R1WorkMaterialsDoor({ work, outline, onExplore, exploreMode = 'send', maxContextChars, onChanged }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [reference, setReference] = useState('');
  const [text, setText] = useState('');
  const [sentence, setSentence] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [kept, setKept] = useState<Kept[]>([]);
  const [existing, setExisting] = useState<ExistingSource[] | null>(null);
  const [existingError, setExistingError] = useState(false);

  if (!work) return null;

  const attachedIds = new Set(
    work.materials.filter((m) => m.materialType === 'source_upload').map((m) => m.materialId),
  );
  for (const k of kept) attachedIds.add(k.id);

  const loadExisting = async () => {
    try {
      const res = await apiFetch('/api/writers-studio/sources', { method: 'GET' });
      if (!res.ok) throw new Error('list');
      const payload = await res.json();
      setExisting(Array.isArray(payload?.sources) ? payload.sources : []);
      setExistingError(false);
    } catch {
      setExisting([]);
      setExistingError(true);
    }
  };

  const keep = async (sourceId: string) => {
    const res = await apiFetch(`/api/sovereign/living-works/${encodeURIComponent(work.id)}/materials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ materialType: 'source_upload', materialId: sourceId, sentence: sentence.trim() || null }),
    });
    if (!res.ok) throw new Error('keep');
  };

  const bringFile = async (file: File, label: string, plainText: string | null) => {
    setBusy(true);
    setMessage(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const up = await apiFetch('/api/writers-studio/sources', { method: 'POST', body: form });
      const payload = await up.json().catch(() => null);
      if (!up.ok || !payload?.source?.id) {
        setMessage(payload?.error ? `${payload.error}. Nothing was added.` : 'That could not be brought in just now. Nothing was added.');
        return;
      }
      if (payload.source.transcriptionStatus !== 'reviewed') {
        setMessage('Saved as a source, but it needs your review before it can join this Work. Open Sources to review it. Your manuscript is unchanged.');
        return;
      }
      const savedSentence = sentence.trim() || null;
      await keep(payload.source.id);
      setKept((prev) => [...prev, { id: payload.source.id, title: label, text: plainText, sentence: savedSentence }]);
      setTitle(''); setReference(''); setText(''); setSentence('');
      setMessage('Kept with this Work. Your manuscript, your place and this conversation are unchanged.');
      onChanged?.();
    } catch {
      setMessage('That could not be kept with the Work just now. Your manuscript is unchanged.');
    } finally {
      setBusy(false);
    }
  };

  const keepNote = () => {
    const body = noteBody(text, reference);
    if (!body) return;
    const label = title.trim() || 'Note';
    void bringFile(new File([body], safeFileName(label), { type: 'text/plain' }), label, body);
  };

  const keepExisting = async (source: ExistingSource) => {
    setBusy(true);
    setMessage(null);
    try {
      const savedSentence = sentence.trim() || null;
      await keep(source.id);
      setKept((prev) => [...prev, { id: source.id, title: source.originalName, text: null, sentence: savedSentence }]);
      setMessage('Kept with this Work. Your manuscript, your place and this conversation are unchanged.');
      onChanged?.();
    } catch {
      setMessage('That could not be kept with the Work just now. Your manuscript is unchanged.');
    } finally {
      setBusy(false);
    }
  };

  const send = async (item: Kept, intent: MaterialIntent) => {
    if (!onExplore || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      let body = item.text;
      if (body === null) {
        const res = await apiFetch(`/api/writers-studio/sources/${encodeURIComponent(item.id)}`, { method: 'GET' });
        const payload = await res.json().catch(() => null);
        const source = payload?.source;
        body = res.ok && source?.transcriptionStatus === 'reviewed' && typeof source.transcriptionReviewed === 'string'
          ? source.transcriptionReviewed : null;
        if (body === null) {
          setMessage('That material could not be opened as reviewed text. Nothing was sent to MAIA.');
          return;
        }
      }
      const prepared = buildMaterialContext({
        title: item.title, text: body, workTitle: work.title ?? 'this Work', sentence: item.sentence, intent, outline,
      });
      if (!prepared.context) { setMessage(prepared.reason); return; }
      if (maxContextChars && prepared.context.length > maxContextChars) {
        setMessage(`This is too long to send as one question here (the limit is ${maxContextChars.toLocaleString()} characters; this is ${prepared.context.length.toLocaleString()}). Use a shorter piece, or open it in Write. Nothing was sent and your conversation box is unchanged.`);
        return;
      }
      onExplore(prepared.context, intent);
      setMessage(exploreMode === 'prefill'
        ? 'Put in the conversation box for you to read and send. Nothing has been asked yet, and nothing has been inserted anywhere.'
        : 'Sent to MAIA in this passage’s conversation, where it will stay. If no reply appears, nothing was asked. Nothing has been inserted anywhere.');
    } catch {
      setMessage('That could not be prepared just now. Nothing was sent to MAIA.');
    } finally {
      setBusy(false);
    }
  };

  const nameById = new Map((existing ?? []).map((source) => [source.id, source.originalName]));
  const earlier: Kept[] = work.materials
    .filter((m) => m.materialType === 'source_upload' && !kept.some((k) => k.id === m.materialId))
    .map((m) => ({ id: m.materialId, title: nameById.get(m.materialId) ?? 'Kept note', text: null, sentence: m.sentence }));
  const available = (existing ?? []).filter((s) => s.transcriptionStatus === 'reviewed' && !attachedIds.has(s.id));

  return (
    <details
      className="p4r1-focus-materials p4r1-materials-door"
      data-materials-door
      open={open}
      onToggle={(event) => {
        const next = (event.currentTarget as HTMLDetailsElement).open;
        setOpen(next);
        if (next && existing === null) void loadExisting();
      }}
    >
      <summary>
        <span>Bring in material</span>
        <b aria-hidden="true">+</b>
      </summary>
      <div>
        <p className="p4r1-focus-materials-boundary">
          Keep it with {work.title ? `“${work.title}”` : 'this Work'} now; decide later whether and where it belongs.
          Adding material never changes your manuscript, your place, or this conversation.
        </p>

        <div className="p4r1-door-form">
          <label>
            <span>Paste a note, excerpt or idea</span>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Paste or write it here…" />
          </label>
          <label>
            <span>Title <i>(optional)</i></span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Corbin — the imaginal" />
          </label>
          <label>
            <span>Where it comes from <i>(optional)</i></span>
            <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Author, book, conversation…" />
          </label>
          <label>
            <span>What might it feed? <i>(optional — in your words)</i></span>
            <input value={sentence} onChange={(e) => setSentence(e.target.value)} />
          </label>
          <div className="p4r1-door-actions">
            <button type="button" disabled={busy || !text.trim()} onClick={keepNote}>
              {busy ? 'Keeping…' : 'Keep with this Work'}
            </button>
            <label className="p4r1-door-file">
              <input
                type="file"
                accept=".txt,.md,.docx,.pdf,image/*"
                disabled={busy}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) void bringFile(file, file.name, null);
                }}
              />
              Add a file
            </label>
          </div>
          <p className="p4r1-focus-materials-boundary">
            Notes, .docx and .md keep straight away. A PDF or image needs your review first. Whole manuscripts don’t belong here — your manuscript is already the Work.
          </p>
        </div>

        {available.length > 0 ? (
          <div className="p4r1-door-existing">
            <span className="p4r1-eyebrow">Already brought in</span>
            <ul>
              {available.map((source) => (
                <li key={source.id}>
                  <div><span>{source.originalName}</span></div>
                  <div className="p4r1-focus-material-actions">
                    <button type="button" disabled={busy} onClick={() => void keepExisting(source)}>Keep with this Work</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {existingError ? (
          <p className="p4r1-focus-material-status" role="status">Your earlier material couldn’t be listed just now.</p>
        ) : null}

        {onExplore && earlier.length > 0 ? (
          <div className="p4r1-door-kept">
            <span className="p4r1-eyebrow">Already kept with this Work</span>
            <ul>
              {earlier.map((item) => (
                <li key={item.id}>
                  <div><span>{item.title}</span></div>
                  <div className="p4r1-focus-material-actions">
                    <button type="button" disabled={busy} onClick={() => void send(item, 'explore')}>Explore with MAIA</button>
                    <button type="button" disabled={busy} onClick={() => void send(item, 'place')}>Where would it fit best, and how?</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {kept.length > 0 ? (
          <div className="p4r1-door-kept">
            <span className="p4r1-eyebrow">Kept just now</span>
            <ul>
              {kept.map((item) => (
                <li key={item.id}>
                  <div><span>{item.title}</span></div>
                  {onExplore ? (
                    <div className="p4r1-focus-material-actions">
                      <button type="button" disabled={busy} onClick={() => void send(item, 'explore')}>Explore with MAIA</button>
                      <button type="button" disabled={busy} onClick={() => void send(item, 'place')}>Where would it fit best, and how?</button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {message ? <p className="p4r1-focus-material-status" role="status">{message}</p> : null}
        <p className="p4r1-focus-materials-boundary">
          <Link href="/writers-studio/sources">Open all sources</Link>
        </p>
      </div>
    </details>
  );
}
