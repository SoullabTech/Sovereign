// backend: lib/ai/fieldCapture.ts
//
// Boundary Audit — Step 1: field-package capture at the live model seam.
// Spec: docs/specs/BOUNDARY_AUDIT_PROTOCOL_2026-06-08.md (§1, §8)
//
// Captures the assembled MAIA field (systemPrompt + userInput) plus the provider
// that actually served, so the same field can later be replayed across models
// (Claude ↔ local) to measure which dimensions survive provider substitution.
//
// INVARIANTS (non-negotiable):
//   1. OFF by default. Active only when MAIA_FIELD_CAPTURE=1|true. When off: no-op
//      (a single boolean check — no member-facing behavior change, negligible cost).
//   2. Sanctuary turns are NEVER captured (Invariant #6). Fail-closed, two independent
//      guards: meta.sanctuary, and the sanctuary instruction marker in the prompt.
//   3. Fire-and-forget: capture can never throw into, or delay, the generation path.
//   4. Field content (systemPrompt/userInput) is written ONLY to the gitignored,
//      on-host capture file. Logs carry a redacted summary with no content.
//   5. No new provider. No cloud egress. No member-facing change.

import { promises as fs } from 'fs';
import path from 'path';
import type { TextResult } from './types';

/** Minimal structural shape of a generateText request — avoids importing from
 *  modelService (which imports this module) and any circular dependency. */
interface CaptureRequest {
  systemPrompt: string;
  userInput: string;
  meta?: Record<string, unknown>;
}

// Read live (not cached at load) so an audit capture run can be started/stopped by
// setting the env var, without a process restart, and so the var is the single
// source of truth at call time. Cost when off: one env read + comparison.
function captureEnabled(): boolean {
  return process.env.MAIA_FIELD_CAPTURE === '1' || process.env.MAIA_FIELD_CAPTURE === 'true';
}
function captureDir(): string {
  return process.env.MAIA_FIELD_CAPTURE_DIR || 'artifacts/field-capture';
}

// In-process counters (ephemeral, reset on restart — consistent with the substrate
// monitor's ring buffer). They move ONLY while capture is active: a sanctuary skip
// here is a turn that *would* have been captured but was refused — the runtime proof
// the boundary holds under real traffic.
let _capturedCount = 0;
let _sanctuarySkippedCount = 0;

// Label-only meta keys. Deliberately excludes content-bearing keys
// (memoryContext, memoryBundle, currentUserMessage, etc.) — those are not relabeled
// into the meta block; the field itself already carries the assembled content.
const SAFE_META_KEYS = [
  'fastProcessing',
  'coreProcessing',
  'deepProcessing',
  'comprehensiveProcessing',
  'responseTarget',
  'engine',
  'conversationProfile',
  'inputComplexity',
  'mode',
  'routeId',
  'processingProfile',
  'captureTier',
];

function inferTier(meta?: Record<string, unknown>): string {
  if (!meta) return 'unknown';
  if (typeof meta.captureTier === 'string') return meta.captureTier;
  if (meta.fastProcessing === true) return 'fast';
  if (meta.coreProcessing === true) return 'core';
  if (meta.deepProcessing === true || meta.comprehensiveProcessing === true) return 'deep';
  return 'unknown';
}

function memberPrefix(meta?: Record<string, unknown>): string | null {
  const id = (meta?.userId ?? meta?.memberId ?? meta?.memberIdPrefix) as unknown;
  if (typeof id !== 'string' || id.length === 0) return null;
  return id.slice(0, 8);
}

function isSanctuary(req: CaptureRequest): boolean {
  // Guard 1: explicit flag — the system's own source of truth (maiaService reads
  // `meta?.sanctuary === true`).
  if (req?.meta?.sanctuary === true) return true;
  // Guard 2: prompt marker — defensive belt-and-suspenders if the flag were ever
  // not propagated. Matches the instruction injected for sanctuary turns
  // (lib/sovereign/maiaService.ts).
  if (typeof req?.systemPrompt === 'string' && req.systemPrompt.includes('This is a sanctuary session')) {
    return true;
  }
  return false;
}

