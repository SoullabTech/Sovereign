'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BETA_FEEDBACK_LABEL, BETA_FEEDBACK_SIGNALS, type BetaFeedbackSignal } from '@/lib/writersStudio/betaFeedback';
import { sendBetaFeedback } from '@/lib/writersStudio/betaFeedbackClient';
import type { UnifiedStudioMode } from './P4R1StudioHost';

export default function P4R1BetaFeedback({ mode }: { mode: UnifiedStudioMode }) {
  const params = useSearchParams();
  const enabled = params?.get('beta') === '1';
  const [open, setOpen] = useState(false);
  const [signal, setSignal] = useState<BetaFeedbackSignal | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const context = useMemo(() => ({
    ...(params?.get('developField') ? { developField: params.get('developField')! } : {}),
    ...(params?.get('developmentalMovement') ? { developmentalMovement: params.get('developmentalMovement')! } : {}),
    ...(params?.get('s') ? { sectionId: params.get('s')! } : {}),
    ...(params?.get('attentionItem') ? { attentionReturn: params.get('attentionItem')! } : {}),
    ...(params?.get('reviewFinding') ? { reviewFinding: params.get('reviewFinding')! } : {}),
    ...(params?.get('lineageCandidate') ? { lineageCandidate: params.get('lineageCandidate')! } : {}),
  }), [params]);

  if (!enabled) return null;

  const submit = async () => {
    if (!signal || busy) return;
    setBusy(true);
    setStatus(null);
    const result = await sendBetaFeedback({
      ...(params?.get('m') ? { manuscriptId: params.get('m')! } : {}),
      signal,
      studioMode: mode,
      orientationContext: context,
      ...(note.trim() ? { note: note.trim() } : {}),
    });
    setBusy(false);
    if (!result.ok) {
      setStatus('This note was not kept. Nothing else changed.');
      return;
    }
    setStatus('Thank you. This is kept as beta evidence, not as a judgment about your writing.');
    setSignal(null);
    setNote('');
  };

  return (
    <div className="p4r1-beta-feedback" data-p4r1-beta-feedback>
      <button type="button" className="p4r1-beta-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Beta note
      </button>
      {open ? (
        <div className="p4r1-beta-panel" role="dialog" aria-label="Writer’s Studio beta feedback">
          <header>
            <div><b>What happened?</b><span>Choose the closest description. Nothing here changes your Work.</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close beta feedback">×</button>
          </header>
          <div className="p4r1-beta-signals">
            {BETA_FEEDBACK_SIGNALS.map((item) => (
              <button key={item} type="button" aria-pressed={signal === item} onClick={() => setSignal(item)}>
                {BETA_FEEDBACK_LABEL[item]}
              </button>
            ))}
          </div>
          {signal === 'maia_misunderstood' ? (
            <p className="p4r1-beta-hint">If you want MAIA’s working understanding to change, use <b>Correct MAIA</b> on the exact response as well.</p>
          ) : null}
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Optional — what should we understand about this moment?" />
          <button type="button" className="p4r1-beta-submit" disabled={!signal || busy} onClick={() => void submit()}>
            {busy ? 'Keeping…' : 'Keep beta note'}
          </button>
          {status ? <p className="p4r1-beta-status" role="status">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
