'use client';
import { useEffect, useState } from 'react';
import GoldLine from './GoldLine';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';

/** The existing member-authored Work purpose, not a second inspiration store. */
export default function WorkInspiration({ manuscriptId, onBringToQuestion }: {
  manuscriptId: string; onBringToQuestion: (statement: string) => void;
}) {
  const { phase, works, reload } = useLivingWorks();
  const context = resolveWorkContext(phase, works, manuscriptId);
  const work = currentWork(context);
  const [draft, setDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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
    setBusy(true); setMessage(null);
    try {
      const res = await apiFetch('/api/sovereign/living-works/' + encodeURIComponent(work.id), {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ purpose: draft.trim() ? draft : null }),
      });
      if (!res.ok) { setMessage('Your statement could not be saved. Your words remain here.'); return; }
      setDraft(null); await reload();
      window.dispatchEvent(new Event('ws-work-purpose-changed'));
      setMessage('Saved as your Work’s statement of inspiration and intention.');
    } catch { setMessage('The save could not be confirmed. Your words remain here.'); }
    finally { setBusy(false); }
  };
  return <><GoldLine manuscriptId={manuscriptId} /><details data-work-inspiration>
    <summary>Inspiration & intention{work?.purpose ? ' · held with this Work' : ''}</summary>
    <p>The spark that began this work, the meaning it carries, and the voices, ideas, or visions that nourish it. In your own words, and open to change.</p>
    {!work ? <p className="wsi-muted">{context.kind === 'ambiguous'
      ? 'This manuscript belongs to several Works. Choose its Work before editing a shared statement.'
      : context.kind === 'unknown' ? 'The Work context is not available yet.'
      : 'Declare this manuscript as a Work to keep its inspiration across sessions.'}</p>
      : draft !== null ? <>
        <label>Your Work statement<textarea maxLength={2000} value={draft} disabled={busy} onChange={e => setDraft(e.target.value)} /></label>
        <p className="wsi-muted">{draft.length}/2000 · This is the same statement held under Becoming in your Work.</p>
        <div className="wsi-bar"><button type="button" disabled={busy} onClick={() => void save()}>Save inspiration & intention</button>
          <button type="button" disabled={busy} onClick={() => setDraft(null)}>Leave unchanged</button></div>
      </> : <>
        {work.purpose && <p className="wsi-observation">{work.purpose}</p>}
        <div className="wsi-bar"><button type="button" onClick={() => setDraft(work.purpose ?? '')}>{work.purpose ? 'Edit your statement' : 'Name what inspires this Work'}</button>
          {work.purpose && <button type="button" onClick={() => onBringToQuestion(work.purpose!)}>Bring this into my question</button>}</div>
        <p className="wsi-muted">Bringing it into your question adds it to the editable draft; you decide when to send. Sources and manuscript text remain separate.</p>
      </>}
    {message && <p role="status">{message}</p>}
  </details></>;
}
