/**
 * Safe JSON parse with one-shot repair — wraps LLM output into validated schema
 *
 * If first parse fails, calls repair function once. If repair also fails, throws.
 */

import type { ZodSchema, ZodError } from 'zod';

interface ParseOptions<T> {
  rawText: string;
  schema: ZodSchema<T>;
  repair: (ctx: { rawText: string; zodError: string }) => Promise<string>;
}

export async function parseDraftJsonWithRepair<T>(
  options: ParseOptions<T>,
): Promise<T> {
  const { rawText, schema, repair } = options;

  // --- First pass: try direct parse ---
  const firstResult = tryParse(rawText, schema);
  if (firstResult.ok) return firstResult.data;

  // --- Repair pass: one retry ---
  const repairedText = await repair({
    rawText,
    zodError: firstResult.error,
  });

  const secondResult = tryParse(repairedText, schema);
  if (secondResult.ok) return secondResult.data;

  throw new Error(
    `Parent update generation failed after repair. Schema errors: ${secondResult.error}`,
  );
}

function tryParse<T>(
  raw: string,
  schema: ZodSchema<T>,
): { ok: true; data: T } | { ok: false; error: string } {
  // Strip markdown code fences if present
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return { ok: false, error: `Invalid JSON: ${raw.slice(0, 200)}` };
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    return { ok: false, error: result.error.message };
  }

  return { ok: true, data: result.data };
}
