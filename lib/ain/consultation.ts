/**
 * AIN v2 Consultation Interface
 *
 * Allows MAIA to consult councils when she chooses.
 * "Capability, not choreography" — MAIA decides when to consult.
 *
 * Key principle: Councils write to MAIA, never directly to member.
 */

import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import matter from 'gray-matter';
import type {
  Council,
  ConsultationRequest,
  ConsultationResult,
  Framing,
  FramingIndexEntry,
  FramingResponse,
  EmergenceRating,
} from './types';
import { MultiLLMProvider } from '@/lib/consciousness/LLMProvider';
import {
  isSinkhornEnabled,
  sinkhornNormalize,
  buildBaseScoreMatrix,
  aggregateFramingWeights,
} from './utils/sinkhorn';

// Path to framing library
const FRAMINGS_PATH = join(process.cwd(), 'lib/ain/framings');
const SYNTHESIS_PATH = join(process.cwd(), 'lib/ain/synthesis');

/**
 * Load the framing index (what MAIA always sees)
 */
export async function loadFramingIndex(): Promise<FramingIndexEntry[]> {
  const indexPath = join(FRAMINGS_PATH, '_index.md');
  const content = await readFile(indexPath, 'utf-8');

  // Parse the index markdown into structured entries
  const entries: FramingIndexEntry[] = [];
  const lines = content.split('\n');

  let currentDomain = 'foundational';
  const domainMap: Record<string, string> = {
    'Foundational': 'foundational',
    'Human-Centered': 'human',
    'Strategic': 'strategic',
    'Theoretical': 'theoretical',
    'Domain-Specific': 'domain',
  };

  for (const line of lines) {
    // Detect domain headers
    for (const [header, domain] of Object.entries(domainMap)) {
      if (line.startsWith(`## ${header}`)) {
        currentDomain = domain;
      }
    }

    // Parse framing entries (format: - **id** — description)
    const match = line.match(/^- \*\*([a-z-]+)\*\* — (.+)$/);
    if (match) {
      entries.push({
        id: match[1],
        name: match[1].split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        domain: currentDomain as any,
        description: match[2],
      });
    }
  }

  return entries;
}

/**
 * Load a specific framing by ID
 */
export async function loadFraming(id: string): Promise<Framing | null> {
  // Search in all subdirectories
  const domains = ['foundational', 'human', 'strategic', 'theoretical', 'domain'];

  for (const domain of domains) {
    const path = join(FRAMINGS_PATH, domain, `${id}.md`);
    try {
      const content = await readFile(path, 'utf-8');
      const { data, content: body } = matter(content);

      return {
        id,
        name: data.name || id,
        domain: data.domain || domain,
        tensionPairs: data.tension_pairs,
        requiresContext: data.requires_context,
        content: body,
        path,
      };
    } catch {
      // Not in this domain, continue
    }
  }

  return null;
}

/**
 * Select framings for deliberation
 *
 * This is where "capability, not choreography" happens.
 * We give MAIA the index and let her/the selection model choose.
 */
export async function selectFramings(
  question: string,
  index: FramingIndexEntry[],
  constraints?: ConsultationRequest['constraints']
): Promise<string[]> {
  const llmProvider = new MultiLLMProvider();

  const maxFramings = constraints?.maxFramings ?? 5;
  const exclude = new Set(constraints?.excludeFramings ?? []);
  const require = constraints?.requireFramings ?? [];
  const preferDomains = constraints?.preferDomains ?? [];

  // Filter available framings
  let available = index.filter(f => !exclude.has(f.id));

  // Build selection prompt
  const indexText = available.map(f =>
    `- **${f.id}** (${f.domain}): ${f.description}`
  ).join('\n');

  const domainHint = preferDomains.length > 0
    ? `\nPreferred domains: ${preferDomains.join(', ')}`
    : '';

  const requireHint = require.length > 0
    ? `\nMust include: ${require.join(', ')}`
    : '';

  const selectionPrompt = `Given this question for committee deliberation:

"${question}"

Available framings:
${indexText}
${domainHint}
${requireHint}

Select ${maxFramings} framings that would create the most generative tension.
Choose based on what perspectives would genuinely illuminate this question,
not by keyword matching.

Trust your discernment. There is no "correct" set.
If uncertain, prefer fewer perspectives explored deeply.
You may select framings that seem unusual if you sense they would reveal something hidden.

Return ONLY a JSON array of framing IDs. Example:
["first-principles", "kauffman-emergence", "user-experience"]`;

  try {
    const response = await llmProvider.generate({
      systemPrompt: 'You are selecting framings for a multi-perspective deliberation. Return only valid JSON.',
      userInput: selectionPrompt,
      level: 3, // Use mid-tier for selection (cheap, fast)
    });

    // Parse response - expect JSON array
    const text = response.text.trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const selected = JSON.parse(jsonMatch[0]) as string[];
      // Ensure required framings are included
      const final = [...new Set([...require, ...selected])].slice(0, maxFramings);
      return final;
    }
  } catch (err) {
    console.error('[AIN] Framing selection failed:', err);
  }

  // Fallback: return required + first few from preferred domains or foundational
  const fallback = [
    ...require,
    ...available
      .filter(f => preferDomains.length === 0 || preferDomains.includes(f.domain))
      .slice(0, maxFramings - require.length)
      .map(f => f.id)
  ];

  return fallback.slice(0, maxFramings);
}

