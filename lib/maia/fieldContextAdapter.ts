/**
 * Field Context Adapter
 *
 * Bridges the conversation route to the vault-backed Spiralogic engine
 * without exposing the engine's stateful progression surface. Provides:
 *
 *   1. Singleton-cached SpiralogicEngine (one initialization per process)
 *   2. Graceful degradation if engine or vault is unavailable
 *   3. A prompt-block formatter for system-prompt injection
 *
 * Architectural placement (per docs/orientation/reconnection-scope.md):
 *
 *   conversation route
 *     → inferSpiralogicCell (classifier — already wired)
 *     → chooseFrameworksForCell (framework selection — already wired)
 *     → getFieldContext (THIS ADAPTER — pre-substrate enrichment)
 *     → prompt assembly with buildFieldContextPromptBlock
 *     → substrate invocation
 *
 * Does NOT call SpiralogicEngine.enterSpiral. That would mutate user
 * spiral state and trip progression gates on every conversation turn.
 * Read-only path only — backed by engine.getFieldContext.
 */

import type { SpiralogicCell } from '@/lib/consciousness/spiralogic-core';
import {
  SpiralogicEngine,
  type FieldContextResult,
} from '@/lib/spiralogic/core/spiralogic-engine';
import { emitDriftEvent } from '@/lib/sovereignty/driftAlarm';

export type { FieldContextResult };

// ── Singleton engine (process-lifetime) ─────────────────────────────────────
let engine: SpiralogicEngine | null = null;
let initFailed = false;
let initPromise: Promise<SpiralogicEngine | null> | null = null;

async function getEngineSingleton(): Promise<SpiralogicEngine | null> {
  if (engine) return engine;
  if (initFailed) return null;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const e = new SpiralogicEngine();
      await e.initialize();
      engine = e;
      console.log('[FieldContextAdapter] Engine initialized');
      return engine;
    } catch (err) {
      console.warn('[FieldContextAdapter] Engine initialization failed:', err);
      initFailed = true;
      return null;
    }
  })();

  return initPromise;
}

// ── Empty context constant (graceful degradation) ───────────────────────────
const EMPTY_CONTEXT: Omit<FieldContextResult, 'element' | 'depth'> = {
  available: false,
  vaultWisdom: null,
  quest: null,
  practices: [],
  integrations: [],
  reflections: [],
};

function emptyFor(element: string): FieldContextResult {
  return { ...EMPTY_CONTEXT, element, depth: 0 };
}

// ── Public API ──────────────────────────────────────────────────────────────

/**
 * Retrieve read-only field context for a member + Spiralogic cell.
 *
 * Singleton-cached: engine init happens once per process. Subsequent calls
 * reuse the same engine instance.
 *
 * Graceful degradation: if the engine or vault is unavailable, returns an
 * empty FieldContextResult with `available: false`. Callers can pass the
 * result through `buildFieldContextPromptBlock` unconditionally — it will
 * emit an empty string when nothing useful is available.
 *
 * Never mutates user spiral state. Suitable for per-turn invocation.
 */
export async function getFieldContext(
  userId: string,
  cell: SpiralogicCell,
): Promise<FieldContextResult> {
  const element = (cell?.element ?? '').toLowerCase();
  if (!element) return emptyFor('');

  const e = await getEngineSingleton();
  if (!e) {
    // Drift alarm: engine could not initialize (flag is presumed enabled
    // because callers gate on MAIA_FIELD_CONTEXT_ENABLED before invoking).
    emitDriftEvent('field_context_unavailable', {
      surface: 'fieldContextAdapter.getEngineSingleton',
      detail: 'engine_init_failed',
    });
    return emptyFor(element);
  }

  try {
    const result = await e.getFieldContext(userId, element);

    // Drift alarm: vault path is configured but returned nothing.
    // Indicates path missing/unreadable, empty mount, or rsync drift.
    if (
      !result.available &&
      typeof process.env.OBSIDIAN_VAULT_PATH === 'string' &&
      process.env.OBSIDIAN_VAULT_PATH.length > 0
    ) {
      emitDriftEvent('vault_unreadable', {
        surface: 'fieldContextAdapter.getFieldContext',
        detail: `OBSIDIAN_VAULT_PATH=${process.env.OBSIDIAN_VAULT_PATH} returned empty wisdom for element=${element}`,
      });
    }

    return result;
  } catch (err) {
    console.warn('[FieldContextAdapter] getFieldContext failed:', err);
    emitDriftEvent('field_context_unavailable', {
      surface: 'fieldContextAdapter.getFieldContext',
      detail: typeof (err as Error)?.message === 'string'
        ? (err as Error).message.slice(0, 200)
        : 'retrieval_threw',
    });
    return emptyFor(element);
  }
}

/**
 * Format a FieldContextResult into a Markdown prompt block suitable for
 * appending to the system prompt before substrate invocation.
 *
 * Returns an empty string when nothing useful is available, so callers can
 * concatenate unconditionally:
 *
 *   systemPrompt += '\n\n' + buildFieldContextPromptBlock(ctx);
 *
 * The block emits whatever the engine returned — spiral quest, practices,
 * integrations, and (if vault retrieval succeeded) vault wisdom. The
 * `available` flag specifically tracks vault wisdom availability; the
 * quest/practices/reflections come from the engine's in-process catalogs
 * and are present even when the vault is empty.
 */
export function buildFieldContextPromptBlock(ctx: FieldContextResult): string {
  if (!ctx.quest && ctx.practices.length === 0 && !ctx.available) {
    return '';
  }

  const lines: string[] = [];
  lines.push(
    `## Field Context (Spiralogic — element: ${ctx.element}, depth: ${ctx.depth})`,
  );

  if (ctx.quest) {
    lines.push('');
    lines.push(`**Spiral Quest:** ${ctx.quest.question}`);
    if (ctx.quest.theme) lines.push(`**Theme:** ${ctx.quest.theme}`);
    if (ctx.quest.focus) lines.push(`**Focus:** ${ctx.quest.focus}`);
  }

  if (ctx.practices.length > 0) {
    lines.push('');
    lines.push(
      `**Available practices at this depth:** ${ctx.practices.join(', ')}`,
    );
  }

  if (ctx.integrations.length > 0) {
    lines.push('');
    lines.push(`**Member integrations attained:** ${ctx.integrations.join(', ')}`);
  }

  if (ctx.available && ctx.vaultWisdom) {
    const vw = ctx.vaultWisdom;
    const segments: string[] = [];
    if (vw.concepts?.length > 0) {
      segments.push(
        `Concepts: ${vw.concepts.slice(0, 3).map((c: any) => c.title).join(', ')}`,
      );
    }
    if (vw.practices?.length > 0) {
      segments.push(
        `Vault practices: ${vw.practices.slice(0, 3).map((p: any) => p.title).join(', ')}`,
      );
    }
    if (vw.frameworks?.length > 0) {
      segments.push(
        `Frameworks: ${vw.frameworks.slice(0, 3).map((f: any) => f.name).join(', ')}`,
      );
    }
    if (segments.length > 0) {
      lines.push('');
      lines.push('**Vault wisdom (from AIN field):**');
      segments.forEach((s) => lines.push(`- ${s}`));
    }
  }

  return lines.join('\n');
}

// ── Test-only: reset the singleton between test cases ───────────────────────
export function _resetSingletonForTests(): void {
  engine = null;
  initFailed = false;
  initPromise = null;
}
