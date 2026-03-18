/**
 * MODEL ROUTER — Hybrid Routing Layer for MAIA Oracle
 *
 * Routes each request to the appropriate model tier based on conversation
 * depth, voice mode, message signals, and infrastructure availability.
 *
 * Tiers:
 *   local  — Ollama qwen2.5:7b (shallow Talk/Note, fast, low-cost)
 *   sonnet — Claude Sonnet 4.5  (most conversations, Care, mid-depth)
 *   opus   — Claude Opus 4.5    (deep/fragile/architectural reasoning)
 *
 * Env flags:
 *   LOCAL_TIER_ENABLED=true    — activate local tier (off by default)
 *   ORACLE_FORCE_CLOUD=true    — disable local in production emergencies
 */

import { ConsciousnessLevel } from './ConsciousnessLevelDetector';

export type Tier = 'local' | 'sonnet' | 'opus';

export interface RouterContext {
  conversationDepth: number;
  voiceMode?: 'Talk' | 'Care' | 'Note';
  messageLength: number;
  hasFragileSignals?: boolean;
  hasUrgencySignals?: boolean;
  isArchitectural?: boolean;
  /** Per-request override (in addition to ORACLE_FORCE_CLOUD env) */
  forceCloud?: boolean;
}

export interface RouterDecision {
  level: ConsciousnessLevel;
  tier: Tier;
  confidence: number;
  reasons: string[];
  fallback: Tier[];
}

const LOCAL_TIER_ENABLED = process.env.LOCAL_TIER_ENABLED === 'true';
const ORACLE_FORCE_CLOUD = process.env.ORACLE_FORCE_CLOUD === 'true';

export function routeRequest(ctx: RouterContext): RouterDecision {
  const {
    conversationDepth,
    voiceMode = 'Talk',
    messageLength,
    hasFragileSignals = false,
    hasUrgencySignals = false,
    isArchitectural = false,
    forceCloud = false,
  } = ctx;

  const reasons: string[] = [];
  let tier: Tier;
  let level: ConsciousnessLevel;

  // ── Hard escalation (always Opus) ──────────────────────────────────────
  if (hasFragileSignals) {
    reasons.push('fragile_signals');
    tier = 'opus';
    level = 5;
  } else if (isArchitectural) {
    reasons.push('architectural_reasoning');
    tier = 'opus';
    level = 5;
  } else if (conversationDepth >= 10) {
    reasons.push('depth_high');
    tier = 'opus';
    level = 5;

  // ── Care mode: minimum Sonnet ───────────────────────────────────────────
  } else if (voiceMode === 'Care') {
    if (hasUrgencySignals) {
      reasons.push('care_urgency');
      tier = 'opus';
      level = 5;
    } else {
      reasons.push('care_mode');
      tier = 'sonnet';
      level = 4;
    }

  // ── Note mode: local only for short, safe transforms ───────────────────
  } else if (voiceMode === 'Note') {
    if (messageLength <= 500 && !hasFragileSignals && !hasUrgencySignals) {
      reasons.push('note_short_safe');
      tier = 'local';
      level = 1;
    } else {
      reasons.push('note_long_or_dense');
      tier = 'sonnet';
      level = 3;
    }

  // ── Talk mode: local for shallow/short exchanges ────────────────────────
  } else if (conversationDepth <= 1 && messageLength <= 300 && !hasUrgencySignals) {
    reasons.push('talk_shallow_short');
    tier = 'local';
    level = 2;

  // ── Talk mode: mid-depth ────────────────────────────────────────────────
  } else if (conversationDepth <= 6) {
    reasons.push('talk_mid_depth');
    tier = 'sonnet';
    level = conversationDepth <= 3 ? 3 : 4;

  // ── Default: deep Talk ──────────────────────────────────────────────────
  } else {
    reasons.push('talk_deep');
    tier = 'opus';
    level = 5;
  }

  // ── Local tier gate ─────────────────────────────────────────────────────
  if (tier === 'local') {
    if (!LOCAL_TIER_ENABLED) {
      reasons.push('local_disabled');
      tier = 'sonnet';
      if ((level as number) < 3) level = 3 as ConsciousnessLevel;
    } else if (ORACLE_FORCE_CLOUD || forceCloud) {
      reasons.push('force_cloud');
      tier = 'sonnet';
      if ((level as number) < 3) level = 3 as ConsciousnessLevel;
    }
  }

  const fallback: Tier[] =
    tier === 'local' ? ['sonnet', 'opus'] :
    tier === 'sonnet' ? ['opus'] :
    [];

  return {
    level,
    tier,
    confidence: computeConfidence(ctx, tier, reasons),
    reasons,
    fallback,
  };
}

function computeConfidence(ctx: RouterContext, tier: Tier, reasons: string[]): number {
  if (reasons.some(r => ['fragile_signals', 'care_urgency', 'force_cloud'].includes(r))) return 1.0;
  if (tier === 'opus' && ctx.conversationDepth >= 10) return 0.95;
  if (tier === 'local' && ctx.conversationDepth <= 1 && ctx.messageLength <= 150) return 0.92;
  if (tier === 'sonnet') return 0.85;
  return 0.75;
}
