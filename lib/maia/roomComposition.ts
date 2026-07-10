/**
 * Ephemeral-room prompt composition — the shared block the What Now? family of
 * interview routes composes turn prompts through:
 *
 *   /api/now-what/interview
 *   /api/maia/vision-studio/interview
 *
 * Extracted so the two sibling routes cannot drift (the addenda-channel
 * divergence lesson, docs/architecture/ADDENDA_CHANNEL_DIVERGENCE_2026-05-24.md):
 * one composition order, one field resolution, one provenance shape.
 *
 * Constitutional ordering (the same order maiaVoice enforces for guidance) —
 * whenever anything beyond the room's own config is composed, MAIA's
 * constitutional floor is composed above it:
 *
 *   MAIA_RUNTIME_PROMPT   — constitutional floor, FIRST
 *   presence              — member's read-only constitutional-memory addenda
 *   field                 — the practitioner's field, as context never instructions
 *   roomPrompt            — the room's own Field Configuration; carries the
 *                           standing hard limits LAST
 *
 * Everything here is read-only and non-fatal by construction: these rooms
 * persist nothing, and any loader failure degrades to the room's own prompt.
 *
 * Env flags are shared across the family (one kill-switch, one register pin —
 * the vision-studio room is the deployment surface of the same What Now?
 * program, not a separate product):
 *   NOW_WHAT_MAIA_PRESENCE_ENABLED — '1' composes MAIA presence (Stage 1, ADR-013)
 *   NOW_WHAT_FIELD_CONTEXT_ENABLED — kill-switch for field composition (default ON;
 *                                    eligibility originates from the room URL's
 *                                    fieldContext, mirroring the anchors model)
 *   NOW_WHAT_PRACTICE_FIELD_ID     — room-wide DEFAULT field pin, applied only when
 *                                    no fieldContext arrives with the request
 *   NOW_WHAT_CLOUD_REGISTER        — '1' pins the family's voice to Claude
 *                                    (see cloudRegisterPinned)
 */

import { MAIA_RUNTIME_PROMPT } from '@/lib/consciousness/MAIA_RUNTIME_PROMPT';
import { buildMemoryInfluencePlan } from '@/lib/maia/memoryOrchestrator';
import {
  loadRecentDevelopmentalMemories,
  loadRecentThemeSignals,
  loadPriorCrossSessionExchanges,
  loadConversationalRecallPref,
} from '@/lib/maia/memoryLoaders';
import { loadMemberMemoryAtomsForPrompt, formatAtomsForPrompt } from '@/lib/maia/memoryAtomsLoader';
import {
  formatPriorExchangesForPrompt,
  computeLastPriorSessionMinutesAgo,
} from '@/lib/maia/conversationalRecallBlock';
import {
  assembledContext,
  renderAssembledContext,
  type AssembledBlock,
} from '@/lib/maia/context-assembly/contextAssembly';
import {
  getPracticeFieldById,
  getPracticeFieldBySlug,
  formatFieldContextForRoom,
} from '@/lib/practiceField/practiceFieldService';

/**
 * NOW_WHAT_CLOUD_REGISTER=1 pins this room family's voice to Claude regardless
 * of LOCAL_TIER_ENABLED's core→Ollama routing. Scoped to these routes only —
 * the register decision for client-facing field presence at full capability,
 * not a platform-wide routing change. Flag-gated, reversible; the local-first
 * default remains the platform posture.
 */
export function cloudRegisterPinned(): boolean {
  return process.env.NOW_WHAT_CLOUD_REGISTER === '1';
}

/**
 * Field-composition provenance, carried on every turn reply (same discipline as
 * `served`): whether a practitioner's field was in the prompt is answerable
 * from the artifact, not the deploy env. `source` names how the field was
 * selected — 'request' (the room URL's fieldContext) or 'room-default' (the
 * NOW_WHAT_PRACTICE_FIELD_ID deploy pin). No silent composition either way.
 */
export interface RoomFieldProvenance {
  slug: string | null;
  composed: true;
  source: 'request' | 'room-default';
}

export interface ComposedRoomPrompt {
  systemPrompt: string;
  field: RoomFieldProvenance | null;
}

/**
 * Resolve which practitioner field (if any) enters this turn, and render it.
 *
 * Selection rules:
 * - An explicit fieldContext resolves by slug, or composes NOTHING — an
 *   unresolved slug never falls back to a different field than the URL named.
 * - Absent fieldContext, the room-wide env pin (if set) selects the default
 *   field. Its provenance is labeled source:'room-default', never hidden.
 * - Render is formatFieldContextForRoom for BOTH paths: guardrail header,
 *   knowledge stance, the field's corpus in full — depth is the product, and
 *   the slug path must not be a thinner sibling of the pinned path.
 */
