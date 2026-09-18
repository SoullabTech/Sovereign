'use client';
import { useEffect, useState } from 'react';
import { EDITORIAL_APPROACHES, appendEditorialNote, approachNote, voiceNote } from '@/lib/writersStudio/editorialApproaches';

export default function EditorialApproaches({ scopeKey, instruction, onInstruction, busy }: {
  scopeKey: string; instruction: string; onInstruction: (value: string) => void; busy: boolean;
}) {
  const [notes, setNotes] = useState<Record<string, { preferences: string; example: string }>>({});
  useEffect(() => {
    if (!Object.values(notes).some(note => note.preferences || note.example)) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [notes]);
  const current = notes[scopeKey] ?? { preferences: '', example: '' };
  const update = (value: Partial<typeof current>) => setNotes(previous => ({
    ...previous, [scopeKey]: { ...current, ...value },
  }));
  return <section aria-label="Editorial directions" className="wsi-approaches">
    <h3>Choose what to explore</h3>
    <p>Optional starting points. Add one to your question, change it, or write your own. Nothing is sent until you ask MAIA.</p>
    <div className="wsi-direction-grid">{EDITORIAL_APPROACHES.map(approach => <article key={approach.id} className="wsi-current">
      <h4>{approach.label}</h4>
      <p><strong>Could help:</strong> {approach.benefit}</p>
      <p><strong>Consider:</strong> {approach.tradeoff}</p>
      <button type="button" disabled={busy} onClick={() => onInstruction(appendEditorialNote(instruction, approachNote(approach.id)))}>
        Explore {approach.label.toLowerCase()}
      </button>
    </article>)}</div>
    <details>
      <summary>What makes this sound like you?</summary>
      <p>Choose what matters for this passage. These notes stay on this page; only what you bring into your question is sent.</p>
      <label>Voice and meaning to preserve
        <textarea value={current.preferences} disabled={busy} onChange={e => update({ preferences: e.target.value })}
          placeholder="For example: keep my contemplative rhythm and elemental imagery; clarify transitions without explaining away the mystery." />
      </label>
      <label>A passage of your own to use as a voice reference (optional)
        <textarea value={current.example} disabled={busy} onChange={e => update({ example: e.target.value })} />
      </label>
      <button type="button" disabled={busy || !voiceNote(current.preferences, current.example)} onClick={() =>
        onInstruction(appendEditorialNote(instruction, voiceNote(current.preferences, current.example)))}>
        Bring these notes into my question
      </button>
    </details>
  </section>;
}
