'use client';

/**
 * Nathan's Systems Page
 * nathan.soullab.life/systems
 *
 * Executive systems console — not a memo.
 * Answers four questions fast: what exists, what's next, how it fits, where Nathan's judgment matters.
 */

import type { MasterField } from '@/lib/masters/types';

interface NathanSystemsPageProps {
  master: MasterField;
}

// ── Data ─────────────────────────────────────────────────────────────────────

const CURRENT_SYSTEM = [
  {
    id: 'oracle',
    label: 'Oracle + Conversation Engine',
    status: 'live',
    description: 'Multi-phase LLM routing (FAST / CORE / DEEP) with Claude as primary. Spiralogic element/phase conductor governs response posture before every turn. 4-phase relational sequencing (mirror → bridge → next_step → pass) is live and producing 30% next_step rates vs 1% baseline.',
  },
  {
    id: 'field-routing',
    label: 'Field-Based Routing',
    status: 'live',
    description: 'Subdomain routing maps kelly.soullab.life, nathan.soullab.life, jondi.soullab.life → field-specific contexts. Each field has its own persona, tone, frameworks, and entry paths. Three fields active.',
  },
  {
    id: 'audit-system',
    label: 'Identity Audit System',
    status: 'live',
    description: 'Three-mode audit engine: Individual, Partnership, Team. Field-aware entry at each subdomain/audit. POST /api/audit/identity runs Claude-powered structured analysis → stores in audit_results. Signal extraction on every result.',
  },
  {
    id: 'memory',
    label: 'Memory + Spiral State',
    status: 'live',
    description: 'Spiral state persistence (element, phase, motion) survives server restarts. Member theme signals tracked via participatory reality framework — 6 themes, fire-and-forget writes. Member live context synthesized into oracle prompts.',
  },
  {
    id: 'field-state',
    label: 'Field State V1',
    status: 'live',
    description: '6-field synthesis (dominantTone, dominantTheme, activePattern, recency, confidence, tension) computed per oracle request and injected when confidence > 0.6. Debug telemetry active.',
  },
  {
    id: 'infra',
    label: 'Infrastructure',
    status: 'live',
    description: 'Self-hosted Mac Studio. Docker + Caddy. PostgreSQL (self-hosted, no Supabase). No cloud lock-in. No managed database. Builds from main branch. Deploy: docker compose up --build maia.',
  },
];

const NEXT_LAYER = [
  {
    id: 'signal-engine',
    label: 'Signal Extraction → Content Engine',
    priority: 'high',
    description: 'Every audit generates a summarySignal stored in audit_results. Next step: surface those signals in a weekly dashboard view. Manual review → publish. Turns audit volume into messaging intelligence automatically.',
  },
  {
    id: 'segmented-journeys',
    label: 'Segmented User Journeys',
    priority: 'high',
    description: 'Kelly field → identity/depth/guide entry. Nathan field → systems/team/execution entry. Generic entry at /audit. Need: differentiated downstream paths (report delivery, follow-up, conversion to paid tier).',
  },
  {
    id: 'facilitator-layer',
    label: 'Facilitator / Practitioner Layer',
    priority: 'medium',
    description: 'Practitioners use MAIA as a tool to support clients. Care lens (therapeutic framework injection) is live. Mentor stance (supervisory mode) is built. Need: client-side activation path + live supervisory smoke tests.',
  },
  {
    id: 'enterprise-audit',
    label: 'Enterprise / Team Audit Path',
    priority: 'medium',
    description: 'Team audit mode is live. Next: formal team audit product — structured intake, report delivery, signal aggregation across team submissions. Enterprise isolation architecture (multi-tenant) is an open design problem.',
  },
  {
    id: 'report-delivery',
    label: 'Report Delivery + PDF',
    priority: 'medium',
    description: 'Audit reports render in-browser. Print-to-PDF available. Need: proper PDF generation pipeline, email delivery, optional Loom integration for premium walkthrough delivery.',
  },
];

