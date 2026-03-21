'use client';

import type { MasterField } from '@/lib/masters/types';

interface NathanPartnerPageProps {
  master: MasterField;
}

const CAPABILITIES = [
  {
    area: 'Systems Architecture',
    description:
      'Structural review of platform design, data flows, and load-bearing assumptions. Translates between consciousness-work requirements and engineering constraints.',
  },
  {
    area: 'Enterprise Integration',
    description:
      'Pathway design for regulated enterprise deployments — healthcare, education, organizational development. Data residency, compliance, and tenant isolation without breaking sovereignty guarantees.',
  },
  {
    area: 'Group Systems Design',
    description:
      'Facilitated design sessions for complex structural problems. MIT-trained systems thinking applied to the frontier questions of collective coherence and group AI companionship.',
  },
  {
    area: 'Organizational Bridge',
    description:
      'Credibility layer between Soullab and enterprise environments. Translates the platform\'s principles and capabilities into language that organizational decision-makers recognize and trust.',
  },
];

const PRINCIPLES = [
  'Structure before aesthetics. If the architecture doesn\'t hold, the work doesn\'t scale.',
  'Constraints are information, not problems. The best designs emerge from what cannot change.',
  "Sovereignty is an engineering problem. You cannot protect what you haven't designed to protect.",
  'If the system cannot explain its own failure modes, it is not a system — it is a hope.',
];

export default function NathanPartnerPage({ master }: NathanPartnerPageProps) {
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

        {/* Title + Role */}
        <div className="mb-12">
          <div
            className="text-xs font-medium tracking-widest uppercase mb-3 opacity-50"
            style={{ color: master.palette.primary }}
          >
            Executive Partner
          </div>
          <h1
            className="text-4xl font-light mb-4"
            style={{
              fontFamily: 'var(--field-font-display)',
              color: master.palette.text,
              lineHeight: 1.2,
            }}
          >
            Nathan
          </h1>
          <p className="text-base opacity-60 max-w-lg leading-relaxed">
            Systems architect. Enterprise bridge. Platform partner.
            Building the structural layer that makes sovereign consciousness infrastructure real.
          </p>
        </div>

        {/* Divider */}
        <div
          className="mb-12"
          style={{
            width: '48px',
            height: '1px',
            backgroundColor: master.palette.primary,
            opacity: 0.4,
          }}
        />

        {/* Bio */}
        <div className="mb-12 space-y-4">
          <p className="text-sm leading-relaxed opacity-70">
            Nathan is an MIT-trained experimental mechanical engineer and systems analyst at ThermoFisher Scientific.
            He has spent his career in environments where &ldquo;it works in theory&rdquo; is not
            good enough — where every architectural assumption gets tested at scale, and the
            difference between a sound design and a fragile one shows up in production.
          </p>
          <p className="text-sm leading-relaxed opacity-70">
            When he encountered Soullab, the question wasn&apos;t whether the vision was compelling.
            It was whether the infrastructure could sustain it — data sovereignty in practice,
            not just principle. Consent systems that actually hold under load. AI that supports
            agency rather than eroding it. These are engineering problems, not just ethical ones.
          </p>
          <p className="text-sm leading-relaxed opacity-70">
            He joined as an Executive Partner to help build the platform&apos;s structural
            foundation — and to open the bridge between sovereign consciousness infrastructure
            and the enterprise environments where it could have the most impact.
          </p>
        </div>

        {/* Credentials */}
        <div
          className="mb-12 p-5 rounded-lg"
          style={{
            backgroundColor: `${master.palette.text}06`,
            border: `1px solid ${master.palette.text}10`,
          }}
        >
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-4">
            Background
          </div>
          <div className="space-y-2">
            {master.story.lineage.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm">
                <span style={{ color: master.palette.primary }} className="mt-0.5 shrink-0">
                  —
                </span>
                <span className="opacity-70">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Capabilities */}
        <div className="mb-12">
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-5">
            What He Brings
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {CAPABILITIES.map((cap) => (
              <div
                key={cap.area}
                className="p-4 rounded-lg"
                style={{
                  backgroundColor: `${master.palette.text}06`,
                  border: `1px solid ${master.palette.primary}20`,
                }}
              >
                <h3
                  className="text-sm font-medium mb-2"
                  style={{ color: master.palette.primary }}
                >
                  {cap.area}
                </h3>
                <p className="text-sm opacity-55 leading-relaxed">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Principles */}
        <div className="mb-12">
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-5">
            Operating Principles
          </div>
          <div className="space-y-3">
            {PRINCIPLES.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-3 text-sm opacity-65 leading-relaxed"
                style={{ borderLeft: `2px solid ${master.palette.primary}35`, paddingLeft: '12px' }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Three entry points */}
        <div className="mb-12">
          <div className="text-xs font-medium tracking-widest uppercase opacity-40 mb-5">
            Working With Nathan
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <a
              href={`/fields/${master.slug}/systems`}
              className="p-4 rounded-lg transition-opacity hover:opacity-80 block"
              style={{
                backgroundColor: `${master.palette.primary}12`,
                border: `1px solid ${master.palette.primary}30`,
              }}
            >
              <div className="text-sm font-medium mb-1" style={{ color: master.palette.primary }}>
                Systems Layer
              </div>
              <div className="text-xs opacity-50 leading-relaxed">
                Open design problems and architectural questions.
              </div>
            </a>
            <a
              href={`/fields/${master.slug}/studio`}
              className="p-4 rounded-lg transition-opacity hover:opacity-80 block"
              style={{
                backgroundColor: `${master.palette.text}06`,
                border: `1px solid ${master.palette.text}12`,
              }}
            >
              <div className="text-sm font-medium mb-1" style={{ color: master.palette.text }}>
                Studio
              </div>
              <div className="text-xs opacity-50 leading-relaxed">
                Direct line. Ask MAIA, send a message, bring a problem.
              </div>
            </a>
            <a
              href={`/fields/${master.slug}/operator`}
              className="p-4 rounded-lg transition-opacity hover:opacity-80 block"
              style={{
                backgroundColor: `${master.palette.text}06`,
                border: `1px solid ${master.palette.text}12`,
              }}
            >
              <div className="text-sm font-medium mb-1" style={{ color: master.palette.text }}>
                Platform View
              </div>
              <div className="text-xs opacity-50 leading-relaxed">
                Build status, roadmap, and open decisions.
              </div>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          className="pt-8 flex items-center justify-between text-xs opacity-30 border-t"
          style={{ borderColor: `${master.palette.text}15` }}
        >
          <span>nathan.soullab.life</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/holoflower-amber.png"
            alt=""
            className="w-5 h-5 object-contain opacity-40"
          />
        </div>
      </div>
    </div>
  );
}