/**
 * Run deliberation with selected framings
 */
export async function deliberate(
  question: string,
  framings: Framing[]
): Promise<FramingResponse[]> {
  const llmProvider = new MultiLLMProvider();
  const responses: FramingResponse[] = [];

  // Run framings in parallel
  const promises = framings.map(async (framing) => {
    const systemPrompt = `You are participating in a multi-perspective committee deliberation.

Your specific lens: ${framing.name}

${framing.content}

Respond to the question ONLY from this perspective. Be concise but insightful.
Your response should be 2-4 paragraphs maximum.

Do not try to synthesize other perspectives—that's the orchestrator's job.
Focus deeply on your assigned lens.`;

    try {
      const response = await llmProvider.generate({
        systemPrompt,
        userInput: question,
        level: 4, // Use higher tier for quality responses
      });

      return {
        framingId: framing.id,
        framingName: framing.name,
        response: response.text.trim(),
      };
    } catch (err) {
      console.error(`[AIN] Framing ${framing.id} failed:`, err);
      return {
        framingId: framing.id,
        framingName: framing.name,
        response: `[Error generating response from ${framing.name}]`,
      };
    }
  });

  const results = await Promise.all(promises);
  return results;
}

/**
 * Synthesize framing responses into insights
 */
export async function synthesize(
  question: string,
  responses: FramingResponse[]
): Promise<{
  insights: string[];
  tensions: string[];
  risks: string[];
  recommendation: string;
  emergenceRating: EmergenceRating;
}> {
  const llmProvider = new MultiLLMProvider();

  // Load synthesis prompt
  let synthesisPrompt = '';
  try {
    synthesisPrompt = await readFile(join(SYNTHESIS_PATH, 'dialectical.md'), 'utf-8');
  } catch {
    synthesisPrompt = 'Generate a dialectical synthesis of the following perspectives.';
  }

  // Build response text
  const responsesText = responses.map(r =>
    `## ${r.framingName}\n\n${r.response}`
  ).join('\n\n---\n\n');

  const prompt = `${synthesisPrompt}

---

ORIGINAL QUESTION:
${question}

FRAMING RESPONSES:
${responsesText}

---

Generate your synthesis. Follow the output format exactly.`;

  try {
    const response = await llmProvider.generate({
      systemPrompt: 'You are a dialectical synthesis engine. Generate structured insight from multiple perspectives.',
      userInput: prompt,
      level: 5, // Use highest tier for synthesis quality
    });

    // Parse synthesis response
    const text = response.text;

    // Extract sections
    const insights = extractSection(text, 'Synthesis')
      .split('\n')
      .filter(l => l.trim())
      .slice(0, 5);

    const tensions = extractBulletPoints(text, 'Key Tensions');
    const risks = extractBulletPoints(text, 'Risks') || [];

    const recommendation = extractSection(text, 'Recommended Action')
      || 'Further exploration needed.';

    // Determine emergence rating
    let emergenceRating: EmergenceRating = 'recombination';
    if (text.includes('⭐⭐⭐') || text.toLowerCase().includes('breakthrough')) {
      emergenceRating = 'breakthrough';
    } else if (text.includes('⭐⭐') || text.toLowerCase().includes('synthesis')) {
      emergenceRating = 'synthesis';
    }

    return {
      insights,
      tensions,
      risks,
      recommendation,
      emergenceRating,
    };
  } catch (err) {
    console.error('[AIN] Synthesis failed:', err);
    return {
      insights: ['Synthesis generation failed'],
      tensions: [],
      risks: ['Unable to complete analysis'],
      recommendation: 'Manual review needed',
      emergenceRating: 'recombination',
    };
  }
}