const ARCHITECTURE_FLOWS = [
  {
    id: 'entry',
    label: 'User Entry Paths',
    flow: [
      'soullab.life/audit → generic Individual audit',
      'kelly.soullab.life/audit → Individual (recommended) or Partnership',
      'nathan.soullab.life/audit → Team (recommended) or Individual/Partnership',
      'soullab.life → main app → /maia → oracle conversation',
      'field subdomain → field threshold → with-me / studio / audit',
    ],
  },
  {
    id: 'audit-flow',
    label: 'Audit Flow',
    flow: [
      'Intake form (5 sections) → POST /api/audit/identity',
      'auditMode + fieldContext → prompt builder (individual / partnership / team)',
      'Claude (Sonnet, level 3) → structured JSON result',
      'Fire-and-forget → audit_results table (member_id nullable)',
      'summarySignal extracted → content engine seed',
      'Report rendered client-side',
    ],
  },
  {
    id: 'oracle-flow',
    label: 'Oracle / Conversation Flow',
    flow: [
      'Message → POST /api/oracle/conversation',
      'Load: spiral state + live context + field state + theme history',
      'Conductor: element/phase → voice hint → relational stance',
      'Prompt assembly: identity + elemental + care lens + mentor stance (if set)',
      'LLM call → validation → optional repair',
      'Fire-and-forget: upsert spiral state + store theme signals',
      'Return: response + spiralogic metadata',
    ],
  },
  {
    id: 'memory-flow',
    label: 'Memory Architecture',
    flow: [
      'member_spiral_state — element/phase persists across sessions',
      'member_theme_signals — participatory reality markers (6 themes)',
      'memory_packets — structured memory from conversations',
      'audit_results — structured identity analysis with signal extraction',
      'No Sanctuary content ever persisted',
    ],
  },
];

const JUDGMENT_AREAS = [
  {
    id: 'simplification',
    label: 'System Simplification',
    description: 'The oracle route is ~1300 lines. Multiple fire-and-forget layers. Prompt assembly has 7+ injection points. Where is the complexity load-bearing vs. accumulated? What collapses without losing capability?',
  },
  {
    id: 'productization',
    label: 'Productization Choices',
    description: 'Audit is built as a marketing entry. Team audit exists. Partnership audit exists. Which becomes a paid product first? What does the pricing ladder look like given the current capabilities? What packaging translates the system into clear value for a buyer?',
  },
  {
    id: 'enterprise',
    label: 'Enterprise Path',
    description: 'Single-tenant Mac Studio → multi-tenant enterprise. Data residency, audit trails, tenant isolation. No managed databases. No cloud custody. What is the minimum viable architecture change that enables a first enterprise pilot without breaking sovereignty guarantees?',
  },
  {
    id: 'automation',
    label: 'Manual vs. Automated',
    description: 'Signal extraction is built but requires manual review before publishing. Report delivery requires manual send. Practitioner supervision requires manual activation. Which of these should stay manual in v1? Which should be automated and when?',
  },
  {
    id: 'workflow',
    label: 'Workflow Design',
    description: 'Kelly runs audits manually and reviews signals. Nathan advises on systems. What is the actual operational workflow for running this as a service? What tools does Kelly need to manage audit volume, signal quality, and report delivery at 50 audits/month? At 500?',
  },
];

