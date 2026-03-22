'use client';

/**
 * MAIA Identity Audit — Intake Form
 *
 * Multi-section intake matching the V1 audit specification.
 * Five sections: Context, Current Edge, Self-Perception, Pattern Signal, Optional Depth.
 */

import { useState } from 'react';
import type { IdentityAuditIntake, PrimaryRole, PatternSignal } from '@/lib/maia/prompts/identityAuditPrompt';

const PRIMARY_ROLES: PrimaryRole[] = [
  'Founder',
  'Creator',
  'Operator',
  'Guide / Facilitator',
  'Other',
];

const PATTERN_SIGNALS: PatternSignal[] = [
  "I overthink and stall",
  "I act quickly but don't sustain",
  "I feel deeply but don't express clearly",
  "I stay structured but feel constrained",
  "I shift directions often",
  "I feel disconnected from what I'm doing",
];

interface Props {
  onSubmit: (intake: IdentityAuditIntake) => void;
  isLoading: boolean;
}

export function IdentityAuditForm({ onSubmit, isLoading }: Props) {
  // Context
  const [name, setName] = useState('');
  const [whoAndBuilding, setWhoAndBuilding] = useState('');
  const [primaryRole, setPrimaryRole] = useState<PrimaryRole | ''>('');

  // Current Edge
  const [biggestTension, setBiggestTension] = useState('');
  const [stuckSplitOverextended, setStuckSplitOverextended] = useState('');
  const [creatingNow, setCreatingNow] = useState('');

  // Self-Perception
  const [whatPeopleRelyOnYouFor, setWhatPeopleRelyOnYouFor] = useState('');
  const [underexpressed, setUnderexpressed] = useState('');
  const [gettingInOwnWay, setGettingInOwnWay] = useState('');

  // Pattern Signal (multi-select up to 2)
  const [patternSignals, setPatternSignals] = useState<PatternSignal[]>([]);

  // Optional Depth
  const [journalEntry, setJournalEntry] = useState('');
  const [birthData, setBirthData] = useState('');

  const togglePatternSignal = (signal: PatternSignal) => {
    setPatternSignals((prev) => {
      if (prev.includes(signal)) return prev.filter((s) => s !== signal);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, signal];
    });
  };

  const canSubmit =
    whoAndBuilding.trim() &&
    biggestTension.trim() &&
    stuckSplitOverextended.trim() &&
    !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const intake: IdentityAuditIntake = {
      ...(name.trim() ? { name: name.trim() } : {}),
      whoAndBuilding: whoAndBuilding.trim(),
      ...(primaryRole ? { primaryRole } : {}),
      biggestTension: biggestTension.trim(),
      stuckSplitOverextended: stuckSplitOverextended.trim(),
      creatingNow: creatingNow.trim(),
      whatPeopleRelyOnYouFor: whatPeopleRelyOnYouFor.trim(),
      underexpressed: underexpressed.trim(),
      ...(gettingInOwnWay.trim() ? { gettingInOwnWay: gettingInOwnWay.trim() } : {}),
      ...(patternSignals.length ? { patternSignals } : {}),
      ...(journalEntry.trim() ? { journalEntry: journalEntry.trim() } : {}),
      ...(birthData.trim() ? { birthData: birthData.trim() } : {}),
    };

    onSubmit(intake);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-12">

      {/* SECTION 1 — CONTEXT */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 1 — Context
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Name or identifier <span className="text-stone-500">(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How you'd like to be identified in the report"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What are you currently building or focused on?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={whoAndBuilding}
              onChange={(e) => setWhoAndBuilding(e.target.value)}
              rows={4}
              placeholder="Describe your current work, project, or life focus. Include context about who you are."
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What is your primary role right now?
            </label>
            <div className="flex flex-wrap gap-2">
              {PRIMARY_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setPrimaryRole(primaryRole === role ? '' : role)}
                  className={`px-4 py-2 rounded text-sm border transition-colors ${
                    primaryRole === role
                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                      : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — CURRENT EDGE */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 2 — Current Edge
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What feels most challenging or stuck right now?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={biggestTension}
              onChange={(e) => setBiggestTension(e.target.value)}
              rows={4}
              placeholder="Be specific. What are you actually running into?"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Where do you feel split, conflicted, or pulled in different directions?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={stuckSplitOverextended}
              onChange={(e) => setStuckSplitOverextended(e.target.value)}
              rows={4}
              placeholder="Where is the tension living in your work or life?"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What are you trying to create or move toward?
            </label>
            <textarea
              value={creatingNow}
              onChange={(e) => setCreatingNow(e.target.value)}
              rows={3}
              placeholder="The vision, goal, or state you're moving toward."
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — SELF-PERCEPTION */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 3 — Self-Perception
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What do people rely on you for?
            </label>
            <textarea
              value={whatPeopleRelyOnYouFor}
              onChange={(e) => setWhatPeopleRelyOnYouFor(e.target.value)}
              rows={3}
              placeholder="What role do others assign to you, even if it's not how you see yourself?"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What do you feel is underexpressed or not fully seen?
            </label>
            <textarea
              value={underexpressed}
              onChange={(e) => setUnderexpressed(e.target.value)}
              rows={3}
              placeholder="What capacity, quality, or dimension of you hasn't had room yet?"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              If you're honest, where do you think you might be getting in your own way?
            </label>
            <textarea
              value={gettingInOwnWay}
              onChange={(e) => setGettingInOwnWay(e.target.value)}
              rows={3}
              placeholder="What you've already noticed, even partially."
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — PATTERN SIGNAL */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 4 — Pattern Signal
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Which feels most true right now? Choose up to 2.
        </p>
        <div className="space-y-2">
          {PATTERN_SIGNALS.map((signal) => {
            const selected = patternSignals.includes(signal);
            const maxed = patternSignals.length >= 2 && !selected;
            return (
              <button
                key={signal}
                type="button"
                disabled={maxed}
                onClick={() => togglePatternSignal(signal)}
                className={`w-full text-left px-4 py-3 rounded border text-sm transition-colors ${
                  selected
                    ? 'bg-amber-500/15 border-amber-500/50 text-amber-200'
                    : maxed
                    ? 'bg-stone-950 border-stone-800 text-stone-600 cursor-not-allowed'
                    : 'bg-stone-900 border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-300'
                }`}
              >
                {signal}
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 5 — OPTIONAL DEPTH */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 5 — Optional Depth
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Journal entry, reflection, or recent thought pattern{' '}
              <span className="text-stone-500">(optional)</span>
            </label>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              rows={5}
              placeholder="Anything on your mind lately — raw is fine."
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Birth data <span className="text-stone-500">(optional — for elemental resonance)</span>
            </label>
            <input
              type="text"
              value={birthData}
              onChange={(e) => setBirthData(e.target.value)}
              placeholder="Date, time, location (e.g. March 4, 1980, 6:15am, Portland OR)"
              className="w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>
        </div>
      </section>

      {/* SUBMIT */}
      <div className="pt-4 border-t border-stone-800">
        <p className="text-xs text-stone-600 mb-5">
          Fields marked <span className="text-amber-500">*</span> are required.
          Your intake is processed privately and stored only as structural pattern data — no content is shared.
        </p>
        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full py-4 rounded text-sm font-medium tracking-wide transition-all ${
            canSubmit
              ? 'bg-amber-500 text-stone-950 hover:bg-amber-400'
              : 'bg-stone-800 text-stone-600 cursor-not-allowed'
          }`}
        >
          {isLoading ? 'Generating your audit…' : 'Run Identity Audit'}
        </button>
      </div>
    </form>
  );
}
