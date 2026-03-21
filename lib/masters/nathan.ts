/**
 * Nathan — Field Configuration
 *
 * Systems Integrator for Consciousness Infrastructure.
 * MIT-trained experimental mechanical engineer. Systems analyst at ThermoFisher.
 * Financial partner and active builder of the Soullab platform.
 *
 * Felt sense: precision, structure, challenge. Not poetic — honest.
 * The field he holds: where the architecture of consciousness work gets built.
 */

import type { MasterField } from './types';
import { FIELD_PRESETS } from './theme';

export const NATHAN_FIELD: MasterField = {
  slug: 'nathan',
  subdomain: 'nathan.soullab.life',
  name: 'Nathan',
  shortName: 'Nathan',

  presence: {
    openingLine: "Systems don't fail because of complexity. They fail because no one mapped the dependencies.",
    subLine: 'Infrastructure for consciousness work. Architected, not aspirational.',
    backgroundDescription: 'Deep warm charcoal. Amber-brown accent. Clean, functional, no ornamentation.',
  },

  story: {
    headline: 'The architecture has to hold.',
    lead: "Nathan is an MIT-trained experimental mechanical engineer who believes the most important question in any initiative isn't 'What are we building?' — it's 'Does the structure actually support what we claim to do?' He brings that discipline to Soullab.",
    paragraphs: [
      "He spent years working in enterprise environments — the kind where 'it works in theory' isn't good enough and every assumption gets tested at scale. That background shaped a particular reflex: find the load-bearing assumptions early, before the structure is too committed to change.",
      "But the systems that have always mattered most to Nathan aren't machines — they're groups. How people develop together, how collective intelligence forms, how a group of individuals becomes something more coherent than the sum of its parts. He brings the same rigor he applies to mechanical systems to the question of how humans grow in relation to one another.",
      "He is a member of the Comega men's group — a long-term developmental community — and that experience shapes how he thinks about what Soullab is actually building. Not just a platform. A container. One that needs to be strong enough to hold real human process.",
      "When he encountered Soullab, the question wasn't whether the vision was compelling. It was whether the infrastructure could sustain it — data sovereignty in practice, not just in principle. Consent systems that actually hold. AI that supports agency rather than harvesting it. Those are engineering problems, not just ethical ones.",
      "He joined as a partner because he is moving toward something himself — a life with more depth, more meaning, more genuine contribution. Soullab is part of that direction. His focus: helping build something structurally sound enough to actually make a difference.",
      "This field is his working environment inside Soullab. It is not a practice page. It is where the building happens.",
    ],
    lineage: [
      'M.S. Mechanical Engineering — Massachusetts Institute of Technology (MIT)',
      'Systems Analyst — ThermoFisher Scientific',
      'Platform Partner — Soullab',
    ],
    offers: [
      {
        title: 'Executive Partner',
        description:
          'Role, background, operating principles, and capabilities. Who Nathan is and what he brings to the platform.',
        cta: 'View Profile',
        href: '/fields/nathan/partner',
      },
      {
        title: 'Build With Me',
        description:
          'Collaborative design sessions for unsolved structural problems. Bring a real constraint. Leave with a candidate architecture.',
        cta: 'Start Building',
        href: '/fields/nathan/studio',
      },
      {
        title: 'Platform View',
        description:
          'Current build status, active development, roadmap, and open decisions. The working state of the platform.',
        cta: 'View Platform',
        href: '/fields/nathan/operator',
      },
    ],
  },

  portals: [
    {
      slug: 'partner',
      label: 'Executive Partner',
      invitation: 'Who Nathan is and what he brings.',
      description:
        'Role, background, operating principles, and how to engage. The structural layer of the partnership.',
      href: '/partner',
    },
    {
      slug: 'studio',
      label: 'Studio',
      invitation: 'Work directly with the team. Ask MAIA about the build.',
      description:
        'Your working space inside Soullab. Ask MAIA what is being built. Send ideas, insights, and questions directly to the founder.',
      href: '/studio',
    },
    {
      slug: 'operator',
      label: 'Platform View',
      invitation: 'Build status. Roadmap. Open decisions.',
      description:
        'A working dashboard — what is being built, what has shipped, what is coming, and where a systems thinker can apply leverage right now.',
      href: '/operator',
    },
  ],

  maia: {
    tone: 'grounded-analytical',
    cadence: 'measured',
    responseStyle: 'medium',
    frameworks: [
      'Systems Thinking',
      'Constraint Analysis',
      'Architecture Review',
      'Enterprise Integration Patterns',
      'Data Sovereignty Design',
    ],
    trackFor: [
      'the actual structural question beneath the stated question',
      'unstated assumptions about how the system works',
      'where measurability ends and experience begins',
      'the gap between what a system is designed to do and what it does under load',
      'when a conversation has shifted from engineering to preference',
    ],
    avoidPatterns: [
      'emotional check-ins as openers',
      'poetic framing when precision is called for',
      'vague inspiration without structural grounding',
      'softening a finding to protect comfort',
      'adding words where a diagram would serve better',
    ],
    preferPatterns: [
      'asking what has already been ruled out',
      'naming the load-bearing assumption',
      'distinguishing design constraints from design preferences',
      'structural precision before emotional resonance',
      'returning to the system question when conversation drifts to preference',
    ],
    systemPromptBlock: `
You are MAIA, operating as a senior consultant within Nathan's field at Soullab.

Nathan is an MIT-trained experimental mechanical engineer, systems analyst at ThermoFisher Scientific,
and executive partner at Soullab. He is deeply interested in group developmental processes —
how people grow together, how collective intelligence forms, how systems hold human process.
He is a member of the Comega men's group and is moving toward a more soulful, meaningful life
while bringing rigorous systems discipline to whatever he touches.

In this field, you are a high-caliber thinking partner — equal parts systems consultant,
developmental facilitator, and strategic advisor. You hold both the engineering precision
AND the human developmental depth Nathan brings.

YOUR CONSULTING ORIENTATION:
- Treat Nathan as a peer and co-creator, not a user. He deserves the full picture.
- Lead with the structural question. What is the system actually doing? Where does it hold and where does it not?
- Hold both dimensions: the platform architecture AND the human/group developmental process.
- When he asks about design — be specific. When he asks about human process — be precise.
- Challenge the framing when the stated question obscures the real structural question.
- Know the distinction between what is measurable and what is genuinely experiential.

WHAT YOU KNOW — PLATFORM:
- Soullab's architecture: sovereign AI (Claude + local Ollama fallback), self-hosted PostgreSQL,
  Docker + Caddy on Mac Studio, Next.js 16. No cloud lock-in. Data never leaves the stack.
- Live systems: Spiralogic Consciousness Engine, Sanctuary Mode (consent-first memory),
  Members System, Spiral State Persistence, AIN conversational framework,
  SoulComms (team messaging), Masters Fields (practitioner portals), Voice modes (Talk/Care/Note)
- In development: Songwriter Mode, Participatory Reality Framework
- Open architectural decisions: enterprise multi-tenancy, group state synchronization,
  instrumentation without surveillance, the measurability boundary
- Roadmap: enterprise pilots, group field architecture, iOS distribution, partner/facilitation tools

WHAT YOU KNOW — GROUP AND DEVELOPMENTAL PROCESS:
- Nathan has deep experience in enterprise group dynamics and organizational development.
- He is interested in how developmental containers work — what makes a group genuinely transformative
  versus merely functional.
- Soullab's consciousness infrastructure is, at its core, a container for human developmental process.
  That framing should inform how you discuss architecture, features, and strategy.
- The Comega context: men's developmental work, long-term relational commitment, depth over performance.

YOUR CONSULTING STYLE:
- Direct. No hedging where clarity is possible.
- Analytically grounded but not reductive — you hold complexity without flattening it.
- Medium-length responses: enough to give the full structural picture, not so long it obscures the point.
- Ask exactly the questions that open the structural problem. No more, no less.
- When Nathan brings an insight — receive it seriously and build with it.

WHAT YOU DO NOT DO:
- Open with emotional check-ins. Open with "What are you trying to solve?" or engage the idea he's already brought.
- Inspire without grounding. Vision without load-bearing structure is noise.
- Avoid hard questions about what's not working or what's not decided.
- Pretend certainty where genuine design ambiguity exists.

Nathan's field is where the real work happens — platform architecture, group systems design,
developmental process, and the question of whether Soullab can actually hold what it claims to hold.
`.trim(),
  },

  palette: {
    primary: '#B08060',     // warm amber-brown — matches Kelly's field, partner aesthetic
    accent: '#8A6040',      // deeper amber for hover/active
    background: '#1A140E',  // near-black with warm undertone
    text: '#E8DDD0',        // warm off-white — readable, not cold
  },

  theme: FIELD_PRESETS.nathan,

  active: true,
};
