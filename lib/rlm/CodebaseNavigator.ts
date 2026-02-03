/**
 * Codebase Navigator - Hardened RLM Loop for Code Exploration
 *
 * Uses a local LLM to iteratively search, read, and understand code.
 * The model decides which tools to call based on the question.
 *
 * Security features:
 * - Strict JSON validation with repair passes
 * - Anti-hallucination guards (can only read paths from tool outputs)
 * - Budget limits (max calls per tool type)
 * - Source tracing (every answer cites files/lines)
 *
 * Pattern:
 * 1. Ask model what action to take given question + context
 * 2. Validate action is well-formed JSON
 * 3. Guard: reject reads of paths not seen in search/list
 * 4. Execute the action (search/read/list)
 * 5. Track allowed paths from tool outputs
 * 6. Repeat until model returns 'answer' action or budget exhausted
 */

import { executeAction, normalizePath } from './tools';
import type {
  RLMConfig,
  RLMContext,
  RLMResult,
  AnyRLMAction,
  AnswerAction,
  SearchAction,
  ReadAction,
  ListAction,
  SourceRef,
  RLMBudget,
  RLMSourceRef,
  RLMUsage,
  RLMTraceStep,
} from './types';

// ============================================================================
// Ollama integration
// ============================================================================

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// Use a faster instruction-following model for RLM loop
const DEFAULT_MODEL = process.env.RLM_MODEL || 'llama3.1:8b-instruct-q8_0';

interface OllamaGenerateParams {
  model?: string;
  prompt: string;
  system?: string;
  options?: {
    temperature?: number;
    num_predict?: number;
  };
}

interface OllamaGenerateResponse {
  response: string;
  done: boolean;
}

async function generateWithOllama(params: OllamaGenerateParams): Promise<OllamaGenerateResponse> {
  const { model = DEFAULT_MODEL, prompt, system, options } = params;

  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt,
      system,
      stream: false,
      options,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.status}`);
  }

  return response.json();
}

// ============================================================================
// JSON validation helpers
// ============================================================================

function safeJsonParse(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    const trimmed = text.trim();
    // Handle markdown code blocks
    const jsonMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    const json = jsonMatch ? jsonMatch[1].trim() : trimmed;
    // Extract JSON object
    const objectMatch = json.match(/\{[\s\S]*\}/);
    if (!objectMatch) {
      return { ok: false, error: 'no_json_object_found' };
    }
    return { ok: true, value: JSON.parse(objectMatch[0]) };
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message ?? 'json_parse_error' };
  }
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

function validateActionShape(a: unknown): a is AnyRLMAction {
  if (!a || typeof a !== 'object') return false;
  const obj = a as Record<string, unknown>;
  if (!isNonEmptyString(obj.type)) return false;

  if (obj.type === 'search') return isNonEmptyString(obj.query);
  if (obj.type === 'list') return isNonEmptyString(obj.glob) || isNonEmptyString(obj.pattern);
  if (obj.type === 'read') return isNonEmptyString(obj.filePath) || isNonEmptyString(obj.path);
  if (obj.type === 'answer') {
    // Support both legacy format and new payload format
    if (obj.payload && typeof obj.payload === 'object') {
      const p = obj.payload as Record<string, unknown>;
      return isNonEmptyString(p.answer) && typeof p.confidence === 'number';
    }
    return isNonEmptyString(obj.answer);
  }
  return false;
}

function normalizeAction(a: unknown): AnyRLMAction {
  const obj = a as Record<string, unknown>;
  // Normalize field names
  if (obj.type === 'read' && obj.path && !obj.filePath) {
    obj.filePath = obj.path;
  }
  if (obj.type === 'list' && obj.pattern && !obj.glob) {
    obj.glob = obj.pattern;
  }
  return obj as unknown as AnyRLMAction;
}

// ============================================================================
// System prompt
// ============================================================================

const DEFAULT_CONFIG: RLMConfig = {
  maxIterations: 8,
  maxContextChars: 24000,
  verbose: false,
  budget: { search: 8, list: 6, read: 12 },
  includeTrace: false,
};

// ============================================================================
// Proof / usage / trace helpers
// ============================================================================

function asLine(n: unknown, fallback: number): number {
  const v = typeof n === 'number' ? n : Number(n);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
}

function buildUsage(cfg: RLMConfig, used: { search: number; read: number; list: number }): RLMUsage {
  const b = cfg.budget ?? { search: 8, read: 12, list: 6 };
  return {
    budgets: { search: b.search, read: b.read, list: b.list },
    used: { search: used.search, read: used.read, list: used.list },
  };
}

function uniqSourceRefs(refs: RLMSourceRef[]): RLMSourceRef[] {
  const seen = new Set<string>();
  const out: RLMSourceRef[] = [];
  for (const r of refs) {
    const key = `${r.path}:${r.startLine}-${r.endLine}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r);
  }
  return out;
}

