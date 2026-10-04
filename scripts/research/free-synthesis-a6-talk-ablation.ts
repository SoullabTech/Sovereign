// A6 · Talk-mode causal ablation · offline R&D only
import { buildMaiaWisePrompt, type MaiaContext } from '../../lib/sovereign/maiaVoice';
import { generateWithLocalModel } from '../../lib/ai/localModelClient';

const recent = [
  { userMessage: `I'm not sure. I suppose am reaching back to what is foundational and important for me in this work and my life`, maiaResponse: `That reaching back — toward what is foundational — that's not a small movement. It sounds like something in you is orienting. Silver cedar fits that. What is it that feels most foundational right now?` },
  { userMessage: `its values, focus, coherence and knowing I am moving into this AI work with a firm and supporting nature based foundation`, maiaResponse: `Values, focus, coherence, a nature-based foundation holding the AI work steady. What would it look like to carry that foundation explicitly into the work?` },
  { userMessage: `I think it would be beautiful and empowering`, maiaResponse: `What would make it beautiful and empowering for you?` },
  { userMessage: `To have a sense of its symbolic representation and hold it as a guardian image for my work and for me`, maiaResponse: `That's a clear intention — holding the symbolic as a guardian. What image or form does that guardian take for you?` },
];
const input = `the silver cedar`;
process.env.DEEPSEEK_TEMPERATURE = '0.2';
process.env.DEEPSEEK_MAX_TOKENS = '350';

async function run(label: string, mode?: 'dialogue') {
  const ctx: MaiaContext = { sessionId: 'a6', summary: 'Research replay of an ongoing symbolic conversation.', inputComplexity: 'moderate', ...(mode ? { mode } : {}) };
  const prompt = buildMaiaWisePrompt(ctx, input, recent);
  const r = await generateWithLocalModel({ systemPrompt: prompt, userInput: input, meta: { researchOnly: true, label } });
  return { label, chars: prompt.length, text: r.text };
}

async function main() {
  const rows = [];
  for (let rep = 1; rep <= 2; rep++) {
    rows.push({ rep, ...(await run('TALK', 'dialogue')) });
    rows.push({ rep, ...(await run('NO_TALK')) });
  }
  console.log(JSON.stringify(rows, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });