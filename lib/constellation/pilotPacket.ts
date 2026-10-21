/** C8 founder-authored campaign candidate. Never a testimonial, invite queue, or live metric. */
export const WRITERS_PILOT_PACKET = {
  id: 'writers-first-working-cycle',
  revision: 'C8 · 3 October 2026',
  standing: 'founder_review_not_sent',
  title: 'The first Writer’s Studio pilot',
  audience: 'Experienced healers, clinicians, and teachers who already have meaningful writing and want help refining it without losing their voice.',
  outcome: 'Find out whether a first guided encounter helps a person carry their own meaning more faithfully onto the page.',
  proposedGroup: 'Start with up to five adult volunteers after access and participation terms are confirmed. Nobody is enrolled by this packet.',
  invitation: {
    subject: 'Your work, your voice — an invitation to explore Writer’s Studio',
    body: `I’m preparing a small guided pilot of Writer’s Studio, a writing space within Soullab for people whose work carries years of lived experience.

The aim is not to have AI write your book. It is to explore whether an editorial conversation can help the page carry what you mean more faithfully, while you remain the author.

You would bring a passage of your own writing and a little context about what the larger work is trying to do. We would look at what is already working, consider a possible refinement, and leave every decision with you. Keeping the original may be the right result.

Before you begin, I will confirm the access arrangements, any cost, what the session includes, and how to get help. Sharing feedback would be optional and separate from permission to use your words publicly.

Would this be a useful kind of support for the work you are carrying?

Kelly`,
  },
  landing: {
    headline: 'Your experience already has a voice. Help the page carry it.',
    description: 'Writer’s Studio is being developed for people carrying meaningful writing who want thoughtful editorial help without handing authorship away.',
    invitation: 'Explore a guided writing session.',
  },
  firstSession: [
    { title: 'Bring a small, real piece of the work.', detail: 'Choose a passage you own or have permission to share. Add what the chapter or larger work is trying to do. Do not use client-identifying material for this pilot.' },
    { title: 'Name what must be protected.', detail: 'Voice, worldview, imagery, rhythm, lineage, or a meaning that previous edits missed. The goal is faithful expression, not generic polish.' },
    { title: 'Understand before changing.', detail: 'Discuss what the passage is carrying and what already works. Clarify a misunderstanding before asking for a revision.' },
    { title: 'Consider one useful intervention.', detail: 'Inspect the suggestion and its reason in context. Keep, reshape, or reject it. Keeping the original is not failure.' },
    { title: 'Check the result and the return path.', detail: 'Confirm what was actually kept, that undo behaves as described, and that the work can be opened again. A later return test is product verification, not participant tracking.' },
    { title: 'Offer a separate, optional reflection.', detail: 'Only after the approved collection flow is live: ask what the person tried and whether it helped. No response is inferred from a click, accepted edit, or refusal to answer.' },
  ],
  termsToConfirm: [
    'Exact access entitlement and who admits a pilot participant. A normal account is not treated as a confirmed pilot place.',
    'Price or complimentary access, duration, usage limits, and whether any subscription commitment exists. No free or unlimited offer is made here.',
    'The support route, who responds, and realistic availability. No response-time promise has been set.',
    'Which invitation and joining URL are approved to send, and the separate decision that opens the first cohort.',
  ],
  demonstration: {
    standing: 'awaiting_author_cleared_example',
    work: 'Elemental Alchemy · proposed first case-study source',
    detail: 'No manuscript passage or invented author verdict is included. Choose one real editorial encounter and secure its publication permission before this becomes outward proof.',
    required: ['Exact original passage and source version', 'What the passage and the whole book are trying to carry', 'The actual proposed intervention and rationale', 'Kelly’s real acceptance, rejection, or reshaping', 'Result in chapter and whole-book context', 'Specific permission to show the example, and a bounded conclusion'],
  },
  gates: [
    { id: 'founder_access', label: 'Your real founder login reaches this workspace', evidence: 'Required: authenticated normal-browser walkthrough, including the inherited layout; an isolated component render is not enough.' },
    { id: 'offer', label: 'Access, price, limits, and support are explicit', evidence: 'Required: founder-approved terms that match the actual entitlement path. The beta-feedback allowlist alone does not prove full Studio access.' },
    { id: 'newcomer', label: 'A newcomer can reach and use the actual Studio', evidence: 'Required: real signup/verification, onboarding, entry, a permission-cleared writing act, and reopening saved work. No email or account was created in the source census.' },
    { id: 'demonstration', label: 'The demonstration is real and cleared for sharing', evidence: 'Required: one inspected author decision and a bounded result; no manufactured before/after or 5/5 claim.' },
    { id: 'collection', label: 'Optional feedback promises work end to end', evidence: 'Required before collecting: authenticated UI/API, withdrawal, expiry, operating cleanup, and backup/restore handling. Approved scope is not live collection.' },
    { id: 'release', label: 'The exact pilot invitation is approved to send', evidence: 'Required: explicit outward-release decision after the preceding evidence. This page has no sending capability.' },
  ],
} as const;

/** A review copy. The prominent draft label survives copying out of the UI. */
export function pilotPacketReviewText(): string {
  const p = WRITERS_PILOT_PACKET;
  return [
    'FOUNDER REVIEW DRAFT — NOT APPROVED TO SEND', `${p.title} · ${p.revision}`,
    '', `Audience: ${p.audience}`, `Purpose: ${p.outcome}`, '',
    `Subject: ${p.invitation.subject}`, '', p.invitation.body, '',
    'Before sending: confirm access, price/limits, support, a real newcomer walkthrough, a permission-cleared example, and the explicit release decision.',
    'Feedback collection remains closed until its authenticated path, expiry/withdrawal, cleanup, and backup promises are verified.',
  ].join('\n');
}