async function resolveFieldBlock(
  fieldContext: unknown,
  roomTag: string,
): Promise<{ block: string; provenance: RoomFieldProvenance | null }> {
  if (process.env.NOW_WHAT_FIELD_CONTEXT_ENABLED === '0') return { block: '', provenance: null };
  const slug =
    typeof fieldContext === 'string'
      ? fieldContext.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 64)
      : '';
  try {
    if (slug) {
      const field = await getPracticeFieldBySlug(slug);
      const block = formatFieldContextForRoom(field);
      if (block) {
        console.log(`[${roomTag}/field] composed`, { slug, source: 'request', blockChars: block.length });
        return { block, provenance: { slug, composed: true, source: 'request' } };
      }
      console.warn(`[${roomTag}/field] no field for slug (room continues without field):`, slug);
      return { block: '', provenance: null };
    }
    const roomFieldId = process.env.NOW_WHAT_PRACTICE_FIELD_ID;
    if (roomFieldId) {
      const field = await getPracticeFieldById(roomFieldId);
      const block = formatFieldContextForRoom(field);
      if (block) {
        const defaultSlug = field?.field_slug ?? null;
        console.log(`[${roomTag}/field] composed`, {
          slug: defaultSlug,
          source: 'room-default',
          fieldIdPrefix: roomFieldId.slice(0, 8),
          blockChars: block.length,
        });
        return { block, provenance: { slug: defaultSlug, composed: true, source: 'room-default' } };
      }
    }
  } catch (err) {
    console.warn(`[${roomTag}/field] load failed (non-fatal; room continues without field):`, err);
  }
  return { block: '', provenance: null };
}

/**
 * Assemble the member's read-only presence context: constitutional-memory addenda
 * (developmental influence, member-placed atoms, opt-out-gated cross-session recall).
 * Read-only and non-fatal by construction — the room persists nothing, and any failure
 * degrades silently to the base Field Configuration rather than breaking the encounter.
 * The room holds no server session, so cross-session recall is passed an ephemeral marker
 * id (nothing excluded, nothing written).
 *
 * First embodiment of the Context Assembly interface (lib/maia/context-assembly).
 * Builds named AssembledBlocks from the SHARED loader/orchestrator layer — the same
 * primitives /maia composes — then renders them. Behavior is byte-identical to the
 * prior hand-joined string: same blocks, same order, same '\n\n' separator. The only
 * addition is provenance keys on each block, which never reach the prompt text.
 */
async function assemblePresenceContext(
  memberId: string,
  message: string,
  roomTag: string,
  ephemeralSessionId: string,
): Promise<string> {
  const blocks: AssembledBlock[] = [];
  try {
    const [developmental, themeSignals] = await Promise.all([
      loadRecentDevelopmentalMemories(memberId, 3),
      loadRecentThemeSignals(memberId, 10),
    ]);
    const memoryPlan = buildMemoryInfluencePlan({
      message,
      userId: memberId,
      conversationHistory: [],
      recentDevelopmentalMemories: developmental,
      recentThemeSignals: themeSignals,
      hasMemberLiveContext: false,
      hasRelationshipAnamnesis: false,
    });
    if (memoryPlan.promptBlock) blocks.push({ key: 'memoryInfluence', text: memoryPlan.promptBlock });

    const atoms = await loadMemberMemoryAtomsForPrompt(memberId);
    const atomsBlock = formatAtomsForPrompt(atoms);
    if (atomsBlock) blocks.push({ key: 'atoms', text: atomsBlock });

    const recallEnabled = await loadConversationalRecallPref(memberId);
    const prior = await loadPriorCrossSessionExchanges(memberId, ephemeralSessionId, 6);
    const recall = formatPriorExchangesForPrompt(prior, {
      recallEnabled,
      mode: null,
      currentSessionTurnCount: 0,
      lastPriorSessionMinutesAgo: computeLastPriorSessionMinutesAgo(prior),
    });
    if (recall.block) blocks.push({ key: 'conversational', text: recall.block });

    console.log(`[${roomTag}/presence] assembled`, {
      memberIdPrefix: memberId.slice(0, 8),
      developmental: developmental.length,
      atoms: atoms.length,
      priorExchanges: prior.length,
      blockChars: renderAssembledContext(assembledContext(blocks)).length,
    });
  } catch (err) {
    console.warn(`[${roomTag}/presence] assembly failed (non-fatal; degraded to base):`, err);
  }
  return renderAssembledContext(assembledContext(blocks));
}

/**
 * Compose a live-turn system prompt for an ephemeral What Now?-family room.
 *
 * Turn-only — 'propose' stays a thin JSON extractor (a utility, not an
 * encounter) and must not pass through here. With presence off and no field,
 * the returned systemPrompt is exactly the room's own prompt, unchanged.
 */
export async function composeRoomTurnPrompt(opts: {
  /** The room's own Field Configuration (grammar + standing hard limits). */
  roomPrompt: string;
  memberId: string;
  /** The member's most recent message — steers the memory-influence plan. */
  lastMemberMessage: string;
  /** Raw request value; sanitized here. */
  fieldContext?: unknown;
  /** Log-marker family, e.g. 'NowWhat' | 'VisionStudio'. */
  roomTag: string;
  /** Ephemeral marker id for cross-session recall (nothing excluded, nothing written). */
  ephemeralSessionId: string;
}): Promise<ComposedRoomPrompt> {
  const { roomPrompt, memberId, lastMemberMessage, fieldContext, roomTag, ephemeralSessionId } = opts;
  const presenceEnabled = process.env.NOW_WHAT_MAIA_PRESENCE_ENABLED === '1';

  const { block: fieldBlock, provenance } = await resolveFieldBlock(fieldContext, roomTag);

  if (!presenceEnabled && !fieldBlock) {
    return { systemPrompt: roomPrompt, field: null };
  }

  const presence = presenceEnabled
    ? await assemblePresenceContext(memberId, lastMemberMessage, roomTag, ephemeralSessionId)
    : '';
  const systemPrompt = [MAIA_RUNTIME_PROMPT, presence, fieldBlock, roomPrompt]
    .filter(Boolean)
    .join('\n\n');
  console.log(`[${roomTag}/presence] composed`, {
    systemPromptChars: systemPrompt.length,
    field: provenance?.slug ?? null,
  });
  return { systemPrompt, field: provenance };
}
