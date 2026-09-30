'use client'

import { useMemo, useState } from 'react'
import {
  CAPACITY_AFFORDANCES,
  type CapacityId,
} from '@/lib/maia/life-loop/capacityReorganization'
import {
  GOVERNED_CAPACITY_CHORDS,
  composeCapacities,
  reshapeComposition,
  type CapacityChord,
  type CapacityCompositionState,
} from '@/lib/maia/life-loop/capacityComposition'

const INQUIRY =
  'A revised chapter is clearer at the passage level, but one reader still loses the argument across the whole chapter. Another reader says the revision now works. I am not sure whether the issue is local wording, larger structure, or insufficient evidence.'

const DIRECT_CHOICES: CapacityId[] = [
  'compare_versions',
  'seek_counterevidence',
  'change_scale',
  'hold_unresolved',
]

export function CapacityCompositionWitnessClient() {
  const [state, setState] = useState<CapacityCompositionState>('NO_COMPOSITION')
  const [activeSingle, setActiveSingle] = useState<CapacityId | null>(null)
  const [chord, setChord] = useState<CapacityChord | null>(null)
  const [maiaOpen, setMaiaOpen] = useState(false)
  const [memberLabel, setMemberLabel] = useState('Compare without rushing to conclude')

  const activeIds = useMemo(() => {
    if (chord) return chord.capacityIds
    return activeSingle ? [activeSingle] : []
  }, [activeSingle, chord])

  function reset() {
    setState('NO_COMPOSITION')
    setActiveSingle(null)
    setChord(null)
    setMaiaOpen(false)
    setMemberLabel('Compare without rushing to conclude')
  }

  function chooseSingle(id: CapacityId) {
    setActiveSingle(id)
    setChord(null)
    setState('SINGLE_CAPACITY')
    setMaiaOpen(false)
  }

  function composeDirect(first: CapacityId, second: CapacityId) {
    setChord(composeCapacities(first, second))
    setActiveSingle(null)
    setState('MEMBER_COMPOSED')
    setMaiaOpen(false)
  }

  function chooseGovernedChord(ids: [CapacityId, CapacityId]) {
    setChord(composeCapacities(ids[0], ids[1]))
    setActiveSingle(null)
    setState('MEMBER_COMPOSED')
    setMaiaOpen(false)
  }

  function releaseCapacity(index: 0 | 1) {
    if (!chord) return
    const remaining = chord.capacityIds[index === 0 ? 1 : 0]
    setChord(null)
    setActiveSingle(remaining)
    setState('SINGLE_CAPACITY')
  }

  function dissolveAll() {
    setChord(null)
    setActiveSingle(null)
    setState('NO_COMPOSITION')
    setMaiaOpen(false)
  }

  function reshape(index: 0 | 1, replacement: CapacityId) {
    if (!chord) return
    setChord(reshapeComposition(chord, replacement, index))
    setState('MEMBER_RESHAPED')
  }

  function applyMemberLabel() {
    if (!chord) return
    setChord({ ...chord, memberLabel: memberLabel.trim() || null })
  }

  return (
    <section className="rounded-[40px] border border-[#6d513b]/10 bg-[linear-gradient(145deg,#fffaf3,#f4e3cf_54%,#efe0d2)] px-6 py-8 text-[#352d27] shadow-[0_26px_80px_rgba(65,43,29,0.1)] md:px-10 md:py-10">
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-[#8d7866]">
            SOUL-SERVICE-03I · Capacity composition
          </p>
          <h1 className="mt-2 font-serif text-3xl md:text-4xl">
            Hold two ways of working together.
          </h1>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-[#795230] underline decoration-[#c3ad8b] underline-offset-4"
        >
          Reset witness
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-[30px] border border-[#74583f]/10 bg-white/30 p-6 md:p-8">
          <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
            Current inquiry
          </p>
          <p className="mt-4 max-w-3xl font-serif text-2xl leading-[1.55] text-[#4b4037]">
            {INQUIRY}
          </p>

          <div className="mt-8">
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
              Current support
            </p>

            {activeIds.length === 0 && (
              <div className="mt-3 border-l-2 border-[#27877a]/30 pl-4">
                <p className="font-serif text-xl">No support active.</p>
                <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
                  Nothing needs to be added merely because capacities are available.
                </p>
              </div>
            )}

            {activeSingle && (
              <div className="mt-4 rounded-[24px] border border-[#74583f]/12 bg-white/35 p-5">
                <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                  Single capacity · member selected
                </p>
                <h2 className="mt-2 font-serif text-2xl">
                  {CAPACITY_AFFORDANCES[activeSingle].label}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[#5d5044]">
                  {CAPACITY_AFFORDANCES[activeSingle].question}
                </p>
              </div>
            )}

            {chord && (
              <div className="mt-4 space-y-4" data-capacity-chord>
                {chord.memberLabel && (
                  <div className="border-l-2 border-[#c69b5d]/40 pl-4">
                    <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                      Your working name
                    </p>
                    <p className="mt-2 font-serif text-xl">{chord.memberLabel}</p>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {chord.capacities.map((capacity, index) => (
                    <div
                      key={capacity.id}
                      data-active-capacity={capacity.id}
                      className="rounded-[24px] border border-[#74583f]/12 bg-white/38 p-5"
                    >
                      <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                        Active capacity {index + 1}
                      </p>
                      <h2 className="mt-2 font-serif text-2xl">{capacity.label}</h2>
                      <p className="mt-3 text-sm leading-7 text-[#5d5044]">
                        {capacity.question}
                      </p>
                      <button
                        type="button"
                        onClick={() => releaseCapacity(index as 0 | 1)}
                        className="mt-4 text-sm text-[#795230] underline underline-offset-4"
                      >
                        Release only this capacity
                      </button>
                    </div>
                  ))}
                </div>

                <p className="font-serif text-lg leading-7 text-[#51463d]">
                  Both questions remain active at once. Neither becomes the explanation of the other.
                </p>
              </div>
            )}
          </div>

          {state === 'NO_COMPOSITION' && (
            <div className="mt-9 space-y-7">
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                  Choose directly
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {DIRECT_CHOICES.map((id) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => chooseSingle(id)}
                      className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm"
                    >
                      {CAPACITY_AFFORDANCES[id].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                  Compose directly
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => composeDirect('compare_versions', 'seek_counterevidence')}
                    className="rounded-full border border-[#b86d45]/25 bg-white/38 px-4 py-2 text-sm"
                  >
                    Compare versions + Look for counterevidence
                  </button>
                  <button
                    type="button"
                    onClick={() => composeDirect('change_scale', 'hold_unresolved')}
                    className="rounded-full border border-[#b86d45]/25 bg-white/38 px-4 py-2 text-sm"
                  >
                    Change scale + Leave unresolved
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMaiaOpen(true)}
                className="text-sm text-[#795230] underline underline-offset-4"
              >
                Ask MAIA what combinations are available
              </button>
            </div>
          )}

          {maiaOpen && state === 'NO_COMPOSITION' && (
            <div className="mt-8 rounded-[26px] border border-[#74583f]/12 bg-white/38 p-5">
              <p className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                MAIA · bounded composition menu
              </p>
              <p className="mt-2 text-sm leading-7 text-[#5d5044]">
                These combinations are available. None is the correct one, and more support is not better.
              </p>

              <div className="mt-5 grid gap-3">
                {GOVERNED_CAPACITY_CHORDS.map((candidate) => (
                  <button
                    key={candidate.label}
                    type="button"
                    data-capacity-composition-offer={candidate.label}
                    onClick={() => chooseGovernedChord(candidate.ids)}
                    className="rounded-[18px] border border-[#74583f]/12 bg-white/30 p-4 text-left"
                  >
                    <span className="font-serif text-lg">{candidate.label}</span>
                    <span className="mt-2 block text-xs leading-6 text-[#6b5b4e]">
                      {candidate.whyTogether}
                    </span>
                  </button>
                ))}
                <button
                  type="button"
                  data-capacity-composition-offer="none"
                  onClick={() => {
                    setMaiaOpen(false)
                    setState('NO_COMPOSITION')
                  }}
                  className="rounded-[18px] border border-dashed border-[#74583f]/20 bg-white/20 p-4 text-left"
                >
                  <span className="font-serif text-lg">None right now</span>
                  <span className="mt-2 block text-xs leading-6 text-[#6b5b4e]">
                    Keep the inquiry uncomposed.
                  </span>
                </button>
              </div>
            </div>
          )}

          {(state === 'MEMBER_COMPOSED' || state === 'MEMBER_RESHAPED') && chord && (
            <div className="mt-9 space-y-7">
              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                  Reshape
                </p>
                <p className="mt-2 text-xs leading-6 text-[#6b5b4e]">
                  Replace one capacity while keeping the other. No progression is implied.
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => reshape(1, 'change_scale')}
                    disabled={chord.capacityIds[0] === 'change_scale'}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm disabled:opacity-35"
                  >
                    Keep first + replace second with Change scale
                  </button>
                  <button
                    type="button"
                    onClick={() => reshape(0, 'hold_unresolved')}
                    disabled={chord.capacityIds[1] === 'hold_unresolved'}
                    className="rounded-full border border-[#74583f]/15 bg-white/35 px-4 py-2 text-sm disabled:opacity-35"
                  >
                    Replace first with Leave unresolved + keep second
                  </button>
                </div>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.14em] text-[#927b68]">
                  Name this temporary chord yourself
                </p>
                <div className="mt-3 flex flex-col gap-3 md:flex-row">
                  <input
                    value={memberLabel}
                    onChange={(event) => setMemberLabel(event.target.value)}
                    className="min-w-0 flex-1 rounded-[16px] border border-[#74583f]/12 bg-white/45 px-4 py-3 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={applyMemberLabel}
                    className="text-sm text-[#795230] underline underline-offset-4"
                  >
                    Use my name
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={dissolveAll}
                className="text-sm text-[#795230] underline underline-offset-4"
              >
                Dissolve the composition completely
              </button>
            </div>
          )}

          {state === 'SINGLE_CAPACITY' && activeSingle && (
            <div className="mt-8 flex flex-wrap gap-5 text-sm">
              <button
                type="button"
                onClick={() =>
                  composeDirect(
                    activeSingle,
                    activeSingle === 'seek_counterevidence'
                      ? 'compare_versions'
                      : 'seek_counterevidence',
                  )
                }
                className="text-[#795230] underline underline-offset-4"
              >
                Add one other capacity
              </button>
              <button
                type="button"
                onClick={dissolveAll}
                className="text-[#795230] underline underline-offset-4"
              >
                Return to no support
              </button>
            </div>
          )}
        </div>

        <aside className="rounded-[30px] border border-[#74583f]/10 bg-white/38 p-6">
          <h2 className="font-serif text-2xl">Composition standing</h2>
          <dl className="mt-5 space-y-5 text-xs leading-6">
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                state
              </dt>
              <dd>{state}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                active capacities
              </dt>
              <dd>{activeIds.length || 0}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                standing
              </dt>
              <dd>{chord ? chord.standing : activeSingle ? 'MEMBER_SELECTED' : 'NO_SUPPORT'}</dd>
            </div>
            <div>
              <dt className="text-[9px] uppercase tracking-[0.13em] text-[#927b68]">
                persistence
              </dt>
              <dd>none</dd>
            </div>
          </dl>

          <p className="mt-7 border-t border-[#74583f]/12 pt-5 text-xs leading-6 text-[#6b5b4e]">
            A capacity chord is a temporary way of attending. It is not a profile of how you think.
          </p>
        </aside>
      </div>
    </section>
  )
}
