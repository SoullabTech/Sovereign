'use client'

import { useState } from 'react'
import { D3HybridPhysicsPrototype } from './D3HybridPhysicsPrototype'
import { FcoseCompoundPhysicsPrototype } from './FcoseCompoundPhysicsPrototype'

type Candidate = 'a' | 'b'

const QUESTIONS = [
  'Does the field breathe?',
  'Do related things pull meaningfully toward one another?',
  'Does hover reveal intelligence immediately?',
  'Can a node be moved and have its local neighborhood respond naturally?',
  'Does the world remain recognizable after movement?',
  'Does containment survive without feeling rigid?',
]

export function PhysicsComparisonLab() {
  const [candidate, setCandidate] = useState<Candidate>('a')

  return (
    <main className="min-h-screen bg-[#090909] px-3 py-8 text-stone-100 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6">
          <p className="text-xs uppercase tracking-[0.24em] text-stone-600">Founder witness · R1R5</p>
          <h1 className="mt-3 text-3xl font-light text-stone-100 sm:text-4xl">Which field feels alive?</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-stone-400">
            Both prototypes use the same five containing regions, twenty nodes, and twenty explicit relations.
            The variable is the physics.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setCandidate('a')}
              className={candidate === 'a'
                ? 'rounded-full border border-amber-700/60 bg-amber-950/20 px-5 py-2.5 text-base text-amber-300'
                : 'rounded-full border border-stone-800 px-5 py-2.5 text-base text-stone-400 hover:border-stone-700 hover:text-stone-200'}
            >
              A · Nested Force
            </button>
            <button
              type="button"
              onClick={() => setCandidate('b')}
              className={candidate === 'b'
                ? 'rounded-full border border-amber-700/60 bg-amber-950/20 px-5 py-2.5 text-base text-amber-300'
                : 'rounded-full border border-stone-800 px-5 py-2.5 text-base text-stone-400 hover:border-stone-700 hover:text-stone-200'}
            >
              B · Compound Force
            </button>
            <span className="text-sm text-stone-600">Hover · drag · release · hover a connection</span>
          </div>
        </header>

        {candidate === 'a' ? <D3HybridPhysicsPrototype /> : <FcoseCompoundPhysicsPrototype />}

        <section className="mt-6 rounded-[24px] border border-stone-800/80 bg-stone-950/35 px-5 py-5 sm:px-6">
          <p className="text-xs uppercase tracking-[0.2em] text-stone-600">Judge by feel</p>
          <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {QUESTIONS.map((question) => (
              <p key={question} className="text-sm leading-6 text-stone-400">• {question}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
