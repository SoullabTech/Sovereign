'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import {
  COLAB_KINDS,
  COLAB_KIND_LABEL,
  JOURNEY_ANSWER_MAX,
  JOURNEY_PROMPTS,
  type ColabKind,
  type JourneyAnswer,
  type JourneyAnswerForFounder,
  type JourneyPrompt,
} from '@/lib/writersStudio/journey';
import {
  readFounderJourney,
  readOwnJourney,
  sendJourneyAnswer,
  shareJourneyAnswer,
  withdrawJourneyAnswer,
  type ColabAvailability,
} from '@/lib/writersStudio/journeyClient';

/**
 * SEMANTIC-FIELD-01 — the tester journey field (founder ruling 2026-11-01).
 *
 * A returnable place in Writer's Studio for beta writers: Soullab's questions,
 * answered when the writer likes, theirs to see, revise or withdraw, and — only
 * by their explicit act — shared to the Beta Co-Lab under their name.
 *
 * ⛔ Separate from MAIA. This is the Soullab team asking, in our own voice. MAIA
 * never asks for these answers and never reads them.
 */

export const JOURNEY_CONSENT_COPY =
  'Questions from the Soullab team about how the Studio is working for you. Answer any, skip any, come back anytime. '
  + 'You can see, change or withdraw what you’ve said. Your answers carry your name so we can follow up with you. '
  + 'We read only what you write here — never your manuscript or your conversations with MAIA.';

/** The writer's current answer per prompt: the latest version that is neither withdrawn nor superseded. */
export function currentAnswers(answers: readonly JourneyAnswer[]): Map<string, JourneyAnswer> {
  const superseded = new Set(answers.map((a) => a.supersedes).filter(Boolean) as string[]);
  const current = new Map<string, JourneyAnswer>();
  for (const a of answers) {
    if (a.withdrawnAt || superseded.has(a.id)) continue;
    const prev = current.get(a.promptKey);
    if (!prev || prev.createdAt <= a.createdAt) current.set(a.promptKey, a);
  }
  return current;
}

const COLAB_NOTE: Record<Exclude<ColabAvailability, 'open'>, string> = {
  colab_not_open: 'The Beta Co-Lab isn’t open yet. Your answer stays with the Soullab team.',
  not_a_member: 'Sharing goes to the Beta Co-Lab, which you haven’t joined. Your answer stays with the Soullab team.',
};

