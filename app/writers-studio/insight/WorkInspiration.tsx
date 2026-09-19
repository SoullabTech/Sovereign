'use client';

import { useEffect, useMemo, useState } from 'react';
import GoldLine from './GoldLine';
import { apiFetch } from '@/lib/http/apiBase';
import { useLivingWorks } from '../useLivingWorks';
import { currentWork, resolveWorkContext } from '../workContext';

type DirectionKey = 'fire' | 'water' | 'earth' | 'air';
type Direction = Record<DirectionKey, string>;

const EMPTY: Direction = { fire: '', water: '', earth: '', air: '' };
const PARTS: Array<{
  key: DirectionKey; element: string; name: string; question: string; help: string;
}> = [
  { key: 'fire', element: 'Fire', name: 'Inspiration',
    question: 'What is calling you to write?',
    help: 'An idea, experience, image, question, writer, philosophy, or future you want to help bring into the world.' },
  { key: 'water', element: 'Water', name: 'Meaning',
    question: 'What must remain true as this work changes?',
    help: 'Name the feeling, intention, discovery, or gift you hope the work carries.' },
  { key: 'earth', element: 'Earth', name: 'Form',
    question: 'What shape might let it live?',
    help: 'A book, story, play, poem, song, script, essay, or something still taking shape—and how it may unfold.' },
  { key: 'air', element: 'Air', name: 'Relationship',
    question: 'Who might meet this work?',
    help: 'What would you like a reader, listener, audience, or community to understand or experience?' },
];

const HEADER = /^(Fire|Water|Earth|Air) · (Inspiration|Meaning|Form|Relationship)$/i;

export function parseWorkDirection(value: string | null): Direction {
  if (!value?.trim()) return { ...EMPTY };
  const lines = value.split('\n');
  const parsed: Direction = { ...EMPTY };
  let current: DirectionKey | null = null;
  let sawHeader = false;
  for (const line of lines) {
    const match = line.trim().match(HEADER);
    if (match) {
      current = match[1].toLowerCase() as DirectionKey;
      sawHeader = true;
      continue;
    }
    if (current) parsed[current] = [parsed[current], line].filter(Boolean).join('\n');
  }
  if (!sawHeader) parsed.fire = value.trim();
  for (const key of Object.keys(parsed) as DirectionKey[]) parsed[key] = parsed[key].trim();
  return parsed;
}

export function serializeWorkDirection(direction: Direction): string {
  return PARTS
    .filter(part => direction[part.key].trim())
    .map(part => `${part.element} · ${part.name}\n${direction[part.key].trim()}`)
    .join('\n\n');
}

function directionSummary(direction: Direction): string {
  return PARTS.filter(part => direction[part.key].trim())
    .map(part => `${part.name}: ${direction[part.key].trim()}`).join('\n\n');
}

