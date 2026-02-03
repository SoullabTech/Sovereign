'use client';

/**
 * Holding Circle Component
 *
 * Small groups for mutual support and witnessing.
 * Self-organizing, not algorithmically matched.
 *
 * See /docs/HELPER_TOOLS_SPECIFICATION.md for context.
 */

import { useState } from 'react';

interface CircleMember {
  id: string;
  name: string;
  role: 'member' | 'anchor';
  joinedAt: Date;
  avatar?: string;
}

interface Gathering {
  id: string;
  date: Date;
  type: 'sync' | 'async';
  topic?: string;
  presences: string[];
}

interface HoldingCircleData {
  id: string;
  name: string;
  intention: string;
  members: CircleMember[];
  container: {
    startDate: Date;
    endDate?: Date;
    rhythm: 'weekly' | 'biweekly' | 'monthly' | 'as-needed';
    agreements: string[];
  };
  gatherings: Gathering[];
}

interface HoldingCircleProps {
  circle: HoldingCircleData;
  currentMemberId: string;
  onJoin?: () => void;
  onLeave?: () => void;
  onScheduleGathering?: () => void;
}

// Geometric circle symbol
function CircleSymbol({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="20" cy="20" r="14" />
      <circle cx="20" cy="20" r="6" />
    </svg>
  );
}

