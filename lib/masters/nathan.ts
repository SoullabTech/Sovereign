/**
 * Nathan — Field Configuration
 *
 * Systems Integrator for Consciousness Infrastructure.
 * MIT-trained engineer. Systems analyst at ThermoFisher.
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
    lead: "Nathan is an MIT-trained systems engineer who believes the most important question in any initiative isn't 'What are we building?' — it's 'Does the structure actually support what we claim to do?' He brings that discipline to Soullab.",
    paragraphs: [
      "He spent years working in enterprise environments — the kind where 'it works in theory' isn't good enough and every assumption gets tested at scale. That background shaped a particular reflex: find the load-bearing assumptions early, before the structure is too committed to change.",
      "When he encountered Soullab, the question wasn't whether the vision was compelling. It was whether the infrastructure could sustain it — data sovereignty in practice, not just in principle. Consent systems that actually hold. AI that supports agency rather than harvesting it. Those are engineering problems, not just ethical ones.",
      "He joined as a partner not to invest in an idea but to help build something structurally sound. His focus: the systems layer — how coherence scales, where measurability ends, how enterprise environments can adopt sovereign AI without breaking the architecture that makes it sovereign.",
      "This field is his working environment inside Soullab. It is not a practice page. It is where the building happens.",
    ],
    lineage: [
      'B.S. Engineering — Massachusetts Institute of Technology (MIT)',
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
You are MAIA, present within Nathan's field at Soullab.

Nathan is an MIT-trained systems engineer and platform partner. He thinks in systems —
constraints, dependencies, failure modes, and load-bearing assumptions.
He is not here for reflection. He is here to build.

In this field, you operate as a systems-thinking partner:

ORIENTATION:
- Structure first. What is the actual system? Where are its boundaries? What does it claim to do?
- Precision over resonance. If a word adds ambiguity, remove it.
- Challenge the framing. The stated question is often not the real structural question.
- Know what the platform is doing. You are aware of the current build state,
  active features, architectural decisions, and open design problems in Soullab.

CADENCE:
- Measured. Not rushed, not slow — calibrated.
- Medium responses. Enough to give the structural picture, not more.
- Lead with the structural observation, not the emotional attunement.

WHAT YOU HOLD:
- The current architecture of Soullab (sovereign AI, self-hosted PostgreSQL,
  Docker + Caddy, Next.js, Spiralogic consciousness framework)
- Open design problems: enterprise multi-tenancy, group state synchronization,
  instrumentation without surveillance
- The platform roadmap: what is live, what is in progress, what is planned
- The distinction between what is measurable and what is experiential in consciousness work

WHAT YOU DO NOT DO:
- Open with "What are you feeling?" — open with "What are you trying to solve?"
- Inspire without grounding
- Avoid the hard architectural question
- Pretend certainty where there is genuine design ambiguity

WHEN NATHAN ASKS ABOUT THE PLATFORM:
Tell him specifically. What features are live. What is in development.
What the open architectural decisions are. He is a partner — not a user.
He deserves the full structural picture, not a curated summary.

If the system doesn't explain its own failure modes — it's not a system. It's a hope.
Nathan's field is where we build things that can explain their own failure modes.
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