/** The writer's living direction, held on the existing Work rather than in a rehearsal store. */
export default function WorkInspiration({ manuscriptId, onBringToQuestion }: {
  manuscriptId: string; onBringToQuestion: (statement: string) => void;
}) {
  const { phase, works, reload } = useLivingWorks();
  const context = resolveWorkContext(phase, works, manuscriptId);
  const work = currentWork(context);
  const saved = useMemo(() => parseWorkDirection(work?.purpose ?? null), [work?.purpose]);
  const [draft, setDraft] = useState<Direction | null>(null);
  const [step, setStep] = useState(0);
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

  const begin = () => {
    setDraft(saved);
    const firstEmpty = PARTS.findIndex(part => !saved[part.key]);
    setStep(firstEmpty < 0 ? 0 : firstEmpty);
    setMessage(null);
  };
  const save = async () => {
    if (!work || draft === null || busy) return;
    const purpose = serializeWorkDirection(draft);
    if (!purpose) { setMessage('Write one thought before keeping this direction.'); return; }
    setBusy(true); setMessage(null);
    try {
      const res = await apiFetch('/api/sovereign/living-works/' + encodeURIComponent(work.id), {
        method: 'PATCH', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ purpose }),
      });
      if (!res.ok) { setMessage('Your direction could not be saved. Your words remain here.'); return; }
      setDraft(null); await reload();
      window.dispatchEvent(new Event('ws-work-purpose-changed'));
      setMessage('Your direction is now held beside this Work.');
    } catch { setMessage('The save could not be confirmed. Your words remain here.'); }
    finally { setBusy(false); }
  };

  const complete = PARTS.filter(part => saved[part.key]).length;
  const current = PARTS[step];

  return <section className="wsi-direction" data-work-inspiration>
    <GoldLine manuscriptId={manuscriptId} />
    <div className="wsi-direction-heading">
      <div>
        <p className="wsi-kicker">The direction beneath the writing</p>
        <h3>{complete ? 'Your larger purpose stays in view.' : 'Let’s find what this work wants to become.'}</h3>
        <p>{complete
          ? 'Return here whenever the work changes. MAIA can use these intentions to guide structural choices and sentence-level edits.'
          : 'You may begin with one answer, move through all four, or simply write. Nothing here locks the work in place.'}</p>
      </div>
      {work && draft === null && <button type="button" onClick={begin}>
        {complete ? 'Review my direction' : 'Begin with MAIA'}
      </button>}
    </div>

    {!work ? <p className="wsi-muted">{context.kind === 'ambiguous'
      ? 'Choose which Work holds this manuscript before naming a shared direction.'
      : context.kind === 'unknown' ? 'The Work context is not available yet.'
      : 'Declare this manuscript as a Work to carry its direction across sessions.'}</p>
    : draft ? <div className="wsi-direction-guide">
      <nav aria-label="Writing direction">
        {PARTS.map((part, index) => <button type="button" key={part.key}
          aria-current={index === step ? 'step' : undefined}
          className={draft[part.key] ? 'is-held' : ''}
          onClick={() => setStep(index)}>
          <span>{index + 1}</span>{part.element} · {part.name}
        </button>)}
      </nav>
      <div className="wsi-direction-question">
        <p className="wsi-kicker">{current.element} · {current.name}</p>
        <h4>{current.question}</h4>
        <p>{current.help}</p>
        <label>
          <span>Your words</span>
          <textarea maxLength={420} rows={5} value={draft[current.key]} disabled={busy}
            onChange={event => setDraft({ ...draft, [current.key]: event.target.value })}
            placeholder="A sentence or a fragment is enough." />
        </label>
        <div className="wsi-bar">
          {step > 0 && <button type="button" disabled={busy} onClick={() => setStep(step - 1)}>Back</button>}
          {step < PARTS.length - 1
            ? <button type="button" className="wsi-primary" disabled={busy} onClick={() => setStep(step + 1)}>
                {draft[current.key].trim() ? 'Keep this and continue' : 'Leave open for now'}
              </button>
            : <button type="button" className="wsi-primary" disabled={busy} onClick={() => void save()}>
                {busy ? 'Keeping…' : 'Keep this direction'}
              </button>}
          {step < PARTS.length - 1 && <button type="button" disabled={busy} onClick={() => void save()}>Save and return to writing</button>}
          <button type="button" disabled={busy} onClick={() => setDraft(null)}>Leave unchanged</button>
        </div>
      </div>
    </div> : complete ? <div className="wsi-direction-kept">
      <p className="wsi-kicker">Held with this Work</p>
      <dl>{PARTS.filter(part => saved[part.key]).map(part => <div key={part.key}>
        <dt>{part.element} · {part.name}</dt><dd>{saved[part.key]}</dd>
      </div>)}</dl>
      <div className="wsi-bar">
        <button type="button" className="wsi-primary" onClick={() => onBringToQuestion(directionSummary(saved))}>Use this in our conversation</button>
        <button type="button" onClick={begin}>Adjust my direction</button>
      </div>
    </div> : null}
    {message && <p role="status" className="wsi-direction-status">{message}</p>}
  </section>;
}
