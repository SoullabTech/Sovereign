'use client'

import { useMemo, useState } from 'react'
import {
  HUMAN_CORRECTION_SEQUENCE,
  J6A_REPAIR_EXPERIMENTS,
  MAIA_HUMAN_CORRECTION_LAW,
  MAIA_INSIGHT_STANDING_LAW,
  MAIA_PERCEPTIVE_HUMILITY_LAW,
  PROTECTIVE_INVARIANTS,
  explicitRepairRetestSet,
  protectiveInvariantById,
  type J6ScenarioId,
  type RepairExperimentId,
} from '@/lib/memory/developmental-epistemics/j6RepairExperiments'

type WitnessResult = 'NOT_RUN' | 'PASS' | 'HOLD' | 'FAIL'

type ScenarioWitness = {
  result: WitnessResult
  whatChanged: string
  whatWasLost: string
}

const emptyWitness = (): ScenarioWitness => ({
  result: 'NOT_RUN',
  whatChanged: '',
  whatWasLost: '',
})
export function J6ARepairWitness() {
  const [experimentId, setExperimentId] = useState<RepairExperimentId>('R1')
  const [scenarioId, setScenarioId] = useState<J6ScenarioId>('S01')
  const [witness, setWitness] = useState<Record<string, ScenarioWitness>>({})

  const experiment = useMemo(
    () => J6A_REPAIR_EXPERIMENTS.find((item) => item.id === experimentId)!,
    [experimentId],
  )

  const surface = useMemo(
    () =>
      experiment.surfaces.find((item) => item.scenarioId === scenarioId)
      ?? experiment.surfaces[0],
    [experiment, scenarioId],
  )

  const current = witness[`${experiment.id}:${surface.scenarioId}`] ?? emptyWitness()
  const retestSet = explicitRepairRetestSet(experiment)

  function chooseExperiment(id: RepairExperimentId) {
    const next = J6A_REPAIR_EXPERIMENTS.find((item) => item.id === id)!
    setExperimentId(id)
    setScenarioId(next.targetScenarios[0])
  }
  function updateWitness(patch: Partial<ScenarioWitness>) {
    const key = `${experiment.id}:${surface.scenarioId}`
    setWitness((state) => ({
      ...state,
      [key]: { ...(state[key] ?? emptyWitness()), ...patch },
    }))
  }

  return (
    <main className="min-h-screen bg-[#11100f] text-[#eee3d5]">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <header className="border-b border-[#4d463d]/65 pb-7">
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#9c8a73]">
            J6A-R1 · bounded repair witness · local only
          </p>
          <h1 className="mt-2 font-serif text-4xl leading-tight">Perceptive humility</h1>
          <p className="mt-3 max-w-4xl text-base leading-7 text-[#bcad99]">
            Preserve the intelligence of the insight while making its source, standing, and revisability perceptible.
            Correction should change the shared understanding without making MAIA defensive, bureaucratic, or small.
          </p>
        </header>

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
          <LawCard title="Perceptive humility" text={MAIA_PERCEPTIVE_HUMILITY_LAW} />
          <LawCard title="Insight standing" text={MAIA_INSIGHT_STANDING_LAW} />
          <LawCard title="Human correction" text={MAIA_HUMAN_CORRECTION_LAW} />
        </section>
        <section className="mt-8 rounded-[28px] border border-[#50483e]/70 bg-[#171411] p-5 sm:p-6">
          <div className="flex flex-wrap gap-2">
            {J6A_REPAIR_EXPERIMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => chooseExperiment(item.id)}
                className={
                  item.id === experiment.id
                    ? 'rounded-full border border-[#a18a69]/70 bg-[#2a231b] px-4 py-2 text-sm text-[#efd9b9]'
                    : 'rounded-full border border-[#50483e] px-4 py-2 text-sm text-[#9e907d]'
                }
              >
                {item.id} · {item.title}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.17em] text-[#8e7d68]">Target</p>
              <h2 className="mt-1 font-serif text-2xl text-[#eadccb]">{experiment.targetCluster}</h2>
              <p className="mt-3 text-sm leading-6 text-[#b5a591]">{experiment.mechanism}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.17em] text-[#8e7d68]">Repair hypothesis · E4</p>
              <p className="mt-2 text-sm leading-6 text-[#d0c1ae]">{experiment.repairHypothesis}</p>
            </div>
          </div>
        </section>
        <section className="mt-6">
          <div className="flex flex-wrap gap-2">
            {experiment.targetScenarios.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => setScenarioId(id)}
                className={
                  surface.scenarioId === id
                    ? 'rounded-full bg-[#d9c4a5] px-4 py-2 text-sm text-[#211b15]'
                    : 'rounded-full border border-[#514940] px-4 py-2 text-sm text-[#a99a86]'
                }
              >
                {id}
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <SurfaceCard label="Before repair" surface={surface.before} />
            <SurfaceCard label="After repair" surface={surface.after} emphasized />
          </div>
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-2">
          <EvidenceCard label="What should change" text={surface.predictedEffect} />
          <EvidenceCard label="What must survive" text={surface.predictedNonEffect} />
        </section>
        <section className="mt-6 rounded-[28px] border border-[#514a40]/70 bg-[#171411] p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#978671]">Founder repair witness</p>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-[#c8b9a6]">What became clearer or more human?</span>
            <textarea
              rows={3}
              value={current.whatChanged}
              onChange={(event) => updateWitness({ whatChanged: event.target.value })}
              className="w-full rounded-2xl border border-[#514a40] bg-[#0f0e0d] px-4 py-3 text-sm leading-6 text-[#e3d7c8] outline-none focus:border-[#8d785e]"
            />
          </label>

          <label className="mt-4 block space-y-2">
            <span className="text-sm text-[#c8b9a6]">Did the repair lose anything we need to protect?</span>
            <textarea
              rows={3}
              value={current.whatWasLost}
              onChange={(event) => updateWitness({ whatWasLost: event.target.value })}
              placeholder="Insight, warmth, companionship, authorship, openness, restraint…"
              className="w-full rounded-2xl border border-[#514a40] bg-[#0f0e0d] px-4 py-3 text-sm leading-6 text-[#e3d7c8] outline-none focus:border-[#8d785e]"
            />
          </label>
          <div className="mt-5 flex flex-wrap gap-2">
            {(['PASS', 'HOLD', 'FAIL'] as const).map((result) => (
              <button
                key={result}
                type="button"
                onClick={() => updateWitness({ result })}
                className={
                  current.result === result
                    ? 'rounded-full border border-[#a48b68] bg-[#2b241c] px-5 py-2 text-sm text-[#efd7b2]'
                    : 'rounded-full border border-[#514940] px-5 py-2 text-sm text-[#9c8e7b]'
                }
              >
                {result}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-5 lg:grid-cols-2">
          <Panel title="Protective invariants">
            <div className="space-y-3">
              {experiment.protectedInvariantIds.map((id) => {
                const invariant = protectiveInvariantById(id)
                return (
                  <div key={id} className="rounded-2xl border border-[#484139] bg-[#11100f] p-4">
                    <p className="text-xs text-[#d0b995]">{id} · {invariant.title}</p>
                    <p className="mt-1 text-sm leading-6 text-[#a99b89]">{invariant.requirement}</p>
                  </div>
                )
              })}
            </div>
          </Panel>
          <Panel title="Meaning-bearing correction">
            <div className="space-y-3">
              {HUMAN_CORRECTION_SEQUENCE.map((stage) => (
                <div key={stage.id} className="flex gap-3">
                  <span className="w-20 flex-none text-xs font-medium tracking-[0.08em] text-[#d1b78f]">
                    {stage.id}
                  </span>
                  <p className="text-sm leading-6 text-[#ab9c89]">{stage.purpose}</p>
                </div>
              ))}
            </div>
          </Panel>
        </section>

        <Panel title="Explicit retest set" className="mt-6">
          <div className="flex flex-wrap gap-2">
            {retestSet.map((id) => (
              <span key={id} className="rounded-full border border-[#4e473e] px-3 py-1.5 text-xs text-[#aa9a86]">
                {id}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#756a5d]">
            Target scenarios plus protective negative controls. No aggregate score; any material regression remains visible.
          </p>
        </Panel>
        <footer className="mt-8 border-t border-[#474138]/65 pt-5 text-xs leading-5 text-[#766c60]">
          Session-only witness. No durable member-memory writes. No automatic repair promotion. No J6B or J7 execution.
        </footer>
      </div>
    </main>
  )
}

function LawCard({ title, text }: { title: string; text: string }) {
  return (
    <section className="rounded-[24px] border border-[#4c453c]/65 bg-[#171411] p-5">
      <p className="text-[10px] uppercase tracking-[0.17em] text-[#8f7f6b]">{title}</p>
      <p className="mt-3 text-sm leading-6 text-[#c1b19e]">{text}</p>
    </section>
  )
}

function SurfaceCard({
  label,
  surface,
  emphasized = false,
}: {
  label: string
  surface: { eyebrow: string; heading: string; body: string; detail?: string }
  emphasized?: boolean
}) {
  return (
    <section
      className={
        emphasized
          ? 'rounded-[30px] border border-[#8d785e]/65 bg-[#1d1914] p-6'
          : 'rounded-[30px] border border-[#4b443b]/65 bg-[#151310] p-6'
      }
    >
      <p className="text-[10px] uppercase tracking-[0.17em] text-[#8e7d68]">{label}</p>
      <p className="mt-5 text-[11px] uppercase tracking-[0.16em] text-[#9b8972]">{surface.eyebrow}</p>
      <h3 className="mt-2 font-serif text-2xl leading-tight text-[#eadccb]">{surface.heading}</h3>
      <p className="mt-4 text-[16px] leading-7 text-[#c3b4a1]">{surface.body}</p>
      {surface.detail && (
        <p className="mt-4 text-sm leading-6 text-[#918371]">{surface.detail}</p>
      )}
    </section>
  )
}

function EvidenceCard({ label, text }: { label: string; text: string }) {
  return (
    <section className="rounded-[22px] border border-[#4b443b]/65 bg-[#151310] p-5">
      <p className="text-[10px] uppercase tracking-[0.17em] text-[#8e7d68]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[#b9aa97]">{text}</p>
    </section>
  )
}
function Panel({
  title,
  className = '',
  children,
}: {
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={`rounded-[26px] border border-[#4b443b]/65 bg-[#151310] p-5 sm:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#95846f]">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}
