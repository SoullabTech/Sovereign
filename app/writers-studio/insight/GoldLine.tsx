'use client';
import { useEffect, useState } from 'react';
import { useMarkedLines } from '../useMarkedLines';

/** Store only the chosen Keep id as a display preference. Text and attribution
 * always come from the authenticated Keeps read, never browser storage. */
export default function GoldLine({ manuscriptId }: { manuscriptId: string }) {
  const { phase, lines } = useMarkedLines();
  const [chosenId, setChosenId] = useState<string | null>(null);
  const [otherWorks, setOtherWorks] = useState(false);
  const key = 'ws:gold-line:' + manuscriptId;
  useEffect(() => {
    const read = () => { try { setChosenId(localStorage.getItem(key)); } catch { setChosenId(null); } };
    read();
    window.addEventListener('ws-gold-line-changed', read);
    window.addEventListener('storage', read);
    return () => { window.removeEventListener('ws-gold-line-changed', read); window.removeEventListener('storage', read); };
  }, [key]);
  const choose = (id: string) => {
    setChosenId(id || null);
    try { if (id) localStorage.setItem(key, id); else localStorage.removeItem(key); } catch { return; /* Retain this session choice when storage is unavailable. */ }
    window.dispatchEvent(new Event('ws-gold-line-changed'));
  };
  const chosen = phase === 'ready' ? lines.find(line => line.id === chosenId) : null;
  const available = phase === 'ready' ? lines.filter(line => otherWorks || line.manuscriptId === manuscriptId || line.id === chosenId) : [];
  return <section data-studio-gold-line style={{ padding: '12px 0', borderBottom: '1px solid var(--ws-rule-soft)' }}>
    {chosen && <figure style={{ margin: '0 0 10px' }}>
      <blockquote style={{ margin: 0, color: 'var(--ws-gold-text)', fontFamily: 'var(--font-spectral, Georgia, serif)', fontSize: 16, lineHeight: 1.6, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{chosen.verbatimText}</blockquote>
      <figcaption style={{ marginTop: 6, fontSize: 11, color: 'var(--ws-ink-secondary)' }}>{chosen.manuscriptTitle ?? 'Untitled manuscript'}{chosen.sectionHeading ? ' · ' + chosen.sectionHeading : ''} · your kept line</figcaption>
    </figure>}
    <details><summary style={{ color: 'var(--ws-gold-text)', cursor: 'pointer', fontSize: 12 }}>Gold line · {chosen ? 'change or hide' : 'choose from your kept lines'}</summary>
      <div style={{ display: 'grid', gap: 10, padding: '10px 0' }}>
        <label style={{ fontSize: 12 }}><input type="checkbox" checked={otherWorks} onChange={e => setOtherWorks(e.target.checked)} /> Include my other manuscripts</label>
        {phase === 'ready' ? <label style={{ fontSize: 12 }}>Line to hold nearby
          <select aria-label="Gold line to hold nearby" value={chosen?.id ?? ''} onChange={e => choose(e.target.value)} style={{ display: 'block', width: '100%', maxWidth: '100%', color: 'var(--ws-ink-primary)', background: 'var(--ws-ground-field)' }}>
            <option value="">Keep the field quiet</option>
            {available.map(line => <option key={line.id} value={line.id}>{line.verbatimText.slice(0, 90)} · {line.manuscriptTitle ?? 'Untitled manuscript'}</option>)}
          </select>
        </label> : <p style={{ fontSize: 12 }}>{phase === 'loading' ? 'Opening your kept lines…' : 'Your kept lines could not be reached.'}</p>}
        {phase === 'ready' && available.length === 0 && <p style={{ fontSize: 12 }}>No kept lines are available here yet. The Studio will not choose words on your behalf.</p>}
      </div>
    </details>
  </section>;
}