export default function HoldingCircle({
  circle,
  currentMemberId,
  onJoin,
  onLeave,
  onScheduleGathering,
}: HoldingCircleProps) {
  const [showAgreements, setShowAgreements] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const isMember = circle.members.some(m => m.id === currentMemberId);
  const isAnchor = circle.members.find(m => m.id === currentMemberId)?.role === 'anchor';
  const memberCount = circle.members.length;
  const upcomingGatherings = circle.gatherings.filter(g => new Date(g.date) > new Date());
  const nextGathering = upcomingGatherings[0];

  const rhythmLabels: Record<string, string> = {
    weekly: 'Weekly',
    biweekly: 'Every two weeks',
    monthly: 'Monthly',
    'as-needed': 'As needed',
  };

  return (
    <div className="bg-white/40 border border-stone-200/60 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-stone-200/60">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6b5a98]/10 flex items-center justify-center">
            <CircleSymbol className="w-6 h-6 text-[#6b5a98]" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium tracking-wide text-stone-800">
              {circle.name}
            </h3>
            <p className="text-[14px] tracking-wide text-stone-500 mt-1">
              {circle.intention}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex items-center gap-6 mt-4 pt-4 border-t border-stone-200/40">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
              Members
            </span>
            <span className="text-[14px] tracking-wide text-stone-600">
              {memberCount}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
              Rhythm
            </span>
            <span className="text-[14px] tracking-wide text-stone-600">
              {rhythmLabels[circle.container.rhythm]}
            </span>
          </div>
          {circle.container.endDate && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-[0.2em] text-stone-400">
                Until
              </span>
              <span className="text-[14px] tracking-wide text-stone-600">
                {new Date(circle.container.endDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Next Gathering */}
      {nextGathering && isMember && (
        <div className="px-6 py-4 bg-[#5a7a6f]/5 border-b border-stone-200/60">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#5a7a6f]">
                Next Gathering
              </span>
              <p className="text-[14px] tracking-wide text-stone-700 mt-1">
                {new Date(nextGathering.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
                {nextGathering.topic && (
                  <span className="text-stone-500"> — {nextGathering.topic}</span>
                )}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-md text-[11px] tracking-wider uppercase ${
              nextGathering.type === 'sync'
                ? 'bg-[#6b5a98]/10 text-[#6b5a98]'
                : 'bg-stone-200/60 text-stone-500'
            }`}>
              {nextGathering.type === 'sync' ? 'Live' : 'Async'}
            </span>
          </div>
        </div>
      )}

      {/* Agreements (expandable) */}
      <div className="border-b border-stone-200/60">
        <button
          onClick={() => setShowAgreements(!showAgreements)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/40 transition-colors"
        >
          <span className="text-[13px] tracking-wide text-stone-600">
            Circle Agreements
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 text-stone-400 transition-transform ${showAgreements ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {showAgreements && (
          <div className="px-6 pb-4">
            <ul className="space-y-2">
              {circle.container.agreements.map((agreement, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#5a7a6f] mt-1">
                    <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="4" />
                    </svg>
                  </span>
                  <span className="text-[13px] tracking-wide text-stone-600 leading-relaxed">
                    {agreement}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Members (expandable) */}
      <div className="border-b border-stone-200/60">
        <button
          onClick={() => setShowMembers(!showMembers)}
          className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/40 transition-colors"
        >
          <span className="text-[13px] tracking-wide text-stone-600">
            Circle Members
          </span>
          <svg
            viewBox="0 0 24 24"
            className={`w-4 h-4 text-stone-400 transition-transform ${showMembers ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        {showMembers && (
          <div className="px-6 pb-4">
            <div className="space-y-3">
              {circle.members.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-200/60 flex items-center justify-center">
                    {member.avatar ? (
                      <img src={member.avatar} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <span className="text-[11px] font-medium text-stone-500">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-[14px] tracking-wide text-stone-700">
                    {member.name}
                  </span>
                  {member.role === 'anchor' && (
                    <span className="text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#8a7a5a]/10 text-[#8a7a5a]">
                      anchor
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6">
        {!isMember ? (
          <div className="space-y-4">
            <p className="text-[13px] tracking-wide text-stone-500 leading-relaxed">
              Joining a circle means showing up for yourself and others.
              Review the agreements above before requesting to join.
            </p>
            <button
              onClick={onJoin}
              className="w-full px-5 py-2.5 bg-[#6b5a98] hover:bg-[#5b4a88] text-white rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Request to Join
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {isAnchor && (
              <button
                onClick={onScheduleGathering}
                className="flex-1 px-5 py-2.5 bg-[#5a7a6f] hover:bg-[#4a6a5f] text-white rounded-xl text-[13px] tracking-wide transition-colors"
              >
                Schedule Gathering
              </button>
            )}
            <button
              onClick={onLeave}
              className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
            >
              Leave Circle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Create Circle Form
interface CreateCircleFormProps {
  onSubmit: (data: Partial<HoldingCircleData>) => void;
  onCancel: () => void;
}

export function CreateCircleForm({ onSubmit, onCancel }: CreateCircleFormProps) {
  const [name, setName] = useState('');
  const [intention, setIntention] = useState('');
  const [rhythm, setRhythm] = useState<'weekly' | 'biweekly' | 'monthly' | 'as-needed'>('biweekly');
  const [duration, setDuration] = useState<'4-weeks' | '8-weeks' | '12-weeks' | 'ongoing'>('8-weeks');
  const [agreements, setAgreements] = useState<string[]>([
    'What is shared here stays here',
    'Listen without fixing',
    'Speak from your own experience',
    'Honor your own and others\' boundaries',
  ]);
  const [newAgreement, setNewAgreement] = useState('');

  const handleAddAgreement = () => {
    if (newAgreement.trim()) {
      setAgreements([...agreements, newAgreement.trim()]);
      setNewAgreement('');
    }
  };

  const handleRemoveAgreement = (index: number) => {
    setAgreements(agreements.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    const endDate = duration === 'ongoing' ? undefined : (() => {
      const weeks = parseInt(duration);
      const date = new Date();
      date.setDate(date.getDate() + weeks * 7);
      return date;
    })();

    onSubmit({
      name,
      intention,
      container: {
        startDate: new Date(),
        endDate,
        rhythm,
        agreements,
      },
    });
  };

  return (
    <div className="bg-white/60 border border-stone-200/60 rounded-2xl p-6">
      <h3 className="text-lg font-medium tracking-wide text-stone-800 mb-6">
        Create a Holding Circle
      </h3>

      <div className="space-y-6">
        {/* Name */}
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">
            Circle Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Thursday Evening Witness Circle"
            className="w-full px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40"
          />
        </div>

        {/* Intention */}
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">
            Intention
          </label>
          <textarea
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="What is this circle for? What brings you together?"
            className="w-full h-24 px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40 resize-none"
          />
        </div>

        {/* Rhythm & Duration */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">
              Rhythm
            </label>
            <select
              value={rhythm}
              onChange={(e) => setRhythm(e.target.value as typeof rhythm)}
              className="w-full px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Every two weeks</option>
              <option value="monthly">Monthly</option>
              <option value="as-needed">As needed</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value as typeof duration)}
              className="w-full px-4 py-3 bg-white/60 border border-stone-200/60 rounded-xl text-[14px] tracking-wide text-stone-700 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20 focus:border-[#6b5a98]/40"
            >
              <option value="4-weeks">4 weeks</option>
              <option value="8-weeks">8 weeks</option>
              <option value="12-weeks">12 weeks</option>
              <option value="ongoing">Ongoing</option>
            </select>
          </div>
        </div>

        {/* Agreements */}
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-stone-400 mb-2">
            Circle Agreements
          </label>
          <div className="space-y-2 mb-3">
            {agreements.map((agreement, i) => (
              <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/40 rounded-lg">
                <span className="flex-1 text-[13px] tracking-wide text-stone-600">
                  {agreement}
                </span>
                <button
                  onClick={() => handleRemoveAgreement(i)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newAgreement}
              onChange={(e) => setNewAgreement(e.target.value)}
              placeholder="Add an agreement..."
              className="flex-1 px-4 py-2 bg-white/60 border border-stone-200/60 rounded-lg text-[13px] tracking-wide text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#6b5a98]/20"
              onKeyDown={(e) => e.key === 'Enter' && handleAddAgreement()}
            />
            <button
              onClick={handleAddAgreement}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-[13px] tracking-wide text-stone-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-stone-200/60">
        <button
          onClick={handleSubmit}
          disabled={!name || !intention}
          className={`flex-1 px-5 py-2.5 rounded-xl text-[13px] tracking-wide transition-colors ${
            name && intention
              ? 'bg-[#6b5a98] hover:bg-[#5b4a88] text-white'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Create Circle
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2.5 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-xl text-[13px] tracking-wide transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
