'use client';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  DEFAULT_WORKING_STYLE, PACE_COPY, PACE_VALUES, EXPLANATION_COPY,
  EXPLANATION_VALUES, readWorkingStyle, writeWorkingStyle,
  type WriterWorkingStyle,
} from '@/lib/writersStudio/workingStyle';
import {
  isStudioDepth, readStudioPresentation, writeStudioPresentation,
  subscribeStudioPresentation, proposePresentationRequest,
  type StudioDepth, type SafePresentationProposal,
} from '@/lib/writersStudio/presentationRequests';
import { readStudioReadingSize, setStudioReadingSize, type StudioReadingSize } from '@/lib/writersStudio/readingSizePreference';

export default function WriterPreferencesMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const [style, setStyle] = useState<WriterWorkingStyle>(DEFAULT_WORKING_STYLE);
  const [depth, setDepth] = useState<StudioDepth>('focused');
  const [size, setSize] = useState<StudioReadingSize>('large');
  const [request, setRequest] = useState('');
  const [proposal, setProposal] = useState<SafePresentationProposal | null>(null);
  const [message, setMessage] = useState('');
  useEffect(() => {
    setStyle(readWorkingStyle());
    setDepth(readStudioPresentation().depth);
    setSize(readStudioReadingSize());
    const changed = (event: Event) => {
      const detail = (event as CustomEvent<WriterWorkingStyle>).detail;
      if (detail?.pace && detail.explanation) setStyle(detail);
    };
    window.addEventListener('writers-studio-working-style-changed', changed);
    const unsubDepth = subscribeStudioPresentation(next => setDepth(next.depth));
    const outside = (event: PointerEvent) => {
      if (ref.current?.open && !ref.current.contains(event.target as Node)) ref.current.open = false;
    };
    document.addEventListener('pointerdown', outside);
    return () => {
      window.removeEventListener('writers-studio-working-style-changed', changed);
      unsubDepth();
      document.removeEventListener('pointerdown', outside);
    };
  }, []);
  function propose(event: FormEvent) {
    event.preventDefault();
    const next = proposePresentationRequest(request, style);
    setProposal(next);
    setMessage(next ? '' : 'I could not safely infer a display preference. Try “show me fewer choices” or adjust the controls below. Nothing changed.');
  }
  function apply() {
    if (!proposal) return;
    writeWorkingStyle(proposal.style);
    if (proposal.depth) writeStudioPresentation({ depth: proposal.depth });
    if (proposal.readingSize) {
      setStudioReadingSize(proposal.readingSize);
      setSize(proposal.readingSize);
    }
    setStyle(proposal.style);
    if (proposal.depth) setDepth(proposal.depth);
    setMessage('Presentation adjusted on this device. Your manuscript, permissions, and MAIA consent have not changed.');
    setRequest(''); setProposal(null);
  }
  return <details ref={ref} className="fr-writer-preferences" data-writer-preferences>
    <summary aria-label="Writing preferences">Preferences</summary>
    <section className="fr-writer-preference-panel" aria-label="How Writer's Studio meets you">
      <h2>How would you like to work?</h2>
      <p>The writing stays yours. You can choose how much guidance and detail you see.</p>
      <form onSubmit={propose}>
        <label htmlFor="writer-presentation-request">Tell the Studio in your own words</label>
        <div className="fr-writer-request-entry">
          <input id="writer-presentation-request" type="text" value={request} maxLength={150}
            onChange={event => { setRequest(event.target.value); setProposal(null); setMessage(''); }}
            placeholder="MAIA, show me fewer choices" />
          <button type="submit" disabled={!request.trim()}>Review</button>
        </div>
        <p className="fr-writer-request-hint">Try “guide me step by step,” “use plain language,” or “show all the tools.” Only clear display requests are handled here.</p>
      </form>
      {proposal ? <div role="status" className="fr-writer-proposal" data-writer-presentation-proposal>
        <strong>{proposal.label}</strong>
        <p>{proposal.explanation}</p>
        <div className="fr-writer-pref-actions">
          <button type="button" onClick={apply}>Apply to my Studio</button>
          <button type="button" onClick={() => setProposal(null)}>Not now</button>
        </div>
      </div> : null}
      {message ? <p className="fr-writer-pref-status" role="status">{message}</p> : null}
      <details className="fr-writer-fine-tune">
        <summary>Fine-tune directly</summary>
        <div className="fr-writer-pref-grid">
          <label>How much to show
            <select aria-label="Studio display depth" value={depth}
              onChange={event => { const v=event.target.value; if(isStudioDepth(v)){setDepth(v);writeStudioPresentation({depth:v});}}}>
              <option value="focused">Focused · just what matters now</option>
              <option value="guided">Guided · unfold a little more</option>
              <option value="full">Full · all editorial tools</option>
            </select>
          </label>
          <label>Working pace
            <select aria-label="Studio working pace" value={style.pace}
              onChange={event => { const pace=event.target.value as WriterWorkingStyle['pace']; if(!PACE_VALUES.includes(pace))return; const next={...style,pace};setStyle(next);writeWorkingStyle(next); }}>
              {PACE_VALUES.map(pace=><option value={pace} key={pace}>{PACE_COPY[pace].label}</option>)}
            </select>
          </label>
          <label>Explanation
            <select aria-label="Studio explanation depth" value={style.explanation}
              onChange={event => {const explanation=event.target.value as WriterWorkingStyle['explanation'];if(!EXPLANATION_VALUES.includes(explanation))return;const next={...style,explanation};setStyle(next);writeWorkingStyle(next);}}>
              {EXPLANATION_VALUES.map(explanation=><option value={explanation} key={explanation}>{EXPLANATION_COPY[explanation].label}</option>)}
            </select>
          </label>
          <label>Reading size
            <select aria-label="Reading size preference" value={size}
              onChange={event=>{const next=event.target.value as StudioReadingSize;if(!['large','larger','largest'].includes(next))return;setSize(next);setStudioReadingSize(next);}}>
              <option value="large">Large</option>
              <option value="larger">Larger</option>
              <option value="largest">Largest</option>
            </select>
          </label>
        </div>
      </details>
      <p className="fr-writer-pref-foot">Only presentation preferences are saved locally. Nothing here changes what MAIA may read, your consent, or which words may be revised.</p>
      <details className="fr-writer-about-access">
        <summary>About Studio access</summary>
        <p>Free and Pro belong to the same Studio. Pro offers extended capabilities, not a different atmosphere or lesser care for Free writers.</p>
        <a href="/writers-studio/plans">See the planned Free and Pro experience</a>
      </details>
    </section>
  </details>;
}
