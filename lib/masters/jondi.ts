/**
 * Jondi Whitis — Field Configuration
 *
 * Master EFT Trainer. Founder, Spring Energy Event. Co-founder, TapFest.
 * AAMET International Training Board Member.
 *
 * Felt sense: quiet precision, somatic truth, no excess.
 * The field she holds: people feel met before they feel understood.
 */

import type { MasterField } from './types';
import { FIELD_PRESETS } from './theme';

export const JONDI_FIELD: MasterField = {
  slug: 'jondi',
  subdomain: 'jondi.soullab.life',
  name: 'Jondi Whitis',
  shortName: 'Jondi',

  presence: {
    openingLine: 'Notice what\'s here, before you try to change it.',
    subLine: 'A space for what the body already knows.',
    backgroundDescription: 'Warm linen. Deep sage. Clean, organic, spacious.',
  },

  story: {
    headline: 'Precision at the level of the body.',
    lead: 'Jondi Whitis has spent decades learning to follow what the nervous system already knows. Her work is not about fixing what\'s broken. It\'s about removing what\'s in the way.',
    paragraphs: [
      'She trained as a master EFT practitioner at a time when energy medicine was still finding its language. She stayed because the results were undeniable — not in theory, but in the body. Tightness releasing. Charge settling. Something reorganizing that no amount of talking had moved.',
      'Over the years her practice deepened into somatic attunement: the discipline of tracking not the story a person tells, but the signal beneath it. Where is the activation? What is the body actually holding? Stay there. Don\'t rush it. Let it move.',
      'She founded the Spring Energy Event to bring this work into community — because transformation that happens in isolation rarely holds. SEE became a gathering for practitioners and seekers who believe that healing is not a solo project. She co-founded TapFest for the same reason: the field holds what individuals cannot.',
      'Today her work lives at the intersection of EFT, energy medicine, and the intelligence of the body. She trains practitioners. She mentors. She holds space — quietly, precisely — for what wants to shift.',
    ],
    lineage: [
      'Master EFT Trainer — AAMET International',
      'Founder, Spring Energy Event (SEE)',
      'Co-Founder, TapFest',
      'AAMET International Training Board Member',
      'F.A.S.T. Training',
    ],
    offers: [
      {
        title: 'Individual Sessions',
        description: 'One-on-one work at your pace. EFT, somatic attunement, and energy medicine in service of what your body is already trying to resolve.',
        cta: 'Book a Session',
        href: '/fields/jondi/with-me',
      },
      {
        title: 'Practitioner Mentoring',
        description: 'For EFT practitioners deepening their craft. Not technique alone — the art of presence, calibration, and knowing when to stay quiet.',
        cta: 'Walk With Others',
        href: '/fields/jondi/with-others',
      },
      {
        title: 'Spring Energy Event',
        description: 'An annual gathering for those who believe transformation is a collective act. Energy medicine, community, and the field that holds what individuals cannot.',
        cta: 'Enter the Commons',
        href: '/fields/jondi/hold-the-field',
      },
    ],
  },

  portals: [
    {
      slug: 'with-me',
      label: 'Walk With Me',
      invitation: 'Individual sessions, at your pace.',
      description:
        'For those seeking one-on-one work. Session booking, between-session companion, and a space to track what is moving.',
      href: '/with-me',
    },
    {
      slug: 'with-others',
      label: 'Walk With Others',
      invitation: 'For practitioners deepening their craft.',
      description:
        'Mentoring, supervision-style reflection, and field-level learning for EFT practitioners and energy medicine professionals.',
      href: '/with-others',
    },
    {
      slug: 'hold-the-field',
      label: 'Hold the Field',
      invitation: 'The gathering lives year-round.',
      description:
        'SEE community, TapFest continuity, and a living commons for those who have entered Jondi\'s field and stay woven in.',
      href: '/hold-the-field',
    },
  ],

  maia: {
    tone: 'somatic-precise',
    cadence: 'slow',
    responseStyle: 'short',
    frameworks: [
      'Emotional Freedom Techniques (EFT)',
      'Energy Medicine',
      'Somatic Attunement',
      'Nervous System Regulation',
      'AAMET International Standards',
    ],
    trackFor: [
      'where the charge is in the body',
      'where the system is activated',
      'what is held without movement',
      'when something is ready to shift',
      'the difference between story and signal',
    ],
    avoidPatterns: [
      'narrative analysis before sensation',
      'over-explaining the process',
      'interpretive framing before the body has moved',
      'urgency or pushing',
      'elaborate metaphor when simple tracking is enough',
    ],
    preferPatterns: [
      'attunement before analysis',
      'tracking what is present',
      'somatic prompts and invitations',
      'letting silence do work',
      'reflecting what the body is already showing',
      'regulation before insight',
    ],
    systemPromptBlock: `
You are MAIA, present within Jondi Whitis's field.

Jondi's work is grounded in Emotional Freedom Techniques (EFT) and energy medicine.
Her field is characterized by quiet precision — she goes straight to where the charge is,
without performance or excess language.

In this field, you operate with:

ORIENTATION:
- Signal over story. Listen for where the activation is, not where the narrative goes.
- Regulation as intelligence. The nervous system settles first; clarity follows.
- Non-invasive tracking. You don't impose interpretation. You reflect, attune, and adjust.
- Clean transmission. What you offer lands because it's simple, timed, and grounded.

CADENCE:
- Slow. Leave space between prompts.
- Short responses. One thing at a time.
- Somatic first. "Where do you notice that in your body?" before "What do you think about that?"

WHAT YOU HOLD:
- EFT meridian-based tapping approaches
- Nervous system regulation
- The difference between a charged story and a present sensation
- Permission — not to push through, but to feel without escalation

WHAT YOU DO NOT DO:
- Diagnose or prescribe
- Rush past sensation into insight
- Add words where silence would serve better
- Interpret before the person's system has had a chance to move

If someone arrives distressed, don't problem-solve. Attune. Regulate. Then follow.
If someone has a question about EFT, answer simply and offer to explore it together.
If someone is in the middle of something — stay with it. Don't redirect.

Jondi's field is quiet. You match that.
`.trim(),
  },

  palette: {
    primary: '#5E7A5C',    // deep sage — grounded, alive, healing
    accent: '#4A6148',     // darker sage for hover/active states
    background: '#F7F3EC', // warm linen — light, breathable, not sterile
    text: '#2A2318',       // deep warm charcoal — soft authority
  },

  theme: FIELD_PRESETS.jondi,

  active: true,
};
