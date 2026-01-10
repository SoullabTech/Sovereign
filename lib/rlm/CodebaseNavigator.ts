/**
 * Codebase Navigator - RLM Loop for Code Exploration
 *
 * Uses a local LLM to iteratively search, read, and understand code.
 * The model decides which tools to call based on the question.
 *
 * Pattern:
 * 1. Ask model what action to take given question + context
 * 2. Execute the action (search/read/list)
 * 3. Add result to context
 * 4. Repeat until model returns 'answer' action
 */

import { executeAction } from './tools';
import type {
  RLMConfig,
  RLMContext,
  RLMResult,
  AnyRLMAction,
  AnswerAction,
} from './types';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
// Use a faster instruction-following model for RLM loop (deepseek-r1 is too slow for iteration)
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

/**
 * Direct Ollama generate call for RLM loop
 */
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

const DEFAULT_CONFIG: RLMConfig = {
  maxIterations: 8,
  maxContextChars: 24000,
  verbose: false,
};

const SYSTEM_PROMPT = `You are a code navigation assistant. Given a question about a codebase, you decide what actions to take to find the answer.

Available actions (respond with valid JSON):

1. Search for code:
{"type":"search","query":"what to search for","pattern":"optional regex","fileGlob":"**/*.ts","reasoning":"why"}

2. Read a file:
{"type":"read","filePath":"path/to/file.ts","startLine":1,"endLine":50,"reasoning":"why"}

3. List files:
{"type":"list","glob":"lib/**/*.ts","reasoning":"why"}

4. Provide final answer:
{"type":"answer","answer":"your answer here","confidence":0.9,"sources":["file1.ts","file2.ts"],"reasoning":"why"}

Rules:
- Start by searching for relevant patterns or keywords
- Read files that look relevant based on search results
- Once you have enough context, provide your answer
- Be specific about file paths when reading
- Include line numbers in sources when citing code
- If you can't find the answer after several searches, say so honestly

Respond ONLY with a single JSON action object, no other text.`;

/**
 * Build the prompt for the current iteration
 */
function buildPrompt(ctx: RLMContext): string {
  let prompt = `Question: ${ctx.question}\n\n`;

  if (ctx.history.length > 0) {
    prompt += `Previous actions and results:\n\n`;

    for (const { action, result } of ctx.history) {
      prompt += `Action: ${JSON.stringify(action)}\n`;
      prompt += `Result: ${result.content.slice(0, 2000)}`;
      if (result.truncated) prompt += '\n(truncated)';
      prompt += '\n\n';
    }
  }

  prompt += `Based on the above, what is your next action? Respond with JSON only.`;

  return prompt;
}

/**
 * Parse the model's response into an action
 */
function parseAction(response: string): AnyRLMAction | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let json = response.trim();
    const jsonMatch = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      json = jsonMatch[1].trim();
    }

    // Try to find JSON object
    const objectMatch = json.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      json = objectMatch[0];
    }

    const action = JSON.parse(json);

    // Validate action has required fields
    if (!action.type) {
      console.error('Action missing type:', action);
      return null;
    }

    return action as AnyRLMAction;
  } catch (err) {
    console.error('Failed to parse action:', err, '\nResponse:', response);
    return null;
  }
}

/**
 * Main RLM loop for codebase navigation
 */
export async function navigateCodebase(
  question: string,
  config: Partial<RLMConfig> = {}
): Promise<RLMResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const ctx: RLMContext = {
    question,
    history: [],
    filesRead: new Set(),
    searchesPerformed: [],
  };

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

    // Get next action from model
    const prompt = buildPrompt(ctx);

    const response = await generateWithOllama({
      model: cfg.modelId,
      prompt,
      system: SYSTEM_PROMPT,
      options: {
        temperature: 0.1,
        num_predict: 500,
      },
    });

    const action = parseAction(response.response);

    if (!action) {
      if (cfg.verbose) {
        console.log('Failed to parse action, retrying...');
      }
      continue;
    }

    if (cfg.verbose) {
      console.log('Action:', JSON.stringify(action, null, 2));
    }

    // Handle answer action
    if (action.type === 'answer') {
      const answerAction = action as AnswerAction;
      return {
        answer: answerAction.answer,
        confidence: answerAction.confidence ?? 0.5,
        sources: answerAction.sources ?? [],
        iterations: i + 1,
        totalTokensEst: Math.ceil(totalChars / 4),
      };
    }

    // Execute tool action
    const result = await executeAction(action);

    if (cfg.verbose) {
      console.log(
        'Result:',
        result.content.slice(0, 200),
        result.truncated ? '...' : ''
      );
    }

    // Update context
    ctx.history.push({ action, result });
    totalChars += result.content.length;

    if (action.type === 'read') {
      ctx.filesRead.add(action.filePath);
    } else if (action.type === 'search') {
      ctx.searchesPerformed.push(action.query);
    }
  }

  // Fallback: ask model to synthesize from collected context
  const finalPrompt = buildPrompt(ctx) + '\n\nYou must provide an answer now.';

  const finalResponse = await generateWithOllama({
    model: cfg.modelId,
    prompt: finalPrompt,
    system: SYSTEM_PROMPT,
    options: {
      temperature: 0.1,
      num_predict: 1000,
    },
  });

  const finalAction = parseAction(finalResponse.response);

  if (finalAction?.type === 'answer') {
    const answerAction = finalAction as AnswerAction;
    return {
      answer: answerAction.answer,
      confidence: answerAction.confidence ?? 0.3,
      sources: answerAction.sources ?? Array.from(ctx.filesRead),
      iterations: cfg.maxIterations,
      totalTokensEst: Math.ceil(totalChars / 4),
    };
  }

  // Last resort
  return {
    answer: `Unable to find a clear answer after ${cfg.maxIterations} iterations. Searched: ${ctx.searchesPerformed.join(', ')}. Read files: ${Array.from(ctx.filesRead).join(', ')}.`,
    confidence: 0.1,
    sources: Array.from(ctx.filesRead),
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
