'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

type Realm = 'outer' | 'inner' | 'transpersonal';
type ArrivalStep = 'realm' | 'name' | 'bond' | 'occasion';

const BOND_TYPES: Record<Realm, string[]> = {
  outer: ['partner', 'parent', 'child', 'sibling', 'friend', 'mentor', 'colleague', 'community'],
  inner: ['archetype', 'inner_part', 'shadow', 'protector', 'exile', 'inner_child', 'wise_one'],
  transpersonal: ['sacred', 'vocation', 'nature', 'ancestors', 'the_unknown'],
};

const REALM_LABELS: Record<Realm, { title: string; subtitle: string; namePrompt: string }> = {
  outer: {
    title: 'A person in my life',
    subtitle: 'Someone whose presence, absence, closeness, distance, or change matters.',
    namePrompt: 'Who is present?',
  },
  inner: {
    title: 'An inner figure',
    subtitle: 'A part, archetype, or inner presence you find yourself in relationship with.',
    namePrompt: 'Who or what is present within?',
  },
  transpersonal: {
    title: 'Something larger',
    subtitle: 'Vocation, nature, ancestors, the sacred, or what exceeds the personal.',
    namePrompt: 'What is calling your attention?',
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
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState<ArrivalStep>(initialRealm ? 'name' : 'realm');
  const [realm, setRealm] = useState<Realm>(initialRealm || 'outer');
  const [name, setName] = useState('');
  const [bondType, setBondType] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep(initialRealm ? 'name' : 'realm');
    setRealm(initialRealm || 'outer');
    setName('');
    setBondType('');
    setNote('');
    setError('');
  }, [isOpen, initialRealm]);

  const flow = useMemo<ArrivalStep[]>(
    () => (initialRealm ? ['name', 'bond', 'occasion'] : ['realm', 'name', 'bond', 'occasion']),
    [initialRealm]
  );

  if (!isOpen) return null;

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  const resetAndClose = () => {
    setStep(initialRealm ? 'name' : 'realm');
    setName('');
    setBondType('');
    setNote('');
    setError('');
    onClose();
  };

  const goBack = () => {
    const index = flow.indexOf(step);
    if (index <= 0) return;
    setError('');
    setStep(flow[index - 1]);
  };

  const chooseRealm = (nextRealm: Realm) => {
    setRealm(nextRealm);
    setBondType('');
    setError('');
    setStep('name');
  };

  const continueFromName = () => {
    if (!name.trim()) {
      setError('Give this relationship a name before continuing.');
      return;
    }
    setError('');
    setStep('bond');
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          realm,
          bondType: bondType || undefined,
          note: note.trim() || undefined,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        setError(data.error || 'Could not bring this relationship into view.');
        return;
      }
      onCreated(data.relationship);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const stepPosition = Math.max(0, flow.indexOf(step));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4 py-6" data-relational-arrival data-relational-warm-arrival>
      <motion.button
        type="button"
        aria-label="Close relational arrival"
        className="absolute inset-0 bg-[#3b382f]/30 backdrop-blur-md"
        onClick={resetAndClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute h-[34rem] w-[34rem] rounded-full bg-[#d6e0cc]/55 blur-[110px]"
        initial={false}
        animate={{
          x: step === 'occasion' ? 90 : step === 'bond' ? 30 : -50,
          y: step === 'realm' ? -80 : 20,
          scale: step === 'occasion' ? 1.08 : 0.94,
        }}
        transition={transition}
      />

      <motion.div
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-[#bbb2a3]/65 bg-[#fffaf3]/98 shadow-[0_28px_90px_rgba(69,59,45,0.18)]"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={transition}
      >
        <div className="flex items-center justify-between px-6 pt-6 md:px-9 md:pt-8">
          <div className="flex items-center gap-3">
            {stepPosition > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#9aaa8a]/15 text-[#716d64]/65 transition-colors hover:border-[#9aaa8a]/30 hover:text-[#3f5544]"
                aria-label="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#716d64]/45">
              Bringing a relationship into view
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#716d64]/50 transition-colors hover:bg-[#e4eadf]/15 hover:text-[#3f5544]"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 pb-8 pt-8 md:px-9 md:pb-10 md:pt-10">
          <AnimatePresence mode="wait" initial={false}>
            {step === 'realm' && (
              <motion.div
                key="realm"
                data-arrival-step="realm"
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={transition}
              >
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#716d64]/45">Begin anywhere</p>
                <h2 className="max-w-xl text-3xl font-extralight leading-tight text-[#3f5544] md:text-4xl">
                  Who or what is here?
                </h2>
                <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-[#716d64]/65">
                  You do not need to explain the relationship yet. Just bring the right presence forward.
                </p>

                <div className="mt-9 space-y-3">
                  {(Object.keys(REALM_LABELS) as Realm[]).map((item) => (
                    <motion.button
                      key={item}
                      type="button"
                      onClick={() => chooseRealm(item)}
                      whileHover={reduceMotion ? undefined : { x: 5 }}
                      className="group w-full rounded-[1.3rem] border border-[#c7bfb1]/60 bg-[#fbf6ee]/90 px-5 py-5 text-left shadow-[0_8px_24px_rgba(76,66,51,0.04)] transition-all hover:translate-x-1 hover:border-[#9eae91]/65 hover:bg-[#fffdf8]"
                    >
                      <div className="text-base font-light text-[#3f5544]">{REALM_LABELS[item].title}</div>
                      <div className="mt-1 text-sm font-light leading-relaxed text-[#716d64]/58">
                        {REALM_LABELS[item].subtitle}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'name' && (
              <motion.div
                key="name"
                data-arrival-step="name"
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={transition}
              >
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#716d64]/45">
                  {REALM_LABELS[realm].title}
                </p>
                <h2 className="text-3xl font-extralight leading-tight text-[#3f5544] md:text-4xl">
                  {REALM_LABELS[realm].namePrompt}
                </h2>

                <div className="mt-10">
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') continueFromName();
                    }}
                    placeholder={
                      realm === 'inner'
                        ? 'The Inner Critic'
                        : realm === 'transpersonal'
                          ? 'My calling'
                          : 'A name'
                    }
                    className="w-full border-b border-[#9aaa8a]/25 bg-transparent pb-4 text-3xl font-extralight tracking-wide text-[#3f5544] outline-none placeholder:text-[#716d64]/22 focus:border-[#9aaa8a]/60 md:text-4xl"
                    autoFocus
                  />
                  {error && <p className="mt-3 text-xs text-red-300/80">{error}</p>}
                </div>

                <div className="mt-10 flex justify-end">
                  <button
                    type="button"
                    onClick={continueFromName}
                    disabled={!name.trim()}
                    className="rounded-full border border-[#99aa8c]/55 bg-[#e9efe3] px-5 py-2.5 text-sm font-light text-[#405642] transition-colors hover:bg-[#dfe8d8] disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'bond' && (
              <motion.div
                key="bond"
                data-arrival-step="bond"
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={transition}
              >
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#716d64]/45">{name}</p>
                <h2 className="text-3xl font-extralight leading-tight text-[#3f5544] md:text-4xl">
                  {realm === 'outer' ? `How do you know ${name}?` : `How do you relate to ${name}?`}
                </h2>
                <p className="mt-3 text-sm font-light text-[#716d64]/60">
                  This is orientation, not a definition. You can leave it unnamed.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {BOND_TYPES[realm].map((type) => {
                    const active = bondType === type;
                    return (
                      <motion.button
                        key={type}
                        type="button"
                        onClick={() => setBondType(active ? '' : type)}
                        whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                        className={`rounded-full border px-4 py-2 text-sm font-light transition-colors ${
                          active
                            ? 'border-[#9aaa8a]/45 bg-[#e4eadf]/35 text-[#3f5544]'
                            : 'border-[#9aaa8a]/12 text-[#716d64]/65 hover:border-[#9aaa8a]/30 hover:text-[#3f5544]'
                        }`}
                      >
                        {type.replace(/_/g, ' ')}
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-10 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setBondType('');
                      setStep('occasion');
                    }}
                    className="text-sm font-light text-[#716d64]/50 transition-colors hover:text-[#5e745d]"
                  >
                    Leave unnamed
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('occasion')}
                    className="rounded-full border border-[#99aa8c]/55 bg-[#e9efe3] px-5 py-2.5 text-sm font-light text-[#405642] transition-colors hover:bg-[#dfe8d8]"
                  >
                    Continue →
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'occasion' && (
              <motion.div
                key="occasion"
                data-arrival-step="occasion"
                initial={reduceMotion ? false : { opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, x: -18 }}
                transition={transition}
              >
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#716d64]/45">
                  {bondType ? `${name} · ${bondType.replace(/_/g, ' ')}` : name}
                </p>
                <h2 className="max-w-xl text-3xl font-extralight leading-tight text-[#3f5544] md:text-4xl">
                  What brings {name} to mind now?
                </h2>
                <p className="mt-3 max-w-lg text-sm font-light leading-relaxed text-[#716d64]/60">
                  A moment, a feeling, a question, a change—or nothing you can name yet.
                </p>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  placeholder="Begin with whatever is actually here..."
                  className="mt-8 w-full resize-none border-0 border-b border-[#9aaa8a]/20 bg-transparent px-0 py-4 text-lg font-light leading-relaxed text-[#3f5544] outline-none placeholder:text-[#716d64]/25 focus:border-[#9aaa8a]/50"
                  autoFocus
                />

                {error && <p className="mt-3 text-xs text-red-300/80">{error}</p>}

                <div className="mt-10 flex justify-end">
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    className="rounded-full border border-[#8fa282]/60 bg-[#e4ecdd] px-6 py-3 text-sm font-light text-[#3c523e] shadow-[0_8px_24px_rgba(76,66,51,0.05)] transition-colors hover:bg-[#dbe6d3] disabled:cursor-wait disabled:opacity-45"
                  >
                    {submitting ? 'Bringing this relationship into view…' : 'Enter this relationship →'}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-1.5" aria-hidden="true">
            {flow.map((item, index) => (
              <motion.span
                key={item}
                className={`h-1 rounded-full ${
                  index <= stepPosition ? 'bg-[#cdd8c4]/50' : 'bg-[#cdd8c4]/10'
                }`}
                animate={{ width: index === stepPosition ? 28 : 8 }}
                transition={transition}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
