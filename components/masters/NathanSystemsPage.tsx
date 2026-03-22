'use client';

import type { MasterField } from '@/lib/masters/types';

interface NathanSystemsPageProps {
  master: MasterField;
}

const SYSTEM_QUESTIONS = [
  {
    id: 'coherence-scale',
    question: 'How does coherence scale across groups?',
    body: 'One-to-one sovereign AI works. The architecture holds. But what happens when 40 practitioners share a field? When group sessions need real-time state tracking across participants? Coherence is not a database problem — it is a synchronization problem with no single source of truth. Where does consensus live when there is no central authority?',
  },
  {
    id: 'measurable-vs-experiential',
    question: 'What is measurable vs. experiential?',
    body: 'Spiralogic tracks element, phase, motion, and intensity. Theme signals detect participatory markers in language. But the gap between what the system can measure and what actually matters in a session is non-trivial. What is the right instrumentation layer — one that captures enough to be useful without flattening the thing it is measuring?',
  },
  {
    id: 'ai-decision-loops',
    question: 'Where does AI sit in decision loops?',
    body: "MAIA is not an authority. It does not diagnose, prescribe, or steer. But it sits inside feedback loops — between practitioner and client, between system state and session orientation, between memory and forgetting. In a system designed to resist AI authority, where exactly should the AI have influence, and where must it be structurally excluded?",
  },
];

const OPEN_PROBLEMS = [
  {
    id: 'enterprise-isolation',
    title: 'Enterprise isolation architecture',
    description:
      'A regulated enterprise (healthcare, education, defense) wants to pilot MAIA for practitioner support. They require data residency guarantees, audit trails, and tenant isolation — none of which exist today. The current stack is single-tenant on a Mac Studio. Design the path from here to multi-tenant enterprise deployment without introducing cloud dependency or breaking sovereignty guarantees.',
    constraint: 'No managed databases. No third-party data custody. Sovereignty at the architecture level, not by policy.',
  },
  {
    id: 'group-state',
    title: 'Group state synchronization',
    description:
      'Wisdom Fields supports threaded discussion and shared reflection. But there is no real-time group state — no way for MAIA to track the collective signal of a group session, distinguish individual from group dynamics, or adjust orientation based on emergent group coherence. Design the state model and synchronization layer for group-aware AI companionship.',
    constraint: 'No central authority. Consent-first. Sanctuary mode must remain enforceable per-individual within a group context.',
  },
  {
    id: 'instrumentation',
    title: 'Instrumentation without surveillance',
    description:
      'The system needs observability — practitioners need to know if their tools are working, operators need health metrics, and the Spiralogic layer needs signal data to improve. But every instrumentation decision is also a surveillance decision. Design the telemetry architecture that gives operators and practitioners what they need without creating a behavioral profile of users.',
    constraint: 'Zero content logging from Sanctuary sessions. No training data extraction. No engagement metrics that could be optimized against user agency.',
  },
];

export default function NathanSystemsPage({ master }: NathanSystemsPageProps) {
  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{
        backgroundColor: master.palette.background,
        color: master.palette.text,
        fontFamily: 'var(--field-font-body)',
      }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Soullab Branding Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/holoflower-amber.png"
              alt="Soullab"
              className="w-8 h-8 object-contain opacity-80"
            />
            <span
              className="text-xs tracking-widest uppercase opacity-50"
              style={{ color: master.palette.primary, letterSpacing: '0.2em' }}
            >
              Soullab
            </span>
          </div>
          <a
            href={`/fields/${master.slug}`}
            className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: master.palette.text }}
          >
            {master.shortName}&apos;s Field
          </a>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-3xl font-light mb-3"
            style={{ fontFamily: 'var(--field-font-display)', color: master.palette.text }}
          >
            Systems Layer
          </h1>
          <p className="text-base opacity-60 max-w-xl leading-relaxed">
            Soullab is building sovereign consciousness infrastructure on a self-hosted stack
            with no cloud lock-in and no third-party data custody. This page is where the
            engineering questions live. Not the vision. The structural problems that determine
            whether any of this actually works at scale.
          </p>
        </div>

        {/* Core System Questions */}
        <div className="mb-12">
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-5">
            Core System Questions
          </div>
          <div className="space-y-5">
            {SYSTEM_QUESTIONS.map((q) => (
              <div
                key={q.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.text}10`,
                }}
              >
                <h3
                  className="text-base font-medium mb-3"
                  style={{ color: master.palette.primary }}
                >
                  {q.question}
                </h3>
                <p className="text-sm opacity-60 leading-relaxed">{q.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open Design Problems */}
        <div className="mb-12">
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-2">
            Open Design Problems
          </div>
          <p className="text-sm opacity-40 mb-5 leading-relaxed">
            Real structural challenges. No settled answer. Where a systems thinker can apply leverage.
          </p>
          <div className="space-y-5">
            {OPEN_PROBLEMS.map((p) => (
              <div
                key={p.id}
                className="p-5 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.primary}25`,
                }}
              >
                <h3 className="text-sm font-semibold mb-2">{p.title}</h3>
                <p className="text-sm opacity-60 leading-relaxed mb-3">{p.description}</p>
                <div
                  className="text-xs opacity-50 pl-3 leading-relaxed"
                  style={{ borderLeft: `2px solid #EB575760` }}
                >
                  Constraint: {p.constraint}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA — take it to the studio */}
        <div
          className="p-6 rounded-lg text-center"
          style={{
            backgroundColor: `${master.palette.primary}10`,
            border: `1px solid ${master.palette.primary}30`,
          }}
        >
          <p className="text-sm opacity-60 mb-4">
            Have a candidate architecture? A structural question? An approach you&apos;d challenge?
          </p>
          <a
            href={`/fields/${master.slug}/studio`}
            className="inline-block py-3 px-8 rounded text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              backgroundColor: master.palette.primary,
              color: master.palette.background,
            }}
          >
            Bring it to the Studio
          </a>
        </div>

        {/* Footer nav */}
        <div
          className="mt-12 pt-8 flex gap-6 text-sm opacity-40 border-t"
          style={{ borderColor: `${master.palette.text}15` }}
        >
          <a href={`/fields/${master.slug}/operator`} className="hover:opacity-70 transition-opacity">
            Platform View
          </a>
          <a href={`/fields/${master.slug}/studio`} className="hover:opacity-70 transition-opacity">
            Studio
          </a>
          <a href={`/fields/${master.slug}`} className="hover:opacity-70 transition-opacity">
            Field Home
          </a>
        </div>
      </div>
    </div>
  );
}