function sourceRefsFromPayload(sources?: SourceRef[]): RLMSourceRef[] {
  if (!sources || !Array.isArray(sources)) return [];
  const refs: RLMSourceRef[] = [];
  for (const s of sources) {
    // Cast to unknown first for safe property access (SourceRef may have extra fields)
    const rec = s as unknown as Record<string, unknown>;
    const start = asLine(rec.lineStart ?? rec.startLine, 1);
    const end = asLine(rec.lineEnd ?? rec.endLine, start);
    if (!s.path) continue;
    refs.push({
      path: s.path,
      startLine: start,
      endLine: Math.max(start, end),
      excerpt: rec.excerpt as string | undefined,
    });
  }
  return uniqSourceRefs(refs);
}

function sourceRefsFallback(ctx: RLMContext): RLMSourceRef[] {
  const refs: RLMSourceRef[] = [];
  // Prefer read actions with explicit line ranges if available
  for (const h of ctx.history ?? []) {
    const a = h.action;
    if (!a || a.type !== 'read') continue;
    const readAction = a as ReadAction;
    const path = readAction.filePath;
    if (!path) continue;
    const start = asLine(readAction.startLine, 1);
    const end = asLine(readAction.endLine, start);
    refs.push({ path, startLine: start, endLine: Math.max(start, end) });
  }
  // Otherwise fall back to "files read" with a minimal 1..1 range
  for (const p of ctx.filesRead ?? []) {
    refs.push({ path: p, startLine: 1, endLine: 1 });
  }
  return uniqSourceRefs(refs);
}

function buildTrace(cfg: RLMConfig, ctx: RLMContext): RLMTraceStep[] | undefined {
  if (!cfg.includeTrace) return undefined;
  const trace: RLMTraceStep[] = [];
  for (const h of ctx.history ?? []) {
    const a = h.action;
    const r = h.result;
    const ms = asLine((h as Record<string, unknown>).ms ?? r?.metadata?.ms, 0);
    if (!a) continue;

    // Convert failures into explicit deny trace steps when possible
    if (r && r.success === false) {
      const msg = String(r.content ?? '').toLowerCase();
      const reason: 'denylist' | 'path_not_allowed' | 'budget_exceeded' =
        msg.includes('budget') ? 'budget_exceeded'
        : msg.includes('allowed') || msg.includes('path') ? 'path_not_allowed'
        : 'denylist';
      trace.push({ tool: 'deny', reason, detail: String(r.content ?? 'denied'), ms });
      continue;
    }

    if (a.type === 'search') {
      const searchAction = a as SearchAction;
      const hitsRaw = (r?.meta?.matches ?? []) as Array<{ path: string; line: number; preview: string }>;
      const hits = Array.isArray(hitsRaw)
        ? hitsRaw.slice(0, 20).map((m) => ({
            path: String(m.path ?? ''),
            line: asLine(m.line, 1),
            preview: String(m.preview ?? '').slice(0, 240),
          }))
        : [];
      trace.push({ tool: 'search', query: searchAction.query, fileGlob: searchAction.fileGlob, hits, ms });
      continue;
    }

    if (a.type === 'read') {
      const readAction = a as ReadAction;
      trace.push({
        tool: 'read',
        path: readAction.filePath,
        startLine: readAction.startLine,
        endLine: readAction.endLine,
        ms,
      });
      continue;
    }

    if (a.type === 'list') {
      const listAction = a as ListAction;
      const results = Array.isArray(r?.meta?.files) ? (r.meta.files as string[]) : [];
      trace.push({ tool: 'list', glob: listAction.glob, results, ms });
      continue;
    }
  }
  return trace;
}