/**
 * Capture one field package. Guarded, fire-and-forget. Safe to call on every turn:
 * a complete no-op unless MAIA_FIELD_CAPTURE is set. Never throws.
 */
export function captureFieldPackage(req: CaptureRequest, result: TextResult): void {
  try {
    if (!captureEnabled()) return; // off by default
    if (!req || typeof req.systemPrompt !== 'string') return;
    if (isSanctuary(req)) {
      _sanctuarySkippedCount += 1; // counted, never written — Invariant #6
      return;
    }

    const tier = inferTier(req.meta);
    const safeMeta: Record<string, unknown> = {};
    if (req.meta) {
      for (const k of SAFE_META_KEYS) {
        if (k in req.meta) safeMeta[k] = (req.meta as Record<string, unknown>)[k];
      }
    }

    const provider = result?.provider;
    const record = {
      capturedAt: new Date().toISOString(),
      tier,
      memberIdPrefix: memberPrefix(req.meta),
      sanctuary: false,
      systemPromptChars: req.systemPrompt.length,
      userInputChars: typeof req.userInput === 'string' ? req.userInput.length : 0,
      providerServed: {
        provider: provider?.provider ?? 'unknown',
        model: provider?.model ?? null,
        mode: provider?.mode ?? null, // 'full' (real model) | 'fallback' (template engine)
        claudeTier: provider?.tier ?? null,
        latencyMs: provider?.latencyMs ?? null,
      },
      // The assembled field — the replay payload. File-only; never logged.
      field: {
        systemPrompt: req.systemPrompt,
        userInput: req.userInput,
      },
      meta: safeMeta,
    };

    // Redacted summary to logs — NO field content.
    console.info(
      '[FieldCapture] captured ' +
        JSON.stringify({
          tier,
          provider: record.providerServed.provider,
          model: record.providerServed.model,
          mode: record.providerServed.mode,
          chars: record.systemPromptChars,
          member: record.memberIdPrefix,
          sanctuary: false,
        }),
    );

    // Fire-and-forget append; not awaited, internally guarded.
    _capturedCount += 1;
    void appendRecord(record);
  } catch {
    // Capture must never affect generation.
  }
}

async function appendRecord(record: unknown): Promise<void> {
  try {
    const dir = path.resolve(process.cwd(), captureDir());
    await fs.mkdir(dir, { recursive: true });
    const day = new Date().toISOString().slice(0, 10);
    const file = path.join(dir, `packages-${day}.jsonl`);
    await fs.appendFile(file, JSON.stringify(record) + '\n', 'utf8');
  } catch {
    // Disk errors must not surface into the generation path.
  }
}

// ── Boundary Audit status (read by the substrate monitor) ───────────────────
// Surfaces COUNTS and METADATA only — never field content (systemPrompt/userInput).
// "Capture readiness is not audit evidence. Audit evidence begins only after live
//  packages are replayed and ablated." (BOUNDARY_AUDIT_PROTOCOL §10)

export interface BoundaryAuditStatus {
  hookPresent: boolean;
  captureActive: boolean;
  captureEnv: string;
  packagesCaptured: number;
  capturedThisProcess: number;
  sanctuarySkippedThisProcess: number;
  lastCaptured: { tier: string | null; provider: string | null; at: string | null } | null;
  harness: 'dry-verified' | 'live-run';
  ablation: { run: boolean; summary: string };
  localReplay: 'not-run' | 'partial' | 'complete';
  earnedLocalTiers: string[];
  // Replay-host readiness — what the MONITOR's process can reach at OLLAMA_BASE_URL.
  // A proxy for the replay host only when the live audit runs from the same host.
  localModels: {
    endpoint: string;
    reachable: boolean;
    available: string[];
    replayTargets: { model: string; present: boolean }[];
  };
}

// Which local models the live audit replays through (env-overridable; mirrors the
// harness default). Readiness, not evidence.
const AUDIT_LOCAL_TARGETS = (process.env.MAIA_AUDIT_LOCAL_MODELS || 'qwen2.5:7b,qwen3:32b')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

