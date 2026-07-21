'use client';

/**
 * Developmental Reflection Experience — beta v0.
 *
 * Grounding: EA_WORLD_CLASS_ASSESSMENT_FOUNDATIONS_2026-07-21.md (§5 question
 * doctrine, §6 results doctrine, §11 prototype spec, §13 aesthetic doctrine)
 * and Kelly's Founder Walkthrough Protocol v0.
 *
 * What this deliberately is NOT (by ruling, not omission):
 *   - no scoring, visible or internal — nothing is computed about the person
 *   - no elements, types, percentages, or identity language
 *   - no required questions: every question is skippable, and "I'd rather not
 *     say" is an honored answer that is neither stored nor inferred from
 *   - the result screen shows the member's own words back, verbatim
 *   - the return is an invitation the member sets, never a streak
 */

import React, { useEffect, useState } from 'react';

const QUESTIONS = [
  'What feels most alive in your life right now?',
  'What keeps returning for you?',
  'What may be ending?',
  'What may be trying to emerge?',
  'What feels difficult to name or explain?',
  'What might support you over the next few weeks?',
];

type PriorReflection = {
  id: string;
  answers: Array<{ question: string; answer: string }>;
  experiment: string | null;
  created_at: string;
};

type View =
  | 'welcome'
  | 'lookback'
  | 'questions'
  | 'mirror'
  | 'experiment'
  | 'return'
  | 'closing';

