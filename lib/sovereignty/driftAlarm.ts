/**
 * DRIFT ALARM
 *
 * Structural drift detector for MAIA's sovereignty boundary. Sends throttled
 * Telegram alerts to the practitioner channel when the runtime drifts away
 * from the intended field-architecture posture.
 *
 * Not a surveillance feed. Not a per-cognition log. ONLY structural events
 * that indicate the architecture is failing to hold:
 *
 *   - field_context_unavailable: MAIA_FIELD_CONTEXT_ENABLED=true but the
 *     field-chain returned available:false (vault unreachable, engine init
 *     failed, or retrieval threw)
 *   - vault_unreadable: OBSIDIAN_VAULT_PATH set but path is missing/empty
 *   - silent_fallback: sovereignRouter fell back without explicit member-visible
 *     escalation
 *   - provider_bypass: direct @anthropic-ai/sdk import or call detected at
 *     runtime outside the allowlist (future wire)
 *   - anthropic_outside_escalation: Anthropic invoked outside explicit
 *     escalation policy (future wire)
 *   - ci_guard_failure_summary: pre-commit / CI check rejected new bypasses
 *     (future wire — likely from CI workflow rather than runtime)
 *
 * Discipline:
 *   - throttled per event type (default 15 min cooldown) — drift alarm, not
 *     surveillance feed
 *   - fire-and-forget (never blocks the calling code path)
 *   - graceful degradation if Telegram unavailable (logs locally and returns)
 *   - no member content in payload — only structural metadata
 *   - structured payload: surface, provider, route, mode, escalation_reason,
 *     commit (when available), env (host), timestamp
 *
 * @see docs/orientation/maia-intelligence-architecture-synthesis.md
 * @see docs/orientation/maia-sovereign-runtime-intelligence-audit.md
 */

import { TelegramProvider } from '@/lib/comms/providers/TelegramProvider';

export type DriftEventType =
  | 'field_context_unavailable'
  | 'vault_unreadable'
  | 'silent_fallback'
  | 'provider_bypass'
  | 'anthropic_outside_escalation'
  | 'ci_guard_failure_summary';

export interface DriftEventPayload {
  /** Where in the system the drift was observed (route path, module name, etc.) */
  surface: string;
  /** Optional substrate provider involved (anthropic, local_inference, ollama, etc.) */
  provider?: string;
  /** Optional route or function path */
  route?: string;
  /** Optional inference mode (sovereign, primary, local_only, ...) */
  mode?: string;
  /** Why escalation/fallback was triggered, if applicable */
  escalation_reason?: string;
  /** Optional extra detail string (path, error message, etc.) — NO member content */
  detail?: string;
}

// ── Throttle state (in-process, per event type) ─────────────────────────────
const COOLDOWN_MS = Number(process.env.DRIFT_ALARM_COOLDOWN_MS ?? 15 * 60 * 1000);
const lastSentAt = new Map<DriftEventType, number>();

function shouldSend(type: DriftEventType): boolean {
  const last = lastSentAt.get(type) ?? 0;
  return Date.now() - last >= COOLDOWN_MS;
}

function markSent(type: DriftEventType): void {
  lastSentAt.set(type, Date.now());
}

// ── Message formatting ──────────────────────────────────────────────────────
const EVENT_TITLES: Record<DriftEventType, string> = {
  field_context_unavailable: '⚠️ Field context unavailable (flag enabled)',
  vault_unreadable: '⚠️ Vault path unreadable (flag enabled)',
  silent_fallback: '⚠️ Provider silent fallback',
  provider_bypass: '🚨 Direct provider bypass at runtime',
  anthropic_outside_escalation: '🚨 Anthropic used outside explicit escalation',
  ci_guard_failure_summary: '🚨 CI guard rejected new bypass',
};

function formatMessage(type: DriftEventType, payload: DriftEventPayload): string {
  const lines: string[] = [];
  lines.push(`<b>${EVENT_TITLES[type]}</b>`);
  lines.push('');
  lines.push(`<b>surface:</b> ${escapeHtml(payload.surface)}`);
  if (payload.provider) lines.push(`<b>provider:</b> ${escapeHtml(payload.provider)}`);
  if (payload.route) lines.push(`<b>route:</b> ${escapeHtml(payload.route)}`);
  if (payload.mode) lines.push(`<b>mode:</b> ${escapeHtml(payload.mode)}`);
  if (payload.escalation_reason)
    lines.push(`<b>escalation:</b> ${escapeHtml(payload.escalation_reason)}`);
  if (payload.detail) lines.push(`<b>detail:</b> ${escapeHtml(payload.detail)}`);
  lines.push('');
  lines.push(`<b>host:</b> ${escapeHtml(process.env.MAIA_HOST_ID ?? 'unknown')}`);
  lines.push(`<b>commit:</b> ${escapeHtml(process.env.GIT_COMMIT ?? 'unknown')}`);
  lines.push(`<b>at:</b> ${new Date().toISOString()}`);
  return lines.join('\n');
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// ── Public API ──────────────────────────────────────────────────────────────
/**
 * Emit a structural drift event. Fire-and-forget, throttled per type.
 * Never throws. Never blocks. Silently degrades if Telegram is unavailable.
 */
export function emitDriftEvent(
  type: DriftEventType,
  payload: DriftEventPayload,
): void {
  // Local log always — Telegram is best-effort on top.
  const logLine = JSON.stringify({
    kind: 'drift_alarm',
    type,
    ...payload,
    host: process.env.MAIA_HOST_ID ?? 'unknown',
    commit: process.env.GIT_COMMIT ?? 'unknown',
    at: new Date().toISOString(),
  });
  console.warn(`[DriftAlarm] ${logLine}`);

  if (!shouldSend(type)) return;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.PRACTITIONER_TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    // Credentials not configured — local log is the only signal.
    return;
  }

  markSent(type);

  // Fire and forget. Catch all errors locally; never bubble up.
  (async () => {
    try {
      const provider = new TelegramProvider();
      const result = await provider.send(
        {
          to: chatId,
          bodyText: formatMessage(type, payload),
        } as any,
        { bot_token: botToken },
      );
      if (!result.success) {
        console.warn('[DriftAlarm] Telegram send failed:', result.errorMessage);
      }
    } catch (err) {
      console.warn('[DriftAlarm] Telegram send threw:', err);
    }
  })();
}

/** Test-only: reset throttle map between cases. */
export function _resetDriftAlarmThrottleForTests(): void {
  lastSentAt.clear();
}
