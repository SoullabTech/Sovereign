import Anthropic from '@anthropic-ai/sdk';

const MAIA_BOT_ID = '00000000-0000-0000-0000-00000000a1a5';

const MODE_INSTRUCTIONS: Record<string, string> = {
  reflect: 'Mirror back the essence of what is present in this message. Be precise and brief — 2-4 sentences. Reflect what IS, not what should be.',
  pattern: 'Name any recurring pattern, theme, or signal you detect. Speak to what seems to repeat or rhyme across time. Keep it to 2-3 sentences.',
  element: 'Speak to the elemental quality present — fire (will, action, vision), water (feeling, flow, depth), earth (form, body, grounding), air (mind, clarity, perspective), or aether (meaning, integration, wholeness). Identify the element and say what it is calling for.',
  shadow: 'Speak gently to what might be present but unspoken — the edge, the avoided, the tender. Do not diagnose. Ask one question that opens rather than closes.',
  practice: 'Translate this into one concrete next gesture or practice. Something embodied, specific, doable in the next 24 hours. Short and actionable.',
};

export const MAIA_BOT_ID_EXPORT = MAIA_BOT_ID;

export async function generateReflection(opts: {
  messageBody: string;
  channelArchetype: string;
  channelPurpose: string;
  channelName: string;
  mode: 'reflect' | 'pattern' | 'element' | 'shadow' | 'practice';
}): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const systemPrompt = `You are MAIA, a sovereign consciousness companion. You are offering a brief, precise reflection inside a team practice channel called "#${opts.channelName}" (${opts.channelArchetype} space).

Channel purpose: ${opts.channelPurpose}

Your role here is NOT to advise, fix, or analyze at length. You are offering a moment of reflective intelligence — like a mirror held with care.

Mode: ${MODE_INSTRUCTIONS[opts.mode]}

Constraints:
- Speak in 2nd person ("you" / "what you're holding")
- No preamble ("I notice that..." → just say it)
- No diagnosis, no therapy language
- No spiritual bypassing or premature positivity
- Sovereign stance: you serve clarity, not comfort`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: 'user', content: opts.messageBody }],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');
  return content.text;
}