async function readLocalModels(): Promise<BoundaryAuditStatus['localModels']> {
  const endpoint = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  const base = {
    endpoint,
    reachable: false,
    available: [] as string[],
    replayTargets: AUDIT_LOCAL_TARGETS.map((m) => ({ model: m, present: false })),
  };
  try {
    const res = await fetch(`${endpoint}/api/tags`, { signal: AbortSignal.timeout(1500) });
    if (!res.ok) return base;
    const data = (await res.json()) as { models?: Array<{ name?: string }> };
    const available = (data.models || []).map((m) => m.name).filter((n): n is string => !!n);
    return {
      endpoint,
      reachable: true,
      available,
      replayTargets: AUDIT_LOCAL_TARGETS.map((m) => ({
        model: m,
        present: available.some((a) => a === m || a.startsWith(m)),
      })),
    };
  } catch {
    return base; // unreachable / timeout — honest "unknown" (present:false)
  }
}

export async function readBoundaryAuditStatus(): Promise<BoundaryAuditStatus> {
  const status: BoundaryAuditStatus = {
    hookPresent: true,
    captureActive: captureEnabled(),
    captureEnv: process.env.MAIA_FIELD_CAPTURE || '0',
    packagesCaptured: 0,
    capturedThisProcess: _capturedCount,
    sanctuarySkippedThisProcess: _sanctuarySkippedCount,
    lastCaptured: null,
    harness: 'dry-verified', // the dry run passed; becomes 'live-run' once a LIVE audit exists
    ablation: { run: false, summary: 'not run' },
    localReplay: 'not-run',
    earnedLocalTiers: [], // structurally none — no promotion mechanism, nothing earned until results exist
    localModels: {
      endpoint: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      reachable: false,
      available: [],
      replayTargets: AUDIT_LOCAL_TARGETS.map((m) => ({ model: m, present: false })),
    },
  };

  status.localModels = await readLocalModels();

  try {
    const dir = path.resolve(process.cwd(), captureDir());
    let entries: string[];
    try {
      entries = await fs.readdir(dir);
    } catch {
      return status; // dir absent → honest baseline
    }

    // Persisted package count + last record METADATA (no content).
    const pkgFiles = entries.filter((f) => f.startsWith('packages-') && f.endsWith('.jsonl')).sort();
    let lastLine: string | null = null;
    for (const f of pkgFiles) {
      try {
        const lines = (await fs.readFile(path.join(dir, f), 'utf8')).split('\n').filter(Boolean);
        status.packagesCaptured += lines.length;
        if (lines.length) lastLine = lines[lines.length - 1];
      } catch {
        /* skip unreadable file */
      }
    }
    if (lastLine) {
      try {
        const rec = JSON.parse(lastLine);
        status.lastCaptured = {
          tier: rec.tier ?? null,
          provider: rec.providerServed?.provider ?? null,
          at: rec.capturedAt ?? null,
        };
      } catch {
        /* ignore malformed tail */
      }
    }

    // Latest LIVE audit result (DRY runs do not count as evidence).
    const auditFiles = entries.filter((f) => f.startsWith('audit-') && f.endsWith('.json')).sort();
    for (let i = auditFiles.length - 1; i >= 0; i--) {
      try {
        const data = JSON.parse(await fs.readFile(path.join(dir, auditFiles[i]), 'utf8')) as {
          mode?: string;
          rows?: Array<{ model: string; classification: string }>;
        };
        if (data.mode !== 'LIVE' || !Array.isArray(data.rows) || data.rows.length === 0) continue;
        status.harness = 'live-run';
        const localRows = data.rows.filter((r) => r.model !== 'claude' && !r.model.startsWith('mock-'));
        const tally: Record<string, number> = {};
        for (const r of localRows) tally[r.classification] = (tally[r.classification] || 0) + 1;
        status.ablation = {
          run: true,
          summary: Object.entries(tally).map(([k, v]) => `${k}×${v}`).join(', ') || 'no local rows',
        };
        status.localReplay =
          localRows.length === 0 ? 'not-run' : localRows.some((r) => r.classification === 'inconclusive') ? 'partial' : 'complete';
        break;
      } catch {
        /* try older audit file */
      }
    }
  } catch {
    /* return whatever we have — never throw into the monitor */
  }

  return status;
}

/** Exposed for the self-test only. */
export const __captureInternals = { captureEnabled, captureDir, inferTier, isSanctuary };
