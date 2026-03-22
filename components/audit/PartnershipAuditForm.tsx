'use client';

/**
 * Partnership Audit — Intake Form
 *
 * Five sections: Person A, Person B, Partnership Dynamics, Pattern Signals, Optional.
 * Required: personARole, personBRole, sharedPurpose, primaryTension.
 */

import { useState } from 'react';
import type {
  PartnershipAuditIntake,
  PartnershipPatternSignal,
} from '@/lib/maia/prompts/partnershipAuditPrompt';

const PATTERN_SIGNALS: PartnershipPatternSignal[] = [
  'One person leads, one person follows consistently',
  'We avoid the core tension and work around it',
  'Energy spikes during crisis, drops during steady work',
  'One of us carries the emotional weight',
  'We agree in vision but diverge on execution',
  'There is an unspoken role assignment neither fully chose',
  'Our strengths overlap — we duplicate rather than complement',
  'One of us has more skin in the game',
];

interface Props {
  onSubmit: (intake: PartnershipAuditIntake) => void;
  isLoading: boolean;
}

export function PartnershipAuditForm({ onSubmit, isLoading }: Props) {
  // Person A
  const [personAName, setPersonAName] = useState('');
  const [personARole, setPersonARole] = useState('');
  const [personAStrength, setPersonAStrength] = useState('');
  const [personAEdge, setPersonAEdge] = useState('');

  // Person B
  const [personBName, setPersonBName] = useState('');
  const [personBRole, setPersonBRole] = useState('');
  const [personBStrength, setPersonBStrength] = useState('');
  const [personBEdge, setPersonBEdge] = useState('');

  // Partnership dynamics
  const [sharedPurpose, setSharedPurpose] = useState('');
  const [primaryTension, setPrimaryTension] = useState('');
  const [whatWorksWell, setWhatWorksWell] = useState('');
  const [whatDoesnt, setWhatDoesnt] = useState('');

  // Pattern signals (up to 3)
  const [patternSignals, setPatternSignals] = useState<PartnershipPatternSignal[]>([]);

  // Optional
  const [journalEntry, setJournalEntry] = useState('');

  const togglePatternSignal = (signal: PartnershipPatternSignal) => {
    setPatternSignals((prev) => {
      if (prev.includes(signal)) return prev.filter((s) => s !== signal);
      if (prev.length >= 3) return prev;
      return [...prev, signal];
    });
  };

  const canSubmit =
    personARole.trim() &&
    personBRole.trim() &&
    sharedPurpose.trim() &&
    primaryTension.trim() &&
    !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    const intake: PartnershipAuditIntake = {
      ...(personAName.trim() ? { personAName: personAName.trim() } : {}),
      personARole: personARole.trim(),
      personAStrength: personAStrength.trim(),
      personAEdge: personAEdge.trim(),
      ...(personBName.trim() ? { personBName: personBName.trim() } : {}),
      personBRole: personBRole.trim(),
      personBStrength: personBStrength.trim(),
      personBEdge: personBEdge.trim(),
      sharedPurpose: sharedPurpose.trim(),
      primaryTension: primaryTension.trim(),
      whatWorksWell: whatWorksWell.trim(),
      whatDoesnt: whatDoesnt.trim(),
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

      {/* SECTION 1 — PERSON A */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 1 — Person A
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Name or identifier <span className="text-stone-500">(optional)</span>
            </label>
            <input
              type="text"
              value={personAName}
              onChange={(e) => setPersonAName(e.target.value)}
              placeholder="How Person A would like to be identified"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What do they bring — how do they show up in this partnership?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={personARole}
              onChange={(e) => setPersonARole(e.target.value)}
              rows={3}
              placeholder="Their primary function, orientation, or contribution in this partnership."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What are they strongest at?
            </label>
            <textarea
              value={personAStrength}
              onChange={(e) => setPersonAStrength(e.target.value)}
              rows={3}
              placeholder="What they do best — the capacity others rely on them for."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Where do they get stuck or contracted?
            </label>
            <textarea
              value={personAEdge}
              onChange={(e) => setPersonAEdge(e.target.value)}
              rows={3}
              placeholder="Where their energy closes, hesitates, or cycles."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* SECTION 2 — PERSON B */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 2 — Person B
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Name or identifier <span className="text-stone-500">(optional)</span>
            </label>
            <input
              type="text"
              value={personBName}
              onChange={(e) => setPersonBName(e.target.value)}
              placeholder="How Person B would like to be identified"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What do they bring — how do they show up in this partnership?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={personBRole}
              onChange={(e) => setPersonBRole(e.target.value)}
              rows={3}
              placeholder="Their primary function, orientation, or contribution in this partnership."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What are they strongest at?
            </label>
            <textarea
              value={personBStrength}
              onChange={(e) => setPersonBStrength(e.target.value)}
              rows={3}
              placeholder="What they do best — the capacity others rely on them for."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Where do they get stuck or contracted?
            </label>
            <textarea
              value={personBEdge}
              onChange={(e) => setPersonBEdge(e.target.value)}
              rows={3}
              placeholder="Where their energy closes, hesitates, or cycles."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 — PARTNERSHIP DYNAMICS */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 3 — Partnership Dynamics
        </h2>
        <div className="space-y-5">
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What are you building or doing together?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={sharedPurpose}
              onChange={(e) => setSharedPurpose(e.target.value)}
              rows={3}
              placeholder="The shared work, project, relationship, or endeavor."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What is the main friction point?{' '}
              <span className="text-amber-500">*</span>
            </label>
            <textarea
              value={primaryTension}
              onChange={(e) => setPrimaryTension(e.target.value)}
              rows={3}
              placeholder="The tension that keeps surfacing — even when it's been addressed."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              What is already in flow — what works well?
            </label>
            <textarea
              value={whatWorksWell}
              onChange={(e) => setWhatWorksWell(e.target.value)}
              rows={3}
              placeholder="Where the partnership generates genuine momentum or coherence."
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-sm text-stone-300 mb-2">
              Where does it break down?
            </label>
            <textarea
              value={whatDoesnt}
              onChange={(e) => setWhatDoesnt(e.target.value)}
              rows={3}
              placeholder="Where the structural configuration creates recurring depletion, confusion, or collapse."
              className={textareaClass}
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 — PATTERN SIGNALS */}
      <section>
        <h2 className="text-xs uppercase tracking-widest text-amber-500/70 mb-6">
          Section 4 — Pattern Signals
        </h2>
        <p className="text-sm text-stone-500 mb-4">
          Which feels most true about this partnership? Choose up to 3.
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
            Journal entry, context, or recent pattern{' '}
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
          {isLoading ? 'Generating partnership audit…' : 'Run Partnership Audit'}
        </button>
      </div>
    </form>
  );
}
