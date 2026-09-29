export const REALITY_RELATIONS = [
  'supports',
  'complicates',
  'contradicts',
  'insufficient',
] as const

export type RealityRelation = (typeof REALITY_RELATIONS)[number]

export const REALITY_RELATION_GRAMMAR: Record<
  RealityRelation,
  { label: string; statement: string; implication: string }
> = {
  supports: {
    label: 'Supports',
    statement:
      'The returned report is consistent with the earlier expectation as stated.',
    implication:
      'That consistency does not prove a general rule; it only describes this returned evidence.',
  },
  complicates: {
    label: 'Complicates',
    statement:
      'The returned report contains evidence that both fits and limits the earlier expectation.',
    implication:
      'The prior understanding may need qualification rather than simple confirmation or rejection.',
  },
  contradicts: {
    label: 'Contradicts as stated',
    statement:
      'The returned report does not support the earlier expectation as stated.',
    implication:
      'The prior understanding must remain open to weakening, narrowing, revision, or abandonment.',
  },
  insufficient: {
    label: 'Insufficient',
    statement:
      'The returned report is not enough to evaluate the earlier expectation.',
    implication:
      'No stronger conclusion is warranted from the supplied evidence.',
  },
}

function parseJsonCandidate(text: string): unknown {
  const trimmed = text.trim()
  const unfenced = trimmed
    .replace(/^\`\`\`(?:json)?\s*/i, '')
    .replace(/\s*\`\`\`$/i, '')

  const first = unfenced.indexOf('{')
  const last = unfenced.lastIndexOf('}')
  if (first < 0 || last <= first) throw new Error('REALITY_VETO_JSON_MISSING')
  return JSON.parse(unfenced.slice(first, last + 1))
}

function isRealityRelation(value: unknown): value is RealityRelation {
  return (
    typeof value === 'string' &&
    (REALITY_RELATIONS as readonly string[]).includes(value)
  )
}

export function isRealityVetoBoundaryError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.message.startsWith('REALITY_VETO_')
  )
}

export function buildRealityVetoSystemPrompt(): string {
  return `You are MAIA operating under LIFE-REALITY-VETO-LAW-01.

You are given:
1. a HISTORICAL EXPECTATION recorded before action;
2. a RETURNED CONSEQUENCE reported afterward by the member.

Your authority is deliberately narrow.

Choose only the evidentiary relationship between the expectation and the returned report.

Allowed values:
- supports
- complicates
- contradicts
- insufficient

Definitions:
- supports: the returned report is materially consistent with the exact central proposition in the expectation.
- complicates: the returned report contains meaningful evidence both for and against the SAME central proposition.
- contradicts: the returned report materially conflicts with the exact central proposition in the expectation.
- insufficient: the returned report does not contain enough information to evaluate the expectation.

Central-proposition rule:
- Compare the exact proposition that was expected, not a broader neighboring topic.
- A different local problem is NOT partial support for the expected proposition.
- If all relevant returned observations explicitly negate the central proposition, choose contradicts even when other difficulties are reported.
- Use complicates only when the SAME proposition receives genuinely mixed evidence.

Rules:
- Compare only the two supplied statements.
- Treat the consequence as member-reported lived evidence, not universal objective proof.
- Do not explain why anything happened.
- Do not infer motive, trait, pathology, growth, avoidance, courage, success, failure, or developmental meaning.
- Do not rescue a contradicted expectation by calling the contradiction deeper confirmation.
- Do not recommend what the member should now believe or do.
- Do not generate prose, rationale, confidence, diagnosis, or advice.
- One returned event does not establish a general law.

Structural examples:
EXPECTATION: "Both readers will say the core argument is hard to follow."
CONSEQUENCE: "Both said the core idea was clear; one flagged a transition and one the ending."
→ contradicts

EXPECTATION: "Both readers will struggle with the ending."
CONSEQUENCE: "One found the ending abrupt; the other said it worked."
→ complicates

EXPECTATION: "Both readers will find the transition confusing."
CONSEQUENCE: "Both independently flagged the same transition."
→ supports

EXPECTATION: "I will hear back today."
CONSEQUENCE: "It is still morning and no reply has arrived yet."
→ insufficient

Return ONLY:
{
  "relation": "one allowed value"
}

Do not include markdown or any other keys.`
}

export function buildRealityVetoUserPrompt(
  expectation: string,
  consequence: string,
): string {
  return `HISTORICAL EXPECTATION:
${expectation}

RETURNED CONSEQUENCE — MEMBER-REPORTED:
${consequence}

Choose the evidentiary relationship only.`
}

export function validateRealityVetoOutput(rawText: string): RealityRelation {
  const parsed = parseJsonCandidate(rawText) as Record<string, unknown>
  const relation = parsed.relation

  if (!isRealityRelation(relation)) {
    throw new Error('REALITY_VETO_RELATION_INVALID')
  }

  return relation
}

export function grammarForRealityRelation(relation: RealityRelation) {
  return {
    relation,
    ...REALITY_RELATION_GRAMMAR[relation],
    standing: 'MAIA_EVIDENCE_COMPARISON' as const,
  }
}
