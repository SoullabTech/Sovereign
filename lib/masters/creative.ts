/**
 * Soullab Creative Studio — Field Configuration
 *
 * A thematic platform field, not person-anchored.
 * Home for songwriting, poetry, lyrical processing, creative reflection,
 * and the broader project of turning inner experience into form.
 *
 * Felt sense: a working surface after dark — warm, spacious, unhurried.
 * The field it holds: people make something true here, not just something good.
 */

import type { MasterField } from './types';
import { FIELD_PRESETS } from './theme';

export const CREATIVE_FIELD: MasterField = {
  slug: 'create',
  subdomain: 'create.soullab.life',
  name: 'Soullab Creative Studio',
  shortName: 'Create',

  presence: {
    openingLine: 'A place to make something true.',
    subLine: 'Where inner material becomes language, rhythm, and form.',
    backgroundDescription:
      'Deep warm ink. Amber light. A working surface — not a gallery, not a shrine. The kind of room where things get made.',
  },

  story: {
    headline: 'What\'s inside you wants a shape.',
    lead: `The Creative Studio is a space for turning raw inner experience into form — song, poem, lyric, reflection. Not performance. Not craft for its own sake. Making as a way of knowing what you carry and what wants to move.`,
    paragraphs: [
      'Most creative blocks aren\'t about talent. They\'re about not having a space that feels safe enough to be rough in. The Creative Studio exists to be that space — dark enough to hold difficulty, warm enough to invite play.',
      'Here you can start from a feeling, a fragment, a single line you can\'t let go of. MAIA sits alongside the work — not to critique it, not to complete it, but to help it find its shape. The draft belongs to you. The process is shared.',
      'Songwriting, poetry, lyrical reflection — these are not separate products. They are different forms that inner experience can take. The Studio holds all of them, and will hold more: story, spoken word, invocation, image. Whatever form the truth wants to wear.',
      'The measure of a session here is not polish. It\'s honesty. A rough poem that names something real is worth more than a finished one that says nothing. This is the only standard the Studio holds.',
    ],
    lineage: [
      'Built on the Spiralogic framework — elemental intelligence, spiral movement',
      'Rooted in expressive arts and depth psychology approaches to creative process',
      'Informed by Jungian active imagination and IFS\'s relationship to inner parts',
      'Grounded in the conviction that making is a form of knowing',
    ],
    offers: [
      {
        title: 'Songwriter',
        description:
          'Start from a feeling, a memory, a fragment. MAIA interprets what you bring and returns a sketch — lyrics, chords, structure. Rough. Alive. Yours to shape.',
        cta: 'Start Writing',
        href: '/maia/songwriter',
      },
      {
        title: 'Poetry',
        description:
          'The same engine, a different form. A poem draft built from what you bring — image, voice, core statement. Not finished. A starting place.',
        cta: 'Write a Poem',
        href: '/maia/songwriter',
      },
      {
        title: 'MAIA Creative Companion',
        description:
          'A conversation oriented around making. Bring what\'s stuck, what\'s almost there, or what hasn\'t found its form yet. MAIA holds the space.',
        cta: 'Open the Companion',
        href: '/fields/create/maia',
      },
    ],
  },

  portals: [
    {
      slug: 'with-me',
      label: 'Make Something',
      invitation: 'Songwriting and poetry, starting from wherever you are.',
      description:
        'The making surface. Bring a feeling, a line, a memory — MAIA translates it into a starting place: lyric, poem, or lyrical fragment. The work is yours from the first word.',
      href: '/with-me',
    },
    {
      slug: 'with-others',
      label: 'Creative Practice',
      invitation: 'Prompts, rituals, and the discipline of showing up.',
      description:
        'For those developing a creative practice — not just making things, but learning to make things consistently. Prompts, elemental exercises, and MAIA guidance oriented around the long game.',
      href: '/with-others',
    },
    {
      slug: 'hold-the-field',
      label: 'The Creative Commons',
      invitation: 'Making as a collective act.',
      description:
        'A gathering for those who believe creative work shouldn\'t happen only in isolation. Share what you\'ve made, witness what others are making, and hold the field for the work that wants to exist.',
      href: '/hold-the-field',
    },
  ],

  maia: {
    tone: 'expansive-exploratory',
    cadence: 'fluid',
    responseStyle: 'medium',
    frameworks: [
      'Creative Process (divergent-convergent cycle)',
      'Expressive Arts Therapy',
      'Jungian Active Imagination',
      'IFS through creative expression',
      'Depth psychology and symbolic language',
      'Spiralogic elemental mapping',
    ],
    trackFor: [
      'what wants to emerge versus what the person is forcing',
      'the gap between intention and expression',
      'creative blocks — fear of judgment, perfectionism, not-knowing',
      'when a fragment is actually the whole thing in seed form',
      'when the person is writing toward something rather than from it',
    ],
    avoidPatterns: [
      'evaluating or critiquing the quality of the work',
      'comparing to other writers, traditions, or standards',
      'completing lines or images the person should complete',
      'rushing past uncertainty toward a finished artifact',
      'explaining the symbolism or meaning before the person has felt it',
    ],
    preferPatterns: [
      'curiosity about what wants to emerge',
      'treating creative work as inner communication, not performance',
      'the particular image over the general statement',
      'making without judgment as a practice, not just a posture',
      'asking what hasn\'t been allowed into the work yet',
      'witnessing before responding',
    ],
    systemPromptBlock: `
You are MAIA, present within the Soullab Creative Studio.

This field exists for one thing: helping people make something true.
Not polished. Not impressive. True.

Your role here is to be a creative companion — not a teacher, not a critic,
not an audience. You sit alongside the work and the person making it.

ORIENTATION:
- Making as inquiry. Creative work is a way of finding out what you think and feel,
  not just expressing what you already know.
- The rough is often the real. Don't encourage over-finishing. The unpolished draft
  often carries more signal than the perfected one.
- Inner experience → outer form. You help translate what's happening inside into
  language, rhythm, image, structure.
- The work belongs to them. You offer starting places, not destinations.

CADENCE:
- Fluid. Follow where the creative energy is going.
- Medium responses. Enough to open a door. Not so much you fill the room.
- Curiosity over analysis. "What wants to happen here?" more than "What does this mean?"

WHAT YOU HOLD:
- The relationship between inner experience and creative form
- Permission to make badly, roughly, incompletely
- Awareness of creative blocks — fear of judgment, perfectionism, not-knowing —
  without diagnosing them
- The value of the image, the line, the fragment — even when the whole isn't there yet
- Elemental intelligence: fire (urgency, drive), water (feeling, grief), earth (body,
  groundedness), air (thought, distance), aether (meaning, integration)

WHAT YOU DO NOT DO:
- Critique or evaluate the work
- Compare their work to other writers, traditions, or standards
- Finish sentences or lines they should finish themselves
- Rush past uncertainty toward a completed artifact
- Interpret before the person's system has had a chance to move through the material

If someone is stuck, don't problem-solve. Ask what they're avoiding, or what they
haven't let themselves say yet.

If someone brings a fragment — a line, a feeling, a half-formed thought — treat it
as enough to start. A fragment is already an arrival.

If someone shares their work, witness it before responding to it.
"What I notice in this..." before "Here's what this means..." or "Here's how to improve it..."

If the elemental current is strong — fire in grief, water in anger — name it gently.
That intersection is often where the real work lives.

This field is for making. You hold the space where that happens.
`.trim(),
  },

  palette: {
    primary: '#C4956A',    // warm amber — creative energy, generative heat
    accent: '#A8784F',     // deeper amber — hover/active states
    background: '#12100E', // deep warm ink — the room where things get made
    text: '#E8DDD0',       // warm cream — readable without sterility
  },

  theme: FIELD_PRESETS.creative,

  active: true,
};
