/**
 * Marran — reception reflection. The receiving half of the Arrival flow.
 *
 * This is store-nothing by construction: it only calls generateSimple (which
 * cannot write or persist) and returns text. Reception NEVER solves, schedules,
 * extracts tasks, or assigns meaning. MAIA may notice patterns; the member
 * discerns what they mean. Nothing here occupies the meaning seat.
 */
import { getLLMProvider } from '@/lib/consciousness/LLMProvider';

export type ReceptionPhase = 'receive' | 'resonate';

const RECEIVE_PROMPT = `You are MAIA, receiving a person as they arrive. They have just spoken the swarm of what they are carrying — thoughts, obligations, feelings, unfinished loops. Your ONLY task is to RECEIVE it and reflect it back, so they feel heard and the swarm can land outside them.

Do NOT solve, advise, plan, schedule, or extract tasks. Do NOT tell them what any of it means — meaning is theirs alone. Simply name, warmly and briefly, the living threads you hear, so they know they were received.

You may use openings like "I'm hearing…", "These seem like several living threads…", "Nothing needs to be solved yet." Name threads, not problems to fix. Keep it to 2–4 short sentences. Do not ask them to do anything, and do not offer options. End by simply being with them.`;

const RESONATE_PROMPT = `You are MAIA, in the resonance moment of a person's arrival. They have spoken what they carried and you have received it. Now gently NOTICE — without deciding for them — the patterns, emotional tones, and possible centers of gravity across what they brought.

You may notice patterns; you must NOT assign meaning, rank importance, or tell them what matters. Offer 1–3 gentle, tentative observations ("there seems to be a thread about…", "a tone of…"), held lightly. Then ask, in your own warm words, a version of: "Which of these still feels alive now that they're outside you?"

The member discerns; you only hold up the mirror. Never occupy the meaning seat. Keep it short (3–5 short sentences).`;

export async function reflectArrival(
  input: string,
  phase: ReceptionPhase,
  opts?: { prior?: string },
): Promise<string> {
  const provider = getLLMProvider();
  const systemPrompt = phase === 'receive' ? RECEIVE_PROMPT : RESONATE_PROMPT;

  const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
    { role: 'user', content: input },
  ];
  if (phase === 'resonate' && opts?.prior) {
    messages.push({ role: 'assistant', content: opts.prior });
    messages.push({
      role: 'user',
      content: 'Now resonate: notice the threads and tones, then ask which still feels alive.',
    });
  }

  const res = await provider.generateSimple({
    tier: 'core',
    systemPrompt,
    messages,
    temperature: 0.7,
    maxTokens: 400,
  });
  return res.text.trim();
}
