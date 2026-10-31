'use client';
import { useEffect, useState } from 'react';
import GoldLine from './GoldLine';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';

/** The existing member-authored Work purpose, not a second inspiration store. */
const COMPASS_PROMPTS = [
  ['Inspirations', 'Writers, writings, teachers, ideas, ideals, images or traditions that nourish this Work.'],
  ['Fire · Vision', 'What possibility or vision calls this Work into being?'],
  ['Water · Meaning', 'What feeling, longing, experience or meaning does it carry?'],
  ['Earth · Mission, method, medicine', 'What will the Work offer, teach, serve or make possible?'],
  ['Air · Voice, audience, communication', 'Who is this for, and how does it wish to speak or travel?'],
  ['Aether · Deeper intention', 'What deeper calling or essential truth may be emerging? It is fine not to know.'],
] as const;
function composeCompass(parts: readonly string[]): string {
  return COMPASS_PROMPTS.map(([name], index) => parts[index]?.trim() ? `${name}:\n${parts[index].trim()}` : '').filter(Boolean).join('\n\n');
}

export default function WorkInspiration({ manuscriptId, onBringToQuestion }: {
  manuscriptId: string; onBringToQuestion: (statement: string) => void;
}) {
  const { phase, works, reload } = useLivingWorks();
  const context = resolveWorkContext(phase, works, manuscriptId);
  const work = currentWork(context);
  const [draft, setDraft] = useState<string | null>(null);
  const [draftForWorkId, setDraftForWorkId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [guided, setGuided] = useState(false);
  const [compass, setCompass] = useState<string[]>(() => COMPASS_PROMPTS.map(() => ''));
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (draft === null) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [draft]);
  useEffect(() => {
    const refresh = () => { void reload(); };
    window.addEventListener('ws-work-purpose-changed', refresh);
    return () => window.removeEventListener('ws-work-purpose-changed', refresh);
  }, [reload]);
  const save = async () => {
    if (!work || draft === null || busy) return;
    if (draftForWorkId !== work.id) {
      setMessage('This draft belongs to a different Work. Nothing was saved. Return to the original Work or leave this draft unchanged.');
      return;
    }
    setBusy(true); setMessage(null);
    try {
      const res = await apiFetch('/api/sovereign/living-works/' + encodeURIComponent(work.id), {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ purpose: draft.trim() ? draft : null }),
      });
      if (!res.ok) { setMessage('Your statement could not be saved. Your words remain here.'); return; }
      setDraft(null); setDraftForWorkId(null); await reload();
      window.dispatchEvent(new Event('ws-work-purpose-changed'));
      setMessage('Saved as your Work’s statement of inspiration and intention.');
    } catch { setMessage('The save could not be confirmed. Your words remain here.'); }
    finally { setBusy(false); }
  };
  return <><GoldLine manuscriptId={manuscriptId} /><details data-work-inspiration>
    <summary>Inspiration & intention · Living Compass{work?.purpose ? ' · held with this Work' : ''}</summary>
    <p>The people, writings, ideas and ideals that nourish this Work, alongside Fire (vision), Water (meaning), Earth (mission and method), Air (audience and expression), and Aether (deeper intention). Every part is optional and open to change.</p>
    {!work ? <p className="wsi-muted">{context.kind === 'ambiguous'
      ? 'This manuscript belongs to several Works. Choose its Work before editing a shared statement.'
      : context.kind === 'unknown' ? 'The Work context is not available yet.'
      : 'Declare this manuscript as a Work to keep its inspiration across sessions.'}</p>
      : draft !== null ? <>
        <label>Your Work statement<textarea maxLength={2000} value={draft} disabled={busy} onChange={e => setDraft(e.target.value)} /></label>
        <details open={guided} onToggle={e => setGuided(e.currentTarget.open)}>
          <summary>Explore the Living Compass · optional prompts</summary>
          <p className="wsi-muted">These are invitations, not requirements. Nothing is added until you choose to place it in your statement. Existing words are never replaced.</p>
          {COMPASS_PROMPTS.map(([name, prompt], index) => <label key={name}>{name}
            <span className="wsi-muted">{prompt}</span>
            <textarea value={compass[index]} disabled={busy} maxLength={700}
              onChange={e => setCompass(previous => previous.map((value, i) => i === index ? e.target.value : value))} />
          </label>)}
          <button type="button" disabled={busy || !composeCompass(compass) || (draft.length + composeCompass(compass).length + 2 > 2000)}
            onClick={() => { setDraft(current => [current?.trim(), composeCompass(compass)].filter(Boolean).join('\n\n')); setCompass(COMPASS_PROMPTS.map(() => '')); setGuided(false); }}>
            Add these reflections to my statement
          </button>
          <p className="wsi-muted">The Work statement can hold up to 2,000 characters. You can also reflect on one element at a time.</p>
        </details>
        <p className="wsi-muted">{draft.length}/2000 · This is the same statement held under Becoming in your Work.</p>
        <div className="wsi-bar"><button type="button" disabled={busy} onClick={() => void save()}>Save inspiration & intention</button>
          <button type="button" disabled={busy} onClick={() => { setDraft(null); setDraftForWorkId(null); setCompass(COMPASS_PROMPTS.map(() => '')); }}>Leave unchanged</button></div>
      </> : <>
        {work.purpose && <p className="wsi-observation">{work.purpose}</p>}
        <div className="wsi-bar"><button type="button" onClick={() => { setDraft(work.purpose ?? ''); setDraftForWorkId(work.id); setMessage(null); }}>{work.purpose ? 'Edit your statement' : 'Name what inspires this Work'}</button>
          {work.purpose && <button type="button" onClick={() => { onBringToQuestion(work.purpose!); setMessage('Added to the current MAIA question draft. Review it before sending.'); }}>Bring this into my question</button>}</div>
        <p className="wsi-muted">Bringing it into your question adds it to the editable draft; you decide when to send. Sources and manuscript text remain separate.</p>
      </>}
    {message && <p role="status">{message}</p>}
  </details></>;
}
