'use client';
import { useEffect, useState } from 'react';
import { EDITORIAL_APPROACHES, approachNote, voiceNote, type EditorialApproachId } from '@/lib/writersStudio/editorialApproaches';
export default function EditorialApproaches({ scopeKey, onContext, busy }: {
  scopeKey: string; onContext: (value: string) => void; busy: boolean;
}) {
  const [notes, setNotes] = useState<Record<string, { direction: EditorialApproachId | ''; intention: string; preferences: string; example: string; includeVoice: boolean }>>({});
  const current = notes[scopeKey] ?? { direction: '', intention: '', preferences: '', example: '', includeVoice: false };
  const update = (value: Partial<typeof current>) => setNotes(previous => ({ ...previous, [scopeKey]: { ...current, ...value } }));
  const context = [current.direction ? approachNote(current.direction) : '',
    current.intention.trim() ? 'My intention: ' + current.intention.trim() : '',
    current.includeVoice ? voiceNote(current.preferences, current.example) : ''].filter(Boolean).join('\n\n');
  useEffect(() => { onContext(context); }, [context, onContext]);
  useEffect(() => {
    if (!Object.values(notes).some(n => n.intention || n.preferences || n.example)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [notes]);
  return <section aria-label="Editorial directions" className="wsi-approaches">
    <h3>Choose a direction</h3>
    <p>Choose one starting point, or leave it open. Your intention stays editable; nothing is sent until you discuss it.</p>
    <div className="wsi-direction-grid">{EDITORIAL_APPROACHES.map(a => <article key={a.id} className="wsi-current">
      <h4>{a.label}</h4><p><strong>Could help:</strong> {a.benefit}</p><p><strong>Consider:</strong> {a.tradeoff}</p>
      <button type="button" disabled={busy} aria-pressed={current.direction === a.id}
        onClick={() => update({ direction: current.direction === a.id ? '' : a.id })}>{a.label}</button>
    </article>)}</div>
    <label>Your intention<textarea value={current.intention} disabled={busy} onChange={e => update({ intention: e.target.value })}
      placeholder="What should this passage contribute? What should remain?" /></label>
    <details><summary>What makes this sound like you?</summary>
      <label>Voice and meaning to preserve<textarea value={current.preferences} disabled={busy} onChange={e => update({ preferences: e.target.value })} /></label>
      <label>A passage of your own to use as a voice reference (optional)<textarea value={current.example} disabled={busy} onChange={e => update({ example: e.target.value })} /></label>
      <label><input type="checkbox" checked={current.includeVoice} disabled={busy} onChange={e => update({ includeVoice: e.target.checked })} /> Include these voice notes when I discuss this</label>
      <p className="wsi-muted">Reference only. Your example is not replacement copy.</p>
    </details>
  </section>;
}