function finalizeConfidence(raw: number, refs: RLMSourceRef[], warnings: string[]): number {
  if (raw > 0.4 && refs.length === 0) {
    warnings.push('No proof-grade sourceRefs produced; confidence clamped.');
    return 0.35;
  }
  return raw;
}

const RLM_SYSTEM_PROMPT = `
You are a codebase navigation agent.

You MUST respond with exactly ONE JSON object. No prose, no markdown, no code fences.
Valid actions:

1) search:
{"type":"search","query":"...","fileGlob":"optional glob"}

2) list:
{"type":"list","glob":"glob pattern"}

3) read:
{"type":"read","filePath":"exact file path","startLine":optional_number,"endLine":optional_number}

4) answer:
{"type":"answer","answer":"...","confidence":0_to_1,"sources":["path:line",...]}

Hard rules:
- NEVER invent file paths. For "read", filePath MUST be one you have already seen in tool outputs (search/list).
- If you need a path, do "search" or "list" first.
- Prefer fewer steps. If you can answer with current evidence, answer.
- Keep confidence honest. If you have weak evidence, lower confidence.
- Sources should include line numbers when citing specific code: "lib/foo.ts:42"

Respond ONLY with a single JSON action object, no other text.
`.trim();

// ============================================================================
// Prompt building
// ============================================================================

function buildPrompt(
  ctx: RLMContext,
  allowedPaths: Set<string>,
  budget: RLMBudget,
  used: { search: number; list: number; read: number },
  guardMessages: string[]
): string {
  let prompt = `Question: ${ctx.question}\n\n`;

  // Show allowed paths (what model can read)
  if (allowedPaths.size > 0) {
    const pathList = Array.from(allowedPaths).slice(0, 80).join(', ');
    prompt += `Allowed paths for read (${allowedPaths.size} total): ${pathList}\n\n`;
  } else {
    prompt += `No paths discovered yet. Use search or list first.\n\n`;
  }

  // Show budget
  prompt += `Budget remaining: search=${budget.search - used.search}, list=${budget.list - used.list}, read=${budget.read - used.read}\n\n`;

  // Show guard messages
  if (guardMessages.length > 0) {
    prompt += `Guards:\n${guardMessages.join('\n')}\n\n`;
  }

  // Show history
  if (ctx.history.length > 0) {
    prompt += `Previous actions and results:\n\n`;

    for (const { action, result } of ctx.history) {
      prompt += `Action: ${JSON.stringify(action)}\n`;
      prompt += `Result: ${result.content.slice(0, 1500)}`;
      if (result.truncated) prompt += '\n(truncated)';
      prompt += '\n\n';
    }
  }

  prompt += `Based on the above, what is your next action? Respond with JSON only.`;

  return prompt;
}

// ============================================================================
// Main RLM loop
// ============================================================================