/**
 * Main consultation function
 *
 * MAIA calls this when she wants council input.
 * Returns insights she can use—or ignore—as she sees fit.
 */
export async function consult(
  request: ConsultationRequest
): Promise<ConsultationResult> {
  console.log(`[AIN] Consultation requested: ${request.council} for "${request.question.slice(0, 50)}..."`);

  // 1. Load framing index
  const index = await loadFramingIndex();

  // 2. Select framings (by discernment, not rules)
  const selectedIds = await selectFramings(
    request.question,
    index,
    request.constraints
  );

  console.log(`[AIN] Selected framings: ${selectedIds.join(', ')}`);

  // 3. Load full framings
  const framings = (await Promise.all(
    selectedIds.map(id => loadFraming(id))
  )).filter((f): f is Framing => f !== null);

  // 4. Run deliberation
  const responses = await deliberate(request.question, framings);

  // 4.5. Apply Sinkhorn normalization (if enabled)
  // This balances framing weights so no single perspective dominates synthesis
  let framingWeights: number[] | undefined;

  if (isSinkhornEnabled() && responses.length > 1) {
    const scoreMatrix = buildBaseScoreMatrix(responses);
    const sinkhornResult = sinkhornNormalize(scoreMatrix);
    framingWeights = aggregateFramingWeights(sinkhornResult.weights);

    // Debug logging when AIN_DEBUG=1
    if (process.env.AIN_DEBUG === '1') {
      console.log('[AIN:Sinkhorn] Normalization applied');
      console.log('[AIN:Sinkhorn] Iterations:', sinkhornResult.iterations);
      console.log('[AIN:Sinkhorn] Converged:', sinkhornResult.converged);
      console.log('[AIN:Sinkhorn] Entropy before:', sinkhornResult.diagnostics.entropyBefore.toFixed(3));
      console.log('[AIN:Sinkhorn] Entropy after:', sinkhornResult.diagnostics.entropyAfter.toFixed(3));
      console.log('[AIN:Sinkhorn] Max weight before:', sinkhornResult.diagnostics.maxWeightBefore.toFixed(3));
      console.log('[AIN:Sinkhorn] Max weight after:', sinkhornResult.diagnostics.maxWeightAfter.toFixed(3));
      console.log('[AIN:Sinkhorn] Framing weights:', responses.map((r, i) => ({
        framing: r.framingId,
        weight: framingWeights![i].toFixed(3),
      })));
    }
  }

  // 5. Synthesize
  const synthesis = await synthesize(request.question, responses);

  // 6. Build result
  const result: ConsultationResult = {
    insights: synthesis.insights,
    tensions: synthesis.tensions,
    risks: synthesis.risks,
    recommendation: synthesis.recommendation,
    framingsUsed: framings.map(f => f.id),
    confidence: framings.length >= 3 ? 0.8 : 0.6,
    emergenceRating: synthesis.emergenceRating,
    rawResponses: Object.fromEntries(
      responses.map(r => [r.framingId, r.response])
    ),
    // Include Sinkhorn weights when enabled (for visibility/future weighted synthesis)
    ...(framingWeights && {
      framingWeights: Object.fromEntries(
        responses.map((r, i) => [r.framingId, framingWeights![i]])
      ),
    }),
  };

  console.log(`[AIN] Consultation complete: ${result.insights.length} insights, ${result.tensions.length} tensions`);

  return result;
}

// Helper functions

function extractSection(text: string, header: string): string {
  const regex = new RegExp(`###?\\s*${header}[\\s\\S]*?(?=###|$)`, 'i');
  const match = text.match(regex);
  if (!match) return '';

  return match[0]
    .replace(new RegExp(`###?\\s*${header}`, 'i'), '')
    .trim();
}

function extractBulletPoints(text: string, header: string): string[] {
  const section = extractSection(text, header);
  return section
    .split('\n')
    .filter(l => l.trim().startsWith('-') || l.trim().startsWith('*'))
    .map(l => l.replace(/^[-*]\s*\*?\*?/, '').replace(/\*?\*?$/, '').trim())
    .filter(l => l.length > 0);
}
