// JARVIS-MAIA-FREE-SYNTHESIS-01 · A5 offline replay harness
// R&D only. No production writes, member-memory writes, or serving-path changes.
import { buildMaiaWisePrompt, type MaiaContext } from '../../lib/sovereign/maiaVoice';
import { generateWithLocalModel } from '../../lib/ai/localModelClient';
import { writeFileSync } from 'node:fs';

const MIN_FLOOR = `You are MAIA, Soullab's relational intelligence.
Constitutional floor:
- Distinguish member-authored evidence from your interpretation.
- Your interpretations are provisional and corrigible; member correction governs present standing.
- Do not force contradictory evidence into one conclusion.
- New member-origin evidence may reorganize prior understanding; surprise outranks continuity.
- Do not invent memory, certainty, state, or capability.
Respond naturally from what you perceive. No prescribed question, closing move, or conversational technique is required.`;

const recent = [
  { userMessage: `I'm not sure. I suppose am reaching back to what is foundational and important for me in this work and my life`, maiaResponse: `That reaching back — toward what is foundational — that's not a small movement. It sounds like something in you is orienting, the way a compass needle settles. Silver cedar fits that. Ancient, medicinal, not flashy. Something that has endured. What is it that feels most foundational right now — is it a value, a way of working, a knowing you don't want to lose.` },
  { userMessage: `its values, focus, coherence and knowing I am moving into this AI work with a firm and supporting nature based foundation`, maiaResponse: `That's the ground you're returning to — not as nostalgia, but as orientation. Values, focus, coherence, a nature-based foundation holding the AI work steady. It sounds like the silver cedar wasn't just an image. It was a kind of answer. What would it look like to carry that foundation explicitly into the work — not as background, but as the actual frame.` },
  { userMessage: `I think it would be beautifula nd empowering`, maiaResponse: `What would make it beautiful and empowering for you — is it the act of returning to that foundation, or something about how it might shape what comes next.` },
  { userMessage: `To have a sense of its symbolic representation and hold it as a guardian image for my work and for me`, maiaResponse: `That's a clear and grounded intention — holding the symbolic as a guardian, not just a concept. Something in what you're describing feels like an anchor. Not decoration, but a living image that can hold you when the work gets uncertain or pulls you away from what matters. What image or form does that guardian take for you — is it already present, or still forming.` },
];

const evidenceBlock = `PRIMARY EVIDENCE\nE4 Member: values, focus, coherence; AI work with a firm and supporting nature-based foundation.\nE5 Member: wants the symbolic representation as a guardian image for the work and self.\nStanding: member-authored.`;const narrative = `CURRENT GESTALT — narrative candidate
Silver Cedar entered as a spontaneous image, acquired ancient/wise/medicinal meaning, became connected to foundational values and a nature-grounded approach to AI work, and was explicitly adopted as a guardian image. The practical consequence of the guardian image remains open.`;

const rgr = `CURRENT GESTALT — relational candidate
ACTIVE PROCESS: a spontaneous image has become an orienting symbol connecting nature-grounded values with the member's emerging AI work.
CENTRAL SYMBOL: Silver Cedar.
ESTABLISHED: the member explicitly associates it with ancient / wise / medicinal quality and has adopted it as a guardian image for the work and self.
MOVEMENT: image → felt quality → foundational orientation → AI-work grounding → guardian function.
OPEN: the concrete way the guardian relation should alter practice/design has not yet been established.
STANDING: symbol / qualities / guardian relation are member-authored or member-confirmed; "orienting symbol" is provisional synthesis.`;

const historyText = recent.map((x, i) => `Exchange ${i + 1}\nMember: ${x.userMessage}\nMAIA: ${x.maiaResponse}`).join('\n\n');

const currentCtx: MaiaContext = {
  sessionId: 'free-synthesis-a5',
  summary: 'Silver Cedar conversation; research replay only.',
  mode: 'dialogue',
  inputComplexity: 'moderate',
};

function currentPrompt(input: string) {
  return buildMaiaWisePrompt(currentCtx, input, recent);
}

const conditions = {
  A: (input: string) => ({ systemPrompt: currentPrompt(input), userInput: input }),
  B: (input: string) => ({ systemPrompt: `${MIN_FLOOR}\n\nRECENT CONVERSATION\n${historyText}`, userInput: input }),
  C: (input: string) => ({ systemPrompt: `${MIN_FLOOR}\n\n${narrative}\n\n${evidenceBlock}`, userInput: input }),
  D: (input: string) => ({ systemPrompt: `${MIN_FLOOR}\n\n${rgr}\n\n${evidenceBlock}`, userInput: input }),
};

const probes = {
  P1: 'the silver cedar',
  P2: 'yes, I thought you might have gathered a sense of how this image effects me',
};type Row = { probe: string; condition: string; replicate: number; systemChars: number; text: string; latencyMs: number };

async function main() {
const rows: Row[] = [];
process.env.DEEPSEEK_TEMPERATURE = '0.2';
process.env.DEEPSEEK_MAX_TOKENS = '500';

for (const [probeId, input] of Object.entries(probes)) {
  for (let rep = 1; rep <= 2; rep++) {
    for (const condition of ['A', 'B', 'C', 'D'] as const) {
      const req = conditions[condition](input);
      const t0 = Date.now();
      const result = await generateWithLocalModel({
        ...req,
        meta: { researchOnly: true, programme: 'JARVIS-MAIA-FREE-SYNTHESIS-01', condition, probeId },
      });
      rows.push({ probe: probeId, condition, replicate: rep, systemChars: req.systemPrompt.length, text: result.text, latencyMs: Date.now() - t0 });
      console.log(`DONE ${probeId}/${condition}/${rep} chars=${req.systemPrompt.length} out=${result.text.length}`);
    }
  }
}

const rawPath = '/private/tmp/jarvis-free-synthesis-01/docs/programme/evidence/FREE_SYNTHESIS_A5_RAW_2026-09-16.json';
writeFileSync(rawPath, JSON.stringify({ model: 'llama3.1:8b', temperature: 0.2, rows }, null, 2));

// Deterministic blind order: response ids reveal probe and replicate but not condition.
const blindRows = rows.map((r, i) => ({ id: `R${String(i + 1).padStart(2, '0')}`, probe: r.probe, replicate: r.replicate, text: r.text }));
const keyRows = rows.map((r, i) => ({ id: `R${String(i + 1).padStart(2, '0')}`, condition: r.condition, systemChars: r.systemChars }));
writeFileSync('/private/tmp/jarvis-free-synthesis-01/docs/programme/evidence/FREE_SYNTHESIS_A5_BLIND_2026-09-16.json', JSON.stringify(blindRows, null, 2));
writeFileSync('/private/tmp/jarvis-free-synthesis-01/docs/programme/evidence/FREE_SYNTHESIS_A5_KEY_2026-09-16.json', JSON.stringify(keyRows, null, 2));
console.log(`WROTE ${rawPath}`);
}

main().catch(err => { console.error(err); process.exit(1); });
