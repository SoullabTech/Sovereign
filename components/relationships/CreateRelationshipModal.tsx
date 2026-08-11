'use client';

import { useEffect, useState } from 'react';

type Realm = 'outer' | 'inner' | 'transpersonal';

const BOND_TYPES: Record<Realm, string[]> = {
  outer: ['partner', 'parent', 'child', 'sibling', 'friend', 'mentor', 'colleague', 'community'],
  inner: ['archetype', 'inner_part', 'shadow', 'protector', 'exile', 'inner_child', 'wise_one'],
  transpersonal: ['sacred', 'vocation', 'nature', 'ancestors', 'the_unknown'],
};

const REALM_LABELS: Record<Realm, { title: string; subtitle: string; notePrompt: string }> = {
  outer: {
    title: 'A person in my life',
    subtitle: 'Someone in your life',
    notePrompt: "What's here with them right now?",
  },
  inner: {
    title: 'An inner figure',
    subtitle: 'An archetype, part, or voice within',
    notePrompt: 'What does this part of you carry?',
  },
  transpersonal: {
    title: 'Something larger',
    subtitle: 'The sacred, vocation, nature, ancestors',
    notePrompt: 'What draws you into this relationship?',
  },
};

interface CreateRelationshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (relationship: { id: string; name: string; realm: Realm }) => void;
  initialRealm?: Realm;
}

export default function CreateRelationshipModal({
  isOpen,
  onClose,
  onCreated,
  initialRealm,
}: CreateRelationshipModalProps) {
  const [step, setStep] = useState<'realm' | 'details'>(initialRealm ? 'details' : 'realm');
  const [realm, setRealm] = useState<Realm>(initialRealm || 'outer');
  const [name, setName] = useState('');
  const [bondType, setBondType] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // The doorway the member chose must survive opening the modal.
  //
  // BUG (found 2026-08-10, fixed here): `useState(initialRealm ? 'details' : 'realm')`
  // only evaluates on FIRST mount — and this modal first mounts with `isOpen=false`
  // and `initialRealm=undefined`. So `step` was pinned to 'realm' forever, and the
  // empty state's three distinct doorways ("Add a person", "Meet an inner figure",
  // "Start with what is on your mind") all dumped the member into the same generic
  // realm picker. The member's choice was collected and then silently discarded —
  // which is precisely the loss of flow this surface was reported for.
  useEffect(() => {
    if (!isOpen) return;
    setStep(initialRealm ? 'details' : 'realm');
    setRealm(initialRealm || 'outer');
    setName('');
    setBondType('');
    setNote('');
    setError('');
  }, [isOpen, initialRealm]);

  if (!isOpen) return null;

  const handleSelectRealm = (r: Realm) => {
    setRealm(r);
    setStep('details');
    setBondType('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('A name is needed.');
      return;
    }
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          realm,
          bondType: bondType || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Could not create relationship.');
        return;
      }
      onCreated(data.relationship);
      // Reset
      setName('');
      setBondType('');
      setNote('');
      setStep('realm');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(initialRealm ? 'details' : 'realm');
    setName('');
    setBondType('');
    setNote('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative bg-[#0a0e17] border border-stone-700/20 rounded-xl max-w-md w-full mx-4 p-6 shadow-2xl">
        {step === 'realm' && (
          <>
            <h3 className="text-lg font-light text-stone-200 mb-1">Begin a relationship</h3>
            <p className="text-xs text-stone-400 mb-6">What kind of field are you entering?</p>
            <div className="space-y-3">
              {(Object.keys(REALM_LABELS) as Realm[]).map((r) => (
                <button
                  key={r}
                  onClick={() => handleSelectRealm(r)}
                  className="w-full text-left px-4 py-3 rounded-lg border border-stone-700/20 bg-stone-900/10 hover:bg-stone-900/25 hover:border-stone-700/35 transition-all"
                >
                  <div className="text-stone-200 font-light">{REALM_LABELS[r].title}</div>
                  <div className="text-xs text-stone-400">{REALM_LABELS[r].subtitle}</div>
                </button>
              ))}
            </div>
            <button onClick={handleClose} className="mt-4 text-xs text-stone-400 hover:text-stone-400 transition-colors">
              Cancel
            </button>
          </>
        )}

        {step === 'details' && (
          <>
            <h3 className="text-lg font-light text-stone-200 mb-1">
              {REALM_LABELS[realm].title}
            </h3>
            <p className="text-xs text-stone-400 mb-5">{REALM_LABELS[realm].subtitle}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-stone-500 font-light mb-2">Their name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={realm === 'inner' ? 'e.g. The Inner Critic' : realm === 'transpersonal' ? 'e.g. My Calling' : 'e.g. Sarah'}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/20 text-stone-200 placeholder:text-stone-400/40 focus:outline-none focus:border-stone-700/50 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-stone-500 font-light mb-2">Who are they to you <span className="text-stone-400">(optional)</span></label>
                <div className="flex flex-wrap gap-1.5">
                  {BOND_TYPES[realm].map((bt) => (
                    <button
                      key={bt}
                      onClick={() => setBondType(bondType === bt ? '' : bt)}
                      className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                        bondType === bt
                          ? 'bg-stone-900/40 text-stone-200 border border-stone-700/40'
                          : 'bg-stone-900/40 text-stone-400 border border-stone-800/30 hover:border-stone-700/30'
                      }`}
                    >
                      {bt.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-500 font-light mb-2">
                  {REALM_LABELS[realm].notePrompt} <span className="text-stone-400">(optional)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-700/20 text-stone-200 placeholder:text-stone-400/40 focus:outline-none focus:border-stone-700/50 text-sm resize-none"
                />
              </div>

              {error && <p className="text-xs text-red-400">{error}</p>}

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !name.trim()}
                  className="px-5 py-2 rounded-lg bg-stone-900/40 border border-stone-700/30 text-stone-200 text-sm font-light hover:bg-stone-900/60 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating...' : 'Begin'}
                </button>
                {!initialRealm && (
                  <button onClick={() => setStep('realm')} className="text-xs text-stone-400 hover:text-stone-400 transition-colors">
                    Back
                  </button>
                )}
                <button onClick={handleClose} className="text-xs text-stone-400 hover:text-stone-400 transition-colors ml-auto">
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