const OPEN_DECISIONS = [
  'Which audit types (Individual / Partnership / Team) become first-class paid products, and in what order?',
  'What should the report delivery experience be for premium clients — in-browser only, PDF email, or Loom walkthrough?',
  'Where should enterprise/team pathways structurally diverge from individual pathways?',
  'Which signals from audit_results should surface automatically vs. require human curation before publishing?',
  'What does Nathan own vs. advise on? Architecture review, operational design, productization strategy — what is the clearest division?',
  'At what audit volume does the manual review workflow break, and what replaces it?',
];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    live: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    building: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    planned: 'bg-stone-700/40 text-stone-400 border-stone-600/30',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border ${colors[status] ?? colors.planned}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high: 'text-amber-400',
    medium: 'text-stone-400',
    low: 'text-stone-600',
  };
  return (
    <span className={`text-xs uppercase tracking-wider ${colors[priority] ?? 'text-stone-500'}`}>
      {priority} priority
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NathanSystemsPage({ master }: NathanSystemsPageProps) {
  const bg = master.palette.background;
  const text = master.palette.text;
  const primary = master.palette.primary;

  const card = {
    backgroundColor: `${text}05`,
    border: `1px solid ${text}12`,
  };

  const accentCard = {
    backgroundColor: `${primary}08`,
    border: `1px solid ${primary}25`,
  };

  return (
    <div
      className="min-h-screen px-6 py-16"
      style={{ backgroundColor: bg, color: text, fontFamily: 'var(--field-font-body)' }}
    >
      <div className="max-w-3xl mx-auto">

        {/* Nav */}
        <div className="flex items-center justify-between mb-12">
          <a
            href={`/fields/${master.slug}`}
            className="text-xs opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: text }}
          >
            ← {master.shortName}&apos;s Field
          </a>
          <span
            className="text-xs tracking-widest uppercase opacity-30"
            style={{ color: primary }}
          >
            Soullab Systems
          </span>
        </div>

        {/* Header */}
        <div className="mb-14">
          <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primary, opacity: 0.6 }}>
            Architecture Console
          </p>
          <h1
            className="text-3xl font-light mb-4"
            style={{ fontFamily: 'var(--field-font-display)', color: text }}
          >
            System State
          </h1>
          <p className="text-sm leading-relaxed max-w-xl" style={{ opacity: 0.55 }}>
            What is built, what is next, how it fits together, and where your judgment changes the trajectory.
            Updated as the system evolves.
          </p>
        </div>

        {/* ── 1. CURRENT SYSTEM ─────────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader label="1. Current System" note="What is live in production today" primary={primary} />
          <div className="space-y-3">
            {CURRENT_SYSTEM.map((item) => (
              <div key={item.id} className="p-4 rounded-lg" style={card}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-medium" style={{ color: text }}>{item.label}</span>
                  <StatusBadge status={item.status} />
                </div>
                <p className="text-sm leading-relaxed" style={{ opacity: 0.55 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. NEXT LAYER ─────────────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader label="2. Next Layer" note="What is actively being built toward" primary={primary} />
          <div className="space-y-3">
            {NEXT_LAYER.map((item) => (
              <div key={item.id} className="p-4 rounded-lg" style={accentCard}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <span className="text-sm font-medium" style={{ color: text }}>{item.label}</span>
                  <PriorityBadge priority={item.priority} />
                </div>
                <p className="text-sm leading-relaxed" style={{ opacity: 0.55 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. ARCHITECTURE ───────────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader label="3. Architecture" note="How the layers connect" primary={primary} />
          <div className="space-y-4">
            {ARCHITECTURE_FLOWS.map((flow) => (
              <div key={flow.id} className="p-4 rounded-lg" style={card}>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: primary, opacity: 0.6 }}>
                  {flow.label}
                </p>
                <ol className="space-y-1.5">
                  {flow.flow.map((step, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span style={{ color: primary, opacity: 0.4 }} className="shrink-0 w-4 text-right">
                        {i + 1}.
                      </span>
                      <span style={{ opacity: 0.65 }}>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. WHERE NATHAN'S JUDGMENT MATTERS ───────────────────────── */}
        <section className="mb-14">
          <SectionHeader
            label="4. Where Your Judgment Matters"
            note="Explicit leverage points — not background reading"
            primary={primary}
          />
          <div className="space-y-3">
            {JUDGMENT_AREAS.map((area) => (
              <div key={area.id} className="p-4 rounded-lg" style={{ ...accentCard, borderColor: `${primary}35` }}>
                <p className="text-sm font-medium mb-2" style={{ color: primary }}>{area.label}</p>
                <p className="text-sm leading-relaxed" style={{ opacity: 0.6 }}>{area.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. OPEN DECISIONS ─────────────────────────────────────────── */}
        <section className="mb-14">
          <SectionHeader
            label="5. Open Decisions"
            note="Unresolved questions where your input changes direction"
            primary={primary}
          />
          <div className="p-5 rounded-lg" style={card}>
            <ol className="space-y-4">
              {OPEN_DECISIONS.map((decision, i) => (
                <li key={i} className="flex gap-4 text-sm">
                  <span style={{ color: primary, opacity: 0.5 }} className="shrink-0 font-medium">
                    {i + 1}.
                  </span>
                  <span style={{ opacity: 0.7 }} className="leading-relaxed">{decision}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* CTA */}
        <div
          className="p-6 rounded-lg text-center mb-12"
          style={{ backgroundColor: `${primary}10`, border: `1px solid ${primary}30` }}
        >
          <p className="text-sm mb-4" style={{ opacity: 0.55 }}>
            Have a structural reaction? A challenge? Bring it to the Studio.
          </p>
          <a
            href={`/fields/${master.slug}/studio`}
            className="inline-block py-3 px-8 rounded text-sm font-medium transition-opacity hover:opacity-80"
            style={{ backgroundColor: primary, color: bg }}
          >
            Open Studio
          </a>
        </div>

        {/* Footer nav */}
        <div
          className="pt-8 flex gap-6 text-sm border-t"
          style={{ borderColor: `${text}12`, opacity: 0.35 }}
        >
          <a href={`/fields/${master.slug}/audit`} className="hover:opacity-70 transition-opacity">
            Audit
          </a>
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

function SectionHeader({ label, note, primary }: { label: string; note: string; primary: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-medium mb-1">{label}</h2>
      <p className="text-xs" style={{ color: primary, opacity: 0.5 }}>{note}</p>
    </div>
  );
}
