'use client';

/**
 * Team Audit — Intake Form
 *
 * Five sections: Team Context, Dynamics, Leadership Pattern, Pattern Signals, Optional.
 * Required: whatBuilding, primaryTension, energyDrain.
 */

import { useState } from 'react';
import type { TeamAuditIntake, TeamPatternSignal } from '@/lib/maia/prompts/teamAuditPrompt';

const PATTERN_SIGNALS: TeamPatternSignal[] = [
  'Decisions happen but don\'t fully land',
  'Energy is high in planning, low in execution',
  'There is an unspoken hierarchy that shapes everything',
  'The team avoids a conversation that everyone knows is needed',
  'Strengths are siloed — people don\'t cross-pollinate',
  'One person carries a disproportionate load',
  'The team is reactive rather than generative',
  'There is more agreement on surface than underneath',
];

interface Props {
  onSubmit: (intake: TeamAuditIntake) => void;
  isLoading: boolean;
}

export function TeamAuditForm({ onSubmit, isLoading }: Props) {
  // Team context
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [whatBuilding, setWhatBuilding] = useState('');

  // Dynamics
  const [collectiveStrength, setCollectiveStrength] = useState('');
  const [primaryTension, setPrimaryTension] = useState('');
  const [energyDrain, setEnergyDrain] = useState('');
  const [underexpressed, setUnderexpressed] = useState('');

  // Leadership (optional)
  const [leadershipPattern, setLeadershipPattern] = useState('');

  // Pattern signals (up to 3)
  const [patternSignals, setPatternSignals] = useState<TeamPatternSignal[]>([]);

  // Optional
  const [journalEntry, setJournalEntry] = useState('');

  const togglePatternSignal = (signal: TeamPatternSignal) => {
    setPatternSignals((prev) => {
      if (prev.includes(signal)) return prev.filter((s) => s !== signal);
      if (prev.length >= 3) return prev;
      return [...prev, signal];
    });
  };

  const canSubmit =
    whatBuilding.trim() &&
    primaryTension.trim() &&
    energyDrain.trim() &&
    !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const intake: TeamAuditIntake = {
      ...(teamName.trim() ? { teamName: teamName.trim() } : {}),
      teamSize: teamSize.trim(),
      whatBuilding: whatBuilding.trim(),
      collectiveStrength: collectiveStrength.trim(),
      primaryTension: primaryTension.trim(),
      energyDrain: energyDrain.trim(),
      underexpressed: underexpressed.trim(),
      ...(leadershipPattern.trim() ? { leadershipPattern: leadershipPattern.trim() } : {}),
      ...(patternSignals.length ? { patternSignals } : {}),
      ...(journalEntry.trim() ? { journalEntry: journalEntry.trim() } : {}),
    };

    onSubmit(intake);
  };

  const inputClass =
    'w-full bg-stone-900 border border-stone-700 rounded px-4 py-3 text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-500/50 text-sm';
  const textareaClass = `${inputClass} resize-none`;

  return (
    <form onSubmit={handleSubmit} className="space-y-12">

      {/* SECTION 1 — TEAM CONTEXT */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 1 — Team Context
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Team name <span className="text-stone-500">(optional)</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="How you'd identify this team in the report"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Approximate size and structure
            </label>
            <input
              type="text"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 6 people, cross-functional, 2 in leadership"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What is this team building or doing?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={whatBuilding}
              onChange={(e) => setWhatBuilding(e.target.value)}
              rows={4}
              placeholder="The work, mission, or primary focus of the team right now."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 — DYNAMICS */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 2 — Dynamics
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What does this team do well collectively?
            </label>
            <textarea
              value={collectiveStrength}
              onChange={(e) => setCollectiveStrength(e.target.value)}
              rows={3}
              placeholder="Where the team generates genuine momentum or coherence together."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What is the main internal or external friction?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={primaryTension}
              onChange={(e) => setPrimaryTension(e.target.value)}
              rows={3}
              placeholder="The tension that keeps surfacing — even when addressed."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Where does energy go but not return?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={energyDrain}
              onChange={(e) => setEnergyDrain(e.target.value)}
              rows={3}
              placeholder="The activities, dynamics, or contexts that drain without replenishing."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What hasn't been fully activated in this team?
            </label>
            <textarea
              value={underexpressed}
              onChange={(e) => setUnderexpressed(e.target.value)}
              rows={3}
              placeholder="Capacity, quality, or potential that hasn't had room yet."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — LEADERSHIP PATTERN */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 3 — Leadership Pattern{' '}
          <span className="text-stone-500 normal-case tracking-normal text-xs">(optional)</span>
        </h2>
        <div>
          <label className="block text-sm text-stone-300 mb-2">
            How do decisions get made in this team?
          </label>
          <textarea
            value={leadershipPattern}
            onChange={(e) => setLeadershipPattern(e.target.value)}
            rows={3}
            placeholder="Who holds decision authority, how consensus is reached, or how direction is set."
            className={textareaClass}
          />
        </div>
      </section>

      {/* SECTION 4 — PATTERN SIGNALS */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 4 — Pattern Signals
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Which feels most true about this team? Choose up to 3.
        </p>
        <div className="space-y-2">
          {PATTERN_SIGNALS.map((signal) => {
            const selected = patternSignals.includes(signal);
            const maxed = patternSignals.length >= 3 && !selected;
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

      {/* SECTION 5 — OPTIONAL */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 5 — Optional Depth
        </h2>
        <div>
          <label className="block text-sm text-stone-300 mb-2">
            Additional context, recent patterns, or notes{' '}
            <span className="text-stone-500">(optional)</span>
          </label>
          <textarea
            value={journalEntry}
            onChange={(e) => setJournalEntry(e.target.value)}
            rows={5}
            placeholder="Anything relevant that doesn't fit the fields above — raw is fine."
            className={textareaClass}
          />
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
          {isLoading ? 'Generating team audit…' : 'Run Team Audit'}
        </button>
      </div>
    </form>
  );
}
