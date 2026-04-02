'use client';

/**
 * Sacred Texts — Dynamic Overview
 *
 * Four traditions mapped to the toroidal field of consciousness:
 *   Ascending (Qur'an) — Descending (Zohar)
 *   Releasing (Tao) — Contracting (Gita)
 *
 * Calm, spacious, reverent. Not a dashboard.
 */

import React, { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { seedMaiaPrompt } from '@/lib/maia/seedPrompt';
import { SacredTextRegistry } from '@/lib/wisdom/sacredTexts/SacredTextRegistry';

// ═══════════════════════════════════════════════════════════════════════════════
// TRADITION DATA
// ═══════════════════════════════════════════════════════════════════════════════

const TRADITIONS = [
  {
    id: 'quran',
    name: 'Qur\'an',
    mode: 'Orientation',
    movement: 'Ascending',
    direction: 'Upward — relational, directive',
    description: 'Turns you toward something greater. Asks for direction on your behalf.',
    prompt: 'I want to sit with a passage from the Qur\'an. Meet me where I am and offer something for reflection.',
    position: 'top' as const,
  },
  {
    id: 'tao',
    name: 'Tao Te Ching',
    mode: 'Dissolution',
    movement: 'Releasing',
    direction: 'Outward — paradox, non-forcing',
    description: 'Loosens the frame. Dissolves the question rather than answering it.',
    prompt: 'I want to sit with a passage from the Tao Te Ching. Meet me where I am and offer something for reflection.',
    position: 'left' as const,
  },
  {
    id: 'gita',
    name: 'Bhagavad Gita',
    mode: 'Participation',
    movement: 'Contracting',
    direction: 'Inward — action under tension',
    description: 'Meets you inside the tension of having to act. Separates effort from outcome.',
    prompt: 'I want to sit with a passage from the Bhagavad Gita. Meet me where I am and offer something for reflection.',
    position: 'right' as const,
  },
  {
    id: 'zohar',
    name: 'Zohar',
    mode: 'Interpretive Depth',
    movement: 'Descending',
    direction: 'Beneath — hidden layers, symbolic seeing',
    description: 'Invites you to read beneath the surface. Reality as layered, meaning as concealed.',
    prompt: 'I want to sit with a passage from the Zohar. Meet me where I am and offer something for reflection.',
    position: 'bottom' as const,
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// POSITION STYLES
// ═══════════════════════════════════════════════════════════════════════════════

const POSITION_STYLES: Record<string, string> = {
  top: 'col-start-2 row-start-1',
  left: 'col-start-1 row-start-2',
  right: 'col-start-3 row-start-2',
  bottom: 'col-start-2 row-start-3',
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARISON PROMPTS
// ═══════════════════════════════════════════════════════════════════════════════

const COMPARISON_STATES = [
  { label: 'I feel stuck', state: 'stuck' },
  { label: 'I\'m afraid to move forward', state: 'afraid' },
  { label: 'Something isn\'t aligned', state: 'misaligned' },
  { label: 'I\'m holding on to something', state: 'holding' },
];

/** What each tradition says to each state — not passages, but felt-sense descriptions */
const MODE_RESPONSES: Record<string, Record<string, string>> = {
  stuck: {
    quran: 'Turns you upward. Asks for direction on your behalf, from something greater than the situation.',
    tao: 'Dissolves the frame. Suggests that "stuck" may be a story, and what you need is not force but release.',
    gita: 'Asks whose path you are on. The stuckness may be from walking a borrowed road.',
    zohar: 'Invites you beneath the surface. What appears as stuckness may be concealing something not yet ready to be seen.',
  },
  afraid: {
    quran: 'Names the fear and places it beside divine companionship. You are not alone in this.',
    tao: 'Suggests the fear may dissolve if you stop pushing against it. Softness outlasts rigidity.',
    gita: 'Separates the action from the outcome. You can move forward without needing to know what happens.',
    zohar: 'Points to hidden layers in the fear itself. What seems threatening may contain concealed meaning.',
  },
  misaligned: {
    quran: 'Offers a prayer of orientation. Not a correction, but a request for the straight path.',
    tao: 'Questions whether alignment is something to achieve or something that emerges when you stop forcing.',
    gita: 'Asks what is genuinely yours versus inherited. Alignment begins with honest dharma.',
    zohar: 'Suggests the misalignment may be visible only from the surface. Look deeper.',
  },
  holding: {
    quran: 'Places hardship and ease side by side. What you are holding may already contain its own release.',
    tao: 'Shows you water — yielding, nourishing, and without ambition. Not-holding as nature.',
    gita: 'Reframes the grip. Act, but release the outcome. The holding is in the attachment to result.',
    zohar: 'Asks what the thing you are holding might be concealing. Sparks of holiness are hidden in all things.',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPARISON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ComparisonExperience({
  onEnter,
  traditions,
}: {
  onEnter: (t: typeof TRADITIONS[0]) => void;
  traditions: typeof TRADITIONS;
}) {
  const [selectedState, setSelectedState] = React.useState<string | null>(null);

  return (
    <div>
      {/* State selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {COMPARISON_STATES.map(s => (
          <button
            key={s.state}
            type="button"
            onClick={() => setSelectedState(selectedState === s.state ? null : s.state)}
            className={`rounded-xl px-4 py-2 text-sm border transition ${
              selectedState === s.state
                ? 'border-amber-600/50 bg-amber-900/20 text-amber-200'
                : 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08]'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Mode responses */}
      {selectedState && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid gap-3 sm:grid-cols-2"
        >
          {traditions.map(t => {
            const response = MODE_RESPONSES[selectedState]?.[t.id];
            if (!response) return null;
            return (
              <div
                key={t.id}
                className="rounded-xl border border-amber-900/20 bg-stone-950/40 p-5"
              >
                <p className="text-xs uppercase tracking-wider text-amber-700/50 font-medium mb-1">
                  {t.movement}
                </p>
                <p className="text-sm font-medium text-amber-200/80 mb-2">
                  {t.name}
                </p>
                <p className="text-sm text-stone-400 leading-relaxed">
                  {response}
                </p>
              </div>
            );
          })}
        </motion.div>
      )}

      {!selectedState && (
        <p className="text-sm text-white/30 italic">
          Choose a state above to see how the four modes would meet it differently.
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function SacredTextsPage() {
  const router = useRouter();
  const passageCounts = TRADITIONS.map(t =>
    SacredTextRegistry.getByTradition(t.id as any).length
  );

  const enterWithMaia = useCallback((tradition: typeof TRADITIONS[0]) => {
    seedMaiaPrompt({
      prompt: tradition.prompt,
      source: 'sacred-texts',
      sourceLabel: `Sacred Text: ${tradition.name}`,
      returnTo: '/wisdom-keepers/sacred-texts',
      tone: 'contemplative',
    });
    router.push('/maia');
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#16213e] text-[#f6f1e8]">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* Nav */}
        <div className="mb-8">
          <Link
            href="/wisdom-keepers/wisdom"
            className="inline-flex items-center gap-2 text-sm text-[#D4B896] transition hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Wisdom Keepers
          </Link>
        </div>

        {/* ── Section A: The Field ── */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1 className="text-4xl font-semibold tracking-tight mb-3 sm:text-5xl">
              Sacred Texts
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/70 mb-4">
              Four ways wisdom meets you — not as content, but as encounter.
            </p>

            {/* How to use */}
            <div className="max-w-2xl rounded-xl border border-white/10 bg-white/[0.03] p-5 mb-12">
              <p className="text-sm font-medium text-[#D4B896] mb-2">How to use this page</p>
              <ul className="space-y-1.5 text-sm text-white/50 leading-relaxed">
                <li className="flex gap-2">
                  <span className="text-amber-700/50 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>The <strong className="text-white/60">field map</strong> below shows four cardinal movements of consciousness — ascending, releasing, contracting, descending.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-700/50 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>Scroll down to <strong className="text-white/60">Feel the Difference</strong> — choose a state and see how all four traditions respond differently to the same inner condition.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-700/50 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>Click <strong className="text-white/60">Enter with MAIA</strong> on any tradition to begin a conversation shaped by that mode of knowing.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-amber-700/50 mt-0.5 flex-shrink-0">&bull;</span>
                  <span>During conversation, passages may also surface on their own when the moment fits — you don&apos;t need to choose.</span>
                </li>
              </ul>
            </div>

            {/* Toroidal Field Map */}
            <div className="grid grid-cols-3 grid-rows-3 gap-4 max-w-3xl mx-auto mb-8">
              {TRADITIONS.map((t, i) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.08 }}
                  className={`${POSITION_STYLES[t.position]} rounded-2xl border border-amber-900/30 bg-stone-950/60 p-5 backdrop-blur`}
                >
                  <p className="text-xs uppercase tracking-wider text-amber-700/60 font-medium mb-1">
                    {t.movement}
                  </p>
                  <h3 className="text-lg font-semibold text-amber-200/90 mb-1">
                    {t.name}
                  </h3>
                  <p className="text-xs text-amber-600/50 mb-3">
                    {t.mode} &mdash; {t.direction}
                  </p>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    {t.description}
                  </p>
                </motion.div>
              ))}

              {/* Center — the stillpoint */}
              <div className="col-start-2 row-start-2 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border border-amber-800/20 bg-amber-900/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-700/30" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ── Section B: The Traditions ── */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Enter a Tradition</h2>
          <p className="text-sm text-white/50 mb-8">
            These texts come from living traditions. They are offered here as doors
            to reflection, not as replacements for study within their original lineages.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {TRADITIONS.map((t, i) => {
              const count = passageCounts[i];
              const disclaimer = SacredTextRegistry.getDisclaimer(t.id as any);

              return (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <BookOpen className="w-5 h-5 text-amber-600/60 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-amber-200/90">{t.name}</h3>
                      <p className="text-xs text-amber-600/50 mt-0.5">
                        {t.mode} &bull; {count} passage{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-stone-400 leading-relaxed mb-4">
                    {t.description}
                  </p>

                  {disclaimer && (
                    <p className="text-xs text-stone-600 leading-relaxed mb-4">
                      {disclaimer.short}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => enterWithMaia(t)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-[#D4B896]/20 text-[#D4B896] border border-[#D4B896]/30 hover:bg-[#D4B896]/30 transition"
                  >
                    <Compass className="h-3 w-3" />
                    Enter with MAIA
                  </button>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ── Section C: Compare the Modes ── */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-2">Feel the Difference</h2>
          <p className="text-sm text-white/50 mb-8">
            The same inner state, met by four different ways of knowing.
            Not to compare for correctness — to experience contrast.
          </p>

          <ComparisonExperience onEnter={enterWithMaia} traditions={TRADITIONS} />
        </section>

        {/* ── Section D: Encounter Guidance ── */}
        <section className="mb-16">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#D4B896] mb-4">
              How to receive
            </h2>
            <ul className="space-y-3 text-sm text-white/60 leading-relaxed">
              <li className="flex gap-3">
                <span className="text-amber-700/50 mt-1 flex-shrink-0">&bull;</span>
                Do not compare for correctness. Each mode is complete on its own.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-700/50 mt-1 flex-shrink-0">&bull;</span>
                Notice what changes in your perception, not what you think about it.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-700/50 mt-1 flex-shrink-0">&bull;</span>
                Let the passage work before interpreting it.
              </li>
              <li className="flex gap-3">
                <span className="text-amber-700/50 mt-1 flex-shrink-0">&bull;</span>
                If one does not land, try another movement. That itself is information.
              </li>
            </ul>
          </div>
        </section>

        {/* ── Section E: Your Encounters ── */}
        <section className="mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur">
            <h2 className="text-lg font-semibold text-[#D4B896] mb-3">
              Your Encounters
            </h2>
            <p className="text-sm text-white/50 leading-relaxed">
              As you meet with MAIA, sacred passages may surface in conversation.
              Your encounter history will appear here over time.
            </p>
            <p className="text-xs text-white/30 mt-3">
              Encounters are not chosen by you — they are offered when the
              moment fits. This is reception, not selection.
            </p>
          </div>
        </section>

        {/* ── Closing ── */}
        <section className="mb-8">
          <p className="text-center text-xs text-white/30 max-w-xl mx-auto leading-relaxed">
            This system does not choose the &ldquo;best&rdquo; tradition.
            It helps reveal different ways reality can be encountered.
          </p>
        </section>

      </div>
    </main>
  );
}