function PromptCard({
  prompt, current, colab, busy, onSave, onWithdraw, onShare,
}: {
  prompt: JourneyPrompt;
  current: JourneyAnswer | undefined;
  colab: ColabAvailability;
  busy: boolean;
  onSave: (input: { choice?: string; answer: string; supersedes?: string }) => Promise<boolean>;
  onWithdraw: (answerId: string) => void;
  onShare: (answerId: string, kind: ColabKind) => void;
}) {
  const [editing, setEditing] = useState(!current);
  const [choice, setChoice] = useState<string | undefined>(current?.choice ?? undefined);
  const [text, setText] = useState(current?.answer ?? '');
  const [sharing, setSharing] = useState(false);
  const [kind, setKind] = useState<ColabKind | null>(null);

  useEffect(() => {
    setEditing(!current);
    setChoice(current?.choice ?? undefined);
    setText(current?.answer ?? '');
    setSharing(false);
    setKind(null);
  }, [current?.id]);

  const save = async () => {
    const ok = await onSave({
      ...(choice ? { choice } : {}),
      answer: text,
      ...(current ? { supersedes: current.id } : {}),
    });
    if (ok) setEditing(false);
  };

  return (
    <section className="p4r1-journey-prompt" data-journey-prompt={prompt.key}>
      <p className="p4r1-journey-question">{prompt.text}</p>
      {editing ? (
        <div className="p4r1-journey-form">
          {prompt.choices ? (
            <div className="p4r1-journey-choices" role="group" aria-label="Closest answer (optional)">
              {prompt.choices.map((c) => (
                <button key={c.key} type="button" aria-pressed={choice === c.key}
                  onClick={() => setChoice((v) => (v === c.key ? undefined : c.key))}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : null}
          <textarea
            value={text}
            maxLength={JOURNEY_ANSWER_MAX}
            rows={3}
            onChange={(e) => setText(e.target.value)}
            aria-label={`Your answer: ${prompt.text}`}
            placeholder="In your own words"
          />
          <div className="p4r1-journey-actions">
            <button type="button" className="p4r1-journey-primary" disabled={busy || !text.trim()} onClick={() => void save()}>
              {current ? 'Save new version' : 'Save answer'}
            </button>
            {current ? <button type="button" disabled={busy} onClick={() => setEditing(false)}>Cancel</button> : null}
          </div>
        </div>
      ) : current ? (
        <div className="p4r1-journey-answer">
          {current.choice ? (
            <b>{prompt.choices?.find((c) => c.key === current.choice)?.label ?? current.choice}</b>
          ) : null}
          <p>{current.answer}</p>
          {current.colabStillShared && current.colabKind ? (
            <small data-journey-shared>Shared to the Beta Co-Lab as a {COLAB_KIND_LABEL[current.colabKind].toLowerCase()}.</small>
          ) : null}
          <div className="p4r1-journey-actions">
            <button type="button" disabled={busy} onClick={() => setEditing(true)}>Revise</button>
            <button type="button" disabled={busy} onClick={() => onWithdraw(current.id)}>Withdraw</button>
            {!current.colabSharedAt ? (
              <button type="button" disabled={busy} aria-expanded={sharing} onClick={() => setSharing((v) => !v)}>
                Share with the Beta Co-Lab…
              </button>
            ) : null}
          </div>
          {sharing ? (
            colab === 'open' ? (
              <div className="p4r1-journey-share" role="group" aria-label="Share as">
                <span>Share these exact words, under your name, as a:</span>
                <div className="p4r1-journey-choices">
                  {COLAB_KINDS.map((k) => (
                    <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
                      {COLAB_KIND_LABEL[k]}
                    </button>
                  ))}
                </div>
                <button type="button" className="p4r1-journey-primary" disabled={busy || !kind}
                  onClick={() => { if (kind) onShare(current.id, kind); }}>
                  Share
                </button>
              </div>
            ) : (
              <p className="p4r1-journey-note" role="status">{COLAB_NOTE[colab]}</p>
            )
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function FounderView({ answers }: { answers: readonly JourneyAnswerForFounder[] }) {
  const byPrompt = useMemo(() => {
    const map = new Map<string, JourneyAnswerForFounder[]>();
    for (const a of answers) map.set(a.promptKey, [...(map.get(a.promptKey) ?? []), a]);
    return map;
  }, [answers]);
  return (
    <div className="p4r1-journey-founder" data-journey-founder>
      {JOURNEY_PROMPTS.map((prompt) => {
        const list = byPrompt.get(prompt.key) ?? [];
        return (
          <section key={prompt.key} className="p4r1-journey-prompt">
            <p className="p4r1-journey-question">{prompt.text}</p>
            <small>{list.length} {list.length === 1 ? 'answer' : 'answers'}</small>
            {list.map((a) => (
              <div key={a.id} className="p4r1-journey-answer">
                <b>{a.memberName}{a.choice ? ` · ${prompt.choices?.find((c) => c.key === a.choice)?.label ?? a.choice}` : ''}</b>
                <p>{a.answer}</p>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

export default function P4R1BetaJourney() {
  const [eligible, setEligible] = useState(false);
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState<JourneyAnswer[]>([]);
  const [colab, setColab] = useState<ColabAvailability>('colab_not_open');
  const [founder, setFounder] = useState(false);
  const [founderView, setFounderView] = useState<JourneyAnswerForFounder[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    void apiFetch('/api/sovereign/writers-studio/beta-access', { method: 'GET' })
      .then(async (r) => {
        const body = await r.json().catch(() => ({}));
        if (live) setEligible(r.ok && body?.eligible === true);
      })
      .catch(() => { if (live) setEligible(false); });
    return () => { live = false; };
  }, []);

  const load = useCallback(async () => {
    const r = await readOwnJourney();
    if (!r.ok) {
      setStatus(r.refusal === 'journey_not_ready'
        ? 'The beta journey isn’t ready yet. Nothing was lost.'
        : 'Your journey couldn’t be loaded just now. Nothing was lost.');
      return;
    }
    setAnswers(r.answers);
    setColab(r.colab);
    setFounder(r.founder);
  }, []);

  useEffect(() => { if (open) void load(); }, [open, load]);

  const current = useMemo(() => currentAnswers(answers), [answers]);
  const prompts = JOURNEY_PROMPTS.filter((p) => !p.retiredAt);

  const save = (promptKey: string) => async (input: { choice?: string; answer: string; supersedes?: string }) => {
    setBusy(true);
    setStatus(null);
    // ⛔ Work context is never attached automatically (design note §3.2).
    const r = await sendJourneyAnswer({ promptKey, ...input });
    setBusy(false);
    if (!r.ok) {
      setStatus('That answer wasn’t kept. Your words are still in the box.');
      return false;
    }
    setAnswers((prev) => [...prev, r.answer]);
    setStatus('Kept. Thank you — this is about the Studio, not a judgment about your writing.');
    return true;
  };

  const withdraw = async (answerId: string) => {
    setBusy(true);
    setStatus(null);
    const r = await withdrawJourneyAnswer(answerId);
    setBusy(false);
    if (!r.ok) { setStatus('That answer couldn’t be withdrawn just now. Nothing changed.'); return; }
    await load();
    setStatus('Withdrawn. It no longer appears anywhere, including the Beta Co-Lab.');
  };

  const share = async (answerId: string, kind: ColabKind) => {
    setBusy(true);
    setStatus(null);
    const r = await shareJourneyAnswer(answerId, kind);
    setBusy(false);
    if (!r.ok) {
      setStatus(r.refusal === 'colab_not_open' || r.refusal === 'not_a_member'
        ? COLAB_NOTE[r.refusal]
        : 'That wasn’t shared. Nothing changed.');
      return;
    }
    setAnswers((prev) => prev.map((a) => (a.id === answerId ? r.answer : a)));
    setStatus('Shared to the Beta Co-Lab under your name. You can withdraw it anytime.');
  };

  const showFounder = async () => {
    if (founderView) { setFounderView(null); return; }
    const r = await readFounderJourney();
    if (r.ok) setFounderView(r.answers);
    else setStatus('All answers couldn’t be loaded just now.');
  };

  if (!eligible) return null;

  return (
    <div className="p4r1-beta-journey" data-p4r1-beta-journey>
      <button type="button" className="p4r1-beta-trigger" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        Beta journey
      </button>
      {open ? (
        <div className="p4r1-beta-panel p4r1-journey-panel" role="dialog" aria-label="Writer’s Studio beta journey">
          <header>
            <div><b>Beta journey</b><span>{JOURNEY_CONSENT_COPY}</span></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close beta journey">×</button>
          </header>
          {founder ? (
            <button type="button" className="p4r1-journey-founder-toggle" aria-pressed={Boolean(founderView)} onClick={() => void showFounder()}>
              {founderView ? 'Back to my answers' : 'All writers’ answers'}
            </button>
          ) : null}
          {founderView ? <FounderView answers={founderView} /> : prompts.map((prompt) => (
            <PromptCard
              key={prompt.key}
              prompt={prompt}
              current={current.get(prompt.key)}
              colab={colab}
              busy={busy}
              onSave={save(prompt.key)}
              onWithdraw={(id) => void withdraw(id)}
              onShare={(id, kind) => void share(id, kind)}
            />
          ))}
          {status ? <p className="p4r1-beta-status" role="status">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
