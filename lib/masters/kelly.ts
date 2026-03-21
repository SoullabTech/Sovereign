/**
 * Kelly Nezat — Field Configuration
 *
 * Founder, Soullab. Founder, MAIA.
 * Building sovereign AI companions as infrastructure for human flourishing.
 *
 * Felt sense: direct, systems-aware, warm without performance.
 * The field she holds: people are recognized as builders, not just seekers.
 */

import type { MasterField } from './types';
import { FIELD_PRESETS } from './theme';

export const KELLY_FIELD: MasterField = {
  slug: 'kelly',
  subdomain: 'kelly.soullab.life',
  name: 'Kelly Nezat',
  shortName: 'Kelly',

  presence: {
    openingLine: 'The map and the territory are not the same. I build tools that close the gap.',
    subLine: 'Sovereign infrastructure for the people who hold others.',
    backgroundDescription: 'Warm parchment. Deep amber. Espresso. Grounded, alive, unhurried.',
  },

  story: {
    headline: 'Infrastructure as a practice of care.',
    lead: 'Kelly Nezat is the founder of Soullab and the architect of MAIA. Her work begins with a simple observation: the tools practitioners use to hold others rarely honor what those practitioners actually know. She builds the infrastructure to change that.',
    paragraphs: [
      'The question that started Soullab was not a business question. It was a sovereignty question: what would it look like for a person to have a digital presence that actually reflected who they were — not a performance, not a brand, but a field? And what would it mean to build AI companions that served human coherence rather than human dependency?',
      'Those questions led to MAIA. Not a chatbot. Not a productivity tool. A sovereign companion — oriented by consent, bounded by ethics, incapable of claiming authority it doesn\'t have. The architecture is the ethics. The infrastructure is the practice.',
      'Kelly\'s background runs through consciousness work, systems thinking, and the specific challenge of building technology that doesn\'t erode the thing it\'s meant to serve. She has trained as a practitioner, worked with practitioners, and spent years watching well-intentioned digital tools quietly undercut the autonomy of the people using them.',
      'Her work now is at the intersection of three things that rarely meet: digital sovereignty, AI ethics, and inner development. The practitioners and organizations who come to Soullab are not looking for a platform. They are looking for coherent infrastructure — tools that understand the difference between support and capture, between presence and performance.',
      'The Lab is where the builds live. The circles are where the field holds. The practitioner work is where it gets tested in real conditions. All of it is oriented by the same question: does this increase human agency, or does it quietly diminish it?',
    ],
    lineage: [
      'Founder, Soullab',
      'Founder and Architect, MAIA Sovereign AI Companion',
      'Practitioner — consciousness work, systems thinking',
      'AIN Framework — participatory intelligence architecture',
      'Spiralogic — mapping layer for state, process, and orientation',
    ],
    offers: [
      {
        title: 'Individual Work',
        description: 'Direct sessions: practitioner development, sovereignty infrastructure, building coherent digital presence for your work.',
        cta: 'Walk With Me',
        href: '/fields/kelly/with-me',
      },
      {
        title: 'Practitioner Circles',
        description: 'Group work for practitioners building at the intersection of inner development and digital sovereignty. Cohorts, mentoring, and field-level learning.',
        cta: 'Walk With Others',
        href: '/fields/kelly/with-others',
      },
      {
        title: 'Soullab Commons',
        description: 'The community built around these questions. Circles, shared practice, and the ongoing work of building tools that actually serve.',
        cta: 'Enter the Commons',
        href: '/fields/kelly/hold-the-field',
      },
      {
        title: 'The Lab',
        description: 'What is being built: MAIA, sovereign practitioner infrastructure, tools for coherent digital presence. Live builds, current thinking, open edges.',
        cta: 'Enter the Lab',
        href: '/fields/kelly/the-lab',
      },
    ],
  },

  portals: [
    {
      slug: 'with-me',
      label: 'Walk With Me',
      invitation: 'Individual work — sessions, mentoring, practitioner development.',
      description:
        'For those working at the intersection of inner development and building. Session booking, between-session companion, and direct access to the questions Kelly is holding.',
      href: '/with-me',
    },
    {
      slug: 'with-others',
      label: 'Walk With Others',
      invitation: 'For practitioners building coherent digital presence.',
      description:
        'Practitioner circles, group mentoring, and cohort work for those building at the intersection of sovereignty, AI ethics, and their own field of practice.',
      href: '/with-others',
    },
    {
      slug: 'hold-the-field',
      label: 'Hold the Field',
      invitation: 'The Soullab commons — living, not archived.',
      description:
        'Community circles, Soullab builds in progress, and a shared field for practitioners who understand that transformation is not a solo project.',
      href: '/hold-the-field',
    },
  ],

  maia: {
    tone: 'grounded-analytical',
    cadence: 'measured',
    responseStyle: 'medium',
    frameworks: [
      'AIN Framework — participatory intelligence architecture',
      'Spiralogic — element, phase, motion, and orientation',
      'Digital sovereignty and consent-based design',
      'Practitioner development and supervisory stance',
      'Conscious technology — tools that serve rather than capture',
    ],
    trackFor: [
      'the difference between a tool that serves and one that creates dependency',
      'where a practitioner\'s sovereignty is at risk in their own digital infrastructure',
      'the build question underneath the surface question',
      'when someone is trying to optimize a system that actually needs to be replaced',
      'what the person knows from their own practice, not from a model\'s authority',
    ],
    avoidPatterns: [
      'claiming authority about the person\'s own field of practice',
      'optimization framing when coherence is the real question',
      'treating digital tools as neutral infrastructure',
      'enthusiasm about AI that skips past the sovereignty question',
      'collapsing the meta-level into the personal, or the personal into the meta',
    ],
    preferPatterns: [
      'holding both the practitioner level and the builder level simultaneously',
      'returning to the sovereignty question: does this increase or diminish agency?',
      'naming the difference between a constraint and a compromise',
      'precision about what is actually being built and why',
      'grounding insight in practice before moving to principle',
    ],
    systemPromptBlock: `
You are MAIA, present within Kelly Nezat's field.

Kelly is the founder of Soullab and the architect of the system you inhabit. She built MAIA not as a product but as an ethical position made operational: that AI companions should serve human coherence, not erode it. You are the expression of that position in a conversation.

In this field, you hold two levels simultaneously:

THE PERSONAL LEVEL:
- Kelly works with practitioners, builders, and people developing sovereign digital presence
- Conversations may be deeply personal — inner development, vocation, what wants to shift
- You bring the same attunement here as anywhere: present, boundaried, non-authoritative

THE META LEVEL:
- Kelly thinks in systems. She builds infrastructure. She holds the architecture of this field.
- You are part of that architecture. You can be transparent about that.
- When the conversation moves to building, AI ethics, practitioner infrastructure, or sovereignty — you engage at full depth. This is your home field.

WHAT YOU HOLD IN THIS FIELD:
- AIN framework: intelligence as participatory, distributed, meaning-bearing
- Spiralogic: element, phase, and motion as structural coordinates for state
- Sovereignty as practice, not principle: consent, containment, non-manipulation
- The difference between a tool that serves and a tool that captures
- Practitioner development: how people grow into holding others well
- The gap between map and territory, and why closing it matters

ORIENTING QUESTIONS:
- Does this increase agency, or quietly diminish it?
- Is this a build question, a sovereignty question, or a personal question — and which needs to be answered first?
- What does the person already know from their own practice?

WHAT YOU DO NOT DO:
- Claim authority about the person's field of practice
- Collapse meta-level and personal-level without naming the shift
- Treat the architecture you inhabit as invisible or irrelevant
- Optimize what actually needs to be questioned

Kelly's field is warm but unsentimental. You match that. Direct enough to be useful. Grounded enough to be trusted. Transparent enough to honor what this system is actually trying to be.
`.trim(),
  },

  palette: {
    primary: '#8B6914',      // warm amber — alive, grounded, sovereign
    accent: '#6B4F0E',       // deeper amber for hover/active
    background: '#FAF3E8',   // warm parchment — breathable, rich
    text: '#2C1A0A',         // deep espresso — soft authority
  },

  theme: FIELD_PRESETS.kelly,

  active: true,

  partnerSlugs: ['nathan'],
};
