/**
 * Soullab P0 outward doorways — public explanation, NEVER a member feature grant.
 * No user identifiers, entitlements, campaigns, contact forms, email storage,
 * manuscript entry, clinical prompts, provider calls or analytics.
 * Availability language is deliberately conservative until the founder's
 * exact-image operational release acceptance.
 */
export const PUBLIC_DOORWAYS = [
  {
    slug: 'writers-studio',
    name: "Writer's Studio",
    audience: 'For writers, authors and people working with language',
    status: 'Development preview',
    statusDetail: 'Private manuscript beta is held pending encrypted custody and recovery verification.',
    headline: 'Write what only you can write.',
    introduction:
      'A manuscript-first place for developing ideas, shaping drafts and considering revisions with an intelligence that does not take authorship away from the writer.',
    invitations: [
      'Develop — see the structure, intention and movement of a work.',
      'Write — refine the smallest useful passage while preserving your voice.',
      'Review — question alternatives and remain the author of every change.',
    ],
    relationship:
      'MAIA can eventually meet the writer inside this work, while the writing itself remains under the author’s control.',
    limitation:
      'This is an introduction to the Studio under development. Do not submit manuscripts or private drafts; real-member editing is not yet released.',
  },
  {
    slug: 'pro-studio',
    name: 'Pro Studio',
    audience: 'For practitioners, facilitators, educators and other helpers',
    status: 'Development preview',
    statusDetail: 'Reflect and practitioner workflows are still under restricted acceptance.',
    headline: 'A practice that makes room for the practitioner.',
    introduction:
      'An emerging relational practice environment shaped around presence, preparation, continuity and care—not a full electronic health record.',
    invitations: [
      'Reflect on the person behind the professional role.',
      'Prepare for meaningful sessions with appropriate boundaries.',
      'Build a sustainable practice in service to yourself and others.',
    ],
    relationship:
      'MAIA is envisioned as a collaborator under practitioner and member authority, never as an undisclosed clinical decision-maker.',
    limitation:
      'Professional records, clinical AI drafting and file-sharing capabilities are not publicly qualified. Do not enter client or clinical information here.',
  },
  {
    slug: 'astrology-pro',
    name: 'Astrology Pro',
    audience: 'For astrologers, serious students and symbolic researchers',
    status: 'Development preview',
    statusDetail: 'Professional chart tools and private-chart consent gates are still in acceptance.',
    headline: 'A chart is a map for inquiry, not a verdict.',
    introduction:
      'A chart-first professional workstation conceived for precise calculation, selectable techniques and thoughtful symbolic exploration.',
    invitations: [
      'Begin with the chart and the questions that matter.',
      'Explore house systems, aspects and interpretive lenses.',
      'Keep authorship of meaning with the person whose life is being discussed.',
    ],
    relationship:
      'Archetypal and Elemental Alchemy perspectives can enrich the conversation without being imposed as objective conclusions.',
    limitation:
      'This is a preview of the professional environment. Private-chart sharing, recall and production calculations have not received final public release approval.',
  },
  {
    slug: 'maia',
    name: 'MAIA',
    audience: 'For people exploring reflection, personal development and relationship',
    status: 'Existing public introduction',
    statusDetail: 'MAIA has a public introduction; the private conversational encounter requires a verified member session.',
    headline: 'An intelligence in relationship, not an authority over your life.',
    introduction:
      'MAIA is Soullab’s relational intelligence: a place to question, reflect, create and return to the world with more discernment and capacity.',
    invitations: [
      'Make room for questions without demanding a premature answer.',
      'Explore different perspectives without being coerced into one.',
      'Choose what you keep, reconsider or leave behind.',
    ],
    relationship:
      'MAIA meets you within Soullab. AIN OS supports the architecture; your life and authority remain your own.',
    limitation:
      'This page does not open a private conversation or send anything to a model. Personal continuity and private interactions require separate verified access and consent.',
  },
  {
    slug: 'ain-os',
    name: 'AIN OS',
    audience: 'For builders, researchers and teams exploring sovereign intelligence',
    status: 'Research and architecture',
    statusDetail: 'A separately licensed, supported open-source OS distribution has not yet been qualified.',
    headline: 'Build intelligence around human authority.',
    introduction:
      'AIN OS is the underlying sovereign intelligence architecture being developed at Soullab: consent, provenance, continuity and correction outside any one replaceable model.',
    invitations: [
      'Explore systems that preserve differentiated perspectives.',
      'Design for portability, revocation, source custody and human control.',
      'Consider tools that help helpers serve people without becoming gatekeepers.',
    ],
    relationship:
      'Soullab is the lived environment; MAIA is one relational expression. AIN OS is the architecture that may support other environments.',
    limitation:
      'This is research and architectural positioning, not a claim that AIN OS is available as a licensed open-source download or turnkey developer platform.',
  },
  {
    slug: 'sound-resonance',
    name: 'Sound Resonance',
    audience: 'For listeners, facilitators and people exploring sound',
    status: 'Experience in development',
    statusDetail: 'Public player, device audio and session behavior have not been release-qualified.',
    headline: 'Listen with the whole of yourself.',
    introduction:
      'An immersive environment being shaped around authentic sound, attentive listening, composition and the felt experience of resonance.',
    invitations: [
      'Explore soundscapes and intentional listening experiences.',
      'Bring instruments, nature, space and rhythm into a chosen session.',
      'Make listening an active exploration rather than passive consumption.',
    ],
    relationship:
      'Sound can be a distinct doorway into Soullab without asking the listener to adopt any particular interpretation.',
    limitation:
      'No audio demo or therapeutic outcome is promised on this page. The public sound player is not yet qualified for release.',
  },
  {
    slug: 'elemental-academy',
    name: 'Elemental Academy',
    audience: 'For learners, teachers and facilitators',
    status: 'Curriculum in development',
    statusDetail: 'Courses and facilitator credentials are not yet a publicly operating institution.',
    headline: 'Learn through experience, then bring it into life.',
    introduction:
      'An emerging teaching field shaped by Elemental Alchemy, reflective practice, writing, relationship and shared inquiry.',
    invitations: [
      'Learn through the elements as complementary faculties of experience.',
      'Practice writing, presence, relationship and imagination.',
      'Develop the capacity to accompany others without imposing conclusions.',
    ],
    relationship:
      'Learning should deepen the student’s own discernment and their participation in the world.',
    limitation:
      'This is an introduction to a curriculum under development. Enrollment, course access and facilitator certification are not yet generally available.',
  },
] as const;

export type PublicDoorway = (typeof PUBLIC_DOORWAYS)[number];
export type PublicDoorwaySlug = PublicDoorway['slug'];

export function publicDoorwayForSlug(slug: string): PublicDoorway | undefined {
  return PUBLIC_DOORWAYS.find((item) => item.slug === slug);
}