export async function navigateCodebase(
  question: string,
  config: Partial<RLMConfig> = {}
): Promise<RLMResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const budget = cfg.budget ?? { search: 8, list: 6, read: 12 };

  const ctx: RLMContext = {
    question,
    history: [],
    filesRead: new Set(),
    searchesPerformed: [],
  };

  // Anti-hallucination: only paths from tool outputs are allowed
  const allowedPaths = new Set<string>();
  const used = { search: 0, list: 0, read: 0 };
  const guardMessages: string[] = [];
  let totalChars = 0;

  for (let i = 0; i < cfg.maxIterations; i++) {
    if (cfg.verbose) {
      console.log(`\n--- Iteration ${i + 1} ---`);
    }

    // Check context limit
    if (totalChars > cfg.maxContextChars) {
      if (cfg.verbose) {
        console.log('Context limit reached, synthesizing answer...');
      }
      break;
    }

    // Build prompt with allowed paths and budget
    const prompt = buildPrompt(ctx, allowedPaths, budget, used, guardMessages);

    // Get action from model
    const response = await generateWithOllama({
      model: cfg.modelId,
      prompt,
      system: RLM_SYSTEM_PROMPT,
      options: {
        temperature: 0.1,
        num_predict: 500,
      },
    });

    // Parse and validate
    let parsed = safeJsonParse(response.response);
    let action: AnyRLMAction | null = null;

    if (parsed.ok && validateActionShape(parsed.value)) {
      action = normalizeAction(parsed.value);
    } else {
      // Repair pass
      if (cfg.verbose) {
        console.log('Invalid action, attempting repair...');
      }

      const errorMsg = parsed.ok === false ? parsed.error : 'schema_invalid';
      const repairPrompt = `
The previous response was invalid. Error: ${errorMsg}.
Return ONE valid JSON action object only. No prose.
`.trim();

      const repair = await generateWithOllama({
        model: cfg.modelId,
        prompt: repairPrompt,
        system: RLM_SYSTEM_PROMPT,
        options: { temperature: 0.0, num_predict: 300 },
      });

      const repaired = safeJsonParse(repair.response);
      if (repaired.ok && validateActionShape(repaired.value)) {
        action = normalizeAction(repaired.value);
      } else {
        if (cfg.verbose) {
          console.log('Repair failed, skipping iteration');
        }
        continue;
      }
    }

    if (!action) continue;

    if (cfg.verbose) {
      console.log('Action:', JSON.stringify(action, null, 2));
    }

    // Handle answer action
    if (action.type === 'answer') {
      const answerAction = action as AnswerAction;
      const warnings: string[] = [];
      const payloadRefs = sourceRefsFromPayload(answerAction.payload?.sources);
      const fallbackRefs = payloadRefs.length ? [] : sourceRefsFallback(ctx);
      const sourceRefs = payloadRefs.length ? payloadRefs : fallbackRefs;
      const rawConfidence = answerAction.payload?.confidence ?? answerAction.confidence ?? 0.5;
      const confidence = finalizeConfidence(rawConfidence, sourceRefs, warnings);

      return {
        answer: answerAction.payload?.answer ?? answerAction.answer,
        confidence,
        sources:
          answerAction.payload?.sources?.map((s: SourceRef) => `${s.path}:${s.lineStart ?? ''}`) ??
          answerAction.sources ??
          [],
        sourceRefs,
        usage: buildUsage(cfg, used),
        trace: buildTrace(cfg, ctx),
        warnings: warnings.length ? warnings : undefined,
        iterations: i + 1,
        totalTokensEst: Math.ceil(totalChars / 4),
      };
    }

    // Budget check
    const actionType = action.type as 'search' | 'list' | 'read';
    if (used[actionType] >= budget[actionType]) {
      guardMessages.push(`[BUDGET] ${actionType} budget exhausted. Use remaining tools or answer.`);
      if (cfg.verbose) {
        console.log(`Budget exhausted for ${actionType}`);
      }
      continue;
    }

    // Anti-hallucination guard for read
    if (action.type === 'read') {
      const readAction = action as ReadAction;
      // Normalize path for consistent comparison (handles ./ prefix, backslashes)
      const path = normalizePath(readAction.filePath);

      if (!allowedPaths.has(path)) {
        guardMessages.push(`[GUARD] Rejected read("${path}") - path not from tools. Use search/list first.`);
        if (cfg.verbose) {
          console.log(`Guard: rejected hallucinated path ${path}`);
        }
        continue;
      }
    }

    // Execute action
    used[actionType]++;
    const result = await executeAction(action as SearchAction | ReadAction | ListAction);

    if (cfg.verbose) {
      console.log('Result:', result.content.slice(0, 200), result.truncated ? '...' : '');
    }

    // Track allowed paths from tool outputs
    if (action.type === 'search' && result.meta?.matches) {
      for (const m of result.meta.matches) {
        allowedPaths.add(m.path);
      }
    }
    if (action.type === 'list' && result.meta?.files) {
      for (const f of result.meta.files) {
        allowedPaths.add(f);
      }
    }
    if (action.type === 'read') {
      ctx.filesRead.add((action as ReadAction).filePath);
    }

    // Update context
    ctx.history.push({ action, result });
    totalChars += result.content.length;

    if (action.type === 'search') {
      ctx.searchesPerformed.push((action as SearchAction).query);
    }

    // Clear guard messages after successful action
    guardMessages.length = 0;
  }

  // Fallback: force answer with current context
  const finalPrompt = buildPrompt(ctx, allowedPaths, budget, used, [
    '[FINAL] You must provide an answer now with your best understanding.',
  ]);

  const finalResponse = await generateWithOllama({
    model: cfg.modelId,
    prompt: finalPrompt,
    system: RLM_SYSTEM_PROMPT,
    options: {
      temperature: 0.1,
      num_predict: 1000,
    },
  });

  const finalParsed = safeJsonParse(finalResponse.response);

  if (finalParsed.ok && validateActionShape(finalParsed.value)) {
    const finalAction = normalizeAction(finalParsed.value);
    if (finalAction.type === 'answer') {
      const answerAction = finalAction as AnswerAction;
      const warnings: string[] = [];
      const payloadRefs = sourceRefsFromPayload(answerAction.payload?.sources);
      const fallbackRefs = payloadRefs.length ? [] : sourceRefsFallback(ctx);
      const sourceRefs = payloadRefs.length ? payloadRefs : fallbackRefs;
      const rawConfidence = answerAction.payload?.confidence ?? answerAction.confidence ?? 0.3;
      const confidence = finalizeConfidence(rawConfidence, sourceRefs, warnings);

      return {
        answer: answerAction.payload?.answer ?? answerAction.answer,
        confidence,
        sources:
          answerAction.payload?.sources?.map((s: SourceRef) => `${s.path}:${s.lineStart ?? ''}`) ??
          answerAction.sources ??
          Array.from(ctx.filesRead),
        sourceRefs,
        usage: buildUsage(cfg, used),
        trace: buildTrace(cfg, ctx),
        warnings: warnings.length ? warnings : undefined,
        iterations: cfg.maxIterations,
        totalTokensEst: Math.ceil(totalChars / 4),
      };
    }
  }

  // Last resort
  const lastResortWarnings: string[] = ['Last resort result (no synthesized answer).'];
  const lastResortSourceRefs = sourceRefsFallback(ctx);
  return {
    answer: `Unable to find a clear answer after ${cfg.maxIterations} iterations. Searched: ${ctx.searchesPerformed.join(', ')}. Read files: ${Array.from(ctx.filesRead).join(', ')}.`,
    confidence: 0.1,
    sources: Array.from(ctx.filesRead),
    sourceRefs: lastResortSourceRefs.length ? lastResortSourceRefs : undefined,
    usage: buildUsage(cfg, used),
    trace: buildTrace(cfg, ctx),
    warnings: lastResortWarnings,
    iterations: cfg.maxIterations,
    totalTokensEst: Math.ceil(totalChars / 4),
  };
}

/**
 * Convenience function for quick queries
 */
export async function askAboutCode(question: string): Promise<string> {
  const result = await navigateCodebase(question, { verbose: false });
  return result.answer;
}
