'use client'

import { useState } from 'react'

type Mode = 'boundary' | 'provenance' | 'memory'

const ACTION = 'Send the current draft to one trusted reader without revising first.'
const EXPECTED = 'I expect they will find blocking problems I should have fixed.'
const OBSERVED = 'The reader said the draft was clear and the remaining changes felt optional.'

export function ActionConsequenceMemoryWitnessClient() {
  const [mode, setMode] = useState<Mode>('boundary')
  const [actionChosen, setActionChosen] = useState(false)
  const [keepLearning, setKeepLearning] = useState(false)
  const [memberLearning, setMemberLearning] = useState(
    'Sharing before I feel completely safe may give me better information than another private revision.',
  )

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03R4–R6
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Action without coercion. Learning without a dossier.
          </h1>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        {[
          ['boundary', 'Action boundary'],
          ['provenance', 'Consequence provenance'],
          ['memory', 'What should remain?'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key as Mode)}
            className={[
              'rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]',
              mode === key
                ? 'border-[#b46f48]/35 bg-white/45 text-[#6f492f]'
                : 'border-[#8c745d]/15 bg-white/20 text-[#9b8875]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="min-h-[620px] rounded-[32px] border border-[#74583f]/10 bg-white/25 p-6 md:p-8">
          {mode === 'boundary' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Before action
              </p>
              <h2 className="mt-3 font-serif text-3xl">Should this become an experiment at all?</h2>
              <p className="mt-6 font-serif text-2xl leading-[1.5]">{ACTION}</p>

              <div className="mt-8 grid gap-3 md:grid-cols-2">
                {[
                  ['Member-authored', 'You choose the act; MAIA does not own it.'],
                  ['Proportionate', 'Small action for a bounded uncertainty.'],
                  ['Reversible', 'The act can be stopped or not repeated.'],
                  ['Low blast radius', 'One trusted reader, not a public launch.'],
                  ['Consent-respecting', 'No covert manipulation or deception.'],
                  ['Observable enough', 'The response can bear on the readiness question.'],
                  ['Bounded', 'One draft, one reader, one return.'],
                  ['Non-coercive', 'Wait, rest, or do nothing remain lawful.'],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-[18px] border border-[#74583f]/10 bg-white/30 p-4">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[#5e5146]">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-5 text-sm">
                <button
                  type="button"
                  onClick={() => setActionChosen(true)}
                  className="text-[#795230] underline underline-offset-4"
                >
                  I choose this bounded experiment
                </button>
                <button
                  type="button"
                  onClick={() => setActionChosen(false)}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Not now
                </button>
              </div>

              <p className="mt-6 text-sm leading-7 text-[#6b5b4e]">
                Current standing: <strong>{actionChosen ? 'member-chosen action' : 'no action selected'}</strong>
              </p>
            </>
          )}

          {mode === 'provenance' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Consequence provenance
              </p>
              <h2 className="mt-3 font-serif text-3xl">What happened, and how do we know?</h2>

              <div className="mt-8 space-y-6">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Intended action</p>
                  <p className="mt-2 font-serif text-xl">{ACTION}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Reported actual action</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5146]">
                    I sent that draft to the one reader I had chosen.
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Expected</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5146]">{EXPECTED}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Member-reported consequence</p>
                  <p className="mt-2 font-serif text-2xl leading-8">{OBSERVED}</p>
                </div>
                <div className="border-l-2 border-[#27877a]/30 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Standing</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5146]">
                    MEMBER_REPORT · new evidence. The system does not independently know the reader's motive, mood, or full meaning.
                  </p>
                </div>
                <div className="border-l-2 border-[#c69b5d]/45 pl-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Causality boundary</p>
                  <p className="mt-2 text-sm leading-7 text-[#5e5146]">
                    The feedback followed the action. That timing alone does not prove the action caused every part of the response.
                  </p>
                </div>
              </div>
            </>
          )}

          {mode === 'memory' && (
            <>
              <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                Enactive memory
              </p>
              <h2 className="mt-3 font-serif text-3xl">What, if anything, should remain?</h2>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-[20px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Already durable elsewhere</p>
                  <p className="mt-2 text-sm leading-6">Any actual Writer source version or sent message remains in its own governed source. Soul-Service does not duplicate it.</p>
                </div>
                <div className="rounded-[20px] border border-[#74583f]/10 bg-white/30 p-4">
                  <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Do not keep by default</p>
                  <p className="mt-2 text-sm leading-6">MAIA aperture, confidence, compliance, inferred trait, action score, success rate.</p>
                </div>
              </div>

              <label className="mt-8 block">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#927b68]">
                  My learning · only if I choose to keep it
                </span>
                <textarea
                  value={memberLearning}
                  onChange={(event) => setMemberLearning(event.target.value)}
                  className="mt-2 min-h-32 w-full rounded-[20px] border border-[#74583f]/12 bg-white/45 p-4 font-serif text-lg leading-7 outline-none"
                />
              </label>

              <div className="mt-6 flex flex-wrap gap-5 text-sm">
                <button
                  type="button"
                  onClick={() => setKeepLearning(true)}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Keep this learning
                </button>
                <button
                  type="button"
                  onClick={() => setKeepLearning(false)}
                  className="text-[#795230] underline underline-offset-4"
                >
                  Leave this loop here
                </button>
              </div>

              <div className="mt-8 border-l-2 border-[#27877a]/30 pl-4">
                <p className="text-[9px] uppercase tracking-[0.12em] text-[#927b68]">Current durability</p>
                <p className="mt-2 font-serif text-xl">
                  {keepLearning ? 'Member explicitly chose to keep this formulation.' : 'No new autobiographical memory authorized.'}
                </p>
                {keepLearning && (
                  <p className="mt-3 text-sm leading-7 text-[#5e5146]">
                    What is kept is the member-authored formulation—not a behavioral trait or system score.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Anti-extraction rules</h2>
          <ul className="mt-6 space-y-4 text-xs leading-6 text-[#5e5146]">
            <li>Action is never required just to produce data.</li>
            <li>Another person is not an unwitting experimental subject.</li>
            <li>After does not automatically mean because of.</li>
            <li>Member report is not silently upgraded to verified fact.</li>
            <li>One outcome does not become a trait.</li>
            <li>Experiment completion does not become a compliance score.</li>
            <li>Failed or inconclusive action does not become stigma.</li>
            <li>Only explicit member-kept learning gains new durability here.</li>
          </ul>
          <p className="mt-8 border-t border-[#74583f]/12 pt-5 font-serif text-lg leading-7">
            The system can learn with the member without turning the member into the object being optimized.
          </p>
        </aside>
      </div>
    </section>
  )
}