export default function ReflectionPage() {
  const [view, setView] = useState<View>('welcome');
  const [prior, setPrior] = useState<PriorReflection | null>(null);
  const [isReturnVisit, setIsReturnVisit] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [draft, setDraft] = useState('');
  const [experiment, setExperiment] = useState('');
  const [ifThen, setIfThen] = useState('');
  const [returnWeeks, setReturnWeeks] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/reflection')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.reflections?.length > 0) setPrior(data.reflections[0]);
      })
      .catch(() => {});
  }, []);

  const answered = QUESTIONS.map((q, i) => ({ index: i, question: q, answer: answers[i] }))
    .filter((a): a is { index: number; question: string; answer: string } =>
      Boolean(a.answer && a.answer.trim()),
    );

  function commitDraftAndAdvance(skip: boolean) {
    if (!skip && draft.trim()) {
      setAnswers((prev) => ({ ...prev, [questionIndex]: draft }));
    }
    setDraft(answers[questionIndex + 1] ?? '');
    if (questionIndex < QUESTIONS.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      setView('mirror');
    }
  }

  function goBack() {
    if (questionIndex === 0) return;
    if (draft.trim()) setAnswers((prev) => ({ ...prev, [questionIndex]: draft }));
    setQuestionIndex(questionIndex - 1);
    setDraft(answers[questionIndex - 1] ?? '');
  }

  async function save() {
    setSaving(true);
    setSaveError(null);
    const returnIntentAt = returnWeeks
      ? new Date(Date.now() + returnWeeks * 7 * 24 * 3600 * 1000).toISOString().slice(0, 10)
      : undefined;
    try {
      const res = await fetch('/api/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: answered.map(({ question, answer }) => ({ question, answer })),
          experiment: experiment.trim() || undefined,
          experimentIfThen: ifThen.trim() || undefined,
          returnIntentAt,
          priorReflectionId: isReturnVisit && prior ? prior.id : undefined,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      setView('closing');
    } catch {
      setSaveError('Your reflection could not be saved. Your words are still on this page — please try again.');
    } finally {
      setSaving(false);
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="min-h-screen bg-[#0a0e17] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl">{children}</div>
    </div>
  );

  if (view === 'welcome') {
    return shell(
      <div className="text-center space-y-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/holoflower-studio-transparent.png"
          alt=""
          className="w-20 h-20 mx-auto opacity-90"
        />
        <h1 className="text-2xl font-light tracking-wide">A Reflection</h1>
        <p className="text-white/60 leading-relaxed max-w-md mx-auto">
          A few quiet questions about your life right now — what is moving, what
          may be ending, what may be emerging. Your words stay yours. There are
          no results, and nothing here will tell you who you are.
        </p>
        <p className="text-white/40 text-sm">
          Answer as much or as little as you like. Every question can be skipped.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              setIsReturnVisit(false);
              setView('questions');
            }}
            className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors"
          >
            Begin reflection
          </button>
          {prior && (
            <button
              onClick={() => setView('lookback')}
              className="w-full max-w-xs mx-auto block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
            >
              Read what you wrote last time
            </button>
          )}
        </div>
      </div>,
    );
  }

  if (view === 'lookback' && prior) {
    const when = new Date(prior.created_at).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return shell(
      <div className="space-y-8">
        <p className="text-white/40 text-sm text-center">From {when} — in your words</p>
        <div className="space-y-6">
          {prior.answers.map((a, i) => (
            <div key={i} className="space-y-1">
              <p className="text-white/40 text-sm">{a.question}</p>
              <p className="text-white/85 leading-relaxed whitespace-pre-wrap">“{a.answer}”</p>
            </div>
          ))}
          {prior.experiment && (
            <div className="space-y-1">
              <p className="text-white/40 text-sm">The experiment you named</p>
              <p className="text-white/85 leading-relaxed">“{prior.experiment}”</p>
            </div>
          )}
        </div>
        <div className="pt-4 border-t border-white/10 space-y-4 text-center">
          <p className="text-white/70">Reading this now — does anything look different?</p>
          <button
            onClick={() => {
              setIsReturnVisit(true);
              setView('questions');
            }}
            className="px-6 py-3 rounded-xl bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors"
          >
            Reflect again
          </button>
          <button
            onClick={() => setView('welcome')}
            className="block mx-auto text-white/40 text-sm hover:text-white/60"
          >
            Back
          </button>
        </div>
      </div>,
    );
  }

  if (view === 'questions') {
    return shell(
      <div className="space-y-8">
        <p className="text-white/30 text-sm text-center">
          {questionIndex + 1} of {QUESTIONS.length}
        </p>
        <h2 className="text-xl font-light text-center leading-relaxed">
          {QUESTIONS[questionIndex]}
        </h2>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={5}
          placeholder="In your own words — or skip."
          className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-200/30 resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            disabled={questionIndex === 0}
            className="text-white/40 text-sm hover:text-white/60 disabled:opacity-0"
          >
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => commitDraftAndAdvance(true)}
              className="px-4 py-2 rounded-lg text-white/45 text-sm hover:text-white/70 transition-colors"
            >
              I&rsquo;d rather not say
            </button>
            <button
              onClick={() => commitDraftAndAdvance(false)}
              className="px-6 py-2 rounded-lg bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      </div>,
    );
  }

  if (view === 'mirror') {
    return shell(
      <div className="space-y-8">
        <h2 className="text-xl font-light text-center">In your words</h2>
        {answered.length === 0 ? (
          <p className="text-white/60 text-center leading-relaxed">
            You chose to hold your answers privately this time. That is a
            complete reflection too.
          </p>
        ) : (
          <div className="space-y-6">
            {answered.map((a) => (
              <div key={a.index} className="space-y-1">
                <p className="text-white/40 text-sm">{a.question}</p>
                <p className="text-white/85 leading-relaxed whitespace-pre-wrap">“{a.answer}”</p>
              </div>
            ))}
          </div>
        )}
        <p className="text-white/50 text-sm text-center leading-relaxed">
          Nothing here has been scored, sorted, or interpreted. These are your
          words, kept exactly as you wrote them.
        </p>
        <button
          onClick={() => setView('experiment')}
          className="block mx-auto px-6 py-3 rounded-xl bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors"
        >
          Continue
        </button>
      </div>,
    );
  }

  if (view === 'experiment') {
    return shell(
      <div className="space-y-8">
        <h2 className="text-xl font-light text-center leading-relaxed">
          Is there one small experiment you&rsquo;d like to try?
        </h2>
        <p className="text-white/50 text-sm text-center">
          Something of your own choosing — small enough to actually happen.
          Entirely optional.
        </p>
        <textarea
          value={experiment}
          onChange={(e) => setExperiment(e.target.value)}
          rows={3}
          placeholder="In your own words — or leave empty."
          className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-200/30 resize-none leading-relaxed"
        />
        {experiment.trim() && (
          <div className="space-y-2">
            <p className="text-white/50 text-sm">
              If it helps: when will you try it? (&ldquo;If it&rsquo;s Saturday morning, then…&rdquo;)
            </p>
            <textarea
              value={ifThen}
              onChange={(e) => setIfThen(e.target.value)}
              rows={2}
              placeholder="Optional."
              className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-white/90 placeholder-white/25 focus:outline-none focus:border-amber-200/30 resize-none leading-relaxed"
            />
          </div>
        )}
        <button
          onClick={() => setView('return')}
          className="block mx-auto px-6 py-3 rounded-xl bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors"
        >
          Continue
        </button>
      </div>,
    );
  }

  if (view === 'return') {
    return shell(
      <div className="space-y-8 text-center">
        <h2 className="text-xl font-light leading-relaxed">
          Would you like to return and see what changed?
        </h2>
        <p className="text-white/50 text-sm max-w-md mx-auto">
          If you choose a time, your words will be here waiting. No reminders,
          no streaks — just a door left open.
        </p>
        <div className="flex justify-center gap-3">
          {[2, 4].map((w) => (
            <button
              key={w}
              onClick={() => setReturnWeeks(returnWeeks === w ? null : w)}
              className={`px-5 py-2 rounded-lg border transition-colors ${
                returnWeeks === w
                  ? 'bg-amber-200/15 border-amber-200/40 text-amber-100'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
              }`}
            >
              In about {w} weeks
            </button>
          ))}
          <button
            onClick={() => setReturnWeeks(null)}
            className={`px-5 py-2 rounded-lg border transition-colors ${
              returnWeeks === null
                ? 'bg-white/10 border-white/20 text-white/80'
                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
            }`}
          >
            Not now
          </button>
        </div>
        {saveError && <p className="text-red-300/80 text-sm">{saveError}</p>}
        <button
          onClick={save}
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-amber-200/10 border border-amber-200/25 text-amber-100 hover:bg-amber-200/15 transition-colors disabled:opacity-50"
        >
          {saving ? 'Keeping your words…' : 'Finish'}
        </button>
      </div>,
    );
  }

  // closing
  return shell(
    <div className="text-center space-y-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/holoflower-studio-transparent.png" alt="" className="w-16 h-16 mx-auto opacity-80" />
      <h2 className="text-xl font-light">Kept, in your words.</h2>
      <p className="text-white/60 leading-relaxed max-w-md mx-auto">
        {returnWeeks
          ? 'Your reflection is here whenever you return. Nothing will chase you — the door is simply open.'
          : 'Your reflection is here if you ever want to look back.'}
      </p>
      <a
        href="/maia"
        className="inline-block px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
      >
        Return to MAIA
      </a>
    </div>,
  );
}
