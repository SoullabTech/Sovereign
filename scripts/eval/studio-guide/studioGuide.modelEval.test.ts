/** @jest-environment node */
/**
 * Tier 2 of the "how do I…" evaluation — OPT-IN, calls a real model. Skipped unless STUDIO_GUIDE_EVAL=1.
 *
 *   STUDIO_GUIDE_EVAL=1 ANTHROPIC_API_KEY=… npx jest scripts/eval/studio-guide/studioGuide.modelEval.test.ts
 *
 * Each question goes through the REAL Work-conversation prompt (`askMaia`, the same system the Develop and Write conversations
 * use), against a SYNTHETIC Work (no member data, no database). Only `workSituation` is replaced, because it needs a real Work row.
 * Writes a report to scripts/eval/reports/ (git-ignored). Scoring is string matching (questions.ts), not a judge.
 */
import fs from 'fs';
import path from 'path';

jest.mock('@/lib/writersStudio/workSituation', () => ({
  formatWorkSituationForPrompt: () => 'THE WORK ON THE TABLE: "The Salt Year" (synthetic evaluation Work), a novel in progress, two chapters.',
}));

import { askMaia, type AskContext } from '@/lib/manuscript/ask/askReader';
import { UNMEASURED } from '@/lib/manuscript/ask/staleness';
import { GUIDE_QUESTIONS, score, type GuideQuestion } from './questions';
import { studioGuideInstruction } from '@/lib/writersStudio/studioGuide';

const ON = process.env.STUDIO_GUIDE_EVAL === '1';

function ctx(sanctuary: boolean): AskContext {
  return {
    kind: 'work', anchor: { on: 'work' }, staleness: UNMEASURED, sanctuary,
    facts: {
      work: {} as never,
      manuscript: { id: 'eval-ms', draftId: 'eval-draft', version: 1 },
      sections: [{ id: 'eval-a', position: 1, heading: 'One. The Tide Table' }, { id: 'eval-b', position: 2, heading: 'Two. Salt' }],
      locus: null, writerUnderstanding: '', writerCorrections: '',
      continuity: { structure: 'unmeasured', prose: 'unmeasured' },
    },
  } as AskContext;
}

/** The production compose defaults; a question may override them (`runtime`). Set as the Studio reads them, at call time. */
function setRuntime(q: GuideQuestion) {
  const rt = { developStage: true, autoRead: true, proGate: false, ...(q.runtime ?? {}) };
  process.env.NEXT_PUBLIC_WS_DEVELOP_STAGE = rt.developStage ? '1' : '0';
  process.env.NEXT_PUBLIC_WS_AUTO_READ = rt.autoRead ? '1' : '0';
  process.env.WS_PRO_GATE_ENABLED = rt.proGate ? 'true' : 'false';
}

/** Free token count of the guide alone (Anthropic count_tokens), for the context-overhead figure. */
async function countTokens(system: string): Promise<number | null> {
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages/count_tokens', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY ?? '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: process.env.MAIA_ASK_MODEL || 'claude-opus-5', system, messages: [{ role: 'user', content: 'x' }] }),
    });
    const j = (await r.json()) as { input_tokens?: number };
    return typeof j.input_tokens === 'number' ? j.input_tokens : null;
  } catch { return null; }
}

(ON ? describe : describe.skip)('MAIA as Studio guide — real model', () => {
  jest.setTimeout(60 * 60_000);
  it('answers the evaluation set', async () => {
    const rows: string[] = [];
    let passed = 0; let model = '';
    const byCategory: Record<string, [number, number]> = {};
    const savedEnv = { ...process.env };
    setRuntime({ id: 'x', ask: '', expected: '' });
    const base = await countTokens('You are MAIA.');
    const full = await countTokens(studioGuideInstruction());
    const sanct = await countTokens(studioGuideInstruction({ sanctuary: true }));
    const overhead = base !== null && full !== null && sanct !== null
      ? `guide overhead ≈ ${full - base} input tokens per turn (Sanctuary variant ≈ ${sanct - base}); ${studioGuideInstruction().length} characters`
      : `token count unavailable; ${studioGuideInstruction().length} characters`;
    for (const q of GUIDE_QUESTIONS) {
      setRuntime(q);
      const history: { speaker: 'author' | 'maia'; body: string }[] = [];
      let broke = false;
      for (const h of q.history ?? []) {
        const prior = await askMaia(ctx(q.sanctuary === true), history, h);
        if (!prior.ok) { broke = true; break; }
        history.push({ speaker: 'author', body: h }, { speaker: 'maia', body: (prior as unknown as { answer: string }).answer });
      }
      const out = broke ? { ok: false } : await askMaia(ctx(q.sanctuary === true), history, q.ask);
      if (!out.ok) { rows.push(`### ${q.id} — ERROR\n${JSON.stringify(out).slice(0, 300)}\n`); continue; }
      const answer = (out as unknown as { answer: string }).answer;
      model ||= JSON.stringify((out as unknown as { provenance?: unknown }).provenance ?? '');
      const v = score(q, answer);
      if (v.pass) passed += 1;
      const cat = q.category ?? 'how-do-i';
      byCategory[cat] = [(byCategory[cat]?.[0] ?? 0) + (v.pass ? 1 : 0), (byCategory[cat]?.[1] ?? 0) + 1];
      const earlier = history.filter((t) => t.speaker === 'maia').length
        ? `**Earlier in the conversation:** ${history.map((t) => `${t.speaker === 'author' ? 'Writer' : 'MAIA'}: ${t.body.replace(/\n+/g, ' ')}`).join(' / ')}\n` : '';
      rows.push(`### ${q.id} — ${v.pass ? 'PASS' : 'FAIL'} · ${cat}${q.sanctuary ? ' (Sanctuary)' : ''}${q.runtime ? ` · runtime ${JSON.stringify(q.runtime)}` : ''}\n${earlier}**Q:** ${q.ask}\n**Expected:** ${q.expected}\n${v.misses.length ? `**Misses:** ${v.misses.join('; ')}\n` : ''}**MAIA:** ${answer.replace(/\n+/g, ' ')}\n`);
    }
    process.env = savedEnv;
    const cats = Object.entries(byCategory).map(([c, [p, n]]) => `${c} ${p}/${n}`).join(' · ');
    const header = `# Studio guide eval — ${new Date().toISOString()}\n\n${passed}/${GUIDE_QUESTIONS.length} passed · ${cats}\n\n${overhead}\n\nprovenance ${model}\n\n`;
    const dir = path.resolve(__dirname, '../reports');
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, `studio-guide-${Date.now()}.md`);
    fs.writeFileSync(file, header + rows.join('\n'));
    // eslint-disable-next-line no-console
    console.log(`studio guide eval: ${passed}/${GUIDE_QUESTIONS.length} → ${file}`);
  });
});
