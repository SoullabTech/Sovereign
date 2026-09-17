import type { RelationalFieldPacket } from './types';

export function buildRelationalFieldShadowPrompt(packet: RelationalFieldPacket): string {
  const current = packet.evidence.find((e) => e.id === packet.currentEvidenceId);
  if (!current) throw new Error('current_evidence_missing');
  const evidenceLines = packet.evidence.map((e) => `${e.id}: ${JSON.stringify(e.text)}`).join('\n');
  return `Prepare ONE response plan for MAIA from this developed conversation arc.

CURRENT MEMBER TURN:
${JSON.stringify(current.text)}

MEMBER-AUTHORED EVIDENCE:
${evidenceLines}

Return ONLY JSON with exactly:
{"synthesis":[{"text":"...","basisEvidenceIds":["..."]}],"question":"..."}

Rules:
- Respond from the developed arc rather than restarting material already established.
- synthesis is MAIA's own perception and may be imaginative; write directly to the person using you/your or neutral nouns, never I/me/my/mine/myself and never member/the member.
- basisEvidenceIds identify the member evidence from which your perception arose; they do not certify your interpretation as fact.
- question should move into genuinely open territory rather than ask the person to restate what has already been developed.
- 1 synthesis, 1 question.`;
}

export function buildRelationalFieldPlanSchema(packet: RelationalFieldPacket): Record<string, unknown> {
  const ids = packet.evidence.map((e) => e.id);
  return {
    type: 'object',
    additionalProperties: false,
    required: ['synthesis', 'question'],
    properties: {
      synthesis: {
        type: 'array', minItems: 1, maxItems: 1,
        items: {
          type: 'object', additionalProperties: false,
          required: ['text', 'basisEvidenceIds'],
          properties: {
            text: { type: 'string' },
            basisEvidenceIds: {
              type: 'array', minItems: 1, maxItems: ids.length,
              items: { type: 'string', enum: ids },
            },
          },
        },
      },
      question: { type: 'string' },
    },
  };
}
