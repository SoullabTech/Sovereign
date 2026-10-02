'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  buildIlluminationModel,
  type IlluminationRelation,
} from './livingFieldIllumination'
import styles from './livingFieldGrokkerShell.module.css'

type Props = {
  selectedKey: string
  orientationKey?: string
  onInspectKey?: (key: string) => void
  onRevealKey?: (key: string) => void
}

function RelationRow({
  relation,
  onInspectKey,
}: {
  relation: IlluminationRelation
  onInspectKey?: (key: string) => void
}) {
  return (
    <button
      type="button"
      data-relation-other-key={relation.otherKey}
      onClick={() => onInspectKey?.(relation.otherKey)}
      className={`group w-full rounded-lg border px-3 py-2.5 text-left transition ${styles.panelButton}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[15px] text-[#dfd3c0]">{relation.otherLabel}</p>
          <p className="mt-0.5 text-[11px] text-[#7e6f5d]">{relation.verb}</p>
        </div>
        <span className="rounded-full border border-[rgba(217,187,142,.13)] px-2 py-0.5 text-[8px] uppercase tracking-[0.13em] text-[#756652]">
          {relation.kind}
        </span>
      </div>
    </button>
  )
}

function SectionTitle({
  children,
  aside,
}: {
  children: React.ReactNode
  aside?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h3 className={styles.sectionLabel}>{children}</h3>
      {aside ? <div className={styles.meta}>{aside}</div> : null}
    </div>
  )
}

export function LivingFieldIlluminationPanel({
  selectedKey,
  orientationKey,
  onInspectKey,
  onRevealKey,
}: Props) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  const [lineageOpen, setLineageOpen] = useState(false)
  const [perspectivesOpen, setPerspectivesOpen] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const model = useMemo(() => buildIlluminationModel(selectedKey), [selectedKey])
  const orientation = useMemo(
    () => orientationKey ? buildIlluminationModel(orientationKey) : null,
    [orientationKey],
  )
  const inspectingBeyondFocus = Boolean(
    orientation && model && orientation.key !== model.key,
  )

  useEffect(() => {
    setEvidenceOpen(false)
    setLineageOpen(false)
    setPerspectivesOpen(false)
    panelRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [selectedKey])

  if (!model) {
    return (
      <aside className={`h-full border-l p-5 ${styles.panel}`}>
        <p className="text-[15px] text-[#8d7c66]">Select a locus in the field.</p>
      </aside>
    )
  }

  return (
    <aside
      ref={panelRef}
      data-illumination-key={model.key}
      className={`h-full overflow-y-auto border-l px-6 py-6 ${styles.panel}`}
    >
      <div className={`border-b pb-5 ${styles.panelRule}`}>
        <p className={styles.eyebrow}>
          {model.element?.label ?? 'Living Field'}
        </p>
        <h2 className={`mt-2 ${styles.panelTitle}`}>
          {model.label}
        </h2>
        <p className={`mt-3 ${styles.panelInquiry}`}>{model.inquiry}</p>
        {model.essence ? (
          <p className={`mt-5 border-l pl-3 ${styles.panelEssence}`}>
            {model.essence}
          </p>
        ) : null}

        <div className="mt-4">
          <p className="mb-2 text-[8px] uppercase tracking-[0.18em] text-[#746654]">
            Context path · prototype
          </p>
          <div className="flex flex-wrap gap-1.5">
          {model.contextPath.slice(1).map((item) => (
            <span
              key={item.key}
              className={`rounded-full border px-2.5 py-1 ${styles.pathChip}`}
            >
              {item.label}
            </span>
          ))}
          </div>
        </div>

        {inspectingBeyondFocus ? (
          <p className="mt-4 text-[10px] leading-4 text-[#766854]">
            Inspecting here while the field remains at {orientation?.label}.
          </p>
        ) : null}
      </div>

      <div className="space-y-6 py-5">
        {model.children.length > 0 ? (
          <section className="space-y-2.5">
            <SectionTitle aside={String(model.children.length) + ' ' + (model.children.length === 1 ? 'locus' : 'loci')}>
              In this field
            </SectionTitle>
            <div className="space-y-1.5">
              {model.children.map((child) => (
                <button
                  type="button"
                  key={child.key}
                  onClick={() => onInspectKey?.(child.key)}
                  className="w-full rounded-lg px-3 py-2.5 text-left transition hover:bg-[rgba(203,169,116,.055)]"
                >
                  <p className="text-[15px] text-[#ddd0bc]">{child.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-5 text-[#786b59]">
                    {child.inquiry}
                  </p>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {model.relations.length > 0 ? (
          <section className="space-y-2.5">
            <SectionTitle aside={String(model.relations.length) + ' ' + (model.relations.length === 1 ? 'relation' : 'relations')}>
              Relations
            </SectionTitle>
            <div className="space-y-2">
              {model.relations.map((relation) => (
                <RelationRow key={relation.id} relation={relation} onInspectKey={onInspectKey} />
              ))}
            </div>
          </section>
        ) : null}

        {model.tensions.length > 0 ? (
          <section className="space-y-2.5 rounded-xl border border-[rgba(202,156,92,.18)] bg-[rgba(99,62,30,.075)] p-3.5">
            <SectionTitle>Held tension</SectionTitle>
            {model.tensions.map((relation) => (
              <div key={relation.id}>
                <p className="text-[15px] text-[#d9ccb8]">
                  {model.label} ↔ {relation.otherLabel}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#897862]">{relation.rationale}</p>
                {relation.counterevidence ? (
                  <p className="mt-2 text-[11px] leading-5 text-[#6f6252]">
                    Qualification: {relation.counterevidence}
                  </p>
                ) : null}
              </div>
            ))}
          </section>
        ) : null}

        {model.relatedFields.length > 0 ? (
          <section className="space-y-2.5">
            <SectionTitle>Related fields</SectionTitle>
            <div className="space-y-1">
              {model.relatedFields.map((field) => (
                <button
                  type="button"
                  key={field.id}
                  onClick={() => onInspectKey?.(field.id)}
                  className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-[rgba(203,169,116,.055)]"
                >
                  <div>
                    <p className="text-[15px] text-[#d9ccb8]">{field.label}</p>
                    <p className="mt-0.5 text-[11px] text-[#6f6252]">{field.essence}</p>
                  </div>
                  <span className="text-[#6e5f4d]">→</span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setPerspectivesOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <SectionTitle>Perspectives</SectionTitle>
            <span className="text-xs text-[#6f6252]">{perspectivesOpen ? '−' : '+'}</span>
          </button>
          {perspectivesOpen ? (
            <div className={`rounded-xl border p-3.5 ${styles.quietBox}`}>
              <p className="text-[15px] text-[#c8b79f]">Elemental lens · current rendering perspective</p>
              <p className="mt-2 text-xs leading-5 text-[#716451]">
                The current field is being shown through the Elemental Alchemy perspective. Perspective shapes what becomes perceptible; it does not silently redefine the underlying field or become its only ontology.
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-3">
          <button
            type="button"
            onClick={() => setLineageOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <SectionTitle>How this became</SectionTitle>
            <span className="text-xs text-[#6f6252]">{lineageOpen ? '−' : '+'}</span>
          </button>
          {lineageOpen ? (
            <div className={`rounded-xl border p-3.5 ${styles.quietBox}`}>
              <p className="text-[15px] text-[#bfae96]">Lineage not yet bound in this witness</p>
              <p className="mt-2 text-xs leading-5 text-[#716451]">
                The context path above answers where this locus currently sits. It is not the same as lineage. Lineage will show how this meaning changed, emerged, or was reconciled through time once exact lineage evidence is bound.
              </p>
            </div>
          ) : null}
        </section>

        <section className="space-y-2.5">
          <SectionTitle>Possible movements</SectionTitle>
          <p className="text-xs leading-5 text-[#7d6f5d]">
            Enter a genuinely contained field, inspect a relation, widen toward the containing context, change perspective when available, or stay here. No movement is treated as the correct next step.
          </p>
        </section>

        <section className={`space-y-3 border-t pt-5 ${styles.panelRule}`}>
          <button
            type="button"
            onClick={() => setEvidenceOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <SectionTitle>What this rests on</SectionTitle>
            <span className="text-xs text-[#6f6252]">{evidenceOpen ? '−' : '+'}</span>
          </button>

          {evidenceOpen ? (
            <div className={`rounded-xl border p-3.5 ${styles.quietBox}`}>
              <p className={styles.sectionLabel}>Evidence standing</p>
              <p className="mt-2 text-[15px] text-[#bfae96]">Controlled prototype — source fabric not yet bound</p>
              <p className="mt-2 text-xs leading-5 text-[#716451]">
                This R2D3 witness can expose relation rationale and prototype provenance, but it does not yet claim exact source fragments, source roots, version custody, or independent evidentiary support.
              </p>
              <p className="mt-3 text-[11px] leading-5 text-[#9a7442]">
                No absence of source display should be read as absence of evidence; exact source binding is a separate Source Fabric act.
              </p>
            </div>
          ) : null}
        </section>

        <div className="grid gap-2 pt-1">
          {model.canEnter && onRevealKey ? (
            <button
              type="button"
              onClick={() => onRevealKey(model.key)}
              className={`rounded-lg px-4 py-3 text-center text-sm font-medium transition ${styles.secondaryAction}`}
            >
              Enter field →
            </button>
          ) : inspectingBeyondFocus && model.spatiallyNavigable && onRevealKey ? (
            <button
              type="button"
              onClick={() => onRevealKey(model.key)}
              className={`rounded-lg px-4 py-3 text-center text-sm font-medium transition ${styles.secondaryAction}`}
            >
              Reveal in field →
            </button>
          ) : null}

          <Link
            href={'/maia?field=' + encodeURIComponent(model.key)}
            className={`rounded-lg px-4 py-3 text-center text-sm font-medium transition ${styles.primaryAction}`}
          >
            Explore with MAIA
          </Link>
          <p className="px-2 text-center text-[10px] leading-4 text-[#695d4f]">
            MAIA should enter through this exact semantic locus; source access remains separately governed.
          </p>
        </div>
      </div>
    </aside>
  )
}
